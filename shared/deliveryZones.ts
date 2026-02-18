// Zones de livraison pour Dakar et ses communes
// Frais de livraison en FCFA

export interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: number;
}

export const DAKAR_DELIVERY_ZONES: DeliveryZone[] = [
  // Dakar Plateau et Centre
  { id: "plateau", name: "Plateau", deliveryFee: 1000 },
  { id: "medina", name: "Médina", deliveryFee: 1000 },
  { id: "gueule-tapee", name: "Gueule Tapée", deliveryFee: 1000 },
  { id: "fass", name: "Fass", deliveryFee: 1000 },
  { id: "colobane", name: "Colobane", deliveryFee: 1000 },
  
  // Almadies et Ngor
  { id: "almadies", name: "Almadies", deliveryFee: 2000 },
  { id: "ngor", name: "Ngor", deliveryFee: 2000 },
  { id: "yoff", name: "Yoff", deliveryFee: 2000 },
  { id: "ouakam", name: "Ouakam", deliveryFee: 1500 },
  { id: "mermoz", name: "Mermoz", deliveryFee: 1500 },
  
  // Parcelles Assainies
  { id: "parcelles-assainies", name: "Parcelles Assainies", deliveryFee: 1500 },
  { id: "unite-1", name: "Unité 1", deliveryFee: 1500 },
  { id: "unite-2", name: "Unité 2", deliveryFee: 1500 },
  { id: "unite-3", name: "Unité 3", deliveryFee: 1500 },
  
  // Grand Yoff
  { id: "grand-yoff", name: "Grand Yoff", deliveryFee: 1500 },
  { id: "hann-bel-air", name: "Hann Bel Air", deliveryFee: 1500 },
  
  // Sicap et Liberté
  { id: "sicap-liberte", name: "Sicap Liberté", deliveryFee: 1000 },
  { id: "liberte-1", name: "Liberté 1", deliveryFee: 1000 },
  { id: "liberte-2", name: "Liberté 2", deliveryFee: 1000 },
  { id: "liberte-3", name: "Liberté 3", deliveryFee: 1000 },
  { id: "liberte-4", name: "Liberté 4", deliveryFee: 1000 },
  { id: "liberte-5", name: "Liberté 5", deliveryFee: 1000 },
  { id: "liberte-6", name: "Liberté 6", deliveryFee: 1000 },
  
  // Point E et Amitié
  { id: "point-e", name: "Point E", deliveryFee: 1000 },
  { id: "amitie", name: "Amitié", deliveryFee: 1000 },
  
  // HLM et Grand Dakar
  { id: "hlm", name: "HLM", deliveryFee: 1000 },
  { id: "grand-dakar", name: "Grand Dakar", deliveryFee: 1000 },
  { id: "sicap-baobabs", name: "Sicap Baobabs", deliveryFee: 1000 },
  
  // Pikine
  { id: "pikine", name: "Pikine", deliveryFee: 2500 },
  { id: "pikine-icotaf", name: "Pikine Icotaf", deliveryFee: 2500 },
  { id: "pikine-guediawaye", name: "Pikine Guédiawaye", deliveryFee: 2500 },
  { id: "thiaroye", name: "Thiaroye", deliveryFee: 3000 },
  
  // Guédiawaye
  { id: "guediawaye", name: "Guédiawaye", deliveryFee: 2500 },
  { id: "sam-notaire", name: "Sam Notaire", deliveryFee: 2500 },
  { id: "golf-sud", name: "Golf Sud", deliveryFee: 2500 },
  { id: "medina-gounass", name: "Médina Gounass", deliveryFee: 2500 },
  
  // Rufisque
  { id: "rufisque", name: "Rufisque", deliveryFee: 3500 },
  { id: "bargny", name: "Bargny", deliveryFee: 4000 },
  { id: "diamniadio", name: "Diamniadio", deliveryFee: 3500 },
  
  // Keur Massar
  { id: "keur-massar", name: "Keur Massar", deliveryFee: 3500 },
  { id: "malika", name: "Malika", deliveryFee: 3000 },
  { id: "yeumbeul", name: "Yeumbeul", deliveryFee: 3000 },
  
  // Autres zones
  { id: "biscuiterie", name: "Biscuiterie", deliveryFee: 1500 },
  { id: "dieuppeul", name: "Dieuppeul", deliveryFee: 1500 },
  { id: "derklé", name: "Derklé", deliveryFee: 1500 },
  { id: "sacre-coeur", name: "Sacré Coeur", deliveryFee: 1000 },
  { id: "ouest-foire", name: "Ouest Foire", deliveryFee: 1500 },
  { id: "cite-keur-gorgui", name: "Cité Keur Gorgui", deliveryFee: 1500 },
];

export function getDeliveryFee(zoneId: string): number {
  const zone = DAKAR_DELIVERY_ZONES.find((z) => z.id === zoneId);
  return zone ? zone.deliveryFee : 0;
}

export function getZoneName(zoneId: string): string {
  const zone = DAKAR_DELIVERY_ZONES.find((z) => z.id === zoneId);
  return zone ? zone.name : "";
}
