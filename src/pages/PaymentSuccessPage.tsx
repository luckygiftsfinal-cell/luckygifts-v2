import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Ticket, Download, Loader2, AlertCircle, ExternalLink, Clock, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

interface OrderDetails {
  order: any;
  tickets: any[];
  library: any[];
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [data, setData] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState("");

  const getToken = async () => {
    const { data: s } = await supabase.auth.getSession();
    return s.session?.access_token;
  };

  const fetchOrderDetails = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in to view this order");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/.netlify/functions/get-payment-details?orderId=${encodeURIComponent(orderId || "")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch order details");
      setData(await response.json());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetails();
    else {
      setError("Missing order");
      setLoading(false);
    }
  }, [orderId]);

  // Order not confirmed yet → ask the server to look at the blockchain again
  const recheck = async () => {
    if (!data) return;
    setChecking(true);
    setNote("");
    try {
      const token = await getToken();
      const pd = data.order.payment_details || {};
      if (!token || !pd.txHash || !pd.asset) throw new Error("No transaction hash was submitted for this order");
      const res = await fetch("/.netlify/functions/verify-crypto-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, txHash: pd.txHash, asset: pd.asset }),
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || "Verification failed");
      if (r.status === "paid") await fetchOrderDetails();
      else if (r.status === "invalid") setNote("The transaction does not match this order (amount, network or time). Please contact support.");
      else setNote("Still waiting for the network to confirm your transaction. Try again in a minute.");
    } catch (e: any) {
      setNote(e.message);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  const { order, tickets, library } = data;
  const isPaid = order.status === "paid";

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isPaid ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
            {isPaid ? <CheckCircle className="w-10 h-10 text-green-400" /> : <Clock className="w-10 h-10 text-yellow-400" />}
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{isPaid ? "Payment Successful!" : "Waiting for confirmation"}</h1>
          <p className="text-slate-400">
            Order #{orderId?.substring(0, 8).toUpperCase()} — {isPaid ? "Thank you for your purchase" : "We are waiting for your transaction to be confirmed on the blockchain"}
          </p>
          {!isPaid && order.status === "pending_verification" && (
            <div className="mt-4">
              <button onClick={recheck} disabled={checking} className="btn-primary text-xs inline-flex items-center gap-2 disabled:opacity-60">
                {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Check payment again
              </button>
              {note && <p className="text-slate-400 text-sm mt-3">{note}</p>}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="admin-card mb-8">
          <h3 className="section-title mb-4">Order Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Amount</span>
              <p className="text-gold font-black text-lg">${order.total_amount}</p>
            </div>
            <div>
              <span className="text-slate-500">Status</span>
              <p className={`font-bold ${isPaid ? "text-green-400" : "text-yellow-400"}`}>{String(order.status).toUpperCase()}</p>
            </div>
            <div>
              <span className="text-slate-500">Tickets Earned</span>
              <p className="text-white font-bold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gold" />
                {order.tickets_earned || tickets.length}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Email</span>
              <p className="text-white">{order.email}</p>
            </div>
          </div>
        </div>

        {/* Tickets */}
        {tickets.length > 0 && (
          <div className="admin-card mb-8">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gold" />
              Your Tickets
            </h3>
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="bg-dark-800 border border-gold/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-gold font-mono font-bold text-lg">{ticket.ticket_number}</p>
                    <p className="text-slate-500 text-sm">{ticket.package_name}</p>
                  </div>
                  <a href={`/ticket/${ticket.ticket_number}`} target="_blank" className="btn-secondary text-xs">
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* eBooks */}
        {library.length > 0 && (
          <div className="admin-card mb-8">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-gold" />
              Your eBooks
            </h3>
            <div className="space-y-3">
              {library.map((item: any) => (
                <div key={item.id} className="bg-dark-800 border border-gold/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{item.product_name}</p>
                    <p className="text-slate-500 text-sm">{item.file_path}</p>
                  </div>
                  <a href={item.download_url} target="_blank" className="btn-primary text-xs">
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <a href="/my-library" className="btn-primary">Go to My Library</a>
          <a href="/store" className="btn-secondary">Continue Shopping</a>
        </div>
      </div>
    </div>
  );
}
