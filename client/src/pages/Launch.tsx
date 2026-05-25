import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { AdBanner } from "@/components/AdBanner";
import { playNotificationSound } from "@/lib/playNotificationSound";
import { toast } from "sonner";
import {
  ShoppingCart, Check, MessageCircle, Truck, ShieldCheck,
  BadgePercent, Clock, ChevronRight, Zap, Star, Leaf, Heart, Award, Users,
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

  const featured = products?.filter((p) => p.imageUrl && p.inStock > 0).slice(0, 6) ?? [];

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
    { value: 2000, label: "Clients", suffix: "+" },
    { value: 24, label: "Livraison", suffix: "h" },
    { value: 7, label: "Jours/7", suffix: "j" },
  ];

  const features = [
    { icon: Truck, title: "Livraison Express", desc: "Dakar & banlieue en 24h" },
    { icon: ShieldCheck, title: "Qualité Garantie", desc: "Produits frais sélectionnés" },
    { icon: BadgePercent, title: "Meilleurs Prix", desc: "Économisez à chaque commande" },
    { icon: Clock, title: "Service 7j/7", desc: "Toujours disponibles pour vous" },
  ];

  const gieValues = [
    { icon: Leaf, title: "Agriculture Saine", desc: "Des produits cultivés dans le respect de la nature et de la tradition sénégalaise." },
    { icon: Heart, title: "Bien-être Communautaire", desc: "Chaque achat soutient des familles locales et renforce notre économie nationale." },
    { icon: Users, title: "Jeunes Entrepreneurs", desc: "Un GIE fondé et géré par des jeunes passionnés de bâtir un Sénégal sain." },
    { icon: Award, title: "Excellence & Confiance", desc: "Des standards de qualité élevés pour la satisfaction totale de nos clients." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* Décor statique — remplace les particles animées (perf mobile) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-16 w-64 h-64 rounded-full bg-[#A8D24E]/5 blur-3xl" />
        <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-[#1E5A8E]/8 blur-3xl" />
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 backdrop-blur-sm bg-[#0a0f1e]/80">
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl}
            alt={settings.shopName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#A8D24E]/60"
            style={{ boxShadow: "0 0 12px rgba(168,210,78,0.4)" }}
          />
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight block leading-none" style={{ textShadow: "0 0 10px rgba(168,210,78,0.4)" }}>
              {settings.shopName}
            </span>
            <span className="text-[9px] text-[#A8D24E]/70 uppercase tracking-wider">{settings.shopSlogan || "Dakar, Sénégal"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black"
            style={{ background: "rgba(168,210,78,0.15)", border: "1px solid rgba(168,210,78,0.5)", color: "#A8D24E", boxShadow: "0 0 10px rgba(168,210,78,0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8D24E] animate-pulse" />
            BOUTIQUE OUVERTE
          </span>
          <Link href="/">
            <span className="hidden sm:block text-xs text-white/60 hover:text-white cursor-pointer transition-colors">Accueil</span>
          </Link>
          <Link href="/produits">
            <span className="text-xs sm:text-sm text-white/70 hover:text-white cursor-pointer transition-colors">Catalogue</span>
          </Link>
          <Link href="/panier">
            <span className="bg-[#A8D24E] hover:bg-[#92ba3d] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all shadow-lg shadow-[#A8D24E]/30">
              Mon panier
            </span>
          </Link>
        </div>
      </nav>

      {/* ── ANNOUNCEMENT BANNER ── */}
      <div
        className={`relative z-10 text-center py-2.5 px-4 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(90deg, #1E5A8E, #A8D24E, #1E5A8E)", backgroundSize: "300% 100%", animation: "headerShimmer 6s linear infinite" }}
      >
        <p className="text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2">
          <Zap className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
          Lancement officiel — Livraison express à Dakar & banlieue — Commandez maintenant !
          <Zap className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
        </p>
      </div>

      {/* ── PUB HAUT (vidéo / GIF / image) — configurée via Admin › Publicités ── */}
      <div className="relative z-10 px-4 pt-4 max-w-4xl mx-auto w-full">
        <AdBanner position="launch_top" />
      </div>

      {/* ── PRODUITS EN VEDETTE (PREMIER) ── */}
      <section className="relative z-10 py-10 sm:py-14 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header section produits */}
          <div
            className={`text-center mb-8 sm:mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-2 bg-[#A8D24E]/15 border border-[#A8D24E]/40 text-[#A8D24E] text-xs font-bold px-4 py-2 rounded-full mb-4">
              <Star className="h-3.5 w-3.5" />
              Nos produits du moment
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">
              Des produits{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] via-[#d4f08a] to-[#A8D24E]"
                style={{ backgroundSize: "200%", animation: "headerShimmer 4s linear infinite" }}
              >
                frais & sains
              </span>
            </h2>
            <p className="text-sm sm:text-base text-white/50 max-w-lg mx-auto">
              Sélectionnés avec soin, livrés chez vous directement depuis nos producteurs locaux.
            </p>
          </div>

          {/* Grille produits */}
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
              {featured.map((product, idx) => {
                const isAdded = justAddedId === product.id;
                const price = parseFloat(product.price).toLocaleString("fr-FR");
                const isHero = idx < 2;

                return (
                  <div
                    key={product.id}
                    className={`relative group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                      isHero
                        ? "sm:col-span-1 lg:col-span-1 border-[#A8D24E]/30 bg-gradient-to-b from-white/8 to-white/4"
                        : "border-white/10 bg-white/5 hover:border-[#A8D24E]/30"
                    }`}
                    style={isHero ? { boxShadow: "0 0 20px rgba(168,210,78,0.1)" } : {}}
                  >
                    {/* Promo badge */}
                    {product.badge && (
                      <div
                        className="absolute top-2.5 left-2.5 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: "linear-gradient(135deg, #ff4e00, #ff9500)", boxShadow: "0 0 10px rgba(255,78,0,0.5)" }}
                      >
                        {product.badge}
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-black/20">
                      <img
                        src={product.imageUrl!}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-xs sm:text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-base sm:text-xl font-black text-[#A8D24E]" style={{ textShadow: "0 0 8px rgba(168,210,78,0.4)" }}>
                          {price}
                        </span>
                        <span className="text-[10px] text-white/40">FCFA{product.unit ? `/${product.unit}` : ""}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleAdd(e, product)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                            isAdded
                              ? "bg-[#0D3B0D] text-[#A8D24E]"
                              : "bg-[#A8D24E] hover:bg-[#92ba3d] text-white"
                          }`}
                          style={isAdded ? {} : { boxShadow: "0 4px 12px rgba(168,210,78,0.25)" }}
                        >
                          {isAdded ? (
                            <><Check className="h-3.5 w-3.5" /> Ajouté</>
                          ) : (
                            <><ShoppingCart className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Ajouter</span><span className="sm:hidden">+</span></>
                          )}
                        </button>
                        <Link href={`/produits/${product.id}`}>
                          <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/20 hover:border-[#A8D24E]/50 cursor-pointer transition-colors">
                            <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-white/40">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Chargement des produits...</p>
            </div>
          )}

          {/* Voir tout */}
          <div className="text-center mt-8">
            <Link href="/produits">
              <span
                className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full cursor-pointer transition-all active:scale-95 text-sm sm:text-base text-white"
                style={{
                  background: "linear-gradient(135deg, #1E5A8E, #2a7abf)",
                  boxShadow: "0 0 20px rgba(30,90,142,0.4), 0 4px 15px rgba(30,90,142,0.3)",
                }}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Voir tout le catalogue
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GIE MISSION ── */}
      <section className="relative z-10 py-14 sm:py-20 px-4 overflow-hidden">
        {/* Background decoratif */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E5A8E]/8 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#A8D24E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          {/* Badge GIE */}
          <div className="text-center mb-8 sm:mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full mb-6 border"
              style={{
                background: "rgba(168,210,78,0.1)",
                borderColor: "rgba(168,210,78,0.4)",
                color: "#A8D24E",
                boxShadow: "0 0 20px rgba(168,210,78,0.15)",
              }}
            >
              <Leaf className="h-3.5 w-3.5" />
              Notre Mission — GIE des Jeunes Conscients
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-3xl mx-auto">
              Bâtir une{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] to-[#d4f08a]">
                alimentation saine
              </span>{" "}
              pour tous les Sénégalais
            </h2>

            <div
              className="max-w-2xl mx-auto rounded-2xl p-6 sm:p-8 border relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30,90,142,0.15), rgba(168,210,78,0.08))",
                borderColor: "rgba(168,210,78,0.2)",
                boxShadow: "0 0 40px rgba(168,210,78,0.08)",
              }}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#A8D24E] to-transparent opacity-60" />
              <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-4">
                <strong className="text-[#A8D24E]">Jappandal</strong> est un GIE fondé par des jeunes entrepreneurs sénégalais conscients,
                avec pour mission de bâtir dans l'agro-alimentaire des produits sains et de qualité
                pour le bien de notre consommation et de nos familles.
              </p>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Nous croyons que chaque famille mérite d'accéder à des aliments frais, locaux et
                certifiés — sans compromis sur la qualité, à des prix justes.
                <strong className="text-white/80"> Votre santé, notre priorité.</strong>
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {["🌿 Local & Bio", "🤝 GIE Certifié", "🇸🇳 Made in Sénégal", "💚 Sain & Frais"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(168,210,78,0.15)", color: "#A8D24E", border: "1px solid rgba(168,210,78,0.3)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Valeurs GIE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {gieValues.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#A8D24E]/30 transition-all group text-center"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(168,210,78,0.15)", boxShadow: "0 0 15px rgba(168,210,78,0.1)" }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8D24E]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm mb-1">{title}</h3>
                <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUB MILIEU (vidéo / GIF / image) ── */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto w-full">
        <AdBanner position="launch_middle" />
      </div>

      {/* ── HERO / STATS ── */}
      <section className="relative z-10 py-14 sm:py-20 px-4 text-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(30,90,142,0.25),transparent_70%)]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-6 animate-pulse">
            <Zap className="h-3.5 w-3.5" />
            Lancement officiel — Dakar, Sénégal
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            <span className="block">Votre supermarché</span>
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] via-[#c5e87a] to-[#A8D24E]"
              style={{ backgroundSize: "200%", animation: "headerShimmer 5s linear infinite" }}
            >
              livré chez vous
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-white/55 max-w-xl mx-auto mb-10">
            Produits frais, packs festifs & livraison express à Dakar et banlieue.
            Commander n'a jamais été aussi simple.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-6 mb-10 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl py-4 px-2 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="text-2xl sm:text-3xl font-black text-[#A8D24E]"
                  style={{ textShadow: "0 0 15px rgba(168,210,78,0.5)" }}
                >
                  <CountUp to={s.value} />
                  {s.suffix}
                </div>
                <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/produits">
              <span
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full cursor-pointer transition-all active:scale-95 text-sm sm:text-base w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #A8D24E, #c5e87a)", boxShadow: "0 0 25px rgba(168,210,78,0.4), 0 6px 20px rgba(168,210,78,0.3)" }}
              >
                <ShoppingCart className="h-5 w-5" />
                Commander maintenant
              </span>
            </Link>
            <a
              href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal ! Je veux commander des produits frais.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full transition-all active:scale-95 text-sm sm:text-base text-white border border-white/20 hover:bg-white/10 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              Commander via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-14 sm:py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black">
              Pourquoi choisir{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D24E] to-[#c5e87a]">
                Jappandal ?
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-white/40 mt-2">
              La qualité et la confiance, au service de votre quotidien.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-[#A8D24E]/40 transition-all group text-center hover:-translate-y-1 duration-300"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(168,210,78,0.15)", boxShadow: "0 0 20px rgba(168,210,78,0.1)" }}
                >
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-[#A8D24E]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm mb-1">{title}</h3>
                <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative z-10 py-14 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E5A8E]/40 via-[#A8D24E]/20 to-[#1E5A8E]/40 rounded-3xl blur-2xl" />
            <div
              className="relative rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30,90,142,0.2), rgba(168,210,78,0.1))",
                borderColor: "rgba(168,210,78,0.25)",
                boxShadow: "0 0 50px rgba(168,210,78,0.08)",
              }}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#A8D24E] to-transparent" />
              <div className="text-5xl sm:text-6xl mb-4">🛒</div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3">
                Prêt à commander ?
              </h2>
              <p className="text-white/55 text-sm sm:text-base mb-8 max-w-sm mx-auto">
                Des centaines de produits frais et sains à portée de main.
                Livraison directement chez vous, partout à Dakar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/produits">
                  <span
                    className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg w-full sm:w-auto"
                    style={{ background: "#A8D24E", boxShadow: "0 0 25px rgba(168,210,78,0.35)" }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Voir les produits
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal ! Je souhaite commander des produits frais et sains.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full transition-all active:scale-95 w-full sm:w-auto"
                  style={{ background: "#25D366", boxShadow: "0 0 20px rgba(37,211,102,0.3)" }}
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#A8D24E]/40"
              />
              <div>
                <span className="font-black text-sm text-[#A8D24E]">{settings.shopName}</span>
                <p className="text-[10px] text-white/30 mt-0.5">GIE des Jeunes Conscients • Dakar, Sénégal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Accueil</span></Link>
              <Link href="/produits"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Produits</span></Link>
              <Link href="/categories"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Catégories</span></Link>
              <Link href="/panier"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Panier</span></Link>
              <Link href="/contact"><span className="text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors">Contact</span></Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-white/25">
              © {new Date().getFullYear()} <span className="text-[#A8D24E]">{settings.shopName}</span> · Tous droits réservés · Fait avec ❤️ au Sénégal
            </p>
          </div>
        </div>
      </footer>

      {/* 🟢 Boutique Ouverte — Strip flottant premium */}
      <div className="fixed bottom-[88px] md:bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap"
          style={{
            background: "#061806",
            border: "1px solid rgba(168,210,78,0.6)",
            color: "#A8D24E",
            boxShadow: "0 0 20px rgba(168,210,78,0.28), 0 4px 14px rgba(0,0,0,0.55)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#A8D24E] animate-pulse flex-shrink-0" />
          🛍️ BOUTIQUE OUVERTE · Livraison 7j/7 · Dakar
        </div>
      </div>

      {/* 📺 Pub flottante — configurée via Admin › Publicités (position : launch_floating) */}
      <div className="hidden md:block fixed bottom-24 left-6 z-30 max-w-[220px] rounded-2xl overflow-hidden shadow-2xl">
        <AdBanner position="launch_floating" />
      </div>

      {/* WhatsApp flottant */}
      <a
        href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal ! Je veux commander.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: "#25D366",
            boxShadow: "0 0 20px rgba(37,211,102,0.5), 0 4px 15px rgba(37,211,102,0.4)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
      </a>
    </div>
  );
}
