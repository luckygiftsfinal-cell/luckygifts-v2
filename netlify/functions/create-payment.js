exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const CHAIN2PAY_API_KEY = process.env.CHAIN2PAY_API_KEY;
  const SITE_URL = process.env.URL || "https://getluckygifts.shop";
  const MIN_AMOUNT = 35;

  if (!CHAIN2PAY_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing CHAIN2PAY_API_KEY" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { amount, packageName, packageId, customerEmail, customerName, orderId, productType } = body;

  if (!amount || !packageName) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };
  }

  if (numericAmount < MIN_AMOUNT) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Minimum order amount is $${MIN_AMOUNT}` }),
    };
  }

  try {
    const response = await fetch("https://chain2pay.is/api/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAIN2PAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
        currency: "USD",
        provider: "TransFi",
        merchant_wallet: "0x0F07a118f607FeE58C21d0C803BE5E121CF2f636",
        callback_url: `${SITE_URL}/.netlify/functions/webhook-chain2pay`,
        return_url: `${SITE_URL}/payment/success?order=${orderId || ""}`,
        metadata: {
          order_id: orderId || "",
          package: packageName,
          packageId: packageId || "",
          customer_email: customerEmail || "",
          customer_name: customerName || "",
          product_type: productType || "tickets",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Chain2pay error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.message || data?.error?.message || "Failed to create payment" }),
      };
    }

    const paymentUrl = data?.checkout_url || data?.payment_url || data?.url;

    if (!paymentUrl) {
      console.error("Chain2pay full response:", JSON.stringify(data));
      return { statusCode: 500, body: JSON.stringify({ error: "No payment URL returned", raw: data }) };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ payment_url: paymentUrl }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
