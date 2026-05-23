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
    playNotificationSound(); // Jouer le son de notification
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const formattedPrice = parseFloat(price).toLocaleString("fr-FR");

  return (
    <Link href={`/produits/${id}`}>
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-premium hover:shadow-premium-lg hover-lift group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className={`relative bg-gray-50 overflow-hidden ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl bg-gray-100">
              🛒
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <span className="absolute top-2 left-2 bg-[#A8D24E] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded neon-green">
              {badge}
            </span>
          )}

          {/* Out of stock overlay */}
          {inStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                Rupture
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2 md:p-3 flex-1 flex flex-col">
          <h3 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 mb-1 flex-1 leading-tight">
            {name}
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-sm md:text-base font-bold text-[#1E5A8E]">
                {formattedPrice}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500">
                FCFA{unit ? `/${unit}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Add to cart button */}
        <div className="px-2 pb-2 md:px-3 md:pb-3">
          <button
            onClick={handleAddToCart}
            disabled={inStock === 0}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-xs md:text-sm font-semibold transition-all ${
              justAdded
                ? "bg-[#1E5A8E] text-white neon-blue"
                : inStock === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#A8D24E] hover:bg-[#A8D24E] text-white active:scale-95 neon-green-hover"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Ajouté
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Ajouter au panier
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
