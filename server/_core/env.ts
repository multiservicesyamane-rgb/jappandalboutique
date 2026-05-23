export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "change-this-secret-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@jappandal.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
