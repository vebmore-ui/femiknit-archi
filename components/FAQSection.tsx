import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Orders & payments",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "The available options are shown at checkout and may include UPI, cards, net banking, wallets and Cash on Delivery."
      },
      {
        q: "Is Cash on Delivery available?",
        a: "COD may be offered for selected PIN codes and order values. Any applicable COD fee will be displayed before you pay."
      }
    ]
  },
  {
    category: "Shipping & delivery",
    items: [
      {
        q: "Do you deliver across India?",
        a: "We deliver to most serviceable Indian PIN codes. Availability is confirmed at checkout."
      },
      {
        q: "How long will delivery take?",
        a: "The estimated dispatch and delivery window is displayed at checkout or on the product page. Sales, festivals, extreme weather and courier disruptions can cause delays."
      }
    ]
  },
  {
    category: "Returns, exchanges & refunds",
    items: [
      {
        q: "In what condition must the saree be returned?",
        a: "It must be unused, unworn, unwashed, un-ironed and unaltered, with tags and original packaging intact. It must be free from odour, stains, makeup, damage and signs of use. The blouse piece must remain uncut."
      },
      {
        q: "What if I receive a damaged, defective, incorrect or incomplete order?",
        a: "Contact us within 48 hours with your order number, photographs and any available unboxing video. After verification, we will offer an appropriate replacement, exchange or full refund without charging reverse shipping."
      },
      {
        q: "When will I receive my refund?",
        a: "We normally initiate it within 5–7 business days after the return passes inspection. The bank or payment provider may then take another 5–10 business days to post the credit."
      }
    ]
  },
  {
    category: "Support",
    items: [
      {
        q: "How do I contact Femiknit?",
        a: "Email [support email] or WhatsApp [WhatsApp number] during [support days and timings]. Include your order number for faster assistance."
      }
    ]
  }
];

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-rose-200"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35 }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-sm leading-6 text-gray-600 sm:px-6 sm:pb-5">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Got questions?</p>
        <h2 className="mt-2 font-serif text-3xl text-rose-950 sm:text-4xl">Frequently Asked Questions</h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm leading-6 text-gray-500">
          Everything you need to know about orders, shipping, returns and more.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        {faqs.map((group) => (
          <div key={group.category}>
            <h3 className="mb-4 font-serif text-xl text-rose-900">{group.category}</h3>
            <div className="space-y-3">
              {group.items.map((item, idx) => (
                <FaqItem key={item.q} question={item.q} answer={item.a} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href="mailto:support@femiknit.com"
          className="inline-flex items-center rounded-full bg-rose-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-900"
        >
          Still need help? Contact support
        </a>
      </div>
    </section>
  );
}
