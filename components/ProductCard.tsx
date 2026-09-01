import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Zap, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import type { Product } from "@/lib/constants";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

export function ProductCard({ product, index, onViewDetails }: { product: Product; index: number; onViewDetails?: () => void }) {
  const { addToCart, toggleWishlist, wishlist, cartToast } = useStore();
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const loved = wishlist.has(product.id);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!hovered) {
      setImageIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % product.images.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [hovered, product.images.length]);

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction("cart");
      setShowLoginModal(true);
      return;
    }
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0],
      size: product.size[0] || "Free Size",
      color: product.colors[0]?.name || "Default",
    }, 1);
  };

  const handleBuyNow = () => {
    if (!user) {
      setPendingAction("buy");
      setShowLoginModal(true);
      return;
    }
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0],
      size: product.size[0] || "Free Size",
      color: product.colors[0]?.name || "Default",
    }, 1);
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleToggleWishlist = () => {
    if (!user) {
      setPendingAction("cart");
      setShowLoginModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleGoBack = () => {
    setShowLoginModal(false);
    setPendingAction(null);
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    setPendingAction(null);
    window.location.href = "/signup";
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: index * 0.08 }}
        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:border-amber-400 hover:shadow-product-glow"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="traditional-frame relative m-3 aspect-[4/5] overflow-hidden rounded-xl">
          <AnimatePresence mode="wait">
            <motion.div
              className="absolute inset-0"
              key={product.images[imageIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={product.images[imageIndex]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>

          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">
            {product.badge}
          </span>
          <button
            className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition ${
              user ? (loved ? "text-rose-600" : "text-gray-600 hover:text-rose-600") : "text-gray-400 cursor-default"
            }`}
            type="button"
            aria-label="Toggle wishlist"
            onClick={handleToggleWishlist}
          >
            <Heart size={19} fill={loved && user ? "currentColor" : "none"} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
            {product.images.map((image, itemIndex) => (
              <span key={image} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60">
                <motion.span
                  className="block h-full rounded-full bg-amber-400"
                  initial={false}
                  animate={{ width: itemIndex === imageIndex ? "100%" : "0%" }}
                  transition={{ duration: itemIndex === imageIndex && hovered ? 1.0 : 0.3 }}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 pt-1">
          <h3 className="line-clamp-2 min-h-11 text-base font-semibold text-gray-950 mb-2">{product.title}</h3>

          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold text-rose-700">Rs {product.price.toLocaleString("en-IN")}</span>
            <span className="text-sm text-gray-400 line-through">Rs {product.mrp.toLocaleString("en-IN")}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 border border-amber-500 text-amber-700 hover:bg-amber-50"
                type="button"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md hover:from-rose-700 hover:to-amber-600"
                type="button"
                onClick={handleBuyNow}
              >
                <Zap size={16} />
                Buy Now
              </button>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95"
              type="button"
              onClick={onViewDetails}
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      </motion.article>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-950 mb-2">You have not logged in</h3>
              <p className="text-sm text-gray-500 mb-6">Please login or create an account to continue with your purchase.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Go Back
                </button>
                <Link
                  to="/signup"
                  className="flex-1 rounded-full bg-rose-800 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-rose-900"
                >
                  Register
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
