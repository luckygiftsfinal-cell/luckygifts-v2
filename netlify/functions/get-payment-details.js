// netlify/functions/get-payment-details.js
// Returns an order (+ tickets/library) ONLY to the user who owns it.
const { json, getSupabase, authUser } = require("./_shared/common");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method Not Allowed" });

  const supabase = getSupabase();
  if (!supabase) return json(500, { error: "Server not configured" });

  const user = await authUser(supabase, event);
  if (!user) return json(401, { error: "Not authenticated" });

  const orderId = event.queryStringParameters?.orderId;
  if (!orderId || !UUID_RE.test(orderId)) return json(400, { error: "Missing or invalid orderId" });

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.user_id !== user.id) return json(404, { error: "Order not found" });

  const { data: tickets } = await supabase.from("tickets").select("*").eq("order_id", orderId);
  const { data: library } = await supabase.from("user_library").select("*").eq("order_id", orderId);

  return json(200, { order, tickets: tickets || [], library: library || [] });
};
