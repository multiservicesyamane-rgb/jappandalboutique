import { useState, useEffect } from "react";
import { Link } from "wouter";
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
  ShoppingCart, Check, Flame
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const { addItem } = useCart();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();

  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  // Group products by category
  const productsByCategory = categories?.map((cat) => ({
    ...cat,
    products: products?.filter((p) => p.categoryId === cat.id) || [],
  })) || [];

  // Featured products (first 6)
  const featuredProducts = products?.slice(0, 6) || [];

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] text-white shadow-premium-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,210,78,0.15),transparent_50%)]" />
        <div className="container py-8 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-4 backdrop-blur-sm border border-white/10">
                <Flame className="h-3.5 w-3.5 text-[#A8D24E]" />
                Boutique Officielle Jappandal
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Vos courses en un clic,<br />
                <span className="text-[#A8D24E] text-glow">sans vous déplacer !</span>
              </h1>
              <p className="text-sm md:text-lg opacity-90 mb-6 max-w-xl">
                {settings.shopSlogan || "Produits de qualité supérieure, packs festifs et livraison express à Dakar."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link href="/produits">
                  <span className="inline-flex items-center gap-2 bg-[#A8D24E] hover:bg-[#92ba3d] text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer">
                    <ShoppingBag className="h-4 w-4" />
                    Découvrir nos produits
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Commander par WhatsApp
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative p-2 bg-gradient-to-tr from-[#A8D24E] to-[#1E5A8E] rounded-full shadow-2xl">
                <img
                  src={settings.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                  alt={settings.shopName}
                  className="h-44 w-44 rounded-full border-4 border-white object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages bar */}
      <section className="bg-white border-b shadow-sm relative z-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100">
            {[
              { icon: Truck, label: "Livraison rapide", sub: "À domicile à Dakar & Banlieue" },
              { icon: ShieldCheck, label: "Qualité garantie", sub: "Frais, propre & sélectionné" },
              { icon: BadgePercent, label: "Meilleurs prix", sub: "Rapport qualité/prix imbattable" },
              { icon: Clock, label: "Service client 7j/7", sub: "Écoute active & réactivité" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-4 px-3 md:px-6"
              >
                <div className="p-2 rounded-lg bg-[#1E5A8E]/5 text-[#1E5A8E]">
                  <item.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-800 leading-tight">{item.label}</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories horizontal scroll */}
      <section className="bg-white py-6 border-b">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base md:text-xl font-extrabold text-gray-900">Nos Rayons</h2>
              <p className="text-xs text-gray-500 mt-0.5">Parcourez nos différentes catégories de produits</p>
            </div>
            <Link href="/categories">
              <span className="text-xs md:text-sm text-[#1E5A8E] hover:underline font-bold flex items-center gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-24 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
                  </div>
                ))
              : categories?.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <div className="flex-shrink-0 w-24 text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E5A8E]/5 to-[#A8D24E]/10 flex items-center justify-center mx-auto mb-2 group-hover:from-[#1E5A8E]/10 group-hover:to-[#A8D24E]/20 transition-all group-hover:scale-105 shadow-sm border border-gray-100">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji || "📦"}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 group-hover:text-[#1E5A8E] transition-colors line-clamp-2 leading-tight">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Ventes Flash Tabaski Section (SUBLIME & HIGH CONVERTING) */}
      {tabaskiProducts.length > 0 && (
        <section className="py-8 bg-slate-50 border-b relative overflow-hidden">
          <div className="container">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#4A148C] via-[#7B1FA2] to-[#311B92] rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border border-purple-500/20 mb-6">
              <div className="flex flex-wrap items-center gap-3 text-center lg:text-left justify-center lg:justify-start">
                <span className="bg-amber-400 text-purple-950 font-black text-[10px] md:text-xs uppercase px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                  ⚡ OFFRES SPÉCIALES
                </span>
                <h2 className="text-white font-black text-lg md:text-2xl tracking-tight flex items-center gap-2 justify-center">
                  <span>🐏</span> Ventes Flash Tabaski 2026
                </h2>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="text-purple-200 text-[10px] md:text-xs font-bold uppercase tracking-wider">Fin dans</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-white/15 text-white font-extrabold text-xs md:text-sm px-2.5 py-1 rounded border border-white/10 min-w-[34px] md:min-w-[40px] justify-center">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </div>
                  <span className="text-amber-400 font-extrabold text-xs">J</span>
                  <div className="flex items-center bg-white/15 text-white font-extrabold text-xs md:text-sm px-2.5 py-1 rounded border border-white/10 min-w-[34px] md:min-w-[40px] justify-center">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <span className="text-amber-400 font-extrabold text-xs">H</span>
                  <div className="flex items-center bg-white/15 text-white font-extrabold text-xs md:text-sm px-2.5 py-1 rounded border border-white/10 min-w-[34px] md:min-w-[40px] justify-center">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <span className="text-amber-400 font-extrabold text-xs">M</span>
                  <div className="flex items-center bg-white/15 text-white font-extrabold text-xs md:text-sm px-2.5 py-1 rounded border border-white/10 min-w-[34px] md:min-w-[40px] justify-center">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <span className="text-amber-400 font-extrabold text-xs">S</span>
                </div>
              </div>

              <Link href={`/categories/packs-tabaski`}>
                <span className="bg-amber-400 hover:bg-amber-500 text-purple-950 font-black text-xs md:text-sm px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap">
                  Tout voir →
                </span>
              </Link>
            </div>

            {/* Horizontal Product List */}
            <div className="flex overflow-x-auto gap-4 -mx-4 px-4 md:mx-0 md:px-0 pb-4 scrollbar-hide">
              {tabaskiProducts.map((product, index) => {
                const formattedPrice = parseFloat(product.price).toLocaleString("fr-FR");
                const originalPrice = getOriginalPrice(product.price);
                const discount = getDiscountPercent(product.price);
                const isJustAdded = justAddedId === product.id;

                return (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[70vw] sm:w-[45vw] md:w-[280px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-premium hover:shadow-premium-xl transition-all hover:-translate-y-1.5 flex flex-col group relative"
                  >
                    {/* Index Circular Badge */}
                    <div className="absolute top-3 left-3 z-10 w-7 h-7 bg-[#7B1FA2] text-white text-xs font-black rounded-full flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>

                    {/* Discount Capsule Badge */}
                    <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                      {discount}
                    </div>

                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#7B1FA2] transition-colors line-clamp-1 mb-2">
                          {product.name}
                        </h3>

                        {/* Ingredients / Description List */}
                        <div className="text-[11px] text-gray-500 space-y-1 mb-4 bg-purple-50/50 p-2.5 rounded-xl border border-purple-500/5">
                          {product.description?.split("\n").map((line, lIdx) => (
                            <p key={lIdx} className="line-clamp-1 flex items-center gap-1 font-medium text-gray-600">
                              <span className="text-[#7B1FA2] text-[8px]">●</span>
                              {line.replace("•", "").trim()}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        {/* Prices */}
                        <div className="flex items-baseline justify-between mb-3 border-t border-gray-100 pt-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through leading-none mb-1">
                              {originalPrice} FCFA
                            </span>
                            <span className="text-base md:text-lg font-black text-[#7B1FA2]">
                              {formattedPrice} <span className="text-xs font-bold text-gray-500">FCFA</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                            {product.unit || "Pack"}
                          </span>
                        </div>

                        {/* Add to Cart button */}
                        <button
                          onClick={(e) => handleAddPackToCart(e, product)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all ${
                            isJustAdded
                              ? "bg-purple-900 text-white shadow-md shadow-purple-900/20"
                              : "bg-amber-400 hover:bg-amber-500 text-purple-950 shadow-md shadow-amber-400/10 active:scale-95"
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="h-4 w-4" />
                              Ajouté au panier !
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Ajouter au panier
                            </>
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

      {/* Featured Products */}
      <section className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base md:text-xl font-extrabold text-gray-900">Produits Vedettes</h2>
              <p className="text-xs text-gray-500 mt-0.5">Nos articles les plus appréciés & recommandés</p>
            </div>
            <Link href="/produits">
              <span className="text-xs md:text-sm text-[#1E5A8E] hover:underline font-bold flex items-center gap-1">
                Voir plus <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl animate-pulse border">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-3.5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Products by Category */}
      {productsByCategory
        .filter((cat) => cat.products.length > 0 && cat.slug !== "packs-tabaski")
        .map((cat) => (
          <section key={cat.id} className="py-6 border-t border-gray-100 bg-white">
            <div className="container">
              {/* Category header */}
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-[#1E5A8E] to-[#1E5A8E]/80 rounded-xl px-4 py-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl md:text-2xl">{cat.emoji || "📦"}</span>
                  <div>
                    <h2 className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wider">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-[10px] md:text-xs text-white/80 line-clamp-1 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>
                <Link href={`/categories/${cat.slug}`}>
                  <span className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 whitespace-nowrap">
                    Voir plus <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              {/* Horizontal scroll of products */}
              <div className="flex overflow-x-auto gap-4 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
                {cat.products.slice(0, 8).map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[45vw] md:w-[200px]">
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

      {/* CTA WhatsApp */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,210,78,0.1),transparent_40%)]" />
        <div className="container text-center relative z-10">
          <h2 className="text-xl md:text-3xl font-extrabold mb-3">Besoin d'aide ou d'une commande personnalisée ?</h2>
          <p className="text-xs md:text-base opacity-90 mb-6 max-w-xl mx-auto">
            Notre équipe est à votre disposition 7j/7 pour répondre à toutes vos questions et livrer vos produits en temps record.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/panier">
              <span className="inline-flex items-center gap-2 bg-[#A8D24E] hover:bg-[#92ba3d] text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer">
                <ShoppingBag className="h-4.5 w-4.5" />
                Consulter mon panier
              </span>
            </Link>
            <a
              href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              WhatsApp direct
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp button - mobile only */}
      <a
        href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal Boutique, je souhaite des informations sur vos produits.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-40 md:hidden"
      >
        <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:bg-[#20BA5A] transition-colors animate-bounce">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
      </a>
    </div>
  );
}
