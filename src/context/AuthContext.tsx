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
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<void>;
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

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
            vipLevel: profile.vip_level,
            ticketBalance: profile.ticket_balance || 0
          });
          setEarnedTickets(profile.ticket_balance || 0);
        }
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
            vipLevel: profile.vip_level,
            ticketBalance: profile.ticket_balance || 0
          });
          setEarnedTickets(profile.ticket_balance || 0);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || "",
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    setModalOpen(false);
    toast.success(`Welcome back!`);
    setIsLoading(false);
  };

  const register = async (name: string, email: string, phone: string, password?: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || "",
      options: {
        data: {
          full_name: name,
          phone: phone
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
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
    toast.success(`Account created successfully!`);
    setIsLoading(false);
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
