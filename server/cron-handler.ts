import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processDuePosts } from "./socialPublisher";

/**
 * Endpoint Vercel Cron : traite les publications sociales arrivées à échéance.
 * Vercel envoie automatiquement `Authorization: Bearer <CRON_SECRET>`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await processDuePosts();
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error("[Cron] social:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
}
