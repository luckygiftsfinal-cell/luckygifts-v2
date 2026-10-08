// netlify/functions/admin-wallets.js
// Admin-only: list / add / enable-disable / delete receiving wallets.
// GET  → { wallets: [...] }
// POST → { action: "add" | "toggle" | "delete", ... }
const crypto = require("crypto");
const {
  json, getSupabase, requireAdmin, ASSETS, isValidAddress, readWalletList, saveWalletList,
} = require("./_shared/common");

const sameAddress = (asset, a, b) => (asset === "USDC_POLYGON" ? a.toLowerCase() === b.toLowerCase() : a === b);

// Number of open (unpaid) orders that were assigned each address — shown so admins know before disabling/deleting.
async function openOrdersByAddress(supabase) {
  const counts = {};
  const { data } = await supabase
    .from("orders")
    .select("payment_details")
    .eq("payment_method", "crypto")
    .eq("status", "pending_verification")
    .limit(1000);
  for (const o of data || []) {
    const w = o.payment_details?.wallets;
    for (const addr of [w?.usdt, w?.usdc]) if (addr) counts[addr.toLowerCase()] = (counts[addr.toLowerCase()] || 0) + 1;
  }
  return counts;
}

const withCounts = (list, counts) => list.map((w) => ({ ...w, open_orders: counts[w.address.toLowerCase()] || 0 }));

exports.handler = async (event) => {
  const supabase = getSupabase();
  if (!supabase) return json(500, { error: "Server not configured" });

  const { user, isAdmin } = await requireAdmin(supabase, event);
  if (!user) return json(401, { error: "Not authenticated" });
  if (!isAdmin) return json(403, { error: "Admins only" });

  let list = await readWalletList(supabase);

  if (event.httpMethod === "GET") {
    return json(200, { wallets: withCounts(list, await openOrdersByAddress(supabase)) });
  }
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  const activeCount = (asset, exceptId) => list.filter((w) => w.asset === asset && w.active && w.id !== exceptId).length;

  if (body.action === "add") {
    const asset = body.asset;
    const address = String(body.address || "").trim();
    const label = String(body.label || "").trim().slice(0, 40) || ASSETS[asset]?.name;

    if (!ASSETS[asset]) return json(400, { error: "Unsupported asset" });
    if (!isValidAddress(asset, address)) {
      return json(400, {
        error: asset === "USDT_TRC20" ? "Invalid TRON (TRC20) address" : "Invalid Polygon address (must be 0x + 40 hex characters)",
      });
    }
    if (list.some((w) => w.asset === asset && sameAddress(asset, w.address, address))) {
      return json(409, { error: "This wallet already exists" });
    }
    list = [...list, { id: crypto.randomUUID(), asset, address, label, active: true, created_at: new Date().toISOString() }];
  } else if (body.action === "toggle") {
    const w = list.find((x) => x.id === body.id);
    if (!w) return json(404, { error: "Wallet not found" });
    const active = !!body.active;
    if (!active && w.active && activeCount(w.asset, w.id) === 0) {
      return json(400, { error: `You need at least one active ${ASSETS[w.asset]?.name || w.asset} wallet` });
    }
    list = list.map((x) => (x.id === w.id ? { ...x, active } : x));
  } else if (body.action === "delete") {
    const w = list.find((x) => x.id === body.id);
    if (!w) return json(404, { error: "Wallet not found" });
    if (w.active && activeCount(w.asset, w.id) === 0) {
      return json(400, { error: `You can't delete the last active ${ASSETS[w.asset]?.name || w.asset} wallet. Add another one first.` });
    }
    list = list.filter((x) => x.id !== w.id);
  } else {
    return json(400, { error: "Unknown action" });
  }

  if (!(await saveWalletList(supabase, list))) return json(500, { error: "Could not save wallets" });
  console.log(`admin-wallets: ${body.action} by ${user.id}`);
  return json(200, { wallets: withCounts(list, await openOrdersByAddress(supabase)) });
};
