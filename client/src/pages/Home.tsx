import { useRef } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AutoScrollCarousel } from "@/components/AutoScrollCarousel";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { sortProductsWithImageFirst } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Les produits avec image passent en premier partout
  const sortedProducts = sortProductsWithImageFirst(products || []);
  const productsWithImage = sortedProducts.filter(p => !!p.imageUrl?.trim());

  // Tabaski special section
  const tabaskiProducts = productsWithImage.filter(p => p.badge?.toLowerCase().includes("tabaski") || p.name.toLowerCase().includes("tabaski") || p.name.toLowerCase().includes("mouton") || p.name.toLowerCase().includes("pack") || p.name.toLowerCase().includes("grillade"));

  // Produits en vedette
  const featuredProducts = productsWithImage.slice(0, 8);

  // TOUTES les catégories : celles qui ont des produits illustrés en haut,
  // les autres (sans image) repoussées en bas de page.
  const productsByCategory = (categories || [])
    .map(cat => {
      const items = sortedProducts.filter(p => p.categoryId === cat.id);
      return {
        category: cat,
        items,
        imageCount: items.filter(p => !!p.imageUrl?.trim()).length,
      };
    })
    .sort((a, b) => b.imageCount - a.imageCount);

  const visibleGroups = productsByCategory.filter(g => g.items.length > 0);

  // Produits sans catégorie : affichés tout en bas pour ne rien masquer
  const knownCategoryIds = new Set((categories || []).map(c => c.id));
  const uncategorizedProducts = sortedProducts.filter(p => !knownCategoryIds.has(p.categoryId));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />


      {/* ─── CATEGORIES: small round circles, auto-scroll ─── */}
      <section className="relative bg-gradient-to-b from-[#0a1628] to-[#0d1f3a] border-b border-[#1E5A8E]/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,210,78,0.06),transparent_60%)] pointer-events-none" />
        <div className="py-2 sm:py-3">
          <div
            ref={categoriesScrollRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 px-3 sm:px-4 scrollbar-hide"
          >
            {/* "Tout voir" pill */}
            <Link href="/categories">
              <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group w-14 sm:w-16">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E5A8E] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform" style={{ boxShadow: "0 0 14px rgba(30,90,142,0.55)" }}>
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#A8D24E] leading-tight text-center">Tout voir</span>
              </div>
            </Link>
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 w-14 sm:w-16 animate-pulse">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a2d4a]" />
                    <div className="h-2 bg-[#1a2d4a] rounded w-10" />
                  </div>
                ))
              : categories?.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group w-14 sm:w-16">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#162540] to-[#0a1a30] border border-[#1E5A8E]/40 flex items-center justify-center group-hover:border-[#A8D24E]/50 group-hover:shadow-lg transition-all group-hover:scale-105" style={{ boxShadow: "0 0 6px rgba(30,90,142,0.25)" }}>
                        <span className="text-lg sm:text-xl">{cat.emoji || "📦"}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-300 group-hover:text-[#A8D24E] leading-tight text-center line-clamp-1 w-full">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>



      {/* ─── VENTES FLASH TABASKI ─── */}
      {tabaskiProducts.length > 0 && (
        <section className="py-6 sm:py-8 relative overflow-hidden border-b border-[#A8D24E]/10" style={{ background: "linear-gradient(160deg, #030a03 0%, #061806 40%, #0a2a0a 70%, #030a03 100%)" }}>
          {/* Orbes neon verts */}
          <div className="absolute -top-8 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,210,78,0.18) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,211,102,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,210,78,0.08) 0%, transparent 70%)" }} />
          <div className="container px-0 sm:px-4 relative z-10">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black flex items-center gap-2" style={{ color: "#A8D24E", textShadow: "0 0 12px rgba(168,210,78,0.5)" }}>
                <span className="text-xl">🐏</span>
                Spécial Tabaski
              </h2>
              <Link href="/produits">
                <span className="text-white text-[10px] sm:text-xs font-bold hover:underline cursor-pointer px-3 py-1 rounded-full" style={{ background: "rgba(168,210,78,0.15)", border: "1px solid rgba(168,210,78,0.35)" }}>
                  Voir les packs &gt;
                </span>
              </Link>
            </div>
            <AutoScrollCarousel
              itemCount={tabaskiProducts.length}
              className="gap-3 sm:gap-4 px-4 sm:px-0 pb-4"
              speed={35}
            >
              {tabaskiProducts.map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0">
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
            </AutoScrollCarousel>
          </div>
        </section>
      )}



      {/* ─── PRODUITS EN VEDETTE ─── */}
      {productsLoading ? (
        <div className="py-6 sm:py-8 relative border-b border-[#1E5A8E]/20" style={{ background: "linear-gradient(160deg, #05101e 0%, #0a1b30 50%, #05101e 100%)" }}>
          <div className="container">
            <div className="h-6 w-48 bg-[#1a2d4a] rounded animate-pulse mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[1,2,3,4].map(i => <div key={i} className="w-[140px] sm:w-[180px] h-[200px] bg-[#0f1f35] rounded-xl animate-pulse flex-shrink-0" />)}
            </div>
          </div>
        </div>
      ) : featuredProducts.length > 0 && (
        <section className="py-6 sm:py-8 relative overflow-hidden border-b border-[#1E5A8E]/20" style={{ background: "linear-gradient(160deg, #05101e 0%, #0a1b30 50%, #05101e 100%)" }}>
          <div className="absolute -top-10 left-0 w-52 h-52 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(30,90,142,0.2) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,210,78,0.1) 0%, transparent 70%)" }} />
          <div className="container px-0 sm:px-4 relative z-10">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-white flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(168,210,78,0.3)" }}>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#A8D24E]" />
                Produits en Vedette
              </h2>
              <Link href="/produits">
                <span className="text-[#A8D24E] text-[10px] sm:text-xs font-bold hover:underline cursor-pointer">Tout voir &gt;</span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x snap-mandatory">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
                  <ProductCard id={product.id} name={product.name} price={product.price} unit={product.unit} imageUrl={product.imageUrl} badge={product.badge} inStock={product.inStock} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CAROUSELS DE TOUTES LES CATÉGORIES ─── */}
      {!productsLoading && visibleGroups.map((group, idx) => {
        const isOtherCategory = group.imageCount === 0;
        const showOtherTitle = isOtherCategory && visibleGroups[idx - 1]?.imageCount !== 0;
        return (
          <div key={group.category.id}>
            {showOtherTitle && (
              <div className="bg-gray-100 border-b border-gray-200">
                <div className="container py-2">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-gray-500">
                    Autres catégories
                  </h2>
                </div>
              </div>
            )}
            <section className="py-6 sm:py-8 relative overflow-hidden border-b border-gray-100 last:border-b-0" style={{ background: idx % 2 === 0 ? "linear-gradient(160deg, #ffffff 0%, #f4f8ff 50%, #f0f7f0 100%)" : "linear-gradient(160deg, #f8fdf4 0%, #eef7ee 50%, #f4f8ff 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: idx % 2 === 0 ? "radial-gradient(ellipse at top right, rgba(30,90,142,0.04), transparent 60%)" : "radial-gradient(ellipse at bottom left, rgba(168,210,78,0.05), transparent 60%)" }} />
              <div className="container px-0 sm:px-4 relative z-10">
                <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
                  <h2 className="text-sm sm:text-base md:text-xl font-black text-gray-800 flex items-center gap-2">
                    <span className="text-xl">{group.category.emoji}</span>
                    {group.category.name}
                  </h2>
                  <Link href={`/categories/${group.category.slug}`}>
                    <span className="text-[#1E5A8E] text-[10px] sm:text-xs font-bold hover:underline cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Voir tout &gt;</span>
                  </Link>
                </div>
                <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x snap-mandatory">
                  {group.items.map((product) => (
                    <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
                      <ProductCard id={product.id} name={product.name} price={product.price} unit={product.unit} imageUrl={product.imageUrl} badge={product.badge} inStock={product.inStock} compact />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        );
      })}

      {/* ─── PRODUITS SANS CATÉGORIE (tout en bas) ─── */}
      {!productsLoading && uncategorizedProducts.length > 0 && (
        <section className="py-6 sm:py-8 relative overflow-hidden border-b border-gray-100" style={{ background: "linear-gradient(160deg, #ffffff 0%, #f4f8ff 50%, #f0f7f0 100%)" }}>
          <div className="container px-0 sm:px-4 relative z-10">
            <div className="mb-4 px-4 sm:px-0">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-gray-800">
                Autres produits
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 sm:px-0 pb-4 scrollbar-hide snap-x snap-mandatory">
              {uncategorizedProducts.map((product) => (
                <div key={product.id} className="w-[140px] sm:w-[180px] md:w-[220px] flex-shrink-0 snap-start">
                  <ProductCard id={product.id} name={product.name} price={product.price} unit={product.unit} imageUrl={product.imageUrl} badge={product.badge} inStock={product.inStock} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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



    </div>
  );
}
