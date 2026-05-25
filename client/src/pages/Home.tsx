import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { ProductCard } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Zap, ShoppingBag, Truck, ShieldCheck, BadgePercent, Clock, Star } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Group products by category for the carousels
  const productsByCategory = categories?.map(cat => ({
    category: cat,
    items: products?.filter(p => p.categoryId === cat.id) || []
  })).filter(group => group.items.length > 0) || [];

  // Tabaski special section
  const tabaskiProducts = products?.filter(p => p.badge?.toLowerCase().includes("tabaski") || p.name.toLowerCase().includes("tabaski") || p.name.toLowerCase().includes("mouton") || p.name.toLowerCase().includes("pack") || p.name.toLowerCase().includes("grillade")) || [];

  // Ventes Flash / Produits en vedette
  const featuredProducts = products?.slice(0, 8) || [];
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
                  <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
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



      {/* ─── BANNIÈRE PUB HAUT ─── */}
      <AdBanner position="homepage_top" className="container mt-2 mb-0" />

      {/* ─── VENTES FLASH TABASKI ─── */}
      {tabaskiProducts.length > 0 && (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-[#E9F3E5] to-white border-b">
          <div className="container px-0 sm:px-4">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-green-800 flex items-center gap-2">
                <span className="text-xl">🐏</span>
                Spécial Tabaski
              </h2>
              <Link href="/produits">
                <span className="text-green-700 text-[10px] sm:text-xs font-bold hover:underline cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm">
                  Voir les packs &gt;
                </span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x">
              {tabaskiProducts.map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
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
      )}

      {/* ─── PRODUITS EN VEDETTE (CAROUSEL) ─── */}
      {productsLoading ? (
        <div className="py-6 sm:py-8 bg-white border-b">
          <div className="container">
             <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
             <div className="flex gap-4 overflow-hidden">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="w-[140px] sm:w-[180px] h-[200px] bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
               ))}
             </div>
          </div>
        </div>
      ) : featuredProducts.length > 0 && (
        <section className="py-6 sm:py-8 bg-white border-b">
          <div className="container px-0 sm:px-4">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-gray-800 flex items-center gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#A8D24E]" />
                Produits en Vedette
              </h2>
              <Link href="/produits">
                <span className="text-[#1E5A8E] text-[10px] sm:text-xs font-bold hover:underline cursor-pointer">
                  Tout voir &gt;
                </span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
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
      )}

      {/* ─── CAROUSELS PAR CATÉGORIE ─── */}
      {!productsLoading && productsByCategory.map((group) => (
        <section key={group.category.id} className="py-6 sm:py-8 bg-gray-50 border-b last:border-b-0">
          <div className="container px-0 sm:px-4">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-gray-800 flex items-center gap-2">
                <span className="text-xl">{group.category.emoji}</span>
                {group.category.name}
              </h2>
              <Link href={`/categories/${group.category.slug}`}>
                <span className="text-[#1E5A8E] text-[10px] sm:text-xs font-bold hover:underline cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm">
                  Voir tout &gt;
                </span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x">
              {group.items.slice(0, 8).map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
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


      {/* ─── BANNIÈRE PUB MILIEU ─── */}
      <AdBanner position="homepage_middle" className="container py-2" />


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
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
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
          <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </div>
      </a>



      {/* 📺 Pub flottante vidéo/GIF — configurée via Admin › Publicités (position : homepage_floating) */}
      <div className="hidden md:block fixed bottom-24 left-6 z-30 max-w-[220px] rounded-2xl overflow-hidden shadow-2xl">
        <AdBanner position="homepage_floating" />
      </div>
    </div>
  );
}
