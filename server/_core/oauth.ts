// OAuth Manus supprimé — authentification locale via trpc.auth.login
import type { Express } from "express";

export function registerOAuthRoutes(_app: Express) {
  // Aucune route OAuth externe nécessaire en mode local
}
