import { Link } from "wouter";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { playNotificationSound } from "@/lib/playNotificationSound";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  unit?: string | null;
  imageUrl?: string | null;
  badge?: string | null;
  inStock?: number;
  compact?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  unit,
  imageUrl,
  badge,
  inStock = 1,
  compact = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock === 0) return;
    addItem({ id, name, price, unit, imageUrl });
    playNotificationSound();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const formattedPrice = parseFloat(price).toLocaleString("fr-FR");

  return (
    <Link href={`/produits/${id}`} className="block h-full">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover-glow group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-white via-white to-[#E9F3E5] ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
          {/* Subtle light effect overlaid (green glowing aura) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_60%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,210,78,0.1),transparent_50%)] pointer-events-none"></div>
          
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-xl relative z-10"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center relative z-10">
              <span className="text-sm font-black text-[#1E5A8E]/60 uppercase tracking-wide leading-tight">
                {name}
              </span>
            </div>
          )}

          {/* Badge */}
          {badge && (
            <span className="absolute top-2 left-2 bg-[#A8D24E] text-white text-[10px] font-black px-2 py-0.5 rounded-full neon-green shadow-sm">
              {badge}
            </span>
          )}

          {/* Rupture de stock */}
          {inStock === 0 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Rupture
              </span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-2 md:p-3 flex-1 flex flex-col">
          <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 flex-1 leading-tight">
            {name}
          </h3>
          <div className="mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-sm md:text-base font-black price-neon">
                {formattedPrice}
              </span>
              <span className="text-[10px] md:text-xs text-gray-400">
                FCFA{unit ? `/${unit}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton panier */}
        <div className="px-2 pb-2 md:px-3 md:pb-3">
          <button
            onClick={handleAddToCart}
            disabled={inStock === 0}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all active:scale-95 ${
              justAdded
                ? "bg-[#1E5A8E] text-white neon-blue"
                : inStock === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#A8D24E] hover:bg-[#97c43d] text-white neon-green-hover"
            }`}
          >
            {justAdded ? (
              <><Check className="h-3.5 w-3.5" /> Ajouté !</>
            ) : (
              <><ShoppingCart className="h-3.5 w-3.5" /> {compact ? "Ajouter" : "Ajouter au panier"}</>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
