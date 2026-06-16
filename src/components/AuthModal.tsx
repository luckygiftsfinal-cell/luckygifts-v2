import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User, Phone, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { COUNTRY_PHONE_CODES, getDialCodeByCountry } from "../data/countryPhoneCodes";

export default function AuthModal() {
  const { isModalOpen, setModalOpen, mode, setMode, login, register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "AE",
    dialCode: "+971",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Update dial code when country changes
  useEffect(() => {
    const dialCode = getDialCodeByCountry(form.country);
    setForm(prev => ({ ...prev, dialCode }));
  }, [form.country]);

  const selectedCountry = COUNTRY_PHONE_CODES.find(c => c.code === form.country);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === "register" && !form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (mode === "register") {
      if (!form.phone.trim()) newErrors.phone = "Phone is required";
      else if (!/^\d{7,15}$/.test(form.phone.replace(/\D/g, ""))) newErrors.phone = "Invalid phone number";
    }
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (mode === "register" && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (mode === "register" && !form.agreeTerms) {
      newErrors.agreeTerms = "You must agree to terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "login") {
      // ✅ Login only needs email and password
      await login(form.email, form.password);
    } else {
      // ✅ Register needs all fields including country
      const fullPhone = `${form.dialCode} ${form.phone}`;
      await register(form.name, form.email, fullPhone, form.password, form.country);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    // Reset form when switching
    setForm({
      name: "",
      email: "",
      phone: "",
      country: "AE",
      dialCode: "+971",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#12121a] z-10">
          <h2 className="text-xl font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-[#64748b]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name - Register only */}
          {mode === "register" && (
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="text"
                  className={`form-input pl-10 ${errors.name ? "border-red-500/50" : ""}`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="email"
                className={`form-input pl-10 ${errors.email ? "border-red-500/50" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Country & Phone - Register only */}
          {mode === "register" && (
            <div>
              <label className="form-label">Phone Number</label>
              <div className="flex gap-2">
                {/* Country Selector */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="form-input flex items-center gap-2 px-3 py-2.5 min-w-[120px] cursor-pointer"
                  >
                    <span className="text-lg">{selectedCountry?.flag}</span>
                    <span className="text-sm text-white font-bold">{form.dialCode}</span>
                    <ChevronDown size={14} className="text-[#64748b] ml-auto" />
                  </button>

                  {/* Country Dropdown */}
                  <AnimatePresence>
                    {countryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-72 max-h-64 overflow-y-auto bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50"
                      >
                        <div className="p-2">
                          <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest px-3 py-2">
                            Select Country
                          </div>
                          {COUNTRY_PHONE_CODES.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, country: country.code });
                                setCountryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                form.country === country.code
                                  ? "bg-[#FFD700]/10 text-[#FFD700]"
                                  : "text-white hover:bg-white/5"
                              }`}
                            >
                              <span className="text-xl">{country.flag}</span>
                              <span className="text-sm flex-1">{country.name}</span>
                              <span className="text-sm font-bold text-[#64748b]">{country.dialCode}</span>
                              {form.country === country.code && (
                                <Check size={14} className="text-[#FFD700]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone Input */}
                <div className="flex-1 relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="tel"
                    className={`form-input pl-10 ${errors.phone ? "border-red-500/50" : ""}`}
                    placeholder="50 123 4567"
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, phone: digits });
                    }}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              <p className="text-[10px] text-[#64748b] mt-1">
                {selectedCountry?.flag} {selectedCountry?.name} ({form.dialCode})
              </p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input pl-10 pr-10 ${errors.password ? "border-red-500/50" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password - Register only */}
          {mode === "register" && (
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-input pl-10 pr-10 ${errors.confirmPassword ? "border-red-500/50" : ""}`}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Terms - Register only */}
          {mode === "register" && (
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, agreeTerms: !form.agreeTerms })}
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    form.agreeTerms
                      ? "bg-[#FFD700] border-[#FFD700]"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {form.agreeTerms && <Check size={12} className="text-black" />}
                </div>
                <span className="text-sm text-white/60">
                  I agree to the{" "}
                  <a href="/terms" className="text-[#FFD700] hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-[#FFD700] hover:underline">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeTerms && <p className="text-red-400 text-xs mt-1">{errors.agreeTerms}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base font-black flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 text-center">
          <p className="text-sm text-white/60">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-[#FFD700] font-bold hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
