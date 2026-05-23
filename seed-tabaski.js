import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DIRECT_URL, { idle_timeout: 5 });

async function seedTabaski() {
  console.log("🌱 Début de l'insertion des packs Tabaski...");

  try {
    // 1. Insérer ou récupérer la catégorie Packs Tabaski
    let category = await sql`
      SELECT id FROM categories WHERE slug = 'packs-tabaski'
    `;

    let categoryId;
    if (category.length === 0) {
      const newCategory = await sql`
        INSERT INTO categories (name, slug, emoji, description, "createdAt", "updatedAt")
        VALUES ('Packs Tabaski', 'packs-tabaski', '🔥', 'Packs promotionnels spéciaux pour la fête de la Tabaski', NOW(), NOW())
        RETURNING id
      `;
      categoryId = newCategory[0].id;
      console.log("🎉 Catégorie 'Packs Tabaski' créée avec l'ID:", categoryId);
    } else {
      categoryId = category[0].id;
      console.log("ℹ️ Catégorie 'Packs Tabaski' déjà existante avec l'ID:", categoryId);
    }

    // 2. Définir les packs Tabaski
    const packs = [
      {
        name: "🔥 PACK SOCIAL",
        price: 9900,
        unit: "Pack",
        badge: "-10%",
        description: "• 1/2 sac Oignons\n• 250g Ail\n• 250g Piment moulu\n• Vinaigre Adja 1L\n• Pot tomate Tama 350g\n• 250g Poivre",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
      },
      {
        name: "🔥 PACK ÉCO",
        price: 12900,
        unit: "Pack",
        badge: "-15%",
        description: "• 1/2 sac Oignons\n• 1/4 sac Pomme de terre\n• Pot moutarde\n• Vinaigre Adja 1L\n• 250g Ail\n• 250g Piment moulu\n• Pot tomate Tama 350g",
        imageUrl: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800&q=80"
      },
      {
        name: "🔥 PACK MINI FAMILLE",
        price: 15900,
        unit: "Pack",
        badge: "Promo",
        description: "• 1/2 sac Pomme de terre\n• 1/2 sac Oignons\n• Pot moutarde\n• Pot olive\n• 500g Ail\n• 250g Poivre\n• Pot tomate Dieg Bou Diare 800g",
        imageUrl: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80"
      },
      {
        name: "🔥 PACK SOCIAL PLUS",
        price: 19900,
        unit: "Pack",
        badge: "Top",
        description: "• 1/2 sac Pomme de terre\n• 1 sac Oignons\n• Vinaigre Adja 1L\n• Pot moutarde\n• Pot olive\n• 1kg Tomates\n• 500g Ail\n• 250g Piment moulu",
        imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800&q=80"
      },
      {
        name: "🔥 PACK FAMILIAL",
        price: 22900,
        unit: "Pack",
        badge: "Conseillé",
        description: "• 1/2 sac Pomme de terre\n• 1 sac Oignons\n• Huile Nianale 5L\n• Vinaigre Adja\n• Pot moutarde\n• Pot olive\n• 250g Poivre\n• 250g Kani Thioukli",
        imageUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=800&q=80"
      },
      {
        name: "🔥 PACK CUISINE TABASKI",
        price: 25900,
        unit: "Pack",
        badge: "Spécial",
        description: "• 1 sac Oignons\n• 1/2 sac Pomme de terre\n• Huile Lalia 5L\n• Pot tomate Dieg Bou Diare 2kg\n• Ail 500g\n• Poivre 250g\n• Piment 250g",
        imageUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80"
      },
      {
        name: "🔥 PACK FAMILLE PLUS",
        price: 29900,
        unit: "Pack",
        badge: "Populaire",
        description: "• Sac Pomme de terre\n• Sac Oignons\n• Vinaigre Adja\n• Pot moutarde\n• Pot olive\n• 1kg Tomates\n• 1kg Oignon vert\n• 500g Ail",
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
      },
      {
        name: "🔥 PACK PREMIUM",
        price: 35900,
        unit: "Pack",
        badge: "Premium",
        description: "• Sac Pomme de terre\n• Sac Oignons\n• Huile Lalia 5L\n• Pot tomate Dieg Bou Diare 2kg\n• Mayonnaise Jadida 1kg\n• Poivre 250g\n• Piment 250g\n• Kani Thioukli",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
      },
      {
        name: "🔥 PACK ROYAL",
        price: 45900,
        unit: "Pack",
        badge: "Royal",
        description: "• Sac Pomme de terre\n• Sac Oignons\n• Huile Lalia 5L\n• Sucre CSS 5kg\n• Mayonnaise Jadida 1kg\n• Pot tomate 2kg\n• Ail + Piment + Poivre",
        imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80"
      },
      {
        name: "🔥 PACK TABASKI MAX",
        price: 59900,
        unit: "Pack",
        badge: "Illimité",
        description: "• Sac Pomme de terre\n• Sac Oignons\n• Huile Lalia 5L\n• Sucre CSS 5kg\n• Mayonnaise Jadida 1kg\n• Fromage La Vache Qui Rit\n• Lait Mixwell\n• Pot tomate 2kg\n• Condiments complets",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
      }
    ];

    // 3. Insérer chaque pack
    for (const pack of packs) {
      // Vérifier si le pack existe déjà pour ne pas faire de doublons
      const exist = await sql`
        SELECT id FROM products WHERE name = ${pack.name} AND "categoryId" = ${categoryId}
      `;

      if (exist.length === 0) {
        await sql`
          INSERT INTO products (name, description, price, unit, "imageUrl", "categoryId", badge, "inStock", "createdAt", "updatedAt")
          VALUES (${pack.name}, ${pack.description}, ${pack.price}, ${pack.unit}, ${pack.imageUrl}, ${categoryId}, ${pack.badge}, 1, NOW(), NOW())
        `;
        console.log(`✅ Produit ${pack.name} inséré.`);
      } else {
        // Mettre à jour la description et le prix
        await sql`
          UPDATE products
          SET description = ${pack.description}, price = ${pack.price}, badge = ${pack.badge}, "imageUrl" = ${pack.imageUrl}, "updatedAt" = NOW()
          WHERE id = ${exist[0].id}
        `;
        console.log(`ℹ️ Produit ${pack.name} mis à jour.`);
      }
    }

    console.log("🎉 Tous les packs Tabaski ont été insérés/mis à jour avec succès !");

  } catch (err) {
    console.error("❌ Erreur de peuplement Tabaski:", err);
  } finally {
    await sql.end();
  }
}

seedTabaski();
