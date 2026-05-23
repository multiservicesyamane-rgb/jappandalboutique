import { useRoute, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ChevronRight, MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function CategoryDetail() {
  const settings = useSettings();
  const [, params] = useRoute("/categories/:slug");
  const slug = params?.slug || "";

  const { data: category, isLoading: categoryLoading } = trpc.categories.getBySlug.useQuery({ slug });
  const { data: products, isLoading: productsLoading } = trpc.products.getByCategory.useQuery(
    { categoryId: category?.id || 0 },
    { enabled: !!category?.id }
  );

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg">
                  <div className="aspect-square bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Catégorie non trouvée</h2>
          <p className="text-gray-500 mb-4">La catégorie que vous recherchez n'existe pas.</p>
          <Button asChild>
            <Link href="/categories">Retour aux catégories</Link>
          </Button>
        </main>
      </div>
    );
  }

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
              <Link href="/categories"><span className="hover:text-[#1E5A8E]">Catégories</span></Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-800 font-medium">{category.name}</span>
            </div>
          </div>
        </div>

        {/* Category header */}
        <div className="bg-[#1E5A8E] text-white">
          <div className="container py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.emoji || "📦"}</span>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">{category.name}</h1>
                {category.description && (
                  <p className="text-xs md:text-sm opacity-80">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <p className="text-xs text-gray-500 mb-4">
            {products?.length || 0} produit{(products?.length || 0) !== 1 ? "s" : ""} dans cette catégorie
          </p>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
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
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">Aucun produit dans cette catégorie</h3>
              <p className="text-sm text-gray-500 mb-4">Les produits seront bientôt disponibles</p>
              <Button asChild variant="outline">
                <Link href="/produits">Voir tous les produits</Link>
              </Button>
            </div>
          )}
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
