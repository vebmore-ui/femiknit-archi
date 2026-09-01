import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type HeroSlide = {
  id?: string;
  title: string;
  subtitle: string;
  cta: string;
  badge: string;
  image: string;
};

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch("/api/banners");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((b: { id?: string; title: string; subtitle: string; cta: string; badge: string; image: string }) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            cta: b.cta,
            badge: b.badge,
            image: b.image
          }));
          setSlides(mapped);
          setLoading(false);
          return;
        }
      } catch {
        // fallback to hero-slides below
      }

      try {
        const res = await fetch("/api/hero-slides");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      } catch {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length);
    }, 5400);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active] || null;
  const go = (direction: number) => setActive((current) => (current + direction + slides.length) % slides.length);

  if (loading) {
    return (
      <section className="relative min-h-[560px] overflow-hidden bg-gray-950 sm:min-h-[640px] lg:h-[78vh] lg:min-h-[560px] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </section>
    );
  }

  if (!slide) {
    return null;
  }

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-gray-950 sm:min-h-[640px] lg:h-[78vh] lg:min-h-[560px]">
      <AnimatePresence mode="wait">
          <motion.div
            className="absolute inset-0"
            key={slide.image}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7 }}
          >
            <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
          </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl pt-8 text-white sm:pt-10 lg:pt-12"
          key={slide.title}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <span className="mb-5 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-rose-950 shadow-lg">
            {slide.badge}
          </span>
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl lg:text-7xl">{slide.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">{slide.subtitle}</p>
          <button className="mt-6 rounded-full bg-rose-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-rose-700 sm:mt-8">
            {slide.cta}
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-7">
        {slides.map((item, index) => (
          <button
            className={`h-2.5 rounded-full transition-all ${active === index ? "w-10 bg-amber-400" : "w-2.5 bg-white/70"}`}
            key={item.title}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>

      <button
        className="absolute left-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-800 shadow-lg transition hover:bg-white sm:left-4 sm:h-11 sm:w-11"
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
      >
        <ChevronLeft />
      </button>
      <button
        className="absolute right-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-800 shadow-lg transition hover:bg-white sm:right-4 sm:h-11 sm:w-11"
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
      >
        <ChevronRight />
      </button>
    </section>
  );
}
