import { motion } from "framer-motion";
import { MessageCircle, Bell, Package, Calendar, Gift } from "lucide-react";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbDQgQlL2AU7jAndei1k";

const updates = [
  { icon: Package, text: "New arrivals & exclusive collections first" },
  { icon: Calendar, text: "Upcoming events & festive launches" },
  { icon: Gift, text: "Special offers & member-only discounts" },
  { icon: Bell, text: "Store announcements & updates" },
];

export function WhatsAppUpdatesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-rose-50 via-amber-50 to-rose-50 p-8 sm:p-12 shadow-lg">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            <MessageCircle size={28} />
          </motion.div>

          <motion.h2
            className="font-serif text-3xl font-bold text-rose-950 sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Stay in the Loop
          </motion.h2>

          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join our WhatsApp channel to be the first to know about new products,
            upcoming events, exclusive offers, and store updates.
          </motion.p>

          <motion.div
            className="mx-auto mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {updates.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-center gap-2">
                  <Icon size={16} className="text-rose-700" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-green-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:translate-y-0.5 hover:shadow-xl"
            >
              <MessageCircle size={20} />
              Join WhatsApp Channel
            </a>
          </motion.div>

          <motion.p
            className="mt-4 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            No spam, unsubscribe anytime.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
