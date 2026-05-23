import { createContext, useContext, useEffect, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { BOUTIQUE_INFO } from "@shared/constants";

interface SiteSettings {
  shopName: string;
  shopSlogan: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  whatsappNumber: string;
  logoUrl: string;
  heroImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  whatsappMessageTemplate: string;
  siteDescription: string;
  siteValues: string;
  refetchSettings: () => void;
}

const defaultSettings: SiteSettings = {
  shopName: BOUTIQUE_INFO.name,
  shopSlogan: BOUTIQUE_INFO.slogan,
  phone1: BOUTIQUE_INFO.phone1,
  phone2: BOUTIQUE_INFO.phone2,
  email: BOUTIQUE_INFO.email,
  address: BOUTIQUE_INFO.address,
  whatsappNumber: BOUTIQUE_INFO.phone1,
  logoUrl: BOUTIQUE_INFO.logoUrl,
  heroImageUrl: "",
  primaryColor: "#1E5A8E",
  secondaryColor: "#0D3B0D",
  accentColor: "#A8D24E",
  whatsappMessageTemplate: "",
  siteDescription: BOUTIQUE_INFO.slogan,
  siteValues: "Qualité, Économie, Confiance",
  refetchSettings: () => {},
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: allSettings, refetch } = trpc.settings.public.useQuery(undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const refetchSettings = useCallback(() => {
    refetch();
  }, [refetch]);

  const settings = useMemo(() => {
    if (!allSettings) return { ...defaultSettings, refetchSettings };

    const map: Record<string, string> = {};
    allSettings.forEach((s: { key: string; value: string | null }) => {
      if (s.value) map[s.key] = s.value;
    });

    return {
      shopName: map["shop_name"] || defaultSettings.shopName,
      shopSlogan: map["shop_slogan"] || map["site_description"] || defaultSettings.shopSlogan,
      phone1: map["phone_1"] || map["whatsapp_phone"] || defaultSettings.phone1,
      phone2: map["phone_2"] || map["whatsapp_phone_2"] || defaultSettings.phone2,
      email: map["email"] || map["admin_email"] || defaultSettings.email,
      address: map["address"] || defaultSettings.address,
      whatsappNumber: map["whatsapp_number"] || map["whatsapp_phone"] || map["phone_1"] || defaultSettings.whatsappNumber,
      logoUrl: map["logo_url"] || defaultSettings.logoUrl,
      heroImageUrl: map["hero_image_url"] || defaultSettings.heroImageUrl,
      primaryColor: map["primary_color"] || defaultSettings.primaryColor,
      secondaryColor: map["secondary_color"] || defaultSettings.secondaryColor,
      accentColor: map["accent_color"] || defaultSettings.accentColor,
      whatsappMessageTemplate: map["whatsapp_message_template"] || defaultSettings.whatsappMessageTemplate,
      siteDescription: map["site_description"] || defaultSettings.siteDescription,
      siteValues: map["site_values"] || defaultSettings.siteValues,
      refetchSettings,
    };
  }, [allSettings, refetchSettings]);

  // Apply colors as CSS custom properties dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", settings.primaryColor);
    root.style.setProperty("--color-secondary", settings.secondaryColor);
    root.style.setProperty("--color-accent", settings.accentColor);
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
