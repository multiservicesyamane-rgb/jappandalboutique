import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Banknote,
} from "lucide-react";

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getWhatsAppCheckoutUrl,
  } = useCart();
  const settings = useSettings();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"cash_on_delivery" | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const paymentMethods = [
    {
      id: "cash_on_delivery" as const,
      name: "Paiement à la livraison",
      description: "Payez en espèces à la réception de votre commande",
      icon: Banknote,
      color: "bg-green-500",
      textColor: "text-green-600",
      borderColor: "border-green-500",
    },
  ];

  const handlePayment = () => {
    if (!selectedPayment) {
      alert("Veuillez sélectionner un mode de paiement");
      return;
    }

    if (!acceptedTerms) {
      alert("⚠️ Veuillez accepter les conditions de paiement à la livraison");
      return;
    }

    // Paiement à la livraison: envoyer la commande par WhatsApp
    const message = `🛒 *Nouvelle Commande*\n\n${items
      .map((item) => `• ${item.name} x${item.quantity} - ${parseFloat(item.price).toLocaleString()} FCFA`)
      .join("\n")}\n\n💰 *Total:* ${totalPrice.toLocaleString()} FCFA\n\n💵 *Mode de paiement:* Paiement à la livraison\n\nMerci de me confirmer la disponibilité et les frais de livraison selon ma zone.`;
    
    const phone = settings.phone1.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setPaymentDialogOpen(false);
    setSelectedPayment(null);
    setAcceptedTerms(false);
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
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Votre panier est vide
            </h1>
            <p className="text-gray-500 mb-8">
              Parcourez nos produits et ajoutez vos articles préférés au panier
            </p>
            <Button
              size="lg"
              className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
              asChild
            >
              <Link href="/produits">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Découvrir nos produits
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pb-32 lg:pb-8">
        <div className="container py-4 md:py-6">
          {/* Back button */}
          <Link href="/produits">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1E5A8E] mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Continuer les achats
            </button>
          </Link>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            Mon Panier
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const itemTotal = parseFloat(item.price) * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-white rounded-xl border shadow-sm"
                  >
                    {/* Image */}
                    <Link href={`/produits/${item.id}`}>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🛒
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/produits/${item.id}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-800 hover:text-[#1E5A8E] transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-[#1E5A8E] font-bold text-sm mt-1">
                        {parseFloat(item.price).toLocaleString("fr-FR")} FCFA
                        {item.unit ? (
                          <span className="text-gray-400 font-normal text-xs">
                            /{item.unit}
                          </span>
                        ) : null}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">
                            {itemTotal.toLocaleString("fr-FR")} F
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Vider le panier
                </button>
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border shadow-sm p-4 md:p-6 sticky top-4">
                <h2 className="font-bold text-lg mb-4">Récapitulatif</h2>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold">
                      {totalPrice.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-gray-600">
                      À confirmer
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-[#1E5A8E]">
                    {totalPrice.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <Button
                  onClick={() => setPaymentDialogOpen(true)}
                  className="w-full bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white h-12 text-base"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Procéder au paiement
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Les frais de livraison seront confirmés par WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed WhatsApp Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 lg:hidden z-50">
        <Button
          onClick={() => window.open(getWhatsAppCheckoutUrl(), "_blank")}
          className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white h-12 text-base"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Commander sur WhatsApp
        </Button>
      </div>

      <Footer />

      {/* Payment Method Dialog - Simplifié */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Finaliser votre commande
            </DialogTitle>
            <DialogDescription>
              Choisissez votre mode de paiement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">
                  {totalPrice.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-600">
                  À confirmer sur WhatsApp
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total estimé</span>
                <span className="font-bold text-[#1E5A8E]">
                  {totalPrice.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="text-sm font-semibold mb-3 block">
                Mode de paiement
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? `${method.borderColor} bg-opacity-5`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${method.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`h-6 w-6 ${method.textColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{method.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {method.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={`h-5 w-5 ${method.textColor}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 <strong>Astuce :</strong> Après validation, vous serez redirigé vers WhatsApp pour confirmer votre commande et votre adresse de livraison. Nos frais de livraison varient selon votre zone à Dakar.
                </p>
              </div>

              {/* Checkbox de confirmation */}
              <div className="mt-4 flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Checkbox
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                >
                  <strong>J'accepte le paiement à la livraison</strong> et je comprends que je devrai payer en espèces à la réception de ma commande.
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false);
                setSelectedPayment(null);
                setAcceptedTerms(false);
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!selectedPayment}
              className="flex-1 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
            >
              Confirmer
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
