import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, LogOut, Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "@remix-run/react";

export default function Account() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
    const storedPhone = localStorage.getItem("femiknit_phone");
    const storedAddress = localStorage.getItem("femiknit_address");
    if (storedPhone) setPhone(storedPhone);
    if (storedAddress) setAddress(storedAddress);
  }, [user]);

  const handleSave = () => {
    localStorage.setItem("femiknit_phone", phone);
    localStorage.setItem("femiknit_address", address);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-serif text-3xl text-rose-950 dark:text-white">My Account</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">Manage your profile information</p>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-rose-800 dark:bg-rose-700 text-white flex items-center justify-center text-2xl font-bold">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user?.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <span>{(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">Required for delivery and order updates</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 pl-12 pr-4 py-3 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">Cannot be changed</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Delivery Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 resize-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">Required for all orders</p>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-800 dark:bg-rose-700 px-8 py-3 font-semibold text-white transition hover:bg-rose-900 dark:hover:bg-rose-600"
                >
                  {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {saved ? "Saved Successfully!" : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Logout Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <LogOut size={22} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sign Out</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Sign out of your Femiknit account</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-800 px-6 py-2.5 text-sm font-semibold text-red-700 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Sign Out?</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">You can always sign back in anytime.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
