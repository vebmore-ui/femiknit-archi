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

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  total_orders INTEGER DEFAULT 0,
  total_spent TEXT DEFAULT '₹0',
  spent_raw NUMERIC DEFAULT 0,
  join_date TEXT DEFAULT '',
  tier TEXT DEFAULT 'Standard',
  recent_orders JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: public read-only, admin write via service role
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin insert products" ON public.products FOR INSERT WITH CHECK (false);
CREATE POLICY "Allow admin update products" ON public.products FOR UPDATE USING (false);
CREATE POLICY "Allow admin delete products" ON public.products FOR DELETE USING (false);

-- PRODUCT VARIANTS: public read-only, admin write via service role
CREATE POLICY "Allow public read product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow admin insert product_variants" ON public.product_variants FOR INSERT WITH CHECK (false);
CREATE POLICY "Allow admin update product_variants" ON public.product_variants FOR UPDATE USING (false);
CREATE POLICY "Allow admin delete product_variants" ON public.product_variants FOR DELETE USING (false);

-- CUSTOMERS: authenticated users can access their own record only
-- Anonymous users have no access
-- Admin/server-side operations use the service-role client and bypass RLS
CREATE POLICY "Allow authenticated users to read own customer record" ON public.customers
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Allow authenticated users to update own customer record" ON public.customers
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Allow authenticated users to insert own customer record" ON public.customers
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- STORAGE BUCKET: product-images
-- Create this bucket via Supabase Dashboard or CLI:
--   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg']);
--
-- Public read is enabled by setting public = true on the bucket.
-- The policies below restrict write operations to authenticated users only.

CREATE POLICY "Allow public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated upload to product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
