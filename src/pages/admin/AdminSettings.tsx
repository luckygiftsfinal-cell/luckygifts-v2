import React, { useState } from "react";
import { Save, Globe, Shield, Bell, CreditCard, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "LuckyGifts",
    supportEmail: "support@luckygifts.ae",
    supportPhone: "+971 4 123 4567",
    currency: "AED",
    maintenanceMode: false,
    notifications: true,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  return (
    <div className="max-w-4xl space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Global Settings</h1>
        <p className="text-white/40">Configure your platform's general behavior, contact info, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs (Simulated) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFD700]/10 text-[#FFD700] font-bold text-sm text-left">
            <Globe size={18} /> General Info
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white font-bold text-sm text-left transition-all">
            <Shield size={18} /> Security & Auth
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white font-bold text-sm text-left transition-all">
            <CreditCard size={18} /> Payment Gateway
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white font-bold text-sm text-left transition-all">
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-8">
          {/* General Section */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 mb-2">
              <Globe className="text-[#FFD700]" size={20} /> Store Identity
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Site Name</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Primary Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="email" 
                      value={settings.supportEmail}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Support Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      value={settings.supportPhone}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => handleSave("General")}
                className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>

          {/* System Config Section */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 mb-2">
              <Shield className="text-[#FFD700]" size={20} /> System Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm text-white font-bold">Maintenance Mode</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Disable public access to the store</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-[#FF4500]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm text-white font-bold">Real-time Notifications</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Enable sound and toast for new orders</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? 'bg-[#00C853]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Lemon Squeezy Integration */}
          <div className="bg-[#0a0a0a] border border-[#FFD700]/20 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-3xl rounded-full" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 mb-2">
              <CreditCard className="text-[#FFD700]" size={20} /> Lemon Squeezy Integration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Store Checkout URL</label>
                <input 
                  type="text" 
                  placeholder="https://luckygifts.lemonsqueezy.com/checkout/buy/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors text-sm" 
                />
              </div>
              <div className="p-4 bg-[#FFD700]/5 border border-[#FFD700]/10 rounded-2xl">
                <p className="text-[10px] text-[#FFD700] font-black uppercase tracking-[0.2em] mb-2">💡 Integration Guide</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  To link your products, ensure the product IDs in the Admin Dashboard match your Lemon Squeezy variant IDs. The system will automatically use the Lemon Squeezy overlay for a secure checkout.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => handleSave("Lemon Squeezy")}
                className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Save size={18} /> Update Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
