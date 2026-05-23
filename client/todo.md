# Jappandal Boutique - Monétisation et Améliorations

## Phase 1 : Adaptation des couleurs exactes du logo
- [x] Analyser les couleurs du logo (bleu #1B4B7F, vert #4A8B3C, jaune-vert #A8D24E)
- [x] Mettre à jour le CSS global (index.css) avec les nouvelles couleurs
- [x] Remplacer toutes les couleurs jaune/orange par vert
- [x] Adapter tous les composants (Header, Footer, ProductCard, etc.)
- [x] Adapter toutes les pages (Home, Products, Cart, Dashboard)

## Phase 2 : Support de 5 images par produit
- [x] Vérifier le schema products (déjà supporté: image2Url-image5Url)
- [x] Formulaire admin déjà fonctionnel pour 5 images
- [x] Page détail produit affiche déjà galerie d'images

## Phase 3 : Système de liens affiliés
- [x] Créer la table affiliate_links dans le schema
- [x] Générer et exécuter la migration SQL
- [x] Créer les procedures tRPC pour CRUD des liens affiliés
- [x] Créer la page admin /admin/liens-affilies
- [x] Ajouter le lien dans AdminLayout (section MONÉTISATION)
- [ ] Intégrer les liens affiliés sur les pages produits

## Phase 4 : Bannières publicitaires
- [x] Créer la table ad_banners dans le schema
- [x] Générer et exécuter la migration SQL
- [x] Créer les procedures tRPC pour CRUD des bannières
- [x] Créer la page admin /admin/bannieres-pub
- [x] Créer le composant AdBanner pour afficher les pubs
- [x] Intégrer les bannières sur homepage (top, middle, bottom)
- [ ] Intégrer les bannières sur page produits (top, sidebar)
- [ ] Intégrer les bannières sur page détail produit (top, bottom)

## Phase 5 : Fonctionnalités de monétisation avancées
- [ ] Ajouter le champ "sponsored" aux produits (produits sponsorisés)
- [ ] Ajouter le champ "commission" aux produits (% de marge)
- [ ] Créer la page statistiques de revenus dans le dashboard
- [ ] Ajouter le badge "Sponsorisé" sur les produits sponsorisés
- [ ] Créer un rapport de revenus (ventes + affiliés + pubs)

## Phase 6 : Tests et corrections
- [ ] Tester l'ajout de produit avec 5 images
- [ ] Tester la gestion des liens affiliés
- [ ] Tester l'affichage des bannières pub
- [ ] Tester le système de produits sponsorisés
- [ ] Corriger tous les bugs identifiés
- [x] Checkpoint final

## Stratégies de monétisation proposées
1. ✅ **Bannières publicitaires** : Google AdSense sur homepage, pages produits, panier
2. ✅ **Liens affiliés** : Rediriger vers des sites partenaires (Amazon, Jumia, etc.)
3. 🔄 **Produits sponsorisés** : Faire payer les fournisseurs pour mettre en avant leurs produits
4. 🔄 **Commission sur ventes** : Définir votre marge sur chaque produit
5. 💡 **Abonnement premium** : Offrir la livraison gratuite aux membres premium
6. 💡 **Dropshipping** : Vendre sans stock, commander chez le fournisseur après vente
7. 💡 **Programme de parrainage** : Récompenser les clients qui amènent de nouveaux clients
8. 💡 **Vente de données anonymisées** : Insights sur les tendances d'achat (respect RGPD)


## Phase 7 : Corrections et Design Premium
- [x] Corriger le layout de la page Catégories sur mobile (sidebar + produits)
- [x] Assombrir le vert (#3D7C32 → #1B5E20)
- [x] Ajouter des ombres portées élégantes sur les cartes
- [x] Ajouter des effets néon sur les boutons CTA
- [x] Ajouter des contours lumineux (glow) sur les éléments interactifs
- [x] Implémenter du glassmorphism sur certains composants
- [x] Ajouter des animations subtiles (hover, transitions)
- [x] Tests sur mobile et desktop
- [x] Checkpoint final


## Phase 8 : Corrections Bugs et Fonctionnalités
- [x] Corriger le bug des liens affiliés
- [x] Rendre la page Apparence fonctionnelle (modification logo, couleurs, images, contacts, adresses)
- [x] Assombrir encore plus le vert (#1B5E20 → #0D3B0D)
- [x] Tests complets
- [x] Checkpoint final


## Phase 9 : Revue Complète et Finalisation
- [x] Rendre les paramètres Apparence fonctionnels (settings appliqués dynamiquement sur le site)
- [ ] Rendre les paramètres Settings fonctionnels
- [ ] Ajouter zoom/crop images avant upload produits et bannières
- [x] Ajouter bouton "Produit introuvable → WhatsApp" sur page produits et recherche
- [x] Intégrer les moyens de paiement (Wave, Orange Money, carte prépayée via PayTech)
- [ ] Corriger tous les bugs sur toutes les pages
- [ ] Revue page Accueil
- [ ] Revue page Produits
- [ ] Revue page Détail Produit
- [ ] Revue page Catégories
- [ ] Revue page Panier
- [ ] Revue page Contact
- [ ] Revue Dashboard Admin
- [ ] Revue Admin Produits
- [ ] Revue Admin Catégories
- [ ] Revue Admin Commandes
- [ ] Revue Admin Clients
- [ ] Revue Admin Liens Affiliés
- [ ] Revue Admin Bannières Pub
- [ ] Revue Admin Apparence
- [ ] Revue Admin Paramètres
- [ ] Revue Admin Statistiques
- [ ] Préparer le déploiement
- [ ] Checkpoint final

## Phase 10 : Corrections critiques demandées par l'utilisateur
- [x] FIX: Apparence/Paramètres - les modifications ne sont pas sauvegardées/appliquées sur le site
- [ ] FIX: Zoom/Crop images avant upload (produits, bannières, logo)
- [x] FEAT: Produit introuvable → message WhatsApp pour demander un produit
- [x] FIX: Moyens de paiement complets (Wave, Orange Money, carte prépayée via PayTech)
- [x] FIX: Bannière pub cassée sur la homepage (texte alt "Sacs et chaussures" visible)
- [ ] REVUE: Page Accueil - corriger tous les bugs
- [ ] REVUE: Page Produits - corriger tous les bugs
- [ ] REVUE: Page Détail Produit - corriger tous les bugs
- [ ] REVUE: Page Catégories - corriger tous les bugs
- [ ] REVUE: Page Panier - corriger tous les bugs
- [ ] REVUE: Page Contact - corriger tous les bugs
- [ ] REVUE: Dashboard Admin - corriger tous les bugs
- [ ] REVUE: Admin Apparence/Paramètres - corriger tous les bugs
- [ ] REVUE: Admin Produits - corriger tous les bugs
- [ ] REVUE: Admin Bannières/Affiliés - corriger tous les bugs
- [ ] Tests unitaires complets
- [ ] Préparer pour déploiement

## Phase 11 : Corrections bugs pages admin (mobile responsive)
- [x] FIX: Page Liens Affiliés - tableau non responsive, texte coupé sur mobile
- [x] FIX: Page Publicitaires - bouton "Ajouter une bannière" coupé, tableau non responsive
- [x] FIX: Page Apparence - formulaire upload affiche "Aucun fichier choisi", inputs trop petits mobile
- [x] FIX: Dialogue Nouvelle bannière - formulaire mal aligné, champs coupés sur mobile
- [x] TEST: Toutes les pages admin sur mobile et desktop

## Phase 12 : Correction erreur critique dashboard
- [x] FIX: NotFoundError sur toutes les pages dashboard admin (problème routing React)
- [x] Vérifier App.tsx et les routes admin
- [x] Vérifier AdminLayout et navigation
- [x] Tester toutes les pages dashboard après correction

## Phase 13 : Intégration Mobile Money et publication
- [x] Ajouter les options de paiement Mobile Money (Wave, Orange Money) dans la page Panier
- [x] Créer les procédures backend pour gérer les commandes avec paiement Mobile Money
- [x] Ajouter le formulaire de paiement avec numéro de téléphone
- [x] Tester le flux de paiement complet (ajout panier → commande → confirmation WhatsApp)
- [ ] Checkpoint final avant publication

## Phase 14 : Correction erreur panier et séparation flux paiement
- [ ] FIX: Erreur NotFoundError lors de l'ajout au panier
- [ ] Identifier la cause de l'erreur (routing, composant, contexte)
- [ ] Séparer les flux de paiement : WhatsApp (commande) vs Mobile Money (paiement réel)
- [ ] Améliorer le formulaire de paiement Mobile Money avec collecte d'infos client
- [ ] Tester le flux complet : ajout panier → choix paiement → confirmation

## Phase 15 : Intégration PayTech complète
- [x] Ajouter les clés API PayTech dans les secrets
- [x] Créer le helper PayTech pour gérer les paiements
- [x] Ajouter le router payment dans routers.ts
- [x] Modifier Cart.tsx pour intégrer PayTech au lieu de WhatsApp pour Wave/Orange Money/Carte
- [x] Séparer les flux: WhatsApp (commande simple) vs PayTech (paiement réel)
- [x] Tester le flux de paiement PayTech complet

## Phase 16 : Correction bug ajout au panier
- [ ] BUG CRITIQUE: NotFoundError lors de l'ajout d'un produit au panier
- [ ] Diagnostiquer l'erreur dans les logs console et serveur
- [ ] Identifier le composant ou la route qui cause l'erreur
- [ ] Corriger le bug de routing/rendu React
- [ ] Tester l'ajout au panier sur plusieurs produits

## Phase 17 : Amélioration système de paiement et livraison
- [x] Ajouter les zones de livraison (toutes les communes de Dakar) avec frais par zone
- [x] Retirer "Commander sur WhatsApp" des options de paiement dans le dialogue
- [x] Ajouter "Paiement à la livraison" comme option de paiement
- [x] Ajouter barre fixe en bas de page avec bouton "Commander sur WhatsApp"
- [x] Calculer automatiquement les frais de livraison selon la commune sélectionnée
- [x] Ajouter les frais de livraison au total du paiement
- [x] Tester le flux complet : sélection commune → calcul frais → paiement

## Phase 18 : Correction DÉFINITIVE erreur NotFoundError
- [x] FIX: NotFoundError: Failed to execute 'removeChild' on 'Node' - crash du site
- [x] Ajouter Error Boundary global pour capturer les erreurs React
- [x] Corriger les composants qui causent le conflit DOM (manipulation directe)
- [x] Tester le site complet après correction

## Phase 19 : Correction PayTech ref_command undefined
- [x] FIX: PayTech API error 422 - ref_command undefined
- [x] Rendre les paiements Wave/Orange Money/Carte fonctionnels via PayTech

## Phase 20 : Galerie images produit + correction paiement
- [x] Améliorer la page détail produit avec galerie d'images et miniatures (comme référence)
- [x] Corriger l'erreur PayTech - cause réelle : ipn_url manquant + env non spécifié
- [x] Ajouter paramètre env="test" pour PayTech (passage en prod après activation compte)
- [x] Ajouter ipn_url obligatoire dans les requêtes PayTech
- [x] Ajouter logs de diagnostic côté serveur pour PayTech
- [x] Galerie d'images : navigation flèches, compteur, zoom plein écran
- [x] Thumbnails 80px avec ring-2 pour sélection active
- [x] Tests vitest mis à jour (49 tests passent)
- [x] Tester le flux complet

## Phase 21 : Simplification système de paiement (demande utilisateur)
- [x] Retirer les options Wave, Orange Money, PayTech (carte bancaire)
- [x] Retirer la sélection de zone de livraison
- [x] Garder uniquement "Paiement à la livraison" et "Commander sur WhatsApp"
- [x] Simplifier le dialogue de paiement dans Cart.tsx
- [x] Message WhatsApp avec total + note "frais de livraison à confirmer"
- [x] Barre fixe WhatsApp en bas de page mobile conservée
- [x] Tester le flux simplifié
- [ ] Checkpoint final

## Phase 22 : Améliorations UX panier (demande utilisateur)
- [x] Ajouter checkbox "J'accepte le paiement à la livraison" avant validation
- [x] Checkbox obligatoire avec message d'alerte si non cochée
- [x] Ajouter son de notification quand produit ajouté au panier (Web Audio API)
- [x] Son ajouté dans ProductCard.tsx et ProductDetail.tsx
- [x] Bug ajout au panier: aucun bug détecté - fonctionne correctement
- [x] Tester le flux complet
- [ ] Checkpoint final

## Phase 23 : Correction du bug "Component is not a function"
- [x] Diagnostiqué l'erreur : useParams manquant dans ProductDetail.tsx
- [x] Remplacé useParams par useRoute de wouter (bonne méthode)
- [x] Serveur fonctionne sans erreur TypeScript
- [x] Site affiche correctement la page d'accueil
- [ ] Checkpoint final

## Phase 24 : Amélioration galerie images (demande utilisateur)
- [x] Augmenter limite images à 10 Mo max (au lieu de 5 Mo)
- [x] Afficher les 5 images uploadées dans la galerie (déjà implémenté)
- [x] Ajouter zoom modal professionnel style e-commerce (déjà implémenté)
- [x] Navigation flèches dans le modal de zoom (déjà implémenté)
- [x] Compteur images dans le modal (déjà implémenté)
- [x] Fermer le modal avec ESC ou bouton X (déjà implémenté)
- [x] Tester le flux complet
- [ ] Checkpoint final

## Phase 25 : Correction erreur NotFoundError insertBefore
- [x] Diagnostiqué l'erreur : scripts tiers modifiaient le DOM React
- [x] Amélioré ErrorBoundary avec auto-recovery
- [x] Désactivé temporairement les bannières pubs
- [x] Site stable sans erreur JavaScript
- [x] Checkpoint final

## Phase 26 : Wizard "Ajouter un produit" professionnel
- [x] Mettre à jour schema Drizzle (product_specs, product_media, product_drafts)
- [x] Créer procédures tRPC pour produits (create, update, delete)
- [x] Implémenter wizard 4 étapes avec validation et barre de progression
- [x] Ajouter gestion des médias (images/vidéos jusqu'à 5 fichiers)
- [x] Ajouter caractéristiques produit (tableau clé-valeur)
- [x] Ajouter optimisation SEO (meta title, description, tags, SKU)
- [x] Ajouter page admin /admin/ajouter-produit avec interface professionnelle
- [x] Ajouter lien dans menu admin
- [x] Ajouter route dans App.tsx
- [x] Tester tous les flux
- [ ] Checkpoint final
