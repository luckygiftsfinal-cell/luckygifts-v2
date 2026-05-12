import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function PageHeaderActions() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  return (
    <div className="container mx-auto px-4 pt-4 pb-2 flex justify-between items-center relative z-50">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] hover:bg-[#161616] border border-white/10 hover:border-[#FFD700]/50 rounded-full text-[#FFD700] font-black uppercase tracking-widest text-xs transition-all hover:-translate-x-1 shadow-lg"
      >
        <ArrowLeft size={16} /> Back
      </button>
      
      <button 
        onClick={() => navigate("/")} 
        className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] hover:bg-[#161616] border border-white/10 hover:border-[#FFD700]/50 rounded-full text-[#FFD700] font-black uppercase tracking-widest text-xs transition-all hover:translate-x-1 shadow-lg"
      >
        Home <Home size={16} />
      </button>
    </div>
  );
}
