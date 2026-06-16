const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ── 1. Verify webhook signature ──────────────────────────────
  const secret = process.env.CHAIN2PAY_WEBHOOK_SECRET;
  if (secret) {
    const signature = event.headers["x-chain2pay-signature"] || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(event.rawUrl + event.body)
      .digest("hex");

    if (signature !== expected) {
      console.error("Invalid webhook signature");
      return { statusCode: 401, body: "Unauthorized" };
    }
  } else {
    // No secret configured yet -> requests are NOT verified.
    console.warn("CHAIN2PAY_WEBHOOK_SECRET is not set. Webhook signature is NOT being verified.");
  }

  // ── 2. Parse payload ─────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  console.log("Chain2pay webhook:", JSON.stringify(payload));

  // Only process completed payments
  if (payload.status !== "completed" && payload.status !== "paid") {
    return { statusCode: 200, body: "Ignored" };
  }

  const { amount, metadata, customer } = payload;
  const packageName = metadata?.package || "Unknown Package";
  const packageId   = metadata?.packageId || null;
  const email       = metadata?.customer_email || customer?.email || null;
  const fullName    = metadata?.customer_name  || customer?.name  || "Customer";

  // ── 3. Try to find the pending order created at checkout ──────
  // CheckoutPage.tsx now creates a 'pending' order in Supabase BEFORE
  // redirecting to Chain2pay, and sends that order's id as packageId.
  let pendingOrder = null;
  if (packageId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", packageId)
      .single();

    if (!error && data) {
      pendingOrder = data;
    }
  }

  if (pendingOrder) {
    // ── Idempotency: webhook may be retried by Chain2pay ─────────
    if (pendingOrder.status === "paid") {
      console.log(`Order ${pendingOrder.id} already marked paid, skipping`);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, orderId: pendingOrder.id, alreadyProcessed: true }),
      };
    }

    const ticketsEarned = pendingOrder.tickets_earned || 1;
    const ticketNumbers = Array.from({ length: ticketsEarned }, () =>
      `LG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    );

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_details: {
          ...(pendingOrder.payment_details || {}),
          provider:       "chain2pay",
          transaction_id: payload.id || payload.payment_id,
          ticket_numbers: ticketNumbers,
        },
      })
      .eq("id", pendingOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      return { statusCode: 500, body: "Failed to update order" };
    }

    await sendConfirmationEmail({
      email:        pendingOrder.email || email,
      fullName:     pendingOrder.full_name || fullName,
      packageName,
      ticketNumbers,
      ticketsEarned,
      amount:       pendingOrder.total_amount ?? amount,
      orderId:      updatedOrder.id,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, orderId: updatedOrder.id }) };
  }

  // ── 4. Fallback: no matching pending order found ───────────────
  // (kept for older/alternate call sites where packageId is a product id
  // rather than an order id)
  let product = null;
  if (packageId) {
    const { data } = await supabase
      .from("products")
      .select("id, title, tickets, prize, main_image")
      .eq("id", packageId)
      .single();
    product = data;
  }

  const ticketsEarned = product?.tickets || 1;
  const ticketNumbers = Array.from({ length: ticketsEarned }, () =>
    `LG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      full_name:      fullName,
      email:          email,
      total_amount:   amount,
      payment_method: "crypto",
      status:         "paid",
      tickets_earned: ticketsEarned,
      items: [
        {
          id:    packageId,
          name:  packageName,
          price: amount,
          qty:   1,
          tickets: ticketsEarned,
        },
      ],
      payment_details: {
        provider:       "chain2pay",
        transaction_id: payload.id || payload.payment_id,
        ticket_numbers: ticketNumbers,
      },
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    return { statusCode: 500, body: "Failed to save order" };
  }

  await sendConfirmationEmail({
    email,
    fullName,
    packageName,
    ticketNumbers,
    ticketsEarned,
    amount,
    orderId: order.id,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, orderId: order.id }),
  };
};

// ── Shared helper: get ebook URL + call send-order-email ─────────
async function sendConfirmationEmail({ email, fullName, packageName, ticketNumbers, ticketsEarned, amount, orderId }) {
  if (!email) return;

  const { data: ebookData } = supabase.storage
    .from("product-images")
    .getPublicUrl("Dropshipping Mastery.pdf");

  const ebookUrl = ebookData?.publicUrl || null;

  try {
    const emailRes = await fetch(
      `${process.env.URL || "https://getluckygifts.shop"}/.netlify/functions/send-order-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          packageName,
          ticketNumbers,
          ticketsEarned,
          amount,
          orderId,
          ebookUrl,
        }),
      }
    );

    if (!emailRes.ok) {
      console.error("Email function error:", await emailRes.text());
    }
  } catch (e) {
    console.error("Failed to call email function:", e.message);
  }
}
