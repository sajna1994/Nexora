import React, { createContext, useContext, useEffect, useState } from "react";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("nexora_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nexora_cart", JSON.stringify(items));
  }, [items]);

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