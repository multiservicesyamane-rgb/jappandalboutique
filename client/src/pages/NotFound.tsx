import { Home, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060f1e] relative overflow-hidden">
      {/* Orbes neon de fond */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 glow-orb bg-[#1E5A8E] opacity-25 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 glow-orb bg-[#A8D24E] opacity-20 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* 404 néon */}
        <div className="mb-6">
          <span
            className="text-[120px] md:text-[160px] font-black leading-none"
            style={{
              background: "linear-gradient(135deg, #1E5A8E, #A8D24E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 20px rgba(168,210,78,0.4)) drop-shadow(0 0 40px rgba(30,90,142,0.3))",
            }}
          >
            404
          </span>
        </div>

        {/* Séparateur néon */}
        <div className="neon-separator mb-6" />

        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
          Page introuvable
        </h2>
        <p className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed">
          Cette page n'existe pas ou a été déplacée.
          <br />
          Retournez à l'accueil pour continuer vos achats.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 bg-[#1E5A8E] hover:bg-[#2670a8] text-white font-bold px-6 py-3 rounded-xl transition-all neon-blue hover-lift"
          >
            <Home className="h-4 w-4" />
            Accueil
          </button>
          <button
            onClick={() => navigate("/produits")}
            className="inline-flex items-center justify-center gap-2 bg-[#A8D24E] hover:bg-[#97c43d] text-white font-bold px-6 py-3 rounded-xl transition-all neon-green hover-lift"
          >
            <ShoppingBag className="h-4 w-4" />
            Voir les produits
          </button>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-4 inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la page précédente
        </button>
      </div>
    </div>
  );
}
