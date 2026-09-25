import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type WishlistItem = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  category?: any;
};

type WishlistContextType = {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (product: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function wishKey(userId?: string | null) {
  return `nexora_wishlist_${userId || "guest"}`;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem(wishKey(user?.id));
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(wishKey(user?.id));
    setItems(saved ? JSON.parse(saved) : []);
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(wishKey(user?.id), JSON.stringify(items));
  }, [items, user?.id]);

  const has = (id: string) => items.some((i) => i._id === id);

  const toggle = (product: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i._id === product._id)) {
        return prev.filter((i) => i._id !== product._id);
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
          category: product.category,
        },
      ];
    });
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i._id !== id));

  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, has, toggle, remove, clear }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};