import React, { createContext, useContext, useEffect, useState } from "react";

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

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem("nexora_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nexora_wishlist", JSON.stringify(items));
  }, [items]);

  const has = (id: string) => items.some((i) => i._id === id);

  const toggle = (product: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i._id === product._id)) {
        return prev.filter((i) => i._id !== product._id);
      }
      // Keep only the fields we need
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