exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const {
    email,
    fullName,
    packageName,
    ticketNumbers = [],
    ticketsEarned,
    amount,
    orderId,
    ebookUrl,
    status,
    failureReason,
  } = body;

  if (!email) {
    return { statusCode: 400, body: "Missing email" };
  }

  const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: "Missing RESEND_API_KEY" };
  }

  // ── Build ticket cards HTML with owner_name ──────────────────
  const ticketCardsHtml = ticketNumbers
    .map(
      (num, i) => `
    <div style="
      margin: 12px auto;
      max-width: 480px;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1400 100%);
      border: 1px solid #FFD700;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(255,215,0,0.15);
      font-family: 'Arial', sans-serif;
    ">
      <!-- Top bar -->
      <div style="
        background: linear-gradient(90deg, #FFD700, #FFC107);
        padding: 8px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="font-size:11px; font-weight:900; color:#000; letter-spacing:0.2em; text-transform:uppercase;">
          🎟 LuckyGifts Draw Ticket
        </span>
        <span style="font-size:11px; font-weight:900; color:#000;">
          #${String(i + 1).padStart(2, "0")}
        </span>
      </div>

      <!-- Ticket body -->
      <div style="padding: 20px 24px;">
        <div style="font-size:10px; color:rgba(255,215,0,0.6); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:6px;">
          Ticket Number
        </div>
        <div style="font-size:22px; font-weight:900; color:#FFD700; letter-spacing:0.15em; margin-bottom:8px;">
          ${num}
        </div>
        
        <!-- OWNER NAME -->
        <div style="font-size:13px; color:rgba(255,255,255,0.7); margin-bottom:8px; padding: 6px 0; border-top: 1px dashed rgba(255,215,0,0.2); border-bottom: 1px dashed rgba(255,215,0,0.2);">
          👤 <strong style="color:#FFD700;">Owner:</strong> ${fullName || "Customer"}
        </div>
        
        <div style="font-size:11px; color:rgba(255,255,255,0.4); margin-top:6px;">
          Draw Date: 31 Dec 2026
        </div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); margin-top:4px;">
          ${packageName}
        </div>
      </div>

      <!-- Dashed separator -->
      <div style="border-top: 1px dashed rgba(255,215,0,0.2); margin: 0 24px;"></div>

      <!-- Bottom -->
      <div style="padding:12px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:10px; color:rgba(255,255,255,0.3);">
          getluckygifts.shop
        </div>
        <div style="
          background:rgba(255,215,0,0.1);
          border:1px solid rgba(255,215,0,0.3);
          border-radius:6px;
          padding:3px 10px;
          font-size:9px;
          color:#FFD700;
          font-weight:800;
          letter-spacing:0.1em;
        ">VALID</div>
      </div>
    </div>
  `
    )
    .join("");

  // ── Determine email type ─────────────────────────────────────
  const isFailed = status === "failed";

  const html = isFailed 
    ? buildFailureEmail({ fullName, packageName, amount, orderId, failureReason })
    : buildSuccessEmail({ fullName, packageName, ticketNumbers, ticketsEarned, amount, orderId, ebookUrl, ticketCardsHtml });

  const subject = isFailed
    ? `❌ Payment Failed — LuckyGifts Order #${orderId?.substring(0, 8).toUpperCase()}`
    : `🎟 Your ${ticketsEarned} Ticket${ticketsEarned > 1 ? "s" : ""} for the $1M Draw — LuckyGifts`;

  // ── Send via Resend ───────────────────────────────────────────
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LuckyGifts <noreply@getluckygifts.shop>",
      to: [email],
      subject,
      html,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("Resend error:", result);
    return { statusCode: 500, body: JSON.stringify({ error: result }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, emailId: result.id }),
  };
};

// ── Build success email ────────────────────────────────────────
function buildSuccessEmail({ fullName, packageName, ticketNumbers, ticketsEarned, amount, orderId, ebookUrl, ticketCardsHtml }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0a0a0a; font-family:Arial,sans-serif;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a0a0a,#1a1400); padding:40px 20px; text-align:center; border-bottom:2px solid #FFD700;">
    <div style="font-size:28px; font-weight:900; color:#FFD700; letter-spacing:0.1em;">✦ LUCKYGIFTS ✦</div>
    <div style="font-size:13px; color:rgba(255,255,255,0.5); margin-top:8px; letter-spacing:0.2em;">YOUR TICKETS ARE CONFIRMED</div>
  </div>

  <!-- Main content -->
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">

    <!-- Greeting -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="font-size:32px; margin-bottom:16px;">🎉</div>
      <h1 style="color:#fff; font-size:24px; font-weight:900; margin:0 0 12px;">
        Congratulations, ${fullName}!
      </h1>
      <p style="color:rgba(255,255,255,0.6); font-size:15px; line-height:1.7; margin:0;">
        Your purchase of <strong style="color:#FFD700;">${packageName}</strong> is confirmed.<br>
        You've earned <strong style="color:#FFD700;">${ticketsEarned} ticket${ticketsEarned > 1 ? "s" : ""}</strong> in our $1,000,000 Grand Draw!
      </p>
    </div>

    <!-- Order info -->
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,0,0.15); border-radius:12px; padding:20px 24px; margin-bottom:32px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Order ID</span>
        <span style="color:#fff; font-size:13px; font-weight:700;">${orderId?.substring(0, 8).toUpperCase()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Package</span>
        <span style="color:#fff; font-size:13px; font-weight:700;">${packageName}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Amount Paid</span>
        <span style="color:#FFD700; font-size:13px; font-weight:700;">$${amount}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Tickets Earned</span>
        <span style="color:#FFD700; font-size:13px; font-weight:700;">${ticketsEarned} Ticket${ticketsEarned > 1 ? "s" : ""}</span>
      </div>
    </div>

    <!-- Tickets section -->
    <div style="text-align:center; margin-bottom:24px;">
      <div style="font-size:11px; font-weight:900; color:#FFD700; letter-spacing:0.3em; text-transform:uppercase; margin-bottom:8px;">
        ✦ YOUR DRAW TICKETS ✦
      </div>
      <p style="color:rgba(255,255,255,0.4); font-size:13px; margin:0 0 20px;">
        Keep these ticket numbers safe — they are your entries into the Grand Draw!
      </p>
      ${ticketCardsHtml}
    </div>

    <!-- Ebook section -->
    ${
      ebookUrl
        ? `
    <div style="background:linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.03)); border:1px solid rgba(255,215,0,0.25); border-radius:16px; padding:28px; text-align:center; margin:32px 0;">
      <div style="font-size:32px; margin-bottom:12px;">📘</div>
      <div style="font-size:16px; font-weight:900; color:#fff; margin-bottom:8px;">Your Free eBook is Ready!</div>
      <div style="font-size:13px; color:rgba(255,255,255,0.5); margin-bottom:20px;">
        Download your exclusive eBook — included with your purchase.
      </div>
      <a href="${ebookUrl}" target="_blank" style="
        display:inline-block;
        background:linear-gradient(135deg,#FFD700,#FFC107);
        color:#000;
        font-weight:900;
        font-size:14px;
        padding:14px 36px;
        border-radius:10px;
        text-decoration:none;
        letter-spacing:0.05em;
      ">📥 Download eBook</a>
      <div style="margin-top:16px; font-size:11px; color:rgba(255,255,255,0.3);">
        Or visit <a href="https://getluckygifts.shop/my-library" style="color:#FFD700;">My Library</a> to access all your downloads
      </div>
    </div>`
        : ""
    }

    <!-- Draw info -->
    <div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
      <div style="font-size:13px; color:rgba(255,255,255,0.4); margin-bottom:8px;">Grand Draw Date</div>
      <div style="font-size:22px; font-weight:900; color:#FFD700;">31 December 2026</div>
      <div style="font-size:12px; color:rgba(255,255,255,0.3); margin-top:8px;">Live draw streamed on our website</div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding-top:32px; border-top:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:18px; font-weight:900; color:#FFD700; margin-bottom:8px;">✦ LUCKYGIFTS ✦</div>
      <div style="font-size:12px; color:rgba(255,255,255,0.3); line-height:1.8;">
        getluckygifts.shop<br>
        Licensed in Canada · No. 002260253<br>
        Regulated by Alcohol and Gaming Commission of Ontario
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

// ── Build failure email ────────────────────────────────────────
function buildFailureEmail({ fullName, packageName, amount, orderId, failureReason }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0a0a0a; font-family:Arial,sans-serif;">

  <div style="background:linear-gradient(135deg,#0a0a0a,#1a0000); padding:40px 20px; text-align:center; border-bottom:2px solid #EF4444;">
    <div style="font-size:28px; font-weight:900; color:#EF4444; letter-spacing:0.1em;">✦ LUCKYGIFTS ✦</div>
    <div style="font-size:13px; color:rgba(255,255,255,0.5); margin-top:8px; letter-spacing:0.2em;">PAYMENT NOT COMPLETED</div>
  </div>

  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="font-size:32px; margin-bottom:16px;">❌</div>
      <h1 style="color:#fff; font-size:24px; font-weight:900; margin:0 0 12px;">
        Sorry, ${fullName}
      </h1>
      <p style="color:rgba(255,255,255,0.6); font-size:15px; line-height:1.7; margin:0;">
        Your payment for <strong style="color:#EF4444;">${packageName}</strong> could not be completed.
      </p>
    </div>

    <div style="background:rgba(239,68,68,0.04); border:1px solid rgba(239,68,68,0.15); border-radius:12px; padding:20px 24px; margin-bottom:32px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Order ID</span>
        <span style="color:#fff; font-size:13px; font-weight:700;">${orderId?.substring(0, 8).toUpperCase()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Amount</span>
        <span style="color:#EF4444; font-size:13px; font-weight:700;">$${amount}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:rgba(255,255,255,0.4); font-size:13px;">Reason</span>
        <span style="color:#EF4444; font-size:13px; font-weight:700;">${failureReason || "Payment declined"}</span>
      </div>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <a href="https://getluckygifts.shop/store" style="
        display:inline-block;
        background:linear-gradient(135deg,#FFD700,#FFC107);
        color:#000;
        font-weight:900;
        font-size:14px;
        padding:14px 36px;
        border-radius:10px;
        text-decoration:none;
        letter-spacing:0.05em;
      ">🔄 Try Again</a>
    </div>

    <div style="text-align:center; padding-top:32px; border-top:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:18px; font-weight:900; color:#FFD700; margin-bottom:8px;">✦ LUCKYGIFTS ✦</div>
      <div style="font-size:12px; color:rgba(255,255,255,0.3); line-height:1.8;">
        getluckygifts.shop<br>
        Need help? Contact support@getluckygifts.shop
      </div>
    </div>
  </div>
</body>
</html>
  `;
}