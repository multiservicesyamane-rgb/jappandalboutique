import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function insert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erreur ${table}: ${error}`);
  }
  return res.json();
}

async function seed() {
  console.log('🌱 Début du peuplement via REST API avec fetch...');

  const categoriesData = [
    { name: 'Épicerie', slug: 'epicerie', emoji: '🛒', description: 'Riz, pâtes, huile, sucre, condiments' },
    { name: 'Produits Laitiers', slug: 'produits-laitiers', emoji: '🧀', description: 'Lait, beurre, fromage, mayonnaise' },
    { name: 'Boissons', slug: 'boissons', emoji: '🧃', description: 'Eau, jus, boissons énergétiques' },
    { name: 'Hygiène & Entretien', slug: 'hygiene-entretien', emoji: '🧼', description: 'Savon, Omo, eau de javel' },
    { name: 'Fruits & Légumes', slug: 'fruits-legumes', emoji: '🥬', description: 'Oignons, pommes de terre' },
    { name: 'Petit Déjeuner', slug: 'petit-dejeuner', emoji: '☕', description: 'Thé, café, chocolat' }
  ];

  console.log('Insertion des catégories...');
  let insertedCategories = [];
  try {
    insertedCategories = await insert('categories', categoriesData);
  } catch(err) {
    console.error(err);
    return;
  }
  
  const getCatId = (slug) => insertedCategories.find(c => c.slug === slug)?.id || insertedCategories[0].id;

  const productsData = [
    { name: 'Riz vallée mamaçita', price: '10000', unit: '25kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Riz Parfumé numéro un', price: '12000', unit: '25kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Riz Royal umbrella', price: '13000', unit: '25kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Riz sangomar non parfumé', price: '8500', unit: '25kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Riz Tyson', price: '11000', unit: '25kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Macaroni pastami', price: '3800', unit: '5kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Vermicelles Kayna', price: '4500', unit: '5kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Couscous warda', price: '1000', unit: '1kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Huile nianale', price: '6000', unit: '5L', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Huile lalia', price: '6500', unit: '5L', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Grosse sucre css', price: '5000', unit: '5kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate linguer', price: '800', unit: '350g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate linguer', price: '3200', unit: '2kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate tama', price: '700', unit: '350g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate tama', price: '2800', unit: '2kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate dieg BOU diare', price: '1100', unit: '400g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate dieg bou diare', price: '1750', unit: '800g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Tomate dieg bou diare', price: '3000', unit: '2kg', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Poivre Grain', price: '1350', unit: '250g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Piment bou sew', price: '650', unit: '250g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'L\'ail', price: '900', unit: '500g', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Vinaigre adja', price: '600', unit: '1L', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Pot Ananas', price: '850', unit: 'pot', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Paquet jumbo', price: '1400', unit: 'paquet', categoryId: getCatId('epicerie'), inStock: 1 },
    { name: 'Paquet Maggie', price: '1700', unit: 'paquet', categoryId: getCatId('epicerie'), inStock: 1 },
    
    // Produits Laitiers
    { name: 'Paquet beurre bocage', price: '1000', unit: 'paquet', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Beurre margarine', price: '2350', unit: '1kg', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Beurre margarine', price: '1400', unit: '500g', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Mayonnaise jadida', price: '2500', unit: '1kg', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Mayonnaise jadida', price: '1500', unit: '500g', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Mayonnaise jadida', price: '850', unit: '250g', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Lait mixwell', price: '1600', unit: '400g', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Fromage la vache qui rit', price: '2200', unit: 'paquet', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Lait concentré Eldorado', price: '1200', unit: 'boite', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Pot Mew Eldorado pm', price: '350', unit: 'pot', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Pot Mew sara pm', price: '300', unit: 'pot', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Pot Mew gloria original', price: '600', unit: 'pot', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Lait en poudre', price: '3000', unit: '1kg', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Bouteille vitalait rouge', price: '900', unit: 'bouteille', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    { name: 'Bouteille soja', price: '1400', unit: '1L', categoryId: getCatId('produits-laitiers'), inStock: 1 },
    
    // Fruits & Légumes
    { name: 'Raisin sec', price: '2800', unit: '1kg', categoryId: getCatId('fruits-legumes'), inStock: 1 },
    { name: 'Sac oignon', price: '13500', unit: 'sac', categoryId: getCatId('fruits-legumes'), inStock: 1 },
    { name: 'Sac pomme de terre', price: '10500', unit: 'sac', categoryId: getCatId('fruits-legumes'), inStock: 1 },
    
    // Petit Déjeuner
    { name: 'Lipton yellow label thé', price: '3000', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Nescafé', price: '1600', unit: '50g pot', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Nescafé', price: '3500', unit: '100g pot', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Nescafé', price: '5500', unit: '200g pot', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Nescafé', price: '2600', unit: '100g sachet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Nescafé stick', price: '6500', unit: 'carton', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Paquet sucre vanille', price: '1000', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Thiara paquet', price: '2800', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Pot pinton', price: '1400', unit: 'pot', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Paquet Thé flecha pm', price: '1300', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Paquet Thé koutam pm', price: '1250', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Paquet Thé frolia', price: '900', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Paquet Thé riya', price: '900', unit: 'paquet', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Boite thé flacha blanc', price: '1000', unit: '200g', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Boite thé flacha noir', price: '1000', unit: '250g', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Boite thé jasmine', price: '1200', unit: '100g', categoryId: getCatId('petit-dejeuner'), inStock: 1 },
    { name: 'Boite thé jasmine', price: '1200', unit: '200g', categoryId: getCatId('petit-dejeuner'), inStock: 1 },

    // Boissons
    { name: 'Canette coca fanta et sprite', price: '7000', unit: 'pack', categoryId: getCatId('boissons'), inStock: 1 },
    { name: 'Paquet Eaux seo pm', price: '1000', unit: 'paquet', categoryId: getCatId('boissons'), inStock: 1 },
    { name: 'Paquet kirene ou Casa', price: '1750', unit: '1.5L', categoryId: getCatId('boissons'), inStock: 1 },
    { name: 'Boisson énergétique x plus', price: '3700', unit: 'pack', categoryId: getCatId('boissons'), inStock: 1 },
    { name: 'Canette énergie 3x Demi paquet', price: '5000', unit: 'demi paquet', categoryId: getCatId('boissons'), inStock: 1 },
    { name: 'Foster clarks Paquet', price: '3000', unit: 'paquet', categoryId: getCatId('boissons'), inStock: 1 },

    // Hygiène & Entretien
    { name: 'Omo madar', price: '1100', unit: '900g', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Omo madar', price: '600', unit: '400g', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Omo saba', price: '1200', unit: '850g', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Omo saba', price: '600', unit: '400g', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Savon la main carton X18 pcs', price: '4750', unit: 'carton', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Savon noura paquet x18 pcs', price: '3750', unit: 'paquet', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Savon onu carton X18 pcs', price: '4000', unit: 'carton', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Madar renzo', price: '1000', unit: '1L', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Madar get', price: '1200', unit: '1.5L', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Javelle madar', price: '500', unit: '1L', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
    { name: 'Javelle Grain', price: '900', unit: '500g', categoryId: getCatId('hygiene-entretien'), inStock: 1 },
  ];

  console.log('Insertion des produits...');
  try {
    await insert('products', productsData);
    console.log('🎉 Terminé avec succès ! Tous les produits sont en base.');
  } catch(err) {
    console.error(err);
  }
}

seed();
