export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { userEmail, userName, variantId } = JSON.parse(event.body);
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const targetVariantId = variantId || process.env.LEMON_SQUEEZY_VARIANT_ID;

    // REVERTING TO THE LAST KNOWN WORKING STRUCTURE
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            name: userName
          }
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId.toString() }
          },
          variant: {
            data: { type: "variants", id: targetVariantId.toString() }
          }
        }
      }
    };

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "API Rejected", details: result })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: result.data.attributes.url })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
