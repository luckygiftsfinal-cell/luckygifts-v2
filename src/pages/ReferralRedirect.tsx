import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      const upperCode = code.toUpperCase();

      // Save to localStorage for persistence
      localStorage.setItem('luckygifts_ref_code', upperCode);

      // Also set cookie for extra persistence
      document.cookie = `luckygifts_ref=${upperCode}; path=/; max-age=604800`; // 7 days

      // Redirect to home with ref parameter
      navigate(`/?ref=${upperCode}`, { replace: true });
    } else {
      // No code provided, redirect to home
      navigate('/', { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Loading...</p>
    </div>
  );
}
