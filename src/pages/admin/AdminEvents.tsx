import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar, Clock, MapPin, Plus, Edit, Trash2, Save, X, Loader2,
  RefreshCw, Image, Star, ArrowUp, ArrowDown, Eye, EyeOff
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState<Partial<EventItem>>({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    image_url: "",
    button_text: "Get Your Event Ticket",
    button_link: "/store",
    is_featured: false,
    active: true,
    sort_order: 0,
  });

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (event?: EventItem) => {
    if (event) {
      setEditingEvent(event);
      setForm({ ...event });
    } else {
      setEditingEvent(null);
      setForm({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        image_url: "",
        button_text: "Get Your Event Ticket",
        button_link: "/store",
        is_featured: false,
        active: true,
        sort_order: events.length,
      });
    }
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const imagesBucket = buckets?.find(b => b.name === 'images');

      if (!imagesBucket) {
        await supabase.storage.createBucket('images', { public: true });
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `event-${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          const localUrl = URL.createObjectURL(file);
          setForm({ ...form, image_url: localUrl });
          toast.info("Using local image preview.");
          return;
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
      setForm({ ...form, image_url: urlData.publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Image upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error("Event title is required");
      return;
    }
    if (!form.event_date) {
      toast.error("Event date is required");
      return;
    }
    if (!form.event_time) {
      toast.error("Event time is required");
      return;
    }

    setIsSaving(true);
    try {
      if (form.is_featured && !editingEvent?.is_featured) {
        await supabase.from("events").update({ is_featured: false }).neq("id", editingEvent?.id || "0");
      }

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update({
            title: form.title,
            description: form.description,
            event_date: form.event_date,
            event_time: form.event_time,
            location: form.location,
            image_url: form.image_url,
            button_text: form.button_text,
            button_link: form.button_link,
            is_featured: form.is_featured,
            active: form.active,
            sort_order: form.sort_order,
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase.from("events").insert({
          title: form.title,
          description: form.description,
          event_date: form.event_date,
          event_time: form.event_time,
          location: form.location,
          image_url: form.image_url,
          button_text: form.button_text,
          button_link: form.button_link,
          is_featured: form.is_featured,
          active: form.active,
          sort_order: form.sort_order || events.length,
        });

        if (error) throw error;
        toast.success("Event created successfully");
      }

      setModalOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("events").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      setDeleteTarget(null);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (event: EventItem) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ active: !event.active })
        .eq("id", event.id);
      if (error) throw error;
      fetchEvents();
      toast.success(event.active ? "Event hidden" : "Event activated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMoveOrder = async (event: EventItem, direction: "up" | "down") => {
    const currentIndex = events.findIndex((e) => e.id === event.id);
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === events.length - 1)) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapEvent = events[swapIndex];

    try {
      await Promise.all([
        supabase.from("events").update({ sort_order: swapEvent.sort_order }).eq("id", event.id),
        supabase.from("events").update({ sort_order: event.sort_order }).eq("id", swapEvent.id),
      ]);
      fetchEvents();
    } catch (error: any) {
      toast.error("Reorder failed");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {events.filter((e) => e.active).length} active · {events.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsRefreshing(true); fetchEvents().then(() => setIsRefreshing(false)); }}
            disabled={isRefreshing}
            className="btn-secondary"
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">No events yet</p>
            <button onClick={() => openModal()} className="btn-primary mt-4">
              <Plus size={16} />
              Create First Event
            </button>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="admin-card flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a2e]">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#475569]">
                    <Image size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
                  {event.is_featured && (
                    <span className="bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-black px-2 py-0.5 rounded-full">FEATURED</span>
                  )}
                  {!event.active && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">HIDDEN</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1"><Calendar size={12} />{event.event_date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{event.event_time}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleMoveOrder(event, "up")} disabled={index === 0} className="p-1 rounded hover:bg-white/5 text-[#64748b] disabled:opacity-30">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => handleMoveOrder(event, "down")} disabled={index === events.length - 1} className="p-1 rounded hover:bg-white/5 text-[#64748b] disabled:opacity-30">
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button onClick={() => handleToggleActive(event)} className={`p-2 rounded-lg transition-colors ${event.active ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-[#64748b] hover:bg-white/10"}`}>
                  {event.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openModal(event)} className="p-2 rounded-lg bg-white/5 text-[#94a3b8] hover:bg-[#FFD700]/10 hover:text-[#FFD700] transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => setDeleteTarget(event)} className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ maxHeight: "calc(100vh - 40px)" }}>
            
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12121a] flex-shrink-0">
                <h2 className="text-xl font-bold text-white">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-[#64748b] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-[#12121a]">
                {/* Title */}
                <div>
                  <label className="form-label">Event Title <span className="text-red-400">*</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. Dubai New Year's Eve Gala 2026"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input min-h-[120px] resize-none"
                    placeholder="Describe the event..."
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Date, Time, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.event_date || ""}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Time <span className="text-red-400">*</span></label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.event_time || ""}
                      onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      placeholder="Dubai, UAE"
                      value={form.location || ""}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="form-label">Event Image</label>
                  <div className="flex items-start gap-4">
                    {form.image_url && (
                      <div className="w-40 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-[#1a1a2e]">
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        <div className="form-input flex items-center justify-center gap-2 py-4 text-sm text-[#94a3b8] hover:text-white transition-colors border-2 border-dashed border-white/10 hover:border-[#FFD700]/30 cursor-pointer">
                          {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                          {uploadingImage ? "Uploading..." : "Click to Upload Image"}
                        </div>
                      </label>
                      <p className="text-[11px] text-[#64748b]">Or paste image URL below:</p>
                      <input
                        className="form-input text-sm"
                        placeholder="https://example.com/image.jpg or /images/..."
                        value={form.image_url || ""}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Button Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Button Text</label>
                    <input
                      className="form-input"
                      placeholder="Get Your Event Ticket"
                      value={form.button_text || ""}
                      onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Button Link</label>
                    <select
                      className="form-input"
                      value={form.button_link || "/store"}
                      onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                    >
                      <option value="/store">Dream Store (/store)</option>
                      <option value="/dream-store">Dream Store (/dream-store)</option>
                      <option value="/vip">VIP Page</option>
                      <option value="/checkout">Checkout</option>
                      <option value="custom">Custom URL</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-8 py-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                      className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${form.is_featured ? "bg-[#FFD700]" : "bg-white/10"}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${form.is_featured ? "left-7" : "left-1"}`} />
                    </div>
                    <span className="text-sm text-white font-medium flex items-center gap-2">
                      <Star size={16} className={form.is_featured ? "text-[#FFD700]" : "text-white/30"} />
                      Featured (shows first)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm({ ...form, active: !form.active })}
                      className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${form.active !== false ? "bg-[#10B981]" : "bg-white/10"}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${form.active !== false ? "left-7" : "left-1"}`} />
                    </div>
                    <span className="text-sm text-white font-medium">Active</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#12121a] flex-shrink-0">
                <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2.5 px-6">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary text-sm py-2.5 px-8 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
          </div>
        </div>
      , document.body)}

      {/* Delete Confirm */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Event?</h3>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.title}"</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 text-sm py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
