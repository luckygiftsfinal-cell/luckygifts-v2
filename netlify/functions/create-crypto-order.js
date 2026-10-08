// netlify/functions/create-crypto-order.js
// Creates the order SERVER-SIDE (prices, tickets and promo come from the database, never from the browser)
// and assigns a unique payable amount (base total + 0.001..0.099 "tag") so every open order can be matched
// to exactly one on-chain transfer into the shared wallet.
//
// Supports two kinds of cart items:
//   - normal products  → id is the products.id
//   - VIP packages     → id is "vip_" + vip_packages.id   (prefix avoids id collisions between the two tables)
const { json, getSupabase, authUser, pickWallets } = require("./_shared/common");

const MIN_ORDER_USD = 5;
const EXPIRY_HOURS = 24;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VIP_PREFIX = "vip_";
const VIP_TABLE = "vip_packages"; // ⚠️ change if your table has a different name
const VIP_IMAGE = "/images/prize_luxury.png";

const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const supabase = getSupabase();
  if (!supabase) return json(500, { error: "Server not configured" });

  const user = await authUser(supabase, event);
  if (!user) return json(401, { error: "Not authenticated" });

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  // ── Validate input ─────────────────────────────────────────
  const { items, promoCode, customer = {}, referrerId } = body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return json(400, { error: "Cart is empty" });

  const qtyById = new Map();
  for (const it of items) {
    const qty = Number(it?.quantity);
    const id = it?.id === undefined || it?.id === null ? "" : String(it.id).trim();
    if (!id || id.length > 100 || !Number.isInteger(qty) || qty < 1 || qty > 100) {
      return json(400, { error: "Invalid cart item" });
    }
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }

  const name = String(customer.name || "").trim();
  const email = String(customer.email || "").trim();
  const address = String(customer.address || "").trim();
  const phone = String(customer.phone || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (!name || !EMAIL_RE.test(email)) return json(400, { error: "Missing or invalid customer details" });
  if (!/^\+?[0-9\s\-()]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return json(400, { error: "Invalid phone number" });
  }

  // ── Split cart into products and VIP packages ──────────────
  const productIds = [];
  const vipIds = [];
  for (const id of qtyById.keys()) {
    if (id.startsWith(VIP_PREFIX)) {
      const rawId = id.slice(VIP_PREFIX.length);
      if (!rawId) return json(400, { error: "Invalid cart item" });
      vipIds.push(rawId);
    } else {
      productIds.push(id);
    }
  }

  // ── Price everything from the database ─────────────────────
  let products = [];
  if (productIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, tickets, main_image")
      .in("id", productIds);
    if (error) return json(500, { error: "Could not load products" });
    products = data || [];
    if (products.length !== productIds.length) {
      return json(400, { error: "Some products in your cart are no longer available" });
    }
  }

  let vipPackages = [];
  if (vipIds.length > 0) {
    const { data, error } = await supabase
      .from(VIP_TABLE)
      .select("id, name, price, tickets_count, event_label")
      .in("id", vipIds);
    if (error) {
      console.error("VIP packages load error:", error);
      return json(500, { error: "Could not load VIP packages" });
    }
    vipPackages = data || [];
    if (vipPackages.length !== vipIds.length) {
      return json(400, { error: "Some VIP packages in your cart are no longer available" });
    }
  }

  let subtotalCents = 0;
  let ticketsEarned = 0;
  const orderItems = [];

  for (const p of products) {
    const qty = qtyById.get(String(p.id));
    const priceCents = Math.round(Number(p.price) * 100);
    const tickets = parseInt(p.tickets, 10) || 0;
    subtotalCents += priceCents * qty;
    ticketsEarned += tickets * qty;
    orderItems.push({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      quantity: qty,
      tickets,
      mainImage: p.main_image || null,
    });
  }

  for (const v of vipPackages) {
    const qty = qtyById.get(VIP_PREFIX + String(v.id));
    const priceCents = Math.round(Number(v.price) * 100);
    const tickets = parseInt(v.tickets_count, 10) || 0;
    subtotalCents += priceCents * qty;
    ticketsEarned += tickets * qty;
    orderItems.push({
      id: VIP_PREFIX + String(v.id),
      type: "vip",
      title: v.name,
      price: Number(v.price),
      quantity: qty,
      tickets,
      eventLabel: v.event_label || null,
      mainImage: VIP_IMAGE,
    });
  }

  if (subtotalCents < MIN_ORDER_USD * 100) {
    return json(400, { error: `Minimum order amount is $${MIN_ORDER_USD}` });
  }

  // ── Promo code (validated server-side) ─────────────────────
  let discountCents = 0;
  let appliedPromo = null;
  if (promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("code, discount_percent, current_uses, max_uses")
      .eq("code", String(promoCode).toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();
    if (!promo || promo.current_uses >= promo.max_uses) return json(400, { error: "Invalid promo code" });
    discountCents = Math.round((subtotalCents * Number(promo.discount_percent)) / 100);
    appliedPromo = promo.code;
  }

  const totalCents = subtotalCents - discountCents;
  if (totalCents <= 0) return json(400, { error: "Invalid order total" });

  // ── Expire stale open orders so their amount tags are freed ─
  const cutoff = new Date(Date.now() - EXPIRY_HOURS * 3600 * 1000).toISOString();
  await supabase
    .from("orders")
    .update({ status: "expired" })
    .eq("payment_method", "crypto")
    .eq("status", "pending_verification")
    .lt("created_at", cutoff);

  // ── Choose the receiving wallets (from the admin-managed list) and pin them to this order ──
  const wallets = await pickWallets(supabase);
  if (!wallets) return json(503, { error: "Crypto payments are temporarily unavailable" });

  // ── Insert order with a unique amount tag ──────────────────
  // Unique partial index on payment_details->>'expected_amount' (see supabase/crypto-direct.sql)
  // guarantees no two open orders share the same payable amount.
  const tags = Array.from({ length: 99 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  let order = null;
  let expectedAmount = null;

  for (const tag of tags) {
    const expectedMilli = totalCents * 10 + tag; // thousandths of a dollar
    expectedAmount = (expectedMilli / 1000).toFixed(3);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        full_name: name,
        email,
        phone,
        address,
        total_amount: totalCents / 100,
        discount_amount: discountCents / 100,
        payment_method: "crypto",
        status: "pending_verification",
        items: orderItems,
        tickets_earned: ticketsEarned,
        referrer_id: referrerId && UUID_RE.test(String(referrerId)) ? referrerId : null,
        payment_details: { expected_amount: expectedAmount, promo_code: appliedPromo, wallets },
      })
      .select()
      .single();

    if (!error && data) {
      order = data;
      break;
    }
    if (error?.code !== "23505") {
      console.error("Order insert error:", error);
      return json(500, { error: "Could not create order" });
    }
    // 23505 = amount tag already used by another open order → try next tag
  }

  if (!order) return json(503, { error: "Too many open payments right now, please try again in a few minutes" });

  return json(200, {
    orderId: order.id,
    expectedAmount, // e.g. "35.037" — the customer must send EXACTLY this
    baseAmount: (totalCents / 100).toFixed(2),
    discount: (discountCents / 100).toFixed(2),
    wallets,
    expiresAt: new Date(new Date(order.created_at).getTime() + EXPIRY_HOURS * 3600 * 1000).toISOString(),
  });
};

// Safety wrapper: any uncaught crash is returned as JSON (instead of a 502 HTML page)
// so the real error is visible in the browser's Network tab and in Netlify function logs.
exports.handler = async (event) => {
  try {
    return await handler(event);
  } catch (err) {
    console.error("create-crypto-order crash:", err);
    return json(500, { error: "Server error", detail: String((err && err.message) || err) });
  }
};
