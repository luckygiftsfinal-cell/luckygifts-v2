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
  period: string;
  features: string[];
  color: string;
  icon: string;
  popular: boolean;
  active: boolean;
  event_label: string;
  tickets_count: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'cancelled';
  order_id: string | null;
  order_amount: number;
  points_earned: number;
  created_at: string;
  completed_at: string | null;
}

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

interface StoreContextType {
  categories: Category[];
  draws: PrizeDraw[];
  products: Product[];
  orders: Order[];
  tickets: UserTicket[];
  promoCodes: PromoCode[];
  vipPackages: VIPPackage[];
  referrals: Referral[];
  userPoints: UserPoints[];
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
  completeReferral: (orderId: string, userId: string, orderAmount: number) => Promise<void>;
  getUserReferrals: (userId: string) => Promise<Referral[]>;
  getUserPoints: (userId: string) => Promise<UserPoints | null>;
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
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleReferral();
    fetchData();
  }, []);

  const handleReferral = () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('luckygifts_ref_code', ref);
      document.cookie = `luckygifts_ref=${ref}; path=/; max-age=604800`;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase
        .from('categories').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (catData) setCategories(catData);

      const { data: drawData } = await supabase
        .from('prize_draws').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (drawData) setDraws(drawData);

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
          isHot: p.is_hot,
          isPopular: p.is_popular,
        }));
        setProducts(mappedProducts);
      }

      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

      const { data: promoData } = await supabase.from('promo_codes').select('*');
      if (promoData) setPromoCodes(promoData);

      const { data: vipData } = await supabase.from('vip_packages').select('*').eq('active', true).order('price', { ascending: true });
      if (vipData) {
        const mappedVip = vipData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          period: p.period || 'one-time',
          features: p.features || [],
          color: p.color || '#FFD700',
          icon: p.icon || 'Star',
          popular: p.popular || false,
          active: p.active !== false,
          event_label: p.event_label || 'VIP Event Access',
          tickets_count: p.tickets_count || 0,
        }));
        setVipPackages(mappedVip);
      }

      const { data: refData } = await supabase.from('referrals').select('*').order('created_at', { ascending: false });
      if (refData) setReferrals(refData);

      const { data: pointsData } = await supabase.from('user_points').select('*');
      if (pointsData) setUserPoints(pointsData);
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

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
      is_popular: product.isPopular || false,
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
      is_popular: product.isPopular || false,
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

  const completeReferral = async (orderId: string, userId: string, orderAmount: number) => {
    try {
      const { data: referral, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', userId)
        .eq('status', 'pending')
        .single();

      if (refError || !referral) {
        console.log("No pending referral found for user:", userId);
        return;
      }

      const pointsEarned = Math.floor(orderAmount / 35);

      if (pointsEarned <= 0) {
        await supabase
          .from('referrals')
          .update({
            status: 'completed',
            order_id: orderId,
            order_amount: orderAmount,
            points_earned: 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', referral.id);
        await fetchData();
        return;
      }

      await supabase
        .from('referrals')
        .update({
          status: 'completed',
          order_id: orderId,
          order_amount: orderAmount,
          points_earned: pointsEarned,
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      const { data: referrerPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', referral.referrer_id)
        .single();

      if (referrerPoints) {
        await supabase
          .from('user_points')
          .update({
            points: referrerPoints.points + pointsEarned,
            total_earned: referrerPoints.total_earned + pointsEarned,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referral.referrer_id);
      }

      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('total_referrals, referral_points')
        .eq('id', referral.referrer_id)
        .single();

      if (referrerProfile) {
        await supabase
          .from('profiles')
          .update({
            total_referrals: (referrerProfile.total_referrals || 0) + 1,
            referral_points: (referrerProfile.referral_points || 0) + pointsEarned
          })
          .eq('id', referral.referrer_id);
      }

      await fetchData();
      console.log(`Referral completed: ${pointsEarned} points awarded to referrer ${referral.referrer_id}`);
    } catch (err) {
      console.error("Error completing referral:", err);
    }
  };

  const getUserReferrals = async (userId: string): Promise<Referral[]> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user referrals:", error);
      return [];
    }
    return data || [];
  };

  const getUserPoints = async (userId: string): Promise<UserPoints | null> => {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error fetching user points:", error);
      return null;
    }
    return data;
  };

  return (
    <StoreContext.Provider value={{
      categories, draws, products, orders, tickets, promoCodes, vipPackages, referrals, userPoints, loading,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addDraw, updateDraw, deleteDraw, reorderDraws,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder, issueTickets, updateVIPPackage,
      validatePromoCode, addPromoCode, deletePromoCode,
      completeReferral, getUserReferrals, getUserPoints,
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
