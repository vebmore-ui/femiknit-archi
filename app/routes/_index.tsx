import { AgeGroupSection } from "@/components/AgeGroupSection";
import { FestiveFeature } from "@/components/FestiveFeature";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MandalaDivider } from "@/components/Motifs";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppUpdatesSection } from "@/components/WhatsAppUpdatesSection";
import { GenderProductShowcase } from "@/components/GenderProductShowcase";
import { TrustBadges } from "@/components/TrustBadges";
import { FloatingCart } from "@/components/FloatingCart";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedBackendProduct, setSelectedBackendProduct] = useState<{
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
  } | null>(null);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) {
        setSelectedBackendProduct(detail);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedBackendProduct(null);
    };
    window.addEventListener("open-product-modal", handleOpen as EventListener);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("open-product-modal", handleOpen as EventListener);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      <HeroCarousel />
      <MandalaDivider label="Curated for every celebration" />
      <GenderProductShowcase />
      <AgeGroupSection />
      <FestiveFeature />
      <TrustBadges />
      <WhatsAppUpdatesSection />
      <FAQSection />
      <Footer />
      <FloatingCart />
      {selectedBackendProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBackendProduct(null)}>
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedBackendProduct(null)} className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-gray-600 hover:text-rose-600 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            <div className="w-full md:w-5/12 bg-gray-50 p-6 flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={selectedBackendProduct.images[0]}
                  alt={selectedBackendProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto">
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {selectedBackendProduct.subcategory || selectedBackendProduct.category}
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                  {selectedBackendProduct.ageGroup}
                </span>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl text-rose-950 mb-2">{selectedBackendProduct.name}</h2>

              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-rose-700">Rs {parseFloat(selectedBackendProduct.discountPrice || selectedBackendProduct.price).toLocaleString("en-IN")}</span>
                <span className="text-base text-gray-400 line-through">Rs {parseFloat(selectedBackendProduct.price).toLocaleString("en-IN")}</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">{selectedBackendProduct.description}</p>

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
                      {selectedBackendProduct.variants.map((v) => (
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

              <p className="text-sm text-gray-500">Use the shop page to select size, color, and add to cart.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
