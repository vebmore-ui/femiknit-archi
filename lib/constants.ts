export type Product = {
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

const img = (id: string, w = 1200, h = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=82`;

export const heroSlides = [
  {
    title: "Festive Sarees Woven for the Spotlight",
    subtitle: "Kanjivaram-inspired silks, zari borders, and modern drapes for wedding season.",
    cta: "Explore Collection",
    badge: "Up to 35% off",
    image: img("photo-1753981031189-27bb7bd1c079", 1800, 980)
  },
  {
    title: "Everyday Kurtis With Heritage Detail",
    subtitle: "Breathable cottons, fine motifs, and sizes for youth, adults, and elders.",
    cta: "Shop New Arrivals",
    badge: "New festive edits",
    image: img("photo-1743090834072-4f70339bc917", 1800, 980)
  },
  {
    title: "Ethnic Wear for the Whole Family",
    subtitle: "Bright kids wear, graceful elder classics, and coordinated occasion looks.",
    cta: "View Family Picks",
    badge: "Family sets live",
    image: img("photo-1774437896972-0cbe3d967e69", 1800, 980)
  }
];

export const ageGroups = [
  {
    title: "Kids",
    copy: "Playful festive sets",
    image: img("photo-1774437896972-0cbe3d967e69", 600, 600)
  },
  {
    title: "Youth",
    copy: "Fresh drapes and kurtis",
    image: img("photo-1743090834072-4f70339bc917", 600, 600)
  },
  {
    title: "Adults",
    copy: "Occasion-ready classics",
    image: img("photo-1753981031189-27bb7bd1c079", 600, 600)
  },
  {
    title: "Elders",
    copy: "Soft, graceful staples",
    image: img("photo-1749189516333-168cfd97de0b", 600, 600)
  }
];

export const categories = ["Sarees", "Kurtis", "Kids Wear"] as const;
export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "2-4Y", "5-7Y", "8-10Y"];
export const occasions = ["Festive", "Casual", "Bridal"] as const;
export const ageOptions = ["Kids", "Youth", "Adults", "Elders"] as const;
export const fabricTypes = [
  "Silk",
  "Cotton",
  "Khadi",
  "Mulmul",
  "Organza",
  "Chanderi",
  "Mangalagiri",
  "Kantha Stitch",
  "Chikankari Stitch",
  "Kani Pashmina",
  "Kalakshetra",
  "Baluchari",
  "Gorod",
  "Banarasi",
  "Georgette",
  "Chiffon",
  "Ajrakh",
  "Sequin"
] as const;
