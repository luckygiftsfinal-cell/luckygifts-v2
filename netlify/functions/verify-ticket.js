const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const ticketNumber = event.queryStringParameters?.ticket;
  if (!ticketNumber) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing ticket number" }) };
  }

  try {
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*, orders(*)")
      .eq("ticket_number", ticketNumber)
      .single();

    if (error || !ticket) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          valid: false,
          message: "Ticket not found",
        }),
      };
    }

    // Update verification
    await supabase
      .from("tickets")
      .update({
        verified_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        valid: true,
        ticket: {
          number: ticket.ticket_number,
          owner: ticket.owner_name,
          package: ticket.package_name,
          drawDate: ticket.draw_date,
          status: ticket.status,
          createdAt: ticket.created_at,
        },
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};