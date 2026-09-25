import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../lib/api";

export type CartItem = {
  product: any;
  quantity: number;
  variant?: any;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  addToCart: (product: any, quantity?: number, variant?: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartKey(userId?: string | null) {
  return `nexora_cart_${userId || "guest"}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(cartKey(user?.id));
    return saved ? JSON.parse(saved) : [];
  });

  const hydrated = useRef(false);

  /* Load: from server if logged in, else from localStorage */
  useEffect(() => {
    hydrated.current = false;

    if (isAuthenticated && user) {
      api
        .get("/user/cart")
        .then((res) => {
          const serverCart: CartItem[] = res.data.map((i: any) => ({
            product: i.product,
            quantity: i.quantity,
            variant: i.variant,
          }));
          setItems(serverCart);
        })
        .catch(() => {
          // fall back to local
          const saved = localStorage.getItem(cartKey(user.id));
          setItems(saved ? JSON.parse(saved) : []);
        })
        .finally(() => {
          hydrated.current = true;
        });
    } else {
      const saved = localStorage.getItem(cartKey("guest"));
      setItems(saved ? JSON.parse(saved) : []);
      hydrated.current = true;
    }
  }, [user?.id, isAuthenticated]);

  /* Save locally always */
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(cartKey(user?.id), JSON.stringify(items));
  }, [items, user?.id]);

  /* Push to server when logged in (debounced) */
  useEffect(() => {
    if (!hydrated.current || !isAuthenticated) return;

    const t = setTimeout(() => {
      api.put("/user/cart", {
        cart: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          variant: i.variant,
        })),
      }).catch(() => {});
    }, 800);

    return () => clearTimeout(t);
  }, [items, isAuthenticated]);

  const addToCart = (product: any, quantity = 1, variant?: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, variant }];
    });
  };

  const removeFromCart = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product._id !== id));

  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) =>
      prev.map((i) => (i.product._id === id ? { ...i, quantity } : i))
    );

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, count, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};