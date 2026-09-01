import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, X, ChevronUp, ChevronDown, Phone, MapPin, AlertCircle } from "lucide-react";
import { Link } from "@remix-run/react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const { cartItems, cartCount, cartTotal, cartToast, removeFromCart, updateCartQuantity, clearCart } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && cartItems.length === 0) {
      setIsOpen(false);
    }
  }, [isOpen, cartItems.length]);

  const getUserPhone = () => {
    if (!user) return "";
    return localStorage.getItem("femiknit_phone") || "";
  };

  const getUserAddress = () => {
    if (!user) return "";
    return localStorage.getItem("femiknit_address") || "";
  };

  const handleCheckout = () => {
    const phone = getUserPhone();
    const address = getUserAddress();

    if (!phone || !address) {
      setShowCheckoutModal(true);
      return;
    }

    const itemsText = cartItems.map(item => `• ${item.title} (${item.size} / ${item.color}) x${item.quantity} - ₹${item.price * item.quantity}`).join("\n");
    const message = `*New Order from Femiknit*\n\n*Items:*\n${itemsText}\n\n*Total:* ₹${cartTotal.toLocaleString("en-IN")}\n\n*Phone:* ${phone}\n*Address:* ${address}`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-40 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-800 text-white">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">Your Cart</h3>
                  <p className="text-xs text-gray-500">{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-rose-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Home
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto px-5 py-3">
              {cartItems.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-2.5"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 min-w-0 flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.size} • {item.color}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.size, item.color, -1)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.size, item.color, 1)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-rose-700">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="flex-shrink-0 self-center rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Grand Total</span>
                  <span className="text-lg font-bold text-rose-700">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-xl bg-rose-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-900"
                >
                  Checkout via WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full mt-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-20 left-1/2 z-50 rounded-full bg-rose-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
            style={{ transform: "translateX(-50%)" }}
          >
            {cartToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Info Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCheckoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-rose-700">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">Complete Your Profile</h3>
                  <p className="text-sm text-gray-500">Please add your contact details to proceed with checkout</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <Phone size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                    <p className="text-xs text-gray-500">Required for delivery updates</p>
                  </div>
                  {!getUserPhone() && <span className="ml-auto text-xs font-semibold text-red-600">Missing</span>}
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                    <p className="text-xs text-gray-500">Required for order delivery</p>
                  </div>
                  {!getUserAddress() && <span className="ml-auto text-xs font-semibold text-red-600">Missing</span>}
                </div>
              </div>

              <Link
                to="/account"
                onClick={() => setShowCheckoutModal(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-900"
              >
                Go to My Account
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-rose-800 text-white shadow-lg transition hover:bg-rose-900"
        whileTap={{ scale: 0.92 }}
      >
        <ShoppingBag size={24} />
        {cartCount > 0 ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 flex flex-col items-center rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white border-2 border-white shadow-md min-w-[2.5rem]"
          >
            <span className="leading-none text-sm">{cartCount}</span>
            <span className="leading-none text-[9px] uppercase tracking-wide">items</span>
          </motion.div>
        ) : null}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </motion.div>
      </motion.button>
    </>
  );
}
