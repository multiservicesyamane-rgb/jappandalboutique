import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { deliveryZones } from "@/lib/deliveryZones";
import { trpc } from "@/lib/trpc";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowLeft,
  MessageCircle, User, Phone, MapPin, ChevronDown, Loader2,
} from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const settings = useSettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedZone = deliveryZones.find((z) => z.id === zoneId);
  const deliveryFee = selectedZone?.price ?? 0;
  const grandTotal = totalPrice + deliveryFee;

  const groups = Array.from(new Set(deliveryZones.map((z) => z.group)));

  const createFromCart = trpc.orders.createFromCart.useMutation();

  const handleOrder = async () => {
    if (!name.trim()) { alert("Veuillez entrer votre nom"); return; }
    if (!phone.trim()) { alert("Veuillez entrer votre numéro de téléphone"); return; }
    if (!zoneId) { alert("Veuillez choisir votre zone de livraison"); return; }

    setIsSubmitting(true);

    const itemLines = items
      .map((i) => `• ${i.name} ×${i.quantity} = ${(parseFloat(i.price) * i.quantity).toLocaleString("fr-FR")} FCFA`)
      .join("\n");

    try {
      // Enregistrer la commande en base de données
      await createFromCart.mutateAsync({
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          productPrice: i.price,
          quantity: i.quantity,
        })),
        customerName: name.trim(),
        customerPhone: phone.trim().replace(/[^0-9]/g, ""),
        deliveryLocation: selectedZone?.name,
      });
    } catch {
      // La commande continue même si la sauvegarde échoue
    }

    const trackingUrl = `${window.location.origin}/suivi-commande`;
    const msg = [
      "🛒 *NOUVELLE COMMANDE — Jappandal Boutique*",
      "",
      itemLines,
      "",
      `📦 *Sous-total :* ${totalPrice.toLocaleString("fr-FR")} FCFA`,
      `🚚 *Livraison (${selectedZone?.name}) :* ${deliveryFee.toLocaleString("fr-FR")} FCFA`,
      `💰 *TOTAL :* ${grandTotal.toLocaleString("fr-FR")} FCFA`,
      "",
      `👤 *Nom :* ${name}`,
      `📞 *Téléphone :* ${phone}`,
      `📍 *Zone :* ${selectedZone?.name}`,
      "",
      `🔍 *Suivre votre commande :* ${trackingUrl}`,
      "",
      "Merci de confirmer la disponibilité et l'heure de livraison. 🙏",
    ].join("\n");

    const rawPhone = settings.phone1.replace(/[^0-9]/g, "");
    const phoneNum = rawPhone.startsWith("221") ? rawPhone : `221${rawPhone}`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`, "_blank");
    clearCart();
    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Parcourez nos produits et ajoutez vos articles préférés</p>
            <Link href="/produits">
              <span className="inline-flex items-center gap-2 bg-[#1E5A8E] text-white font-bold px-6 py-3 rounded-full cursor-pointer hover:bg-[#0D3B0D] transition-colors">
                <ShoppingBag className="h-5 w-5" />
                Découvrir nos produits
              </span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pb-6">
        <div className="container py-4 md:py-6 max-w-3xl mx-auto">
          <Link href="/produits">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1E5A8E] mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Continuer les achats
            </button>
          </Link>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Mon Panier</h1>
          <p className="text-sm text-gray-500 mb-5">
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </p>

          {/* ── Cart Items ── */}
          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const itemTotal = parseFloat(item.price) * item.quantity;
              return (
                <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl border shadow-sm">
                  <Link href={`/produits/${item.id}`}>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 w-[72px] h-[72px]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h3>
                    <p className="text-[#1E5A8E] font-bold text-sm mt-0.5">
                      {parseFloat(item.price).toLocaleString("fr-FR")} FCFA
                      {item.unit && <span className="text-gray-400 font-normal text-xs">/{item.unit}</span>}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">
                          {itemTotal.toLocaleString("fr-FR")} F
                        </span>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Vider le panier
              </button>
            </div>
          </div>

          {/* ── Finaliser la commande ── */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E5A8E] to-[#0D3B0D] px-5 py-4">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Finaliser la commande
              </h2>
              <p className="text-white/70 text-xs mt-0.5">Commandez facilement via WhatsApp</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Récap total */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-semibold">{totalPrice.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className={selectedZone ? "font-semibold text-[#1E5A8E]" : "text-gray-400"}>
                    {selectedZone ? `${deliveryFee.toLocaleString("fr-FR")} FCFA` : "Choisir zone →"}
                  </span>
                </div>
                {selectedZone && (
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Total</span>
                    <span className="text-[#1E5A8E] text-lg">{grandTotal.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <User className="h-4 w-4 text-[#1E5A8E]" /> Votre nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mamadou Diallo"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5A8E]/40 focus:border-[#1E5A8E]"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Phone className="h-4 w-4 text-[#1E5A8E]" /> Numéro de téléphone
                </label>
                <div className="flex">
                  <span className="flex items-center gap-1 border border-r-0 rounded-l-xl px-3 py-3 bg-gray-50 text-sm text-gray-600 font-semibold whitespace-nowrap">
                    🇸🇳 +221
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="77 123 45 67"
                    className="flex-1 border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5A8E]/40 focus:border-[#1E5A8E]"
                  />
                </div>
              </div>

              {/* Zone de livraison */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="h-4 w-4 text-[#1E5A8E]" /> Zone de livraison
                </label>
                <div className="relative">
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5A8E]/40 focus:border-[#1E5A8E] appearance-none bg-white"
                  >
                    <option value="">-- Choisir votre quartier --</option>
                    {groups.map((group) => (
                      <optgroup key={group} label={group}>
                        {deliveryZones
                          .filter((z) => z.group === group)
                          .map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name} — {z.price.toLocaleString("fr-FR")} FCFA
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {selectedZone && (
                  <p className="text-xs text-[#1E5A8E] mt-1 font-medium">
                    ✅ Livraison {selectedZone.group.split(":")[0]} : {deliveryFee.toLocaleString("fr-FR")} FCFA
                  </p>
                )}
              </div>

              {/* Bouton commander */}
              <button
                onClick={handleOrder}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] active:scale-95 text-white font-bold py-4 rounded-xl text-base transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Enregistrement...</>
                ) : (
                  <>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Commander sur WhatsApp
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Paiement à la livraison · Livraison sous 24h à Dakar
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
