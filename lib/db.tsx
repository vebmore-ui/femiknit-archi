import { getSupabaseServerClient } from "./supabase-server";
import { createClient } from "@supabase/supabase-js";

export type ProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
  product_id?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  gender: string;
  ageGroup?: string;
  category?: string;
  status: string;
  variants: ProductVariant[];
  images: string[];
  subcategory?: string;
  badge?: string;
};

let cachedSupabase: ReturnType<typeof getSupabaseServerClient> | null = null;

function getSupabase() {
  if (!cachedSupabase) {
    try {
      cachedSupabase = getSupabaseServerClient();
    } catch {
      console.warn("Service role key not available, using anon client.");
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        throw new Error("Missing Supabase credentials in environment variables.");
      }
      cachedSupabase = createClient(url, key);
    }
  }
  return cachedSupabase;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  if (!products || products.length === 0) {
    return [];
  }

  return products.map(mapSupabaseProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  const product = mapSupabaseProduct(data);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id);

  product.variants = (variants || []).map(mapSupabaseVariant);
  return product;
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const supabase = getSupabase();
  const newId = `PROD-${Date.now()}`;

  console.log("=== CREATING PRODUCT IN SUPABASE ===");
  console.log("Name:", product.name);
  console.log("Category:", product.category);
  console.log("Gender:", product.gender);
  console.log("Price:", product.price);

  const { data, error } = await supabase
    .from("products")
    .insert({
      id: newId,
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discountPrice,
      gender: product.gender,
      age_group: product.ageGroup || "",
      category: product.category || "",
      status: product.status,
      images: product.images,
      subcategory: product.subcategory,
      badge: product.badge,
    })
    .select()
    .single();

  if (error) {
    console.error("=== PRODUCT INSERT FAILED ===");
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("Hint:", error.hint);
    console.error("Details:", error.details);
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase insert succeeded but returned no data");
  }

  console.log("Product inserted successfully:", data.id);

  if (product.variants && product.variants.length > 0) {
    const variantRows = product.variants.map((v) => ({
      product_id: newId,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variantRows);

    if (variantError) {
      console.error("Error creating variants:", variantError);
    }
  }

  const created = mapSupabaseProduct(data);
  created.variants = product.variants.map((v) => ({ ...v, product_id: newId }));
  return created;
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, "id">>): Promise<Product | undefined> {
  const supabase = getSupabase();
  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.discountPrice !== undefined) dbUpdates.discount_price = updates.discountPrice;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.ageGroup !== undefined) dbUpdates.age_group = updates.ageGroup;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.images !== undefined) dbUpdates.images = updates.images;
  if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
  if (updates.badge !== undefined) dbUpdates.badge = updates.badge;

  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating product:", error);
    return undefined;
  }

  if (updates.variants) {
    await supabase.from("product_variants").delete().eq("product_id", id);

    const variantRows = updates.variants.map((v) => ({
      product_id: id,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variantRows);

    if (variantError) {
      console.error("Error updating variants:", variantError);
    }
  }

  const updated = mapSupabaseProduct(data);
  updated.variants = updates.variants || [];
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    return false;
  }

  return true;
}

function mapSupabaseProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    price: (row.price as string) || "0",
    discountPrice: (row.discount_price as string) || "",
    gender: (row.gender as string) || "Unisex",
    ageGroup: (row.age_group as string) || undefined,
    category: (row.category as string) || undefined,
    status: (row.status as string) || "In Stock",
    images: (row.images as string[]) || [],
    subcategory: row.subcategory as string | undefined,
    badge: row.badge as string | undefined,
    variants: [],
  };
}

function mapSupabaseVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as number,
    size: row.size as string,
    color: row.color as string,
    stock: (row.stock as number) || 0,
    product_id: row.product_id as string | undefined,
  };
}
