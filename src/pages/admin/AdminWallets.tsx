import { useEffect, useState, useCallback } from "react";
import { Wallet, Plus, Trash2, Copy, Loader2, Power } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

type Asset = "USDT_TRC20" | "USDC_POLYGON";

interface WalletRow {
  id: string;
  asset: Asset;
  address: string;
  label: string;
  active: boolean;
  created_at: string | null;
  open_orders: number;
}

const ASSET_INFO: Record<Asset, { name: string; network: string; hint: string }> = {
  USDT_TRC20: { name: "USDT", network: "TRON (TRC20)", hint: "T... (34 characters)" },
  USDC_POLYGON: { name: "USDC", network: "Polygon", hint: "0x... (42 characters)" },
};

export default function AdminWallets() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ asset: Asset; label: string; address: string }>({
    asset: "USDT_TRC20",
    label: "",
    address: "",
  });

  const call = useCallback(async (method: "GET" | "POST", body?: object) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Please sign in again");
    const res = await fetch("/.netlify/functions/admin-wallets", {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json.wallets as WalletRow[];
  }, []);

  useEffect(() => {
    call("GET")
      .then(setWallets)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [call]);

  const run = async (body: object, success: string) => {
    setBusy(true);
    try {
      setWallets(await call("POST", body));
      toast.success(success);
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(
      { action: "add", asset: form.asset, label: form.label, address: form.address.trim() },
      "Wallet added"
    );
    if (ok) setForm({ ...form, label: "", address: "" });
  };

  const handleDelete = (w: WalletRow) => {
    const extra = w.open_orders > 0 ? `\n\n${w.open_orders} open order(s) are waiting for a payment to this wallet. They will still be verified against it.` : "";
    if (!window.confirm(`Delete this ${ASSET_INFO[w.asset].name} wallet?\n${w.address}${extra}`)) return;
    run({ action: "delete", id: w.id }, "Wallet deleted");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied");
  };

  return (
    <div className="space-y-8">
      <div className="admin-header">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Wallet className="w-6 h-6 text-gold" /> Crypto Wallets
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Wallets that receive customer payments. For each new order, one active wallet per coin is picked at random and
          shown to the customer. Orders keep the wallet they were given, even if you disable or delete it later.
        </p>
      </div>

      {/* Add */}
      <div className="admin-card">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gold" /> Add wallet
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="form-label">Coin / Network</label>
            <select
              className="form-input"
              value={form.asset}
              onChange={(e) => setForm({ ...form, asset: e.target.value as Asset })}
            >
              {(Object.keys(ASSET_INFO) as Asset[]).map((a) => (
                <option key={a} value={a}>
                  {ASSET_INFO[a].name} — {ASSET_INFO[a].network}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Label (optional)</label>
            <input
              className="form-input"
              placeholder="e.g. Binance deposit"
              maxLength={40}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <input
              required
              className="form-input font-mono"
              placeholder={ASSET_INFO[form.asset].hint}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Double-check the address and network. Funds sent to a wrong or unsupported address cannot be recovered.
            </p>
            <button type="submit" disabled={busy} className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add wallet
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="admin-card">
        <h3 className="section-title mb-4">Wallets</h3>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Label</th>
                  <th>Address</th>
                  <th>Open orders</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w) => (
                  <tr key={w.id} className={w.active ? "" : "opacity-50"}>
                    <td>
                      <span className="font-bold text-white">{ASSET_INFO[w.asset].name}</span>
                      <span className="block text-[10px] text-slate-500">{ASSET_INFO[w.asset].network}</span>
                    </td>
                    <td>{w.label}</td>
                    <td>
                      <button onClick={() => copy(w.address)} className="font-mono text-xs text-slate-300 hover:text-gold flex items-center gap-2 text-left break-all" title="Copy">
                        {w.address} <Copy className="w-3 h-3 shrink-0" />
                      </button>
                    </td>
                    <td>{w.open_orders}</td>
                    <td>
                      <button
                        disabled={busy}
                        onClick={() => run({ action: "toggle", id: w.id, active: !w.active }, w.active ? "Wallet disabled" : "Wallet enabled")}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${w.active ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-slate-400 border-white/10"}`}
                      >
                        <Power className="w-3 h-3" /> {w.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="text-right">
                      <button disabled={busy} onClick={() => handleDelete(w)} className="text-white/30 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {wallets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-8">No wallets yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
