// netlify/functions/verify-crypto-payment.js
// Verifies, on-chain, that the customer sent EXACTLY the order's unique amount to our wallet AFTER the order was created.
// Then finalizes the order server-side (tickets, balance, referral, email).
// Env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY. Optional: TRONGRID_API_KEY, POLYGON_RPC_URL.

const { json, getSupabase, authUser, getWallets } = require("./_shared/common");
const { finalizeOrder } = require("./_shared/finalize-order");

const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDC_POLYGON = [
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", // native USDC
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC.e
];
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const POLYGON_RPC = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const MIN_POLYGON_CONFIRMATIONS = 30;
const CLOCK_SKEW_MS = 60 * 1000;
const EXPIRY_MS = 24 * 3600 * 1000;

const toMilli = (n) => Math.round(Number(n) * 1000);

async function checkTron({ txHash, wallet, order, expectedMilli }) {
  const headers = process.env.TRONGRID_API_KEY ? { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY } : {};
  const sinceMs = new Date(order.created_at).getTime() - CLOCK_SKEW_MS;
  const url =
    `https://api.trongrid.io/v1/accounts/${wallet}/transactions/trc20` +
    `?only_to=true&only_confirmed=true&limit=200&contract_address=${USDT_TRC20}&min_timestamp=${sinceMs}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return { status: "pending", reason: "explorer_unavailable" };
  const { data = [] } = await res.json();

  const transfers = data.filter(
    (t) =>
      t.transaction_id === txHash &&
      t.to === wallet &&
      t.token_info?.address === USDT_TRC20 &&
      t.type === "Transfer" &&
      Number(t.block_timestamp) >= sinceMs
  );
  if (!transfers.length) return { status: "pending", reason: "not_found_yet" };

  const received = transfers.reduce((s, t) => s + Number(t.value) / 10 ** Number(t.token_info.decimals ?? 6), 0);
  return toMilli(received) === expectedMilli
    ? { status: "confirmed", received }
    : { status: "invalid", reason: "amount_mismatch", received };
}

async function rpc(method, params) {
  const r = await fetch(POLYGON_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

async function checkPolygon({ txHash, wallet, order, expectedMilli }) {
  const receipt = await rpc("eth_getTransactionReceipt", [txHash]);
  if (!receipt) return { status: "pending", reason: "not_found_yet" };
  if (receipt.status !== "0x1") return { status: "invalid", reason: "tx_failed" };

  const latest = parseInt(await rpc("eth_blockNumber", []), 16);
  const confirmations = latest - parseInt(receipt.blockNumber, 16) + 1;
  if (confirmations < MIN_POLYGON_CONFIRMATIONS) return { status: "pending", reason: "confirmations", confirmations };

  // The transfer must have happened AFTER this order was created.
  const block = await rpc("eth_getBlockByNumber", [receipt.blockNumber, false]);
  const txTimeMs = parseInt(block.timestamp, 16) * 1000;
  if (txTimeMs < new Date(order.created_at).getTime() - CLOCK_SKEW_MS) {
    return { status: "invalid", reason: "tx_before_order" };
  }

  const target = wallet.toLowerCase();
  let raw = 0n;
  for (const log of receipt.logs) {
    if (!USDC_POLYGON.includes(log.address.toLowerCase())) continue;
    if (log.topics?.[0] !== TRANSFER_TOPIC || log.topics.length < 3) continue;
    const to = "0x" + log.topics[2].slice(26).toLowerCase();
    if (to === target) raw += BigInt(log.data);
  }
  const received = Number(raw) / 1e6;
  if (received === 0) return { status: "invalid", reason: "no_usdc_transfer_to_wallet" };
  return toMilli(received) === expectedMilli
    ? { status: "confirmed", received }
    : { status: "invalid", reason: "amount_mismatch", received };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const supabase = getSupabase();
  if (!supabase) return json(500, { error: "Server not configured" });

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return json(400, { error: "Invalid request body" });
  }
  const { orderId, asset } = body;
  const rawHash = String(body.txHash || "").trim();

  let txHash;
  if (asset === "USDT_TRC20" && /^[0-9a-fA-F]{64}$/.test(rawHash)) txHash = rawHash.toLowerCase();
  else if (asset === "USDC_POLYGON" && /^0x[0-9a-fA-F]{64}$/.test(rawHash)) txHash = rawHash.toLowerCase();
  else return json(400, { error: "Invalid asset or transaction hash" });
  if (!orderId) return json(400, { error: "Missing orderId" });

  const user = await authUser(supabase, event);
  if (!user) return json(401, { error: "Not authenticated" });

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.user_id !== user.id || order.payment_method !== "crypto") {
    return json(404, { error: "Order not found" });
  }
  if (order.status === "paid") return json(200, { status: "paid" });
  if (order.status !== "pending_verification") return json(200, { status: "invalid", reason: "order_closed" });
  if (Date.now() - new Date(order.created_at).getTime() > EXPIRY_MS) {
    return json(200, { status: "invalid", reason: "order_expired" });
  }

  // Expected amount is set by the server when the order was created — never by the browser.
  const expectedMilli = toMilli(order.payment_details?.expected_amount);
  if (!(expectedMilli > 0)) return json(400, { error: "Invalid order amount" });

  // Remember the submitted hash so the success page can re-check later.
  if (order.payment_details?.txHash !== txHash || order.payment_details?.asset !== asset) {
    await supabase
      .from("orders")
      .update({ payment_details: { ...(order.payment_details || {}), txHash, asset } })
      .eq("id", order.id)
      .eq("status", "pending_verification");
    order.payment_details = { ...(order.payment_details || {}), txHash, asset };
  }

  // Wallets assigned to THIS order at creation (safe even if an admin later disables/deletes them).
  // Orders created before this feature fall back to the current active wallets.
  const pinned = order.payment_details?.wallets;
  const wallets = pinned?.usdt && pinned?.usdc ? pinned : await getWallets(supabase);

  let result;
  try {
    result =
      asset === "USDT_TRC20"
        ? await checkTron({ txHash, wallet: wallets.usdt, order, expectedMilli })
        : await checkPolygon({ txHash, wallet: wallets.usdc, order, expectedMilli });
  } catch (err) {
    console.error("Verification error:", err);
    return json(200, { status: "pending", reason: "verification_error" });
  }

  if (result.status !== "confirmed") return json(200, result);

  // Claim the tx hash so it can never pay for a second order.
  const { error: claimErr } = await supabase.from("used_tx_hashes").insert({ tx_hash: txHash, order_id: String(orderId) });
  if (claimErr) {
    const { data: existing } = await supabase.from("used_tx_hashes").select("order_id").eq("tx_hash", txHash).maybeSingle();
    if (!existing || existing.order_id !== String(orderId)) {
      return json(409, { error: "This transaction was already used for another order" });
    }
  }

  const outcome = await finalizeOrder(supabase, order, { txHash, asset, received: result.received, verified_server: true });
  if (outcome.alreadyPaid) {
    const { data: fresh } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
    if (fresh?.status !== "paid") return json(409, { error: "Order is no longer payable" });
  }

  return json(200, { status: "paid" });
};
