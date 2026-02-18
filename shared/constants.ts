// Logo et informations de la boutique
export const BOUTIQUE_INFO = {
  name: "Jappandal Boutique",
  slogan: "Votre Supermarché de Confiance",
  logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663337622636/ieRYRvxzNCCKOVkC.png",
  phone1: "+221 77 682 78 51",
  phone2: "+221 76 905 51 94",
  email: "multiservicesyamane@gmail.com",
  address: "Sénégal",
  hours: {
    weekdays: "Lundi — Samedi : 8h - 21h",
    sunday: "Dimanche : 9h - 14h"
  },
  values: [
    {
      title: "Qualité",
      description: "Nous sélectionnons rigoureusement chaque produit pour vous garantir une fraîcheur et une qualité irréprochables. Nos partenaires locaux partagent notre exigence."
    },
    {
      title: "Économie",
      description: "Des prix justes et compétitifs pour tous les budgets. Nous négocions directement avec les producteurs pour vous offrir le meilleur rapport qualité-prix."
    },
    {
      title: "Confiance",
      description: "Depuis notre création, la confiance de nos clients est notre plus grande fierté. Transparence, honnêteté et service irréprochable sont nos engagements."
    }
  ]
};

// Fonction pour générer le message WhatsApp
export function generateWhatsAppMessage(productName: string, price: string, unit?: string) {
  const priceDisplay = unit ? `${price} FCFA/${unit}` : `${price} FCFA`;
  return encodeURIComponent(
    `Bonjour Jappandal Boutique, je souhaite commander :\n\n` +
    `📦 Produit : ${productName}\n` +
    `💰 Prix : ${priceDisplay}\n` +
    `📊 Quantité : ___\n` +
    `📍 Mon lieu de livraison : ___\n\n` +
    `Merci !`
  );
}

// URLs WhatsApp
export function getWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
}
