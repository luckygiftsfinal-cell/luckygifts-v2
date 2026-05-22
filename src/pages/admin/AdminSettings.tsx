import { useState, useEffect } from "react";
import {
  Settings, Bell, Lock, Globe, CreditCard, Shield, Save, Loader2,
  RefreshCw, Key, Wallet, Mail, Phone, MapPin
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface AppSettings {
  // General
  site_name: string;
  contact_email: string;
  currency: string;

  // PayPal
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_secret: string;
  paypal_mode: string;

  // Stripe
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;

  // Crypto
  btc_enabled: boolean;
  btc_address: string;
  eth_enabled: boolean;
  eth_address: string;
  usdt_trc20_enabled: boolean;
  usdt_trc20_address: string;
  usdt_erc20_enabled: boolean;
  usdt_erc20_address: string;

  // Connect / Footer
  footer_email: string;
  footer_phone: string;
  footer_location: string;

  // Security
  two_factor_enabled: boolean;
  email_notifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  site_name: "LuckyGifts",
  contact_email: "support@getluckygifts.shop",
  currency: "USD",

  paypal_enabled: true,
  paypal_client_id: "",
  paypal_secret: "",
  paypal_mode: "sandbox",

  stripe_enabled: false,
  stripe_publishable_key: "",
  stripe_secret_key: "",

  btc_enabled: false,
  btc_address: "",
  eth_enabled: false,
  eth_address: "",
  usdt_trc20_enabled: false,
  usdt_trc20_address: "",
  usdt_erc20_enabled: false,
  usdt_erc20_address: "",

  footer_email: "support@getluckygifts.shop",
  footer_phone: "+971 50 000 0000",
  footer_location: "Dubai, United Arab Emirates",

  two_factor_enabled: false,
  email_notifications: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value");

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Partial<AppSettings> = {};
        data.forEach((row: any) => {
          const key = row.key as keyof AppSettings;
          if (key in DEFAULT_SETTINGS) {
            if (row.value === "true" || row.value === "false") {
              mapped[key] = row.value === "true";
            } else {
              mapped[key] = row.value;
            }
          }
        });
        setSettings({ ...DEFAULT_SETTINGS, ...mapped });
      }
    } catch (error: any) {
      toast.error("Failed to load settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString(),
      }));

      const { error } = await supabase
        .from("app_settings")
        .upsert(entries, { onConflict: "key" });

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[#64748b] mt-1">Manage your platform settings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchSettings()} className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <Settings size={20} className="text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">General Settings</h3>
              <p className="text-xs text-[#64748b]">Basic platform configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Site Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => updateSetting("site_name", e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => updateSetting("contact_email", e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting("currency", e.target.value)}
                className="form-input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PayPal Settings */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#003087]/30 flex items-center justify-center">
              <CreditCard size={20} className="text-[#0070E0]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">PayPal</h3>
              <p className="text-xs text-[#64748b]">Configure PayPal payments</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-white">Enable PayPal</span>
              <button
                onClick={() => updateSetting("paypal_enabled", !settings.paypal_enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.paypal_enabled ? "bg-[#10B981]" : "bg-white/10"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.paypal_enabled ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

            {settings.paypal_enabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="form-label">Client ID</label>
                  <input
                    type="text"
                    value={settings.paypal_client_id}
                    onChange={(e) => updateSetting("paypal_client_id", e.target.value)}
                    placeholder="Ae..."
                    className="form-input font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Secret Key</label>
                  <input
                    type="password"
                    value={settings.paypal_secret}
                    onChange={(e) => updateSetting("paypal_secret", e.target.value)}
                    placeholder="••••••••"
                    className="form-input font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Mode</label>
                  <select
                    value={settings.paypal_mode}
                    onChange={(e) => updateSetting("paypal_mode", e.target.value)}
                    className="form-input"
                  >
                    <option value="sandbox">Sandbox (Test)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stripe Settings */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF]/20 flex items-center justify-center">
              <CreditCard size={20} className="text-[#635BFF]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Stripe</h3>
              <p className="text-xs text-[#64748b]">Configure Stripe payments</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-white">Enable Stripe</span>
              <button
                onClick={() => updateSetting("stripe_enabled", !settings.stripe_enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.stripe_enabled ? "bg-[#10B981]" : "bg-white/10"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.stripe_enabled ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

            {settings.stripe_enabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="form-label">Publishable Key</label>
                  <input
                    type="text"
                    value={settings.stripe_publishable_key}
                    onChange={(e) => updateSetting("stripe_publishable_key", e.target.value)}
                    placeholder="pk_test_..."
                    className="form-input font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Secret Key</label>
                  <input
                    type="password"
                    value={settings.stripe_secret_key}
                    onChange={(e) => updateSetting("stripe_secret_key", e.target.value)}
                    placeholder="sk_test_..."
                    className="form-input font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crypto Wallets */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
              <Wallet size={20} className="text-[#FFD700]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Crypto Wallets</h3>
              <p className="text-xs text-[#64748b]">Configure crypto addresses</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* BTC */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#F7931A]" />
                  <span className="text-sm text-white font-medium">Bitcoin (BTC)</span>
                </div>
                <button
                  onClick={() => updateSetting("btc_enabled", !settings.btc_enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.btc_enabled ? "bg-[#10B981]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.btc_enabled ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
              {settings.btc_enabled && (
                <input
                  type="text"
                  value={settings.btc_address}
                  onChange={(e) => updateSetting("btc_address", e.target.value)}
                  placeholder="bc1q..."
                  className="form-input font-mono text-sm mt-2"
                />
              )}
            </div>

            {/* ETH */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#627EEA]" />
                  <span className="text-sm text-white font-medium">Ethereum (ETH)</span>
                </div>
                <button
                  onClick={() => updateSetting("eth_enabled", !settings.eth_enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.eth_enabled ? "bg-[#10B981]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.eth_enabled ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
              {settings.eth_enabled && (
                <input
                  type="text"
                  value={settings.eth_address}
                  onChange={(e) => updateSetting("eth_address", e.target.value)}
                  placeholder="0x..."
                  className="form-input font-mono text-sm mt-2"
                />
              )}
            </div>

            {/* USDT TRC20 */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#26A17B]" />
                  <span className="text-sm text-white font-medium">USDT (TRC20)</span>
                </div>
                <button
                  onClick={() => updateSetting("usdt_trc20_enabled", !settings.usdt_trc20_enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.usdt_trc20_enabled ? "bg-[#10B981]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.usdt_trc20_enabled ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
              {settings.usdt_trc20_enabled && (
                <input
                  type="text"
                  value={settings.usdt_trc20_address}
                  onChange={(e) => updateSetting("usdt_trc20_address", e.target.value)}
                  placeholder="TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="form-input font-mono text-sm mt-2"
                />
              )}
            </div>

            {/* USDT ERC20 */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#26A17B]" />
                  <span className="text-sm text-white font-medium">USDT (ERC20)</span>
                </div>
                <button
                  onClick={() => updateSetting("usdt_erc20_enabled", !settings.usdt_erc20_enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.usdt_erc20_enabled ? "bg-[#10B981]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.usdt_erc20_enabled ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
              {settings.usdt_erc20_enabled && (
                <input
                  type="text"
                  value={settings.usdt_erc20_address}
                  onChange={(e) => updateSetting("usdt_erc20_address", e.target.value)}
                  placeholder="0x..."
                  className="form-input font-mono text-sm mt-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Connect / Footer Contact Info */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
              <Mail size={20} className="text-[#FFD700]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Connect (Footer)</h3>
              <p className="text-xs text-[#64748b]">Contact info shown in the website footer</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-2">
                <Mail size={13} className="text-[#94a3b8]" /> Support Email
              </label>
              <input
                type="email"
                value={settings.footer_email}
                onChange={(e) => updateSetting("footer_email", e.target.value)}
                placeholder="support@example.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label flex items-center gap-2">
                <Phone size={13} className="text-[#94a3b8]" /> Phone Number
              </label>
              <input
                type="text"
                value={settings.footer_phone}
                onChange={(e) => updateSetting("footer_phone", e.target.value)}
                placeholder="+971 50 000 0000"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label flex items-center gap-2">
                <MapPin size={13} className="text-[#94a3b8]" /> Location
              </label>
              <input
                type="text"
                value={settings.footer_location}
                onChange={(e) => updateSetting("footer_location", e.target.value)}
                placeholder="City, Country"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
              <Shield size={20} className="text-[#EF4444]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Security</h3>
              <p className="text-xs text-[#64748b]">Protect your platform</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: "two_factor_enabled" as keyof AppSettings, label: "Two-Factor Authentication", icon: Lock },
              { key: "email_notifications" as keyof AppSettings, label: "Email Notifications", icon: Bell },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-[#94a3b8]" />
                  <span className="text-sm text-white">{item.label}</span>
                </div>
                <button
                  onClick={() => updateSetting(item.key, !settings[item.key])}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings[item.key] ? "bg-[#10B981]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings[item.key] ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
