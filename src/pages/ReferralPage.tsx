import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { 
  Share2, Copy, Check, Gift, Users, Coins, TrendingUp, 
  ArrowLeft, Trophy, Clock, CheckCircle, XCircle, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ReferralWithUser {
  id: string;
  referred_name: string;
  referred_email: string;
  status: 'pending' | 'completed' | 'cancelled';
  order_amount: number;
  points_earned: number;
  created_at: string;
  completed_at: string | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  referrals: number;
  isCurrentUser: boolean;
}

export default function ReferralPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { getUserReferrals, getUserPoints } = useStore();
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState<ReferralWithUser[]>([]);
  const [userPoints, setUserPoints] = useState({ points: 0, total_earned: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard'>('overview');

  const referralLink = user?.referralCode 
    ? `${window.location.origin}?ref=${user.referralCode}`
    : '';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Load referrals
      const refs = await getUserReferrals(user.id);

      // Enrich with user data
      const enriched = await Promise.all(
        refs.map(async (ref) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', ref.referred_id)
            .single();

          return {
            id: ref.id,
            referred_name: profile?.full_name || 'Unknown',
            referred_email: profile?.email || '',
            status: ref.status,
            order_amount: ref.order_amount || 0,
            points_earned: ref.points_earned || 0,
            created_at: ref.created_at,
            completed_at: ref.completed_at,
          };
        })
      );

      setReferrals(enriched);

      // Load points
      const points = await getUserPoints(user.id);
      if (points) {
        setUserPoints({ points: points.points, total_earned: points.total_earned });
      }

      // Load leaderboard (mock for now - will be from API)
      await loadLeaderboard();
    } catch (err) {
      console.error("Error loading referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data: topReferrers } = await supabase
        .from('profiles')
        .select('id, full_name, referral_points, total_referrals')
        .order('referral_points', { ascending: false })
        .limit(10);

      if (topReferrers) {
        const mapped = topReferrers.map((entry, idx) => ({
          rank: idx + 1,
          name: entry.full_name || 'Anonymous',
          points: entry.referral_points || 0,
          referrals: entry.total_referrals || 0,
          isCurrentUser: entry.id === user?.id,
        }));
        setLeaderboard(mapped);
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    }
  };

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalPoints = referrals.reduce((sum, r) => sum + (r.points_earned || 0), 0);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-2 block">Referral Program</span>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Invite & Earn</h1>
          </div>
        </div>

        {/* Referral Link Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/5 to-transparent border border-[#FFD700]/20 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                <LinkIcon size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Referral Link</h3>
                <p className="text-sm text-white/40 mt-1">Share this link with friends and earn points</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FFD700] font-mono truncate">
                  {referralLink || 'Loading...'}
                </div>
                <button 
                  onClick={copyReferral}
                  className="px-4 py-3 bg-[#FFD700] text-black font-black text-sm rounded-xl hover:bg-[#f0d060] transition-all flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-white/30 mt-2">Code: <span className="text-[#FFD700]">{user?.referralCode}</span></p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>
              <Users size={22} />
            </div>
            <div className="stat-value">{referrals.length}</div>
            <div className="stat-label">Total Invited</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
              <CheckCircle size={22} />
            </div>
            <div className="stat-value">{completedReferrals.length}</div>
            <div className="stat-label">Completed</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#3B82F6' }}>
              <Coins size={22} />
            </div>
            <div className="stat-value">{totalPoints}</div>
            <div className="stat-label">Points Earned</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}>
              <TrendingUp size={22} />
            </div>
            <div className="stat-value">${(totalPoints * 35).toLocaleString()}</div>
            <div className="stat-label">Value</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'history', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                  : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
              }`}
            >
              {tab === 'overview' && <><Gift size={16} className="inline mr-2" /> Overview</>}
              {tab === 'history' && <><Clock size={16} className="inline mr-2" /> History</>}
              {tab === 'leaderboard' && <><Trophy size={16} className="inline mr-2" /> Leaderboard</>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift size={40} className="text-[#FFD700]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">How It Works</h3>
                <p className="text-white/40 max-w-md mx-auto">Share your link, friends sign up, they buy, you earn points!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Share2 size={24} className="text-[#FFD700]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">1. Share</h4>
                  <p className="text-xs text-white/40">Copy your unique referral link and share it with friends</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-[#10B981]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">2. Friends Join</h4>
                  <p className="text-xs text-white/40">They sign up using your link and make their first purchase</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Coins size={24} className="text-[#3B82F6]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">3. Earn Points</h4>
                  <p className="text-xs text-white/40">Earn 1 point for every $35 they spend on their first order</p>
                </div>
              </div>

              {pendingReferrals.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Pending Referrals</h4>
                  <div className="space-y-3">
                    {pendingReferrals.map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FFA000]/10 rounded-lg flex items-center justify-center">
                            <Clock size={18} className="text-[#FFA000]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{ref.referred_name}</p>
                            <p className="text-xs text-white/40">{ref.referred_email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-[#FFA000]/10 text-[#FFA000] text-xs font-bold rounded-lg">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Referral History</h3>
              {referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          ref.status === 'completed' ? 'bg-[#10B981]/10' : 
                          ref.status === 'pending' ? 'bg-[#FFA000]/10' : 'bg-[#EF4444]/10'
                        }`}>
                          {ref.status === 'completed' ? <CheckCircle size={18} className="text-[#10B981]" /> :
                           ref.status === 'pending' ? <Clock size={18} className="text-[#FFA000]" /> :
                           <XCircle size={18} className="text-[#EF4444]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ref.referred_name}</p>
                          <p className="text-xs text-white/40">{ref.referred_email}</p>
                          <p className="text-[10px] text-white/20 mt-1">{new Date(ref.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                          ref.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                          ref.status === 'pending' ? 'bg-[#FFA000]/10 text-[#FFA000]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                        }`}>
                          {ref.status}
                        </span>
                        {ref.status === 'completed' && (
                          <p className="text-xs text-[#FFD700] font-bold mt-1">+{ref.points_earned} pts</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/20 font-bold uppercase tracking-widest">No referrals yet</p>
                  <p className="text-white/10 text-sm mt-2">Share your link to start earning!</p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Top Referrers</h3>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.rank} 
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        entry.isCurrentUser 
                          ? 'bg-[#FFD700]/10 border border-[#FFD700]/20' 
                          : 'bg-white/5 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                          entry.rank === 1 ? 'bg-[#FFD700] text-black' :
                          entry.rank === 2 ? 'bg-[#C0C0C0] text-black' :
                          entry.rank === 3 ? 'bg-[#CD7F32] text-black' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {entry.name}
                            {entry.isCurrentUser && <span className="text-[#FFD700] ml-2 text-xs">(You)</span>}
                          </p>
                          <p className="text-xs text-white/40">{entry.referrals} referrals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#FFD700]">{entry.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Trophy size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/20 font-bold uppercase tracking-widest">Leaderboard loading...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
