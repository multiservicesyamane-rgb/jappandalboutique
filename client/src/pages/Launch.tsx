import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { playNotificationSound } from "@/lib/playNotificationSound";
import { toast } from "sonner";
import {
  ShoppingCart, Check, MessageCircle, Truck, ShieldCheck,
  BadgePercent, Clock, ChevronRight, Zap, Star, Package,
} from "lucide-react";

function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{val.toLocaleString("fr-FR")}</>;
}

export default function Launch() {
  const settings = useSettings();
  const { addItem } = useCart();
  const { data: products } = trpc.products.list.useQuery();
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // 2 produits phares: les 2 premiers avec image
  const featured = products?.filter((p) => p.imageUrl).slice(0, 2) ?? [];

  const handleAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, imageUrl: product.imageUrl });
    playNotificationSound();
    toast.success(`${product.name} ajouté !`);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const stats = [
    { value: 500, label: "Produits", suffix: "+" },
    { value: 24, label: "H livraison", suffix: "h" },
    { value: 7, label: "Jours/7", suffix: "j" },
  ];

  const features = [
    { icon: Truck, title: "Livraison Express", desc: "Dakar & banlieue en 24h" },
    { icon: ShieldCheck, title: "Qualité Garantie", desc: "Produits frais sélectionnés" },
    { icon: BadgePercent, title: "Meilleurs Prix", desc: "Économisez à chaque commande" },
    { icon: Clock, title: "Service 7j/7", desc: "Toujours disponibles pour vous" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── Floating particles background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: i % 3 === 0 ? "#A8D24E" : i % 3 === 1 ? "#1E5A8E" : "#fff",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A8D24E] flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-sm sm:text-base tracking-tight">
            {settings.shopName}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/produits">
            <span className="text-xs sm:text-sm text-white/70 hover:text-white cursor-pointer transition-colors">
              Catalogue
            </span>
          </Link>
          <Link href="/panier">
            <span className="bg-[#A8D24E] hover:bg-[#92ba3d] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors">
              Mon panier
            </span>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-16">
        {/* Glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(30,90,142,0.35),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A8D24E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#1E5A8E]/20 rounded-full blur-3xl" />

        {/* Badge */}
        <div
          className={`relative z-10 inline-flex items-center gap-2 bg-[#A8D24E]/15 border border-[#A8D24E]/40 text-[#A8D24E] text-xs sm:text-sm font-bold px-4 py-2 rounded-full mb-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          Lancement officiel — Dakar, Sénégal
        </div>

        {/* Headline */}
        <h1
          className={`relative z-10 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="block">Votre supermarché</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] via-[#c5e87a] to-[#A8D24E]">
            livré chez vous
          </span>
        </h1>

        <p
          className={`relative z-10 text-sm sm:text-lg md:text-xl text-white/60 max-w-xl mb-8 leading-relaxed transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Produits frais, packs festifs & livraison express à Dakar et banlieue.
          Commander n'a jamais été aussi simple.
        </p>

        {/* CTA Buttons */}
        <div
          className={`relative z-10 flex flex-col sm:flex-row gap-3 mb-12 transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link href="/produits">
            <span className="inline-flex items-center gap-2 bg-[#A8D24E] hover:bg-[#92ba3d] text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg shadow-[#A8D24E]/30 text-sm sm:text-base">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Commander maintenant
            </span>
          </Link>
          <a
            href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal ! Je veux commander.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all active:scale-95 text-sm sm:text-base"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#25D366]" />
            WhatsApp direct
          </a>
        </div>

        {/* Stats */}
        <div
          className={`relative z-10 flex items-center gap-6 sm:gap-12 transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#A8D24E]">
                <CountUp to={s.value} />
                {s.suffix}
              </div>
              <div className="text-xs sm:text-sm text-white/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── PRODUITS PHARES ── */}
      {featured.length > 0 && (
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[#A8D24E] text-xs font-bold uppercase tracking-widest mb-3">
                <Star className="h-3.5 w-3.5" /> Nos coups de cœur
              </div>
              <h2 className="text-2xl sm:text-4xl font-black">
                Produits{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] to-[#c5e87a]">
                  phares
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              {featured.map((product) => {
                const isAdded = justAddedId === product.id;
                const price = parseFloat(product.price).toLocaleString("fr-FR");
                const originalPrice = Math.round(parseFloat(product.price) * 1.25).toLocaleString("fr-FR");

                return (
                  <div
                    key={product.id}
                    className="relative bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#A8D24E]/50 transition-all group"
                  >
                    {/* Discount badge */}
                    <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -20%
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.imageUrl!}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-base sm:text-lg leading-tight mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-white/50 text-xs sm:text-sm line-clamp-2 mb-3">{product.description}</p>
                      )}

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl sm:text-2xl font-black text-[#A8D24E]">{price}</span>
                        <span className="text-xs text-white/40">FCFA</span>
                        <span className="text-xs text-white/30 line-through">{originalPrice} FCFA</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleAdd(e, product)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                            isAdded
                              ? "bg-[#0D3B0D] text-[#A8D24E]"
                              : "bg-[#A8D24E] hover:bg-[#92ba3d] text-white shadow-lg shadow-[#A8D24E]/20"
                          }`}
                        >
                          {isAdded ? (
                            <><Check className="h-4 w-4" /> Ajouté !</>
                          ) : (
                            <><ShoppingCart className="h-4 w-4" /> Ajouter au panier</>
                          )}
                        </button>
                        <Link href={`/produits/${product.id}`}>
                          <span className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/20 hover:border-[#A8D24E]/50 cursor-pointer transition-colors">
                            <ChevronRight className="h-4 w-4 text-white/60" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voir tout le catalogue */}
            <div className="text-center mt-8">
              <Link href="/produits">
                <span className="inline-flex items-center gap-2 text-[#A8D24E] hover:text-white font-bold cursor-pointer transition-colors group">
                  Voir tout le catalogue
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-16 sm:py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black">
              Pourquoi choisir{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] to-[#c5e87a]">
                Jappandal ?
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center hover:border-[#A8D24E]/40 hover:bg-white/8 transition-all group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#A8D24E]/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A8D24E]/25 transition-colors">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8D24E]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm mb-1">{title}</h3>
                <p className="text-white/40 text-[10px] sm:text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E5A8E]/30 via-[#A8D24E]/20 to-[#0D3B0D]/30 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-[#1E5A8E]/20 to-[#0D3B0D]/20 border border-white/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
              <div className="text-4xl sm:text-5xl mb-4">🛒</div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3">
                Prêt à commander ?
              </h2>
              <p className="text-white/60 text-sm sm:text-base mb-8">
                Des centaines de produits à portée de main. Livraison directement chez vous.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/produits">
                  <span className="inline-flex items-center justify-center gap-2 bg-[#A8D24E] hover:bg-[#92ba3d] text-white font-bold px-8 py-4 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg shadow-[#A8D24E]/25 w-full sm:w-auto">
                    <ShoppingCart className="h-5 w-5" />
                    Voir les produits
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal ! Je souhaite commander.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-8 py-4 rounded-full transition-all active:scale-95 w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER minimal ── */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-4 text-center">
        <p className="text-white/30 text-xs">
          © 2026 {settings.shopName} · Dakar, Sénégal · Tous droits réservés
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Accueil</span></Link>
          <Link href="/produits"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Produits</span></Link>
          <Link href="/categories"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Catégories</span></Link>
          <Link href="/panier"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Panier</span></Link>
        </div>
      </footer>
    </div>
  );
}
