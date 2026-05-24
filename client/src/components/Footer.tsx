import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export function Footer() {
  const settings = useSettings();

  return (
    <footer className="bg-[#060f1e] text-white relative overflow-hidden">
      {/* Orbes décoratifs */}
      <div className="absolute top-0 left-0 w-64 h-64 glow-orb bg-[#1E5A8E] opacity-15 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 glow-orb bg-[#A8D24E] opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4" />

      {/* Séparateur néon */}
      <div className="neon-separator" />

      <div className="container py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo + description */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="h-10 w-10 rounded-full bg-white p-0.5 ring-2 ring-[#A8D24E]/40"
                style={{ boxShadow: "0 0 10px rgba(168,210,78,0.25)" }}
              />
              <div>
                <h3 className="font-bold text-sm text-neon-green">{settings.shopName}</h3>
                <p className="text-[10px] text-gray-500">{settings.shopSlogan}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Votre destination pour des produits frais, locaux et de qualité au meilleur prix à Dakar.
            </p>
            <a
              href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Jappandal !")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-full whatsapp-neon"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Commander via WhatsApp
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-[#A8D24E] text-sm mb-3 text-neon-green">Navigation</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/produits", label: "Nos Produits" },
                { href: "/categories", label: "Catégories" },
                { href: "/panier", label: "Mon Panier" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span className="text-xs text-gray-400 hover:text-[#A8D24E] transition-colors duration-200 hover:text-neon-green">
                    {label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#A8D24E] text-sm mb-3 text-neon-green">Contact</h4>
            <div className="flex flex-col gap-2.5">
              <a href={`tel:${settings.phone1}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                <Phone className="h-3 w-3 flex-shrink-0 text-[#A8D24E]" />
                {settings.phone1}
              </a>
              {settings.phone2 && (
                <a href={`tel:${settings.phone2}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-3 w-3 flex-shrink-0 text-[#A8D24E]" />
                  {settings.phone2}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors break-all">
                  <Mail className="h-3 w-3 flex-shrink-0 text-[#A8D24E]" />
                  {settings.email}
                </a>
              )}
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="font-bold text-[#A8D24E] text-sm mb-3 text-neon-green">Horaires</h4>
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0 text-[#A8D24E]" />
              <div>
                <div>Lun — Sam : 8h – 21h</div>
                <div className="mt-1">Dimanche : 9h – 14h</div>
              </div>
            </div>
            {settings.address && (
              <div className="flex items-start gap-2 text-xs text-gray-400 mt-2.5">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-[#A8D24E]" />
                <span>{settings.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} <span className="text-[#A8D24E]">{settings.shopName}</span>. Tous droits réservés. Fait avec ❤️ au Sénégal.
          </p>
        </div>
      </div>
    </footer>
  );
}
