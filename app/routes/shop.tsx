import { useEffect, useMemo, useState } from "react";

interface Product {
  id: number;
  name: string;
  category: "men" | "women" | "boys" | "girls" | "young-adults" | "seniors";
  subcategory: string;
  price: number;
  originalPrice: number;
  sizes: string[];
  colors: string[];
  description: string;
  image: string;
  badge?: string;
}

interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

interface AdminProduct {
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
  badge?: string;
}

const CATEGORIES = [
  { key: "all", label: "All Collections" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "boys", label: "Boys" },
  { key: "girls", label: "Girls" },
  { key: "young-adults", label: "Young Adults" },
  { key: "seniors", label: "Seniors" },
] as const;

const BUSINESS_PHONE = "7778040747";

function mapGenderToCategory(gender: string, ageGroup: string, category: string): Product["category"] {
  if (gender === "Men") return "men";
  if (gender === "Women") return "women";
  if (gender === "Unisex") {
    if (ageGroup === "Children") return category.toLowerCase().includes("kids") || category === "Kids Wear" ? "boys" : "girls";
    if (ageGroup === "Young Adults") return "young-adults";
    if (ageGroup === "Adults") return "men";
    return "seniors";
  }
  return "men";
}

function transformAdminProduct(ap: AdminProduct, index: number): Product {
  const price = parseFloat(ap.discountPrice || ap.price);
  const originalPrice = parseFloat(ap.price);
  const sizes = Array.from(new Set(ap.variants.map(v => v.size)));
  const colorNames = Array.from(new Set(ap.variants.map(v => v.color)));
  const image = ap.images && ap.images.length > 0 ? ap.images[0] : `https://placehold.co/400x500/f3f4f6/111?text=${encodeURIComponent(ap.name)}`;

  return {
    id: index + 1,
    name: ap.name,
    category: mapGenderToCategory(ap.gender, ap.ageGroup, ap.category),
    subcategory: ap.category,
    price: isNaN(price) ? 0 : price,
    originalPrice: isNaN(originalPrice) ? price : originalPrice,
    sizes: sizes.length > 0 ? sizes : ["M"],
    colors: colorNames.length > 0 ? colorNames : ["Default"],
    description: ap.description,
    image,
    badge: ap.badge,
  };
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState("");
  const [modalColor, setModalColor] = useState("");
  const [modalQty, setModalQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({ name: "", phone: "", address: "" });
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("femiknit_cart");
      if (saved) setCart(JSON.parse(saved));
      const savedCust = localStorage.getItem("femiknit_customer");
      if (savedCust) setCustomer(JSON.parse(savedCust));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("femiknit_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("femiknit_customer", JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          const transformed = data.map((ap: AdminProduct, idx: number) => transformAdminProduct(ap, idx));
          setProducts(transformed);
        }
      } catch {
        setToast("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, products]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, size: string, color: string, qty: number) => {
    if (!size || !color) {
      setToast("Please select size & color");
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.selectedSize === size && i.selectedColor === color
      );
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.selectedSize === size && i.selectedColor === color
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...product, selectedSize: size, selectedColor: color, quantity: qty }];
    });
    setToast(`Added ${product.name} to cart`);
    setSelectedProduct(null);
  };

  const removeFromCart = (id: number, size: string, color: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.selectedSize === size && i.selectedColor === color)));
  };

  const updateQty = (id: number, size: string, color: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id === id && i.selectedSize === size && i.selectedColor === color) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const handleBuyNow = () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setToast("Please fill all contact details");
      return;
    }
    if (cart.length === 0) {
      setToast("Your cart is empty");
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const confirmCheckout = () => {
    let msg = `*New Order - Femiknit Pro*%0A%0A`;
    msg += `*Customer Name:* ${customer.name}%0A`;
    msg += `*Phone:* ${customer.phone}%0A`;
    msg += `*Address:* ${customer.address}%0A%0A`;
    msg += `*Order Items:*%0A`;
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name}%0A`;
      msg += `   Size: ${item.selectedSize}, Color: ${item.selectedColor}, Qty: ${item.quantity}%0A`;
      msg += `   Price: ₹${item.price * item.quantity}%0A%0A`;
    });
    msg += `*Grand Total: ₹${cartTotal}*%0A%0A`;
    msg += `Please confirm this order. Thank you!`;

    const cleanMsg = `*New Order - Femiknit Pro*\n\n*Customer Name:* ${customer.name}\n*Phone:* ${customer.phone}\n*Address:* ${customer.address}\n\n*Order Items:*\n${cart.map((item, idx) => `${idx + 1}. ${item.name}\n   Size: ${item.selectedSize}, Color: ${item.selectedColor}, Qty: ${item.quantity}\n   Price: ₹${item.price * item.quantity}`).join("\n\n")}\n\n*Grand Total: ₹${cartTotal}*\n\nPlease confirm this order. Thank you!`;

    window.open(`https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(cleanMsg)}`, "_blank");
    setShowCheckoutConfirm(false);
    setCart([]);
    setToast("Redirecting to WhatsApp...");
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setModalSize(product.sizes[0]);
    setModalColor(product.colors[0]);
    setModalQty(1);
  };

  return (
    <>
      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        :root {
          --bg: #ffffff;
          --text: #111111;
          --muted: #6b7280;
          --red: #dc2626;
          --red-dark: #b91c1c;
          --yellow: #fbbf24;
          --yellow-dark: #f59e0b;
          --border: #e5e7eb;
          --radius: 12px;
          --shadow: 0 4px 20px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 40px rgba(0,0,0,0.12);
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--text)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>FP</div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Femiknit Pro</span>
          </div>

          <div style={{ flex: 1, maxWidth: 400, position: "relative", display: "none" }} className="search-desktop">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{
                width: "100%", padding: "10px 16px 10px 40px", borderRadius: 999,
                border: "1px solid var(--border)", background: "#f9fafb", fontSize: 14, outline: "none",
              }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6 5 3H2"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 700,
                width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center",
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        background: "linear-gradient(135deg, #111 0%, #374151 100%)",
        color: "#fff", padding: "80px 24px", textAlign: "center",
      }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px" }}>
          Style for <span style={{ color: "var(--yellow)" }}>Every Age</span>
        </h1>
        <p style={{ fontSize: 18, color: "#d1d5db", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Premium clothing collections for Men, Women, Kids, Young Adults & Seniors. Quality fabric, modern designs, unbeatable comfort.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ background: "var(--red)", padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>Free Shipping</span>
          <span style={{ background: "var(--yellow)", color: "#111", padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>Cash on Delivery</span>
          <span style={{ background: "rgba(255,255,255,0.15)", padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>Easy Returns</span>
        </div>
      </section>

      {/* ─── CATEGORY FILTER ─── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                whiteSpace: "nowrap", padding: "10px 22px", borderRadius: 999, border: "1.5px solid",
                borderColor: activeCategory === cat.key ? "var(--text)" : "var(--border)",
                background: activeCategory === cat.key ? "var(--text)" : "#fff",
                color: activeCategory === cat.key ? "#fff" : "var(--text)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ─── PRODUCTS GRID ─── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
            <p style={{ fontSize: 18 }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
            <p style={{ fontSize: 18 }}>No products found.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => openProductModal(product)}
                style={{
                  background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)",
                  overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "var(--shadow)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow)"; }}
              >
                <div style={{ position: "relative", aspectRatio: "4/5", background: "#f3f4f6", overflow: "hidden" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  {product.badge && (
                    <span style={{
                      position: "absolute", top: 12, left: 12,
                      background: product.badge === "Sale" ? "var(--red)" : product.badge === "New" ? "var(--yellow)" : "var(--text)",
                      color: product.badge === "New" ? "#111" : "#fff",
                      fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                    }}>{product.badge}</span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>{product.subcategory}</p>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.4 }}>{product.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--red)" }}>₹{product.price}</span>
                    <span style={{ fontSize: 13, color: "var(--muted)", textDecoration: "line-through" }}>₹{product.originalPrice}</span>
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── PRODUCT MODAL ─── */}
      {selectedProduct && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setSelectedProduct(null)}>
          <div
            style={{
              background: "#fff", borderRadius: "var(--radius)", maxWidth: 720, width: "100%",
              maxHeight: "90vh", overflow: "auto", display: "flex", flexDirection: "column",
              boxShadow: "var(--shadow-lg)", animation: "modalIn 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) }`}</style>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 280px", background: "#f3f4f6", minHeight: 300 }}>
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: "1 1 300px", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px" }}>{selectedProduct.subcategory}</p>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{selectedProduct.name}</h2>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "var(--red)" }}>₹{selectedProduct.price}</span>
                  <span style={{ fontSize: 15, color: "var(--muted)", textDecoration: "line-through" }}>₹{selectedProduct.originalPrice}</span>
                  <span style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: 4, fontWeight: 700 }}>
                    {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                  </span>
                </div>

                <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>{selectedProduct.description}</p>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Select Size</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setModalSize(s)}
                        style={{
                          padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
                          borderColor: modalSize === s ? "var(--text)" : "var(--border)",
                          background: modalSize === s ? "var(--text)" : "#fff",
                          color: modalSize === s ? "#fff" : "var(--text)",
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Select Color</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setModalColor(c)}
                        style={{
                          padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
                          borderColor: modalColor === c ? "var(--text)" : "var(--border)",
                          background: modalColor === c ? "var(--text)" : "#fff",
                          color: modalColor === c ? "#fff" : "var(--text)",
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ padding: "8px 14px", background: "#f9fafb", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>−</button>
                    <span style={{ padding: "0 18px", fontSize: 15, fontWeight: 700 }}>{modalQty}</span>
                    <button onClick={() => setModalQty(modalQty + 1)} style={{ padding: "8px 14px", background: "#f9fafb", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
                  </div>
                  <button
                    onClick={() => addToCart(selectedProduct, modalSize, modalColor, modalQty)}
                    style={{
                      flex: 1, padding: "12px 24px", borderRadius: 8, border: "none",
                      background: "var(--text)", color: "#fff", fontSize: 15, fontWeight: 700,
                      cursor: "pointer", transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--red)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--text)"}
                  >Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CART SIDEBAR ─── */}
      {isCartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsCartOpen(false)} />
          <div style={{
            position: "relative", width: "100%", maxWidth: 460, height: "100%",
            background: "#fff", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
            animation: "slideIn 0.3s ease",
          }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) }`}</style>

            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Your Cart ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
                    <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6 5 3H2"/>
                  </svg>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>Your cart is empty</p>
                  <p style={{ fontSize: 13 }}>Add some stylish items to get started!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} style={{ display: "flex", gap: 14, padding: 14, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <img src={item.image} alt={item.name} style={{ width: 64, height: 80, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h4>
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>{item.selectedSize} • {item.selectedColor}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
                            <button onClick={() => updateQty(item.id, item.selectedSize, item.selectedColor, -1)} style={{ padding: "4px 10px", background: "#f9fafb", border: "none", cursor: "pointer", fontSize: 14 }}>−</button>
                            <span style={{ padding: "0 12px", fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.selectedSize, item.selectedColor, 1)} style={{ padding: "4px 10px", background: "#f9fafb", border: "none", cursor: "pointer", fontSize: 14 }}>+</button>
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--red)" }}>₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, alignSelf: "flex-start" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "16px 24px 24px", borderTop: "1px solid var(--border)", background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Grand Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "var(--red)" }}>₹{cartTotal}</span>
                </div>
                <button
                  onClick={handleBuyNow}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 8, border: "none",
                    background: "var(--red)", color: "#fff", fontSize: 16, fontWeight: 700,
                    cursor: "pointer", transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--red-dark)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--red)"}
                >Buy Now via WhatsApp</button>
                <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", margin: "10px 0 0" }}>Cash on Delivery • Free Returns</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CHECKOUT CONFIRMATION MODAL ─── */}
      {showCheckoutConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowCheckoutConfirm(false)}>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", maxWidth: 480, width: "100%", padding: 28, boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Confirm Your Order</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>Review your details before sending via WhatsApp.</p>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, margin: "0 0 4px" }}><strong>Name:</strong> {customer.name}</p>
              <p style={{ fontSize: 13, margin: "0 0 4px" }}><strong>Phone:</strong> {customer.phone}</p>
              <p style={{ fontSize: 13, margin: 0 }}><strong>Address:</strong> {customer.address}</p>
            </div>

            <div style={{ maxHeight: 160, overflow: "auto", marginBottom: 20 }}>
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span>{idx + 1}. {item.name} ({item.selectedSize}, {item.selectedColor}) x{item.quantity}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 15, fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: "var(--red)" }}>₹{cartTotal}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={confirmCheckout}
                style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: "var(--red)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >Yes, Send Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 120,
          background: "var(--text)", color: "#fff", padding: "12px 24px", borderRadius: 999,
          fontSize: 14, fontWeight: 600, boxShadow: "var(--shadow-lg)", animation: "toastUp 0.3s ease",
        }}>
          <style>{`@keyframes toastUp { from { opacity:0; transform: translate(-50%, 20px) } to { opacity:1; transform: translate(-50%, 0) }`}</style>
          {toast}
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#111", color: "#9ca3af", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, margin: 0 }}>© 2026 Femiknit Pro. All rights reserved.</p>
        <p style={{ fontSize: 12, margin: "8px 0 0" }}>Premium Clothing for Men, Women, Kids & Seniors</p>
      </footer>
    </>
  );
}
