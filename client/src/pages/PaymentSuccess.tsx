import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 mb-8">
            Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            Vous recevrez une notification par WhatsApp avec les détails de livraison.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/produits">
              <Button className="bg-[#1B4D8F] hover:bg-[#153d72]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continuer les achats
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
