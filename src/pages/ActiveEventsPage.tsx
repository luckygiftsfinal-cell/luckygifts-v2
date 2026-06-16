import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Ticket, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";

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

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      try {
        const now = new Date().getTime();
        // Parse the date properly - handle both ISO and simple date strings
        let target: number;

        if (targetDate.includes('T')) {
          // Already has time component
          target = new Date(targetDate).getTime();
        } else {
          // Just a date, append time
          target = new Date(targetDate + 'T00:00:00').getTime();
        }

        if (isNaN(target)) {
          console.error('Invalid target date:', targetDate);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const difference = target - now;

        if (difference <= 0) {
          setIsExpired(true);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        setIsExpired(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } catch (err) {
        console.error('Countdown error:', err);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 md:gap-6">
        {["DAYS", "HOURS", "MINUTES", "SECONDS"].map((label) => (
          <div key={label} className="text-center">
            <div className="bg-black/60 backdrop-blur-sm border border-[#FFD700]/20 rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
              <div className="text-3xl md:text-5xl font-black text-[#FFD700] leading-none">00</div>
            </div>
            <div className="text-[10px] md:text-xs font-bold text-white/50 mt-2 tracking-widest">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-center py-4">
        <span className="text-[#FFD700] text-2xl font-black">EVENT STARTED!</span>
      </div>
    );
  }

  const timeBlocks = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINUTES" },
    { value: timeLeft.seconds, label: "SECONDS" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      {timeBlocks.map((block, index) => (
        <div key={index} className="text-center">
          <div className="bg-black/60 backdrop-blur-sm border border-[#FFD700]/20 rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
            <div className="text-3xl md:text-5xl font-black text-[#FFD700] leading-none">
              {String(block.value).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[10px] md:text-xs font-bold text-white/50 mt-2 tracking-widest">
            {block.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, isFeatured = false }: { event: EventItem; isFeatured?: boolean }) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    // If button_link is /dream-store or /store, navigate with event filter
    if (event.button_link === '/dream-store' || event.button_link === '/store') {
      // Navigate to store with event query param
      navigate('/store?filter=event');
    } else if (event.button_link.startsWith("/")) {
      navigate(event.button_link);
    } else {
      window.location.href = event.button_link;
    }
  };

  const handleExploreClick = () => {
    navigate('/store');
  };

  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-[#FFD700]/20"
        style={{
          background: "linear-gradient(145deg, rgba(255,215,0,0.08) 0%, rgba(10,10,10,0.9) 50%, rgba(10,10,10,0.95) 100%)",
        }}
      >
        {/* Featured Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Sparkles size={14} />
            FEATURED EVENT
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-64 md:h-auto min-h-[300px] md:min-h-[450px]">
            <img
              src={event.image_url || "/images/event-placeholder.jpg"}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/event-placeholder.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0f]/90 md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent md:hidden" />
          </div>

          {/* Content */}
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              {event.title}
            </h2>

            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
              {event.description}
            </p>

            {/* Event Details */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Calendar size={18} />
                <span className="text-sm font-bold">{event.event_date}</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Clock size={18} />
                <span className="text-sm font-bold">{event.event_time}</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD700]">
                <MapPin size={18} />
                <span className="text-sm font-bold">{event.location}</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="mb-8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                Event Countdown
              </p>
              <CountdownTimer targetDate={event.event_date} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleButtonClick}
                className="btn-primary flex-1 px-8 py-4 text-base font-black flex items-center justify-center gap-3"
              >
                <Ticket size={22} />
                {event.button_text || "Get Your Event Ticket"}
                <ChevronRight size={18} />
              </button>
              <button
                onClick={handleExploreClick}
                className="btn-secondary flex-1 px-8 py-4 text-base font-black flex items-center justify-center gap-3"
              >
                Explore Dream Store
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular event card
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="admin-card overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
        <img
          src={event.image_url || "/images/event-placeholder.jpg"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/event-placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
        {event.description}
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5 text-[#FFD700]/80 text-xs font-bold">
          <Calendar size={14} />
          {event.event_date}
        </div>
        <div className="flex items-center gap-1.5 text-[#FFD700]/80 text-xs font-bold">
          <Clock size={14} />
          {event.event_time}
        </div>
        <div className="flex items-center gap-1.5 text-[#FFD700]/80 text-xs font-bold">
          <MapPin size={14} />
          {event.location}
        </div>
      </div>

      <button
        onClick={handleButtonClick}
        className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
      >
        <Ticket size={16} />
        {event.button_text || "Get Ticket"}
      </button>
    </motion.div>
  );
}

export default function ActiveEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredEvent = events.find((e) => e.is_featured);
  const otherEvents = events.filter((e) => !e.is_featured);

  return (
    <div className="min-h-screen bg-[#0a0a0f]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <SEO
        title="Active Events — LuckyGifts Live Draws & Exclusive Events"
        description="Join exclusive events and live draws with LuckyGifts. Win luxury prizes in Dubai and worldwide."
        url="/events"
        keywords="events Dubai, luxury draws, live events UAE, prize events 2026"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.06)_0%,transparent_70%)]" />

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#FFD700] font-black text-xs uppercase tracking-[0.2em] mb-4 block">
              Upcoming Experiences
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              Active <span className="text-[#FFD700]">Events</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Exclusive live draws and luxury events. Secure your spot and be part of something extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="pb-10 px-4">
          <div className="container-custom max-w-6xl">
            <EventCard event={featuredEvent} isFeatured={true} />
          </div>
        </section>
      )}

      {/* Other Events */}
      {otherEvents.length > 0 && (
        <section className="py-16 px-4">
          <div className="container-custom max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                More <span className="text-[#FFD700]">Events</span>
              </h2>
              <p className="text-white/50">Discover more exclusive experiences</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <section className="py-32 text-center px-4">
          <Calendar size={64} className="mx-auto text-[#475569] mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">No Active Events</h2>
          <p className="text-white/50 max-w-md mx-auto">
            Stay tuned! New exclusive events will be announced soon.
          </p>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Don't Miss <span className="text-[#FFD700]">Your Chance</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of winners. Get your tickets now and be part of the next big draw.
          </p>
          <button
            onClick={() => navigate('/store')}
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-base font-black"
          >
            <Ticket size={22} />
            Explore Dream Store
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
