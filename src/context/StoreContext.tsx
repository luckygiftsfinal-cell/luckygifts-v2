import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  key: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface PrizeDraw {
  id: string;
  name: string;
  category: string;
  status: string;
  entries: number;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  tickets: string;
  stock: string;
  prize: string;
  mainImage?: string;
  subImages?: string[];
  isHot?: boolean;
  isPopular?: boolean;
  category?: string;
}

export interface Order {
  id: string;
  user: string;
  date: string;
  total: string;
  status: string;
  items: number;
  payment: string;
}

export interface VIPPackage {
  id: string;
  name: string;
  price: number;
  entries: number;
  eventTicketsLabel: string;
  iconName: string;
  features: string[];
  popular: boolean;
}

interface StoreContextType {
  categories: Category[];
  draws: PrizeDraw[];
  products: Product[];
  orders: Order[];
  vipPackages: VIPPackage[];
  addCategory: (cat: Partial<Category>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addDraw: (draw: Partial<PrizeDraw>) => void;
  updateDraw: (draw: PrizeDraw) => void;
  deleteDraw: (id: string) => void;
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Partial<Order>) => void;
  updateOrder: (order: Order) => void;
  updateVIPPackage: (pkg: VIPPackage) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialVIPPackages: VIPPackage[] = [
  { id: 'starter', name: 'Starter', price: 99, entries: 3, eventTicketsLabel: '1 EVENT TICKET', iconName: 'Star', features: ['1 Ticket VIP Member Draw', '1 Ticket Cash Dream', '1 Ticket Luxury Dream', '2 Daily Spins', '1 Free Gift'], popular: false },
  { id: 'gold', name: 'Gold', price: 199, entries: 6, eventTicketsLabel: '1 VIP EVENT TICKET', iconName: 'Crown', features: ['2 Tickets VIP Member Draw', '2 Tickets Cash Dream', '2 Tickets Luxury Dream', '4 Daily Spins', '2 Free Gifts'], popular: true },
  { id: 'platinum', name: 'Platinum', price: 299, entries: 10, iconName: 'Gem', eventTicketsLabel: '3 VIP EVENT TICKETS', features: ['5 Tickets VIP Member Draw', '3 Tickets Cash Dream', '2 Tickets Luxury Dream', '5 Daily Spins', '4 Free Gifts'], popular: false }
];

const initialCategories: Category[] = [
  { id: "1", name: "Cash Dream", key: "Cash", color: "#22c55e", icon: "DollarSign", active: true },
  { id: "2", name: "Luxury Dream", key: "Luxury", color: "#FFD700", icon: "Gem", active: true },
  { id: "3", name: "Tech Dream", key: "Tech", color: "#38bdf8", icon: "Zap", active: true },
];

const initialDraws: PrizeDraw[] = [
  { id: "1", name: "$1,000,000 Cash", category: "Cash", status: "Active", entries: 18420 },
  { id: "2", name: "Range Rover Defender", category: "Luxury", status: "Active", entries: 800 },
  { id: "3", name: "Rolex Datejust 41", category: "Luxury", status: "Active", entries: 450 },
  { id: "4", name: "Tech Pack (MacBook + iPhone + PS5)", category: "Tech", status: "Active", entries: 5000 },
];

const initialProducts: Product[] = [
  { id: "1", title: "Premium Pencil Set", price: "50", originalPrice: "75", tickets: "1", prize: "$1,000,000 Cash", mainImage: "/images/prize_cash.png", category: "Cash", stock: "18420", isHot: true },
  { id: "2", title: "Luxury Pen", price: "100", tickets: "2", prize: "$1,000,000 Cash", mainImage: "/images/prize_cash.png", category: "Cash", stock: "12300" },
  { id: "3", title: "Gold Keychain", price: "150", originalPrice: "200", tickets: "3", prize: "Range Rover Defender", mainImage: "/images/prize_luxury.png", category: "Luxury", stock: "800", isHot: true },
];

const initialOrders: Order[] = [
  { id: "ORD-7742", user: "Ahmed Al-Maktoum", date: "2026-05-10", total: "$150.00", status: "Delivered", items: 3, payment: "Credit Card" },
  { id: "ORD-7743", user: "Sarah Johnson", date: "2026-05-11", total: "$25.00", status: "Pending", items: 1, payment: "PayPal" },
  { id: "ORD-7744", user: "Khalid Mansour", date: "2026-05-11", total: "$500.00", status: "Processing", items: 5, payment: "Bank Transfer" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('lucky_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [draws, setDraws] = useState<PrizeDraw[]>(() => {
    const saved = localStorage.getItem('lucky_draws');
    return saved ? JSON.parse(saved) : initialDraws;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lucky_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lucky_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [vipPackages, setVipPackages] = useState<VIPPackage[]>(() => {
    const saved = localStorage.getItem('lucky_vip_packages');
    return saved ? JSON.parse(saved) : initialVIPPackages;
  });

  useEffect(() => {
    localStorage.setItem('lucky_categories', JSON.stringify(categories));
    localStorage.setItem('lucky_draws', JSON.stringify(draws));
    localStorage.setItem('lucky_products', JSON.stringify(products));
    localStorage.setItem('lucky_orders', JSON.stringify(orders));
    localStorage.setItem('lucky_vip_packages', JSON.stringify(vipPackages));
  }, [categories, draws, products, orders, vipPackages]);

  const addCategory = (cat: Partial<Category>) => {
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9), active: true } as Category;
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addDraw = (draw: Partial<PrizeDraw>) => {
    const newDraw = { ...draw, id: `DRAW-${Math.floor(1000 + Math.random() * 9000)}` } as PrizeDraw;
    setDraws(prev => [...prev, newDraw]);
  };

  const updateDraw = (draw: PrizeDraw) => {
    setDraws(prev => prev.map(d => d.id === draw.id ? draw : d));
  };

  const deleteDraw = (id: string) => {
    setDraws(prev => prev.filter(d => d.id !== id));
  };

  const addProduct = (product: Partial<Product>) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) } as Product;
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addOrder = (order: Partial<Order>) => {
    const newOrder = { ...order, id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, date: new Date().toISOString().split('T')[0] } as Order;
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrder = (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const updateVIPPackage = (pkg: VIPPackage) => {
    setVipPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
  };

  return (
    <StoreContext.Provider value={{ 
      categories, draws, products, orders, vipPackages,
      addCategory, updateCategory, deleteCategory,
      addDraw, updateDraw, deleteDraw,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder,
      updateVIPPackage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
