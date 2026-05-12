import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ChevronRight, X } from "lucide-react";

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: string;
}

export default function PayPalModal({ isOpen, onClose, onSuccess, amount }: PayPalModalProps) {
  const [step, setStep] = useState(1); // 1: Login, 2: Review, 3: Processing
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePay = () => {
    setStep(3);
    setTimeout(() => {
      onSuccess();
    }, 2000);
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[400px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]"
          >
            {/* PayPal Header */}
            <div className="bg-[#003087] p-6 flex flex-col items-center">
              <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="h-10 mb-2 brightness-0 invert" />
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} />
                Secure Checkout
              </div>
            </div>

            <div className="flex-1 p-8">
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-[#2c2e2f] text-center">Pay with PayPal</h3>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <input 
                        required
                        type="email" 
                        placeholder="Email or mobile number"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <input 
                        required
                        type="password" 
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] outline-none transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-4 rounded-full transition-colors">
                      Log In
                    </button>
                    <div className="text-center">
                      <a href="#" className="text-sm font-bold text-[#0070ba] hover:underline">Forgot password?</a>
                    </div>
                  </form>
                  <div className="relative flex items-center justify-center py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <span className="relative px-4 bg-white text-gray-500 text-xs">or</span>
                  </div>
                  <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-full transition-colors">
                    Create an Account
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Ship to</div>
                    <div className="text-sm font-bold text-gray-900">John Doe ...</div>
                  </div>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600 font-bold uppercase tracking-widest">Amount to Pay</div>
                      <div className="text-xl font-black text-[#003087]">{amount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-6 bg-[#003087] rounded flex items-center justify-center text-white text-[8px] font-bold italic">PayPal</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">PayPal Balance</p>
                        <p className="text-[10px] text-gray-500">Available: $2,450.00</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePay}
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    Complete Purchase
                    <ChevronRight size={18} />
                  </button>
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    By clicking Complete Purchase, you agree to PayPal's User Agreement and Privacy Statement.
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-16 h-16 border-4 border-[#0070ba] border-t-transparent rounded-full animate-spin" />
                  <p className="font-bold text-gray-700">Authorizing payment...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                <Shield size={12} />
                PayPal Baisc Protection
              </div>
              <div className="w-[1px] h-3 bg-gray-200" />
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                English | Arabic
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
