import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useState, useCallback } from "react";
import {
  ShoppingCart, Phone, MessageCircle,
  Minus, Plus, Check, Share2, Truck, ShieldCheck, ChevronRight,
  ChevronLeft, ZoomIn
} from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/playNotificationSound";
import { useRoute } from "wouter";

export default function ProductDetail() {
  const settings = useSettings();
  const [match, params] = useRoute("/produits/:id");
  const id = params?.id;
  const productId = parseInt(id || "0");
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  const { data: allProducts } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  const relatedProducts = allProducts
    ?.filter((p) => p.categoryId === product?.categoryId && p.id !== productId)
    .slice(0, 6) || [];

  const categoryName = categories?.find((c) => c.id === product?.categoryId)?.name || "";
  const categorySlug = categories?.find((c) => c.id === product?.categoryId)?.slug || "";

  const handleAddToCart = () => {
    if (!product || product.inStock === 0) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
      },
      quantity
    );
    setJustAdded(true);
    playNotificationSound(); // Jouer le son de notification
    toast.success(`${product.name} ajouté au panier (x${quantity})`);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = settings.phone1.replace(/[^0-9]/g, "");
    const message = `Bonjour Jappandal Boutique, je suis intéressé par :\n\n📦 ${product.name}\n💰 Prix: ${parseFloat(product.price).toLocaleString("fr-FR")} FCFA${product.unit ? `/${product.unit}` : ""}\n📊 Quantité: ${quantity}\n\nMerci !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${parseFloat(product.price).toLocaleString("fr-FR")} FCFA`,
          url: window.location.href,
        });
      } catch { /* cancelled */ }
    }
  };

  const images: string[] = [];
  if (product?.imageUrl) images.push(product.imageUrl);
  if (product?.image2Url) images.push(product.image2Url);
  if (product?.image3Url) images.push(product.image3Url);
  if (product?.image4Url) images.push(product.image4Url);
  if (product?.image5Url) images.push(product.image5Url);

  const navigateImage = useCallback((direction: "prev" | "next") => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % images.length;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Produit non trouvé</h2>
          <p className="text-gray-500 mb-4">Ce produit n'existe pas ou a été supprimé</p>
          <Button asChild>
            <Link href="/produits">Voir tous les produits</Link>
          </Button>
        </main>
      </div>
    );
  }

  const formattedPrice = parseFloat(product.price).toLocaleString("fr-FR");
  const inCart = items.find((item) => item.id === product.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
              <Link href="/"><span className="hover:text-[#1E5A8E]">Accueil</span></Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              {categoryName && (
                <>
                  <Link href={`/categories/${categorySlug}`}>
                    <span className="hover:text-[#1E5A8E]">{categoryName}</span>
                  </Link>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                </>
              )}
              <span className="text-gray-800 font-medium truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Gallery - Enhanced */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="bg-white rounded-xl overflow-hidden border shadow-sm relative group">
                <div className="aspect-square relative">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex] || images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 cursor-zoom-in"
                      onClick={() => setIsZoomed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-100">
                      🛒
                    </div>
                  )}
                  
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#A8D24E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  
                  {/* Top right actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {images.length > 0 && (
                      <button
                        onClick={() => setIsZoomed(true)}
                        className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ZoomIn className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Navigation arrows for multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => navigateImage("prev")}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => navigateImage("next")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedImageIndex === index
                          ? "ring-2 ring-[#1E5A8E] ring-offset-2 shadow-md scale-[1.02]"
                          : "border-2 border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"
                      }`}
                      style={{ width: "80px", height: "80px" }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">{product.name}</h1>

              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-[#1E5A8E]">
                    {formattedPrice} FCFA
                  </span>
                  {product.unit && (
                    <span className="text-sm text-gray-500">/{product.unit}</span>
                  )}
                </div>
                <div className="mt-2">
                  {product.inStock > 0 ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      En stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Rupture de stock
                    </span>
                  )}
                </div>
              </div>

              {product.inStock > 0 && (
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Quantité</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      Total: <strong className="text-[#1E5A8E]">{(parseFloat(product.price) * quantity).toLocaleString("fr-FR")} FCFA</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="hidden md:flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.inStock === 0}
                  size="lg"
                  className={`flex-1 h-12 font-semibold text-base ${
                    justAdded ? "bg-[#1E5A8E] hover:bg-[#1E5A8E]" : "bg-[#A8D24E] hover:bg-[#8BB83E]"
                  } text-white transition-colors`}
                >
                  {justAdded ? (
                    <><Check className="h-5 w-5 mr-2" />Ajouté au panier !</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5 mr-2" />Ajouter au panier</>
                  )}
                </Button>
                <Button
                  onClick={handleWhatsApp}
                  size="lg"
                  className="h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {inCart && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-blue-700">{inCart.quantity} dans votre panier</span>
                  <Link href="/panier" className="ml-auto">
                    <span className="text-xs text-[#1E5A8E] font-semibold underline">Voir le panier</span>
                  </Link>
                </div>
              )}

              {product.description && (
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-gray-800">Livraison & Garantie</h3>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-[#1E5A8E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Livraison à domicile</p>
                    <p className="text-xs text-gray-500">Disponible dans la région de Dakar (1 000 - 4 000 FCFA)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#1E5A8E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Qualité garantie</p>
                    <p className="text-xs text-gray-500">Produits frais et certifiés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="container py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-lg font-bold text-gray-800">Produits similaires</h2>
              <Link href={`/categories/${categorySlug}`}>
                <span className="text-xs text-[#A8D24E] font-semibold flex items-center gap-1">
                  Voir plus <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[45vw] md:w-48">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    unit={p.unit}
                    imageUrl={p.imageUrl}
                    badge={p.badge}
                    inStock={p.inStock}
                    compact
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fixed bottom bar - mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        <div className="flex gap-2 p-3">
          <a
            href={`tel:${settings.phone1}`}
            className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 flex-shrink-0"
          >
            <Phone className="h-5 w-5 text-[#1E5A8E]" />
          </a>
          <button
            onClick={handleAddToCart}
            disabled={product?.inStock === 0}
            className={`flex-1 h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              justAdded
                ? "bg-[#1E5A8E] text-white"
                : product?.inStock === 0
                ? "bg-gray-200 text-gray-400"
                : "bg-[#A8D24E] text-white active:bg-[#8BB83E]"
            }`}
          >
            {justAdded ? (
              <><Check className="h-4 w-4" />Ajouté !</>
            ) : (
              <><ShoppingCart className="h-4 w-4" />Ajouter au panier</>
            )}
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={images[selectedImageIndex]}
            alt={product.name}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Thumbnail strip in zoom mode */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(index); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? "ring-2 ring-white shadow-lg scale-110"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
