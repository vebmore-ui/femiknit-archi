import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ArrowLeft, ShoppingBag, Star, AlertTriangle } from "lucide-react";
import { Link } from "@remix-run/react";
import { useStore } from "@/context/StoreContext";

type BackendProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  gender: string;
  ageGroup: string;
  category: string;
  status: string;
  variants: { id: number; size: string; color: string; stock: number }[];
  images: string[];
  subcategory?: string;
  badge?: string;
};

type WishlistProduct = {
  id: string;
  title: string;
  price: number;
  mrp: number;
  rating: number;
  images: string[];
  badge?: string;
  description?: string;
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } }
};

export default function WishlistPage() {
  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, number>>({});

  const { wishlistIds, removeFromWishlist } = useStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const wishlistedProducts = useMemo(() => {
    return allProducts
      .filter((p) => wishlistIds.includes(p.id))
      .map((bp) => {
        const price = parseFloat(bp.discountPrice || bp.price);
        const mrp = parseFloat(bp.price);
        return {
          id: bp.id,
          title: bp.name,
          price: isNaN(price) ? 0 : price,
          mrp: isNaN(mrp) ? price : mrp,
          rating: 4.0,
          images: bp.images || [],
          badge: bp.badge,
        };
      });
  }, [allProducts, wishlistIds]);

  const handleMouseEnter = (id: string, images: string[]) => {
    if (images.length <= 1) return;
    setHoveredId(id);
    setImageIndices((prev) => ({ ...prev, [id]: 0 }));
    if (intervalsRef.current[id]) {
      window.clearInterval(intervalsRef.current[id]);
    }
    const interval = window.setInterval(() => {
      setImageIndices((prev) => {
        const current = prev[id] || 0;
        const next = (current + 1) % images.length;
        return { ...prev, [id]: next };
      });
    }, 1800);
    intervalsRef.current[id] = interval;
  };

  const handleMouseLeave = (id: string) => {
    setHoveredId(null);
    setImageIndices((prev) => ({ ...prev, [id]: 0 }));
    if (intervalsRef.current[id]) {
      window.clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
  };

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach((interval) => {
        window.clearInterval(interval);
      });
    };
  }, []);

  const confirmRemove = () => {
    if (!confirmRemoveId) return;
    removeFromWishlist(confirmRemoveId);
    setConfirmRemoveId(null);
  };

  const discountPercent = (product: WishlistProduct) => {
    if (product.mrp <= 0) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  };

  const productToRemove = wishlistedProducts.find((p) => p.id === confirmRemoveId);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - inspired by home page */}
      <div className="bg-gray-950 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
              <Heart size={26} className="text-rose-500" fill="currentColor" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">Your Wishlist</h1>
            <p className="mt-3 text-base text-white/80">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"} saved for later
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">Loading your wishlist...</p>
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <Heart size={32} className="text-gray-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">No products wishlisted yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product. They will appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-rose-800 px-8 py-3 font-semibold text-white transition hover:bg-rose-900"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-rose-700"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {wishlistedProducts.map((product, index) => {
                  const isHovered = hoveredId === product.id;
                  const currentImageIndex = imageIndices[product.id] || 0;
                  const discount = discountPercent(product);
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -22, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:border-amber-400 hover:shadow-product-glow"
                    >
                      {/* Product Card - same as ProductCard */}
                      <div
                        className="traditional-frame relative m-3 aspect-[4/5] overflow-hidden rounded-xl"
                        onMouseEnter={() => handleMouseEnter(product.id, product.images)}
                        onMouseLeave={() => handleMouseLeave(product.id)}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            className="absolute inset-0"
                            key={product.images[currentImageIndex] || product.images[0]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <img
                              src={product.images?.[currentImageIndex] || product.images?.[0] || ""}
                              alt={product.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </motion.div>
                        </AnimatePresence>

                        {product.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">
                            {product.badge}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                            {discount}% OFF
                          </span>
                        )}
                        <button
                          onClick={() => setConfirmRemoveId(product.id)}
                          className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-rose-600 transition hover:bg-white"
                          type="button"
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="p-4 pt-1">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 min-h-11 text-base font-semibold text-gray-950">{product.title}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                            <Star size={13} fill="currentColor" />
                            {product.rating.toFixed(1)}
                          </span>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-lg font-bold text-rose-700">Rs {product.price.toLocaleString("en-IN")}</span>
                          {product.mrp > product.price && (
                            <span className="text-sm text-gray-400 line-through">Rs {product.mrp.toLocaleString("en-IN")}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/shop`}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors duration-200 hover:bg-amber-50"
                          >
                            <ShoppingBag size={16} />
                            View
                          </Link>
                          <button
                            onClick={() => setConfirmRemoveId(product.id)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-rose-50"
                            type="button"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmRemoveId && productToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmRemoveId(null)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">Remove from Wishlist?</h3>
                  <p className="text-sm text-gray-500">This action can be undone later</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 mb-6">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={productToRemove.images?.[0] || ""}
                    alt={productToRemove.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{productToRemove.title}</p>
                  <p className="text-sm font-bold text-rose-700">Rs {productToRemove.price.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 rounded-xl bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-900"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
