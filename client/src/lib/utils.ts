import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Place les produits avec une image en premier, en conservant l'ordre
 * d'origine à l'intérieur de chaque groupe.
 */
export function sortProductsWithImageFirst<T extends { imageUrl?: string | null }>(
  products: T[]
): T[] {
  return [...products].sort((a, b) => {
    const aHasImage = !!a.imageUrl?.trim();
    const bHasImage = !!b.imageUrl?.trim();
    if (aHasImage === bHasImage) return 0;
    return aHasImage ? -1 : 1;
  });
}
