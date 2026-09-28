import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase-server";
import bannersData from "@/lib/banners.json";

export type Banner = {
  id?: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  image: string;
  link: string;
  status: string;
};

export async function loader() {
  try {
    const supabase = getSupabaseServerClient({});
    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching banners from Supabase:", error);
      return json(bannersData);
    }

    const mapped = (banners || []).map((b: Record<string, unknown>) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || "",
      badge: b.badge || "",
      cta: b.cta || "",
      image: b.image || "",
      link: b.link || "/",
      status: b.status || "Active"
    }));

    return json(mapped);
  } catch {
    return json(bannersData);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (request.method === "POST") {
    try {
      await requireAdmin(request, undefined);
    } catch {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    try {
      const supabase = getSupabaseServerClient({});
      const newId = `BANNER-${Date.now()}`;

      const { data, error } = await supabase
        .from("banners")
        .insert({
          id: newId,
          title: body.title,
          subtitle: body.subtitle || "",
          badge: body.badge || "",
          cta: body.cta || "",
          image: body.image || "",
          link: body.link || "/",
          status: body.status || "Active"
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating banner:", error);
        return json({ 
          id: newId,
          title: body.title,
          subtitle: body.subtitle || "",
          badge: body.badge || "",
          cta: body.cta || "",
          image: body.image || "",
          link: body.link || "/",
          status: body.status || "Active"
        }, { status: 201 });
      }

      return json({
        id: data.id,
        title: data.title,
        subtitle: data.subtitle || "",
        badge: data.badge || "",
        cta: data.cta || "",
        image: data.image || "",
        link: data.link || "/",
        status: data.status || "Active"
      }, { status: 201 });
    } catch (err) {
      console.error("Banner creation error:", err);
      const newId = `ban_temp_${Date.now()}`;
      return json({
        id: newId,
        title: body.title,
        subtitle: body.subtitle || "",
        badge: body.badge || "",
        cta: body.cta || "",
        image: body.image || "",
        link: body.link || "/",
        status: body.status || "Active"
      }, { status: 201 });
    }
  }

  if (request.method === "DELETE") {
    try {
      await requireAdmin(request, undefined);
    } catch {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    try {
      const supabase = getSupabaseServerClient({});
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", body.id);

      if (error) {
        console.error("Error deleting banner:", error);
      }
    } catch (err) {
      console.error("Banner deletion error:", err);
    }

    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
