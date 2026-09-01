import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Search, X, ShoppingBag } from "lucide-react";
import { categories, fabricTypes } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";

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
  category: string;
  fabricType: string;
  size: string;
  color: string;
  price: number;
};

const initialFilters: Filters = {
  query: "",
  category: "All",
  fabricType: "All",
  size: "All",
  color: "All",
  price: 5000,
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

function ProductDetailModal({ product, onClose }: { product: BackendProduct; onClose: () => void }) {
  const { addToCart } = useStore();
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [product.id, sizes, colors]);

  const handleAddToCart = () => {
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

          <button
            onClick={handleAddToCart}
            disabled={!modalSize || !modalColor}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-rose-700 hover:to-amber-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShopExperience() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackendProduct, setSelectedBackendProduct] = useState<BackendProduct | null>(null);

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = filters.query.trim().toLowerCase();
      const matchesQuery =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const bp = backendProducts.find((b) => b.id === product.id);

      return (
        matchesQuery &&
        (filters.category === "All" || product.category === filters.category) &&
        (filters.fabricType === "All" || bp?.gender === filters.fabricType) &&
        (filters.size === "All" || product.size.includes(filters.size)) &&
        (filters.color === "All" || product.colors.some((color) => color.name === filters.color)) &&
        product.price <= filters.price
      );
    });
  }, [filters, products, backendProducts]);

  const colorOptions = Array.from(new Set(products.flatMap((product) => product.colors.map((color) => color.name))));
  const sizeOptions = Array.from(new Set(products.flatMap((product) => product.size)));

  const handleViewDetails = (backendId: string) => {
    const product = backendProducts.find((p) => p.id === backendId);
    if (product) {
      setSelectedBackendProduct(product);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedBackendProduct(null);
    };
    if (selectedBackendProduct) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [selectedBackendProduct]);

  return (
    <section id="shop" className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-4 lg:gap-8">
      <aside className="lg:col-span-1">
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

          <FilterSelect label="Category" value={filters.category} options={["All", ...categories]} onChange={(category) => setFilters({ ...filters, category })} />
          <FilterSelect label="Fabric Type" value={filters.fabricType} options={["All", ...fabricTypes]} onChange={(fabricType) => setFilters({ ...filters, fabricType })} />
          <FilterSelect label="Size" value={filters.size} options={["All", ...sizeOptions]} onChange={(size) => setFilters({ ...filters, size })} />
          <FilterSelect label="Color" value={filters.color} options={["All", ...colorOptions]} onChange={(color) => setFilters({ ...filters, color })} />

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

          <button
            className="mt-6 w-full rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
            type="button"
            onClick={() => setFilters(initialFilters)}
          >
            Reset Filters
          </button>
        </div>
      </aside>

      <div className="lg:col-span-3">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Femiknit collection</p>
            <h2 className="mt-2 font-serif text-3xl text-rose-950 sm:text-4xl">Sarees, Kurtis and Kids Wear</h2>
          </div>
          <p className="text-sm font-medium text-gray-500">{filteredProducts.length} styles matched</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onViewDetails={() => handleViewDetails(product.id)} />
            ))}
          </motion.div>
        )}
      </div>
      {selectedBackendProduct && (
        <ProductDetailModal
          product={selectedBackendProduct}
          onClose={() => setSelectedBackendProduct(null)}
        />
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm">
      <span className="mb-2 block font-medium text-gray-700">{label}</span>
      <select
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
