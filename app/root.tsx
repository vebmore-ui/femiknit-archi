import "./globals.css";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthPromptModal } from "@/components/AuthPromptModal";

export const loader = async ({ context }: { context: Record<string, any> }) => {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  return json({
    SUPABASE_URL: env?.SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  });
};

type LoaderData = {
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
};

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap",
  },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function meta() {
  return [
    { title: "Femiknit | Indian Ethnic Wear for Every Generation" },
    {
      name: "description",
      content:
        "Shop sarees, kurtis, kurtas, kids wear, and festive collections from Femiknit, a refined Indian ethnic wear storefront.",
    },
    {
      property: "og:title",
      content: "Femiknit",
    },
    {
      property: "og:description",
      content: "Production-ready Indian ethnic wear ecommerce storefront.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ];
}

export default function App() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<LoaderData>();

  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        <StoreProvider>
          <AuthProvider supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_ANON_KEY}>
            <ThemeProvider>
              <Outlet />
              <AuthPromptModal />
            </ThemeProvider>
          </AuthProvider>
        </StoreProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
