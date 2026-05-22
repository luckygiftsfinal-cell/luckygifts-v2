exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
  const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
  const LEMON_SQUEEZY_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID;
  const SITE_URL = process.env.URL || "https://getluckygifts.shop";

  if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID || !LEMON_SQUEEZY_VARIANT_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing LemonSqueezy configuration" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { items, userName, userEmail, totalPrice, orderId, variantId } = body;
  const VARIANT_ID = variantId || LEMON_SQUEEZY_VARIANT_ID;

  if (!items || !totalPrice) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  const productName = items.length === 1
    ? items[0].title
    : `LuckyGifts Order (${items.length} items)`;

  const customData = {
    order_id: orderId || "",
    user_name: userName || "",
    user_email: userEmail || "",
    total_tickets: items.reduce((sum, item) => sum + ((item.tickets || 0) * (item.quantity || 1)), 0).toString()
  };

  // Price in cents (USD) - LemonSqueezy store must be set to USD
  const priceInCents = Math.round(parseFloat(totalPrice.toString()) * 100);

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
              desc: true,
              discount: true,
              button_color: "#FFD700",
            },
            checkout_data: {
              email: userEmail || "",
              name: userName || "",
              custom: customData,
            },
            product_options: {
              name: productName,
              description: `LuckyGifts — ${productName}. Every purchase enters you into our luxury prize draws.`,
              redirect_url: `${SITE_URL}/orders`,
              receipt_button_text: "View My Orders",
              receipt_link_url: `${SITE_URL}/orders`,
            },
            // price comes from the variant's set price
          },
          relationships: {
            store: { data: { type: "stores", id: LEMON_SQUEEZY_STORE_ID } },
            variant: { data: { type: "variants", id: VARIANT_ID } },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.errors?.[0]?.detail || "Failed to create checkout" }),
      };
    }

    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return { statusCode: 500, body: JSON.stringify({ error: "No checkout URL returned" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ checkoutUrl, checkoutId: data?.data?.id }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
