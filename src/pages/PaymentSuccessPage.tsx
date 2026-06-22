import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Ticket, Download, Loader2, AlertCircle, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/.netlify/functions/get-payment-details?orderId=${orderId}`
      );
      if (!response.ok) throw new Error("Failed to fetch order details");
      const result = await response.json();
      setData(result);
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

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400">
            Order #{orderId?.substring(0, 8).toUpperCase()} — Thank you for your purchase
          </p>
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
              <p className="text-green-400 font-bold">{order.status.toUpperCase()}</p>
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
                <div
                  key={ticket.id}
                  className="bg-dark-800 border border-gold/20 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-gold font-mono font-bold text-lg">{ticket.ticket_number}</p>
                    <p className="text-slate-500 text-sm">{ticket.package_name}</p>
                  </div>
                  <a
                    href={`/ticket/${ticket.ticket_number}`}
                    target="_blank"
                    className="btn-secondary text-xs"
                  >
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
                <div
                  key={item.id}
                  className="bg-dark-800 border border-gold/20 rounded-xl p-4 flex items-center justify-between"
                >
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

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <a href="/my-library" className="btn-primary">
            Go to My Library
          </a>
          <a href="/store" className="btn-secondary">
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
