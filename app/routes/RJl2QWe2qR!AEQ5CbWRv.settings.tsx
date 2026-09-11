import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Save,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  RefreshCw
} from "lucide-react";
import styles from "../admin/settings/page.module.css";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15, ease: "easeIn" } }
};

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  status: string;
  image: string;
  link: string;
};

export default function SettingsAndConfigurations() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newCta, setNewCta] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch {
      showToast("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          subtitle: newSubtitle,
          badge: newBadge,
          cta: newCta,
          link: newLink || "/",
          status: newStatus,
          image: "default-banner.jpg"
        })
      });
      if (res.ok) {
        const created = await res.json();
        setBanners([created, ...banners]);
        setNewTitle("");
        setNewSubtitle("");
        setNewBadge("");
        setNewCta("");
        setNewLink("");
        setIsModalOpen(false);
        showToast("New promotional banner added.");
      } else {
        showToast("Failed to add banner");
      }
    } catch {
      showToast("Network error. Please try again.");
    }
  };

  const removeBanner = async (id: string) => {
    try {
      const res = await fetch("/api/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
        showToast("Banner deleted successfully.");
      } else {
        showToast("Failed to delete banner");
      }
    } catch {
      showToast("Network error. Please try again.");
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    showToast("All global settings updated successfully.");
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className={styles.container}>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={styles.toast}
          >
            <CheckCircle2 size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings & Configurations</h1>
          <p className={styles.subtitle}>Manage website marketing banners, global delivery rules, and taxes.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className={`${styles.btnPrimary} ${isSaved ? styles.btnSuccess : ''}`}
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? "Saved Successfully" : "Save Changes"}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ width: "100%" }}
      >

        {/* --- SECTION 1: BANNERS & OFFERS --- */}
        <motion.div variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <ImageIcon size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Banners & Offers</h2>
            <button onClick={loadBanners} className={styles.btnSecondary} style={{ marginLeft: 'auto' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className={styles.card}>

            {/* Add New Banner */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className={styles.label} style={{ margin: 0 }}>Promotional Banners</label>
                <button onClick={() => setIsModalOpen(true)} className={styles.btnSm}>
                  <Plus size={15} /> Add Banner
                </button>
              </div>
              <div
                className={styles.uploadArea}
                onClick={() => setIsModalOpen(true)}
              >
                <div className={styles.uploadIcon}>
                  <Plus size={22} />
                </div>
                <p className={styles.uploadText}>Click to add a new promotional banner</p>
                <p className={styles.uploadHint}>Configure title, route link, and status.</p>
              </div>
            </div>

            {/* Active Banners List */}
            <div>
              <h3 className={styles.bannerSectionTitle}>Active Banner List</h3>
              <div className={styles.bannerList}>
                <AnimatePresence>
                  {banners.map((banner) => (
                    <motion.div
                      key={banner.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={styles.bannerItem}
                    >
                      <div className={styles.bannerInfo}>
                        <div className={styles.bannerThumb}>
                          <ImageIcon size={16} />
                        </div>
                        <div>
                          <p className={styles.bannerName}>{banner.title}</p>
                          <div className={styles.bannerMeta}>
                            <span className={`${styles.statusDot} ${banner.status === 'Active' ? styles.statusActive : styles.statusInactive}`}></span>
                            <span className={styles.statusText}>{banner.status}</span>
                            <span className={styles.bannerLink}>• {banner.link}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBanner(banner.id)}
                        className={styles.btnIconDanger}
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading ? (
                  <p className={styles.emptyState}>Loading banners...</p>
                ) : banners.length === 0 && (
                  <p className={styles.emptyState}>No active banners configured.</p>
                )}
              </div>
            </div>

          </div>
        </motion.div>

      </motion.div>

      {/* Add Banner Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={styles.modalContent}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h3 className={styles.modalTitle}>Add Promotional Banner</h3>
                  <p className={styles.modalSubtitle}>Configure storefront hero banner details.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddBanner}>
                <div className={styles.modalBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Banner Title</label>
                    <input
                      type="text"
                      placeholder="e.g. New festive edits"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className={styles.modalInput}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Breathable cottons, fine motifs, and sizes for youth, adults, and elders."
                      value={newSubtitle}
                      onChange={(e) => setNewSubtitle(e.target.value)}
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Up to 35% off"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop Now"
                      value={newCta}
                      onChange={(e) => setNewCta(e.target.value)}
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Destination Route / Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /collections/summer"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Initial Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className={styles.modalInput}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnConfirm}>
                    Save Banner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
