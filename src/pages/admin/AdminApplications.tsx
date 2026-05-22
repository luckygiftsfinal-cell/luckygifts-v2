import { useState, useEffect } from "react";
import { Briefcase, CheckCircle2, XCircle, Loader2, RefreshCw, Mail, Phone, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  created_at: string;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("work_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("work_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchApplications();
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "reviewed": return "bg-blue-500/20 text-blue-500";
      case "accepted": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      default: return "bg-white/10 text-white/60";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-sm text-[#64748b] mt-1">Manage work with us applications</p>
        </div>
        <button onClick={fetchApplications} className="btn-secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">No applications yet</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="admin-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
                    <Briefcase size={20} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-lg">{app.name}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#64748b]">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {app.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[#FFD700]">{app.position}</div>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-2xl">{app.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(app.id, "accepted")}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-500"
                    title="Accept"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
