import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vipLevel: "None" | "Gold" | "Diamond";
  role: "user" | "admin";
  ticketBalance: number;
  referralCode?: string;
  referredBy?: string | null;
  totalReferrals?: number;
  referralPoints?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  earnedTickets: number;
  realTicketCount: number;
  addTickets: (count: number) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password?: string, country?: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [earnedTickets, setEarnedTickets] = useState(() => {
    const saved = localStorage.getItem('earned_tickets');
    return saved ? parseInt(saved) : 0;
  });
  const [realTicketCount, setRealTicketCount] = useState(0);

  const fetchRealTicketCount = async (userId?: string) => {
    const targetId = userId || user?.id;
    if (!targetId) return;

    try {
      const { count, error } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetId)
        .eq("status", "active");

      if (!error) {
        setRealTicketCount(count || 0);
      }
    } catch (err) {
      console.error("Ticket count error:", err);
    }
  };

  const addTickets = async (count: number) => {
    if (!user) {
      const newVal = earnedTickets + count;
      setEarnedTickets(newVal);
      localStorage.setItem('earned_tickets', newVal.toString());
      return;
    }

    const newBalance = (user.ticketBalance || 0) + count;
    const { error } = await supabase
      .from('profiles')
      .update({ ticket_balance: newBalance })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ticketBalance: newBalance });
      setEarnedTickets(newBalance);
      localStorage.setItem('earned_tickets', newBalance.toString());
      fetchRealTicketCount(user.id);
    } else {
      console.error("Error updating tickets:", error);
      toast.error("Failed to update tickets in database");
    }
  };

  const lastSyncedSession = React.useRef<string | null>(null);

  const syncProfile = async (session: any) => {
    const userId = session?.user?.id;
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const sessionKey = session?.access_token?.slice(-10);
    if (lastSyncedSession.current === sessionKey) return;
    lastSyncedSession.current = sessionKey;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser({
          id: userId,
          email: session.user.email!,
          name: profile.full_name || "User",
          phone: profile.phone,
          role: profile.role,
          vipLevel: profile.vip_level,
          ticketBalance: profile.ticket_balance || 0,
          referralCode: profile.referral_code,
          referredBy: profile.referred_by,
          totalReferrals: profile.total_referrals || 0,
          referralPoints: profile.referral_points || 0,
        });
        setEarnedTickets(profile.ticket_balance || 0);
        localStorage.setItem('earned_tickets', (profile.ticket_balance || 0).toString());
        fetchRealTicketCount(userId);
      } else {
        const role = session.user.email?.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: session.user.user_metadata?.full_name || "New User",
              phone: session.user.user_metadata?.phone || "",
              role: role,
              vip_level: "None",
              ticket_balance: 0,
              total_referrals: 0,
              referral_points: 0
            }
          ])
          .select()
          .single();

        if (newProfile) {
          setUser({
            id: userId,
            email: session.user.email!,
            name: newProfile.full_name || "User",
            phone: newProfile.phone,
            role: newProfile.role,
            vipLevel: newProfile.vip_level,
            ticketBalance: 0,
            referralCode: newProfile.referral_code,
            referredBy: newProfile.referred_by,
            totalReferrals: 0,
            referralPoints: 0,
          });
          setEarnedTickets(0);
        } else if (insertError) {
          const { data: retryProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (retryProfile) {
            setUser({
              id: userId,
              email: session.user.email!,
              name: retryProfile.full_name || "User",
              phone: retryProfile.phone,
              role: retryProfile.role,
              vipLevel: retryProfile.vip_level,
              ticketBalance: retryProfile.ticket_balance || 0,
              referralCode: retryProfile.referral_code,
              referredBy: retryProfile.referred_by,
              totalReferrals: retryProfile.total_referrals || 0,
              referralPoints: retryProfile.referral_points || 0,
            });
            fetchRealTicketCount(userId);
          }
        }
      }
    } catch (err) {
      console.error("Error in syncProfile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await syncProfile(session);
        }
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRealTicketCount(0);
        setIsLoading(false);
        return;
      }
      if (session) {
        syncProfile(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "",
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user && data.session) {
        setModalOpen(false);
        toast.success(`Welcome back!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "A critical error occurred during login");
      return false;
    }
  };

  const register = async (
    name: string, 
    email: string, 
    phone: string, 
    password?: string, 
    country?: string,
    referralCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);

    const refCode = referralCode || localStorage.getItem('luckygifts_ref_code') || undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || "",
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
          phone: phone
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return false;
    }

    if (data.user) {
      const role = email.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";

      let referredBy = null;

      // Check if user already has a referral (prevent using multiple codes)
      const { data: existingRef } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', data.user.id)
        .single();

      if (!existingRef && refCode) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, referral_code')
          .eq('referral_code', refCode)
          .single();

        if (referrer) {
          // Prevent self-referral
          if (referrer.id === data.user.id) {
            toast.error("You cannot refer yourself!");
            console.log("Self-referral blocked for user:", data.user.id);
          } else {
            referredBy = referrer.id;
          }
        }
      } else if (existingRef) {
        console.log("User already has a referral, ignoring new code");
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: name,
            phone: phone,
            country: country || "AE",
            role: role,
            vip_level: "None",
            referred_by: referredBy,
            total_referrals: 0,
            referral_points: 0
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      if (referredBy && newProfile) {
        const { error: refError } = await supabase
          .from('referrals')
          .insert([
            {
              referrer_id: referredBy,
              referred_id: data.user.id,
              referral_code: refCode,
              status: 'pending',
              points_earned: 0
            }
          ]);

        if (refError) {
          console.error("Error creating referral:", refError);
        }
      }

      localStorage.removeItem('luckygifts_ref_code');
    }

    setModalOpen(false);
    if (data.user && !data.session) {
      toast.success(`Account created! Please check your email to confirm.`);
    } else {
      toast.success(`Account created successfully!`);
    }
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRealTicketCount(0);
    toast.info("You have been logged out.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        earnedTickets,
        realTicketCount,
        addTickets,
        isModalOpen,
        setModalOpen,
        mode,
        setMode,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
