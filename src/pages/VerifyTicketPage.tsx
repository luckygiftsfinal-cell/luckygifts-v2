import { useState } from "react";
import { useParams } from "react-router-dom";
import { Search, CheckCircle, XCircle, Loader2, Ticket } from "lucide-react";

export default function VerifyTicketPage() {
  const { ticketNumber } = useParams();
  const [inputTicket, setInputTicket] = useState(ticketNumber || "");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTicket.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/.netlify/functions/verify-ticket?ticket=${inputTicket.trim()}`
      );
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError("Failed to verify ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Ticket className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Verify Ticket</h1>
          <p className="text-slate-400">Enter a ticket number to verify its authenticity</p>
        </div>

        <form onSubmit={verifyTicket} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={inputTicket}
              onChange={(e) => setInputTicket(e.target.value)}
              placeholder="Enter ticket number (e.g., LG-2026-001847)"
              className="w-full bg-dark-800 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-gold/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputTicket.trim()}
            className="w-full mt-4 btn-primary py-3 justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                Verify Ticket
              </>
            )}
          </button>
        </form>

        {result && (
          <div className={`admin-card ${result.valid ? "border-green-500/30" : "border-red-500/30"}`}>
            {result.valid ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Valid Ticket</h2>
                <div className="space-y-3 text-left mt-6">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-500">Number</span>
                    <span className="text-gold font-mono font-bold">{result.ticket.number}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-500">Owner</span>
                    <span className="text-white">{result.ticket.owner}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-500">Package</span>
                    <span className="text-white">{result.ticket.package}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-500">Draw Date</span>
                    <span className="text-gold">{new Date(result.ticket.drawDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Status</span>
                    <span className="text-green-400 font-bold">{result.ticket.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Invalid Ticket</h2>
                <p className="text-slate-400">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
