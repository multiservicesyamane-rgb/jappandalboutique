import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductNotFound } from "@/components/ProductNotFound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal, ArrowUpDown, X, ChevronDown, MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export default function Products() {
  const settings = useSettings();
  const searchParams = useSearch();
  const urlQuery = new URLSearchParams(searchParams).get("q") || "";
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allProducts, isLoading } = trpc.products.list.useQuery();

  const filteredProducts = useMemo(() => {
    let result = allProducts?.filter((product) => {
      const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
      const matchesSearch = searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Link href="/"><span className="hover:text-[#1E5A8E]">Accueil</span></Link>
              <span>&gt;</span>
              <span className="text-gray-800 font-medium">Tous les produits</span>
              {selectedCategory && categories && (
                <>
                  <span>&gt;</span>
                  <span className="text-[#1E5A8E] font-medium">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="bg-white border-b sticky top-12 md:top-[88px] z-30">
          <div className="container py-2">
            <div className="flex overflow-x-auto gap-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-[#1E5A8E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tous
              </button>
              {categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#1E5A8E] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.emoji} {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search bar mobile */}
        <div className="container py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 rounded-full bg-white border-gray-200 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="container mb-3">
          <p className="text-xs text-gray-500">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        <div className="container">
          {isLoading ? (
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
          ) : filteredProducts.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                  variant="outline"
                  size="sm"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
              <ProductNotFound searchQuery={searchQuery} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
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

          {/* Section recherche produit introuvable */}
          {filteredProducts.length > 0 && (
            <div className="mt-8">
              <ProductNotFound searchQuery={searchQuery} />
            </div>
          )}
        </div>
      </main>

      {/* Fixed bottom bar - Sort & Filter (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg md:hidden">
        <div className="flex">
          <button
            onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 border-r"
          >
            <ArrowUpDown className="h-4 w-4" />
            Trier par
          </button>
          <button
            onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtrer
          </button>
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg">
            <div className="p-4 space-y-1">
              <h3 className="text-sm font-bold mb-2">Trier par</h3>
              {[
                { value: "default" as SortOption, label: "Par défaut" },
                { value: "price-asc" as SortOption, label: "Prix croissant" },
                { value: "price-desc" as SortOption, label: "Prix décroissant" },
                { value: "name" as SortOption, label: "Nom (A-Z)" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSortBy(option.value); setShowSort(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-[#1E5A8E] text-white font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter dropdown */}
        {showFilters && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg max-h-[60vh] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-bold mb-3">Filtrer par catégorie</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(null); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? "bg-[#1E5A8E] text-white font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Tous les produits
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-[#1E5A8E] text-white font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal Boutique, je souhaite des informations sur vos produits.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-4 z-30 md:bottom-6"
      >
        <div className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:bg-[#20BA5A] transition-colors">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
      </a>
    </div>
  );
}
