const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { orderId, filePath } = body;
  if (!orderId || !filePath) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing orderId or filePath" }) };
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { statusCode: 404, body: JSON.stringify({ error: "Order not found" }) };
    }

    // Generate signed URL (expires in 7 days)
    const { data: signedUrl, error: signError } = await supabase.storage
      .from("product-images")
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    if (signError) {
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate signed URL" }) };
    }

    // Update user_library
    await supabase
      .from("user_library")
      .update({
        download_url: signedUrl.signedUrl,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("order_id", orderId);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        downloadUrl: signedUrl.signedUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};