import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Produits de Mil', slug: 'produits-de-mil', emoji: '🌾', description: 'Farine, couscous, thiakry et céréales traditionnelles' },
  { name: 'Légumes Frais', slug: 'legumes-frais', emoji: '🥬', description: 'Légumes frais du jour, cultivés localement' },
  { name: 'Viandes & Lait', slug: 'viandes-lait', emoji: '🥩', description: 'Viandes fraîches et lait de qualité premium' },
  { name: 'Fruits Frais', slug: 'fruits-frais', emoji: '🍊', description: 'Fruits tropicaux frais et savoureux' },
  { name: 'Épicerie', slug: 'epicerie', emoji: '🛒', description: 'Produits essentiels pour votre cuisine' },
  { name: 'Produits Laitiers', slug: 'produits-laitiers', emoji: '🧀', description: 'Fromages, yaourts, beurre et crème fraîche' },
  { name: 'Jus Naturels', slug: 'jus-naturels', emoji: '🧃', description: 'Jus de fruits frais et boissons naturelles' },
  { name: 'Produits Bio', slug: 'produits-bio', emoji: '🌿', description: 'Produits biologiques et naturels certifiés' }
];

const products = [
  // Produits de Mil (categoryId: 1)
  { name: 'Farine de Mil', price: '1500', unit: 'kg', categoryId: 1, badge: 'Populaire', description: 'Farine de mil 100% naturelle, idéale pour vos préparations traditionnelles' },
  { name: 'Couscous de Mil', price: '2000', unit: 'kg', categoryId: 1, description: 'Couscous de mil artisanal, riche en nutriments' },
  { name: 'Thiakry Naturel', price: '1800', unit: '500g', categoryId: 1, description: 'Thiakry prêt à consommer, saveur authentique' },
  { name: 'Soungouf (Mil Entier)', price: '1200', unit: 'kg', categoryId: 1, description: 'Grains de mil entiers pour vos recettes traditionnelles' },
  { name: 'Arraw (Granulé de Mil)', price: '2500', unit: 'kg', categoryId: 1, description: 'Granulés de mil pour bouillie et autres préparations' },
  { name: 'Sankhal de Mil', price: '2200', unit: 'kg', categoryId: 1, description: 'Sankhal de mil de qualité supérieure' },
  { name: 'Bouillie de Mil Instantanée', price: '3000', unit: '500g', categoryId: 1, badge: 'Pratique', description: 'Bouillie de mil instantanée, prête en quelques minutes' },

  // Légumes Frais (categoryId: 2)
  { name: 'Tomates Fraîches', price: '800', unit: 'kg', categoryId: 2, badge: 'Frais', description: 'Tomates fraîches du jour, cultivées localement' },
  { name: 'Oignons Rouges', price: '600', unit: 'kg', categoryId: 2, badge: 'Frais', description: 'Oignons rouges de qualité, essentiels en cuisine' },
  { name: 'Carottes Bio', price: '750', unit: 'kg', categoryId: 2, badge: 'Bio', description: 'Carottes biologiques, riches en vitamines' },
  { name: 'Aubergines Locales', price: '500', unit: 'kg', categoryId: 2, badge: 'Frais', description: 'Aubergines fraîches, parfaites pour vos plats' },
  { name: 'Poivrons Verts', price: '900', unit: 'kg', categoryId: 2, description: 'Poivrons verts croquants et savoureux' },
  { name: 'Gombo Frais', price: '1000', unit: 'kg', categoryId: 2, badge: 'Frais', description: 'Gombo frais du jour, idéal pour vos sauces' },
  { name: 'Piment Vert', price: '1200', unit: 'kg', categoryId: 2, description: 'Piment vert fort, pour relever vos plats' },

  // Viandes & Lait (categoryId: 3)
  { name: 'Viande de Bœuf', price: '4500', unit: 'kg', categoryId: 3, badge: 'Premium', description: 'Viande de bœuf fraîche, qualité supérieure' },
  { name: 'Poulet Fermier Entier', price: '3500', unit: 'pièce', categoryId: 3, badge: 'Premium', description: 'Poulet fermier élevé en plein air' },
  { name: 'Viande de Mouton', price: '5000', unit: 'kg', categoryId: 3, badge: 'Premium', description: 'Viande de mouton tendre et savoureuse' },
  { name: 'Lait Frais Pasteurisé', price: '1500', unit: 'litre', categoryId: 3, badge: 'Frais', description: 'Lait frais pasteurisé, livré quotidiennement' },
  { name: 'Merguez Maison', price: '3000', unit: 'kg', categoryId: 3, description: 'Merguez artisanales préparées sur place' },
  { name: 'Foie de Bœuf', price: '3500', unit: 'kg', categoryId: 3, description: 'Foie de bœuf frais, riche en fer' },
  { name: 'Lait Caillé Traditionnel', price: '1000', unit: 'litre', categoryId: 3, badge: 'Traditionnel', description: 'Lait caillé artisanal, goût authentique' },

  // Fruits Frais (categoryId: 4)
  { name: 'Mangues Kent', price: '1500', unit: 'kg', categoryId: 4, badge: 'Saison', description: 'Mangues Kent juteuses et sucrées' },
  { name: 'Bananes Douces', price: '800', unit: 'régime', categoryId: 4, badge: 'Saison', description: 'Bananes douces mûres à point' },
  { name: 'Pastèque', price: '2000', unit: 'pièce', categoryId: 4, badge: 'Saison', description: 'Pastèque fraîche et désaltérante' },
  { name: 'Oranges Juteuses', price: '1200', unit: 'kg', categoryId: 4, description: 'Oranges juteuses riches en vitamine C' },
  { name: 'Papaye Mûre', price: '1000', unit: 'pièce', categoryId: 4, badge: 'Saison', description: 'Papaye mûre, parfaite pour le petit-déjeuner' },
  { name: 'Ananas Victoria', price: '1500', unit: 'pièce', categoryId: 4, description: 'Ananas Victoria sucré et parfumé' },
  { name: 'Noix de Coco', price: '500', unit: 'pièce', categoryId: 4, description: 'Noix de coco fraîche, eau et chair' },

  // Épicerie (categoryId: 5)
  { name: 'Riz Brisé Parfumé', price: '15000', unit: '25kg', categoryId: 5, badge: 'Best-seller', description: 'Riz brisé parfumé de qualité supérieure' },
  { name: 'Huile d\'Arachide', price: '2500', unit: 'litre', categoryId: 5, badge: 'Best-seller', description: 'Huile d\'arachide pure, idéale pour la cuisson' },
  { name: 'Sucre en Poudre', price: '800', unit: 'kg', categoryId: 5, description: 'Sucre en poudre raffiné' },
  { name: 'Sel Iodé', price: '300', unit: 'kg', categoryId: 5, description: 'Sel iodé de table' },
  { name: 'Pâtes Alimentaires', price: '600', unit: '500g', categoryId: 5, description: 'Pâtes alimentaires de qualité' },
  { name: 'Concentré de Tomate', price: '1200', unit: '400g', categoryId: 5, description: 'Concentré de tomate double' },
  { name: 'Bouillon Cube Jumbo', price: '500', unit: 'boîte', categoryId: 5, badge: 'Best-seller', description: 'Bouillon cube pour assaisonnement' },

  // Produits Laitiers (categoryId: 6)
  { name: 'Yaourt Nature', price: '500', unit: 'pot', categoryId: 6, badge: 'Qualité', description: 'Yaourt nature onctueux' },
  { name: 'Fromage Fondu', price: '1500', unit: 'boîte', categoryId: 6, description: 'Fromage fondu en portions' },
  { name: 'Beurre Doux', price: '2000', unit: '250g', categoryId: 6, badge: 'Qualité', description: 'Beurre doux de qualité supérieure' },
  { name: 'Crème Fraîche', price: '1800', unit: '250ml', categoryId: 6, description: 'Crème fraîche épaisse' },
  { name: 'Lait en Poudre Nido', price: '5000', unit: '900g', categoryId: 6, badge: 'Populaire', description: 'Lait en poudre enrichi' },
  { name: 'Yaourt aux Fruits', price: '700', unit: 'pot', categoryId: 6, description: 'Yaourt aux fruits variés' },
  { name: 'Fromage Râpé', price: '2500', unit: '200g', categoryId: 6, description: 'Fromage râpé pour gratins' },

  // Jus Naturels (categoryId: 7)
  { name: 'Jus de Bissap', price: '1000', unit: 'litre', categoryId: 7, badge: 'Naturel', description: 'Jus de bissap naturel sans sucre ajouté' },
  { name: 'Jus de Gingembre', price: '1200', unit: 'litre', categoryId: 7, badge: 'Naturel', description: 'Jus de gingembre frais et piquant' },
  { name: 'Jus de Bouye (Baobab)', price: '1500', unit: 'litre', categoryId: 7, badge: 'Naturel', description: 'Jus de bouye riche en vitamine C' },
  { name: 'Jus de Mangue Frais', price: '1000', unit: 'litre', categoryId: 7, description: 'Jus de mangue 100% naturel' },
  { name: 'Jus d\'Orange Pressé', price: '1200', unit: 'litre', categoryId: 7, description: 'Jus d\'orange fraîchement pressé' },
  { name: 'Jus de Tamarin', price: '1000', unit: 'litre', categoryId: 7, badge: 'Naturel', description: 'Jus de tamarin rafraîchissant' },
  { name: 'Cocktail de Fruits', price: '1500', unit: 'litre', categoryId: 7, description: 'Mélange de jus de fruits tropicaux' },

  // Produits Bio (categoryId: 8)
  { name: 'Miel Pur de Casamance', price: '5000', unit: '500g', categoryId: 8, badge: 'Bio', description: 'Miel pur et naturel de Casamance' },
  { name: 'Huile de Coco Vierge', price: '3500', unit: '250ml', categoryId: 8, badge: 'Bio', description: 'Huile de coco vierge pressée à froid' },
  { name: 'Graines de Chia', price: '4000', unit: '250g', categoryId: 8, badge: 'Bio', description: 'Graines de chia biologiques' },
  { name: 'Moringa en Poudre', price: '3000', unit: '200g', categoryId: 8, badge: 'Bio', description: 'Poudre de moringa, super-aliment' },
  { name: 'Beurre de Karité', price: '2500', unit: '250g', categoryId: 8, badge: 'Bio', description: 'Beurre de karité pur et naturel' },
  { name: 'Amandes Naturelles', price: '4500', unit: '250g', categoryId: 8, description: 'Amandes naturelles non salées' },
  { name: 'Pain de Singe (Baobab)', price: '2000', unit: '200g', categoryId: 8, badge: 'Bio', description: 'Poudre de pain de singe, riche en nutriments' }
];

async function seedDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('🌱 Début du peuplement de la base de données...\n');
    
    // Insert categories
    console.log('📁 Insertion des catégories...');
    for (const category of categories) {
      await connection.execute(
        'INSERT INTO categories (name, slug, emoji, description) VALUES (?, ?, ?, ?)',
        [category.name, category.slug, category.emoji, category.description]
      );
    }
    console.log(`✅ ${categories.length} catégories insérées\n`);
    
    // Insert products
    console.log('📦 Insertion des produits...');
    for (const product of products) {
      await connection.execute(
        'INSERT INTO products (name, price, unit, categoryId, badge, description, inStock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.price, product.unit, product.categoryId, product.badge || null, product.description, 1]
      );
    }
    console.log(`✅ ${products.length} produits insérés\n`);
    
    console.log('🎉 Base de données peuplée avec succès !');
    console.log(`📊 Total: ${categories.length} catégories et ${products.length} produits`);
    
  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
