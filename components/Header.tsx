import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, X } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

const navItems = ["Sarees", "Kurtis", "Kurtas", "Kids Wear", "New Arrivals", "Festive Collection", "Sale"];

export function Header() {
  const { wishlistCount, wishlistToast, cartToast } = useStore();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 lg:hidden"
                type="button"
                aria-label="Open navigation"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={20} />
              </button>

              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Femiknit" className="h-16 w-24 object-contain sm:h-20 sm:w-32" />
              </Link>
            </div>

            {/* Centered Search */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
              <div className="flex w-full max-w-lg items-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 shadow-sm">
                <Search size={20} className="text-gray-400 dark:text-slate-400" />
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-gray-400 dark:placeholder:text-slate-400 text-gray-900 dark:text-white"
                  placeholder="Search sarees, kurtis..."
                  aria-label="Search products"
                />
                <button className="text-sm font-semibold text-rose-700 dark:text-rose-400" type="button">
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {loading ? (
                <div className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse" />
              ) : user ? (
                <Link to="/account" className="hidden sm:inline-flex items-center gap-2.5 rounded-full bg-rose-800 dark:bg-rose-700 pl-1 pr-4 py-1 text-sm font-semibold text-white transition hover:bg-rose-900 dark:hover:bg-rose-600">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold uppercase">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name || "User"} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span>{(user.name || user.email || "U")[0]}</span>
                    )}
                  </span>
                  {user.name || "Account"}
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:inline-flex items-center rounded-full bg-rose-800 dark:bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-900 dark:hover:bg-rose-600">
                  Login
                </Link>
              )}
              {user && (
                <Link to="/wishlist" className="hidden sm:inline-flex items-center gap-2 rounded-full border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-900/40">
                  <Heart size={18} fill="currentColor" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-rose-800 dark:bg-rose-700 px-1.5 py-0.5 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              {!user && !loading && (
                <Link to="/signup" className="hidden sm:inline-flex items-center rounded-full bg-rose-800 dark:bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-900 dark:hover:bg-rose-600">
                  Sign up
                </Link>
              )}
            </div>

            {/* Mobile Search */}
            <div className="mt-3 flex items-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 shadow-sm md:hidden">
              <Search size={18} className="text-gray-400 dark:text-slate-400" />
              <input
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-slate-400 text-gray-900 dark:text-white"
                placeholder="Search collection"
                aria-label="Search products"
              />
              <button className="text-sm font-semibold text-rose-700 dark:text-rose-400" type="button">
                Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Wishlist Toast */}
      <AnimatePresence>
        {wishlistToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 rounded-full bg-gray-900 dark:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
            style={{ transform: "translateX(-50%)" }}
          >
            {wishlistToast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-20 left-1/2 z-50 rounded-full bg-rose-800 dark:bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
            style={{ transform: "translateX(-50%)" }}
          >
            {cartToast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="ml-auto h-full w-80 max-w-[86vw] bg-white dark:bg-slate-900 p-5 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <img src="/images/logo.png" alt="Femiknit" className="h-16 w-24 object-contain" />
                </Link>
                <button className="rounded-full p-2 text-gray-700 dark:text-slate-200" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
                  <X size={21} />
                </button>
              </div>
              {!user && (
                <div className="mb-5 flex gap-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-full border border-gray-200 dark:border-slate-700 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-slate-200">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 rounded-full bg-rose-800 dark:bg-rose-700 py-2.5 text-center text-sm font-medium text-white">
                    Sign up
                  </Link>
                </div>
              )}
              {user && (
                <div className="mb-5">
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="flex-1 rounded-full bg-rose-800 dark:bg-rose-700 py-2.5 text-center text-sm font-medium text-white block text-center">
                    {user.name || "My Account"}
                  </Link>
                </div>
              )}
              <nav className="grid gap-3 text-base font-medium text-gray-800 dark:text-slate-200">
                {navItems.map((item) => (
                  <a href={item === "Sale" ? "#shop" : "#"} key={item} className="rounded-xl px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-rose-700 dark:hover:text-rose-400">
                    {item}
                  </a>
                ))}
              </nav>
            </motion.div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
