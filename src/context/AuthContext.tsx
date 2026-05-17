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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  earnedTickets: number;
  addTickets: (count: number) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [earnedTickets, setEarnedTickets] = useState(() => {
    const saved = localStorage.getItem('earned_tickets');
    return saved ? parseInt(saved) : 0;
  });

  const addTickets = async (count: number) => {
    if (!user) {
      // For guest users, still use localStorage as fallback
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

    // Skip if already synced this exact session token
    const sessionKey = session?.access_token?.slice(-10);
    if (lastSyncedSession.current === sessionKey) return;
    lastSyncedSession.current = sessionKey;

    try {
      console.log("Syncing profile for session:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        console.log("Profile found:", profile.full_name);
        setUser({
          id: userId,
          email: session.user.email!,
          name: profile.full_name || "User",
          phone: profile.phone,
          role: profile.role,
          vipLevel: profile.vip_level,
          ticketBalance: profile.ticket_balance || 0
        });
        setEarnedTickets(profile.ticket_balance || 0);
        localStorage.setItem('earned_tickets', (profile.ticket_balance || 0).toString());
      } else {
        console.log("Profile not found or error, creating default...", error);
        const role = session.user.email?.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";
        
        // Try to insert, but handle potential race condition where it was just created
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: session.user.user_metadata?.full_name || "New User",
              phone: session.user.user_metadata?.phone || "",
              role: role,
              vip_level: "None",
              ticket_balance: 0
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
            ticketBalance: 0
          });
          setEarnedTickets(0);
        } else if (insertError) {
          console.error("Profile creation failed (might already exist):", insertError);
          // Final attempt to fetch if insert failed
          const { data: retryProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (retryProfile) {
            setUser({
              id: userId,
              email: session.user.email!,
              name: retryProfile.full_name || "User",
              phone: retryProfile.phone,
              role: retryProfile.role,
              vipLevel: retryProfile.vip_level,
              ticketBalance: retryProfile.ticket_balance || 0
            });
          }
        }
      }
    } catch (err) {
      console.error("Error in syncProfile:", err);
    } finally {
      setIsLoading(false);
      console.log("Profile sync finished for:", userId);
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
        setIsLoading(false);
        return;
      }
      if (session) {
        syncProfile(session); // fire and forget - don't block
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
        // onAuthStateChange handles syncProfile automatically
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

  const register = async (name: string, email: string, phone: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
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
      // Role logic: check if it's the admin email
      const role = email.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          full_name: name,
          phone: phone,
          role: role,
          vip_level: "None"
        }
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
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
        addTickets,
        isModalOpen,
        setModalOpen,
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
