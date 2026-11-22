# Publication automatique sur les réseaux sociaux

## Fonctionnement

- **Publication automatique** : à chaque création d'un produit **avec photo** depuis l'admin, il est publié sur tous les réseaux configurés.
- **Publication manuelle** : bouton « Publier » dans l'admin Produits (global ou par produit) et onglet « Réseaux sociaux ».
- **Publication planifiée** : bouton « Planifier » — choisissez plusieurs produits, une date de début et un intervalle (minutes / heures / jours). Le système publie chaque produit à son tour, sur les réseaux choisis. Une campagne peut être annulée à tout moment.
- **Contenu publié** : photo du produit + nom + prix + lien vers la fiche produit.
- **File d'attente** : chaque tentative est enregistrée dans la table `social_posts` avec son statut (`published`, `failed`, `skipped`) et son erreur éventuelle. Les échecs peuvent être relancés depuis l'interface.

Page de suivi : `/admin/reseaux-sociaux`

## Configuration (.env)

Les identifiants sont lus dans le fichier `.env` local (aucune saisie dans l'interface).

| Réseau | Variables | État actuel |
|---|---|---|
| Facebook | `META_PAGES` (liste JSON des pages avec tokens) | ✅ Page **Yamane_Shop** sélectionnée automatiquement (`id 100123688062935`) |
| Instagram | `INSTAGRAM_BUSINESS_ID` + page Facebook liée | ⚠️ Non configuré — compte Business à lier à la page, puis renseigner son ID |
| TikTok | `TIKTOK_ACCESS_TOKEN` | ⚠️ Non configuré |
| Pinterest | `PINTEREST_ACCESS_TOKEN` + `PINTEREST_BOARD_ID` | ⚠️ Board manquant (le token présent répond 401 : à régénérer) |
| Liens | `SITE_URL` (ex. `https://votre-domaine.com`) | Par défaut `http://localhost:PORT` |
| Cron (production) | `CRON_SECRET` | Optionnel en local ; requis pour l'endpoint `/api/cron/social` |

### Planification

- En local, un vérificateur tourne toutes les minutes dans le serveur (`setInterval`).
- En production (Vercel serverless), le `setInterval` ne survit pas aux invocations : appelez `POST /api/cron/social` avec l'en-tête `Authorization: Bearer <CRON_SECRET>` depuis un cron externe (Vercel Cron, cron-job.org, etc.), par exemple toutes les 5 minutes.
- Bouton « Exécuter maintenant » : endpoint admin `social.runDue` pour traiter les échéances sans attendre.

⚠️ **Important pour la production** : sur Vercel, ajouter les mêmes variables dans les variables d'environnement du projet, sinon seule la publication locale fonctionnera.

## Détails techniques

- Facebook : `POST /{page-id}/photos` (photo par URL), avec repli sur `POST /{page-id}/feed` (lien) si la photo échoue.
- Instagram : `POST /{ig-id}/media` puis `/{ig-id}/media_publish`.
- TikTok : `POST /v2/post/publish/content/init/` (nécessite l'approbation de l'API de publication TikTok).
- Pinterest : `POST /v5/pins`.

Les tokens de page Facebook expirent : en cas d'échec `401`, régénérer le token et mettre à jour `META_PAGES`.

> Note : l'import de produits par fichier ne déclenche **pas** la publication automatique (pour éviter de publier des centaines de produits d'un coup). Utilisez le bouton « Publier » après l'import si nécessaire.
