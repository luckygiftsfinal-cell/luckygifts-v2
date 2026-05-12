import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

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
  loading: boolean;
  addCategory: (cat: Partial<Category>) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (order: Partial<Order>) => Promise<void>;
  updateVIPPackage: (pkg: VIPPackage) => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialVIPPackages: VIPPackage[] = [
  { id: 'starter', name: 'Starter', price: 99, entries: 3, eventTicketsLabel: '1 EVENT TICKET', iconName: 'Star', features: ['1 Ticket VIP Member Draw', '1 Ticket Cash Dream', '1 Ticket Luxury Dream', '2 Daily Spins', '1 Free Gift'], popular: false },
  { id: 'gold', name: 'Gold', price: 199, entries: 6, eventTicketsLabel: '1 VIP EVENT TICKET', iconName: 'Crown', features: ['2 Tickets VIP Member Draw', '2 Tickets Cash Dream', '2 Tickets Luxury Dream', '4 Daily Spins', '2 Free Gifts'], popular: true },
  { id: 'platinum', name: 'Platinum', price: 299, entries: 10, iconName: 'Gem', eventTicketsLabel: '3 VIP EVENT TICKETS', features: ['5 Tickets VIP Member Draw', '3 Tickets Cash Dream', '2 Tickets Luxury Dream', '5 Daily Spins', '4 Free Gifts'], popular: false }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [draws, setDraws] = useState<PrizeDraw[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vipPackages, setVipPackages] = useState<VIPPackage[]>(initialVIPPackages);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData) {
        const mappedProducts = prodData.map(p => ({
          ...p,
          originalPrice: p.original_price?.toString(),
          price: p.price.toString(),
          tickets: p.tickets.toString(),
          stock: p.stock.toString(),
          category: p.category_key,
          mainImage: p.main_image,
          isHot: p.is_hot
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCategory = async (cat: Partial<Category>) => {
    const { error } = await supabase.from('categories').insert([cat]);
    if (!error) await fetchData();
  };

  const updateCategory = async (cat: Category) => {
    const { error } = await supabase.from('categories').update(cat).eq('id', cat.id);
    if (!error) await fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const addProduct = async (product: Partial<Product>) => {
    const dbProduct = {
      title: product.title,
      description: product.description,
      price: parseFloat(product.price || "0"),
      original_price: parseFloat(product.originalPrice || "0"),
      tickets: parseInt(product.tickets || "0"),
      stock: parseInt(product.stock || "0"),
      prize: product.prize,
      main_image: product.mainImage,
      category_key: product.category,
      is_hot: product.isHot
    };
    const { error } = await supabase.from('products').insert([dbProduct]);
    if (!error) await fetchData();
  };

  const updateProduct = async (product: Product) => {
    const dbProduct = {
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      original_price: parseFloat(product.originalPrice || "0"),
      tickets: parseInt(product.tickets),
      stock: parseInt(product.stock),
      prize: product.prize,
      main_image: product.mainImage,
      category_key: product.category,
      is_hot: product.isHot
    };
    const { error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
    if (!error) await fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const addOrder = async (order: Partial<Order>) => {
    // For now, orders still local or you can create a table for them
    const newOrder = { ...order, id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, date: new Date().toISOString().split('T')[0] } as Order;
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateVIPPackage = (pkg: VIPPackage) => {
    setVipPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
  };

  return (
    <StoreContext.Provider value={{ 
      categories, draws, products, orders, vipPackages, loading,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateVIPPackage,
      refreshData: fetchData
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
