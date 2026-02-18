# 🔐 Guide d'Accès Administrateur - Jappandal Boutique

## 📋 Informations Générales

**Nom du site:** Jappandal Boutique  
**Slogan:** Votre Supermarché de Confiance  
**URL du site:** https://jappandal-nanliubs.manus.space/

---

## 🎯 Accès au Dashboard Administrateur

### URL d'accès
```
https://jappandal-nanliubs.manus.space/admin
```

### Identifiants de connexion
**Email administrateur:** multiservicesyamane@gmail.com

**Méthode de connexion:**
Le site utilise l'authentification Manus OAuth. Pour vous connecter en tant qu'administrateur :

1. Accédez à l'URL du dashboard : https://jappandal-nanliubs.manus.space/admin
2. Cliquez sur le bouton "Se connecter"
3. Utilisez l'email administrateur : **multiservicesyamane@gmail.com**
4. Suivez le processus d'authentification Manus
5. Une fois connecté, vous aurez accès à toutes les fonctionnalités administrateur

**Note importante:** L'email **multiservicesyamane@gmail.com** est automatiquement configuré comme administrateur dans le système. Aucun autre compte n'aura accès au dashboard admin.

---

## 🛠️ Fonctionnalités du Dashboard

### 1. **Tableau de Bord** (`/admin`)
- Vue d'ensemble des statistiques
- Nombre de produits, catégories, commandes
- Commandes en attente
- Accès rapide aux différentes sections

### 2. **Gestion des Produits** (`/admin/produits`)
- ✅ Ajouter un nouveau produit
- ✅ Modifier les informations d'un produit (nom, prix, description, catégorie, image)
- ✅ Supprimer un produit
- ✅ Gérer le stock (en stock / rupture)
- ✅ Upload d'images pour chaque produit

### 3. **Gestion des Catégories** (`/admin/categories`)
- ✅ Créer une nouvelle catégorie
- ✅ Modifier une catégorie existante (nom, slug, emoji, description)
- ✅ Supprimer une catégorie
- **Catégories actuelles:** Produits de mil, Légumes frais, Viandes & Lait, Fruits frais, Épicerie, Produits laitiers, Jus naturels, Produits bio

### 4. **Gestion des Commandes** (`/admin/commandes`)
- ✅ Voir toutes les commandes
- ✅ Filtrer par statut (En attente, Contacté, Confirmé, Livré, Annulé)
- ✅ Voir les détails complets d'une commande
- ✅ Changer le statut d'une commande
- ✅ Ajouter des notes internes sur les commandes
- **Statuts disponibles:**
  - **En attente:** Nouvelle commande non traitée
  - **Contacté:** Client contacté via WhatsApp
  - **Confirmé:** Commande confirmée par le client
  - **Livré:** Commande livrée au client
  - **Annulé:** Commande annulée

### 5. **Gestion des Clients** (`/admin/clients`)
- ✅ Voir la liste de tous les clients
- ✅ Ajouter un nouveau client
- ✅ Modifier les informations d'un client
- ✅ Voir l'historique des commandes par client
- ✅ Supprimer un client
- **Informations client:** Nom, téléphone, email, adresse, notes

### 6. **Paramètres** (`/admin/parametres`)
- ✅ Configurer les numéros WhatsApp
  - Téléphone 1: +221 77 682 78 51
  - Téléphone 2: +221 76 905 51 94
- ✅ Email administrateur
- ✅ Template de message WhatsApp pour les commandes
- ✅ Slogan et valeurs de la boutique

### 7. **Statistiques** (`/admin/statistiques`)
- ✅ Revenu total (commandes livrées)
- ✅ Nombre total de commandes
- ✅ Commandes du jour
- ✅ Nombre de clients
- ✅ Top 10 des produits populaires
- ✅ 10 dernières commandes
- ✅ Statistiques du catalogue (produits, catégories)

---

## 📱 Informations de Contact

### Numéros WhatsApp
- **Principal:** +221 77 682 78 51
- **Secondaire:** +221 76 905 51 94

### Email
- **Administrateur:** multiservicesyamane@gmail.com

### Réseaux sociaux
- **Contact:** Jappandal boutique

---

## 🌐 Hébergement et Déploiement

### Plateforme d'hébergement
Le site est hébergé sur **Manus** (https://manus.space), une plateforme d'hébergement moderne avec:
- ✅ Hébergement automatique
- ✅ Base de données MySQL intégrée
- ✅ Certificat SSL automatique (HTTPS)
- ✅ Domaine personnalisable
- ✅ Sauvegarde automatique des versions

### URL actuelle
```
https://jappandal-nanliubs.manus.space/
```

### Comment mettre à jour le site

**Option 1: Via le Dashboard Manus (Recommandé)**
1. Connectez-vous à votre compte Manus
2. Accédez à la section "Projets"
3. Sélectionnez "Jappandal Boutique"
4. Utilisez l'interface de gestion pour:
   - Voir le code source
   - Créer des checkpoints (versions)
   - Publier une nouvelle version
   - Gérer le domaine

**Option 2: Contacter le développeur**
Pour des modifications importantes du code ou du design, contactez votre développeur via Manus.

### Domaine personnalisé
Vous pouvez configurer un domaine personnalisé (ex: www.jappandal.com) via le dashboard Manus:
1. Allez dans Paramètres > Domaines
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

---

## 🔄 Workflow de Gestion des Commandes

### Processus recommandé:

1. **Nouvelle commande reçue** (Statut: En attente)
   - Une notification apparaît dans le dashboard
   - La commande est visible dans "Commandes en attente"

2. **Contacter le client** (Statut: Contacté)
   - Cliquez sur la commande pour voir les détails
   - Utilisez le numéro WhatsApp du client pour le contacter
   - Changez le statut à "Contacté"

3. **Confirmer la commande** (Statut: Confirmé)
   - Après confirmation du client
   - Changez le statut à "Confirmé"
   - Ajoutez des notes si nécessaire (heure de livraison, instructions spéciales)

4. **Livraison** (Statut: Livré)
   - Une fois la commande livrée
   - Changez le statut à "Livré"
   - Le montant sera comptabilisé dans les statistiques de revenu

5. **Annulation** (Statut: Annulé)
   - Si le client annule ou ne répond pas
   - Changez le statut à "Annulé"
   - Ajoutez une note expliquant la raison

---

## 💡 Conseils d'Utilisation

### Gestion des Produits
- **Images:** Utilisez des images de haute qualité (minimum 800x800px)
- **Prix:** Toujours indiquer les prix en FCFA
- **Stock:** Mettez à jour régulièrement le statut de stock
- **Descriptions:** Soyez précis sur les quantités (kg, litre, pièce, etc.)

### Gestion des Commandes
- **Réactivité:** Traitez les commandes rapidement (idéalement sous 1 heure)
- **Communication:** Utilisez WhatsApp pour confirmer les commandes
- **Notes:** Ajoutez des notes pour garder une trace des échanges avec les clients
- **Suivi:** Vérifiez régulièrement les commandes en attente

### Statistiques
- **Consultez quotidiennement** le nombre de commandes du jour
- **Analysez** les produits populaires pour optimiser votre stock
- **Suivez** le revenu total pour mesurer la performance

---

## 🆘 Support et Assistance

### En cas de problème technique
1. **Vérifiez votre connexion internet**
2. **Actualisez la page** (F5 ou Ctrl+R)
3. **Videz le cache** de votre navigateur
4. **Essayez un autre navigateur** (Chrome, Firefox, Safari)

### Pour des questions sur l'utilisation
- Consultez ce guide
- Contactez votre développeur via Manus

### Pour des modifications du site
- Modifications mineures: Utilisez le dashboard admin
- Modifications majeures: Contactez votre développeur

---

## 📊 Base de Données

### Accès à la base de données
La base de données est accessible via le dashboard Manus:
1. Allez dans l'onglet "Database"
2. Vous pouvez voir et modifier les données directement
3. **Attention:** Soyez prudent lors de modifications directes

### Tables principales
- **users:** Utilisateurs et administrateurs
- **products:** Catalogue de produits
- **categories:** Catégories de produits
- **orders:** Commandes clients
- **customers:** Informations clients
- **settings:** Paramètres du site
- **banners:** Bannières (fonctionnalité future)

---

## 🔒 Sécurité

### Bonnes pratiques
- ✅ Ne partagez jamais vos identifiants de connexion
- ✅ Déconnectez-vous après chaque session
- ✅ Utilisez un mot de passe fort pour votre compte Manus
- ✅ Vérifiez régulièrement les commandes suspectes
- ✅ Sauvegardez régulièrement vos données importantes

### Qui a accès au dashboard admin?
**Uniquement** l'email **multiservicesyamane@gmail.com** a accès au dashboard administrateur. Aucun autre utilisateur ne peut accéder aux fonctionnalités d'administration.

---

## 📝 Notes Importantes

1. **Sauvegarde automatique:** Toutes les modifications sont sauvegardées automatiquement
2. **Versions:** Manus crée des checkpoints automatiques que vous pouvez restaurer si nécessaire
3. **Performance:** Le site est optimisé pour mobile et desktop
4. **WhatsApp:** Les commandes redirigent automatiquement vers WhatsApp avec un message pré-rempli
5. **Catalogue:** 56 produits actuellement dans 8 catégories

---

## 📅 Date de création
14 février 2026

## 👨‍💻 Développeur
Développé avec Manus AI

---

**Pour toute question ou assistance, n'hésitez pas à contacter votre support technique via la plateforme Manus.**
