import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { BOUTIQUE_INFO } from "@shared/constants";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  unit?: string | null;
  imageUrl?: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getWhatsAppCheckoutUrl: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "jappandal_cart";

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const getWhatsAppCheckoutUrl = () => {
    const phone = BOUTIQUE_INFO.phone1.replace(/[^0-9]/g, "");
    
    let message = `Bonjour Jappandal Boutique, je souhaite commander :\n\n`;
    
    items.forEach((item, index) => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toLocaleString("fr-FR");
      const unitDisplay = item.unit ? `/${item.unit}` : "";
      message += `${index + 1}. ${item.name}\n`;
      message += `   Prix: ${parseFloat(item.price).toLocaleString("fr-FR")} FCFA${unitDisplay}\n`;
      message += `   Quantité: ${item.quantity}\n`;
      message += `   Sous-total: ${itemTotal} FCFA\n\n`;
    });

    message += `💰 Total: ${totalPrice.toLocaleString("fr-FR")} FCFA\n\n`;
    message += `📍 Mon lieu de livraison: ___\n\n`;
    message += `Merci !`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        getWhatsAppCheckoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
