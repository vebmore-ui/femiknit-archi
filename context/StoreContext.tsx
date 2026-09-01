import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type StoreContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  wishlistIds: string[];
  wishlist: Set<string>;
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateCartQuantity: (id: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  wishlistToast: string | null;
  cartToast: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("femiknit_wishlist");
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(new Set(parsed));
      }
      const savedCart = localStorage.getItem("femiknit_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("femiknit_wishlist", JSON.stringify([...wishlist]));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("femiknit_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const showWishlistToast = useCallback((message: string) => {
    setWishlistToast(message);
    setTimeout(() => setWishlistToast(null), 2500);
  }, []);

  const showCartToast = useCallback((message: string) => {
    setCartToast(message);
    setTimeout(() => setCartToast(null), 2500);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        showWishlistToast("Removed from wishlist");
      } else {
        next.add(id);
        showWishlistToast("Added to wishlist");
      }
      return next;
    });
  }, [showWishlistToast]);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        showWishlistToast("Removed from wishlist");
      }
      return next;
    });
  }, [showWishlistToast]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      if (existing) {
        showCartToast("Cart updated");
        return prev.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      showCartToast("Added to cart");
      return [...prev, { ...item, quantity: qty }];
    });
  }, [showCartToast]);

  const removeFromCart = useCallback((id: string, size: string, color: string) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.color === color)));
  }, []);

  const updateCartQuantity = useCallback((id: string, size: string, color: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.id === id && i.size === size && i.color === color) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo<StoreContextValue>(
    () => ({
      cartItems,
      cartCount,
      cartTotal,
      wishlistCount: wishlist.size,
      wishlistIds: [...wishlist],
      wishlist,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      removeFromWishlist,
      wishlistToast,
      cartToast,
    }),
    [cartItems, cartCount, cartTotal, wishlist, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, removeFromWishlist, wishlistToast, cartToast]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
