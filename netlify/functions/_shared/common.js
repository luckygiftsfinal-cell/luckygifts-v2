// netlify/functions/_shared/common.js
// Shared helpers for the direct-wallet crypto payment functions.
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// Used only when no wallet list has been saved yet (first run).
const DEFAULT_WALLETS = {
  usdt: "TEcCaGi7z51v4taCHDu1paQd1zDDN5u3Es", // TRON (TRC20)
  usdc: "0x0F07a118f607FeE58C21d0C803BE5E121CF2f636", // Polygon
};

// Supported payment assets. Verification logic exists for exactly these two.
const ASSETS = {
  USDT_TRC20: { key: "usdt", name: "USDT (TRC20)", network: "TRON (TRC20)" },
  USDC_POLYGON: { key: "usdc", name: "USDC (Polygon)", network: "Polygon" },
};

const WALLETS_KEY = "crypto_wallets_v2"; // app_settings key holding the JSON array of wallets

const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Returns the authenticated Supabase user for the Bearer token, or null.
async function authUser(supabase, event) {
  const h = event.headers || {};
  const token = (h.authorization || h.Authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await supabase.auth.getUser(token);
  return data?.user || null;
}

// Admin check lives in ONE place. Adjust here if your project marks admins differently.
// Accepts: profiles.role = 'admin' | 'super_admin', profiles.is_admin = true, or an email in ADMIN_EMAILS.
async function requireAdmin(supabase, event) {
  const user = await authUser(supabase, event);
  if (!user) return { user: null, isAdmin: false };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const role = String(profile?.role || "").toLowerCase();
  const emails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    profile?.is_admin === true ||
    (!!user.email && emails.includes(user.email.toLowerCase()));

  return { user, isAdmin };
}

// ── Address validation (prevents sending customers to a mistyped address) ──
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function isValidTronAddress(addr) {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)) return false;
  let num = 0n;
  for (const c of addr) num = num * 58n + BigInt(B58.indexOf(c));
  const hex = num.toString(16).padStart(50, "0");
  if (hex.length !== 50) return false;
  const bytes = Buffer.from(hex, "hex");
  const payload = bytes.subarray(0, 21);
  const check = bytes.subarray(21);
  const h = crypto.createHash("sha256").update(crypto.createHash("sha256").update(payload).digest()).digest();
  return bytes[0] === 0x41 && h.subarray(0, 4).equals(check); // 0x41 = TRON mainnet prefix + base58check
}

function isValidAddress(asset, addr) {
  if (asset === "USDT_TRC20") return isValidTronAddress(addr);
  if (asset === "USDC_POLYGON") return /^0x[0-9a-fA-F]{40}$/.test(addr);
  return false;
}

// ── Wallet list stored in app_settings (key crypto_wallets_v2) ──
async function readWalletList(supabase) {
  const { data } = await supabase.from("app_settings").select("value").eq("key", WALLETS_KEY).maybeSingle();
  if (data?.value) {
    try {
      const list = JSON.parse(data.value);
      if (Array.isArray(list)) return list;
    } catch {
      /* fall through to seed */
    }
  }
  // First run: seed from the old {usdt, usdc} setting (or the defaults)
  let legacy = { ...DEFAULT_WALLETS };
  const { data: old } = await supabase.from("app_settings").select("value").eq("key", "crypto_wallets").maybeSingle();
  if (old?.value) {
    try {
      const saved = JSON.parse(old.value);
      legacy = { usdt: saved.usdt || legacy.usdt, usdc: saved.usdc || legacy.usdc };
    } catch {
      /* keep defaults */
    }
  }
  return [
    { id: "legacy-usdt", asset: "USDT_TRC20", address: legacy.usdt, label: "Main USDT", active: true, created_at: null },
    { id: "legacy-usdc", asset: "USDC_POLYGON", address: legacy.usdc, label: "Main USDC", active: true, created_at: null },
  ];
}

async function saveWalletList(supabase, list) {
  const value = JSON.stringify(list);
  const { data: existing } = await supabase.from("app_settings").select("key").eq("key", WALLETS_KEY).maybeSingle();
  const res = existing
    ? await supabase.from("app_settings").update({ value }).eq("key", WALLETS_KEY)
    : await supabase.from("app_settings").insert({ key: WALLETS_KEY, value });
  return !res.error;
}

// Picks one active wallet per asset (random → spreads incoming funds across wallets).
// The chosen addresses are stored ON THE ORDER, so later deleting/disabling a wallet never breaks open orders.
async function pickWallets(supabase) {
  const list = await readWalletList(supabase);
  const pick = (asset) => {
    const active = list.filter((w) => w.asset === asset && w.active);
    return active.length ? active[crypto.randomInt(active.length)].address : null;
  };
  const usdt = pick("USDT_TRC20");
  const usdc = pick("USDC_POLYGON");
  if (!usdt || !usdc) return null;
  return { usdt, usdc };
}

// Fallback for orders created before wallets were stored on the order.
async function getWallets(supabase) {
  const list = await readWalletList(supabase);
  const first = (asset, fallback) => list.find((w) => w.asset === asset && w.active)?.address || fallback;
  return { usdt: first("USDT_TRC20", DEFAULT_WALLETS.usdt), usdc: first("USDC_POLYGON", DEFAULT_WALLETS.usdc) };
}

module.exports = {
  DEFAULT_WALLETS,
  ASSETS,
  json,
  getSupabase,
  authUser,
  requireAdmin,
  isValidAddress,
  isValidTronAddress,
  readWalletList,
  saveWalletList,
  pickWallets,
  getWallets,
};
