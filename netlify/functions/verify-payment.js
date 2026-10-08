// netlify/functions/verify-payment.js
//
// يستدعيها الفرونت إند بعد أن يعطي SpaceRemit كود الدفع (SP_payment_code)
// في المتصفح عبر SP_SUCCESSFUL_PAYMENT(spaceremit_code).
// هذه الدالة تتحقق من الكود فعليًا لدى SpaceRemit قبل تسليم أي خدمة/منتج.

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const SPACEREMIT_SECRET_KEY = process.env.SPACEREMIT_SECRET_KEY;
  const MIN_AMOUNT = 35;

  if (!SPACEREMIT_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing SPACEREMIT_SECRET_KEY" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { payment_id, orderId } = body;

  if (!payment_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing payment_id" }) };
  }

  try {
    const response = await fetch("https://spaceremit.com/api/v2/payment_info/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        private_key: SPACEREMIT_SECRET_KEY,
        payment_id: payment_id,
      }),
    });

    const data = await response.json();

    if (data.response_status !== "success") {
      console.error("SpaceRemit verify error:", JSON.stringify(data));
      return {
        statusCode: 400,
        body: JSON.stringify({ verified: false, error: data.message || "Payment verification failed" }),
      };
    }

    const info = data.data;

    // الحالات المقبولة فقط حسب توثيق SpaceRemit: A (Completed), B (Pending),
    // D (Waiting Holding Time), E (Need Review) — كلها تُضاف لرصيد البائع
    const ACCEPTED_TAGS = ["A", "B", "D", "E"];

    if (!ACCEPTED_TAGS.includes(info.status_tag)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ verified: false, error: `Payment not accepted, status: ${info.status}` }),
      };
    }

    const paidAmount = parseFloat(info.total_amount);
    if (isNaN(paidAmount) || paidAmount < MIN_AMOUNT) {
      return {
        statusCode: 400,
        body: JSON.stringify({ verified: false, error: `Amount below minimum of $${MIN_AMOUNT}` }),
      };
    }

    // TODO: هنا سجّل الطلب في قاعدة بياناتك كـ "مدفوع" باستخدام orderId و info.id
    // مثال: await markOrderAsPaid(orderId, info.id, info.status_tag);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        verified: true,
        transaction_id: info.id,
        status: info.status,
        amount: info.total_amount,
      }),
    };
  } catch (error) {
    console.error("verify-payment error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
