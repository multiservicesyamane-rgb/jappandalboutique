import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart, Home } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Paiement annulé
          </h1>
          <p className="text-gray-600 mb-8">
            Votre paiement a été annulé. Vos articles sont toujours dans votre panier.
            Vous pouvez réessayer ou choisir un autre moyen de paiement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/panier">
              <Button className="bg-[#1B4D8F] hover:bg-[#153d72]">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Retour au panier
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
