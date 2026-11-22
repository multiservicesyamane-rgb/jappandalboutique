import * as db from "./db";

/**
 * Publication automatique des produits sur les réseaux sociaux.
 * Identifiants lus dans les variables d'environnement (voir .env.example).
 */

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "pinterest";

export const ALL_PLATFORMS: SocialPlatform[] = ["facebook", "instagram", "tiktok", "pinterest"];

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

type PublishableProduct = {
  id: number;
  name: string;
  price: string;
  imageUrl?: string | null;
  description?: string | null;
  unit?: string | null;
};

type PlatformStatus = { enabled: boolean; detail: string };

type PublishResult = {
  platform: SocialPlatform;
  status: "published" | "failed" | "skipped";
  postId?: number;
  externalId?: string;
  error?: string;
};

function getSiteUrl(): string {
  const configured = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 5000}`;
}

/** Page Facebook dédiée à ce site : Yamane_Shop (dans META_PAGES) */
function getMetaPage(): { id: string; token: string; name: string } | null {
  const raw = process.env.META_PAGES;
  if (raw) {
    try {
      const pages = JSON.parse(raw) as { id: string; name: string; token: string }[];
      const page = pages.find((p) => /yamane.?shop/i.test(p.name));
      if (page?.id && page.token) return { id: page.id, token: page.token, name: page.name };
    } catch {
      // META_PAGES mal formé → on retombe sur les variables simples
    }
  }
  const id = process.env.META_PAGE_ID;
  const token = process.env.META_ACCESS_TOKEN;
  return id && token ? { id, token, name: "Page Facebook" } : null;
}

export function getSocialStatus(): Record<SocialPlatform, PlatformStatus> {
  const page = getMetaPage();
  return {
    facebook: page
      ? { enabled: true, detail: `Page ${page.name} (${page.id})` }
      : { enabled: false, detail: "META_PAGES ou META_ACCESS_TOKEN manquant" },
    instagram:
      page && process.env.INSTAGRAM_BUSINESS_ID
        ? { enabled: true, detail: `Compte Instagram ${process.env.INSTAGRAM_BUSINESS_ID}` }
        : { enabled: false, detail: "INSTAGRAM_BUSINESS_ID manquant (compte Business à lier à la page Facebook)" },
    tiktok: process.env.TIKTOK_ACCESS_TOKEN
      ? { enabled: true, detail: "Token TikTok présent" }
      : { enabled: false, detail: "TIKTOK_ACCESS_TOKEN manquant" },
    pinterest:
      process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID
        ? { enabled: true, detail: `Board ${process.env.PINTEREST_BOARD_ID}` }
        : {
            enabled: false,
            detail: !process.env.PINTEREST_ACCESS_TOKEN
              ? "PINTEREST_ACCESS_TOKEN manquant"
              : "PINTEREST_BOARD_ID manquant",
          },
  };
}

function buildMessage(product: PublishableProduct, link: string): string {
  const price = parseFloat(product.price || "0").toLocaleString("fr-FR");
  const parts = [`🛍️ Nouveau produit : ${product.name}`, `💰 ${price} FCFA${product.unit ? ` / ${product.unit}` : ""}`];
  if (product.description) parts.push(product.description.slice(0, 160));
  parts.push(`👉 Commandez sur ${link}`);
  return parts.join("\n\n");
}

async function postToFacebook(product: PublishableProduct, message: string, link: string): Promise<string> {
  const page = getMetaPage();
  if (!page) throw new Error("Page Facebook non configurée");

  const photoBody = new URLSearchParams({
    access_token: page.token,
    caption: message,
    url: product.imageUrl || "",
  });
  let response = await fetch(`https://graph.facebook.com/v20.0/${page.id}/photos`, {
    method: "POST",
    body: photoBody,
  });
  let data: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Certains comptes ne peuvent pas publier de photo par URL → publication du lien
    const feedBody = new URLSearchParams({
      access_token: page.token,
      message,
      link,
    });
    response = await fetch(`https://graph.facebook.com/v20.0/${page.id}/feed`, {
      method: "POST",
      body: feedBody,
    });
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) throw new Error(data?.error?.message || `Erreur Facebook HTTP ${response.status}`);
  return String(data.id || "");
}

async function postToInstagram(product: PublishableProduct, message: string): Promise<string> {
  const page = getMetaPage();
  const igId = process.env.INSTAGRAM_BUSINESS_ID;
  if (!page || !igId) throw new Error("Instagram Business non configuré");

  const mediaBody = new URLSearchParams({
    access_token: page.token,
    image_url: product.imageUrl || "",
    caption: message,
  });
  const mediaResponse = await fetch(`https://graph.facebook.com/v20.0/${igId}/media`, {
    method: "POST",
    body: mediaBody,
  });
  const media: any = await mediaResponse.json().catch(() => ({}));
  if (!mediaResponse.ok) throw new Error(media?.error?.message || `Erreur Instagram HTTP ${mediaResponse.status}`);

  const publishBody = new URLSearchParams({
    access_token: page.token,
    creation_id: String(media.id),
  });
  const publishResponse = await fetch(`https://graph.facebook.com/v20.0/${igId}/media_publish`, {
    method: "POST",
    body: publishBody,
  });
  const published: any = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok) throw new Error(published?.error?.message || `Erreur Instagram HTTP ${publishResponse.status}`);
  return String(published.id || media.id);
}

async function postToTikTok(product: PublishableProduct, message: string): Promise<string> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error("TikTok non configuré");

  const response = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: {
        title: message.slice(0, 150),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source_type: "PHOTO",
        photo_urls: product.imageUrl ? [product.imageUrl] : [],
      },
    }),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Erreur TikTok HTTP ${response.status}`);
  return String(data?.data?.publish_id || "");
}

async function postToPinterest(product: PublishableProduct, message: string, link: string): Promise<string> {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  const boardId = process.env.PINTEREST_BOARD_ID;
  if (!token || !boardId) throw new Error("Pinterest non configuré");

  const response = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardId,
      title: product.name.slice(0, 100),
      description: message,
      link,
      alt_text: product.name,
      media_source: product.imageUrl
        ? { source_type: "image_url", url: product.imageUrl }
        : undefined,
    }),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Erreur Pinterest HTTP ${response.status}`);
  return String(data.id || "");
}

async function publishOne(
  platform: SocialPlatform,
  product: PublishableProduct,
  message: string,
  link: string
): Promise<string> {
  switch (platform) {
    case "facebook": return await postToFacebook(product, message, link);
    case "instagram": return await postToInstagram(product, message);
    case "tiktok": return await postToTikTok(product, message);
    case "pinterest": return await postToPinterest(product, message, link);
  }
}

/** Publie un produit vers les plateformes demandées et remplit la file d'attente */
export async function publishProduct(
  product: PublishableProduct,
  platforms: SocialPlatform[],
  skipIfNotConfigured = false
): Promise<PublishResult[]> {
  const link = `${getSiteUrl()}/produits/${product.id}`;
  const message = buildMessage(product, link);
  const status = getSocialStatus();
  const results: PublishResult[] = [];

  for (const platform of platforms) {
    if (!status[platform].enabled) {
      if (skipIfNotConfigured) continue;
      const postId = await db.createSocialPost({
        productId: product.id,
        productName: product.name,
        platform,
        status: "skipped",
        message,
        imageUrl: product.imageUrl || null,
        link,
        error: status[platform].detail,
        attempts: 0,
      });
      results.push({ platform, status: "skipped", postId, error: status[platform].detail });
      continue;
    }

    const postId = await db.createSocialPost({
      productId: product.id,
      productName: product.name,
      platform,
      status: "pending",
      message,
      imageUrl: product.imageUrl || null,
      link,
      attempts: 1,
    });

    try {
      const externalId = await publishOne(platform, product, message, link);
      await db.updateSocialPost(postId!, { status: "published", externalId: externalId || null, publishedAt: new Date() });
      results.push({ platform, status: "published", postId, externalId });
    } catch (error) {
      const messageErreur = error instanceof Error ? error.message : "Erreur inconnue";
      await db.updateSocialPost(postId!, { status: "failed", error: messageErreur });
      results.push({ platform, status: "failed", postId, error: messageErreur });
    }
  }

  return results;
}

/** Déclenché automatiquement après la création d'un produit avec image */
export async function publishNewProduct(product: PublishableProduct): Promise<PublishResult[]> {
  if (!product.imageUrl?.trim()) return [];
  const status = getSocialStatus();
  const enabled = ALL_PLATFORMS.filter((platform) => status[platform].enabled);
  if (!enabled.length) return [];
  try {
    return await publishProduct(product, enabled, true);
  } catch (error) {
    console.error("[Social] échec publication auto:", error);
    return [];
  }
}

/** Crée une campagne : N produits × M réseaux étalés dans le temps */
export async function createCampaignSchedule(input: {
  name: string;
  productIds: number[];
  platforms: SocialPlatform[];
  startAt: Date;
  intervalMinutes: number;
}) {
  const allProducts = await db.getAllProductsAdmin();
  const products = input.productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  if (!products.length) throw new Error("Aucun produit valide sélectionné");
  if (!input.platforms.length) throw new Error("Aucun réseau sélectionné");

  const campaignId = await db.createSocialCampaign({
    name: input.name.slice(0, 200),
    platforms: input.platforms.join(","),
    intervalMinutes: input.intervalMinutes,
    status: "active",
  });
  if (!campaignId) throw new Error("Impossible de créer la campagne");

  const siteUrl = getSiteUrl();
  let current = new Date(input.startAt);
  for (const product of products) {
    for (const platform of input.platforms) {
      const link = `${siteUrl}/produits/${product.id}`;
      await db.createSocialPost({
        productId: product.id,
        productName: product.name,
        platform,
        status: "scheduled",
        message: buildMessage(product, link),
        imageUrl: product.imageUrl || null,
        link,
        attempts: 0,
        campaignId,
        scheduledAt: new Date(current),
      });
    }
    current = new Date(current.getTime() + input.intervalMinutes * 60_000);
  }

  return {
    campaignId,
    posts: products.length * input.platforms.length,
    firstAt: new Date(input.startAt),
    lastAt: new Date(current.getTime() - input.intervalMinutes * 60_000),
  };
}

let processingDue = false;

/** Traite les publications arrivées à échéance (appelé par le cron / intervalle) */
export async function processDuePosts(): Promise<{ processed: number; failed: number }> {
  if (processingDue) return { processed: 0, failed: 0 };
  processingDue = true;

  let processed = 0;
  let failed = 0;
  try {
    const due = await db.getDueSocialPosts(10);
    for (const post of due) {
      if (post.campaignId) {
        const campaign = await db.getSocialCampaignById(post.campaignId);
        if (campaign && campaign.status !== "active") {
          await db.updateSocialPost(post.id, { status: "cancelled", error: "Campagne annulée" });
          continue;
        }
      }

      const product = post.productId ? await db.getProductById(post.productId) : undefined;
      if (!product) {
        await db.updateSocialPost(post.id, { status: "failed", error: "Produit associé introuvable" });
        failed++;
        continue;
      }

      await db.updateSocialPost(post.id, {
        status: "pending",
        attempts: (post.attempts || 0) + 1,
      });

      try {
        const externalId = await publishOne(
          post.platform as SocialPlatform,
          product,
          post.message || buildMessage(product, post.link || ""),
          post.link || `${getSiteUrl()}/produits/${product.id}`
        );
        await db.updateSocialPost(post.id, {
          status: "published",
          externalId: externalId || null,
          publishedAt: new Date(),
          error: null,
        });
        processed++;
      } catch (error) {
        await db.updateSocialPost(post.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Erreur inconnue",
        });
        failed++;
      }
    }
  } finally {
    processingDue = false;
  }
  return { processed, failed };
}

/** Annule une campagne et toutes ses publications en attente */
export async function cancelCampaign(id: number) {
  const campaign = await db.getSocialCampaignById(id);
  if (!campaign) throw new Error("Campagne introuvable");
  await db.updateSocialCampaign(id, { status: "cancelled" });
  await db.cancelScheduledPosts(id);
}

/** Relance un élément en échec */
export async function retrySocialPost(postId: number): Promise<PublishResult> {
  const post = await db.getSocialPostById(postId);
  if (!post) throw new Error("Publication introuvable");
  const platform = post.platform as SocialPlatform;
  if (!ALL_PLATFORMS.includes(platform)) throw new Error(`Plateforme inconnue : ${platform}`);

  const product = post.productId ? await db.getProductById(post.productId) : undefined;
  if (!product) throw new Error("Produit associé introuvable");

  await db.updateSocialPost(postId, { status: "pending", error: null, attempts: (post.attempts || 0) + 1 });
  try {
    const externalId = await publishOne(
      platform,
      product,
      post.message || buildMessage(product, post.link || ""),
      post.link || `${getSiteUrl()}/produits/${product.id}`
    );
    await db.updateSocialPost(postId, { status: "published", externalId: externalId || null, publishedAt: new Date(), error: null });
    return { platform, status: "published", postId, externalId };
  } catch (error) {
    const messageErreur = error instanceof Error ? error.message : "Erreur inconnue";
    await db.updateSocialPost(postId, { status: "failed", error: messageErreur });
    return { platform, status: "failed", postId, error: messageErreur };
  }
}
