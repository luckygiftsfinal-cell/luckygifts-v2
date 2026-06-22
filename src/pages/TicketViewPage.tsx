import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket, Loader2, AlertCircle, User, Calendar, Package } from "lucide-react";
import { supabase } from "../lib/supabase";

interface TicketData {
  id: string;
  ticket_number: string;
  owner_name: string;
  package_name: string;
  draw_date: string;
  status: string;
  created_at: string;
}

export default function TicketViewPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ticketId) fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("ticket_number", ticketId)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ticket Not Found</h2>
          <p className="text-slate-400">{error || "This ticket does not exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-dark-800 to-dark-700 border border-gold/30 rounded-2xl overflow-hidden shadow-2xl shadow-gold/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold to-gold-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-black font-black text-sm tracking-widest uppercase">
                🎟 LuckyGifts Draw
              </span>
              <span className="bg-black/20 text-black font-bold text-xs px-2 py-1 rounded">
                {ticket.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-gold mx-auto mb-4" />

            <div className="text-xs text-gold/60 uppercase tracking-wider mb-2">
              Ticket Number
            </div>
            <div className="text-3xl font-black text-gold tracking-wider mb-6">
              {ticket.ticket_number}
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-slate-500 text-xs">Owner</span>
                  <p className="text-white font-medium">{ticket.owner_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Package className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-slate-500 text-xs">Package</span>
                  <p className="text-white font-medium">{ticket.package_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-slate-500 text-xs">Draw Date</span>
                  <p className="text-gold font-medium">{new Date(ticket.draw_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-dark-900/50 px-6 py-4 text-center border-t border-white/5">
            <p className="text-slate-500 text-xs">getluckygifts.shop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
