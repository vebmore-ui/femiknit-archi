import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, Star, ChevronDown, Filter, ShoppingBag, Zap, Eye } from "lucide-react";
import { sizes, fabricTypes } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

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

type Product = {
  id: string;
  title: string;
  category: "Sarees" | "Kurtis" | "Kids Wear";
  size: string[];
  colors: { name: string; hex: string }[];
  price: number;
  mrp: number;
  rating: number;
  ageGroup: "Kids" | "Youth" | "Adults" | "Elders";
  occasion: "Festive" | "Casual" | "Bridal";
  badge: string;
  images: string[];
};

type Filters = {
  query: string;
  fabricType: string;
  size: string;
  color: string;
  price: number;
  sortBy: string;
};

const initialFilters: Filters = {
  query: "",
  fabricType: "All",
  size: "All",
  color: "All",
  price: 5000,
  sortBy: "featured",
};

const ageGroupFrontendMap: Record<string, Product["ageGroup"]> = {
  Children: "Kids",
  "Young Adults": "Youth",
  Adults: "Adults",
  Elders: "Elders",
};

function transformBackendProduct(bp: BackendProduct): Product {
  const sizes = Array.from(new Set(bp.variants.map((v) => v.size)));
  const colorNames = Array.from(new Set(bp.variants.map((v) => v.color)));
  const colors = colorNames.map((name) => ({ name, hex: "#000000" }));
  const price = parseFloat(bp.discountPrice || bp.price);
  const mrp = parseFloat(bp.price);
  const occasion = (bp.subcategory || "Casual") as Product["occasion"];
  const mappedAgeGroup = ageGroupFrontendMap[bp.ageGroup] || "Adults";

  return {
    id: bp.id,
    title: bp.name,
    category: bp.category as Product["category"],
    size: sizes,
    colors,
    price: isNaN(price) ? 0 : price,
    mrp: isNaN(mrp) ? price : mrp,
    rating: 4.0,
    ageGroup: mappedAgeGroup,
    occasion,
    badge: bp.badge || "",
    images: bp.images,
  };
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-gray-700">{label}</span>
      <div className="relative">
        <select
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 appearance-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </label>
  );
}

function ProductDetailModal({ product, onClose }: { product: BackendProduct; onClose: () => void }) {
  const { addToCart } = useStore();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalSize, setModalSize] = useState("");
  const [modalColor, setModalColor] = useState("");

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));
  const price = parseFloat(product.discountPrice || product.price);
  const mrp = parseFloat(product.price);
  const totalStock = product.variants.reduce((acc, curr) => acc + Number(curr.stock || 0), 0);
  const status = totalStock <= 5 ? "Low Stock" : "In Stock";

  useEffect(() => {
    setModalSize(sizes[0] || "");
    setModalColor(colors[0] || "");
  }, [product.id, sizes, colors]);

  const handleAddToCart = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { source: "cart" } }));
      return;
    }
    if (!modalSize || !modalColor) return;
    addToCart({
      id: product.id,
      title: product.name,
      price: isNaN(price) ? 0 : price,
      mrp: isNaN(mrp) ? price : mrp,
      image: product.images[0],
      size: modalSize,
      color: modalColor,
    }, 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-gray-600 hover:text-rose-600 transition">
          <X size={20} />
        </button>

        <div className="w-full md:w-5/12 bg-gray-50 p-6 flex flex-col">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedImageIndex === idx ? "border-amber-500 ring-2 ring-amber-200" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto">
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {product.subcategory || product.category}
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              {product.ageGroup}
            </span>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl text-rose-950 mb-2">{product.name}</h2>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-rose-700">Rs {price.toLocaleString("en-IN")}</span>
            <span className="text-base text-gray-400 line-through">Rs {mrp.toLocaleString("en-IN")}</span>
            {price < mrp && (
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                {Math.round((1 - price / mrp) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">Available Variants</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-left px-4 py-2 font-semibold">Size</th>
                    <th className="text-left px-4 py-2 font-semibold">Color</th>
                    <th className="text-right px-4 py-2 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => (
                    <tr key={v.id} className="border-t border-gray-200">
                      <td className="px-4 py-2">{v.size}</td>
                      <td className="px-4 py-2">{v.color}</td>
                      <td className="px-4 py-2 text-right font-medium">{v.stock} pcs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setModalSize(s)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                    modalSize === s ? "border-rose-600 bg-rose-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-rose-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setModalColor(c)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                    modalColor === c ? "border-rose-600 bg-rose-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-rose-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

           <div className="mb-6 flex items-center justify-between">
             <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
               status === "In Stock" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
             }`}>
               {status}
             </span>
             <span className="text-xs text-gray-500">Total Stock: {totalStock} pcs</span>
           </div>
         </div>
       </div>
      </div>
  );
}

export function GenderProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackendProduct, setSelectedBackendProduct] = useState<BackendProduct | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setBackendProducts(data);
          const transformed = data.map((bp: BackendProduct) => transformBackendProduct(bp));
          setProducts(transformed);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const allProducts = useMemo(() => {
    return products;
  }, [products]);

  const availableFabricTypes = useMemo(() => {
    return ["All", ...fabricTypes];
  }, []);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    allProducts.forEach((p) => p.size.forEach((s) => sizesSet.add(s)));
    return ["All", ...Array.from(sizesSet).sort()];
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const colorNames = Array.from(new Set(allProducts.flatMap((p) => p.colors.map((c) => c.name))));
    return ["All", ...colorNames.sort()];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const query = filters.query.trim().toLowerCase();
      const bp = backendProducts.find((b) => b.id === product.id);
      const matchesQuery =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesFabricType = filters.fabricType === "All" || bp?.gender === filters.fabricType;
      const matchesSize = filters.size === "All" || product.size.includes(filters.size);
      const matchesColor = filters.color === "All" || product.colors.some((color) => color.name === filters.color);
      const matchesPrice = product.price <= filters.price;

      return matchesQuery && matchesFabricType && matchesSize && matchesColor && matchesPrice;
    });

    if (filters.sortBy === "Featured") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "Newest") {
      result = [...result].sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [filters, allProducts, backendProducts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.fabricType !== "All") count++;
    if (filters.size !== "All") count++;
    if (filters.color !== "All") count++;
    if (filters.price < 5000) count++;
    return count;
  }, [filters]);

  const handleViewDetails = (backendId: string) => {
    const product = backendProducts.find((p) => p.id === backendId);
    if (product) {
      setSelectedBackendProduct(product);
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const removeFilter = (key: keyof Filters, value: string) => {
    if (key === "query") {
      setFilters({ ...filters, query: "" });
    } else if (key === "price") {
      setFilters({ ...filters, price: 5000 });
    } else {
      setFilters({ ...filters, [key]: "All" });
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBackendProduct(null);
        setLeftSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-center text-gray-500">Loading collections...</p>
      </section>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Filters</p>
                  <h2 className="mt-1 font-serif text-2xl text-rose-900">Find your fit</h2>
                </div>
                <Filter className="text-rose-700" size={22} />
              </div>

              <label className="mb-5 flex items-center rounded-xl border border-gray-200 px-3 py-2">
                <Search size={17} className="text-gray-400" />
                <input
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                   placeholder="Keyword search"
                   value={filters.query}
                   onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                 />
               </label>

                <FilterSelect label="Categories" value={filters.fabricType} options={availableFabricTypes} onChange={(fabricType) => setFilters({ ...filters, fabricType })} />
               <FilterSelect label="Size" value={filters.size} options={availableSizes} onChange={(size) => setFilters({ ...filters, size })} />
               <FilterSelect label="Color" value={filters.color} options={availableColors} onChange={(color) => setFilters({ ...filters, color })} />

               <div className="mt-5">
                 <div className="mb-2 flex items-center justify-between text-sm">
                   <span className="font-medium text-gray-700">Price Range</span>
                   <span className="font-semibold text-rose-700">Under Rs {filters.price.toLocaleString("en-IN")}</span>
                 </div>
                 <input
                   type="range"
                   min="900"
                   max="5000"
                   step="100"
                   value={filters.price}
                   onChange={(event) => setFilters({ ...filters, price: Number(event.target.value) })}
                   className="w-full accent-rose-600"
                 />
               </div>

               <FilterSelect label="Sort By" value={filters.sortBy} options={["Featured", "Price: Low to High", "Price: High to Low", "Newest"]} onChange={(sortBy) => setFilters({ ...filters, sortBy })} />

               {activeFilterCount > 0 && (
                 <div className="mt-5">
                   <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700">Active Filters</p>
                    <div className="flex flex-wrap gap-2">
                      {filters.fabricType !== "All" && (
                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                         {filters.fabricType}
                         <button onClick={() => removeFilter("fabricType", filters.fabricType)} className="hover:text-amber-900"><X size={12} /></button>
                       </span>
                     )}
                     {filters.size !== "All" && (
                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                         {filters.size}
                         <button onClick={() => removeFilter("size", filters.size)} className="hover:text-amber-900"><X size={12} /></button>
                       </span>
                     )}
                     {filters.color !== "All" && (
                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                         {filters.color}
                         <button onClick={() => removeFilter("color", filters.color)} className="hover:text-amber-900"><X size={12} /></button>
                       </span>
                     )}
                     {filters.price < 5000 && (
                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                         Under Rs {filters.price.toLocaleString("en-IN")}
                         <button onClick={() => removeFilter("price", filters.price.toString())} className="hover:text-amber-900"><X size={12} /></button>
                       </span>
                     )}
                   </div>
                 </div>
               )}

              <button
                className="mt-6 w-full rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                type="button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Right - Product Sections */}
          <div className="lg:col-span-8">
            <section>
              <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Our Collection</p>
                  <h2 className="mt-2 font-serif text-3xl text-rose-950 sm:text-4xl">All Products</h2>
                </div>
                <p className="text-sm text-gray-500">{filteredProducts.length} styles matched</p>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No products found matching your filters.</div>
              ) : (
                <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} onViewDetails={() => handleViewDetails(product.id)} />
                  ))}
                </motion.div>
              )}
            </section>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{filteredProducts.length} styles matched</p>
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* All Products Mobile */}
          <section className="mb-12">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Our Collection</p>
              <h2 className="mt-2 font-serif text-2xl text-rose-950">All Products</h2>
              <p className="text-sm text-gray-500">{filteredProducts.length} styles</p>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No products found.</div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} onViewDetails={() => handleViewDetails(product.id)} />
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeftSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-[70] w-80 max-w-[86vw] overflow-y-auto bg-white p-5 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Filters</p>
                  <h2 className="mt-1 font-serif text-2xl text-rose-900">Find your fit</h2>
                </div>
                <button onClick={() => setLeftSidebarOpen(false)} className="rounded-full p-2 text-gray-700 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

                <FilterSelect label="Categories" value={filters.fabricType} options={availableFabricTypes} onChange={(fabricType) => setFilters({ ...filters, fabricType })} />
               <FilterSelect label="Size" value={filters.size} options={availableSizes} onChange={(size) => setFilters({ ...filters, size })} />
               <FilterSelect label="Color" value={filters.color} options={availableColors} onChange={(color) => setFilters({ ...filters, color })} />

               <div className="mt-4">
                 <div className="mb-2 flex items-center justify-between text-sm">
                   <span className="font-medium text-gray-700">Price Range</span>
                   <span className="font-semibold text-rose-700">Under Rs {filters.price.toLocaleString("en-IN")}</span>
                 </div>
                 <input
                   type="range"
                   min="900"
                   max="5000"
                   step="100"
                   value={filters.price}
                   onChange={(event) => setFilters({ ...filters, price: Number(event.target.value) })}
                   className="w-full accent-rose-600"
                 />
               </div>

                <FilterSelect label="Sort By" value={filters.sortBy} options={["Featured", "Price: Low to High", "Price: High to Low", "Newest"]} onChange={(sortBy) => setFilters({ ...filters, sortBy })} />

               <button
                 className="mt-6 w-full rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                 type="button"
                 onClick={resetFilters}
               >
                 Reset Filters
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedBackendProduct && (
        <ProductDetailModal
          product={selectedBackendProduct}
          onClose={() => setSelectedBackendProduct(null)}
        />
      )}
    </>
  );
}
