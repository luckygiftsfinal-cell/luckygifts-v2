import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, X, Copy, CheckCircle, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  amount: string;
}

const WALLETS = [
  { name: "USDT (TRC20)", address: "TEcCaGi7z51v4taCHDu1paQd1zDDN5u3Es", network: "TRON", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  { name: "Bitcoin (BTC)", address: "bc1pcevr5z4ue43un5utj6alwez9htrxm35szt00uap9hk0j6f7gpkwqcdzvhq", network: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
  { name: "Ethereum (ETH)", address: "0x059331956f319F4895D176F9CC8F6c79a76E2EDe", network: "ERC20", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png" }
];

export default function CryptoModal({ isOpen, onClose, onSuccess, amount }: CryptoModalProps) {
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txHash.length < 10) {
      toast.error("Please enter a valid Transaction Hash (TXID)");
      return;
    }
    onSuccess(txHash);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[480px] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FFD700]/20 to-transparent p-6 border-b border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Crypto Payment</h3>
                  <p className="text-[10px] text-[#FFD700] font-bold uppercase tracking-[0.2em]">Secure Blockchain Transaction</p>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Amount Display */}
              <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total to Send</p>
                <div className="text-3xl font-black text-[#FFD700]">{amount}</div>
              </div>

              {/* Wallet Selection */}
              <div className="grid grid-cols-3 gap-3">
                {WALLETS.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      selectedWallet.name === wallet.name 
                      ? "bg-[#FFD700]/10 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.1)]" 
                      : "bg-white/5 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-full" />
                    <span className="text-[10px] font-black text-white uppercase">{wallet.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Address Display */}
              <div className="space-y-4">
                <div className="bg-black border border-white/5 rounded-2xl p-4 relative group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{selectedWallet.network} Address</span>
                    <button 
                      onClick={() => copyToClipboard(selectedWallet.address)}
                      className="text-[#FFD700] hover:scale-110 transition-transform"
                    >
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-sm font-mono text-white break-all pr-8">{selectedWallet.address}</p>
                </div>

                <div className="flex items-center justify-center p-4 bg-white rounded-2xl w-32 h-32 mx-auto">
                   {/* In a real app, generate QR code from selectedWallet.address */}
                   <QrCode size={100} className="text-black" />
                </div>
              </div>

              {/* Confirmation Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Transaction Hash (TXID)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Paste your transaction ID here..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#FFD700]/50 outline-none transition-all placeholder:text-white/20"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#FFD700] hover:bg-[#f0d060] text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
                >
                  <CheckCircle size={18} />
                  Confirm Payment
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 text-center border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <Shield size={12} />
                Payments are verified manually by our team
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
