import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageCircle, Mail, Phone, Save, Plus, Trash2, Edit3, Check,
  ChevronDown, ChevronUp, Loader2, ArrowLeft, Info,
} from "lucide-react";

type Channel = "whatsapp" | "email" | "sms";
type EventKey = string;
type Templates = Record<Channel, Record<EventKey, string[]>>;

const EVENTS: { key: EventKey; label: string; emoji: string; vars: string[] }[] = [
  { key: "order_confirmation", label: "Confirmation de commande", emoji: "✅", vars: ["{nom}", "{produit}", "{quantite}", "{montant}", "{id}"] },
  { key: "delivery", label: "Livraison en cours", emoji: "🚚", vars: ["{nom}", "{produit}", "{adresse}", "{id}"] },
  { key: "delivered", label: "Commande livrée", emoji: "📦", vars: ["{nom}", "{produit}", "{id}"] },
  { key: "cancelled", label: "Commande annulée", emoji: "❌", vars: ["{nom}", "{produit}", "{id}", "{raison}"] },
  { key: "welcome", label: "Bienvenue nouveau client", emoji: "👋", vars: ["{nom}", "{telephone}"] },
  { key: "promotion", label: "Promotion / Offre spéciale", emoji: "🔥", vars: ["{nom}", "{produit}", "{remise}", "{prix_promo}", "{validite}"] },
  { key: "new_product", label: "Nouveau produit disponible", emoji: "🆕", vars: ["{nom}", "{produit}", "{prix}", "{lien}"] },
  { key: "low_stock", label: "Stock limité", emoji: "⚠️", vars: ["{produit}", "{stock_restant}"] },
  { key: "abandoned_cart", label: "Panier abandonné", emoji: "🛒", vars: ["{nom}", "{produit}", "{prix}"] },
  { key: "satisfaction", label: "Demande d'avis / Satisfaction", emoji: "⭐", vars: ["{nom}", "{produit}", "{id}"] },
  { key: "reorder", label: "Relance réachat", emoji: "🔄", vars: ["{nom}", "{produit}", "{delai}"] },
  { key: "birthday", label: "Anniversaire client", emoji: "🎂", vars: ["{nom}", "{offre}"] },
];

const DEFAULT_TEMPLATES: Templates = {
  whatsapp: {
    order_confirmation: [
      "Bonjour {nom} ! ✅ Votre commande #{id} pour *{produit}* (x{quantite}) a bien été reçue. Montant : *{montant} FCFA*. Nous vous contactons très bientôt. Merci de votre confiance ! 🙏",
      "Cher(e) {nom}, nous avons bien reçu votre commande #{id} ! 🛍️ Produit : {produit} — {montant} FCFA. Notre équipe la traite en ce moment. Restez disponible, nous appelons bientôt !",
      "✅ Commande confirmée ! Bonjour {nom}, votre commande #{id} est enregistrée. Produit : *{produit}* x{quantite}. Total : *{montant} FCFA*. Livraison sous 24h à Dakar. Merci ! 🚀",
      "🎉 {nom}, votre commande est validée ! Ref : #{id} | {produit} | {montant} FCFA. Nous vous rappelons pour confirmer les détails. Jappandal vous remercie !",
      "Bonjour {nom} ! 📲 Commande #{id} reçue avec succès. {produit} — {montant} FCFA. Préparation en cours. Livraison rapide garantie !",
      "Allo {nom} ! Commande #{id} bien notée 📋. {produit} x{quantite} = {montant} FCFA. Nous vous contactons dans les 30 minutes pour confirmer. Merci de choisir Jappandal !",
      "✅ Bonjour {nom} ! Votre commande #{id} est en traitement. Produit : {produit}. Montant : {montant} FCFA. Nous vous tenons informé(e) de chaque étape. Bonne journée !",
      "🛒 {nom}, merci pour votre commande #{id} chez Jappandal ! {produit} — {montant} FCFA. Notre livreur passera dans les 24h. Avez-vous des instructions particulières ?",
      "Bonjour {nom} ! Commande #{id} confirmée ✅. Total : {montant} FCFA. Paiement à la livraison. Livraison à votre adresse. Merci et à bientôt !",
      "🌿 {nom}, votre commande Jappandal est bien reçue ! #{id} | {produit} x{quantite}. Montant : {montant} FCFA. Produits frais livrés chez vous. On s'en occupe !",
    ],
    delivery: [
      "🚚 Bonjour {nom} ! Votre commande #{id} ({produit}) est en route vers {adresse}. Le livreur arrive bientôt. Restez disponible svp !",
      "📦 {nom}, votre livreur Jappandal est en chemin ! Commande #{id} — {produit}. Adresse : {adresse}. Temps estimé : 30–60 min.",
      "🚀 En route ! Commande #{id} de {produit} est en livraison vers {adresse}. Préparez le paiement si cash. À tout de suite {nom} !",
      "Bonjour {nom} ! 🛵 Notre livreur est parti avec votre commande #{id}. Produit : {produit}. Destination : {adresse}. Appelez-le si besoin !",
      "🔔 {nom}, votre livraison est lancée ! #{id} — {produit} → {adresse}. Le livreur vous appellera à son arrivée. Merci !",
      "Livraison en cours 🚚 | {nom} | Commande #{id} | {produit} | Direction : {adresse} | Heure estimée : dans 45 min",
      "Cher(e) {nom} ! Votre {produit} est en chemin 🏃. Commande #{id}. Notre livreur arrivera à {adresse} sous peu. Soyez disponible !",
      "📍 Jappandal Express : Commande #{id} pour {nom} en cours de livraison. {produit} → {adresse}. Paiement à la réception.",
      "{nom}, c'est parti ! 🚗 Votre commande #{id} ({produit}) est en livraison vers {adresse}. Le livreur vous contactera.",
      "🌟 {nom} ! Votre commande #{id} est en chemin. {produit} sera chez vous très bientôt à {adresse}. Merci de faire confiance à Jappandal !",
    ],
    welcome: [
      "🎉 Bienvenue chez Jappandal, {nom} ! Nous sommes ravis de vous avoir parmi nos clients. Des produits frais, locaux et de qualité livrés chez vous. Commander maintenant sur notre catalogue !",
      "👋 Bonjour {nom} ! Bienvenue dans la famille Jappandal. Nous vous proposons les meilleurs produits agro-alimentaires du Sénégal. Votre satisfaction est notre mission !",
      "Cher(e) {nom}, bienvenue ! 🌿 Jappandal est votre GIE de confiance pour des aliments sains et frais. Profitez de nos offres de lancement. On livre directement chez vous !",
      "🛍️ {nom}, vous avez bien fait de nous rejoindre ! Chez Jappandal, qualité et fraîcheur sont garanties. Explorez notre catalogue et commandez facilement via WhatsApp.",
      "Bonjour {nom} ! 🇸🇳 Jappandal vous souhaite la bienvenue. Produits locaux, prix honnêtes, livraison rapide. Passez votre première commande et profitez de notre service premium !",
      "Bienvenue {nom} ! ✨ Chez Jappandal GIE, nous sélectionnons pour vous les meilleurs produits frais du Sénégal. Livraison express à Dakar et banlieue. Ravi de vous servir !",
      "🙏 Merci {nom} de nous faire confiance ! Jappandal est là pour vous offrir qualité, fraîcheur et rapidité. Découvrez notre catalogue et économisez sur vos courses quotidiennes.",
      "👑 {nom}, bienvenue dans l'expérience Jappandal ! Des aliments sains pour votre famille, livrés à votre porte. Profitez de notre service 7j/7. Commandez dès maintenant !",
      "🌱 Bonjour {nom} ! Jappandal — GIE des jeunes conscients — est heureux de vous accueillir. Des produits sains pour une vie saine. On est là pour vous !",
      "Bienvenue {nom} ! 🔥 Découvrez pourquoi des centaines de familles à Dakar font confiance à Jappandal pour leurs achats quotidiens. Qualité garantie, livraison rapide !",
    ],
    promotion: [
      "🔥 PROMO JAPPANDAL ! {nom}, profitez de -{remise}% sur {produit}. Prix spécial : *{prix_promo} FCFA* seulement ! Offre valable jusqu'au {validite}. Commandez maintenant !",
      "💥 Offre exceptionnelle pour {nom} ! {produit} à {prix_promo} FCFA (au lieu du prix normal). Économisez {remise}% ! Valable jusqu'au {validite}. Premier arrivé, premier servi !",
      "🎊 {nom}, bonne nouvelle ! -{remise}% sur {produit} chez Jappandal. Prix promo : {prix_promo} FCFA. Offre limitée jusqu'au {validite}. Ne manquez pas cette opportunité !",
      "⚡ FLASH SALE ! {nom}, {produit} en promotion : {prix_promo} FCFA. Remise de {remise}%. Stock limité ! Valable jusqu'au {validite}. Commandez vite !",
      "🌟 Spécial pour vous, {nom} ! {produit} à -{remise}% = {prix_promo} FCFA. Livraison incluse ! Valable jusqu'au {validite}. Jappandal gâte ses clients fidèles !",
      "📣 Attention ! Promo exclusive Jappandal : {produit} à {prix_promo} FCFA (-{remise}%). Offre jusqu'au {validite}. Pour {nom} et tous nos clients fidèles. Foncez !",
      "🛒 {nom}, ne passez pas à côté ! {produit} soldé à {prix_promo} FCFA (-{remise}%). Jappandal vous fait économiser ! Valable jusqu'au {validite} seulement.",
      "💚 Promotion Jappandal GIE ! {nom}, {produit} disponible à {prix_promo} FCFA. Remise de {remise}%. Profitez de prix imbattables jusqu'au {validite} !",
      "🔔 Alerte promo ! {produit} à {prix_promo} FCFA chez Jappandal. Économisez {remise}% ! {nom}, c'est l'occasion ou jamais. Commandez avant le {validite}.",
      "🎯 Offre VIP Jappandal pour {nom} ! {produit} à seulement {prix_promo} FCFA (-{remise}%). Qualité premium, prix mini. Commandez avant le {validite} !",
    ],
    new_product: [
      "🆕 Nouveau chez Jappandal, {nom} ! Découvrez {produit} à {prix} FCFA. Frais, local et de qualité. Passez votre commande dès maintenant !",
      "🌟 Nouveauté ! {nom}, {produit} vient d'arriver en stock chez Jappandal à {prix} FCFA. Soyez parmi les premiers à en profiter !",
      "📦 {nom}, bonne nouvelle ! {produit} est maintenant disponible chez Jappandal. Prix : {prix} FCFA. Livraison express à Dakar. Commandez maintenant !",
      "🎊 Lancement ! Jappandal présente {produit} à {prix} FCFA. {nom}, découvrez ce nouveau produit de qualité. Stock limité !",
      "🔥 HOT NEW ! {nom}, {produit} vient de rejoindre notre catalogue. {prix} FCFA seulement ! Qualité Jappandal garantie. Commandez !",
      "✨ Nouveau produit disponible ! {produit} chez Jappandal — {prix} FCFA. {nom}, c'est le moment de l'essayer. Livraison rapide !",
      "🛍️ {nom} ! Nous avons ajouté {produit} à notre catalogue. Prix : {prix} FCFA. Frais et disponible maintenant chez Jappandal !",
      "🌱 Fraîchement arrivé ! {nom}, {produit} est disponible à {prix} FCFA chez Jappandal. Commandez et recevez chez vous rapidement.",
      "📣 Nouvelle arrivée Jappandal ! {produit} à {prix} FCFA. {nom}, profitez de notre offre de lancement. Stock limité !",
      "🆕 {nom}, découvrez notre nouveau produit : {produit} à {prix} FCFA. Jappandal vous apporte toujours le meilleur du Sénégal !",
    ],
    abandoned_cart: [
      "🛒 {nom}, vous avez oublié {produit} dans votre panier ! Finalisez votre commande chez Jappandal à {prix} FCFA. On vous livre rapidement !",
      "Hé {nom} ! Votre {produit} vous attend chez Jappandal à {prix} FCFA. Complétez votre commande avant rupture de stock !",
      "⏰ {nom}, votre panier Jappandal expire bientôt ! {produit} à {prix} FCFA. Commandez maintenant avant qu'il soit trop tard.",
      "💭 {nom}, vous hésitez encore ? {produit} à {prix} FCFA chez Jappandal vous attend. Livraison rapide, qualité garantie. Foncez !",
      "🔔 Rappel Jappandal : {nom}, {produit} est toujours disponible à {prix} FCFA. Ne le laissez pas partir ! Commandez maintenant.",
      "🌟 {nom}, vous avez de bon goût ! {produit} à {prix} FCFA est encore là. Passez votre commande Jappandal maintenant, on livre vite !",
      "🛍️ {nom} ! On a gardé votre {produit} chez Jappandal. {prix} FCFA. Stock limité ! Ne tardez plus, commandez aujourd'hui.",
      "💚 Cher {nom}, votre sélection Jappandal vous attend : {produit} à {prix} FCFA. Finalisez votre commande et recevez-la demain !",
      "{nom}, une dernière chance ! {produit} à {prix} FCFA chez Jappandal. On ne peut pas garantir le stock longtemps. Commandez maintenant !",
      "📦 {nom}, votre panier Jappandal : {produit} à {prix} FCFA. Des produits frais qui vous attendent. Finalisez commande avant rupture !",
    ],
    delivered: [
      "🎉 {nom}, votre commande #{id} a été livrée ! {produit} est chez vous. Nous espérons que vous êtes satisfait(e). Merci de votre confiance chez Jappandal !",
      "📦 Livraison confirmée ! {nom}, commande #{id} ({produit}) bien réceptionnée. Bon appétit et à très bientôt chez Jappandal !",
      "✅ {nom} ! Votre commande #{id} est arrivée à destination. {produit} livré avec succès. Jappandal vous remercie !",
      "🙏 Merci {nom} ! Commande #{id} livrée. {produit} est maintenant chez vous. Satisfaction garantie. Revenez nous voir !",
      "🌟 {nom}, c'est livré ! Commande #{id} — {produit}. Nous espérons que tout est parfait. N'hésitez pas à nous contacter si besoin !",
      "📫 {nom} ! Livraison réussie. #{id} — {produit}. Votre satisfaction est notre priorité. Donnez-nous votre avis sur notre service !",
      "✨ Super ! {nom}, votre commande #{id} ({produit}) est livrée. Merci de faire confiance à Jappandal. À bientôt pour de nouvelles commandes !",
      "🏠 Livré chez vous ! {nom}, commande #{id} — {produit} réceptionné. Jappandal espère vous avoir satisfait(e). À très bientôt !",
      "🎊 {nom} ! Package livré avec succès. Commande #{id} — {produit}. Jappandal vous dit merci et vous souhaite bon appétit !",
      "💚 {nom}, tout s'est bien passé ! Commande #{id} ({produit}) livrée. Merci pour votre fidélité chez Jappandal GIE !",
    ],
    satisfaction: [
      "⭐ {nom}, avez-vous aimé votre commande #{id} ({produit}) ? Votre avis nous aide à nous améliorer. Notez notre service de 1 à 5 !",
      "🙏 Bonjour {nom} ! Comment s'est passée votre expérience avec Jappandal ? Commande #{id} — {produit}. Votre retour est précieux !",
      "📝 {nom}, quelques secondes pour donner votre avis sur la commande #{id} ({produit}) ? Votre satisfaction est notre priorité !",
      "💬 {nom}, êtes-vous satisfait(e) de votre commande #{id} ({produit}) chez Jappandal ? Dites-nous tout ! Nous améliorons chaque jour.",
      "🌟 Bonjour {nom} ! Commande #{id} — {produit}. Étiez-vous satisfait(e) ? Partagez votre expérience pour aider d'autres clients !",
      "✨ {nom}, votre avis compte ! Commande #{id} ({produit}). Comment évaluez-vous notre service ? Qualité, livraison, prix ?",
      "🎯 Cher(e) {nom}, comment était votre commande #{id} chez Jappandal ? {produit} était-il à la hauteur ? Répondez simplement !",
      "📊 {nom}, feedback rapide sur commande #{id} ({produit}) ? Notez : livraison, qualité produit, rapport qualité-prix. Merci !",
      "💚 {nom} ! On espère que {produit} (commande #{id}) vous a satisfait. Un mot sur votre expérience Jappandal ? On améliore chaque jour !",
      "🔔 {nom}, votre commande #{id} ({produit}) est livrée depuis quelques jours. Êtes-vous content(e) ? Votre retour nous aide à mieux vous servir !",
    ],
    reorder: [
      "🔄 {nom}, vous avez aimé {produit} ? Il y a {delai}, vous en avez commandé chez Jappandal. Temps de restock ? Commandez à nouveau facilement !",
      "📦 Coucou {nom} ! Votre {produit} commandé il y a {delai} est probablement épuisé. Repassez commande chez Jappandal. Toujours dispo !",
      "🛒 {nom}, ça fait {delai} depuis votre commande de {produit}. Il est temps de renouveler ! Jappandal vous livre rapidement.",
      "Bonjour {nom} ! Il y a {delai}, vous commandiez {produit} chez nous. Vous en avez besoin à nouveau ? Un message et on s'occupe de tout !",
      "🌿 {nom}, {produit} commandé il y a {delai}. Vos stocks sont peut-être bas ! Repassez commande chez Jappandal pour ne manquer de rien.",
      "⏰ {delai} déjà ! {nom}, votre dernière commande de {produit} remonte à {delai}. Renouvelez chez Jappandal. Même qualité, même rapidité !",
      "💚 {nom}, votre fidélité nous touche ! Il y a {delai} vous commandiez {produit}. On garde le même en stock pour vous. Commandez !",
      "🔔 Rappel Jappandal pour {nom} : {produit} commandé il y a {delai}. Votre famille en a besoin ? On livre dès aujourd'hui !",
      "🛍️ {nom}, {delai} depuis votre dernier achat de {produit}. C'est le bon moment pour renouveler chez Jappandal !",
      "📲 Cher {nom}, {produit} acheté il y a {delai}. En rupture chez vous ? Jappandal vous le livre encore plus vite cette fois !",
    ],
    low_stock: [
      "⚠️ ALERTE STOCK ! {produit} — Plus que {stock_restant} unités disponibles chez Jappandal. Commandez vite avant rupture !",
      "🚨 Stock limité ! {produit} : {stock_restant} pièces restantes. Ne tardez pas, commandez maintenant chez Jappandal !",
      "⏰ Dernières unités ! {produit} — {stock_restant} disponibles seulement. Rupture imminente chez Jappandal. Commandez maintenant !",
      "🔴 Attention ! Il ne reste que {stock_restant} {produit} en stock chez Jappandal. Premier arrivé, premier servi !",
      "📉 {produit} presque épuisé ! Seulement {stock_restant} en stock chez Jappandal. Ne ratez pas l'occasion, commandez vite !",
    ],
    birthday: [
      "🎂 Joyeux anniversaire {nom} ! Jappandal vous offre un cadeau spécial : {offre}. Notre façon de remercier votre fidélité. Bonne fête !",
      "🎉 Bon anniversaire {nom} ! Pour ce jour spécial, Jappandal vous réserve : {offre}. Profitez-en et passez une excellente journée !",
      "🎊 {nom}, toute l'équipe Jappandal vous souhaite un joyeux anniversaire ! Célébrez avec {offre}. Merci d'être notre client fidèle !",
      "🌟 Happy Birthday {nom} ! Jappandal vous gâte avec {offre}. Commandez et célébrez avec les meilleurs produits locaux. Bonne fête !",
      "💚 Bon anniv {nom} ! 🎂 En cadeau de Jappandal : {offre}. Profitez de ce jour magnifique. Toute l'équipe vous embrasse fort !",
    ],
    cancelled: [
      "❌ {nom}, votre commande #{id} ({produit}) a été annulée. Raison : {raison}. Nous nous excusons. N'hésitez pas à recommander chez Jappandal.",
      "😔 {nom}, désolé ! Commande #{id} annulée. {raison}. Nous sommes navrés. Votre prochain achat chez Jappandal sera parfait, promis.",
      "Cher {nom}, commande #{id} ({produit}) annulée. Motif : {raison}. Toutes nos excuses. Revenez commander, nous ferons mieux !",
      "⚠️ {nom}, malheureusement la commande #{id} ({produit}) est annulée. {raison}. Nous sommes désolés. Un bon de réduction vous attend !",
      "❌ Commande #{id} annulée pour {nom}. {produit}. Raison : {raison}. Jappandal s'excuse et vous invite à passer une nouvelle commande !",
    ],
  },
  email: {
    order_confirmation: [
      "Bonjour {nom},\n\nNous avons bien reçu votre commande #{id}.\n\nDétail :\n- Produit : {produit}\n- Quantité : {quantite}\n- Montant total : {montant} FCFA\n\nNotre équipe vous contactera sous peu pour confirmer.\n\nCordialement,\nL'équipe Jappandal",
      "Cher(e) {nom},\n\nVotre commande #{id} est confirmée ! 🎉\n\n📦 {produit} x{quantite}\n💰 {montant} FCFA\n\nNous traitons votre commande avec soin. Livraison sous 24h à Dakar.\n\nMerci et à bientôt !\nJappandal GIE",
      "Bonjour {nom},\n\nMerci pour votre commande chez Jappandal !\n\nRéférence : #{id}\nProduit : {produit}\nMontant : {montant} FCFA\n\nVous recevrez bientôt un appel pour les détails de livraison.\n\nBien cordialement,\nJappandal",
    ],
    delivery: [
      "Bonjour {nom},\n\nVotre commande #{id} ({produit}) est en cours de livraison.\n📍 Destination : {adresse}\n\nNotre livreur vous contactera à son arrivée.\n\nCordialement,\nJappandal",
      "Cher(e) {nom},\n\n🚚 Votre commande est en route !\nCommande : #{id} — {produit}\nAdresse : {adresse}\n\nRestez disponible, livraison imminente.\n\nL'équipe Jappandal",
    ],
    welcome: [
      "Bonjour {nom},\n\nBienvenue chez Jappandal GIE ! 🌿\n\nNous sommes ravis de vous compter parmi nos clients. Notre mission : vous apporter des produits frais, locaux et de qualité à Dakar et banlieue.\n\nExplorez notre catalogue et passez votre première commande !\n\nCordialement,\nL'équipe Jappandal",
      "Cher(e) {nom},\n\nMerci d'avoir rejoint Jappandal ! 🎉\n\nJappandal est un GIE des jeunes entrepreneurs sénégalais, engagé pour une alimentation saine et de qualité.\n\nVotre satisfaction est notre priorité.\n\nBienvenue et bonne découverte !\nJappandal GIE",
    ],
    promotion: [
      "Bonjour {nom},\n\n🔥 Offre exclusive Jappandal !\n\n{produit} en promotion : {prix_promo} FCFA (-{remise}%)\n⏰ Valable jusqu'au {validite}\n\nNe manquez pas cette opportunité !\n\nCordialement,\nJappandal",
    ],
    new_product: ["Bonjour {nom},\n\n🆕 Nouveau produit chez Jappandal !\n\n{produit} — {prix} FCFA\n\nFrais, local et disponible maintenant. Commandez dès aujourd'hui !\n\nL'équipe Jappandal"],
    abandoned_cart: ["Bonjour {nom},\n\nVous avez laissé {produit} dans votre panier à {prix} FCFA.\n\nFinalisez votre commande avant rupture de stock !\n\nJappandal"],
    delivered: ["Bonjour {nom},\n\n✅ Votre commande #{id} ({produit}) a été livrée avec succès.\n\nNous espérons que vous êtes satisfait(e) ! N'hésitez pas à nous laisser votre avis.\n\nMerci,\nJappandal"],
    satisfaction: ["Bonjour {nom},\n\nComment s'est passée votre commande #{id} ({produit}) ?\n\nVotre avis nous aide à améliorer notre service. Répondez simplement à cet email !\n\nMerci,\nJappandal"],
    reorder: ["Bonjour {nom},\n\nIl y a {delai}, vous commandiez {produit} chez Jappandal.\n\nVos stocks sont peut-être épuisés ! Repassez commande facilement.\n\nL'équipe Jappandal"],
    low_stock: ["⚠️ Alerte stock ! {produit} — Seulement {stock_restant} unités disponibles. Commandez rapidement !\n\nJappandal"],
    birthday: ["Joyeux anniversaire {nom} ! 🎂\n\nPour ce jour spécial, Jappandal vous offre : {offre}.\n\nToute l'équipe vous souhaite une excellente journée !\n\nJappandal GIE"],
    cancelled: ["Bonjour {nom},\n\nNous vous informons que votre commande #{id} ({produit}) a été annulée.\n\nMotif : {raison}\n\nNous nous en excusons. Revenez commander chez Jappandal !\n\nCordialement,\nJappandal"],
  },
  sms: {
    order_confirmation: [
      "Jappandal: Commande #{id} recue. {produit} - {montant}F. Nous vous contactons bientot. Merci {nom}!",
      "JAPPANDAL: Cde #{id} confirmee! {produit} x{quantite} = {montant}FCFA. Livraison 24h. Merci {nom}!",
      "Jappandal: Merci {nom}! Cde #{id} validee. {produit} {montant}F. Notre equipe vous appelle bientot.",
    ],
    delivery: [
      "Jappandal: {nom}, votre commande #{id} ({produit}) est en livraison vers {adresse}. Restez disponible!",
      "JAPPANDAL LIVRAISON: Cde #{id} pour {nom} en route vers {adresse}. Livreur arrive bientot!",
    ],
    welcome: [
      "Bienvenue chez Jappandal {nom}! Produits frais livres a Dakar. Commandez via WhatsApp. Merci!",
      "JAPPANDAL: Bonjour {nom}! Bienvenue dans notre famille. Qualite et fraicheur garanties. A bientot!",
    ],
    promotion: [
      "PROMO JAPPANDAL: {nom}, -{remise}% sur {produit}! Prix: {prix_promo}F. Valable jusqu'au {validite}. Commandez!",
      "JAPPANDAL OFFRE: {produit} a {prix_promo}F (-{remise}%). {nom}, jusqu'au {validite}. Foncez!",
    ],
    delivered: ["Jappandal: {nom}, commande #{id} livree! Merci de votre confiance. A bientot!"],
    new_product: ["JAPPANDAL: Nouveau! {produit} a {prix}F disponible. {nom}, commandez maintenant!"],
    abandoned_cart: ["Jappandal: {nom}, votre {produit} ({prix}F) vous attend! Commandez avant rupture."],
    satisfaction: ["Jappandal: {nom}, satisfait(e) de votre cde #{id}? Un mot suffit! Merci."],
    reorder: ["Jappandal: {nom}, renouvelez votre {produit}? Commandez facilement. A bientot!"],
    low_stock: ["JAPPANDAL: URGENT! {produit} - plus que {stock_restant} en stock. Commandez vite!"],
    birthday: ["Jappandal: Joyeux anniversaire {nom}! Cadeau special: {offre}. Bonne fete!"],
    cancelled: ["Jappandal: Cde #{id} annulee. {raison}. Toutes nos excuses {nom}. Revenez bientot!"],
  },
};

const CHANNEL_META: Record<Channel, { label: string; icon: any; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  email:    { label: "Email",    icon: Mail,          color: "#3b82f6" },
  sms:      { label: "SMS",      icon: Phone,         color: "#8b5cf6" },
};

export default function Marketing() {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [expandedEvent, setExpandedEvent] = useState<EventKey | null>("order_confirmation");
  const [templates, setTemplates] = useState<Templates>(DEFAULT_TEMPLATES);
  const [editingCell, setEditingCell] = useState<{ event: EventKey; idx: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: settings } = trpc.settings.list.useQuery();
  const upsertSetting = trpc.settings.upsert.useMutation();

  useEffect(() => {
    if (!settings) return;
    const saved = settings.find((s) => s.key === "marketing_templates");
    if (saved?.value) {
      try {
        const parsed = JSON.parse(saved.value);
        setTemplates((prev) => {
          const merged: Templates = { ...prev };
          (["whatsapp", "email", "sms"] as Channel[]).forEach((ch) => {
            if (parsed[ch]) {
              merged[ch] = { ...prev[ch], ...parsed[ch] };
            }
          });
          return merged;
        });
      } catch {}
    }
  }, [settings]);

  const saveAll = async () => {
    setSaving(true);
    try {
      await upsertSetting.mutateAsync({ key: "marketing_templates", value: JSON.stringify(templates), description: "Templates messages marketing" });
      toast.success("Templates sauvegardés !");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (event: EventKey, idx: number) => {
    setEditValue(templates[channel][event]?.[idx] || "");
    setEditingCell({ event, idx });
  };

  const saveEdit = () => {
    if (!editingCell) return;
    setTemplates((prev) => {
      const arr = [...(prev[channel][editingCell.event] || [])];
      arr[editingCell.idx] = editValue;
      return { ...prev, [channel]: { ...prev[channel], [editingCell.event]: arr } };
    });
    setEditingCell(null);
  };

  const addTemplate = (event: EventKey) => {
    setTemplates((prev) => {
      const arr = [...(prev[channel][event] || []), "Nouveau message — cliquez pour modifier"];
      return { ...prev, [channel]: { ...prev[channel], [event]: arr } };
    });
  };

  const removeTemplate = (event: EventKey, idx: number) => {
    setTemplates((prev) => {
      const arr = (prev[channel][event] || []).filter((_, i) => i !== idx);
      return { ...prev, [channel]: { ...prev[channel], [event]: arr } };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-slate-50 text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Marketing — Modèles de messages</h1>
            <p className="text-xs text-slate-500">Gérez vos templates WhatsApp, Email et SMS</p>
          </div>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "#A8D24E", boxShadow: saving ? "none" : "0 0 15px rgba(168,210,78,0.3)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Variables disponibles</p>
            <p className="text-xs mt-0.5">Utilisez <code className="bg-blue-100 px-1 rounded">{"{nom}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{produit}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{montant}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{id}"}</code>, etc. dans vos messages — elles seront remplacées automatiquement.</p>
          </div>
        </div>

        {/* Channel tabs */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(CHANNEL_META) as Channel[]).map((ch) => {
            const { label, icon: Icon, color } = CHANNEL_META[ch];
            return (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                style={
                  channel === ch
                    ? { background: `${color}15`, borderColor: `${color}50`, color }
                    : { background: "white", borderColor: "#e2e8f0", color: "#64748b" }
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {EVENTS.map(({ key, label, emoji, vars }) => {
            const msgs = templates[channel][key] || [];
            const isOpen = expandedEvent === key;

            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Event header */}
                <button
                  onClick={() => setExpandedEvent(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 text-sm">{label}</p>
                      <p className="text-xs text-slate-400">{msgs.length} template{msgs.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{vars.slice(0, 3).join(", ")}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Templates */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    {/* Variables reference */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {vars.map((v) => (
                        <code key={v} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">{v}</code>
                      ))}
                    </div>

                    {msgs.map((msg, idx) => (
                      <div key={idx} className="relative group">
                        {editingCell?.event === key && editingCell?.idx === idx ? (
                          <div>
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={4}
                              className="w-full p-3 rounded-xl border border-blue-300 text-sm resize-none outline-none ring-2 ring-blue-200"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold">
                                <Check className="h-3.5 w-3.5" /> Enregistrer
                              </button>
                              <button onClick={() => setEditingCell(null)} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs text-slate-500 hover:bg-slate-50">
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="relative p-3 rounded-xl text-sm text-slate-700 border border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group whitespace-pre-line leading-relaxed"
                            onClick={() => startEdit(key, idx)}
                          >
                            <div className="pr-16">{msg}</div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); startEdit(key, idx); }} className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center hover:bg-blue-50 shadow-sm">
                                <Edit3 className="h-3 w-3 text-blue-500" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); removeTemplate(key, idx); }} className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center hover:bg-red-50 shadow-sm">
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 right-2 text-[10px] text-slate-300">#{idx + 1}</div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addTemplate(key)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-sm text-slate-400 hover:text-blue-500 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un template
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
