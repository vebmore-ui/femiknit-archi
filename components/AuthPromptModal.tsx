import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { Link } from "@remix-run/react";

export function AuthPromptModal() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"wishlist" | "cart">("wishlist");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.source === "cart" || detail?.source === "wishlist") {
        setSource(detail.source);
        setOpen(true);
      }
    };
    window.addEventListener("open-auth-modal", handler as EventListener);
    return () => window.removeEventListener("open-auth-modal", handler as EventListener);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-rose-700 dark:text-amber-400">
                {source === "wishlist" ? <Heart size={24} /> : <ShoppingBag size={24} />}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  {source === "wishlist" ? "Save Your Favorites" : "Start Shopping"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {source === "wishlist"
                    ? "Sign in to save items to your wishlist."
                    : "Sign in to add items to your cart."}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
              Please sign in or create an account to {source === "wishlist" ? "save your favorite items and access them anytime" : "proceed with your purchase and enjoy a seamless checkout experience"}.
            </p>

            <div className="flex gap-3">
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-rose-800 dark:bg-rose-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-rose-900 dark:hover:bg-rose-600"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
