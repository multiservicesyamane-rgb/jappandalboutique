import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AdBanner } from "@/components/AdBanner";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, ChevronRight, Truck, ShieldCheck, 
  Clock, BadgePercent, Search, ShoppingBag, MessageCircle
} from "lucide-react";
import { useRef } from "react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();

  // Group products by category
  const productsByCategory = categories?.map((cat) => ({
    ...cat,
    products: products?.filter((p) => p.categoryId === cat.id) || [],
  })) || [];

  // Featured products (first 6)
  const featuredProducts = products?.slice(0, 6) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Ad Banner Top - Temporarily disabled to prevent DOM errors */}
      {/* <AdBanner position="homepage_top" className="container py-4" /> */}

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] text-white shadow-premium-xl">
        <div className="container py-6 md:py-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex-1">
              <h1 className="text-xl md:text-4xl font-bold mb-2 md:mb-3 leading-tight">
                Bienvenue chez<br />
                <span className="text-neon-green">{settings.shopName}</span>
              </h1>
              <p className="text-xs md:text-lg opacity-90 mb-3 md:mb-5">
                {settings.shopSlogan} — Produits frais et locaux livrés chez vous
              </p>
              <div className="flex gap-2">
                <Link href="/produits">
                  <span className="inline-flex items-center gap-1.5 bg-[#A8D24E] hover:bg-[#A8D24E] text-white text-xs md:text-sm font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-full transition-colors neon-green-hover shadow-premium">
                    <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Voir les produits
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs md:text-sm font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-full transition-colors shadow-premium hover-lift"
                >
                  <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Commander</span>
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="h-32 w-32 rounded-full bg-white/10 p-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advantages bar */}
      <section className="bg-white border-b">
        <div className="container">
          <div className="flex overflow-x-auto gap-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {[
              { icon: Truck, label: "Livraison rapide", sub: "À domicile" },
              { icon: ShieldCheck, label: "Qualité garantie", sub: "Produits certifiés" },
              { icon: BadgePercent, label: "Meilleurs prix", sub: "Prix compétitifs" },
              { icon: Clock, label: "Ouvert 7j/7", sub: "Toujours disponible" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-3 px-4 min-w-fit border-r last:border-r-0"
              >
                <item.icon className="h-5 w-5 text-[#1E5A8E] flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">{item.label}</div>
                  <div className="text-[10px] text-gray-500 whitespace-nowrap">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories horizontal scroll */}
      <section className="bg-white py-4 border-b">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm md:text-base font-bold text-gray-800">Nos Catégories</h2>
            <Link href="/categories">
              <span className="text-xs md:text-sm text-[#A8D24E] font-semibold flex items-center gap-1">
                Voir tout <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
            {categoriesLoading
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-20 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-1.5" />
                    <div className="h-3 bg-gray-200 rounded w-14 mx-auto" />
                  </div>
                ))
              : categories?.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <div className="flex-shrink-0 w-20 text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-1.5 group-hover:bg-[#C8E6C9] transition-colors group-hover:scale-105 transition-transform">
                        <span className="text-2xl">{cat.emoji || "📦"}</span>
                      </div>
                      <span className="text-[10px] md:text-xs font-medium text-gray-700 line-clamp-2 leading-tight">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-4">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm md:text-lg font-bold text-gray-800">
                Produits Vedettes
              </h2>
              <p className="text-[10px] md:text-xs text-gray-500">Nos meilleures sélections</p>
            </div>
            <Link href="/produits">
              <span className="text-xs md:text-sm text-[#A8D24E] font-semibold flex items-center gap-1">
                Voir plus <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Ad Banner Middle */}
      {/* <AdBanner position="homepage_middle" className="container py-4" /> */}

      {/* Products by Category */}
      {productsByCategory
        .filter((cat) => cat.products.length > 0)
        .map((cat) => (
          <section key={cat.id} className="py-3 md:py-4">
            <div className="container">
              {/* Category header */}
              <div className="flex items-center justify-between mb-3 bg-[#1E5A8E] rounded-lg px-3 py-2 md:px-4 md:py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl">{cat.emoji || "📦"}</span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-white">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-[10px] md:text-xs text-white/70 line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                </div>
                <Link href={`/categories/${cat.slug}`}>
                  <span className="text-xs md:text-sm text-[#FFD54F] font-semibold flex items-center gap-1 whitespace-nowrap">
                    Voir plus <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>

              {/* Horizontal scroll of products */}
              <div className="flex overflow-x-auto gap-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
                {cat.products.slice(0, 8).map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[45vw] md:w-48">
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

      {/* Ad Banner Bottom */}
      {/* <AdBanner position="homepage_bottom" className="container py-4" /> */}

      {/* CTA WhatsApp */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] text-white">
        <div className="container text-center">
          <h2 className="text-lg md:text-2xl font-bold mb-2">Prêt à commander ?</h2>
          <p className="text-xs md:text-sm opacity-90 mb-4 max-w-md mx-auto">
            Ajoutez vos produits au panier ou contactez-nous directement sur WhatsApp
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/panier">
              <span className="inline-flex items-center gap-2 bg-[#A8D24E] hover:bg-[#A8D24E] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
                <ShoppingBag className="h-4 w-4" />
                Mon Panier
              </span>
            </Link>
            <a
              href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
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
        <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:bg-[#20BA5A] transition-colors">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
      </a>
    </div>
  );
}
