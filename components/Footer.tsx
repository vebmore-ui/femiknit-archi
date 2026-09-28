import { Mail } from "lucide-react";
import { Link } from "@remix-run/react";

const columns = [
  { title: "Support", links: [{ label: "Returns", href: "/policies/returns" }, { label: "Shipping", href: "/policies/shipping" }] },
  { title: "Policies", links: [{ label: "Return & Refund", href: "/policies/returns" }, { label: "Shipping", href: "/policies/shipping" }] },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300">
      <div className="mandala-ink absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-70" />
      <div className="mandala-ink absolute -bottom-28 left-8 h-72 w-72 rounded-full opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-9 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src="/images/logo.png" alt="Femiknit" className="h-16 w-24 object-contain" />
              <span className="font-serif text-3xl text-white">Femiknit</span>
            </div>
            <p className="max-w-md text-sm leading-6 text-gray-400">
              Crafted for Indian ethnic wear shoppers.
            </p>
            <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter">
                Email address
              </label>
              <div className="flex min-w-0 flex-1 items-center rounded-full bg-white px-4 py-3 text-gray-900">
                <Mail size={18} className="text-rose-700" />
                <input id="newsletter" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="you@example.com" type="email" />
              </div>
              <button className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-rose-950 transition hover:bg-amber-400" type="button" onClick={() => window.location.href = 'mailto:support@femiknit.com'}>
                Contact Us
              </button>
            </form>
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 font-semibold text-white">{column.title}</h3>
                <ul className="grid gap-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="transition hover:text-amber-300">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm">
          <p>
            © 2026 Femiknit. Crafted for Indian ethnic wear shoppers.
            <span className="ml-2 text-amber-300">Developed by Vebmore</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
