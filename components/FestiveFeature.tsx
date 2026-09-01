import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ToranSvg } from "@/components/Motifs";

export function FestiveFeature() {
  return (
    <section className="overflow-hidden bg-amber-50/70 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ToranSvg className="mb-5 h-24 w-full" />
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Festive Toran Edit</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-rose-950 sm:text-4xl lg:text-5xl">
              Sarees, kurtas and kids sets for the season's brightest doorways.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
              A celebratory drop of marigold accents, crimson borders, airy cottons, and silk-blend pieces designed for rituals, family portraits, and long evenings.
            </p>
            <button className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700">
              Shop Festive Collection
              <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.div
            className="traditional-frame relative aspect-[5/4] overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://images.unsplash.com/photo-1763361735358-f296c926ecdb?auto=format&fit=crop&w=1200&h=960&q=82"
              alt="Women in traditional attire gathered during a festival"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/50 to-transparent" />
          </motion.div>
        </div>
        <ToranSvg className="mt-6 h-24 w-full rotate-180" />
      </div>
    </section>
  );
}
