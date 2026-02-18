import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu, X, Search, ShoppingCart, LayoutDashboard, 
  Home, Package, Grid3X3, Phone, ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
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

  const isAdmin_ = location.startsWith("/admin");
  if (isAdmin_) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        {/* Top bar */}
        <div className="bg-[#1E5A8E] text-white">
          <div className="container flex items-center justify-between h-12 md:h-14">
            {/* Left: Logo + Name */}
            <Link href="/">
              <div className="flex items-center gap-2">
                <img
                  src={settings.logoUrl}
                  alt={settings.shopName}
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover bg-white p-0.5"
                />
                <div className="hidden sm:block">
                  <div className="font-bold text-sm md:text-base leading-tight">
                    {settings.shopName}
                  </div>
                  <div className="text-[10px] md:text-xs opacity-80 leading-tight">
                    {settings.shopSlogan}
                  </div>
                </div>
                <span className="sm:hidden font-bold text-sm">Jappandal</span>
              </div>
            </Link>

            {/* Center: Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <form onSubmit={handleSearch} className="w-full relative">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 rounded-full bg-white/90 text-foreground border-0 text-sm placeholder:text-gray-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link href="/panier">
                <div className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#A8D24E] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <div className="hidden sm:flex p-2 hover:bg-white/10 rounded-full transition-colors" title="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden bg-white border-b px-4 py-2">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-0 text-sm"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* Desktop navigation */}
        <nav className="hidden md:block bg-white border-b">
          <div className="container flex items-center gap-6 h-10">
            <Link href="/">
              <span className={`text-sm font-medium transition-colors hover:text-[#1E5A8E] ${location === "/" ? "text-[#1E5A8E] font-semibold" : "text-gray-600"}`}>
                Accueil
              </span>
            </Link>
            <Link href="/produits">
              <span className={`text-sm font-medium transition-colors hover:text-[#1E5A8E] ${location === "/produits" ? "text-[#1E5A8E] font-semibold" : "text-gray-600"}`}>
                Nos Produits
              </span>
            </Link>
            <Link href="/categories">
              <span className={`text-sm font-medium transition-colors hover:text-[#1E5A8E] ${location === "/categories" ? "text-[#1E5A8E] font-semibold" : "text-gray-600"}`}>
                Catégories
              </span>
            </Link>
            <Link href="/contact">
              <span className={`text-sm font-medium transition-colors hover:text-[#1E5A8E] ${location === "/contact" ? "text-[#1E5A8E] font-semibold" : "text-gray-600"}`}>
                Contact
              </span>
            </Link>
          </div>
        </nav>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-12 z-50 bg-white">
            <nav className="flex flex-col p-4 gap-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location === "/" ? "bg-[#1E5A8E]/10 text-[#1E5A8E]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Accueil</span>
                </div>
              </Link>
              <Link href="/produits" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location === "/produits" ? "bg-[#1E5A8E]/10 text-[#1E5A8E]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Nos Produits</span>
                </div>
              </Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location === "/categories" ? "bg-[#1E5A8E]/10 text-[#1E5A8E]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Grid3X3 className="h-5 w-5" />
                  <span className="font-medium">Catégories</span>
                </div>
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location === "/contact" ? "bg-[#1E5A8E]/10 text-[#1E5A8E]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Contact</span>
                </div>
              </Link>
              <Link href="/panier" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location === "/panier" ? "bg-[#1E5A8E]/10 text-[#1E5A8E]" : "text-gray-700 hover:bg-gray-50"}`}>
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Mon Panier</span>
                  {totalItems > 0 && (
                    <span className="ml-auto bg-[#A8D24E] text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
              {isAdmin && (
                <>
                  <div className="border-t my-2" />
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
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
                  className="flex-1 text-center py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:${settings.phone1}`}
                  className="flex-1 text-center py-2 bg-[#1E5A8E] text-white rounded-lg text-sm font-medium"
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
