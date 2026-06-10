import { useState } from "react";
import { Shield, Lock, X, AlertCircle } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { motion, AnimatePresence } from "framer-motion";

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (captureDetails: PayPalCaptureDetails) => void;
  amount: string;
}

export interface PayPalCaptureDetails {
  captureID: string;
  capturedAmount: number;
  capturedCurrency: string;
  payerEmail: string;
  payerName: string;
  paypalOrderID: string;
}

export default function PayPalModal({ isOpen, onClose, onSuccess, amount }: PayPalModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const numericAmount = amount.replace(/[^0-9.]/g, "");

  const handleApprove = async (data: { orderID: string }) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch("/.netlify/functions/verify-paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID:        data.orderID,
          expectedAmount: numericAmount,
          currency:       "USD",
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Payment verification failed");
      onSuccess({
        captureID:        result.captureID,
        capturedAmount:   result.capturedAmount,
        capturedCurrency: result.capturedCurrency,
        payerEmail:       result.payerEmail,
        payerName:        result.payerName,
        paypalOrderID:    result.paypalOrderID,
      });
    } catch (err: any) {
      setVerifyError(err.message || "Verification failed. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  const createOrder = (_data: any, actions: any) =>
    actions.order.create({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: numericAmount },
      }],
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isVerifying ? onClose : undefined}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="bg-[#003087] p-6 flex flex-col items-center shrink-0">
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                alt="PayPal"
                className="h-10 mb-2 brightness-0 invert"
              />
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} />
                Secure Checkout
              </div>
            </div>

            <div className="flex-1 p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-[#2c2e2f] mb-1">Complete Your Purchase</h3>
                <p className="text-sm text-gray-500 italic">
                  Total Amount:{" "}
                  <span className="text-[#003087] font-black">{amount}</span>
                </p>
              </div>

              {verifyError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-medium">{verifyError}</p>
                </div>
              )}

              {isVerifying ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10">
                  <div className="w-10 h-10 border-4 border-[#003087]/20 border-t-[#003087] rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Verifying payment…</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* PayPal button — opens PayPal in new tab */}
                  <PayPalButtons
                    style={{ layout: "horizontal", color: "gold", shape: "pill", label: "paypal", height: 48, tagline: false }}
                    forceReRender={[numericAmount]}
                    fundingSource="paypal"
                    createOrder={createOrder}
                    onApprove={(data) => handleApprove(data)}
                    onCancel={() => setVerifyError(null)}
                    onError={() => setVerifyError("PayPal encountered an error. Please try again.")}
                  />

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Card button */}
                  <PayPalButtons
                    style={{ layout: "horizontal", color: "black", shape: "pill", label: "pay", height: 48, tagline: false }}
                    forceReRender={[numericAmount]}
                    fundingSource="card"
                    createOrder={createOrder}
                    onApprove={(data) => handleApprove(data)}
                    onCancel={() => setVerifyError(null)}
                    onError={() => setVerifyError("Card payment failed. Please try again.")}
                  />
                </div>
              )}

              <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-6">
                Your payment is secure and encrypted.<br />
                By proceeding, you agree to PayPal's terms.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 flex items-center justify-center gap-6 shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                <Shield size={12} />
                PayPal Buyer Protection
              </div>
              <div className="w-[1px] h-3 bg-gray-200" />
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                English | Arabic
              </div>
            </div>

            {!isVerifying && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
