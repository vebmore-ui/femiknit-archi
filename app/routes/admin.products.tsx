
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  Tag,
  Check,
  Filter,
  AlertTriangle,
  Image as ImageIcon,
  Package,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import styles from "../admin/products/page.module.css";

interface Variant {
  id: number;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  gender: string;
  ageGroup: string;
  category: string;
  status: string;
  variants: Variant[];
  images: string[];
  subcategory?: string;
  badge?: string;
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

export default function ProductManagement() {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {}
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        const errText = await res.text();
        console.error("Failed to load products - HTTP", res.status, errText);
        showToast("Failed to load products: " + res.status);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Unexpected products response:", data);
        showToast("Failed to load products: invalid response");
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("Failed to load products. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleImageSelect = async (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.");
      return;
    }
    const base64 = await fileToBase64(file);
    setProductImages((prev) => {
      const next = [...prev];
      next[idx] = base64;
      return next;
    });
  };

  const removeImage = (idx: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formGender, setFormGender] = useState("Silk");
  const [formCategory, setFormCategory] = useState("Kurtis");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productVariants, setProductVariants] = useState<Variant[]>([
    { id: 1, size: "M", color: "Black", stock: 10 }
  ]);

  const addVariantRow = () => {
    setProductVariants([...productVariants, { id: Date.now(), size: "S", color: "", stock: 10 }]);
  };

  const removeVariantRow = (idToRemove: number) => {
    if (productVariants.length === 1) {
      showToast("Products must have at least one variant configuration.");
      return;
    }
    setProductVariants(productVariants.filter(v => v.id !== idToRemove));
  };

  const handleVariantChange = (id: number, field: keyof Variant, value: string | number) => {
    setProductVariants(productVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormDiscount("");
    setFormGender("Silk");
    setFormCategory("Kurtis");
    setProductImages([]);
    setProductVariants([{ id: 1, size: "M", color: "Black", stock: 10 }]);
    setIsAddingMode(true);
  };

  const handleOpenEdit = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Edit Product",
      description: `You are about to edit "${product.name}". Do you want to continue?`,
      onConfirm: () => {
        setIsEditing(true);
        setCurrentEditId(product.id);
        setFormName(product.name);
        setFormDesc(product.description);
        setFormPrice(product.price);
        setFormDiscount(product.discountPrice);
        setFormGender(product.gender);
        setFormCategory(product.category || "Kurtis");
        setProductImages(product.images || []);
        setProductVariants(product.variants.length > 0 ? [...product.variants] : [{ id: 1, size: "M", color: "Default", stock: 5 }]);
        setIsAddingMode(true);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const promptDeleteProduct = async (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      description: `Are you sure you want to remove "${name}" from your store? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await fetch(`/api/products/${id}`, { method: "DELETE" });
          setProducts(products.filter(p => p.id !== id));
          showToast("Product deleted successfully.");
        } catch {
          showToast("Failed to delete product");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      showToast("Please fill in all mandatory fields.");
      return;
    }

    const totalStock = productVariants.reduce((acc, curr) => acc + Number(curr.stock || 0), 0);
    let calculatedStatus = "High Stock";
    if (totalStock <= 5) calculatedStatus = "Low Stock";
    else if (totalStock <= 20) calculatedStatus = "Medium Stock";
    else calculatedStatus = "High Stock";

    const payload = {
      name: formName,
      description: formDesc,
      price: formPrice,
      discountPrice: formDiscount,
      gender: formGender,
      category: formCategory,
      status: calculatedStatus,
      variants: productVariants,
      images: productImages.length > 0 ? productImages : ["https://placehold.co/400x500/f3f4f6/111?text=" + encodeURIComponent(formName)]
    };

    try {
      if (isEditing && currentEditId) {
        const res = await fetch(`/api/products/${currentEditId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(products.map(p => p.id === currentEditId ? updated : p));
          showToast("Product updated successfully!");
          await loadProducts();
        } else {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("Update failed:", err);
          showToast("Failed to update product: " + (err.error || "Server error"));
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      if (res.ok) {
        const created = await res.json();
        setProducts([created, ...products]);
        showToast("New product added successfully!");
        await loadProducts();
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Create failed:", err);
        showToast("Failed: " + (err.error || "Server error"));
      }
      }
      setIsAddingMode(false);
    } catch (err) {
      console.error("Network/save error:", err);
      showToast("Network error. Please try again.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.status === "Low Stock").length,
    mediumStock: products.filter(p => p.status === "Medium Stock").length,
    highStock: products.filter(p => p.status === "High Stock").length,
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification Bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={styles.toast}
          >
            <Check size={16} color="#10b981" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className={styles.modalBackdrop}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={styles.modalCard}
            >
              <div className={styles.modalIconWrapper}>
                <AlertTriangle size={22} color="#d97706" />
              </div>
              <h3 className={styles.modalTitle}>{confirmModal.title}</h3>
              <p className={styles.modalDesc}>{confirmModal.description}</p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnDangerPrimary}
                  onClick={confirmModal.onConfirm}
                >
                  Yes, Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* --- VIEW 1: PRODUCT LIST --- */}
        {!isAddingMode && (
          <motion.div
            key="list-view"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Products Catalog</h1>
                <p className={styles.subtitle}>Manage your store inventory, variants, and product details.</p>
              </div>
              <button onClick={handleOpenAdd} className={styles.btnPrimary}>
                <Plus size={18} />
                Add New Product
              </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Package size={20} color="#e63946" /></div>
                <div>
                  <p className={styles.statValue}>{stats.total}</p>
                  <p className={styles.statLabel}>Total Products</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><AlertTriangle size={20} color="#f59e0b" /></div>
                <div>
                  <p className={styles.statValue}>{stats.lowStock}</p>
                  <p className={styles.statLabel}>Low Stock</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Tag size={20} color="#2563eb" /></div>
                <div>
                  <p className={styles.statValue}>{stats.mediumStock}</p>
                  <p className={styles.statLabel}>Medium Stock</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><CheckCircle2 size={20} color="#059669" /></div>
                <div>
                  <p className={styles.statValue}>{stats.highStock}</p>
                  <p className={styles.statLabel}>High Stock</p>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className={styles.filterToolbar}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Search by product name, ID, or category..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

               <div className={styles.filterGroup}>
                 <div className={styles.filterSelectWrapper}>
                   <Filter size={14} color="#64748b" />
                    <select
                      className={styles.filterSelect}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Medium Stock">Medium Stock</option>
                      <option value="High Stock">High Stock</option>
                    </select>
                 </div>
               </div>
            </div>

            {/* Products Grid */}
            <div className={styles.card}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} color="#cbd5e1" />
                  <h3 className={styles.emptyTitle}>No products found</h3>
                  <p className={styles.emptyDesc}>Try adjusting your search or filters, or add a new product.</p>
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className={styles.productImage} />
                        ) : (
                          <div className={styles.productImagePlaceholder}>
                            <ImageIcon size={32} color="#94a3b8" />
                          </div>
                        )}
                        <span className={`${styles.statusBadge} ${
                          product.status === 'Low Stock' ? styles.statusWarning :
                          product.status === 'Medium Stock' ? styles.statusMedium :
                          styles.statusSuccess
                        }`}>
                          {product.status}
                        </span>
                      </div>

                      <div className={styles.productInfo}>
                        <div className={styles.productHeader}>
                          <h3 className={styles.productName}>{product.name}</h3>
                          <span className={styles.productId}>{product.id}</span>
                        </div>

                        <p className={styles.productDesc}>
                          {product.description && product.description.length > 80
                            ? product.description.substring(0, 80) + "..."
                            : product.description || "No description"}
                        </p>

                        <div className={styles.productMeta}>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Fabric</span>
                            <span className={styles.metaValue}>{product.gender}</span>
                          </div>
                        </div>

                        <div className={styles.priceRow}>
                          <div className={styles.priceBlock}>
                            <span className={styles.priceLabel}>Price</span>
                            <span className={styles.priceValue}>₹{product.price}</span>
                          </div>
                          {product.discountPrice && (
                            <div className={styles.priceBlock}>
                              <span className={styles.priceLabel}>Discount</span>
                              <span className={styles.priceDiscount}>₹{product.discountPrice}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.variantSummary}>
                          <span className={styles.variantLabel}>Variants:</span>
                          {product.variants.slice(0, 3).map((v, idx) => (
                            <span key={v.id} className={styles.variantChip}>
                              {v.size} | {v.color} ({v.stock})
                            </span>
                          ))}
                          {product.variants.length > 3 && (
                            <span className={styles.variantMore}>+{product.variants.length - 3} more</span>
                          )}
                        </div>

                        <div className={styles.cardActions}>
                          <button className={styles.btnEdit} onClick={() => handleOpenEdit(product)}>
                            <Edit size={16} />
                            Edit
                          </button>
                          <button className={styles.btnDelete} onClick={() => promptDeleteProduct(product.id, product.name)}>
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- VIEW 2: ADD/EDIT FORM --- */}
        {isAddingMode && (
          <motion.div
            key="add-view"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <form onSubmit={handleSaveProduct}>
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <button
                    type="button"
                    onClick={() => setIsAddingMode(false)}
                    className={styles.backBtn}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h1 className={styles.title}>{isEditing ? "Edit Product" : "Add New Product"}</h1>
                    <p className={styles.subtitle}>Fill in the details below to {isEditing ? "update" : "create"} your product.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsAddingMode(false)} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {isEditing ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </div>

              <div className={styles.formGrid}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Basic Info */}
                  <div className={`${styles.card} ${styles.cardPadding}`}>
                    <h2 className={styles.cardTitle}>Basic Information</h2>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Blue Silk Kurta"
                        className={styles.input}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Description</label>
                      <textarea
                        placeholder="Describe fabric material, styling details, and fit type..."
                        className={styles.textarea}
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                      ></textarea>
                    </div>

                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Base Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          className={styles.input}
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Sale / Discount Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className={styles.input}
                          value={formDiscount}
                          onChange={(e) => setFormDiscount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className={`${styles.card} ${styles.cardPadding}`}>
                    <h2 className={styles.cardTitle}>Product Images (Max 3)</h2>
                    <p className={styles.uploadHint}>Select up to 4 images from your device.</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px' }}>
                          <div
                            onClick={() => fileInputRefs[idx].current?.click()}
                            style={{
                              width: '120px',
                              height: '120px',
                              borderRadius: '12px',
                              border: '2px dashed #d1d5db',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              position: 'relative',
                              background: '#f9fafb'
                            }}
                          >
                            {productImages[idx] ? (
                              <img src={productImages[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '0.5rem' }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>+</div>
                                <div style={{ fontSize: '11px' }}>Image {idx + 1}</div>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRefs[idx]}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect(idx, file);
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              type="button"
                              onClick={() => fileInputRefs[idx].current?.click()}
                              style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: '#374151'
                              }}
                            >
                              {productImages[idx] ? 'Change' : 'Select'}
                            </button>
                            {productImages[idx] && (
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecaca',
                                  background: '#fef2f2',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  color: '#dc2626'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants */}
                  <div className={`${styles.card} ${styles.cardPadding}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 className={styles.cardTitle} style={{ margin: 0 }}>Inventory Variants</h2>
                      <button type="button" onClick={addVariantRow} className={styles.linkButton}>
                        <Plus size={14} /> Add Variant
                      </button>
                    </div>

                    <div>
                      <div className={styles.variantHeader}>
                        <div>Size</div>
                        <div>Color</div>
                        <div>Stock</div>
                        <div></div>
                      </div>
                      <div className={styles.variantListContainer}>
                        {productVariants.map((variant) => (
                          <div key={variant.id} className={styles.variantGrid}>
                            <select
                              className={styles.select}
                              value={variant.size}
                              onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Black"
                              className={styles.input}
                              value={variant.color}
                              onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                            />
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="Qty"
                              className={styles.input}
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => removeVariantRow(variant.id)}
                                className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                title="Remove variant"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Taxonomy */}
                <div>
                   <div className={`${styles.card} ${styles.cardPadding}`}>
                     <h2 className={styles.cardTitle}><Tag size={18} color="#64748b" /> Catalog Taxonomy</h2>

                     <div className={styles.inputGroup}>
                       <label className={styles.label}>Categories</label>
                       <select
                         className={styles.select}
                         value={formGender}
                         onChange={(e) => setFormGender(e.target.value)}
                       >
                         <option value="Silk">Silk</option>
                         <option value="Cotton">Cotton</option>
                         <option value="Khadi">Khadi</option>
                         <option value="Mulmul">Mulmul</option>
                         <option value="Organza">Organza</option>
                         <option value="Chanderi">Chanderi</option>
                         <option value="Mangalagiri">Mangalagiri</option>
                         <option value="Kantha Stitch">Kantha Stitch</option>
                         <option value="Chikankari Stitch">Chikankari Stitch</option>
                         <option value="Kani Pashmina">Kani Pashmina</option>
                         <option value="Kalakshetra">Kalakshetra</option>
                         <option value="Baluchari">Baluchari</option>
                         <option value="Gorod">Gorod</option>
                         <option value="Banarasi">Banarasi</option>
                         <option value="Georgette">Georgette</option>
                         <option value="Chiffon">Chiffon</option>
                         <option value="Ajrakh">Ajrakh</option>
                         <option value="Sequi">Sequi</option>
                       </select>
                     </div>
                   </div>

                  <div className={`${styles.card} ${styles.cardPadding}`} style={{ marginTop: '1.25rem' }}>
                    <h2 className={styles.cardTitle}>Quick Tips</h2>
                    <ul className={styles.tipList}>
                      <li>Select the correct <strong>Categories</strong> for accurate cataloging</li>
                      <li>Add at least one variant with size, color, and stock</li>
                      <li>Upload up to 3 product images</li>
                      <li>Use descriptive product names for better search visibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
