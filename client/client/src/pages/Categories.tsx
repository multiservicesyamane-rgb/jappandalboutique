import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { ChevronRight, MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Categories() {
  const settings = useSettings();
  const { data: categories, isLoading: catLoading } = trpc.categories.list.useQuery();
  const { data: products, isLoading: prodLoading } = trpc.products.list.useQuery();
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  const activeCat = selectedCatId ? categories?.find((c) => c.id === selectedCatId) : categories?.[0];
  const catProducts = products?.filter((p) => p.categoryId === (activeCat?.id || 0)) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Link href="/"><span className="hover:text-[#1E5A8E]">Accueil</span></Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-800 font-medium">Catégories</span>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <div className="flex gap-4">
            {/* Sidebar - Categories list */}
            <div className="w-20 md:w-48 flex-shrink-0">
              <div className="sticky top-28 space-y-0.5">
                {catLoading
                  ? [...Array(8)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-200 rounded animate-pulse mb-1" />
                    ))
                  : categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`w-full text-left px-1.5 py-2 rounded-lg text-[10px] md:text-sm font-medium transition-colors ${
                          (activeCat?.id === cat.id)
                            ? "bg-[#1E5A8E] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col items-center md:flex-row md:gap-2 text-center md:text-left">
                          <span className="text-lg md:text-base">{cat.emoji || "📦"}</span>
                          <span className="line-clamp-2 leading-tight mt-0.5 md:mt-0">{cat.name}</span>
                        </div>
                      </button>
                    ))}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0">
              {activeCat && (
                <>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-base md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>{activeCat.emoji}</span>
                        {activeCat.name}
                      </h1>
                      {activeCat.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{activeCat.description}</p>
                      )}
                    </div>
                    <Link href={`/categories/${activeCat.slug}`}>
                      <span className="text-xs text-[#A8D24E] font-semibold flex items-center gap-1">
                        Voir plus <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>

                  {/* Products grid */}
                  {prodLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg animate-pulse">
                          <div className="aspect-square bg-gray-200 rounded-t-lg" />
                          <div className="p-3 space-y-2">
                            <div className="h-3 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : catProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-sm text-gray-500">Aucun produit dans cette catégorie</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {catProducts.map((product) => (
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
                </>
              )}

              {/* All categories grid (mobile alternative) */}
              <div className="mt-8">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Toutes les catégories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories?.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <div className="bg-white rounded-lg border p-4 text-center hover:shadow-md hover:border-[#1E5A8E] transition-all cursor-pointer group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {cat.emoji || "📦"}
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold text-gray-800 group-hover:text-[#1E5A8E] transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-40 md:hidden"
      >
        <div className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
      </a>
    </div>
  );
}
