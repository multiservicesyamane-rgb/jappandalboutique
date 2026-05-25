import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AdBanner } from "@/components/AdBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { playNotificationSound } from "@/lib/playNotificationSound";
import { toast } from "sonner";
import {
  ChevronRight, Truck, ShieldCheck,
  Clock, BadgePercent, ShoppingBag, MessageCircle,
  ShoppingCart, Check, Star, Zap
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const { addItem } = useCart();
  const [, navigate] = useLocation();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();

  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Group products by category
  const productsByCategory = categories?.map((cat) => ({
    ...cat,
    products: products?.filter((p) => p.categoryId === cat.id) || [],
  })) || [];

  // Featured products (first 8, fills 4-col grid with 2 rows)
  const featuredProducts = products?.slice(0, 8) || [];

  // Filter Tabaski Packs
  const tabaskiCategory = categories?.find((c) => c.slug === "packs-tabaski");
  const tabaskiProducts = products
    ?.filter((p) => p.categoryId === tabaskiCategory?.id)
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) || [];

  // Strikethrough price generator
  const getOriginalPrice = (price: string) => {
    const val = parseFloat(price);
    if (val === 9900) return "12 900";
    if (val === 12900) return "16 900";
    if (val === 15900) return "20 900";
    if (val === 19900) return "25 900";
    if (val === 22900) return "29 900";
    if (val === 25900) return "34 900";
    if (val === 29900) return "39 900";
    if (val === 35900) return "46 900";
    if (val === 45900) return "59 900";
    if (val === 59900) return "79 900";
    return Math.round(val * 1.25).toLocaleString("fr-FR");
  };

  const getDiscountPercent = (price: string) => {
    const val = parseFloat(price);
    if (val === 9900) return "-23%";
    if (val === 12900) return "-24%";
    if (val === 15900) return "-24%";
    if (val === 19900) return "-23%";
    if (val === 22900) return "-23%";
    if (val === 25900) return "-26%";
    if (val === 29900) return "-25%";
    if (val === 35900) return "-24%";
    if (val === 45900) return "-23%";
    if (val === 59900) return "-25%";
    return "-20%";
  };

  // Add to cart handler
  const handleAddPackToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl
    });
    playNotificationSound();
    toast.success(`${product.name} ajouté au panier !`);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 0, minutes: 31, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll categories
  useEffect(() => {
    const el = categoriesScrollRef.current;
    if (!el) return;
    let scrollPos = 0;
    const speed = 0.5;
    let animId: number;
    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth - el.clientWidth) scrollPos = 0;
      el.scrollLeft = scrollPos;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(animate); };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [categories]);

  const advantages = [
    { icon: Truck, label: "Livraison 24h", sub: "Dakar & Banlieue" },
    { icon: ShieldCheck, label: "Qualité garantie", sub: "Frais & sélectionné" },
    { icon: BadgePercent, label: "Meilleurs prix", sub: "Qualité/prix imbattable" },
    { icon: Clock, label: "Service 7j/7", sub: "Réactivité assurée" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ─── HERO BANNER ─── */}
      <section className="header-gradient text-white relative overflow-hidden">
        {/* Orbes neon de fond */}
        <div className="absolute -top-10 right-10 w-56 h-56 glow-orb bg-[#A8D24E] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 glow-orb bg-[#1E5A8E] opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 glow-orb bg-[#25D366] opacity-15 pointer-events-none" />

        <div className="container py-4 sm:py-5 md:py-8 relative z-10">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black"
                  style={{ background: "rgba(168,210,78,0.18)", border: "1px solid rgba(168,210,78,0.6)", color: "#A8D24E", boxShadow: "0 0 10px rgba(168,210,78,0.25)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8D24E] animate-pulse flex-shrink-0" />
                  🛍️ BOUTIQUE OUVERTE
                </span>
                <span className="badge-flash text-white text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <Zap className="h-2.5 w-2.5" /> LIVE
                </span>
                <span className="text-[#A8D24E] text-[9px] sm:text-[10px] font-bold opacity-90">Livraison 24h · Dakar</span>
              </div>
              <h1 className="text-sm sm:text-base md:text-2xl lg:text-3xl font-extrabold leading-snug section-title-neon">
                {settings.shopName}{" "}
                <span className="text-neon-green">— Dakar</span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm opacity-75 mt-0.5 line-clamp-1">
                {settings.shopSlogan || "Produits frais, packs festifs & livraison express"}
              </p>
              <div className="flex gap-2 mt-2.5">
                <Link href="/produits">
                  <span className="inline-flex items-center gap-1.5 bg-[#A8D24E] text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg active:scale-95 cursor-pointer neon-green">
                    <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Voir le catalogue
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg active:scale-95 whatsapp-neon"
                >
                  <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 rounded-full animate-pulse-glow" />
              <img
                src={settings.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                alt={settings.shopName}
                className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full border-2 border-[#A8D24E]/50 object-cover shadow-xl"
                style={{ boxShadow: "0 0 20px rgba(168,210,78,0.4), 0 0 40px rgba(30,90,142,0.2)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES: small round circles, auto-scroll ─── */}
      <section className="bg-white border-b">
        <div className="py-2 sm:py-3">
          <div
            ref={categoriesScrollRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 px-3 sm:px-4 scrollbar-hide"
          >
            {/* "Tout voir" pill */}
            <Link href="/categories">
              <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group w-14 sm:w-16">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E5A8E] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#1E5A8E] leading-tight text-center">Tout voir</span>
              </div>
            </Link>
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 w-14 sm:w-16 animate-pulse">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200" />
                    <div className="h-2 bg-gray-200 rounded w-10" />
                  </div>
                ))
              : categories?.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group w-14 sm:w-16">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center group-hover:border-[#1E5A8E]/40 group-hover:shadow-md transition-all group-hover:scale-105">
                        <span className="text-lg sm:text-xl">{cat.emoji || "📦"}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 group-hover:text-[#1E5A8E] leading-tight text-center line-clamp-1 w-full">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ─── ADVANTAGES TICKER (auto-scroll inline) ─── */}
      <section className="bg-white border-b overflow-hidden">
        <div className="advantages-ticker py-2">
          <div className="advantages-ticker-track">
            {[...advantages, ...advantages, ...advantages].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 sm:px-4 whitespace-nowrap"
              >
                <item.icon className="h-3.5 w-3.5 text-[#1E5A8E] flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-gray-800">{item.label}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:inline">— {item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANDE PROMO ANIMÉE ─── */}
      <div className="bg-gradient-to-r from-[#061406] via-[#0D3B0D] to-[#061406] border-y border-[#A8D24E]/25 overflow-hidden">
        <div className="advantages-ticker py-2">
          <div className="advantages-ticker-track">
            {[
              "🛍️ BOUTIQUE OUVERTE",
              "🚀 Livraison Express 24h à Dakar",
              "🐏 Packs Tabaski disponibles",
              "💚 Produits 100% frais & sains",
              "📦 500+ produits en stock",
              "🇸🇳 GIE des Jeunes Conscients",
              "🎁 Commandes personnalisées",
              "📞 Service client 7j/7",
              "🛍️ BOUTIQUE OUVERTE",
              "🚀 Livraison Express 24h à Dakar",
              "🐏 Packs Tabaski disponibles",
              "💚 Produits 100% frais & sains",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 sm:px-6 whitespace-nowrap">
                <span className="text-[#A8D24E] text-[10px] sm:text-xs font-black">{item}</span>
                <span className="text-[#A8D24E]/30 text-xs">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BANNIÈRE PUB HAUT ─── */}
      <AdBanner position="homepage_top" className="container mt-2 mb-0" />

      {/* ─── VENTES FLASH TABASKI ─── */}
      {tabaskiProducts.length > 0 && (
        <section className="py-3 sm:py-4 bg-gradient-to-b from-white to-gray-50 border-t border-b">
          <div className="container">
            {/* Header Tabaski avec neon */}
            <div
              className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 mb-3 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0a1628 0%, #0D3B0D 50%, #0a1628 100%)",
                boxShadow: "0 0 20px rgba(168,210,78,0.2), 0 0 40px rgba(30,90,142,0.15), inset 0 1px 0 rgba(168,210,78,0.2)",
                border: "1px solid rgba(168,210,78,0.25)",
              }}
            >
              {/* Glow de fond */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,210,78,0.08),transparent_70%)] pointer-events-none" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 relative z-10">
                <span className="badge-flash text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 flex-shrink-0">
                  <Zap className="h-2.5 w-2.5" /> FLASH
                </span>
                <span className="text-white font-black text-xs sm:text-sm md:text-base truncate text-neon-green" style={{ textShadow: "0 0 10px rgba(168,210,78,0.5)" }}>
                  🐏 Ventes Flash Tabaski
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 relative z-10">
                {/* Countdown neon */}
                <div
                  className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md"
                  style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(168,210,78,0.3)" }}
                >
                  {[
                    { v: timeLeft.days, l: "J" },
                    { v: timeLeft.hours, l: "H" },
                    { v: timeLeft.minutes, l: "M" },
                    { v: timeLeft.seconds, l: "S" },
                  ].map((t, i) => (
                    <span key={i} className="flex items-center">
                      <span className="text-white font-black text-[9px] sm:text-[10px] tabular-nums" style={{ textShadow: "0 0 6px rgba(255,255,255,0.5)" }}>{t.v.toString().padStart(2, "0")}</span>
                      <span className="font-bold text-[8px] sm:text-[9px] mr-0.5 text-neon-green">{t.l}</span>
                    </span>
                  ))}
                </div>
                <Link href="/categories/packs-tabaski">
                  <span className="bg-[#A8D24E] hover:bg-[#97c43d] text-white font-black text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full active:scale-95 cursor-pointer whitespace-nowrap neon-green">
                    Tout voir
                  </span>
                </Link>
              </div>
            </div>

            {/* Horizontal Product List */}
            <div className="flex overflow-x-auto gap-2.5 sm:gap-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
              {tabaskiProducts.map((product) => {
                const formattedPrice = parseFloat(product.price).toLocaleString("fr-FR");
                const originalPrice = getOriginalPrice(product.price);
                const discount = getDiscountPercent(product.price);
                const isJustAdded = justAddedId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/produits/${product.id}`)}
                    className="cursor-pointer flex-shrink-0 w-[42vw] sm:w-[35vw] md:w-[220px] bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden card-hover-glow flex flex-col group relative"
                  >
                    {/* Discount Badge */}
                    <div className="absolute top-1.5 right-1.5 z-10 bg-red-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                      {discount}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                      <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 line-clamp-2 mb-1.5 leading-tight">
                        {product.name}
                      </h3>
                      <div>
                        <div className="flex items-baseline gap-1 mb-1.5">
                          <span className="text-xs sm:text-sm font-black text-[#1E5A8E]">{formattedPrice}</span>
                          <span className="text-[8px] sm:text-[9px] text-gray-400">FCFA</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through block mb-1.5">{originalPrice} FCFA</span>
                        <button
                          onClick={(e) => handleAddPackToCart(e, product)}
                          className={`w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                            isJustAdded
                              ? "bg-[#0D3B0D] text-white"
                              : "bg-[#A8D24E] hover:bg-[#92ba3d] text-white active:scale-95"
                          }`}
                        >
                          {isJustAdded ? (
                            <><Check className="h-3 w-3" /> Ajouté !</>
                          ) : (
                            <><ShoppingCart className="h-3 w-3" /> Ajouter</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="py-3 sm:py-4 bg-white border-t border-gray-100">
        <div className="container">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900">⭐ Produits en Vedette</h2>
            <Link href="/produits">
              <span className="text-[10px] sm:text-xs text-[#1E5A8E] hover:underline font-bold flex items-center gap-0.5">
                Voir plus <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg animate-pulse border">
                  <div className="aspect-square bg-gray-200 rounded-t-lg" />
                  <div className="p-2 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-7 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  unit={product.unit}
                  imageUrl={product.imageUrl}
                  badge={product.badge}
                  inStock={product.inStock}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── BANNIÈRE PUB MILIEU ─── */}
      <AdBanner position="homepage_middle" className="container py-2" />

      {/* ─── PRODUCTS BY CATEGORY ─── */}
      {productsByCategory
        .filter((cat) => cat.products.length > 0 && cat.slug !== "packs-tabaski")
        .map((cat) => (
          <section key={cat.id} className="py-3 sm:py-4 border-t border-gray-100 bg-white">
            <div className="container">
              {/* Category header - compact */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base sm:text-lg">{cat.emoji || "📦"}</span>
                  <h2 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide truncate">{cat.name}</h2>
                </div>
                <Link href={`/categories/${cat.slug}`}>
                  <span className="text-[10px] sm:text-xs font-bold text-[#A8D24E] flex items-center gap-0.5 whitespace-nowrap">
                    Voir <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              {/* Horizontal scroll */}
              <div className="flex overflow-x-auto gap-2 sm:gap-3 -mx-4 px-4 md:mx-0 md:px-0 pb-1 scrollbar-hide">
                {cat.products.slice(0, 8).map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[40vw] sm:w-[30vw] md:w-[180px]">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      unit={product.unit}
                      imageUrl={product.imageUrl}
                      badge={product.badge}
                      inStock={product.inStock}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ─── BANNIÈRE PUB BAS ─── */}
      <AdBanner position="homepage_bottom" className="container py-2" />

      {/* ─── CTA WhatsApp ─── */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,210,78,0.1),transparent_40%)]" />
        <div className="container text-center relative z-10">
          <h2 className="text-sm sm:text-base md:text-2xl font-extrabold mb-1.5 sm:mb-2">Besoin d'aide ?</h2>
          <p className="text-[10px] sm:text-xs md:text-sm opacity-80 mb-3 sm:mb-4 max-w-md mx-auto">
            Équipe disponible 7j/7 pour vos commandes personnalisées.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <Link href="/panier">
              <span className="inline-flex items-center justify-center gap-1.5 bg-[#A8D24E] text-white text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full shadow active:scale-95 cursor-pointer w-full sm:w-auto">
                <ShoppingBag className="h-3.5 w-3.5" /> Mon panier
              </span>
            </Link>
            <a
              href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full shadow active:scale-95 w-full sm:w-auto"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Bouton WhatsApp flottant — mobile */}
      <a
        href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal Boutique, je souhaite des informations sur vos produits.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-40 md:hidden"
      >
        <div
          className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center whatsapp-neon"
          style={{ animation: "cart-badge-glow 2.5s ease-in-out infinite, float 3s ease-in-out infinite" }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
      </a>



      {/* 📺 Pub flottante vidéo/GIF — configurée via Admin › Publicités (position : homepage_floating) */}
      <div className="hidden md:block fixed bottom-24 left-6 z-30 max-w-[220px] rounded-2xl overflow-hidden shadow-2xl">
        <AdBanner position="homepage_floating" />
      </div>
    </div>
  );
}
