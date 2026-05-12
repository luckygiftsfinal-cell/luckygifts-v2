import { Shield, Lock, X } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { motion, AnimatePresence } from "framer-motion";

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: string;
}

export default function PayPalModal({ isOpen, onClose, onSuccess, amount }: PayPalModalProps) {
  // Extract numeric value from amount string (e.g., "$100.00" -> "100.00")
  const numericAmount = amount.replace(/[^0-9.]/g, '');

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
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-[#2c2e2f] mb-1">Complete Your Purchase</h3>
                <p className="text-sm text-gray-500 italic">Total Amount: <span className="text-[#003087] font-black">{amount}</span></p>
              </div>

              <div className="space-y-4">
                <PayPalButtons 
                  style={{ 
                    layout: "vertical",
                    color: "gold",
                    shape: "pill",
                    label: "paypal"
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "USD",
                            value: numericAmount,
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    if (actions.order) {
                      return actions.order.capture().then((details) => {
                        onSuccess();
                      });
                    }
                    return Promise.resolve();
                  }}
                  onCancel={() => {
                    // Handle cancel
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                  }}
                />
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-6">
                Your payment is secure and encrypted. <br /> By proceeding, you agree to PayPal's terms.
              </p>
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
