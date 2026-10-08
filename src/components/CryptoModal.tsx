import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Copy, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type CryptoAsset = "USDT_TRC20" | "USDC_POLYGON";

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the TXID the customer pasted. The parent verifies it on the server. */
  onSubmit: (txHash: string, asset: CryptoAsset) => void;
  /** EXACT amount the customer must send, as returned by the server (e.g. "35.037"). */
  expectedAmount: string;
  /** Wallet addresses as returned by the server. */
  wallets: { usdt: string; usdc: string };
  isVerifying: boolean;
}

const HASH_FORMAT: Record<CryptoAsset, RegExp> = {
  USDT_TRC20: /^[0-9a-fA-F]{64}$/,
  USDC_POLYGON: /^0x[0-9a-fA-F]{64}$/,
};

export default function CryptoModal({ isOpen, onClose, onSubmit, expectedAmount, wallets, isVerifying }: CryptoModalProps) {
  const options: { id: CryptoAsset; coin: string; name: string; address: string; network: string; icon: string }[] = [
    { id: "USDT_TRC20", coin: "USDT", name: "USDT (TRC20)", address: wallets.usdt, network: "TRON (TRC20)", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    { id: "USDC_POLYGON", coin: "USDC", name: "USDC (Polygon)", address: wallets.usdc, network: "Polygon", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
  ];

  const [selectedId, setSelectedId] = useState<CryptoAsset>("USDT_TRC20");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState<"" | "address" | "amount">("");

  useEffect(() => {
    if (!isOpen) setTxHash("");
  }, [isOpen]);

  const selected = options.find((o) => o.id === selectedId)!;

  const copy = (text: string, what: "address" | "amount") => {
    navigator.clipboard.writeText(text);
    setCopied(what);
    toast.success(what === "address" ? "Address copied" : "Amount copied");
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hash = txHash.trim();
    if (!HASH_FORMAT[selectedId].test(hash)) {
      toast.error("Invalid Transaction Hash (TXID) for " + selected.name);
      return;
    }
    onSubmit(hash, selectedId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={isVerifying ? undefined : onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-[480px] max-h-[95vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#FFD700]/20 to-transparent p-6 border-b border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Pay with Crypto</h3>
                  <p className="text-[10px] text-[#FFD700] font-bold uppercase tracking-[0.2em]">Verified automatically on-chain</p>
                </div>
                <button onClick={onClose} disabled={isVerifying} className="text-white/40 hover:text-white transition-colors disabled:opacity-30"><X size={24} /></button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {options.map((o) => (
                  <button key={o.id} type="button" disabled={isVerifying} onClick={() => setSelectedId(o.id)}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 disabled:opacity-60 ${selectedId === o.id ? "bg-[#FFD700]/10 border-[#FFD700]" : "bg-white/5 border-white/5 hover:border-white/20"}`}>
                    <img src={o.icon} alt={o.name} className="w-8 h-8 rounded-full" />
                    <span className="text-[10px] font-black text-white uppercase">{o.name}</span>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 text-center border border-[#FFD700]/30">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Send exactly</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-3xl font-black text-[#FFD700]">{expectedAmount} {selected.coin}</div>
                  <button type="button" onClick={() => copy(expectedAmount, "amount")} className="text-[#FFD700] hover:scale-110 transition-transform">
                    {copied === "amount" ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-2 leading-relaxed">
                  The last decimals identify your order. The amount must match exactly, and network fees must be paid on top by you.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl p-3">
                <AlertTriangle size={16} className="text-[#FFD700] shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Send only <b>{selected.name}</b> on the <b>{selected.network}</b> network. Other coins or networks cannot be recovered.
                </p>
              </div>

              <div className="bg-black border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{selected.network} Address</span>
                  <button type="button" onClick={() => copy(selected.address, "address")} className="text-[#FFD700] hover:scale-110 transition-transform">
                    {copied === "address" ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-sm font-mono text-white break-all pr-8">{selected.address}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Transaction Hash (TXID) — after sending</label>
                  <input required disabled={isVerifying} type="text" placeholder="Paste your transaction ID here..." value={txHash} onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#FFD700]/50 outline-none transition-all placeholder:text-white/20 disabled:opacity-60" />
                </div>
                <button type="submit" disabled={isVerifying} className="w-full bg-[#FFD700] hover:bg-[#f0d060] text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isVerifying ? <><Loader2 size={18} className="animate-spin" /> Verifying on-chain...</> : <><CheckCircle size={18} /> Verify Payment</>}
                </button>
              </form>
            </div>

            <div className="bg-white/5 p-4 text-center border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <Shield size={12} /> Payments are verified on the blockchain
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
