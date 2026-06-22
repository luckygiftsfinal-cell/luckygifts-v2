const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const orderId = event.queryStringParameters?.orderId;
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing orderId" }) };
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { statusCode: 404, body: JSON.stringify({ error: "Order not found" }) };
    }

    const { data: tickets } = await supabase
      .from("tickets")
      .select("*")
      .eq("order_id", orderId);

    const { data: library } = await supabase
      .from("user_library")
      .select("*")
      .eq("order_id", orderId);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        order,
        tickets: tickets || [],
        library: library || [],
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};