import { motion } from "framer-motion";
import { BadgeCheck, CreditCard, RotateCcw, Truck } from "lucide-react";

const badges = [
  { title: "100% Authentic Handloom", icon: BadgeCheck, copy: "Verified craft partners and premium fabric checks." },
  { title: "Easy Returns", icon: RotateCcw, copy: "Simple exchange flow for size and fit confidence." },
  { title: "Express Delivery", icon: Truck, copy: "Priority dispatch across major Indian pin codes." },
  { title: "Secure Payments", icon: CreditCard, copy: "UPI, cards, wallets, and encrypted checkout." }
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-rose-700">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-950">{badge.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{badge.copy}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
