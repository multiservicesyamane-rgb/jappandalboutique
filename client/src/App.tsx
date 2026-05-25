import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import AdminStatistics from "./pages/admin/Statistics";
import AdminAppearance from "./pages/admin/Appearance";
import AdminAffiliateLinks from "./pages/admin/AffiliateLinks";
import AdminAdBanners from "./pages/admin/AdBanners";
import AdminLogin from "./pages/admin/Login";
import AdminMarketing from "./pages/admin/Marketing";
import AdminAddProduct from "./pages/admin/AddProduct";
import CustomerLogin from "./pages/account/Login";
import CustomerRegister from "./pages/account/Register";
import CustomerAccount from "./pages/account/Account";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Launch from "./pages/Launch";

function Router() {
  return (
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
