export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  group: string;
}

export const deliveryZones: DeliveryZone[] = [
  // Zone 1 : Dakar Centre
  { id: "plateau", name: "Dakar-Plateau", price: 1500, group: "Zone 1 : Dakar Centre" },
  { id: "medina_fass", name: "Médina / Fass / Colobane", price: 2000, group: "Zone 1 : Dakar Centre" },
  { id: "fann_point_e", name: "Fann / Point E / Amitié", price: 2000, group: "Zone 1 : Dakar Centre" },
  { id: "mermoz_sacre_coeur", name: "Mermoz / Sacré-Cœur", price: 2000, group: "Zone 1 : Dakar Centre" },
  { id: "grand_dakar_liberte", name: "Grand Dakar / Sicap Liberté / Dieupeul / Castors", price: 2000, group: "Zone 1 : Dakar Centre" },
  { id: "hlm_hann", name: "HLM / Hann Bel-Air", price: 2000, group: "Zone 1 : Dakar Centre" },

  // Zone 2 : Dakar Nord & Almadies
  { id: "ngor_almadies", name: "Ngor / Almadies / Virage", price: 2000, group: "Zone 2 : Dakar Nord & Almadies" },
  { id: "ouakam_mamelles", name: "Ouakam / Mamelles", price: 2000, group: "Zone 2 : Dakar Nord & Almadies" },
  { id: "yoff_ouest_foire", name: "Yoff / Ouest Foire", price: 2000, group: "Zone 2 : Dakar Nord & Almadies" },
  { id: "grand_yoff", name: "Grand Yoff / Patte d'Oie", price: 2000, group: "Zone 2 : Dakar Nord & Almadies" },
  { id: "parcelles", name: "Parcelles Assainies", price: 2000, group: "Zone 2 : Dakar Nord & Almadies" },

  // Zone 3 : Banlieue Proche
  { id: "guediawaye", name: "Guédiawaye (Golf, Cité Aliou Sow...)", price: 2500, group: "Zone 3 : Banlieue Proche" },
  { id: "pikine", name: "Pikine / Cambérène / Dalifort", price: 2500, group: "Zone 3 : Banlieue Proche" },
  { id: "thiaroye_yeumbeul", name: "Thiaroye / Yeumbeul", price: 2500, group: "Zone 3 : Banlieue Proche" },

  // Zone 4 : Banlieue Éloignée & Rufisque
  { id: "mbao", name: "Mbao / Zac Mbao", price: 3000, group: "Zone 4 : Banlieue Éloignée & Rufisque" },
  { id: "keur_massar", name: "Keur Massar / Malika", price: 3000, group: "Zone 4 : Banlieue Éloignée & Rufisque" },
  { id: "rufisque", name: "Rufisque Ville", price: 3000, group: "Zone 4 : Banlieue Éloignée & Rufisque" },
  { id: "tivaouane_peulh", name: "Tivaouane Peulh / Niaga / Boun", price: 3000, group: "Zone 4 : Banlieue Éloignée & Rufisque" },
  { id: "diamniadio", name: "Diamniadio / Bargny", price: 4000, group: "Zone 4 : Banlieue Éloignée & Rufisque" },
];
