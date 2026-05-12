import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Mail, Lock, User, ArrowRight, Loader2, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { isModalOpen, setModalOpen, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "register" && (!name || !phone))) return;
    
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email);
      } else {
        await register(name, email, phone);
      }
      
      // Auto-redirect admin to dashboard
      if (email.toLowerCase() === "admin@luckygifts.com") {
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setModalOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.1)] overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
          >
            <X size={16} />
          </button>

          {/* Golden Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-white/40 text-sm font-medium">
                {mode === "login" ? "Enter your details to access your account." : "Join LuckyGifts and start winning today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === "login" && (
                <div className="text-right">
                  <a href="#" className="text-xs text-[#FFD700] hover:text-white transition-colors">Forgot Password?</a>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-[#FFD700] hover:bg-[#e6c200] text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    {mode === "login" ? "Sign In" : "Sign Up"} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-sm text-white/40">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setName("");
                    setEmail("");
                    setPassword("");
                  }} 
                  className="ml-2 text-[#FFD700] font-bold hover:text-white transition-colors"
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
