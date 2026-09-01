CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '0',
  discount_price TEXT DEFAULT '',
  gender TEXT DEFAULT 'Unisex',
  age_group TEXT DEFAULT 'Adults',
  category TEXT DEFAULT '',
  status TEXT DEFAULT 'In Stock',
  images TEXT[] DEFAULT '{}',
  subcategory TEXT,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT DEFAULT 'Default',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert product_variants" ON public.product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_variants" ON public.product_variants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_variants" ON public.product_variants FOR DELETE USING (true);
