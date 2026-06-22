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

  const { orderId } = body;
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing orderId" }) };
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

    const { data: tickets } = await supabase
      .from("tickets")
      .select("ticket_number")
      .eq("order_id", orderId);

    const ticketNumbers = tickets?.map(t => t.ticket_number) || [];
    const ticketsEarned = ticketNumbers.length || order.tickets_earned || 1;

    let ebookUrl = null;
    if (order.ebook_delivered) {
      const { data: ebookData } = supabase.storage
        .from("product-images")
        .getPublicUrl("Dropshipping Mastery.pdf");
      ebookUrl = ebookData?.publicUrl || null;
    }

    const emailRes = await fetch(
      `${process.env.URL || "https://getluckygifts.shop"}/.netlify/functions/send-order-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.email,
          fullName: order.full_name,
          packageName: order.items?.[0]?.name || "Package",
          ticketNumbers,
          ticketsEarned,
          amount: order.total_amount,
          orderId: order.id,
          ebookUrl,
        }),
      }
    );

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to send email", details: errText }) };
    }

    await supabase
      .from("orders")
      .update({ email_sent: true })
      .eq("id", orderId);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Email resent successfully" }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};