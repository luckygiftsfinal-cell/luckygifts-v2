// netlify/functions/_shared/finalize-order.js
// Runs once, server-side, after a payment has been verified on-chain:
// marks the order paid (atomically), issues tickets, updates balance, referral, promo usage, email.
const crypto = require("crypto");

const SITE_URL = () => process.env.URL || "https://getluckygifts.shop";
const MIN_REFERRAL_AMOUNT = 35;

async function generateTicketNumbers(supabase, count) {
  const year = new Date().getFullYear();
  const numbers = new Set();
  const fill = () => {
    while (numbers.size < count) numbers.add(`LG-${year}-${crypto.randomInt(100000, 1000000)}`);
  };
  fill();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("tickets").select("ticket_number").in("ticket_number", [...numbers]);
    if (!data || data.length === 0) break;
    data.forEach((r) => numbers.delete(r.ticket_number));
    fill();
  }
  return [...numbers];
}

async function completeReferral(supabase, order) {
  if (!order.user_id) return;
  const { data: referral } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", order.user_id)
    .eq("status", "pending")
    .maybeSingle();
  if (!referral) return;

  const amount = Number(order.total_amount) || 0;
  const points = amount >= MIN_REFERRAL_AMOUNT ? Math.floor(amount / MIN_REFERRAL_AMOUNT) : 0;

  await supabase
    .from("referrals")
    .update({
      status: "completed",
      order_id: order.id,
      order_amount: amount,
      points_earned: points,
      completed_at: new Date().toISOString(),
    })
    .eq("id", referral.id);

  if (points > 0) {
    const { data: up } = await supabase.from("user_points").select("*").eq("user_id", referral.referrer_id).maybeSingle();
    if (up) {
      await supabase
        .from("user_points")
        .update({
          points: up.points + points,
          total_earned: up.total_earned + points,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", referral.referrer_id);
    } else {
      await supabase
        .from("user_points")
        .insert({ user_id: referral.referrer_id, points, total_earned: points, total_spent: 0 });
    }
  }

  const { data: refProfile } = await supabase
    .from("profiles")
    .select("total_referrals, referral_points, email, full_name")
    .eq("id", referral.referrer_id)
    .maybeSingle();
  if (refProfile) {
    await supabase
      .from("profiles")
      .update({
        total_referrals: (refProfile.total_referrals || 0) + 1,
        referral_points: (refProfile.referral_points || 0) + points,
      })
      .eq("id", referral.referrer_id);

    if (points > 0 && refProfile.email) {
      try {
        await fetch(`${SITE_URL()}/.netlify/functions/send-referral-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrerEmail: refProfile.email,
            referrerName: refProfile.full_name || "Friend",
            referredName: order.full_name || "Someone",
            pointsEarned: points,
            orderAmount: amount,
          }),
        });
      } catch (e) {
        console.error("Referral notification failed:", e.message);
      }
    }
  }
}

async function sendEmailWithRetry(supabase, payload) {
  if (!payload.email) return;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${SITE_URL()}/.netlify/functions/send-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await supabase.from("orders").update({ email_sent: true }).eq("id", payload.orderId);
        return;
      }
      lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < 3) await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 1000));
  }
  await supabase
    .from("orders")
    .update({ email_sent: false, email_error: lastError?.message || "Unknown error", email_retry_count: 3 })
    .eq("id", payload.orderId);
}

/**
 * @returns {{ alreadyPaid: boolean, ticketNumbers?: string[] }}
 */
async function finalizeOrder(supabase, order, paymentExtras) {
  // Atomic claim: only one caller can flip pending_verification -> paid.
  const { data: claimed } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_details: { ...(order.payment_details || {}), ...paymentExtras, paid_at: new Date().toISOString() },
    })
    .eq("id", order.id)
    .eq("status", "pending_verification")
    .select()
    .maybeSingle();
  if (!claimed) return { alreadyPaid: true };

  const ticketsEarned = Number(order.tickets_earned) || 0;
  const items = Array.isArray(order.items) ? order.items : [];
  const packageName = items.map((i) => `${i.title || i.name} x${i.quantity || 1}`).join(", ") || "Lucky Gifts order";
  let ticketNumbers = [];

  try {
    if (ticketsEarned > 0) {
      ticketNumbers = await generateTicketNumbers(supabase, ticketsEarned);
      const rows = ticketNumbers.map((num) => ({
        order_id: order.id,
        user_id: order.user_id,
        ticket_number: num,
        owner_name: order.full_name,
        package_name: packageName,
        draw_date: "2026-12-31",
        status: "active",
      }));
      const { error } = await supabase.from("tickets").insert(rows);
      if (error) throw error;
    }

    if (order.user_id && ticketsEarned > 0) {
      const { data: profile } = await supabase.from("profiles").select("ticket_balance").eq("id", order.user_id).maybeSingle();
      if (profile) {
        await supabase
          .from("profiles")
          .update({ ticket_balance: (profile.ticket_balance || 0) + ticketsEarned })
          .eq("id", order.user_id);
      }
    }
  } catch (err) {
    // Order is paid but fulfilment failed: flag it so an admin can re-issue.
    console.error("Ticket fulfilment failed for order", order.id, err);
    await supabase
      .from("orders")
      .update({ payment_details: { ...claimed.payment_details, fulfillment_error: String(err.message || err) } })
      .eq("id", order.id);
    return { alreadyPaid: false, ticketNumbers };
  }

  await supabase
    .from("orders")
    .update({ payment_details: { ...claimed.payment_details, ticket_numbers: ticketNumbers } })
    .eq("id", order.id);

  // Best-effort extras: never fail the payment because of these.
  try {
    const promo = order.payment_details?.promo_code;
    if (promo) {
      const { data: p } = await supabase.from("promo_codes").select("id, current_uses").eq("code", promo).maybeSingle();
      if (p) await supabase.from("promo_codes").update({ current_uses: (p.current_uses || 0) + 1 }).eq("id", p.id);
    }
  } catch (e) {
    console.error("Promo usage update failed:", e.message);
  }
  try {
    await completeReferral(supabase, order);
  } catch (e) {
    console.error("Referral completion failed:", e.message);
  }
  try {
    await sendEmailWithRetry(supabase, {
      email: order.email,
      fullName: order.full_name,
      packageName,
      ticketNumbers,
      ticketsEarned,
      amount: order.total_amount,
      orderId: order.id,
    });
  } catch (e) {
    console.error("Order email failed:", e.message);
  }

  return { alreadyPaid: false, ticketNumbers };
}

module.exports = { finalizeOrder };
