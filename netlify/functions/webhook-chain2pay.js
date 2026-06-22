const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ── 1. Verify webhook signature ──────────────────────────────
  const secret = process.env.CHAIN2PAY_WEBHOOK_SECRET;
  if (secret) {
    const signature = event.headers["x-chain2pay-signature"] || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(event.rawUrl + event.body)
      .digest("hex");

    if (signature !== expected) {
      console.error("Invalid webhook signature");
      return { statusCode: 401, body: "Unauthorized" };
    }
  } else {
    console.warn("CHAIN2PAY_WEBHOOK_SECRET is not set. Webhook signature is NOT being verified.");
  }

  // ── 2. Parse payload ─────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  console.log("Chain2pay webhook:", JSON.stringify(payload));

  const { amount, metadata, customer, id: transactionId } = payload;
  const packageName = metadata?.package || "Unknown Package";
  const packageId   = metadata?.packageId || null;
  const orderId     = metadata?.order_id || null;
  const email       = metadata?.customer_email || customer?.email || null;
  const fullName    = metadata?.customer_name  || customer?.name  || "Customer";
  const productType = metadata?.product_type || "tickets";

  // ── 3. DUPLICATE TRANSACTION CHECK (CRITICAL) ────────────────
  if (transactionId) {
    let alreadyProcessed = false;
    let previousOrderId = null;

    try {
      const { data: existingOrders, error: orderCheckError } = await supabase
        .from("orders")
        .select("id, status, payment_details, created_at")
        .filter("payment_details->>transaction_id", "eq", transactionId)
        .limit(1);

      if (!orderCheckError && existingOrders && existingOrders.length > 0) {
        alreadyProcessed = true;
        previousOrderId = existingOrders[0].id;
        console.log(`Transaction ${transactionId} already processed in order ${previousOrderId} at ${existingOrders[0].created_at}`);
      }
    } catch (checkErr) {
      console.error("Order transaction check error:", checkErr);
    }

    if (!alreadyProcessed) {
      try {
        const { data: existingLog, error: logCheckError } = await supabase
          .from("payment_logs")
          .select("id, status, created_at")
          .eq("transaction_id", transactionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!logCheckError || logCheckError.code === "PGRST116") {
          if (existingLog) {
            alreadyProcessed = true;
            console.log(`Transaction ${transactionId} already logged at ${existingLog.created_at}`);
          }
        } else if (logCheckError.code !== "42P01") {
          console.error("Payment logs check error:", logCheckError);
        }
      } catch (logErr) {
        console.error("Payment logs check exception:", logErr.message);
      }
    }

    if (alreadyProcessed) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          alreadyProcessed: true,
          transactionId,
          previousOrderId 
        }),
      };
    }
  }

  // Log the webhook (best effort)
  try {
    await supabase.from("payment_logs").insert({
      provider: "chain2pay",
      transaction_id: transactionId || null,
      payload: payload,
      status: payload.status,
    });
  } catch (logErr) {
    console.warn("Could not log to payment_logs:", logErr.message);
  }

  // ── 4. Handle FAILED payments ─────────────────────────────────
  if (payload.status === "failed" || payload.status === "cancelled") {
    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_details: {
            provider: "chain2pay",
            transaction_id: transactionId,
            failure_reason: payload.failure_reason || payload.message || "Payment failed",
          },
        })
        .eq("id", orderId);

      await sendEmailWithRetry({
        email,
        fullName,
        packageName,
        amount,
        orderId,
        status: "failed",
        failureReason: payload.failure_reason || payload.message || "Payment failed",
      });
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, status: "failed_handled" }) };
  }

  // Only process completed payments
  if (payload.status !== "completed" && payload.status !== "paid") {
    return { statusCode: 200, body: "Ignored" };
  }

  // ── 5. Find the pending order ──────────────────────────────────
  let pendingOrder = null;
  if (orderId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!error && data) {
      pendingOrder = data;
    }
  }

  if (pendingOrder) {
    // Idempotency check
    if (pendingOrder.status === "paid") {
      console.log(`Order ${pendingOrder.id} already marked paid, skipping`);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, orderId: pendingOrder.id, alreadyProcessed: true }),
      };
    }

    const ticketsEarned = pendingOrder.tickets_earned || 1;
    const ticketNumbers = [];

    // Generate unique ticket numbers with collision detection
    for (let i = 0; i < ticketsEarned; i++) {
      let ticketNum;
      let exists = true;
      let attempts = 0;

      while (exists && attempts < 10) {
        const year = new Date().getFullYear();
        const random = Math.floor(100000 + Math.random() * 900000);
        ticketNum = `LG-${year}-${random}`;

        const { data: existing } = await supabase
          .from("tickets")
          .select("ticket_number")
          .eq("ticket_number", ticketNum)
          .single();

        exists = !!existing;
        attempts++;
      }

      ticketNumbers.push(ticketNum);
    }

    // Save tickets to database
    const ticketsToInsert = ticketNumbers.map(num => ({
      order_id: pendingOrder.id,
      user_id: pendingOrder.user_id,
      ticket_number: num,
      owner_name: pendingOrder.full_name || fullName,
      package_name: packageName,
      draw_date: "2026-12-31",
      status: "active",
    }));

    const { error: ticketsError } = await supabase
      .from("tickets")
      .insert(ticketsToInsert);

    if (ticketsError) {
      console.error("Error saving tickets:", ticketsError);
    }

    // Handle e-book delivery
    let ebookUrl = null;
    let libraryEntry = null;

    if (productType === "ebook" || productType === "bundle") {
      const { data: ebookData } = supabase.storage
        .from("product-images")
        .getPublicUrl("Dropshipping Mastery.pdf");

      ebookUrl = ebookData?.publicUrl || null;

      if (ebookUrl && pendingOrder.user_id) {
        const { data: libEntry } = await supabase
          .from("user_library")
          .insert({
            user_id: pendingOrder.user_id,
            order_id: pendingOrder.id,
            product_name: packageName,
            file_path: "Dropshipping Mastery.pdf",
            download_url: ebookUrl,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        libraryEntry = libEntry;
      }
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        ebook_delivered: !!ebookUrl,
        payment_details: {
          ...(pendingOrder.payment_details || {}),
          provider:       "chain2pay",
          transaction_id: transactionId,
          ticket_numbers: ticketNumbers,
          ebook_url: ebookUrl,
        },
      })
      .eq("id", pendingOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      return { statusCode: 500, body: "Failed to update order" };
    }

    // ═══════════════════════════════════════════════════════════
    // NEW: COMPLETE REFERRAL (Points System)
    // ═══════════════════════════════════════════════════════════
    if (pendingOrder.user_id && pendingOrder.total_amount) {
      try {
        // Find pending referral for this user
        const { data: referral, error: refError } = await supabase
          .from("referrals")
          .select("*")
          .eq("referred_id", pendingOrder.user_id)
          .eq("status", "pending")
          .single();

        if (!refError && referral) {
          // Minimum order amount for referral: $35
          const MIN_REFERRAL_AMOUNT = 35;

          if (pendingOrder.total_amount < MIN_REFERRAL_AMOUNT) {
            console.log(`Order amount $${pendingOrder.total_amount} below minimum $${MIN_REFERRAL_AMOUNT}, marking as completed with 0 points`);

            // Mark referral as completed but with 0 points
            await supabase
              .from("referrals")
              .update({
                status: "completed",
                order_id: pendingOrder.id,
                order_amount: pendingOrder.total_amount,
                points_earned: 0,
                completed_at: new Date().toISOString(),
              })
              .eq("id", referral.id);

            // Still update referrer stats (count only, no points)
            const { data: referrerProfile } = await supabase
              .from("profiles")
              .select("total_referrals")
              .eq("id", referral.referrer_id)
              .single();

            if (referrerProfile) {
              await supabase
                .from("profiles")
                .update({
                  total_referrals: (referrerProfile.total_referrals || 0) + 1,
                })
                .eq("id", referral.referrer_id);
            }

            console.log(`Referral completed with 0 points (below minimum)`);
            return; // Skip points awarding
          }

          // Calculate points: every $35 = 1 point
          const pointsEarned = Math.floor(pendingOrder.total_amount / 35);

          console.log(`Completing referral for user ${pendingOrder.user_id}. Order amount: $${pendingOrder.total_amount}, Points: ${pointsEarned}`);

          // Update referral to completed
          await supabase
            .from("referrals")
            .update({
              status: "completed",
              order_id: pendingOrder.id,
              order_amount: pendingOrder.total_amount,
              points_earned: pointsEarned,
              completed_at: new Date().toISOString(),
            })
            .eq("id", referral.id);

          // Update referrer's points in user_points table
          const { data: referrerPoints } = await supabase
            .from("user_points")
            .select("*")
            .eq("user_id", referral.referrer_id)
            .single();

          if (referrerPoints) {
            await supabase
              .from("user_points")
              .update({
                points: referrerPoints.points + pointsEarned,
                total_earned: referrerPoints.total_earned + pointsEarned,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", referral.referrer_id);
          } else {
            // Create user_points if not exists
            await supabase
              .from("user_points")
              .insert({
                user_id: referral.referrer_id,
                points: pointsEarned,
                total_earned: pointsEarned,
                total_spent: 0,
              });
          }

          // Update referrer's profile stats
          const { data: referrerProfile } = await supabase
            .from("profiles")
            .select("total_referrals, referral_points")
            .eq("id", referral.referrer_id)
            .single();

          if (referrerProfile) {
            await supabase
              .from("profiles")
              .update({
                total_referrals: (referrerProfile.total_referrals || 0) + 1,
                referral_points: (referrerProfile.referral_points || 0) + pointsEarned,
              })
              .eq("id", referral.referrer_id);
          }

          console.log(`Referral completed: ${pointsEarned} points awarded to referrer ${referral.referrer_id}`);

          // Send notification to referrer (best effort - don't fail if email fails)
          try {
            const { data: referrerProfile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", referral.referrer_id)
              .single();

            if (referrerProfile?.email) {
              await fetch(
                `${process.env.URL || "https://getluckygifts.shop"}/.netlify/functions/send-referral-notification`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    referrerEmail: referrerProfile.email,
                    referrerName: referrerProfile.full_name || "Friend",
                    referredName: pendingOrder.full_name || "Someone",
                    pointsEarned,
                    orderAmount: pendingOrder.total_amount,
                  }),
                }
              );
              console.log(`Referral notification sent to ${referrerProfile.email}`);
            }
          } catch (notifErr) {
            console.error("Failed to send referral notification:", notifErr.message);
            // Don't fail the webhook if notification fails
          }
        } else if (refError) {
          console.log("No pending referral found for user:", pendingOrder.user_id);
        }
      } catch (refErr) {
        console.error("Error completing referral:", refErr);
        // Don't fail the webhook if referral fails
      }
    }
    // ═══════════════════════════════════════════════════════════

    // Send success email with retry mechanism
    await sendEmailWithRetry({
      email:        pendingOrder.email || email,
      fullName:     pendingOrder.full_name || fullName,
      packageName,
      ticketNumbers,
      ticketsEarned,
      amount:       pendingOrder.total_amount ?? amount,
      orderId:      updatedOrder.id,
      ebookUrl,
    });

    // Update user ticket balance
    if (pendingOrder.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("ticket_balance")
        .eq("id", pendingOrder.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            ticket_balance: (profile.ticket_balance || 0) + ticketsEarned,
          })
          .eq("id", pendingOrder.user_id);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, orderId: updatedOrder.id }) };
  }

  // ── 6. Fallback: no matching pending order ───────────────────
  let product = null;
  if (packageId) {
    const { data } = await supabase
      .from("products")
      .select("id, title, tickets, prize, main_image")
      .eq("id", packageId)
      .single();
    product = data;
  }

  const ticketsEarned = product?.tickets || 1;
  const ticketNumbers = [];

  for (let i = 0; i < ticketsEarned; i++) {
    let ticketNum;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      const year = new Date().getFullYear();
      const random = Math.floor(100000 + Math.random() * 900000);
      ticketNum = `LG-${year}-${random}`;

      const { data: existing } = await supabase
        .from("tickets")
        .select("ticket_number")
        .eq("ticket_number", ticketNum)
        .single();

      exists = !!existing;
      attempts++;
    }

    ticketNumbers.push(ticketNum);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      full_name:      fullName,
      email:          email,
      total_amount:   amount,
      payment_method: "crypto",
      status:         "paid",
      tickets_earned: ticketsEarned,
      items: [
        {
          id:    packageId,
          name:  packageName,
          price: amount,
          qty:   1,
          tickets: ticketsEarned,
        },
      ],
      payment_details: {
        provider:       "chain2pay",
        transaction_id: transactionId,
        ticket_numbers: ticketNumbers,
      },
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    return { statusCode: 500, body: "Failed to save order" };
  }

  // Save tickets for fallback too
  const ticketsToInsert = ticketNumbers.map(num => ({
    order_id: order.id,
    ticket_number: num,
    owner_name: fullName,
    package_name: packageName,
    draw_date: "2026-12-31",
    status: "active",
  }));

  await supabase.from("tickets").insert(ticketsToInsert);

  // Send success email with retry
  await sendEmailWithRetry({
    email,
    fullName,
    packageName,
    ticketNumbers,
    ticketsEarned,
    amount,
    orderId: order.id,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, orderId: order.id }),
  };
};

// ── Send email with retry mechanism (up to 3 attempts) ─────────
async function sendEmailWithRetry({ email, fullName, packageName, ticketNumbers, ticketsEarned, amount, orderId, ebookUrl, status, failureReason }) {
  if (!email) {
    console.log("No email provided, skipping email send");
    return;
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const emailRes = await fetch(
        `${process.env.URL || "https://getluckygifts.shop"}/.netlify/functions/send-order-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            fullName,
            packageName,
            ticketNumbers: ticketNumbers || [],
            ticketsEarned,
            amount,
            orderId,
            ebookUrl,
            status,
            failureReason,
          }),
        }
      );

      if (emailRes.ok) {
        console.log(`Email sent successfully on attempt ${attempt}`);

        if (orderId) {
          await supabase
            .from("orders")
            .update({ email_sent: true })
            .eq("id", orderId);
        }

        return { success: true };
      } else {
        const errText = await emailRes.text();
        lastError = new Error(`HTTP ${emailRes.status}: ${errText}`);
        console.error(`Email attempt ${attempt} failed:`, errText);
      }
    } catch (e) {
      lastError = e;
      console.error(`Email attempt ${attempt} error:`, e.message);
    }

    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`All ${maxRetries} email attempts failed for order ${orderId}`);

  if (orderId) {
    await supabase
      .from("orders")
      .update({ 
        email_sent: false,
        email_error: lastError?.message || "Unknown error",
        email_retry_count: maxRetries 
      })
      .eq("id", orderId);
  }

  return { success: false, error: lastError?.message };
}
