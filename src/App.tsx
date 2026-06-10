import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
import { supabase } from "./lib/supabase";
import Navigation from "./components/Navigation";
import PageHeaderActions from "./components/PageHeaderActions";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Public Pages
const HomePage = lazy(() => import("./pages/HomePage"));
const WinnersPage = lazy(() => import("./pages/WinnersPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrizesPage = lazy(() => import("./pages/PrizesPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const VIPPage = lazy(() => import("./pages/VIPPage"));
const VIPContactPage = lazy(() => import("./pages/VIPContactPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const WhyTrustUsPage = lazy(() => import("./pages/WhyTrustUsPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const WorkWithUsPage = lazy(() => import("./pages/WorkWithUsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Admin Pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDreamStore = lazy(() => import("./pages/admin/AdminDreamStore"));
const AdminVIPPackages = lazy(() => import("./pages/admin/AdminVIPPackages"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminWinners = lazy(() => import("./pages/admin/AdminWinners"));
const AdminPromoCodes = lazy(() => import("./pages/admin/AdminPromoCodes"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gold/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-slate-400 text-sm font-medium tracking-wide">Loading...</p>
    </div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function PayPalWrapper({ children }: { children: React.ReactNode }) {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["paypal_client_id"])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach((r: any) => { map[r.key] = r.value; });
        setClientId(
          map.paypal_client_id ||
          import.meta.env.VITE_PAYPAL_CLIENT_ID ||
          "test"
        );
      });
  }, []);

  // Wait until client ID is loaded
  if (!clientId) return <>{children}</>;

  return (
    <PayPalScriptProvider options={{
      "client-id": clientId,
      currency: "USD",
      intent: "capture",
      components: "buttons",
      "disable-funding": "paylater",
    }}>
      {children}
    </PayPalScriptProvider>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <StoreProvider>
      <CartProvider>
        <AuthProvider>
          <PayPalWrapper>
            <ScrollToTop />
            <AuthModal />
            <Toaster 
              position="top-right" 
              expand={false} 
              richColors 
              toastOptions={{
                style: {
                  background: '#12121a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                },
              }}
            />

            {!isAdminRoute && <Navigation />}

            <main className={isAdminRoute ? "" : "min-h-screen bg-dark-900"}>
              {!isAdminRoute && <PageHeaderActions />}

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/winners" element={<WinnersPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/prizes" element={<PrizesPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/vip" element={<VIPPage />} />
                  <Route path="/vip-contact" element={<VIPContactPage />} />

                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/trust" element={<WhyTrustUsPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/work-with-us" element={<WorkWithUsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="dream-store" element={<AdminDreamStore />} />
                    <Route path="vip-packages" element={<AdminVIPPackages />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="winners" element={<AdminWinners />} />
                    <Route path="promo-codes" element={<AdminPromoCodes />} />
                    <Route path="applications" element={<AdminApplications />} />
                  </Route>

                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
                      <div className="text-center max-w-md">
                        <div className="text-8xl mb-6 animate-bounce">🔍</div>
                        <h1 className="text-5xl font-bold text-white mb-4 gradient-text">404</h1>
                        <p className="text-slate-400 mb-8 text-lg">Page not found</p>
                        <a href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Go Home
                        </a>
                      </div>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </main>

            {!isAdminRoute && <Footer />}
          </PayPalWrapper>
        </AuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
