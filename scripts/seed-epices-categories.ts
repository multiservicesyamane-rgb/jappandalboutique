import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema.js';
import { eq, like, or } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

// Charge le .env situé à la racine du projet
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seedEpicesAndCategories() {
  console.log("🌱 Début de la restructuration des catégories et de l'ajout des nouveaux produits...");

  // 1. Définition de la Nouvelle Structure des Catégories
  const newCategories = [
    { name: 'Épices & Herbes Simples', slug: 'epices-herbes-simples', emoji: '🌶️', description: 'Ail, muscade, poivre, clous de girofle, thym...' },
    { name: 'Mélanges & Assaisonnements', slug: 'melanges-assaisonnements', emoji: '🍲', description: 'Mix, paella, harira, marinades...' },
    { name: 'Pâtes & Féculents', slug: 'pates-feculents', emoji: '🍝', description: 'Macaroni, spaghettis, couscous, tapioca...' },
    { name: 'Sauces & Condiments', slug: 'sauces-condiments', emoji: '🥫', description: 'Huile, vinaigre, tomate, Maggi, sauce...' },
    { name: 'Produits Laitiers', slug: 'produits-laitiers', emoji: '🧀', description: 'Lait, beurre, fromage, mayonnaise' },
    { name: 'Petit-déjeuner & Sucreries', slug: 'petit-dejeuner-sucreries', emoji: '☕', description: 'Café, thé, sucre, Nutella, biscuits' },
    { name: 'Conserves', slug: 'conserves', emoji: '🐟', description: "Thon à l'huile, sardines..." },
    { name: 'Fruits Secs & Noix', slug: 'fruits-secs-noix', emoji: '🥜', description: 'Raisins secs, noix de cajou, amandes...' },
    { name: 'Fruits & Légumes Frais', slug: 'fruits-legumes-frais', emoji: '🥬', description: 'Oignons, pommes de terre...' },
    { name: 'Boissons & Jus', slug: 'boissons', emoji: '🧃', description: 'Eau, jus, sodas, boissons énergétiques' },
    { name: 'Hygiène & Entretien', slug: 'hygiene-entretien', emoji: '🧼', description: 'Savon, Omo, eau de javel' },
    { name: 'Naturel & Bien-être', slug: 'naturel-bien-etre', emoji: '🍃', description: 'Thé digestion, nila, boule de rose...' }
  ];

  console.log('Insertion/Mise à jour des catégories...');
  for (const cat of newCategories) {
    // Si la catégorie existe par slug (ex: boissons, hygiene-entretien, produits-laitiers), on la met à jour, sinon on l'insère
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug));
    if (existing.length > 0) {
      await db.update(schema.categories).set({ name: cat.name, emoji: cat.emoji, description: cat.description }).where(eq(schema.categories.id, existing[0].id));
    } else {
      await db.insert(schema.categories).values(cat).onConflictDoNothing();
    }
  }
  
  // Migration de l'ancien "Petit Déjeuner"
  const petitDej = await db.select().from(schema.categories).where(eq(schema.categories.slug, 'petit-dejeuner'));
  const newPetitDej = await db.select().from(schema.categories).where(eq(schema.categories.slug, 'petit-dejeuner-sucreries'));
  
  if (petitDej.length > 0 && newPetitDej.length > 0) {
    // Migrer les produits
    await db.update(schema.products).set({ categoryId: newPetitDej[0].id }).where(eq(schema.products.categoryId, petitDej[0].id));
    // Supprimer l'ancienne catégorie
    await db.delete(schema.categories).where(eq(schema.categories.id, petitDej[0].id));
  }

  const allCats = await db.select().from(schema.categories);
  const getCatId = (slug: string) => allCats.find(c => c.slug === slug)?.id || allCats[0]?.id;

  // 2. Migration des anciens produits de "Épicerie"
  console.log('Migration des anciens produits...');
  const epicerieCat = allCats.find(c => c.slug === 'epicerie');
  if (epicerieCat) {
    const epicerieProducts = await db.select().from(schema.products).where(eq(schema.products.categoryId, epicerieCat.id));
    
    for (const p of epicerieProducts) {
      const nameLower = p.name.toLowerCase();
      let newCatId = epicerieCat.id;
      
      if (nameLower.includes('riz') || nameLower.includes('macaroni') || nameLower.includes('vermicelle') || nameLower.includes('couscous')) {
        newCatId = getCatId('pates-feculents');
      } else if (nameLower.includes('huile') || nameLower.includes('tomate') || nameLower.includes('vinaigre') || nameLower.includes('jumbo') || nameLower.includes('maggie')) {
        newCatId = getCatId('sauces-condiments');
      } else if (nameLower.includes('poivre') || nameLower.includes('piment') || nameLower.includes('ail')) {
        newCatId = getCatId('epices-herbes-simples');
      } else if (nameLower.includes('sucre')) {
        newCatId = getCatId('petit-dejeuner-sucreries');
      }
      
      if (newCatId !== epicerieCat.id) {
        await db.update(schema.products).set({ categoryId: newCatId }).where(eq(schema.products.id, p.id));
      }
    }
  }

  // 3. Ajout des NOUVEAUX PRODUITS
  console.log('Préparation des nouveaux produits à ajouter...');
  
  const productsData = [
    // --- ÉPICES EN POUDRE 100g (2000F) ---
    { name: 'Ail en poudre', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Noix de muscade', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Muscade en poudre', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poivre noir', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poivre blanc', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Clous de girofles', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Clous de girofles moulu', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poudre cannelle', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Cannelle bâton', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Gingembre en poudre', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Thym', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Romarin', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Basilic', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Origan', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Herbe de Provence', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Persil séché', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Curry', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Coriandre', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Grain de moutarde', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Paprika doux', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Paprika fumé', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poudre laurier', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Cumin', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Piment fort', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Grain de persil', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Curcuma', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Anis étoilés', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Oignon en poudre', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Sel herbe', price: '2000', unit: '100g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    
    // --- Mélanges & assaisonnements 100g (2000F) ---
    { name: 'Épice Paella', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Épices Harira', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade viande', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poisson', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poulet', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: '7 épices', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix fruits de mer', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix viande', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix poisson', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix poulet', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix barbecue', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Épices frites', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Riz au poulet (Épices)', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Riz au poisson (Épices)', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Poulet citron (Épices)', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Assaisonnement salade', price: '2000', unit: '100g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Feuilles laurier', price: '500', unit: 'paquet', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },

    // --- ÉPICES TESTEURS 50g (1000F) ---
    { name: 'Ail en poudre - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Noix de muscade - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Muscade en poudre - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poivre noir - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poivre blanc - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Clous de girofles - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Clous de girofles moulu - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Poudre cannelle - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Cannelle bâton - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Gingembre - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Curry - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Herbe de Provence - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Persil séchée - Testeur', price: '1000', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Paella - Testeur', price: '1000', unit: '50g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Épices Harira - Testeur', price: '1000', unit: '50g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade viande - Testeur', price: '1000', unit: '50g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poisson - Testeur', price: '1000', unit: '50g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poulet - Testeur', price: '1000', unit: '50g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    
    // Herbes premium 50g
    { name: 'Thym premium', price: '500', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Romarin premium', price: '500', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Basilic premium', price: '500', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },
    { name: 'Origan premium', price: '500', unit: '50g', categoryId: getCatId('epices-herbes-simples'), inStock: 1 },

    // --- MÉLANGES D’ÉPICES 180g (3000F) ---
    { name: 'Mix poulet (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix poisson (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix viande (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix fruits de mer (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Mix barbecue (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade viande (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poisson (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },
    { name: 'Marinade poulet (Grand)', price: '3000', unit: '180g', categoryId: getCatId('melanges-assaisonnements'), inStock: 1 },

    // --- AUTRES PRODUITS ---
    // Pâtes & Féculents
    { name: 'Macaroni', price: '1300', unit: '1kg', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Macaroni', price: '700', unit: '500g', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Pâte salade', price: '1300', unit: '1kg', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Pâte salade', price: '700', unit: '500g', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Spaghettis', price: '650', unit: '500g', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Tapioca', price: '700', unit: '250g', categoryId: getCatId('pates-feculents'), inStock: 1 },
    { name: 'Tapioca', price: '1000', unit: '755g', categoryId: getCatId('pates-feculents'), inStock: 1 },

    // Sauces & Condiments
    { name: 'Arôme Maggi', price: '650', unit: '6ml', categoryId: getCatId('sauces-condiments'), inStock: 1 },
    { name: 'Sauce piment', price: '3000', unit: '250g', categoryId: getCatId('sauces-condiments'), inStock: 1 },
    { name: 'Sauce verte', price: '5000', unit: '500g', categoryId: getCatId('sauces-condiments'), inStock: 1 },
    { name: 'Sauce guimès', price: '5000', unit: '500g', categoryId: getCatId('sauces-condiments'), inStock: 1 },
    { name: 'Huile', price: '1500', unit: '1L', categoryId: getCatId('sauces-condiments'), inStock: 1 },
    { name: 'Huile', price: '8500', unit: '5L', categoryId: getCatId('sauces-condiments'), inStock: 1 },

    // Produits sucrés & Snacks
    { name: 'Nutella', price: '6500', unit: '1kg', categoryId: getCatId('petit-dejeuner-sucreries'), inStock: 1 },
    { name: 'Biscuits', price: '4000', unit: '700g', categoryId: getCatId('petit-dejeuner-sucreries'), inStock: 1 },

    // Conserves
    { name: "Thon à l'huile (12 pièces)", price: '8000', unit: 'pack', categoryId: getCatId('conserves'), inStock: 1 },

    // Fruits secs & Noix
    { name: 'Noix de cajou', price: '1500', unit: '100g', categoryId: getCatId('fruits-secs-noix'), inStock: 1 },
    { name: 'Amande douce', price: '1500', unit: '100g', categoryId: getCatId('fruits-secs-noix'), inStock: 1 },
    { name: 'Amandes douces (Gros)', price: '8000', unit: '1kg', categoryId: getCatId('fruits-secs-noix'), inStock: 1 },
    { name: 'Mix noix', price: '3500', unit: '200g', categoryId: getCatId('fruits-secs-noix'), inStock: 1 },

    // Boissons & Jus
    { name: 'Jus de fruits naturels', price: '1500', unit: '1L', categoryId: getCatId('boissons'), inStock: 1 },

    // Produits naturels
    { name: 'Thé digestion', price: '1000', unit: '70g', categoryId: getCatId('naturel-bien-etre'), inStock: 1 },
    { name: 'Cannelle bâton naturel', price: '1500', unit: 'sachet', categoryId: getCatId('naturel-bien-etre'), inStock: 1 },
    { name: 'Boule de rose', price: '2000', unit: 'unité', categoryId: getCatId('naturel-bien-etre'), inStock: 1 },
    { name: 'Poudre nila', price: '1500', unit: 'sachet', categoryId: getCatId('naturel-bien-etre'), inStock: 1 },
  ];

  console.log(`Insertion de ${productsData.length} produits...`);
  
  // Utiliser onConflictDoNothing en se basant sur une contrainte si elle existait, 
  // mais on a pas de contrainte unique sur name, donc on insere juste
  // Pour eviter les doublons on pourrait verifier par nom
  for (const product of productsData) {
    const existingProduct = await db.select().from(schema.products)
      .where(eq(schema.products.name, product.name))
      .limit(1);
    
    if (existingProduct.length === 0) {
      await db.insert(schema.products).values(product);
    }
  }

  console.log('🎉 Terminé avec succès ! Toutes les catégories sont en place et les produits sont classés.');
  process.exit(0);
}

seedEpicesAndCategories().catch(err => {
  console.error(err);
  process.exit(1);
});
