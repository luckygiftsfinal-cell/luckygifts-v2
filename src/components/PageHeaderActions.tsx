import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function PageHeaderActions() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-50 px-4 pt-3 pb-2 flex justify-between items-center pointer-events-none">
      <button 
        onClick={() => navigate(-1)} 
        className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a]/80 backdrop-blur hover:bg-[#161616] border border-white/10 hover:border-[#FFD700]/50 rounded-full text-[#FFD700] font-black uppercase tracking-widest text-xs transition-all hover:-translate-x-1 shadow-lg"
      >
        <ArrowLeft size={16} /> Back
      </button>
      
      <button 
        onClick={() => navigate("/")} 
        className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a]/80 backdrop-blur hover:bg-[#161616] border border-white/10 hover:border-[#FFD700]/50 rounded-full text-[#FFD700] font-black uppercase tracking-widest text-xs transition-all hover:translate-x-1 shadow-lg"
      >
        Home <Home size={16} />
      </button>
    </div>
  );
}
