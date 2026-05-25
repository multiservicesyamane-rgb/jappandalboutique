import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AdBanner } from "@/components/AdBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useState, useCallback, useEffect } from "react";
import {
  ShoppingCart, Phone, MessageCircle,
  Minus, Plus, Check, Share2, Truck, ShieldCheck, ChevronRight,
  ChevronLeft, ZoomIn, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/playNotificationSound";
import { useRoute, useLocation } from "wouter";

export default function ProductDetail() {
  const settings = useSettings();
  const [, params] = useRoute("/produits/:id");
  const [, navigate] = useLocation();
  const id = params?.id;
  const productId = parseInt(id || "0");
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

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
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, imageUrl: product.imageUrl }, quantity);
    setJustAdded(true);
    playNotificationSound();
    toast.success(`${product.name} ajouté au panier (×${quantity})`);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = settings.phone1.replace(/[^0-9]/g, "");
    const msg = `Bonjour Jappandal ! Je suis intéressé par :\n\n📦 ${product.name}\n💰 ${parseFloat(product.price).toLocaleString("fr-FR")} FCFA${product.unit ? `/${product.unit}` : ""}\n📊 Quantité: ${quantity}\n\nMerci !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({ title: product.name, text: `${product.name} — ${parseFloat(product.price).toLocaleString("fr-FR")} FCFA`, url: window.location.href });
      } catch { /* cancelled */ }
    }
  };

  const images: string[] = [];
  if (product?.imageUrl) images.push(product.imageUrl);
  if (product?.image2Url) images.push(product.image2Url);
  if (product?.image3Url) images.push(product.image3Url);
  if (product?.image4Url) images.push(product.image4Url);
  if (product?.image5Url) images.push(product.image5Url);

  const navigateImage = useCallback((dir: "prev" | "next") => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => dir === "next" ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="aspect-square bg-gray-100 animate-pulse w-full" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
          <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
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
          <Link href="/produits"><span className="text-[#1E5A8E] underline">Voir tous les produits</span></Link>
        </main>
      </div>
    );
  }

  const formattedPrice = parseFloat(product.price).toLocaleString("fr-FR");
  const inCart = items.find((item) => item.id === product.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ─── MOBILE LAYOUT ─── */}
      <main className="flex-1 pb-24 md:hidden">
        {/* Image pleine largeur — immédiatement visible */}
        <div className="relative bg-white">
          {/* Bouton retour flottant */}
          <button
            onClick={() => navigate(-1 as any)}
            className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>

          {/* Actions flottantes */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            {images.length > 0 && (
              <button onClick={() => setIsZoomed(true)} className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </button>
            )}
            <button onClick={handleShare} className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Image principale */}
          <div className="aspect-square relative overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain p-2"
                onClick={() => setIsZoomed(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl bg-gray-100">🛒</div>
            )}
            {product.badge && (
              <span className="absolute bottom-3 left-3 bg-[#A8D24E] text-white text-xs font-bold px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => navigateImage("prev")} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => navigateImage("next")} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {selectedImageIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniatures */}
          {images.length > 1 && (
            <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImageIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImageIndex ? "border-[#1E5A8E]" : "border-gray-200 opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div className="bg-white mt-2 px-4 pt-4 pb-3">
          {categoryName && (
            <Link href={`/categories/${categorySlug}`}>
              <span className="text-xs text-[#A8D24E] font-semibold">{categoryName}</span>
            </Link>
          )}
          <h1 className="text-lg font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[#1E5A8E]">{formattedPrice}</span>
            <span className="text-sm text-gray-500">FCFA{product.unit ? `/${product.unit}` : ""}</span>
          </div>
          <div className="mt-1">
            {product.inStock > 0 ? (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> En stock
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium">Rupture de stock</span>
            )}
          </div>
        </div>

        {/* Quantité */}
        {product.inStock > 0 && (
          <div className="bg-white mt-2 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Quantité</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-base font-bold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs text-[#1E5A8E] font-bold ml-1">
                = {(parseFloat(product.price) * quantity).toLocaleString("fr-FR")} F
              </span>
            </div>
          </div>
        )}

        {inCart && (
          <div className="bg-blue-50 mx-3 mt-2 rounded-xl px-3 py-2 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-xs text-blue-700">{inCart.quantity} déjà dans votre panier</span>
            <Link href="/panier" className="ml-auto">
              <span className="text-xs text-[#1E5A8E] font-semibold underline">Voir →</span>
            </Link>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="bg-white mt-2 px-4 py-3">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Livraison */}
        <div className="bg-white mt-2 px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-[#1E5A8E] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Livraison à domicile</p>
              <p className="text-xs text-gray-500">Dakar et banlieue (1 000 – 4 000 FCFA)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#1E5A8E] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Qualité garantie</p>
              <p className="text-xs text-gray-500">Produits frais et certifiés</p>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div className="mt-2 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800">Produits similaires</h2>
              <Link href={`/categories/${categorySlug}`}>
                <span className="text-xs text-[#A8D24E] font-semibold">Voir plus</span>
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-2 scrollbar-hide">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[45vw]">
                  <ProductCard id={p.id} name={p.name} price={p.price} unit={p.unit} imageUrl={p.imageUrl} badge={p.badge} inStock={p.inStock} compact />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Bannière pub bas mobile */}
        <AdBanner position="product_detail_bottom" className="px-4 pt-2 pb-2" />
      </main>

      {/* ─── DESKTOP LAYOUT ─── */}
      <main className="hidden md:block flex-1 pb-8">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Link href="/"><span className="hover:text-[#1E5A8E]">Accueil</span></Link>
              <ChevronRight className="h-3 w-3" />
              {categoryName && (
                <><Link href={`/categories/${categorySlug}`}><span className="hover:text-[#1E5A8E]">{categoryName}</span></Link>
                <ChevronRight className="h-3 w-3" /></>
              )}
              <span className="text-gray-800 font-medium truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl overflow-hidden border shadow-sm relative group">
                <div className="aspect-square relative">
                  {images.length > 0 ? (
                    <img src={images[selectedImageIndex]} alt={product.name} className="w-full h-full object-contain p-4 cursor-zoom-in" onClick={() => setIsZoomed(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-100">🛒</div>
                  )}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#A8D24E] text-white text-xs font-bold px-3 py-1 rounded-full">{product.badge}</span>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {images.length > 0 && (
                      <button onClick={() => setIsZoomed(true)} className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                        <ZoomIn className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    <button onClick={handleShare} className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  {images.length > 1 && (
                    <>
                      <button onClick={() => navigateImage("prev")} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button onClick={() => navigateImage("next")} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImageIndex(i)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${i === selectedImageIndex ? "ring-2 ring-[#1E5A8E] ring-offset-2" : "border-2 border-gray-200 opacity-60 hover:opacity-100"}`}
                      style={{ width: 80, height: 80 }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="space-y-4">
              {categoryName && (
                <Link href={`/categories/${categorySlug}`}>
                  <span className="text-xs text-[#A8D24E] font-semibold">{categoryName}</span>
                </Link>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1E5A8E]">{formattedPrice} FCFA</span>
                  {product.unit && <span className="text-sm text-gray-500">/{product.unit}</span>}
                </div>
                <div className="mt-2">
                  {product.inStock > 0 ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> En stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Rupture de stock</span>
                  )}
                </div>
              </div>
              {product.inStock > 0 && (
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Quantité</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      Total: <strong className="text-[#1E5A8E]">{(parseFloat(product.price) * quantity).toLocaleString("fr-FR")} FCFA</strong>
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.inStock === 0}
                  className={`flex-1 h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors ${justAdded ? "bg-[#1E5A8E] text-white" : product.inStock === 0 ? "bg-gray-200 text-gray-400" : "bg-[#A8D24E] hover:bg-[#8BB83E] text-white"}`}>
                  {justAdded ? <><Check className="h-5 w-5" />Ajouté !</> : <><ShoppingCart className="h-5 w-5" />Ajouter au panier</>}
                </button>
                <button onClick={handleWhatsApp} className="h-12 px-5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </button>
              </div>
              {inCart && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-blue-700">{inCart.quantity} dans votre panier</span>
                  <Link href="/panier" className="ml-auto"><span className="text-xs text-[#1E5A8E] font-semibold underline">Voir →</span></Link>
                </div>
              )}
              {product.description && (
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-[#1E5A8E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Livraison à domicile</p>
                    <p className="text-xs text-gray-500">Dakar & banlieue (1 000 – 4 000 FCFA)</p>
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

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Produits similaires</h2>
                <Link href={`/categories/${categorySlug}`}>
                  <span className="text-xs text-[#A8D24E] font-semibold flex items-center gap-1">Voir plus <ChevronRight className="h-3.5 w-3.5" /></span>
                </Link>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} unit={p.unit} imageUrl={p.imageUrl} badge={p.badge} inStock={p.inStock} compact />
                ))}
              </div>
            </div>
          )}

          {/* Bannière pub desktop */}
          <AdBanner position="product_detail_bottom" className="mt-6" />
        </div>
        <Footer />
      </main>

      {/* Barre fixe mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        <div className="flex gap-2 p-3">
          <a href={`tel:${settings.phone1}`} className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-[#1E5A8E]" />
          </a>
          <button onClick={handleAddToCart} disabled={product.inStock === 0}
            className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${justAdded ? "bg-[#1E5A8E] text-white" : product.inStock === 0 ? "bg-gray-200 text-gray-400" : "bg-[#A8D24E] text-white"}`}>
            {justAdded ? <><Check className="h-4 w-4" />Ajouté !</> : <><ShoppingCart className="h-4 w-4" />Ajouter au panier</>}
          </button>
          <button onClick={handleWhatsApp} className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Zoom modal */}
      {isZoomed && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setIsZoomed(false)}>
          <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl z-10">×</button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white z-10">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigateImage("next"); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white z-10">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img src={images[selectedImageIndex]} alt={product.name} className="max-w-full max-h-full object-contain p-4" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
