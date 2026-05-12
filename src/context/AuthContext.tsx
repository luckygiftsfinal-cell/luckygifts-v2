import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vipLevel: "None" | "Gold" | "Diamond";
  role: "user" | "admin";
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
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, phone: string) => Promise<void>;
  logout: () => void;
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

  const addTickets = (count: number) => {
    const newVal = earnedTickets + count;
    setEarnedTickets(newVal);
    localStorage.setItem('earned_tickets', newVal.toString());
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("lg_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const role = email.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";
    
    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email: email,
      vipLevel: "None",
      role: role
    };
    
    setUser(mockUser);
    localStorage.setItem("lg_user", JSON.stringify(mockUser));
    setModalOpen(false);
    toast.success(`Welcome back, ${mockUser.name}!`);
  };

  const register = async (name: string, email: string, phone: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const role = email.toLowerCase() === "luckygiftsfinal@gmail.com" ? "admin" : "user";
    
    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      phone: phone,
      vipLevel: "None",
      role: role
    };
    
    setUser(mockUser);
    localStorage.setItem("lg_user", JSON.stringify(mockUser));
    setModalOpen(false);
    toast.success(`Account created successfully!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lg_user");
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
