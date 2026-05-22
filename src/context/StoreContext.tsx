import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  name: string;
  key: string;
  color: string;
  icon: string;
  active: boolean;
  sort_order: number;
}

export interface PrizeDraw {
  id: string;
  name: string;
  category_key: string;
  sort_order: number;
  active: boolean;
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
  lemonVariantId?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  total_amount: number;
  discount_amount?: number;
  payment_method: string;
  status: string;
  items: any;
  tickets_earned: number;
  referrer_id?: string;
  payment_details?: any;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
}

export interface UserTicket {
  id: string;
  user_id: string;
  order_id: string;
  ticket_code: string;
  status: string;
  created_at: string;
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
  tickets: UserTicket[];
  promoCodes: PromoCode[];
  vipPackages: VIPPackage[];
  loading: boolean;
  addCategory: (cat: Partial<Category>) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (ids: string[]) => Promise<void>;
  addDraw: (draw: Partial<PrizeDraw>) => Promise<void>;
  updateDraw: (draw: PrizeDraw) => Promise<void>;
  deleteDraw: (id: string) => Promise<void>;
  reorderDraws: (ids: string[]) => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (order: Partial<Order>) => Promise<string>;
  updateOrder: (order: Order) => Promise<void>;
  validatePromoCode: (code: string) => Promise<PromoCode | null>;
  addPromoCode: (promo: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  issueTickets: (orderId: string, userId: string, count: number) => Promise<string[]>;
  updateVIPPackage: (pkg: VIPPackage) => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialVIPPackages: VIPPackage[] = [];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [draws, setDraws] = useState<PrizeDraw[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [vipPackages, setVipPackages] = useState<VIPPackage[]>(initialVIPPackages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleReferral();
    fetchData();
  }, []);

  const handleReferral = () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('luckygifts_ref', ref);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories ordered by sort_order
      const { data: catData } = await supabase
        .from('categories').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (catData) setCategories(catData);

      // Fetch Prize Draws ordered by sort_order
      const { data: drawData } = await supabase
        .from('prize_draws').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (drawData) setDraws(drawData);

      // Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').order('price', { ascending: true });
      if (prodData) {
        const mappedProducts = prodData.map(p => ({
          ...p,
          originalPrice: p.original_price?.toString(),
          price: p.price.toString(),
          tickets: p.tickets.toString(),
          stock: p.stock.toString(),
          category: p.category_key,
          mainImage: p.main_image,
          subImages: p.sub_images || [],
          lemonVariantId: p.lemon_variant_id,
          isHot: p.is_hot
        }));
        setProducts(mappedProducts);
      }

      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

      const { data: promoData } = await supabase.from('promo_codes').select('*');
      if (promoData) setPromoCodes(promoData);

      // Fetch VIP Packages
      const { data: vipData } = await supabase.from('vip_packages').select('*').eq('active', true).order('price', { ascending: true });
      if (vipData) {
        const mappedVip = vipData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          entries: parseInt(p.features?.find((f: string) => f.includes('entries'))?.match(/\d+/)?.[0] || '0'),
          eventTicketsLabel: p.features?.find((f: string) => f.toLowerCase().includes('event')) || 'VIP Event Access',
          iconName: p.icon || 'Star',
          features: p.features || [],
          popular: p.popular || false
        }));
        setVipPackages(mappedVip);
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Categories ──
  const addCategory = async (cat: Partial<Category>) => {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
    const dbCat = {
      name: cat.name || "New Category",
      key: cat.key || (cat.name || "new").replace(/\s+/g, "_").toUpperCase(),
      color: cat.color || "#FFD700",
      icon: cat.icon || "Tag",
      active: true,
      sort_order: maxOrder + 1,
    };
    const { error } = await supabase.from('categories').insert([dbCat]);
    if (error) { console.error("addCategory error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const updateCategory = async (cat: Category) => {
    const dbCat = {
      name: cat.name,
      key: cat.key || (cat.name || "").replace(/\s+/g, "_").toUpperCase(),
      color: cat.color || "#FFD700",
      icon: cat.icon || "Tag",
      active: cat.active !== false,
      sort_order: cat.sort_order || 0,
    };
    const { error } = await supabase.from('categories').update(dbCat).eq('id', cat.id);
    if (error) { console.error("updateCategory error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const reorderCategories = async (ids: string[]) => {
    const updates = ids.map((id, idx) => supabase.from('categories').update({ sort_order: idx }).eq('id', id));
    await Promise.all(updates);
    await fetchData();
  };

  // ── Prize Draws ──
  const addDraw = async (draw: Partial<PrizeDraw>) => {
    const maxOrder = draws.filter(d => d.category_key === draw.category_key)
      .reduce((max, d) => Math.max(max, d.sort_order || 0), 0);
    const dbDraw = {
      name: draw.name || "New Draw",
      category_key: draw.category_key || "",
      sort_order: maxOrder + 1,
      active: true,
    };
    const { error } = await supabase.from('prize_draws').insert([dbDraw]);
    if (error) { console.error("addDraw error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const updateDraw = async (draw: PrizeDraw) => {
    const { error } = await supabase.from('prize_draws').update({
      name: draw.name,
      category_key: draw.category_key,
      sort_order: draw.sort_order || 0,
      active: draw.active !== false,
    }).eq('id', draw.id);
    if (error) { console.error("updateDraw error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const deleteDraw = async (id: string) => {
    const { error } = await supabase.from('prize_draws').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const reorderDraws = async (ids: string[]) => {
    const updates = ids.map((id, idx) => supabase.from('prize_draws').update({ sort_order: idx }).eq('id', id));
    await Promise.all(updates);
    await fetchData();
  };

  // ── Products ──
  const addProduct = async (product: Partial<Product>) => {
    const dbProduct: Record<string, any> = {
      title: product.title || "Untitled Product",
      description: product.description || "",
      price: parseFloat(product.price || "0"),
      original_price: product.originalPrice ? parseFloat(product.originalPrice) : null,
      tickets: parseInt(product.tickets || "1"),
      stock: parseInt(product.stock || "100"),
      prize: product.prize || "Cash",
      main_image: product.mainImage || null,
      sub_images: product.subImages || [],
      category_key: product.category || product.prize || "Cash",
      is_hot: product.isHot || false,
    };
    if (product.lemonVariantId) dbProduct.lemon_variant_id = product.lemonVariantId;
    const { data, error } = await supabase.from('products').insert([dbProduct]).select();
    if (error) { console.error("Supabase insert error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const updateProduct = async (product: Product) => {
    const dbProduct: Record<string, any> = {
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      original_price: product.originalPrice ? parseFloat(product.originalPrice) : null,
      tickets: parseInt(product.tickets),
      stock: parseInt(product.stock),
      prize: product.prize,
      main_image: product.mainImage || null,
      sub_images: product.subImages || [],
      category_key: product.category,
      is_hot: product.isHot || false,
    };
    if (product.lemonVariantId) dbProduct.lemon_variant_id = product.lemonVariantId;
    const { error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
    if (error) { console.error("Supabase update error:", error); throw new Error(error.message); }
    await fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const addOrder = async (order: Partial<Order>) => {
    const { data, error } = await supabase.from('orders').insert([order]).select();
    if (!error && data) { await fetchData(); return data[0].id; }
    else { console.error("Error saving order:", error); throw error; }
  };

  const updateOrder = async (order: Order) => {
    const { error } = await supabase.from('orders').update(order).eq('id', order.id);
    if (!error) await fetchData();
  };

  const issueTickets = async (orderId: string, userId: string, count: number) => {
    const newTickets = [];
    const ticketCodes = [];
    for (let i = 0; i < count; i++) {
      const randomCode = `LG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      ticketCodes.push(randomCode);
      newTickets.push({ user_id: userId, order_id: orderId, ticket_code: randomCode, status: 'active' });
    }
    const { error } = await supabase.from('user_tickets').insert(newTickets);
    if (!error) { await fetchData(); return ticketCodes; }
    else { console.error("Error issuing tickets:", error); return []; }
  };

  const validatePromoCode = async (code: string) => {
    const { data, error } = await supabase.from('promo_codes').select('*')
      .eq('code', code.toUpperCase()).eq('is_active', true).single();
    if (error || !data) return null;
    if (data.current_uses >= data.max_uses) return null;
    return data as PromoCode;
  };

  const addPromoCode = async (promo: Partial<PromoCode>) => {
    const { error } = await supabase.from('promo_codes').insert([promo]);
    if (!error) fetchData();
  };

  const deletePromoCode = async (id: string) => {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) fetchData();
  };

  const updateVIPPackage = (pkg: VIPPackage) => {
    setVipPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
  };

  return (
    <StoreContext.Provider value={{
      categories, draws, products, orders, tickets, promoCodes, vipPackages, loading,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addDraw, updateDraw, deleteDraw, reorderDraws,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder, issueTickets, updateVIPPackage,
      validatePromoCode, addPromoCode, deletePromoCode,
      refreshData: fetchData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
