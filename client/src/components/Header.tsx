import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  Menu, X, Search, ShoppingCart, LayoutDashboard,
  Home, Package, Grid3X3, Phone, Zap, User, UserCheck, FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { generateReceipt } from "@/lib/generateReceipt";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingReceipt, setPendingReceipt] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jappandal_last_receipt");
    if (stored) {
      try { setPendingReceipt(JSON.parse(stored)); } catch {}
    }
  }, []);

  const dismissReceipt = () => {
    localStorage.removeItem("jappandal_last_receipt");
    setPendingReceipt(null);
  };
  const { user } = useAuth();
  const { customer } = useCustomer();
  const { totalItems } = useCart();
  const settings = useSettings();
  const isAdmin = user?.role === "admin";
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produits?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isAdminPage = location.startsWith("/admin");
  if (isAdminPage) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-lg">
        {/* Top bar d'annonce */}
        <div className="bg-[#1E5A8E] text-white py-1.5 px-4 text-xs sm:text-sm font-semibold text-center flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 w-full">
          <span>BOUTIQUE OUVERTE - LIVRAISON 7J/7 - DAKAR</span>
          <span className="hidden sm:inline">|</span>
          <a href={`tel:${settings.phone1}`} className="flex items-center gap-1 hover:text-[#A8D24E] transition-colors">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
            {settings.phone1}
          </a>
        </div>
        {/* Bandeau reçu en attente */}
        {pendingReceipt && (
          <div className="bg-[#A8D24E] text-white px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 shrink-0" />
              <span>Votre reçu de commande est disponible</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { generateReceipt(pendingReceipt); dismissReceipt(); }}
                className="bg-white text-[#5a8a1e] font-bold text-xs px-3 py-1.5 rounded-full active:scale-95 transition-transform"
              >
                Télécharger
              </button>
              <button onClick={dismissReceipt} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top bar — gradient animé */}
        <div className="header-gradient text-white relative overflow-hidden">
          {/* Orbe de lumière décoratif */}
          <div className="absolute -top-6 right-24 w-32 h-32 glow-orb bg-[#A8D24E] opacity-20 pointer-events-none" />
          <div className="container flex items-center justify-between h-12 md:h-14 relative z-10">
            {/* Logo + Nom */}
            <Link href="/">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <img
                    src={settings.logoUrl}
                    alt={settings.shopName}
                    className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover bg-white p-0.5 ring-2 ring-[#A8D24E]/40 group-hover:ring-[#A8D24E]/80 transition-all duration-300 shadow-md"
                    style={{ boxShadow: "0 0 10px rgba(168,210,78,0.3)" }}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-sm md:text-base leading-tight tracking-wide">
                    {settings.shopName}
                  </div>
                  <div className="text-[10px] md:text-xs opacity-75 leading-tight text-[#A8D24E]">
                    {settings.shopSlogan}
                  </div>
                </div>
                <span className="sm:hidden font-extrabold text-sm tracking-wider">
                  {settings.shopName || "Jappandal"}
                </span>
              </div>
            </Link>

            {/* Barre de recherche — desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <form onSubmit={handleSearch} className="w-full relative">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 rounded-full bg-white/90 text-gray-800 border-0 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#A8D24E]/60"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Icônes droite */}
            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-white/15 rounded-full transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Compte client */}
              <Link href={customer ? "/compte" : "/compte/connexion"}>
                {customer ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/15 transition-colors cursor-pointer" title={customer.name}>
                    <UserCheck className="h-5 w-5 text-[#A8D24E]" style={{ filter: "drop-shadow(0 0 4px rgba(168,210,78,0.6))" }} />
                    <span className="hidden sm:block text-xs font-semibold text-[#A8D24E] max-w-[80px] truncate">
                      {customer.name.split(" ")[0]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/30 hover:bg-white/15 transition-colors cursor-pointer">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-semibold hidden sm:block">Connexion</span>
                  </div>
                )}
              </Link>

              <Link href="/panier">
                <div className="relative p-2 hover:bg-white/15 rounded-full transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#A8D24E] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 cart-badge-neon">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <div className="hidden sm:flex p-2 hover:bg-white/15 rounded-full transition-colors" title="Dashboard Admin">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/15 rounded-full transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        {searchOpen && (
          <div className="md:hidden bg-white border-b px-4 py-2 shadow-md">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-0 text-sm focus:ring-2 focus:ring-[#1E5A8E]/30"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* Navigation desktop */}
        <nav className="hidden md:block bg-white border-b shadow-sm">
          <div className="container flex items-center gap-6 h-10">
            {[
              { href: "/", label: "Accueil" },
              { href: "/produits", label: "Nos Produits" },
              { href: "/categories", label: "Catégories" },
              { href: "/contact", label: "Contact" },
              { href: "/compte", label: customer ? `👤 ${customer.name.split(" ")[0]}` : "Mon Compte" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`text-sm font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#A8D24E] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 ${
                  location === href
                    ? "text-[#1E5A8E] font-bold after:scale-x-100"
                    : "text-gray-600 hover:text-[#1E5A8E]"
                }`}>
                  {label}
                </span>
              </Link>
            ))}

            {/* Badge promo Tabaski */}
            <Link href="/categories/packs-tabaski">
              <span className="ml-auto inline-flex items-center gap-1 badge-flash text-white text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer">
                <Zap className="h-3 w-3" /> Vente Flash
              </span>
            </Link>
          </div>
        </nav>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-12 z-50 bg-white shadow-2xl">
            <nav className="flex flex-col p-4 gap-1">
              {[
                { href: "/", icon: Home, label: "Accueil" },
                { href: "/produits", icon: Package, label: "Nos Produits" },
                { href: "/categories", icon: Grid3X3, label: "Catégories" },
                { href: "/contact", icon: Phone, label: "Contact" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location === href
                      ? "bg-[#1E5A8E]/10 text-[#1E5A8E] shadow-sm glow-border-blue"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                </Link>
              ))}

              <Link href="/panier" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location === "/panier"
                    ? "bg-[#1E5A8E]/10 text-[#1E5A8E] shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}>
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Mon Panier</span>
                  {totalItems > 0 && (
                    <span className="ml-auto bg-[#A8D24E] text-white text-xs font-black rounded-full px-2 py-0.5 cart-badge-neon">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>

              <Link href={customer ? "/compte" : "/compte/connexion"} onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.startsWith("/compte")
                    ? "bg-[#A8D24E]/10 text-[#5a8e1e] shadow-sm"
                    : customer
                    ? "text-gray-700 hover:bg-gray-50"
                    : "bg-[#1E5A8E] text-white"
                }`}>
                  {customer ? <UserCheck className="h-5 w-5 text-[#A8D24E]" /> : <User className="h-5 w-5" />}
                  <span className="font-medium">{customer ? customer.name : "Se connecter / Créer un compte"}</span>
                  {customer && <span className="ml-auto text-xs bg-[#A8D24E]/15 text-[#A8D24E] px-2 py-0.5 rounded-full font-semibold">Connecté</span>}
                </div>
              </Link>

              <Link href="/categories/packs-tabaski" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl badge-flash text-white mt-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-bold">🐏 Ventes Flash Tabaski</span>
                </div>
              </Link>

              {isAdmin && (
                <>
                  <div className="border-t my-2" />
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard Admin</span>
                    </div>
                  </Link>
                </>
              )}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Contactez-nous :</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold whatsapp-neon"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${settings.phone1}`}
                  className="flex-1 text-center py-2.5 bg-[#1E5A8E] text-white rounded-xl text-sm font-bold neon-blue"
                >
                  Appeler
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
