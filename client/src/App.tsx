import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import React, { Suspense } from "react";

// Lazy loading for all pages to split the JavaScript bundle and speed up loading
const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Categories = React.lazy(() => import("./pages/Categories"));
const CategoryDetail = React.lazy(() => import("./pages/CategoryDetail"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Cart = React.lazy(() => import("./pages/Cart"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = React.lazy(() => import("./pages/admin/Products"));
const AdminCategories = React.lazy(() => import("./pages/admin/Categories"));
const AdminOrders = React.lazy(() => import("./pages/admin/Orders"));
const AdminCustomers = React.lazy(() => import("./pages/admin/Customers"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));
const AdminStatistics = React.lazy(() => import("./pages/admin/Statistics"));
const AdminAppearance = React.lazy(() => import("./pages/admin/Appearance"));
const AdminAffiliateLinks = React.lazy(() => import("./pages/admin/AffiliateLinks"));
const AdminAdBanners = React.lazy(() => import("./pages/admin/AdBanners"));
const AdminLogin = React.lazy(() => import("./pages/admin/Login"));
const AdminMarketing = React.lazy(() => import("./pages/admin/Marketing"));
const AdminAddProduct = React.lazy(() => import("./pages/admin/AddProduct"));
const CustomerLogin = React.lazy(() => import("./pages/account/Login"));
const CustomerRegister = React.lazy(() => import("./pages/account/Register"));
const CustomerAccount = React.lazy(() => import("./pages/account/Account"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = React.lazy(() => import("./pages/PaymentCancel"));
const OrderTracking = React.lazy(() => import("./pages/OrderTracking"));
const Launch = React.lazy(() => import("./pages/Launch"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A8D24E]"></div></div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/produits" component={Products} />
        <Route path="/produits/:id" component={ProductDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/:slug" component={CategoryDetail} />
        <Route path="/contact" component={Contact} />
        <Route path="/panier" component={Cart} />
        <Route path="/paiement-succes" component={PaymentSuccess} />
        <Route path="/paiement-annule" component={PaymentCancel} />
        <Route path="/suivi-commande" component={OrderTracking} />

        {/* Espace client */}
        <Route path="/compte" component={CustomerAccount} />
        <Route path="/compte/connexion" component={CustomerLogin} />
        <Route path="/compte/inscription" component={CustomerRegister} />

        {/* Page de lancement */}
        <Route path="/lancement" component={Launch} />

        {/* Admin Login */}
        <Route path="/yamanetech/login" component={AdminLogin} />
        <Route path="/admin/login" component={AdminLogin} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/produits" component={AdminProducts} />
        <Route path="/admin/produits/ajouter" component={AdminAddProduct} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/commandes" component={AdminOrders} />
        <Route path="/admin/clients" component={AdminCustomers} />
        <Route path="/admin/parametres" component={AdminSettings} />
        <Route path="/admin/statistiques" component={AdminStatistics} />
        <Route path="/admin/liens-affilies" component={AdminAffiliateLinks} />
        <Route path="/admin/bannieres-pub" component={AdminAdBanners} />
        <Route path="/admin/apparence" component={AdminAppearance} />
        <Route path="/admin/marketing" component={AdminMarketing} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SettingsProvider>
          <CustomerProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CartProvider>
          </CustomerProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
