import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "./components/Navigation";
import PageHeaderActions from "./components/PageHeaderActions";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import HomePage from "./pages/HomePage";
import WinnersPage from "./pages/WinnersPage";
import FAQPage from "./pages/FAQPage";
import PrizesPage from "./pages/PrizesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import VIPPage from "./pages/VIPPage";
import DreamStorePage from "./pages/DreamStorePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutUsPage from "./pages/AboutUsPage";
import WhyTrustUsPage from "./pages/WhyTrustUsPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import WorkWithUsPage from "./pages/WorkWithUsPage";
import ContactPage from "./pages/ContactPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDreamStore from "./pages/admin/AdminDreamStore";
import AdminVIPPackages from "./pages/admin/AdminVIPPackages";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <StoreProvider>
      <CartProvider>
        <AuthProvider>
          <PayPalScriptProvider options={{ 
            "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
            currency: "USD",
            intent: "capture"
          }}>
          <ScrollToTop />
          <AuthModal />
          <CartSidebar />
          <Toaster position="top-right" expand={false} richColors />
          <div className="noise-overlay" />
          
          {!isAdminRoute && <Navigation />}
          
          <main>
            {!isAdminRoute && <PageHeaderActions />}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/winners" element={<WinnersPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/prizes" element={<PrizesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/vip" element={<VIPPage />} />
              <Route path="/store" element={<DreamStorePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/trust" element={<WhyTrustUsPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/work-with-us" element={<WorkWithUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="dream-store" element={<AdminDreamStore />} />
                <Route path="vip-packages" element={<AdminVIPPackages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<div className="p-8 text-white">Admin Module Coming Soon...</div>} />
              </Route>

              <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-white">404 - Page Coming Soon</div>} />
            </Routes>
          </main>
          
          {!isAdminRoute && <Footer />}
          </PayPalScriptProvider>
        </AuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
