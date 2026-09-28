import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/constants";
import { useStore } from "@/context/StoreContext";

export function ProductCard({ product, index, onViewDetails }: { product: Product; index: number; onViewDetails?: () => void }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
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
    const message = `Hi, I'm interested in buying:\n\n*${product.title}*\nPrice: Rs ${product.price.toLocaleString("en-IN")}${product.mrp > product.price ? ` (MRP: Rs ${product.mrp.toLocaleString("en-IN")})` : ""}\n\nPlease confirm availability and delivery.`;
    const whatsappUrl = `https://wa.me/7541826227?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
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
              loved ? "text-rose-600" : "text-gray-600 hover:text-rose-600"
            }`}
            type="button"
            aria-label="Toggle wishlist"
            onClick={handleToggleWishlist}
          >
            <Heart size={19} fill={loved ? "currentColor" : "none"} />
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
    </>
  );
}
