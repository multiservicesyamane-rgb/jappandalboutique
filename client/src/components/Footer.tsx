import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export function Footer() {
  const settings = useSettings();

  return (
    <footer className="bg-[#0D1F3A] text-white">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo et description */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="h-10 w-10 rounded-full bg-white p-0.5"
              />
              <div>
                <h3 className="font-bold text-sm">{settings.shopName}</h3>
                <p className="text-[10px] text-gray-400">{settings.shopSlogan}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Votre destination pour des produits frais, locaux et de qualité au meilleur prix.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-[#A8D24E] text-sm mb-3">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/"><span className="text-xs text-gray-300 hover:text-white transition-colors">Accueil</span></Link>
              <Link href="/produits"><span className="text-xs text-gray-300 hover:text-white transition-colors">Nos Produits</span></Link>
              <Link href="/categories"><span className="text-xs text-gray-300 hover:text-white transition-colors">Catégories</span></Link>
              <Link href="/panier"><span className="text-xs text-gray-300 hover:text-white transition-colors">Mon Panier</span></Link>
              <Link href="/contact"><span className="text-xs text-gray-300 hover:text-white transition-colors">Contact</span></Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[#A8D24E] text-sm mb-3">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href={`tel:${settings.phone1}`} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors">
                <Phone className="h-3 w-3 flex-shrink-0" />
                {settings.phone1}
              </a>
              <a href={`tel:${settings.phone2}`} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors">
                <Phone className="h-3 w-3 flex-shrink-0" />
                {settings.phone2}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors break-all">
                <Mail className="h-3 w-3 flex-shrink-0" />
                {settings.email}
              </a>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="font-semibold text-[#A8D24E] text-sm mb-3">Horaires</h4>
            <div className="flex items-start gap-2 text-xs text-gray-300">
              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <div>Lundi — Samedi : 8h - 21h</div>
                <div className="mt-1">Dimanche : 9h - 14h</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-300 mt-2">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{settings.address}</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {settings.shopName}. Tous droits réservés. Fait avec amour au Sénégal.
          </p>
        </div>
      </div>
    </footer>
  );
}
