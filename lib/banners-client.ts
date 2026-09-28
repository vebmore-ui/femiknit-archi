import bannersData from "@/lib/banners.json";

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  image: string;
  link: string;
  status: string;
};

const STORAGE_KEY = "femiknit_banners";

function loadFromStorage(): Banner[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [...bannersData];
}

function saveToStorage(banners: Banner[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch {
    // ignore storage errors
  }
}

export function getBanners(): Banner[] {
  return loadFromStorage();
}

export function saveBanner(banner: Omit<Banner, "id">): Banner {
  const banners = loadFromStorage();
  const newBanner: Banner = {
    ...banner,
    id: `BANNER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  const updated = [newBanner, ...banners];
  saveToStorage(updated);
  return newBanner;
}

export function deleteBanner(id: string): boolean {
  const banners = loadFromStorage();
  const filtered = banners.filter((b) => b.id !== id);
  if (filtered.length === banners.length) return false;
  saveToStorage(filtered);
  return true;
}

export function resetBanners(): void {
  saveToStorage([...bannersData]);
}
