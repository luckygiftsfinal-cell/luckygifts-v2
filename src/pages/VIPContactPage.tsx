import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, Send, CheckCircle } from "lucide-react";
import SEO from "../components/SEO";

const COUNTRIES = [
  "United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman",
  "Egypt", "Jordan", "Lebanon", "Iraq", "United Kingdom", "United States",
  "Canada", "Australia", "Germany", "France", "India", "Pakistan", "Other"
];

export default function VIPContactPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageName = searchParams.get("package") || "VIP Package";
  const packagePrice = searchParams.get("price") || "";

  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.country) newErrors.country = "Please select your country";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    // Use window.open to avoid navigating away from the page
    const subject = encodeURIComponent(`VIP Membership Interest - ${packageName}`);
    const body = encodeURIComponent(
      `New VIP Membership Inquiry\n\n` +
      `Package: ${packageName}${packagePrice ? ` ($${packagePrice})` : ""}\n` +
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone}\n` +
      `Country: ${form.country}`
    );
    window.open(`mailto:vipmember@getluckygifts.shop?subject=${subject}&body=${body}`);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: errors[field] ? "1px solid #ef4444" : "1px solid rgba(255,215,0,0.2)",
    borderRadius: 12,
    padding: "14px 16px 14px 48px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "'Outfit', sans-serif",
  });

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", padding: 40 }}
        >
          <CheckCircle size={80} color="#FFD700" style={{ margin: "0 auto 24px" }} />
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 12 }}>Message Sent!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32 }}>
            We'll get back to you at <span style={{ color: "#FFD700" }}>{form.email}</span> shortly.
          </p>
          <button
            onClick={() => navigate("/vip")}
            style={{ background: "#FFD700", color: "#000", fontWeight: 900, padding: "14px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15 }}
          >
            Back to VIP
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(to bottom, rgba(5,5,5,0.6), rgba(5,5,5,0.95)), url('/images/hero-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "120px 16px 60px",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <SEO
        title="Contact VIP — LuckyGifts"
        description="Join the VIP membership at LuckyGifts. Fill in your details and we'll be in touch."
        url="/vip-contact"
        keywords="VIP membership contact, luxury draw UAE"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(10,10,10,0.9)",
          border: "1px solid rgba(255,215,0,0.3)",
          borderRadius: 28,
          padding: "48px 40px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
            VIP Membership
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Join {packageName}
          </h1>
          {packagePrice && (
            <div style={{ display: "inline-block", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "6px 16px", marginTop: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>${packagePrice}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginLeft: 4 }}>/ one-time</span>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name */}
          <div style={{ position: "relative" }}>
            <User size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
              style={inputStyle("name")}
            />
            {errors.name && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)", pointerEvents: "none" }} />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
              style={inputStyle("email")}
            />
            {errors.email && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div style={{ position: "relative" }}>
            <Phone size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)", pointerEvents: "none" }} />
            <input
              type="tel"
              placeholder="Phone Number (e.g. +971 50 000 0000)"
              value={form.phone}
              onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
              style={inputStyle("phone")}
            />
            {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
          </div>

          {/* Country */}
          <div style={{ position: "relative" }}>
            <Globe size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)", pointerEvents: "none", zIndex: 1 }} />
            <select
              value={form.country}
              onChange={e => { setForm({ ...form, country: e.target.value }); setErrors({ ...errors, country: "" }); }}
              style={{ ...inputStyle("country"), appearance: "none", cursor: "pointer" }}
            >
              <option value="" disabled style={{ background: "#111" }}>Select Country</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c} style={{ background: "#111" }}>{c}</option>
              ))}
            </select>
            {errors.country && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.country}</p>}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "rgba(255,215,0,0.5)" : "#FFD700",
              color: "#000",
              fontWeight: 900,
              fontSize: 16,
              padding: "16px",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 8,
              transition: "all 0.2s",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <Send size={18} />
            {loading ? "Sending..." : "Send Message"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            We'll contact you within 24 hours at <span style={{ color: "#FFD700" }}>vipmember@getluckygifts.shop</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
