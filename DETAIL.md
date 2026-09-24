# Femiknit — Complete Project Documentation

> Documentation date: 2026-09-12
> Scope: Current repository state only. No secrets are included.

---

## 1. PROJECT OVERVIEW

### 1.1 Project Name
- **Package name:** `femiknitpro`
- **Brand name:** Femiknit (also displayed as "Femiknit Pro" in the shop page)

### 1.2 What Femiknit Is
Femiknit is an Indian ethnic wear e-commerce storefront selling sarees, kurtis, kurtas, kids wear, and festive collections targeting multiple age groups (Kids, Youth, Adults, Elders). The site combines:
- A customer-facing storefront (home, product browsing, product details, wishlist, cart, customer auth, account page)
- A hidden admin panel (dashboard, product management, customer management, settings)
- A WhatsApp-based ordering flow (no online payment gateway is implemented)

### 1.3 Purpose of the Website
- Display and browse clothing products with filters (category/fabric, size, color, price, sort)
- Allow customers to sign up, sign in, use Google OAuth, maintain a wishlist and cart
- Let customers place orders by sending a pre-formatted message to the business WhatsApp number
- Give administrators a protected back-office to manage products, view customers, and configure banners

### 1.4 Technology Stack
| Area | Technology |
|---|---|
| Framework | Remix v2 (React-based full-stack framework) |
| React | React 19.2.8 + React DOM 19.2.8 |
| Language | TypeScript 5 |
| Build system | Vite 5.4.11 + Remix Vite plugin |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`), CSS modules, inline styles |
| Animation | Framer Motion 13 |
| Icons | lucide-react |
| Backend/DB | Supabase (Auth, Postgres database, Storage) |
| Hosting | Cloudflare Workers (Wrangler) |
| Auth session handling | `@supabase/ssr` (PKCE flow) + `@supabase/supabase-js` |

### 1.5 Framework/Version
- Remix: `^2.16.0` / `^2.17.5` (Cloudflare adapter `@remix-run/cloudflare`)
- React: `^19.2.8`
- TypeScript: `^5`
- Vite: `^5.4.11`
- Supabase JS: `^2.112.3`
- Supabase SSR: `^0.12.5`

### 1.6 React/TypeScript Setup
- `jsx: "react-jsx"` (automatic JSX runtime)
- `moduleResolution: "bundler"`, `module: "esnext"`
- Strict mode enabled (`"strict": true`)
- Path alias: `@/*` → project root (`baseUrl: "."`)
- `env.d.ts` references `vite/client`
- Server module format: ESM (`remix.config.ts`)

### 1.7 Build System
- `npm run dev` → `remix vite:dev`
- `npm run build` → `remix vite:build`
- `npm run start` → `remix-serve ./build/server/index.js` (Node.js fallback, not used for Cloudflare)
- `npm run lint` → `eslint .`
- `npm run typecheck` → `tsc --noEmit`
- Vite config includes a custom `copyPublicAssets` plugin that copies `public/` into `build/client` after bundling.

### 1.8 Hosting/Deployment Platform
- **Cloudflare Workers** via Wrangler
- Worker entry point: `worker.js`
- Assets binding: `ASSETS` serving `build/client`
- Compatibility: `nodejs_compat` flag, compatibility date `2024-09-23`
- Environment variables are passed via `context.cloudflare.env` and mirrored into a `process.env` proxy in `worker.js`.

### 1.9 Backend/Database Platform
- **Supabase** (Postgres)
- Tables: `products`, `product_variants`, `customers`, `admin_users`
- Storage bucket: `product-images`
- Auth: Supabase Auth (email/password + Google OAuth, PKCE flow)

### 1.10 Authentication System
- **Customer auth:** Supabase Auth via `@supabase/ssr` browser client with PKCE; email/password sign-up/sign-in, Google OAuth, session persistence in cookies; `AuthContext` manages React state.
- **Admin auth:** Supabase email/password sign-in on the hidden admin route; server-side authorization via `requireAdmin()` which checks `public.admin_users` (role = `admin`) using the service-role key.
- **Note:** The old `/admin` route has been removed and replaced by the hidden namespace `/RJl2QWe2qR!AEQ5CbWRv` (see Section 4).

### 1.11 Storage System
- **Supabase Storage** bucket `product-images` for product photos
- Images are uploaded as base64 → binary bytes to `products/{productId}/{index}.{ext}`
- Public URLs are generated via `getPublicUrl()`

### 1.12 Major Libraries/Dependencies
| Dependency | Purpose |
|---|---|
| `@remix-run/cloudflare`, `@remix-run/node`, `@remix-run/react`, `@remix-run/dev`, `@remix-run/serve` | Remix framework and adapters |
| `@supabase/ssr` | SSR-safe Supabase client with cookie/session management |
| `@supabase/supabase-js` | Supabase JS SDK (database, auth, storage) |
| `framer-motion` | Page/element animations |
| `lucide-react` | Icon set |
| `react`, `react-dom` | UI runtime |
| `tailwindcss`, `@tailwindcss/postcss`, `autoprefixer`, `postcss` | Styling pipeline |
| `typescript`, `vite`, `vite-tsconfig-paths` | Type checking and bundling |
| `eslint` + react plugins | Linting |

### 1.13 Current Architecture
```
Browser
  ├── Remix app (Vite dev/build)
  │     ├── app/routes/*.tsx        (pages + API routes)
  │     ├── app/components/*.tsx    (UI components)
  │     ├── context/*.tsx           (Auth, Store, Theme providers)
  │     ├── lib/*.ts(x)             (Supabase clients, DB helpers, constants)
  │     └── app/admin/*.module.css  (admin styles)
  │
  ├── Cloudflare Worker (worker.js)
  │     └── createRequestHandler → Remix server with { cloudflare: { env } }
  │
  └── Supabase
        ├── Auth (users, sessions, OAuth)
        ├── Postgres (products, product_variants, customers, admin_users)
        └── Storage (product-images bucket)
```

### 1.14 Important Project Directories
| Directory | Purpose |
|---|---|
| `app/routes/` | Remix routes (pages + API endpoints) |
| `app/admin/` | CSS modules for the admin panel layout/pages |
| `components/` | Reusable React UI components (Header, Footer, HeroCarousel, ProductCard, etc.) |
| `context/` | React Context providers (AuthContext, StoreContext, ThemeContext) |
| `lib/` | Supabase clients, database helpers, constants, JSON seed data |
| `public/` | Static assets (images, favicon, compiled build output) |
| `scripts/` | Supabase schema setup SQL |
| `build/` | Compiled Remix output (client + server) |
| `.wrangler/` | Wrangler state/cache (ignored by git) |

---

## 2. COMPLETE WEBSITE STRUCTURE

### 2.1 Route Inventory (Current Source of Truth)

> **Important:** The old `/admin` route has been removed. The admin panel now lives under the hidden namespace `/RJl2QWe2qR!AEQ5CbWRv`. The `public/build` directory contains stale compiled artifacts from before the route rename (its manifest still references `routes/admin`); the source of truth is `app/routes/`.

| URL Path | Source File | Type | Description |
|---|---|---|---|
| `/` | `app/routes/_index.tsx` | Page | Homepage |
| `/shop` | `app/routes/shop.tsx` | Page | Standalone shop/catalog page with its own cart |
| `/signin` | `app/routes/signin.tsx` | Page | Customer email/password sign-in + Google sign-in |
| `/signup` | `app/routes/signup.tsx` | Page | Customer sign-up + Google sign-up |
| `/login` | `app/routes/login.tsx` | Page | Alias of `/signin` |
| `/account` | `app/routes/account.tsx` | Page | Customer profile/account page |
| `/wishlist` | `app/routes/wishlist.tsx` | Page | Customer wishlist |
| `/portal` | `app/routes/portal.tsx` | Redirect | Redirects to the hidden admin namespace |
| `/policies/faq` | `app/routes/policies.faq.tsx` | Page | FAQ page |
| `/policies/returns` | `app/routes/policies.returns.tsx` | Page | Return/exchange/refund policy |
| `/policies/shipping` | `app/routes/policies.shipping.tsx` | Page | Shipping & delivery policy |
| `/RJl2QWe2qR!AEQ5CbWRv` | `app/routes/RJl2QWe2qR!AEQ5CbWRv.tsx` | Layout + Page | Hidden admin root (login / dashboard layout) |
| `/RJl2QWe2qR!AEQ5CbWRv/products` | `app/routes/RJl2QWe2qR!AEQ5CbWRv.products.tsx` | Page | Admin product management |
| `/RJl2QWe2qR!AEQ5CbWRv/customers` | `app/routes/RJl2QWe2qR!AEQ5CbWRv.customers.tsx` | Page | Admin customer management |
| `/RJl2QWe2qR!AEQ5CbWRv/settings` | `app/routes/RJl2QWe2qR!AEQ5CbWRv.settings.tsx` | Page | Admin settings (banners) |

### 2.2 API / Server Route Inventory

| Endpoint | Source File | Method | Description |
|---|---|---|---|
| `/api/products` | `app/routes/api.products.tsx` | GET / POST | List all products (GET); create product, admin-only (POST) |
| `/api/products/:id` | `app/routes/api.products.$id.tsx` | GET / PUT / DELETE | Get single product; update/delete, admin-only |
| `/api/orders` | `app/routes/api.orders.tsx` | GET / POST | Returns empty array; POST returns 501 (disabled during Cloudflare migration) |
| `/api/inventory` | `app/routes/api.inventory.tsx` | GET / POST | Returns empty array; POST returns 501 (disabled during migration) |
| `/api/customers` | `app/routes/api.customers.tsx` | GET / POST | List customers from Supabase; upsert/sync a customer record |
| `/api/banners` | `app/routes/api.banners.tsx` | GET / POST / DELETE | Returns empty array; mutations return 501 (disabled during migration) |
| `/api/hero-slides` | `app/routes/api.hero-slides.tsx` | GET / POST | Serves static hero slide data from `lib/constants.ts`; POST returns 501 |
| `/api/age-groups` | `app/routes/api.age-groups.tsx` | GET / POST | Serves static age-group data from `lib/constants.ts`; POST returns 501 |
| `/api/auth/signin` | `app/routes/api.auth.signin.tsx` | POST | Server-side email/password sign-in (legacy; not used by current UI) |
| `/api/auth/signup` | `app/routes/api.auth.signup.tsx` | POST | Server-side sign-up (legacy; not used by current UI) |
| `/api/auth/google` | `app/routes/api.auth.google.tsx` | GET / POST | Server-side Google OAuth initiation (legacy; not used by current UI) |
| `/api/auth/callback` | `app/routes/api.auth.callback.tsx` | GET | Google OAuth callback; exchanges code for session, syncs customer, redirects |
| `/api/auth/signout` | `app/routes/api.auth.signout.tsx` | POST | Server-side sign-out (legacy; not used by current UI) |

### 2.3 Route: Homepage (`/`) — `app/routes/_index.tsx`

**What the page does:** Main landing page for the Femiknit storefront. Presents the brand, hero carousel, product showcases, trust signals, WhatsApp channel promotion, FAQ, and footer.

**Who can access it:** Public (no authentication required).

**Main UI sections (in order):**
1. `Header` — sticky navigation with logo, search, login/account, wishlist, sign-up, mobile menu
2. `HeroCarousel` — auto-rotating promotional banner carousel
3. `MandalaDivider` — decorative divider ("Curated for every celebration")
4. `GenderProductShowcase` — filterable product grid with sidebar filters and product detail modal
5. `AgeGroupSection` — four circular age-group tiles (Kids, Youth, Adults, Elders)
6. `FestiveFeature` — promotional toran-themed feature block
7. `TrustBadges` — four trust cards (Authentic Handloom, Easy Returns, Express Delivery, Secure Payments)
8. `WhatsAppUpdatesSection` — WhatsApp channel join call-to-action
9. `FAQSection` — expandable FAQ accordion
10. `Footer` — newsletter form, link columns, social icons
11. `FloatingCart` — fixed bottom-right cart drawer
12. Product detail modal (opened via custom event from `GenderProductShowcase`)

**Data it loads:**
- Hero slides: `/api/banners` first; falls back to `/api/hero-slides` (static data in `lib/constants.ts`)
- Age groups: `/api/age-groups` (static data in `lib/constants.ts`)
- Products: loaded inside `GenderProductShowcase` via `/api/products`
- FAQ: hardcoded in `components/FAQSection.tsx`

**Actions available:**
- Browse/filter products (category/fabric, size, color, price range, sort)
- Open product detail modal → select size/color → add to cart (requires auth; otherwise opens auth prompt)
- Join WhatsApp channel (external link)
- Expand FAQ items
- Newsletter email input (visual only; no submission handler)
- Navigate to login/sign-up/account/wishlist/policy pages

**Navigation behavior:**
- Header links use Remix `Link` components for internal routes
- Category/nav menu items mostly link to `#` placeholders
- "Back to shop" links on policy pages return to `/`

**Redirect behavior:** None on this route.

**Authentication requirements:** None. Auth-gated actions (add to cart, wishlist) trigger an auth prompt modal instead.

**Loading/error/empty states:**
- Hero carousel shows "Loading..." placeholder while fetching
- Age group section shows "Loading..." then disappears if no data
- Product grid shows "Loading collections..." then "No products found matching your filters." when empty
- Product detail modal shows a variant stock table

**Mobile/responsive behavior:**
- Desktop: left filter sidebar + product grid (lg breakpoint)
- Mobile/tablet: filter button opens a left slide-in drawer; grid collapses to 1–2 columns
- Mobile menu: full-height right slide-in drawer with nav links
- Header search collapses to a mobile search bar below the main row

**Animations/interactions:**
- Framer Motion entrance animations throughout (fade/slide/spring)
- Hero carousel: crossfade + scale transition, 5.4s auto-advance, dot indicators, prev/next arrows
- Product cards: hover lift, image crossfade on hover (900ms interval), progress-bar image indicators
- Toran divider: animated thread path + swinging pennants (infinite loops)
- Rotating mandala decorations
- FAQ accordion: animated height expansion
- Product detail modal: backdrop blur, scale-in entrance, Escape key closes

**Special logic:**
- Listens for custom event `open-product-modal` to open the product detail modal with backend product data
- Escape key closes the modal
- Clicking backdrop closes the modal; clicking inside stops propagation

---

### 2.3.1 Homepage Hero Carousel Deep Dive

The hero carousel on the homepage follows a specific loading priority chain:

1. **First attempt:** `GET /api/banners` — this is the primary data source. The homepage expects this endpoint to eventually return dynamic promotional banners (currently returns `[]` during Cloudflare migration).
2. **Fallback:** If the banners endpoint returns an empty array or fails, the carousel falls back to `GET /api/hero-slides` — static data from `lib/constants.ts` containing three slides with Unsplash images.
3. **Final fallback:** If both sources return no data, the `HeroCarousel` component renders `null` (no hero section visible at all).

Each slide maps to a visual block with a dark gradient overlay on a full-width background image. The CTA button currently has no `onClick` handler — it is decorative. The carousel pauses/resumes auto-advance based on `slides.length` as the sole timer dependency, meaning swapping the array with another non-empty array of different length does NOT reset the timer.

The loading state is a plain "Loading..." text in a tall dark section. Fetch errors are silently caught and trigger the fallback path without user-facing error messages.

### 2.3.2 Homepage Product Showcase Deep Dive

`GenderProductShowcase` is the most complex shared component in the application. It handles:

- **Two-phase data loading:** First fetches `GET /api/products`, then transforms each backend `Product` record into a frontend-specific shape. The raw backend records are stored separately from the transformed records for filter purposes.
- **Filter architecture:** Five independent filter dimensions (keyword, fabric/category, size, color, price) are applied client-side with AND logic. The price slider ranges from 900 to 5,000 in steps of 100, defaulting to 5,000. Active filter chips appear below the filter bar and can be individually removed. A "Reset" button restores all defaults.
- **Sort options:** "Featured" sorts alphabetically by title (not a backend ranking). "Newest" sorts lexicographically by product ID (not by creation timestamp). "Price low→high" and "Price high→low" sort by the transformed current price.
- **Product modal:** Opens via a custom `open-product-modal` browser event dispatched from product cards. The modal uses backend product data directly (not the transformed version). It shows a variant stock table, allows size/color selection, and gates "Add to Cart" on authentication. Signed-out users trigger the `open-auth-modal` event with source `cart`. The modal closes on Escape key, backdrop click, or X button.
- **Responsive design:** Desktop (`lg` breakpoint) shows a 4-column filter sidebar alongside an 8-column product grid. Mobile/tablet collapses this to a filter button that opens a left slide-in drawer (which notably omits the keyword search field that the desktop sidebar has) and a 1–2 column product grid.

**Known inconsistencies:**
- The fabric filter is labeled "Categories" but compares the backend `gender` field.
- Color hex values are placeholder `#000000`; no real color swatches are rendered.
- The frontend category type only allows Sarees/Kurtis/Kids Wear, but the cast accepts any backend category string.
- The product modal does not check selected variant stock before adding to cart.
- Mobile filter drawer omits keyword search while desktop sidebar includes it.

### 2.3.3 Homepage Age Groups and Festive Feature

The `AgeGroupSection` fetches `GET /api/age-groups` which currently returns static data from `lib/constants.ts`. The section shows a "Loading..." state, then renders four circular tiles for Kids, Youth, Adults, and Elders. If no data returns, the section disappears entirely (not even a placeholder).

`FestiveFeature` is a promotional toran-themed block using the `ToranSvg` motif from `components/Motifs.tsx`. The toran is rendered both normally and upside-down to frame the promotional content.

---

*(Part 2 continues in greater detail below: `/shop`, auth pages, account, wishlist, policies, hidden admin routes.)*

### 2.4 Route: Shop (`/shop`) — `app/routes/shop.tsx`

**What the page does:** Standalone catalog page branded as "Femiknit Pro". It loads products from the backend, transforms them into a simplified catalog format, supports category filtering and search, and implements a complete local cart with a WhatsApp-based checkout flow.

**Who can access it:** Public (no authentication required). This page is independent of `AuthContext` and `StoreContext`.

**Main UI sections (in order):**
1. Sticky navbar — "FP" logo mark, "Femiknit Pro" wordmark, cart icon with count badge (desktop search input is present in code but hidden via `display: none`)
2. Hero banner — "Style for Every Age" with Free Shipping / Cash on Delivery / Easy Returns pills
3. Category filter — horizontally scrollable pill bar (All Collections, Men, Women, Boys, Girls, Young Adults, Seniors)
4. Product grid — responsive cards with badge, name, price, original price, discount percentage
5. Product detail modal — image, description, price, size, color, quantity, Add to Cart
6. Cart sidebar — line items, quantity steppers, remove, grand total, "Buy Now via WhatsApp"
7. Checkout confirmation modal — customer details + order summary review before sending
8. Toast notifications — fixed bottom center
9. Minimal footer — copyright + tagline

**Data it loads:**
- Products: `GET /api/products` (admin-format products transformed by `transformAdminProduct`)
- Cart: persisted to `localStorage` under `femiknit_cart`
- Customer details: persisted to `localStorage` under `femiknit_customer` (name, phone, address)

**Actions available:**
- Filter by category (single-select pills, horizontal scroll on mobile)
- Search by product name or subcategory
- Open product modal → pick size, color, quantity → Add to Cart
- Open cart → adjust quantity, remove items, view grand total
- Buy Now via WhatsApp → fill name/phone/address → confirm → opens `wa.me/7778040747` with a preformatted order message, clears the cart

**Checkout flow (no payment integration):**

1. User clicks "Buy Now via WhatsApp" in the cart sidebar.
2. The component validates: cart must be non-empty AND name/phone/address must all be filled. If any check fails, a toast error appears and no modal opens.
3. A confirmation modal appears showing customer details and order summary.
4. User clicks "Yes, Send Order" which triggers the following:
   a. A URL-encoded WhatsApp message is constructed with:
      - Customer details (name, phone, address)
      - Line items for each cart entry: size, color, quantity, unit price, line total
      - Grand total prominently displayed
      - Order reference note
   b. The URL `https://wa.me/7778040747?text=<encoded-message>` is opened in a new browser tab.
   c. The confirmation modal closes.
   d. The cart is cleared (localStorage and React state).
   e. A toast "Redirecting to WhatsApp..." appears.
5. The user is expected to tap "Send" in WhatsApp on their device. No server-side order record is created.

**The `/shop` cart and the main `FloatingCart` use separate localStorage keys:**
- `/shop` uses `femiknit_cart` (managed by the `/shop` component itself)
- Main site cart uses `femiknit_cart` (managed by `StoreContext`)
- Despite the same key name, the two systems maintain separate state because `FloatingCart` wraps the key with `StoreContext` while `/shop` accesses it directly

**Navigation behavior:**
- This route is fully self-contained; it does not use the main site `Header`/`Footer`/`FloatingCart`
- No internal navigation links on this page
- No Remix `Link` usage

**Redirect behavior:** None on this route.

**Authentication requirements:** None. Cart and customer data are browser-local only.

**Loading/error/empty states:**
- "Loading products..." while fetching; "No products found." for empty filtered results
- Toast "Failed to load products" on fetch failure
- Cart shows "Your cart is empty" with an empty-cart icon
- Cart sidebar and modals are fixed overlays with backdrop

**Mobile/responsive behavior:**
- Product grid: `repeat(auto-fill, minmax(260px, 1fr))`
- Category pills scroll horizontally with hidden scrollbar
- Cart sidebar: fixed right panel, max-width 460px, full height
- All modals center with padding; navbar collapses to logo + cart icon only

**Animations/interactions:**
- Inline `@keyframes` for modal scale-in, cart slide-in, toast slide-up
- Product cards lift on hover
- Add to Cart button changes to red on hover
- All styling is inline `style={{...}}` objects plus a small `<style>` block (no Tailwind classes on this page)

**Special logic:**
- `mapGenderToCategory` maps admin product `gender`/`ageGroup`/`category` into the six catalog categories (Unisex + Children maps to boys/girls based on category name; Unisex + Young Adults → young-adults; Unisex + Adults → men; everything else → seniors/men)
- Product IDs are re-generated as `index + 1` after transformation
- Missing product images fall back to a `placehold.co` URL
- Cart deduplicates by `(id, selectedSize, selectedColor)`
- `BUSINESS_PHONE = "7778040747"` is hardcoded
- No server-side order creation; orders exist only as WhatsApp messages

---

### 2.5 Route: Sign In (`/signin`) — `app/routes/signin.tsx`

**What the page does:** Customer email/password sign-in with Google OAuth option. This is the primary entry point for returning customers.

**Who can access it:** Public.

**Main UI sections:**
1. "Back to Home" link → Remix `Link` to `/`
2. Circular "F" logo mark (dark background, white letter)
3. "Welcome Back" heading + subtitle
4. Error banner (red) / success banner (green, when `?registered=1`)
5. Email field (with mail icon) + password field (with lock icon, show/hide toggle)
6. "Remember me" checkbox (decorative) + "Forgot password?" link (placeholder `#`)
7. Sign In button (loading state: "Signing in..." → "Redirecting...")
8. Divider "Or continue with"
9. "Sign in with Google" button (uses `AuthContext.signInWithGoogle()`)
10. "Don't have an account? Sign up for free" link → `/signup`

**Actions available:**
- Email/password sign-in via `AuthContext.signIn(email, password)`
- Google sign-in via `AuthContext.signInWithGoogle()` — opens Supabase OAuth consent screen
- Navigate to `/signup` or back to `/`
- Toggle password visibility (swaps `Eye`/`EyeOff` icons)

**Sign-in flow in detail:**
1. User enters email and password, clicks Sign In
2. Button enters loading state, text changes to "Signing in..."
3. `AuthContext.signIn()` calls Supabase `auth.signInWithPassword()` via the browser client
4. On success: button text changes to "Redirecting...", a full-screen overlay with spinning arrow appears
5. After 8-second delay, `useNavigate("/")` navigates to the homepage
6. During this redirect, the Supabase session is established in cookies via `@supabase/ssr`
7. On failure: error banner displays `result.error` from the Supabase response (e.g., "Invalid login credentials")

**Navigation behavior:**
- On successful email/password sign-in, shows a full-screen "Redirecting to home..." overlay and navigates to `/` after 8 seconds
- Uses Remix `useNavigate` and `useSearchParams`
- The 8-second delay gives the user time to see the redirect is happening

**Redirect behavior:**
- `?registered=1` query param shows "Account created! Please sign in." success banner (green)
- This is triggered after `/signup` redirects to `/signin?registered=1`

**Authentication requirements:** None to view; sign-in creates a customer session via Supabase Auth.

**Loading/error/empty states:**
- Error banner displays `result.error` from the sign-in call
- Button disabled states during loading/redirect
- Full-screen redirect overlay with spinning arrow
- No loading skeleton for the page itself (renders immediately)

**Mobile/responsive behavior:**
- Single centered column, `max-w-md`, full-height white background, Tailwind classes
- No route-specific breakpoints — scales naturally with viewport

**Animations/interactions:**
- Framer Motion entrance animations (fade/slide/scale)
- Spinning arrow during redirect overlay
- Password visibility toggle swaps `Eye`/`EyeOff` icons with a smooth transition
- Button hover/active states

**Special logic:**
- "Remember me" checkbox is decorative (no handler, no `remember` flag sent to Supabase)
- "Forgot password?" link is a placeholder `#` — no password reset flow exists
- The Google sign-in button on this page calls `AuthContext.signInWithGoogle()` (browser OAuth flow), not the legacy `/api/auth/google` endpoint
- Unlike the admin login, this page does not offer account creation on the same form — it links to `/signup` separately

---

### 2.6 Route: Sign Up (`/signup`) — `app/routes/signup.tsx`

**What the page does:** Customer account creation with name, email, password, terms checkbox, and Google OAuth option.

**Who can access it:** Public.

**Main UI sections:**
1. "Back to Home" link
2. Circular "F" logo mark
3. "Create Account" heading + subtitle
4. Error banner (red) / success banner (green)
5. Full Name, Email Address, Password fields (icons + show/hide toggle)
6. Terms of Service + Privacy Policy checkbox (both links are placeholder `#`)
7. Create Account button (loading state → "Creating Account..." / "Redirecting...")
8. Divider "Or sign up with"
9. "Sign up with Google" button
10. "Already have an account? Sign in" link

**Actions available:**
- Sign up via `AuthContext.signUp(email, password, name)`
- Google sign-up via `AuthContext.signInWithGoogle()`
- Navigate to `/signin` or back to `/`
- Toggle password visibility

**Navigation behavior:**
- On successful sign-up, shows success banner, then full-screen "Redirecting to sign in..." overlay, navigates to `/signin?registered=1` after 8 seconds

**Redirect behavior:**
- Successful sign-up redirects to `/signin?registered=1`

**Authentication requirements:** None to view; sign-up creates a Supabase Auth user.

**Loading/error/empty states:**
- Error banner displays `result.error` from the sign-up call
- Success banner: "Account created! Please wait while we sync your data..."
- Button disabled states during loading/redirect
- Full-screen redirect overlay with spinning arrow

**Mobile/responsive behavior:**
- Single centered column, `max-w-md`, full-height white background, Tailwind classes
- No route-specific breakpoints

**Animations/interactions:**
- Framer Motion entrance animations (fade/slide/scale)
- Spinning arrow during redirect overlay
- Password visibility toggle swaps `Eye`/`EyeOff` icons

**Special logic:**
- Terms checkbox is required but the linked Terms/Privacy pages are placeholders (`#`)

---

### 2.7 Route: Login Alias (`/login`) — `app/routes/login.tsx`

**What the page does:** Thin alias that renders the exact same component as `/signin`.

**Who can access it:** Public.

**Implementation:** `export default function Login() { return <SignIn />; }` — imports and renders `./signin`.

**Purpose:** Provides a convention-based URL (`/login`) alongside the functional URL (`/signin`). This accommodates users who may bookmark or share `/login` and search engines that may crawl either path. Both URLs render identical content and behavior.

**Special logic:** None. All behavior, state, and styling are identical to section 2.5. No separate data loading, no distinct styling, no different authentication flow.

---

*(Part 2 continues in greater detail below: `/account`, `/wishlist`, policy pages, hidden admin routes.)

### 2.8 Route: Account (`/account`) — `app/routes/account.tsx`

**What the page does:** Customer profile management page. Shows the authenticated user's name/email/avatar, allows editing name, phone, and delivery address, and provides a sign-out flow.

**Who can access it:** Public to view, but intended for signed-in customers. There is **no route-level auth guard** — unauthenticated visitors see a "User" placeholder with an empty email field.

**Main UI sections:**
1. Back arrow button → `/`
2. "My Account" heading + "Manage your profile information" subtitle
3. Profile card: avatar circle (Google avatar URL, else first letter of name/email), name, email
4. Editable fields: Full Name, Phone Number, Email Address (disabled), Delivery Address (textarea)
5. "Save Changes" button → becomes "Saved Successfully!" with check icon for 2 seconds
6. Sign Out card with red "Logout" button
7. Logout confirmation modal (Cancel / Yes, Sign Out)

**Data it loads:**
- `user` from `AuthContext` (name, email, avatar_url)
- `femiknit_phone` and `femiknit_address` from `localStorage`

**Actions available:**
- Edit name, phone, delivery address
- Save → persists phone/address to `localStorage` (name is NOT persisted to localStorage or Supabase)
- Sign out → `AuthContext.signOut()` then navigate to `/`

**Navigation behavior:**
- Back arrow uses Remix `Link` to `/`
- After sign-out, `useNavigate("/")`

**Redirect behavior:** None. No auth redirect.

**Authentication requirements:** None enforced at route level.

**Loading/error/empty states:**
- No loading state; fields render immediately from context/localStorage
- No error handling for save (always succeeds locally)

**Mobile/responsive behavior:**
- `max-w-7xl` container, `sm:grid-cols-2` for phone/email fields
- Full name and delivery address span both columns
- Dark mode support throughout (`dark:` classes)

**Animations/interactions:**
- Framer Motion staggered entrance (fade/slide)
- Animated logout confirmation modal (scale/translate)
- Save button swaps icon/text on success

**Special logic:**
- Name is initialized from `user.name` but edits are never saved anywhere
- Email is read-only (disabled input)
- Phone/address are stored in `localStorage` keys `femiknit_phone` / `femiknit_address` (separate from the `femiknit_customer` key used by `/shop`)
- Sign-out modal backdrop click closes it; inner panel stops propagation

---

### 2.9 Route: Wishlist (`/wishlist`) — `app/routes/wishlist.tsx`

**What the page does:** Displays products the customer has wishlisted, loaded from the backend and filtered by `wishlistIds` from `StoreContext`. Supports removal with confirmation and links back to the shop.

**Who can access it:** Public to view. There is **no route-level auth guard** — the wishlist is driven by `StoreContext` state (which itself is persisted in the browser).

**Main UI sections:**
1. Dark hero header: heart icon, "Your Wishlist" heading, item count
2. Loading state / empty state ("No products wishlisted yet" + Back to Home button)
3. Product grid (1 / 2 / 3 columns by breakpoint)
4. Product cards: image with hover auto-rotation, badge, discount %, title, rating (fixed 4.0), price/MRP, View + Remove buttons
5. Remove confirmation modal (product thumbnail + Cancel / Yes, Remove)

**Data it loads:**
- `GET /api/products` (full backend product list)
- `wishlistIds` from `StoreContext`

**Actions available:**
- View product → navigates to `/shop` (no per-product detail route exists)
- Remove from wishlist → confirmation modal → `StoreContext.removeFromWishlist(id)`
- Back to Home → `/`

**Navigation behavior:**
- All navigation uses Remix `Link`
- "View" links to `/shop` for every product

**Redirect behavior:** None.

**Authentication requirements:** None enforced at route level.

**Loading/error/empty states:**
- "Loading your wishlist..." during fetch
- Empty state with heart icon and Back to Home button
- Fetch errors silently produce an empty list

**Mobile/responsive behavior:**
- Grid: 1 column → `sm:grid-cols-2` → `lg:grid-cols-3`
- Hero header padding shrinks on small screens

**Animations/interactions:**
- Framer Motion entrance + layout animations on the grid
- `AnimatePresence mode="popLayout"` for smooth removal
- Hover auto-rotates through product images every 1800ms (cleans up intervals on leave/unmount)
- Card border glows amber on hover
- Confirmation modal with backdrop blur

**Special logic:**
- Backend products are mapped to a simplified `WishlistProduct` shape (id, title, price, mrp, rating=4.0, images, badge)
- Discount % computed from mrp/price; guarded against divide-by-zero
- Image index state tracked per product id in a `Record<string, number>`
- Intervals stored in a `useRef` map and cleared on unmount
- The page fetches ALL products from the backend but only displays those whose IDs are in `wishlistIds` — this is a data inefficiency for large catalogs
- "View" on every product card links to `/shop` since no per-product detail page exists in the current architecture
- The wishlist is purely client-side state (StoreContext + localStorage); it does not sync with any server-side wishlist database
- When a user removes the last item, `AnimatePresence mode="popLayout"` handles the grid reflow animation smoothly before the empty state appears

**Cross-page interaction:**
- Adding to wishlist from any page (Homepage ProductCard, `/shop`) updates StoreContext immediately
- The Header wishlist count badge updates reactively via StoreContext
- The `/wishlist` page renders the full persisted wishlist regardless of how items were added

---

### 2.10 Route: FAQ (`/policies/faq`) — `app/routes/policies.faq.tsx`

**What the page does:** Static FAQ page with 20 Q&A items across 5 categories.

**Who can access it:** Public.

**Main UI sections:**
1. "Frequently Asked Questions" heading + "Last updated: 1 August 2026"
2. Categories: Products & authenticity (1), Orders & payments (5), Shipping & delivery (3), Returns, exchanges & refunds (10), Support (1)
3. "Back to shop" button → `/`

**Data it loads:** Hardcoded `faqs` array in the component. No API calls.

**Actions available:** Read-only; Back to shop navigation only.

**Navigation behavior:** Remix `Link` to `/`.

**Redirect behavior:** None.

**Authentication requirements:** None.

**Loading/error/empty states:** None (static content).

**Mobile/responsive behavior:** `max-w-3xl` single column, `prose prose-rose prose-lg` typography.

**Animations/interactions:** None (static render).

**Special logic:**
- Contains placeholder text: `[support email]`, `[WhatsApp number]`, `[support days and timings]` — these are NOT wired to real contact values
- Policy content is informational only; no interactive accordion

---

### 2.11 Route: Returns Policy (`/policies/returns`) — `app/routes/policies.returns.tsx`

**What the page does:** Static "Return, Exchange and Refund Policy" page with a policy-at-a-glance table and 15 detail sections plus a legal reference.

**Who can access it:** Public.

**Main UI sections:**
1. Heading + "Last updated: 1 August 2026"
2. Policy at a glance table (request window, damage reporting, condition, options, requests per order)
3. Sections: When can a product be returned / Conditions for accepting a return / Products that cannot be returned or exchanged / Natural textile and colour variations / Damaged, defective, incorrect or incomplete orders / Return and refund options (store credit, refund, exchange) / How to request a return or exchange / Reverse pickup and self-shipping / Quality inspection / Refund timelines / Order cancellation / Refused and undelivered orders / Third-party purchases / Customer support and grievance redressal / Changes to this policy
4. Legal reference: Consumer Protection (E-Commerce) Rules, 2020
5. "Back to shop" button → `/`

**Data it loads:** Hardcoded `sections` array. No API calls.

**Actions available:** Read-only; Back to shop navigation only.

**Key policy values documented in the page:**
- Return/exchange request window: 3 calendar days from delivery
- Damage/defect/wrong-item reporting: within 48 hours
- Preference return handling charge: ₹199 (waived for confirmed Femiknit error)
- Refund initiation: 5–7 business days after inspection; bank posting may take another 5–10 business days
- Store credit: valid 12 months, non-cash, no handling deduction
- Exchange: one per order, replacement must be equal or higher value
- Contact: Phone/WhatsApp `7541826227`; support email is a placeholder `[INSERT SUPPORT EMAIL]`
- Working hours text: "Monday – Friday (12a.m. to 8p.m.)"

**Navigation behavior:** Remix `Link` to `/`.

**Redirect behavior:** None.

**Authentication requirements:** None.

**Loading/error/empty states:** None (static content).

**Mobile/responsive behavior:** `max-w-3xl` single column, `prose prose-rose prose-lg` typography.

**Animations/interactions:** None (static render).

**Special logic:**
- Contains placeholder text `[INSERT SUPPORT EMAIL]` — not wired to a real email
- The WhatsApp number `7541826227` differs from the `/shop` checkout number `7778040747`

---

### 2.12 Route: Shipping Policy (`/policies/shipping`) — `app/routes/policies.shipping.tsx`

**What the page does:** Static "Shipping & Delivery Policy" page with 6 sections.

**Who can access it:** Public.

**Main UI sections:**
1. Heading + "Last updated: 1 August 2026"
2. Delivery coverage (most serviceable Indian PIN codes, confirmed at checkout)
3. Delivery timelines (displayed at checkout/product page; delays possible)
4. Order tracking (email/SMS/WhatsApp after dispatch; up to 24h to update)
5. Shipping charges (free express delivery on prepaid orders above Rs 1,999; COD for selected PIN codes/order values with fee shown before payment)
6. Failed or refused deliveries (shipping charges may be deducted; repeated COD refusal may disable COD)
7. Customs and duties (domestic India only, no customs duties)
8. "Back to shop" button → `/`

**Data it loads:** Hardcoded inline. No API calls.

**Actions available:** Read-only; Back to shop navigation only.

**Navigation behavior:** Remix `Link` to `/`.

**Redirect behavior:** None.

**Authentication requirements:** None.

**Loading/error/empty states:** None (static content).

**Mobile/responsive behavior:** `max-w-3xl` single column, `prose prose-rose prose-lg` typography.

**Animations/interactions:** None (static render).

**Special logic:** None.

---

*(Part 2 continues in greater detail below: hidden admin routes — dashboard, products, customers, settings, supporting APIs.)

### 2.13 Route: Admin Portal Redirect (`/portal`) — `app/routes/portal.tsx`

**What the page does:** Compatibility redirect for anyone requesting the old `/portal` URL. This exists to preserve bookmarks and external links that may have referenced the previous admin path.

**Who can access it:** Public; the loader redirects before rendering a page.

**Implementation:**
```ts
export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/RJl2QWe2qR!AEQ5CbWRv");
}
```

**Navigation behavior:** Always redirects to the hidden admin namespace root. The component itself renders `null` — no layout, no UI, no sidebar.

**Redirect behavior:** HTTP 302 temporary redirect to `/RJl2QWe2qR!AEQ5CbWRv`. The redirect is server-side (in the loader), so the browser URL bar updates to the admin namespace after a brief flash of the redirect response.

**Authentication requirements:** None at this route; the destination performs authentication and authorization checks via the parent layout loader and `requireAdmin()`.

**Loading/error/empty states:** None.

**Mobile/responsive behavior:** Not applicable (no UI rendered).

**Animations/interactions:** None.

**Special logic:**
- This is the only remaining public alias for the hidden admin path
- No other route redirects to `/portal`; it was a previous version of the admin URL
- The redirect is unconditional — it does not check authentication before redirecting
- If the hidden admin namespace itself changes again, this redirect will need to be updated

**Historical context:** The admin panel previously lived at `/admin`, then `/portal`, and now at `/RJl2QWe2qR!AEQ5CbWRv`. Each rename left behind stale compiled artifacts in `public/build/` but this redirect is the only active compatibility shim.

---

### 2.14 Route: Hidden Admin Root / Layout (`/RJl2QWe2qR!AEQ5CbWRv`) — `app/routes/RJl2QWe2qR!AEQ5CbWRv.tsx`

**What the route does:** Serves as the admin authentication boundary, login/access-denied screens, shared sidebar layout, logout action, and parent for all admin child pages.

**Who can access it:**
- Unauthenticated visitors see the admin sign-in form.
- Authenticated Supabase users who are not listed as admins see Access Denied.
- Only users whose normalized email matches a `public.admin_users` row with `role = 'admin'` see the dashboard layout and child routes.

**Main UI states (in order of precedence):**
1. Unauthenticated → `AdminLogin`
2. Authenticated but not an admin → `AdminAccessDenied`
3. Authenticated admin → dark sidebar + `<Outlet />` child page
4. Route errors → custom Chrome-style 404 HTML

**Authentication flow:**
- The login form uses the browser Supabase client (`getSupabaseClient()`) with PKCE flow.
- Sign-in calls `auth.signInWithPassword({ email, password })`.
- Sign-up calls `auth.signUp({ email, password, options: { data: { full_name: name } } })`.
- Both success paths perform a full-page navigation to the hidden admin root.
- The server loader then reads the Supabase SSR session from the request cookies and calls `requireAdmin()`.
- `requireAdmin()` verifies the authenticated user, then uses the server/service-role client to query `admin_users` by normalized email and `role = 'admin'`.
- The custom `femiknit_admin_session` cookie helpers are defined in this file; `clearSessionCookie()` is used during logout, but the login path does not explicitly call `setSessionCookie()`.

**Loader behavior:**
- Reads `context.cloudflare.env` for environment configuration.
- Creates a server Supabase client from the request cookies.
- Calls `supabase.auth.getUser()`.
- Returns `{ isAuthenticated: false, isAdmin: false, userEmail: undefined }` when no valid session exists.
- If the session exists but `requireAdmin()` fails, returns `{ isAuthenticated: true, isAdmin: false, userEmail }`.
- If admin verification succeeds, returns `{ isAuthenticated: true, isAdmin: true, userEmail }`.
- Outer errors are converted to the unauthenticated response.

**Action behavior:**
- Accepts form data with a `phase` field.
- `phase=logout` signs out through the server Supabase client, clears the custom admin-session cookie, and redirects to the hidden admin root.
- Any other phase returns HTTP 400 `Invalid request`.
- The login form's `phase` hidden input is not used for login; login is handled client-side.

**AdminLogin UI:**
1. Lock icon in a dark circular badge
2. "Admin Sign In" or "Create Admin Account" heading
3. Optional Full Name field in sign-up mode
4. Email field
5. Password field (`minLength={6}`, visibility is not provided)
6. Submit button with loading spinner
7. Toggle between sign-in and sign-up
8. "Back to site" button → `/`
9. Red error banner for Supabase or unexpected errors

**AdminAccessDenied UI:**
1. Red X badge
2. "Access Denied" heading
3. Message showing the signed-in email
4. "Sign Out" button → POST logout action
5. "Back to site" button → `/`

**Admin sidebar (authenticated admins only):**
1. Femiknit logo image from `/images/logo.png` + wordmark
2. Dashboard → hidden root
3. Products → hidden root `/products`
4. Customers → hidden root `/customers`
5. Settings → hidden root `/settings`
6. Logout button with confirmation modal
7. Main content area renders the active child route through `<Outlet />`

**Navigation behavior:**
- Sidebar navigation uses buttons with `window.location.href`, causing full page loads rather than client-side Remix navigation.
- Active state is an exact pathname match.
- Login/sign-up/access-denied "Back to site" links go to `/`.
- Logout uses a dynamically created POST form with `phase=logout` and `useSubmit()`.

**Redirect behavior:**
- Successful login/sign-up reloads the hidden root.
- Logout redirects to the hidden root.
- `/portal` redirects here.

**Authentication requirements:**
- The route itself is public, but all useful admin content is protected by the loader and `requireAdmin()`.
- Product mutation APIs independently call `requireAdmin()` as a second authorization layer.

**Loading/error/empty states:**
- Login and access-denied screens are immediate client-side renders.
- Submit buttons show loading/spinner states.
- The route's `ErrorBoundary` renders the same custom 404 HTML for every error status, including non-404 failures.

**Mobile/responsive behavior:**
- Login/access-denied cards are centered with padding and a max width of 420px.
- The admin shell uses a fixed 280px sidebar and a flexible main content area; no dedicated mobile sidebar collapse is implemented in this file.

**Animations/interactions:**
- Framer Motion entrance, scale, and spring animations on cards, icons, and modals.
- Sidebar items scale on hover.
- Logout confirmation uses a backdrop modal with scale-in/out animation.
- Button hover styles are implemented with inline event handlers.

**Special logic / important implementation notes:**
- Public sign-up is exposed on the admin login screen; creating an account alone does **not** grant admin access.
- Admin authorization is database-backed (`admin_users.role = 'admin'`), not based only on being signed in.
- Email comparison is trimmed and lowercased before the `admin_users` lookup.
- The hidden path is the actual source of truth; stale compiled artifacts under `public/build` may still reference the old `routes/admin` namespace.
- The custom Chrome-style 404 page is returned for all route errors, so server-side failures can be visually indistinguishable from a missing route.

---

### 2.15 Route: Admin Dashboard (`/RJl2QWe2qR!AEQ5CbWRv`) — `app/routes/RJl2QWe2qR!AEQ5CbWRv._index.tsx`

**What the page does:** First screen after admin login. Presents high-level revenue/customer/order metrics, recent orders, and low-stock inventory warnings.

**Who can access it:** Authenticated admins only, enforced by the parent layout loader.

**Main UI sections (in order):**
1. Dashboard header with title and refresh button
2. Metric cards:
   - Total Revenue
   - Total Customers
   - Total Orders
3. Content grid:
   - Recent Orders table (first 5 records)
   - Inventory Warning list
4. Loading/empty states inside each panel

**Data it loads:**
- `GET /api/orders`
- `GET /api/inventory`
- `GET /api/customers`
- The three requests run concurrently with `Promise.all`.
- Orders are mapped from `{ id, customer, total, status, date }`.
- Inventory is mapped from `{ id, product, sku, stock, category }`.
- Customers are used as returned by the API.

**Derived values:**
- `totalRevenue` sums order amounts after removing `₹` and commas.
- `lowStockAlerts` contains inventory rows with `stock <= 10`.
- Revenue trend displays `+12%` when at least one order exists, otherwise `+0%`.
- Customer trend displays `+3 new` when at least one customer exists, otherwise `+0 new`.
- Pending count counts orders with status `New` or `Processing`.

**Actions available:**
- Refresh Metrics button → refetches all three APIs and briefly spins the refresh icon
- No order editing, fulfillment, or inventory adjustment actions exist on this page
- No drill-down from metrics to detailed views
- No search or filter on any panel

**Derived values in detail:**
- `totalRevenue`: iterates `GET /api/orders` results, strips `₹` prefix and comma separators from each `total`, sums them. Returns `0` if orders array is empty.
- `lowStockAlerts`: filters `GET /api/inventory` results for rows where `stock <= 10`. Returns empty array when inventory is empty (current state).
- Revenue trend: displays `+12%` (hardcoded) when at least one order exists, otherwise `+0%`. This is a static marketing number, not a real trend calculation.
- Customer trend: displays `+3 new` (hardcoded) when at least one customer exists, otherwise `+0 new`. Also a static number.
- Pending count: counts orders where `status === 'New'` or `status === 'Processing'`. Returns 0 when orders array is empty.

**Navigation behavior:**
- No internal links on the dashboard itself.
- Parent sidebar provides navigation to Products, Customers, and Settings.

**Redirect behavior:** None.

**Authentication requirements:** Inherited from the hidden admin parent route.

**Loading/error/empty states:**
- Tables show "Loading..." while requests are in flight.
- Recent Orders shows "No orders yet." when the array is empty.
- Inventory Warning shows "All stock levels healthy." when no rows are at or below the threshold.
- Fetch failures are silently caught and leave the arrays empty. No toast, no error banner on refresh failure.

**Mobile/responsive behavior:**
- Metric cards use `repeat(auto-fit, minmax(280px, 1fr))`.
- Content panels use `repeat(auto-fit, minmax(400px, 1fr))`.
- Tables are horizontally scrollable through their wrapper.
- Styling comes from `app/admin/page.module.css`.

**Animations/interactions:**
- Framer Motion header and staggered card/panel entrances.
- Spring transitions on metric cards.
- Refresh icon spins while a refresh is in progress.
- Status badges color-code New, Processing, Shipped, and Delivered orders.

**Special logic / current limitation:**
- `/api/orders` and `/api/inventory` currently return empty arrays; their POST actions return HTTP 501 with migration-disabled messages.
- Therefore the dashboard's revenue, order, and inventory panels are structurally ready but display no live operational data until those APIs are implemented or connected.
- The "Live via API" label on Recent Orders describes the intended data source, not the current populated state.
- Only `/api/customers` returns real data, so customer count/trend are the only potentially live dashboard metrics.

---

*(Part 2 continues in greater detail below: Admin Products listing and form, hidden admin dashboard, customers, settings, and supporting APIs.)

### 2.16 Route: Admin Products (`/RJl2QWe2qR!AEQ5CbWRv/products`) — `app/routes/RJl2QWe2qR!AEQ5CbWRv.products.tsx`

**What the page does:** Admin catalog management. Lists backend products, searches and filters them, shows stock-status summaries, and provides add/edit/delete workflows with variant and image configuration.

**Who can access it:** Authenticated admins only, enforced by the hidden admin parent route. Product mutation requests are additionally protected by `requireAdmin()` in the API routes.

**Main UI views:**
1. **Product list view** — stats, search/filter toolbar, product cards, edit/delete actions
2. **Add/Edit form view** — basic information, images, inventory variants, catalog taxonomy, quick tips
3. **Confirmation modal** — used for edit confirmation and delete confirmation
4. **Toast notifications** — success, validation, and network/error feedback

#### 2.16.1 Product List View

**Data it loads:**
- `GET /api/products`
- The API returns backend `Product` records with `id`, `name`, `description`, `price`, `discountPrice`, `gender`, `ageGroup`, `category`, `status`, `variants`, `images`, `subcategory`, and `badge`.
- The page keeps the full product list in React state and derives filtered results locally.

**Stats cards:**
- Total Products
- Low Stock (`status === "Low Stock"`)
- Medium Stock
- High Stock

**Search and filters:**
- Search matches product name, product ID, or category (case-insensitive).
- Status filter options: All Statuses, In Stock, Low Stock, Medium Stock, High Stock.
- Filtering is client-side only; it does not query the server with parameters.

**Product card contents:**
1. First product image or an image-placeholder icon
2. Stock-status badge
3. Product name and ID
4. Description truncated to 80 characters
5. Fabric value from the backend `gender` field
6. Price and optional discount price
7. Up to three variant chips (`size | color (stock)`) plus a “+N more” indicator
8. Edit and Delete buttons

**Actions available from the list:**
- **Add New Product** → opens the add form with empty/default values
- **Edit** → opens a confirmation modal, then pre-fills the form from the selected product
- **Delete** → opens a confirmation modal, then calls `DELETE /api/products/:id`
- Search/filter controls update the visible list immediately

**Loading/error/empty states:**
- Spinner and “Loading products...” while the initial request is in flight
- “No products found” with guidance when the filtered list is empty
- Toast errors for non-2xx responses, invalid JSON, network failures, and delete failures
- The page logs detailed fetch/save errors to the browser console

**Navigation behavior:**
- No Remix links are used inside this page.
- The parent sidebar provides navigation to Dashboard, Customers, and Settings.
- The form’s back/cancel controls only switch local view state; they do not navigate away.

**Redirect behavior:** None on this route.

**Authentication requirements:** Inherited from the parent layout; API mutations independently require admin authorization.

**Mobile/responsive behavior:**
- Product grid uses `repeat(auto-fill, minmax(320px, 1fr))`.
- At widths below 768px, stats become two columns, the product grid becomes one column, and the filter toolbar stacks vertically.
- The add/edit form uses a two-column grid (`1fr 340px`) above 1024px and one column below that breakpoint.
- Styling comes from `app/admin/products/page.module.css`.

**Animations/interactions:**
- Framer Motion page transitions between list and form views
- Animated toast slide-in/out
- Centered confirmation modal with scale/fade transitions
- Product cards lift and gain shadow on hover
- Edit/delete buttons have hover state changes
- Refresh-style spinner animation is used for loading states

**Special logic / important implementation notes:**
- The page uses four image input refs even though the heading says “Max 3”; the form renders image slots 1–4.
- Product images are selected as Base64 data URLs in the browser. The backend `lib/db.tsx` uploads Base64 images to the Supabase Storage bucket `product-images` and replaces them with public URLs when possible.
- If no image is supplied, the save payload uses a `placehold.co` fallback URL.
- The form’s `gender` state is used as the catalog taxonomy/fabric selector and defaults to `"Silk"`; the `category` state defaults to `"Kurtis"`.
- Stock status is recalculated from total variant stock:
  - `<= 5` → Low Stock
  - `<= 20` → Medium Stock
  - `> 20` → High Stock
- The filter includes an “In Stock” option, but the save flow generates only Low/Medium/High Stock status values; the mapping between those concepts is therefore inconsistent.
- Variant IDs are generated with `Date.now()` for new rows.
- At least one variant row is required; attempting to remove the final row shows a toast.
- Delete removes the product row through the API and attempts to remove associated Storage files in `lib/db.tsx`.
- The page logs request bodies and product IDs to the console during create operations; no secret values are intentionally included in those logs.

---

*(Part 2 continues in greater detail below: hidden admin Products form, Customers, Settings, and the supporting API routes.)

#### 2.16.2 Products Add/Edit Form

**How the form opens:**
- **Add:** “Add New Product” resets all fields and opens the form with defaults:
  - Name: empty
  - Description: empty
  - Base price: empty
  - Discount price: empty
  - Taxonomy/fabric: `Silk`
  - Category: `Kurtis`
  - Images: empty
  - Variants: one row — size `M`, color `Black`, stock `10`
- **Edit:** The product card’s Edit button first opens a confirmation modal. Confirming copies the selected product into the form fields and opens the same form in edit mode.

**Form sections (left column):**

1. **Basic Information**
   - Product Name (required text input)
   - Description (textarea)
   - Base Price (required number input, step `0.01`)
   - Sale / Discount Price (optional number input, step `0.01`)

2. **Product Images**
   - Four selectable image slots rendered as dashed upload tiles
   - Each slot supports Select/Change and Remove
   - Files must begin with an `image/` MIME type; invalid files produce a toast
   - Selected files are converted to Base64 with `FileReader`
   - The heading says “Max 3,” but four slots are rendered

3. **Inventory Variants**
   - Each row contains Size, Color, Stock, and Remove
   - Size is a select with `XS`, `S`, `M`, `L`, `XL`, `XXL`
   - Color is required text input
   - Stock is required number input with `min="0"`
   - “Add Variant” appends a row with size `S`, empty color, stock `10`, and a `Date.now()` ID
   - Removing the final row is blocked with a toast

**Form section (right column): Catalog Taxonomy**
- A select labeled “Categories” is bound to the form’s `formGender` state
- Options are fabric/material values: Silk, Cotton, Khadi, Mulmul, Organza, Chanderi, Mangalagiri, Kantha Stitch, Chikankari Stitch, Kani Pashmina, Kalakshetra, Baluchari, Gorod, Banarasi, Georgette, Chiffon, Ajrakh, Sequi
- A “Quick Tips” card advises selecting categories, adding variants, uploading images, and using descriptive names

**Form header actions:**
- Back arrow and Cancel return to the product list
- Save Product / Update Product submits the form

**Save validation:**
- Product name and base price are mandatory
- Variant fields marked required rely on native HTML validation
- If mandatory top-level fields are empty, a toast says “Please fill in all mandatory fields.”

**Payload sent to the API:**
```json
{
  "name": "...",
  "description": "...",
  "price": "...",
  "discountPrice": "...",
  "gender": "...",
  "category": "...",
  "status": "Low Stock | Medium Stock | High Stock",
  "variants": [{ "id": 1, "size": "M", "color": "Black", "stock": 10 }],
  "images": ["..."]
}
```

**Create behavior:**
- POSTs the payload to `/api/products`
- On success, inserts the returned product at the front of the local list, shows “New product added successfully!”, reloads the full list, and returns to list view
- On failure, shows the server error or a generic failure toast

**Update behavior:**
- PUTs the payload to `/api/products/:currentEditId`
- On success, replaces the matching local product, shows “Product updated successfully!”, reloads the full list, and returns to list view
- On failure, shows “Failed to update product: …”

**Loading/error/empty states:**
- No full-page form loading state; submit is synchronous from the user’s perspective
- Toast feedback covers validation, success, API errors, and network errors
- Browser console receives detailed request/response errors

**Mobile/responsive behavior:**
- Form grid is two columns above 1024px and one column below
- Price row is two columns above 640px and one column below
- Image tiles wrap; variant rows remain a compact grid
- Styling comes from `app/admin/products/page.module.css`

**Animations/interactions:**
- Framer Motion transitions between list and form views
- Confirmation modal uses scale/fade transitions
- Toast uses slide/fade transitions
- Upload tiles and inputs have focus/hover styles from the CSS module

**Special logic / important implementation notes:**
- `formCategory` is initialized to `"Kurtis"` and sent in the payload, but there is no visible category input controlling it; the visible taxonomy select controls `formGender` instead.
- The backend maps the payload's `gender` field to the database `gender` column and `category` to the database `category` column.
- Base64 images are uploaded by `lib/db.tsx` to `product-images/products/<productId>/<index>.<extension>` when the service client is available.
- If image upload fails, the Base64 string is retained in the product record rather than aborting the save.
- Editing replaces all variant rows: the backend deletes existing `product_variants` for the product and inserts the submitted rows.
- Product IDs are generated server-side as `PROD-<timestamp>` for new products.
- The form's save path does not explicitly validate that at least one variant exists before sending; it relies on required fields and backend behavior.

**Error handling in detail:**
- Network failures (fetch throws) are caught and surfaced as toast messages with a generic "Failed to ... product" message.
- Non-2xx HTTP responses: the response body is parsed as JSON and the error message is extracted for the toast. If JSON parsing fails, a generic message is shown.
- All errors are additionally logged to `console.error` with the full request/response objects for debugging.
- The delete flow specifically distinguishes between "product not found" (404) and other failures, showing different toast messages for each case.
- The page does NOT use React Query or any data-fetching library; all state is managed through `useState` and direct fetch calls.

**Stock status calculation inconsistency:**
- Computed from total variant stock at render time: `<= 5` → Low Stock, `<= 20` → Medium Stock, `> 20` → High Stock.
- This differs from the backend `status` field which is set by the admin form and stored separately. The list view uses computed values while the form's save flow generates specific status strings.
- The filter includes an "In Stock" option, but the save flow never generates an "In Stock" status, making this filter functionally unusable.

---

*(Part 2 route/API documentation is complete. Parts 3–6 cover shared components/database/deployment in greater detail, UI/UX inventory, security/known issues, and appendices.)*

### 2.17 Route: Admin Customers (`/RJl2QWe2qR!AEQ5CbWRv/customers`) — `app/routes/RJl2QWe2qR!AEQ5CbWRv.customers.tsx`

**What the page does:** Admin customer directory. Loads customer records, provides search and tier filtering, displays a customer table, and opens a detailed profile modal.

**Who can access it:** Authenticated admins only, enforced by the hidden admin parent route.

**Data it loads:**
- `GET /api/customers`
- The API returns Supabase `customers` rows ordered by `join_date` descending.
- Expected record shape: `id`, `name`, `email`, `phone`, `address`, `totalOrders`, `totalSpent`, `spentRaw`, `joinDate`, `tier`, and `recentOrders`.

**Main UI sections (in order):**
1. Header with “Customer Directory” title and Sync button
2. Metric cards:
   - Total Customers
   - VIP Members
3. Controls bar:
   - Search by name, email, or phone
   - Tier tabs: All, VIP, Standard
4. Customer table:
   - Customer Profile (avatar, name, VIP badge, ID)
   - Contact Details (email, phone)
   - Joined Date
   - View Profile action
5. Customer Profile modal

**Search and filter behavior:**
- Search is case-insensitive for name and email, and substring-based for phone.
- Tier filter is client-side and matches the backend `tier` field.
- Search and tier filters combine with AND logic.
- The Sync button performs a full `window.location.reload()` rather than refetching in place.

**Customer table contents:**
- Avatar generated from the initials of the customer’s name
- Name and optional VIP badge
- Customer ID
- Email and phone with icons
- Join date
- “View Profile” button

**Profile modal contents:**
1. Avatar + name + optional VIP badge + customer ID
2. Close button
3. Contact Information:
   - Email
   - Phone
   - Joined date
4. Default Shipping Address

**Actions available:**
- Search customers
- Switch between All/VIP/Standard tiers
- Open a customer profile modal
- Close the modal via the X button or backdrop
- Sync/reload the page

**Navigation behavior:**
- No Remix links are used inside this page.
- The parent sidebar provides navigation to Dashboard, Products, and Settings.

**Redirect behavior:** None.

**Authentication requirements:** Inherited from the hidden admin parent route.

**Loading/error/empty states:**
- “Loading customers...” row while the request is in flight
- “No matching customer records discovered.” when filters return no rows
- Toast errors for invalid API responses or network failures
- API errors are logged to the browser console
- Fetch failures leave the customer list empty

**Mobile/responsive behavior:**
- Metric cards use `repeat(auto-fit, minmax(240px, 1fr))`
- Controls bar wraps on narrow screens
- Table wrapper supports horizontal scrolling
- Modal is centered with a max width of 560px and 90vh max height
- Styling comes from `app/admin/customers/page.module.css`

**Animations/interactions:**
- Framer Motion staggered entrances for metrics and table content
- Toast slide/fade transitions
- Profile modal scale/fade transitions
- Filter tabs and action buttons have hover states
- Sync button uses the refresh icon

**Special logic / important implementation notes:**
- The API response is expected to use camelCase fields (`totalOrders`, `totalSpent`, `joinDate`, `recentOrders`), while the Supabase query selects raw rows; field-name compatibility depends on how the database/API response is shaped.
- `totalOrders`, `totalSpent`, `spentRaw`, and `recentOrders` are loaded but not displayed in the current table or modal.
- VIP count is derived from `tier === "VIP"`.
- Avatar initials are generated by splitting the name on spaces and taking the first character of each segment.
- The page logs the full admin customer API response to the browser console.
- There is no customer edit, delete, order-history, or export functionality on this page.
- The Sync button reloads the entire page, so unsaved UI state is lost.

---

*(Part 2 continues in greater detail below: Admin Settings, and the supporting API routes.)

### 2.18 Route: Admin Settings (`/RJl2QWe2qR!AEQ5CbWRv/settings`) — `app/routes/RJl2QWe2qR!AEQ5CbWRv.settings.tsx`

**What the page does:** Admin settings surface for promotional banners. It loads the current banner list, offers an add-banner form, supports deletion, and provides a visual “Save Changes” confirmation for global settings.

**Who can access it:** Authenticated admins only, enforced by the hidden admin parent route.

**Data it loads:**
- `GET /api/banners`
- The current API returns an empty array, so the page normally renders no configured banners.
- Banner records are expected to contain `id`, `title`, `subtitle`, `badge`, `cta`, `status`, `image`, and `link`.

**Main UI sections (in order):**
1. Header:
   - “Settings & Configurations” title
   - Subtitle describing marketing banners, delivery rules, and taxes
   - “Save Changes” button
2. Banners & Offers section:
   - Refresh button
   - Promotional Banners upload/add area
   - Active Banner List
3. Add Promotional Banner modal

**Banner list behavior:**
- Each banner item displays a placeholder image icon, title, status dot, status text, and destination link.
- A trash button calls `DELETE /api/banners` with the banner ID.
- Successful deletion removes the item from local state and shows a toast.
- Failed deletion shows an error toast.
- Refresh re-runs `GET /api/banners`.

**Add Banner modal fields:**
1. Banner Title (required)
2. Subtitle
3. Badge Text
4. Button Text
5. Destination Route / Link
6. Initial Status: Active or Inactive
7. Cancel / Save Banner actions

**Save Banner payload:**
```json
{
  "title": "...",
  "subtitle": "...",
  "badge": "...",
  "cta": "...",
  "link": "... or /",
  "status": "Active",
  "image": "default-banner.jpg"
}
```

**Actions available:**
- Refresh the banner list
- Add a new banner
- Delete an existing banner
- Save Changes (local confirmation only)
- Close the modal via Cancel, X, or backdrop

**Navigation behavior:**
- No Remix links are used inside this page.
- The parent sidebar provides navigation to Dashboard, Products, and Customers.
- Banner destination links are stored as text but are not rendered as clickable links in the current list.

**Redirect behavior:** None.

**Authentication requirements:** Inherited from the hidden admin parent route.

**Loading/error/empty states:**
- “Loading banners...” while the initial request is in flight
- “No active banners configured.” when the list is empty
- Toasts for add/delete/network failures and success messages
- Fetch failures leave the banner list empty

**Mobile/responsive behavior:**
- Header wraps on narrow screens
- Banner items stack their information and action areas as needed
- Modal is centered with a max width of 480px and 90vh max height
- Styling comes from `app/admin/settings/page.module.css`

**Animations/interactions:**
- Framer Motion staggered section entrance
- Toast slide/fade transitions
- Add-banner modal scale/fade transitions
- Banner list items animate in/out
- Upload area changes border/background on hover
- Save button changes to a green success state for 3.5 seconds

**Special logic / important implementation notes:**
- `handleSaveSettings()` only sets local `isSaved` state and shows “All global settings updated successfully.” It does not send any settings to an API or persist delivery rules/taxes.
- The current `/api/banners` implementation returns an empty array for GET and HTTP 501 for POST/DELETE during the Cloudflare migration, so banner add/delete cannot currently persist.
- The add form sends a hardcoded image value of `"default-banner.jpg"`; there is no file picker or image upload in this settings page.
- If `newLink` is empty, the payload defaults the destination to `/`.
- The banner list displays `banner.link` as plain text preceded by a bullet, not as a navigable link.
- The page title/subtitle mention global delivery rules and taxes, but no controls for those settings exist in the current UI.
- The Refresh button only refetches banners; it does not reload the entire page.

---

*(Part 2 continues in greater detail below: supporting API routes for banners, static content, and auth.)

### 2.19 API Route Group: Product APIs

#### 2.19.1 `GET /api/products` / `POST /api/products` — `app/routes/api.products.tsx`

**Purpose:** List all catalog products and create a new product.

**Methods:**
- `GET`: Reads all products from Supabase and returns a JSON array.
- `POST`: Requires admin authorization, parses a JSON product payload, and creates the product through `lib/db.tsx`.

**Authorization:**
- `GET` is public and is used by the homepage showcase, `/shop`, wishlist, and admin product list.
- `POST` calls `requireAdmin()` before reading the request body. Unauthorized requests return HTTP 401/403 with `Admin access required`.

**GET response:**
- Array of product records with `id`, `name`, `description`, `price`, `discountPrice`, `gender`, `ageGroup`, `category`, `status`, `variants`, `images`, `subcategory`, and `badge`.
- Records are ordered by product ID descending.
- Database errors are logged and an empty array is returned.

**POST request body:**
- `name`, `description`, `price`, `discountPrice`, `gender`, `category`, `status`, `variants`, `images`, optional `ageGroup`, `subcategory`, and `badge`.
- The server generates a new ID in the form `PROD-<timestamp>`.
- Base64 images are uploaded to Supabase Storage before the product row is inserted.
- Variant rows are inserted into `product_variants` after the product row.

**POST response:**
- Success: created product JSON with HTTP 201.
- Validation/database failure: error JSON with HTTP 400.
- The route logs the received body and created product ID to the console.

**Loading/error/empty states:** API-level only; callers implement their own loading and empty UI.

**Special logic / limitations:**
- `GET` has no pagination, filtering, or search parameters.
- `POST` trusts the submitted `status` value; the admin form calculates status client-side.
- Image upload failures fall back to retaining the Base64 string in the product record.
- No client-side upload progress or file-size validation is implemented.

---

#### 2.19.2 `GET /api/products/:id` / `PUT /api/products/:id` / `DELETE /api/products/:id` — `app/routes/api.products.$id.tsx`

**Purpose:** Fetch, update, or delete one product by ID.

**Methods:**
- `GET`: Fetches one product and its variants.
- `PUT`: Requires admin authorization, updates product fields, and replaces all variant rows.
- `DELETE`: Requires admin authorization, deletes the product and attempts to remove its Storage images.

**Authorization:**
- All methods call `requireAdmin()` before performing the requested operation.
- Unauthorized requests return HTTP 401/403 with `Admin access required`.

**GET behavior:**
- Looks up the product by ID.
- Returns HTTP 404 `Product not found` when absent.
- Fetches `product_variants` where `product_id` equals the product ID.

**PUT behavior:**
- Accepts a partial product update body.
- Updates supported fields: name, description, price, discount price, gender, age group, category, status, images, subcategory, and badge.
- If `variants` is supplied, deletes existing variants for the product and inserts the submitted rows.
- Returns the updated product or HTTP 404 if the product is missing.
- Returns HTTP 400 with a descriptive error on failure.

**DELETE behavior:**
- Deletes the product row.
- Lists files under `product-images/<id>/` and attempts to remove them.
- Returns `{ "success": true }` on success, HTTP 404 if missing, or HTTP 400 on failure.
- Storage cleanup errors are logged but do not change the successful product deletion result.

**Loading/error/empty states:** API-level only; admin UI handles loading, toasts, and confirmation modals.

**Special logic / limitations:**
- There is no partial variant update; supplying `variants` replaces the entire variant set.
- Image updates reuse the Base64-to-Storage upload helper.
- The API does not validate price ranges, stock consistency, or image dimensions.

---

### 2.20 API Route: Orders (`GET /api/orders`, `POST /api/orders`) — `app/routes/api.orders.tsx`

**Purpose:** Placeholder for order data and order creation.

**Methods:**
- `GET`: Always returns an empty JSON array.
- `POST`: Returns HTTP 501 with a message stating that orders are handled via WhatsApp and the endpoint is disabled during the Cloudflare migration.
- Other methods return HTTP 405.

**Authorization:** None; the route has no admin check.

**Current consumers:**
- Admin dashboard fetches `GET /api/orders` for revenue and recent-order metrics.
- Because the response is always empty, the dashboard currently shows zero revenue/orders.

**Loading/error/empty states:** Callers receive an empty array and render their normal empty state.

**Special logic / limitations:**
- No order schema, persistence, fulfillment, cancellation, or status update exists here.
- The `/shop` checkout flow bypasses this API and sends orders through WhatsApp.

---

### 2.21 API Route: Inventory (`GET /api/inventory`, `POST /api/inventory`) — `app/routes/api.inventory.tsx`

**Purpose:** Placeholder for inventory data and inventory mutations.

**Methods:**
- `GET`: Always returns an empty JSON array.
- `POST`: Returns HTTP 501 stating that inventory management is temporarily unavailable during the Cloudflare migration.
- Other methods return HTTP 405.

**Authorization:** None; the route has no admin check.

**Current consumers:**
- Admin dashboard fetches `GET /api/inventory` for low-stock alerts.
- Because the response is always empty, the dashboard currently reports no low-stock items.

**Loading/error/empty states:** Callers receive an empty array and render the healthy/empty state.

**Special logic / limitations:**
- Product variant stock lives in `product_variants`, but this endpoint does not read or aggregate it.
- No stock adjustment, reservation, or sync behavior exists here.

---

### 2.22 API Route: Customers (`GET /api/customers`, `POST /api/customers`) — `app/routes/api.customers.tsx`

**Purpose:** List customer records and upsert/synchronize a customer profile.

**Data source:** Supabase `customers` table.

**Environment handling:**
- Reads Supabase URL and anon key from Cloudflare environment variables first, then process environment variables.
- If credentials are unavailable, `GET` returns an empty array and `POST` skips persistence while still returning a customer object.

**GET behavior:**
- Selects all columns from `customers`.
- Orders by `join_date` descending.
- Returns an empty array on query errors or missing configuration.

**POST behavior:**
- Accepts a JSON customer body.
- Normalizes/fills fields:
  - `id`: supplied ID or email
  - `name`: supplied name, email local part, or `User`
  - `email`: supplied email
  - `phone`, `address`: supplied values or empty string
  - `total_orders`: supplied `totalOrders` or 0
  - `total_spent`: supplied `totalSpent` or `₹0`
  - `spent_raw`: supplied `spentRaw` or 0
  - `join_date`: supplied `joinDate` or today's formatted date
  - `tier`: supplied tier or `Standard`
  - `recent_orders`: supplied `recentOrders` or empty array
- Upserts into Supabase using `email` as the conflict target.
- Returns the normalized customer object with HTTP 201.
- Returns HTTP 400 for invalid JSON or unexpected errors.

**Authorization:** None; the route has no admin check.

**Current consumers:**
- Admin dashboard and admin customer directory fetch the list.
- Google OAuth callback posts a minimal `{ email, name }` record to synchronize new users.

**Loading/error/empty states:** API returns empty arrays on most failures; callers handle UI states.

**Special logic / limitations:**
- The route logs customer sync activity and errors to the console.
- It does not validate email format, phone format, or authorization of the submitted ID.
- The admin customer page expects camelCase fields, while the database query returns raw column names; compatibility depends on the database/API response shape.
- No customer deletion, editing, or order-history endpoint is provided here.

---

### 2.23 API Route: Banners (`GET /api/banners`, `POST /api/banners`, `DELETE /api/banners`) — `app/routes/api.banners.tsx`

**Purpose:** Placeholder for promotional-banner management used by the admin Settings page and intended to feed homepage hero content.

**Methods:**
- `GET`: Always returns an empty JSON array.
- `POST`: Returns HTTP 501 with “Banner management is temporarily unavailable during Cloudflare migration.”
- `DELETE`: Returns HTTP 501 with the same migration-disabled message.
- Other methods return HTTP 405.

**Authorization:** None; the route has no admin check.

**Current consumers:**
- Admin Settings loads the list and attempts add/delete operations.
- Homepage hero loading is designed to try `/api/banners` first and fall back to `/api/hero-slides`.

**Loading/error/empty states:** Callers receive an empty array or error response and handle their own UI states.

**Special logic / limitations:**
- No banner schema, persistence, ordering, activation logic, or image handling exists in this endpoint.
- Because mutations return 501, the admin Settings page cannot currently persist banners.
- The endpoint does not expose any static fallback data; fallback hero content is served separately by `/api/hero-slides`.

---

### 2.24 API Route: Hero Slides (`GET /api/hero-slides`, `POST /api/hero-slides`) — `app/routes/api.hero-slides.tsx`

**Purpose:** Serve the static hero-carousel slide definitions used as the homepage fallback.

**Data source:** `lib/constants.ts` exports `heroSlides`.

**GET behavior:**
- Returns the static array of three slide objects.
- Each slide contains `title`, `subtitle`, `cta`, `badge`, and `image`.
- Images are generated from Unsplash URLs by the `img()` helper in `lib/constants.ts`.

**POST behavior:**
- Returns HTTP 501 stating that hero-slide management is temporarily unavailable during the Cloudflare migration.
- Other methods return HTTP 405.

**Authorization:** None.

**Current consumers:** Homepage hero carousel uses this endpoint when `/api/banners` returns no usable data.

**Loading/error/empty states:** Callers handle loading and empty states.

**Special logic / limitations:**
- Data is hardcoded in source; there is no admin editing or database persistence path.
- The static image URLs are external Unsplash URLs, not uploaded site assets.

---

### 2.25 API Route: Age Groups (`GET /api/age-groups`, `POST /api/age-groups`) — `app/routes/api.age-groups.tsx`

**Purpose:** Serve static age-group tiles for the homepage.

**Data source:** `lib/constants.ts` exports `ageGroups`.

**GET behavior:**
- Returns four objects: Kids, Youth, Adults, and Elders.
- Each object contains `title`, `copy`, and an external Unsplash image URL.

**POST behavior:**
- Returns HTTP 501 stating that age-group management is temporarily unavailable during the Cloudflare migration.
- Other methods return HTTP 405.

**Authorization:** None.

**Current consumers:** Homepage `AgeGroupSection`.

**Loading/error/empty states:** The homepage shows a loading state and hides the section if no data is returned.

**Special logic / limitations:**
- Data is hardcoded and cannot be edited through the current admin UI.
- The static image URLs are external Unsplash URLs.

---

### 2.26 API Route Group: Customer Authentication APIs

> These routes are legacy server-side auth helpers. The current `/signin`, `/signup`, and hidden admin login UI primarily use the browser Supabase client through `AuthContext`/`getSupabaseClient()`, so these endpoints are not the main UI path.

#### 2.26.1 `POST /api/auth/signin` — `app/routes/api.auth.signin.tsx`

**Purpose:** Server-side email/password sign-in helper.

**Request body:** `{ email, password }`; both are required.

**Behavior:**
- Uses the server Supabase client.
- Calls `auth.signInWithPassword()`.
- Returns `{ user }` with HTTP 200 on success.
- Returns HTTP 401 with the Supabase error message on authentication failure.
- Returns HTTP 400 for missing fields or invalid requests.

**Authorization:** None beyond valid Supabase credentials.

**Session behavior:**
- This route uses `getSupabaseServerClient()`, not the cookie-aware `createServerSupabaseClient()`.
- It returns the user object but does not explicitly return `Set-Cookie` headers to establish a browser session.

**Current consumers:** No current storefront UI route calls this endpoint directly.

---

#### 2.26.2 `POST /api/auth/signup` — `app/routes/api.auth.signup.tsx`

**Purpose:** Server-side customer sign-up helper.

**Request body:** `{ email, password, name }`; all are required.

**Behavior:**
- Uses the server Supabase client.
- Calls `auth.signUp()` with `user_metadata.full_name = name`.
- Returns `{ user }` with HTTP 201 on success.
- Returns HTTP 400 with the Supabase error message on failure.

**Authorization:** None beyond Supabase auth configuration.

**Session behavior:**
- Like `/api/auth/signin`, it does not explicitly return session cookies.
- It does not create or synchronize a `customers` row.

**Current consumers:** No current storefront UI route calls this endpoint directly.

---

#### 2.26.3 `GET /api/auth/google` and `POST /api/auth/google` — `app/routes/api.auth.google.tsx`

**Purpose:** Initiate Google OAuth sign-in/sign-up.

**Methods:** Both GET and POST call the same `initiateGoogleAuth()` helper.

**Query parameters:**
- `next`: destination after callback; defaults to `/`.
- The callback URL is constructed as `<appOrigin>/api/auth/callback?next=<encoded next>`.
- `appOrigin` comes from `process.env.APP_URL` when set; otherwise it uses the request origin.

**Behavior:**
- Creates a cookie-aware server Supabase client.
- Calls `auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`.
- Redirects the browser to Supabase's OAuth URL.
- Returns the server client's cookie headers with the redirect.

**Authorization:** None; any caller can initiate the flow.

**Current consumers:** The current `/signin` and `/signup` pages call `AuthContext.signInWithGoogle()` rather than this endpoint directly.

**Special logic / limitations:**
- The route does not distinguish sign-in from sign-up; Supabase determines whether the Google account already exists.
- It relies on the callback route to exchange the returned code and complete the session.

---

#### 2.26.4 `GET /api/auth/callback` — `app/routes/api.auth.callback.tsx`

**Purpose:** Complete the Google OAuth code exchange, establish the server session, optionally synchronize the customer, and redirect.

**Query parameters:**
- `code`: OAuth code from Supabase
- `next`: destination after completion; defaults to `/`
- `error` / `error_description`: OAuth error details

**Behavior:**
1. If an OAuth error is present, redirects to `/?error=...&description=...`.
2. If `code` is missing, redirects to `/?error=no_code`.
3. Creates a cookie-aware server Supabase client.
4. Calls `exchangeCodeForSession(code)`.
5. If exchange fails or no session is returned, redirects to `/?error=exchange_failed`.
6. If `next` starts with the hidden admin namespace and the user email does not match the configured owner email, redirects to `/?error=access_denied`.
7. Reads `full_name` or `name` from user metadata.
8. Sends a minimal `{ email, name }` POST to `/api/customers` to synchronize the customer record.
9. Redirects to `next` with the session cookie headers.

**Authorization:**
- Normal customer destinations are allowed for any successfully authenticated Google user.
- Hidden-admin destinations require the configured owner email.

**Current consumers:** Google OAuth flow initiated by the current auth UI.

**Special logic / limitations:**
- Customer synchronization errors are ignored.
- The owner-email comparison is a separate, stricter rule from the `admin_users` table check used by the hidden admin loader.
- The callback returns a loading screen only if rendered directly without a valid callback query.

---

#### 2.26.5 `POST /api/auth/signout` — `app/routes/api.auth.signout.tsx`

**Purpose:** Legacy server-side sign-out helper.

**Behavior:**
- Accepts POST only; other methods return HTTP 405.
- Uses the server Supabase client and calls `auth.signOut()`.
- Returns `{ success: true }` with HTTP 200 on success.
- Returns HTTP 500 with `Failed to sign out` on failure.

**Authorization:** None.

**Session behavior:**
- The route does not explicitly clear browser cookies in its response.
- Current UI sign-out flows use `AuthContext.signOut()` or the hidden admin logout action instead.

**Current consumers:** No current storefront UI route calls this endpoint directly.

---

*(Part 2 route/API documentation is complete. Part 3 covers shared components, context providers, Supabase clients, database helpers, configuration, and deployment in greater detail below.)

## 3. SHARED COMPONENTS, STATE, DATA, AND CONFIGURATION

### 3.1 Application Shell — `app/root.tsx`

**What it does:** Defines the document shell, global providers, metadata, fonts, favicon, and the global authentication-prompt listener for the whole Remix application.

**Root loader:**
- Reads Cloudflare environment configuration from `context.cloudflare.env`.
- Returns the Supabase URL and anon key to the browser for `AuthProvider`.
- These are client-safe configuration values; secret/service-role credentials are never passed through this loader.

**Provider order:**
```tsx
<StoreProvider>
  <AuthProvider supabaseUrl={...} supabaseAnonKey={...}>
    <ThemeProvider>
      <Outlet />
      <AuthPromptModal />
    </ThemeProvider>
  </AuthProvider>
</StoreProvider>
```

**Document metadata:**
- Language: `en-IN`
- Title: `Femiknit | Indian Ethnic Wear for Every Generation`
- Description: Indian ethnic-wear storefront description
- Open Graph title/description/type
- Favicon: `/favicon.svg`

**External assets:**
- Google Fonts: Inter and Noto Serif Devanagari
- Font stylesheets are loaded through `<Links />`
- `ScrollRestoration` and Remix `<Scripts />` are rendered at the end of the body

**Entry point behavior:**
- `app/entry.server.tsx` receives the React element from `handleRequest`, renders it to a string via `renderToString`, and wraps it in a full HTML document with `<meta>`, `<links>`, and `<scripts>` tags.
- `app/entry.client.tsx` receives the same element and hydrate the browser tree under `React.StrictMode` using `hydrateRoot`. StrictMode double-invokes effects in development, which helps detect side effects.
- The entry files do not add custom error boundaries; those are handled per-route (notably in the admin root).

**Error/entry behavior:**
- `app/entry.server.tsx` renders the Remix server tree with `renderToString`.
- `app/entry.client.tsx` hydrates the browser tree under `React.StrictMode` using `hydrateRoot`.
- No global error boundary exists at the root level; route-level `ErrorBoundary` components handle errors individually (admin root has a custom Chrome-style 404; other routes rely on Remix default error handling).

**Special logic / important implementation notes:**
- The root loader exposes the Supabase URL and anon key as loader data; it does not expose the service-role key.
- `AuthPromptModal` is mounted globally, so any route can request authentication through the `open-auth-modal` browser event.
- The app shell does not include the main `Header` or `FloatingCart`; individual pages decide whether to render them.
- The root loader is the only place where environment configuration flows from Cloudflare Workers to the browser. All downstream consumers depend on this data being present.
- The `renderToString`/`hydrateRoot` pattern means the initial HTML is server-rendered and then React takes over on the client, enabling fast first paint but requiring matching DOM structure between server and client.

---

### 3.2 Shared Component: Header — `components/Header.tsx`

**What it does:** Sticky storefront navigation with logo, desktop/mobile search, authentication-aware account controls, wishlist count, sign-up CTA, mobile drawer, and global store toasts.

**State and context used:**
- `StoreContext`: `wishlistCount`, `wishlistToast`, `cartToast`
- `AuthContext`: `user`, `loading`
- Local state: `menuOpen`
- Remix `useLocation` is imported but not used in the current implementation

**Main UI areas:**
1. Sticky header with translucent white/dark background and blur
2. Logo link to `/`
3. Desktop centered search field (visible from `md`)
4. Authentication controls:
   - Loading skeleton while auth initializes
   - Account link when signed in
   - Login and Sign up links when signed out
   - Wishlist link and count when signed in
5. Mobile search row (visible below `md`)
6. Global wishlist toast (bottom center)
7. Global cart toast (above wishlist toast)
8. Mobile navigation drawer

**Navigation behavior:**
- Logo and account links use Remix `Link`
- Login/sign-up/account/wishlist links use Remix `Link`
- Mobile nav category links are plain anchors:
  - `Sale` points to `#shop`
  - All other category links point to `#`
- Opening/closing the mobile drawer updates local state
- Selecting a mobile nav link closes the drawer for logo/login/sign-up/account links; category anchors do not close it

**Search behavior:**
- Desktop and mobile search inputs are visual only
- Search buttons have no submit handler
- No query parameter, route navigation, or product filtering is triggered

**Loading/error/empty states:**
- Auth initialization renders a pulsing circular placeholder on desktop
- Toasts appear only when StoreContext has a non-empty message
- No network requests are made by this component

**Mobile/responsive behavior:**
- Header controls collapse below `sm`
- Desktop search is hidden below `md`
- Mobile search appears below the main row
- Drawer is fixed, right-aligned, width 320px, max 86vw, with spring slide-in/out

**Animations/interactions:**
- Framer Motion drawer and toast transitions
- Hover styles for nav and auth controls
- Dark-mode classes throughout

**Special logic / important implementation notes:**
- Wishlist is only shown to authenticated users in the header.
- The component consumes global toast state but does not clear it; StoreContext manages toast lifetime.
- `useLocation` is currently dead imported state.
- Search is not connected to `/shop` or the product API.

---

### 3.3 Shared Component: HeroCarousel — `components/HeroCarousel.tsx`

**What it does:** Homepage hero carousel with backend banner fallback, automatic rotation, manual controls, and responsive full-width imagery.

**Data loading order:**
1. `GET /api/banners`
2. If no non-empty array is returned, `GET /api/hero-slides`
3. If both fail or return no slides, renders nothing

**Slide shape:**
- `id` (optional)
- `title`
- `subtitle`
- `cta`
- `badge`
- `image`

**Behavior:**
- Active slide index starts at 0
- Auto-advances every 5,400 ms while slides exist
- Previous/next buttons wrap around the slide list
- Dot indicators select a specific slide
- Image and text use keyed Framer Motion crossfade/scale transitions

**UI structure:**
1. Full-width dark section
2. Background image with gradient overlay
3. Badge, title, subtitle, and CTA button
4. Bottom dot indicators
5. Left/right arrow buttons

**Loading/error/empty states:**
- Shows “Loading...” in a tall dark section while the first request is pending
- Returns `null` if no slide is available
- Fetch errors are silently ignored and trigger the fallback path

**Mobile/responsive behavior:**
- Minimum height 560px on small screens, 640px at `sm`
- Desktop height `78vh` with a 560px minimum
- Text and controls adapt through Tailwind breakpoints

**Animations/interactions:**
- Background image crossfades and scales
- Text slides in from the left
- CTA scales on hover
- Dots and arrows are interactive buttons with accessible labels

**Special logic / important implementation notes:**
- Banner records are mapped into the slide shape; static fallback records are used as returned.
- The timer dependency is only `slides.length`, so replacing the array with a different non-empty set does not reset the timer.
- The CTA button has no navigation handler in this component.

---

### 3.4 Shared Component: GenderProductShowcase — `components/GenderProductShowcase.tsx`

**What it does:** Homepage product catalog with backend product loading, frontend transformation, filters, sorting, responsive sidebar/drawer, product cards, and a detailed product modal.

**Data loading:**
- Fetches `GET /api/products` once on mount
- Stores raw backend records and transformed frontend records separately
- Loading state shows “Loading collections...”
- Fetch failures produce an empty product list

**Backend-to-frontend transformation:**
- `name` → `title`
- `category` → frontend category
- `variants[].size` → unique size list
- `variants[].color` → color names with placeholder hex `#000000`
- `discountPrice || price` → current price
- `price` → MRP
- `ageGroup` mapping:
  - Children → Kids
  - Young Adults → Youth
  - Adults → Adults
  - Elders → Elders
  - unknown → Adults
- `subcategory || "Casual"` → occasion
- Rating is fixed at `4.0`
- Badge is preserved when present

**Filters:**
- Keyword query: title or category
- Fabric/category: compares frontend product’s backend `gender`
- Size: checks transformed size list
- Color: checks transformed color names
- Price: maximum price slider, default 5,000, range 900–5,000 in steps of 100
- Sort: Featured, Price low→high, Price high→low, Newest
- Active-filter chips can remove individual filters
- Reset restores all initial values

**Product detail modal:**
- Backend product data is used directly
- Image thumbnails switch the main image
- Variant table lists size, color, and stock
- Size and color selectors initialize to the first available values
- Total stock and low/in-stock status are derived from variants
- Add to Cart requires authentication:
  - Signed-out users dispatch `open-auth-modal` with source `cart`
  - Signed-in users call `StoreContext.addToCart`
- Modal closes on backdrop click, X button, or Escape key

**Responsive layout:**
- Desktop (`lg`): 4-column filter sidebar + 8-column product area
- Mobile/tablet: filter button opens a left drawer; product grid is 1–2 columns
- Filter drawer and modal use fixed overlays with Framer Motion transitions

**Actions available:**
- Search/filter/sort products
- Reset filters
- Remove individual active filters
- Open product details
- Select image/size/color
- Add product to cart when authenticated
- Close modal/drawer with controls or Escape

**Loading/error/empty states:**
- Loading text while fetching
- “No products found matching your filters.” on desktop
- “No products found.” on mobile
- Empty variant lists still render a modal with no selectable values

**Animations/interactions:**
- Product cards use layout and while-in-view animations
- Filter drawer and modal use spring/fade transitions
- Active filter chips and controls have hover/focus states
- Product modal image thumbnails update immediately

**Special logic / important implementation notes:**
- Fabric filter is labeled “Categories” but compares the backend `gender` field.
- Color hex values are placeholders; no real color swatches are rendered.
- The frontend category type only allows Sarees/Kurtis/Kids Wear, but the cast accepts any backend category string.
- “Featured” sorting alphabetically sorts titles rather than using a backend ranking.
- “Newest” sorts lexicographically by product ID, not by creation timestamp.
- The mobile filter drawer omits keyword search even though the desktop sidebar includes it.
- The product modal does not check selected variant stock before adding to cart.

---

### 3.5 Shared Component: ProductCard — `components/ProductCard.tsx`

**What it does:** Reusable product card for homepage and other catalog surfaces, with image rotation, wishlist, cart, buy-now, detail action, and authentication gating.

**State and context used:**
- `StoreContext`: `addToCart`, `toggleWishlist`, `wishlist`, `cartToast`
- `AuthContext`: `user`
- Local state: hovered, imageIndex, login-modal visibility, pending action
- `useRef` prevents the first hover-effect run from resetting the image index

**Card contents:**
1. Animated image frame with hover zoom
2. Badge
3. Wishlist heart button
4. Image progress indicators
5. Title
6. Price and MRP
7. Add to Cart
8. Buy Now
9. View Details

**Image behavior:**
- Cycles through `product.images` every 900 ms while hovered
- Resets to image 0 when hover ends
- Progress bars show the active image
- Uses `AnimatePresence mode="wait"` for crossfades

**Authentication gating:**
- Add to Cart, Buy Now, and Wishlist all require `user`
- Signed-out users open the card’s local login prompt
- The prompt offers Go Back or Register (`/signup`)
- The prompt does not offer a direct `/signin` link

**Cart behavior:**
- Add to Cart uses the first size or `Free Size`
- Uses the first color or `Default`
- Buy Now adds the item and dispatches `open-cart`
- The component does not open a cart UI itself

**Wishlist behavior:**
- Heart is filled only for authenticated users with the product in the wishlist
- Signed-out users see a disabled-looking gray heart and are prompted to register

**Loading/error/empty states:**
- No internal loading state
- Empty image arrays can produce an undefined image key/source
- StoreContext toast state is rendered by Header/FloatingCart, not this card

**Mobile/responsive behavior:**
- Card is fluid within its parent grid
- Buttons stack in a two-column action grid
- Image frame maintains a 4:5 aspect ratio

**Animations/interactions:**
- Layout/while-in-view entrance animation
- Hover border glow and image scale
- Image crossfade and progress bars
- Login prompt scale/fade
- Button active-scale feedback

**Special logic / important implementation notes:**
- `pendingAction` is set but never used to change prompt text or resume the original action after login.
- The local login prompt duplicates part of the global `AuthPromptModal` behavior.
- The component imports unused icons `X` and `Eye` in the current implementation.
- Product IDs and image arrays must be stable for the animation keys to behave correctly.

---

*(Part 3 continues in greater detail below: remaining shared components, context providers, Supabase clients, database helpers, configuration, and deployment.)

### 3.6 Shared Component: AuthPromptModal — `components/AuthPromptModal.tsx`

**What it does:** Globally mounted authentication prompt triggered by browser custom events from protected shopping actions.

**Event contract:**
- Listens for `open-auth-modal`
- Accepts `detail.source` values:
  - `wishlist` → “Save Your Favorites”
  - `cart` → “Start Shopping”
- Unknown sources are ignored

**UI:**
1. Dark blurred backdrop
2. Source-specific icon: Heart or ShoppingBag
3. Title and explanatory copy
4. Sign In button → `/signin`
5. Create Account button → `/signup`

**Behavior:**
- Opens when a matching event is dispatched
- Closes on backdrop click, X button, or after selecting either navigation link
- Does not dispatch any action after successful login; the originating component must retry or handle the pending action

**Loading/error/empty states:** None.

**Mobile/responsive behavior:** Centered fixed modal, max width 448px, padded for small screens; dark-mode classes are supported.

**Animations/interactions:** Framer Motion fade/scale entrance and exit.

**Special logic / important implementation notes:**
- The global modal and `ProductCard`’s local login prompt overlap in purpose but are separate implementations.
- `GenderProductShowcase` dispatches this event for signed-out cart actions.
- The modal itself does not authenticate users or inspect session state.

---

### 3.7 Shared Component: FloatingCart — `components/FloatingCart.tsx`

**What it does:** Fixed bottom-right cart button, slide-up cart drawer, quantity controls, clear-cart action, and WhatsApp checkout handoff.

**State and context used:**
- `StoreContext`: cart items/count/total, quantity updates, removal, clear, cart toast
- `AuthContext`: current user
- Local state: drawer open/closed, checkout-info modal visibility

**Cart drawer contents:**
1. Cart header with item count, Home link, and close button
2. Cart items with image, title, size/color, quantity stepper, line total, and remove button
3. Grand total
4. Checkout via WhatsApp
5. Clear Cart

**Cart behavior:**
- Item identity is `(id, size, color)`
- Quantity cannot go below 1 through the stepper
- Removing the final item closes the drawer through an effect
- Cart state is persisted by `StoreContext` to `localStorage`

**Checkout flow:**
1. Reads `femiknit_phone` and `femiknit_address` from `localStorage`
2. If either is missing, opens “Complete Your Profile” modal
3. Modal links to `/account`, where the user can add the details
4. If both exist, builds a formatted order message and opens a WhatsApp URL in a new tab
5. The cart is not cleared automatically after opening WhatsApp

**Current checkout destination:** The component contains a hardcoded WhatsApp number in its `wa.me` URL. It differs from the number used by `/shop` and the returns policy.

**Loading/error/empty states:**
- Empty drawer shows “Your cart is empty”
- No network requests or async loading state
- Missing profile details are handled by the modal rather than an error

**Mobile/responsive behavior:**
- Drawer width 360px, capped at `calc(100vw - 32px)`
- Floating button is fixed at bottom-right
- Item list has a 320px maximum height and scrolls internally

**Animations/interactions:**
- Drawer scale/fade entrance
- Cart items use layout/popLayout transitions
- Floating button tap scale and chevron rotation
- Toast slide/fade transitions

**Special logic / important implementation notes:**
- The component does not require authentication to open or manage the cart.
- It reads profile details from localStorage keys written by `/account`; `/shop` uses a different `femiknit_customer` object.
- Checkout is a messaging handoff, not a payment or order-record creation flow.
- The hardcoded checkout number should be treated as a configuration inconsistency to resolve before production use.

---

### 3.8 Shared Component: Footer — `components/Footer.tsx`

**What it does:** Storefront footer with brand block, newsletter form, navigation columns, social placeholders, and decorative mandala shapes.

**Main UI areas:**
1. Femiknit logo and brand name
2. Newsletter copy, email input, and “Get Coupon” button
3. Shop, Support, Policies, and Femiknit link columns
4. Copyright/credit line
5. Instagram, Facebook, and Twitter placeholder links

**Navigation behavior:**
- Returns and shipping links navigate to `/policies/returns` and `/policies/shipping`
- Most category, support, company, and social links use `#` placeholders
- Newsletter form has no submit handler or persistence logic

**Loading/error/empty states:** None.

**Mobile/responsive behavior:**
- Two-column brand/navigation layout on large screens
- Link columns stack on small screens
- Decorative mandala elements are absolutely positioned and clipped by the footer

**Animations/interactions:** Hover color transitions for links and social buttons.

**Special logic / important implementation notes:**
- “Get Coupon” is visual-only.
- Social icons do not link to external profiles.
- The footer does not expose a theme toggle or contact details beyond the newsletter form.

---

### 3.9 Shared Component: FAQSection — `components/FAQSection.tsx`

**What it does:** Homepage FAQ accordion with four categories and eight questions.

**Categories:**
- Orders & payments (2)
- Shipping & delivery (2)
- Returns, exchanges & refunds (3)
- Support (1)

**Behavior:**
- Each item owns local `open` state
- Clicking the question toggles its answer
- Answer height animates from 0 to auto
- Chevron rotates 180 degrees when open

**Contact action:**
- “Still need help? Contact support” uses `mailto:support@femiknit.com`
- This address is separate from the placeholder contact text in the policy/FAQ route content

**Loading/error/empty states:** None; content is hardcoded.

**Mobile/responsive behavior:** Single-column accordion within a max-width container.

**Animations/interactions:** Framer Motion while-in-view item entrances and answer-height transitions.

**Special logic / important implementation notes:**
- The homepage FAQ is a shorter subset of `/policies/faq`; the two sources are maintained separately.
- Support contact placeholders in the policy route are not replaced by this component’s mailto link.

---

### 3.10 Shared Component: TrustBadges — `components/TrustBadges.tsx`

**What it does:** Static four-card trust section.

**Cards:**
- 100% Authentic Handloom
- Easy Returns
- Express Delivery
- Secure Payments

**Behavior:** Read-only; no links, forms, or API calls.

**Loading/error/empty states:** None.

**Mobile/responsive behavior:** One column by default, two at `sm`, four at `lg`.

**Animations/interactions:** While-in-view staggered entrances and hover lift.

**Special logic / important implementation notes:** Claims are hardcoded marketing copy and are not verified against operational systems.

---

### 3.11 Shared Component: WhatsAppUpdatesSection — `components/WhatsAppUpdatesSection.tsx`

**What it does:** Homepage call-to-action encouraging visitors to join the Femiknit WhatsApp channel.

**Content:**
- Heading: “Stay in the Loop”
- Four benefit tiles: new arrivals, events, offers, announcements
- “Join WhatsApp Channel” external link
- “No spam, unsubscribe anytime.” note

**Behavior:**
- Link opens in a new tab with `rel="noopener noreferrer"`
- No tracking, subscription form, or analytics event is implemented

**Loading/error/empty states:** None.

**Mobile/responsive behavior:** Benefit tiles use two columns on small screens and four on larger screens; the card padding and typography scale at `sm`.

**Animations/interactions:** Staggered Framer Motion while-in-view entrances and a spring-scaled CTA.

**Special logic / important implementation notes:**
- The channel URL is hardcoded in the component.
- The component does not verify channel membership or capture leads.

---

### 3.12 Shared Component: ShopExperience — `components/ShopExperience.tsx`

**What it does:** Alternate catalog/filter implementation resembling the homepage showcase, with a product detail modal and product cards.

**Current usage:** No application route imports or renders this component; it is currently dormant source code.

**Data loading:** Fetches `GET /api/products`, stores raw and transformed records, and renders loading/empty states.

**Filters:**
- Keyword query
- Category
- Fabric type
- Size
- Color
- Maximum price
- No sort control

**Product detail modal:**
- Image thumbnails
- Variant table
- Size/color selectors
- Add to Cart button
- Unlike the homepage showcase modal, this version does not gate Add to Cart on authentication; `ProductCard` still gates its own cart action.

**Layout:**
- Desktop: one-column filter sidebar + three-column product area
- Product grid: one to three columns by breakpoint
- Section has `id="shop"` for anchor navigation

**Loading/error/empty states:** Loading text, no-products message, and modal state are implemented locally.

**Animations/interactions:** Framer Motion layout transitions, while-in-view card entrances, modal, and filter controls.

**Special logic / important implementation notes:**
- Duplicates much of `GenderProductShowcase` but lacks its sort options, mobile filter drawer, active-filter chips, and auth-gated detail modal.
- The component is not reachable from the current route tree unless a future route imports it.

---

### 3.13 Shared Component: Motifs — `components/Motifs.tsx`

**What it does:** Decorative SVG primitives used by the homepage festive and divider sections.

**Exports:**
- `ToranSvg`: nine animated pennants on a curved thread
- `RotatingMandala`: continuously rotating circular mandala
- `MandalaDivider`: gradient rules with a centered rotating mandala and label

**Animation behavior:**
- Toran thread path length pulses over 8 seconds
- Pennants rotate on individual loops
- Small lower ornaments rotate independently
- Mandala completes one rotation every 28 seconds

**Accessibility:** SVGs use `aria-hidden="true"` and contain no interactive controls.

**Special logic / important implementation notes:**
- `FestiveFeature` renders the toran normally and upside-down to frame its content.
- Motion continues even when the decorative section is off-screen because no viewport gating is applied.

---

### 3.14 Context Provider: AuthContext — `context/AuthContext.tsx`

**What it provides:**
- `user`: normalized `{ id, email, name, avatar_url } | null`
- `loading`
- `signIn(email, password)`
- `signUp(email, password, name)`
- `signInWithGoogle()`
- `signOut()`

**Initialization:**
- Receives Supabase URL and anon key from the root loader
- Initializes the cached browser client when both are present
- Reads the current session, retries refresh up to three times, then subscribes to auth-state changes
- Sets `loading=false` in all initialization paths (even on error)
- The retry loop handles brief network interruptions during page load

**User normalization:**
- Name comes from `user_metadata.full_name` or `name` (fallback chain)
- Avatar comes from `user_metadata.avatar_url` or `picture` (Google OAuth uses `picture`)
- Missing email is normalized to an empty string

**Customer synchronization in detail:**
- Triggered after: email/password sign-in, email/password sign-up, Google session events, pending-queue processing
- `syncCustomer()` posts a customer record to `/api/customers` with retry logic:
  - Attempt 1: Immediate
  - Attempt 2: After 1 second
  - Attempt 3: After 2 seconds
- Failed records are queued in localStorage under `pending_customers`
- A 5-second interval retries all queued records
- Pending records are also retried during auth initialization (covers the case where sync failed on a previous page load)
- Sync errors are logged and queued rather than blocking authentication — the user can still use the site even if sync fails

**Google flow in detail:**
- Calls browser Supabase OAuth with provider `google`
- Redirects to `<current origin>/api/auth/callback`
- The callback completes the session exchange and may synchronize the customer server-side
- The redirect target comes from the `next` query parameter

**Sign-out in detail:**
- Calls browser Supabase `auth.signOut()`
- Auth-state subscription clears the local user
- Does NOT clear localStorage cart/wishlist/customer data

**Loading/error/empty states:**
- Initialization errors are ignored and `loading` is cleared
- Customer sync errors are logged and queued rather than blocking authentication

**Special logic / important implementation notes:**
- The provider does not enforce route-level authentication; pages decide whether to gate actions.
- `PENDING_CUSTOMERS_KEY` is a localStorage queue, not a server-side outbox.
- The provider depends on the root loader supplying valid client configuration; missing configuration can leave the client uninitialized.
- The context exposes no password-reset, email-verification, or session-expiry-specific UI.

---

### 3.15 Context Provider: StoreContext — `context/StoreContext.tsx`

**What it provides:**
- Cart items, count, and total
- Wishlist Set, ID array, and count
- Add/remove/update/clear cart operations
- Toggle/remove wishlist operations
- Wishlist and cart toast messages

**Persistence details:**
- Wishlist: `femiknit_wishlist` as a JSON array of product IDs
- Cart: `femiknit_cart` as a JSON array of cart items
- Both are loaded on provider mount (inside `try/catch` to handle malformed data) and written on every state change
- Write is synchronous; no debounce or batching
- If localStorage is unavailable (private browsing, storage full), persistence silently fails

**Cart identity and deduplication:** `(id, size, color)` tuple
- Existing matching items increment quantity (not append a duplicate)
- New items append with the supplied quantity
- Quantity updates clamp to a minimum of 1 (cannot reach 0 via stepper)
- Clear removes all items entirely
- Cart identity is defined in `StoreContext` but also checked independently in `/shop`

**Wishlist identity and behavior:** product ID string
- Toggle adds/removes from a `Set` (not an array — avoids duplicates by nature)
- Removal emits the same "Removed from wishlist" toast as toggling off from a different source
- `wishlistIds` is derived by converting the Set to an array for components that need list semantics

**Derived values (computed on every render):**
- `cartCount`: sum of all item `quantity` fields (not number of line items)
- `cartTotal`: sum of `price * quantity` for each line item (uses current price at time of calculation, not locked-in price)
- `wishlistCount`: Set size
- `wishlistIds`: Set converted to an array

**Toasts in detail:**
- Wishlist toast lifetime: 2.5 seconds
- Cart toast lifetime: 2.5 seconds
- Toast state is global to the provider and rendered by Header and FloatingCart (not by this provider directly)
- Toasts are not queued; a new toast replaces the current one
- Toast state is never cleared by this provider; Header and FloatingCart manage display independently

**Loading/error/empty states:** None; persistence errors are silently ignored during load/write.

**Special logic / important implementation notes:**
- The store is entirely client-side; it does not validate stock, prices, or server inventory.
- It does not synchronize cart or wishlist changes to Supabase.
- A malformed persisted cart/wishlist entry is ignored by the load `try/catch`.
- The provider does not enforce authentication; auth gating is implemented in individual components.
- The cart total uses the live price from the product data at calculation time; if a price changes, the cart total changes retroactively.
- There is no order history or purchase record associated with the cart — it exists purely as a transient shopping container.

---

### 3.16 Context Provider: ThemeContext — `context/ThemeContext.tsx`

**What it provides:**
- `theme`: `"light"` or `"dark"`
- `toggleTheme()`

**Persistence:**
- Reads `femiknit_theme` from localStorage during initialization
- Writes the current theme on every change
- Applies or removes the `dark` class on `document.documentElement`

**Default:** Light theme when no valid stored value exists.

**Current usage:** No application component currently calls `useTheme`; the provider is mounted but has no visible theme toggle.

**Loading/error/empty states:** None.

**Special logic / important implementation notes:**
- Theme state is browser-local and does not affect the admin shell, which uses its own dark sidebar styling.
- The provider assumes it runs in a browser; initialization guards `window` access.

---

*(Part 3 continues in greater detail below: Supabase clients, database helpers, static data files, configuration, and deployment.)

### 3.17 Supabase Client Layer — `lib/supabase.ts`

**Purpose:** Provides the browser-side Supabase client used by `AuthContext` and the browser portion of the hidden admin login.

**Client creation:**
- `initializeBrowserClient(supabaseUrl, supabaseAnonKey)` creates one cached `@supabase/ssr` browser client.
- The client is configured with `auth.flowType = "pkce"`.
- `getSupabaseClient()` returns the cached client or creates one from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when initialization has not already occurred.
- Missing browser credentials produce `Missing Supabase client credentials.`.
- `export const supabase` is a typed `null` placeholder and is not the active client used by the current authentication flow.

**Configuration source:**
- The root Remix loader supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `context.cloudflare.env` or process environment fallback.
- These are the client-safe project URL and anon/public key. The service-role key is never passed through the root loader.
- The browser client stores the Supabase session using the SSR client's cookie mechanism; the application also uses browser auth events to maintain React state.

**Current consumers:**
- `context/AuthContext.tsx` for customer email/password, Google OAuth, session initialization, and sign-out.
- `app/routes/RJl2QWe2qR!AEQ5CbWRv.tsx` for client-side hidden-admin email/password sign-in and sign-up.

**Important implementation detail:** The browser client is cached globally for the lifetime of the page. Re-initialization with different credentials does not replace an existing cached client.

---

### 3.18 Server Supabase and Authorization Helpers — `lib/supabase-server.ts`

**Purpose:** Creates server-side Supabase clients, preserves request cookies, and performs owner/admin authorization checks.

#### 3.18.1 Environment resolution

The helper resolves configuration in this order:

1. Cloudflare `context.cloudflare.env` values passed by `worker.js`
2. `process.env` values
3. For the anon key and URL only, `import.meta.env.VITE_SUPABASE_*` fallback

Environment variable names used:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OWNER_EMAIL`

The service-role key is required for `getSupabaseServerClient()` and `requireAdmin()`. Its value is intentionally not included in this document.

#### 3.18.2 Server clients

**`getSupabaseServerClient(env?)`**
- Creates a direct `@supabase/supabase-js` client with the service-role key.
- Disables automatic token refresh and session persistence.
- Used by legacy auth API routes and `lib/db.tsx` for privileged database/storage operations.

**`createServerSupabaseClient(request, env?)`**
- Creates an `@supabase/ssr` server client with the anon key.
- Parses the incoming `Cookie` header into a name/value map.
- Captures cookies returned by Supabase through the `setAll` callback.
- `getHeaders()` converts captured cookies into `Set-Cookie` headers with a one-year max age and `path: "/"`.
- Callers must attach `getHeaders()` to redirects or responses when they need the browser session updated.

**Cookie parsing behavior:**
- Cookie values are decoded with `decodeURIComponent` where possible.
- Values containing `=` are preserved by joining the remaining split parts.
- Parsing is local code rather than a framework cookie middleware abstraction.

#### 3.18.3 `requireOwner(request, env?)`

**Authentication and authorization:**
1. Resolves the Supabase URL, anon key, and `OWNER_EMAIL`.
2. Creates a cookie-aware server client.
3. Calls `supabase.auth.getUser()`.
4. Returns 404 when there is no valid user.
5. Compares `user.email` to `OWNER_EMAIL` using exact string equality.
6. Returns 404 when the email does not match.
7. Returns the user and any session-refresh headers when authorized.

**Important distinction:** `requireOwner()` does not normalize email casing or whitespace. It is a separate, stricter owner check used by the Google callback path, not the same mechanism as `requireAdmin()`.

#### 3.18.4 `requireAdmin(request, env?)`

**Authentication step:**
1. Creates a cookie-aware server client using the anon key.
2. Calls `supabase.auth.getUser()` against the request cookies.
3. Returns HTTP 401 when no valid authenticated user exists.
4. Returns HTTP 403 when the user has no email.

**Authorization step:**
1. Creates a second direct Supabase client using the service-role key.
2. Normalizes the authenticated email with `trim().toLowerCase()`.
3. Queries `public.admin_users` for a row whose `email` matches the normalized email and whose `role` equals `admin`.
4. Uses `.maybeSingle()` for the lookup.
5. Returns HTTP 403 when the row is absent or the query fails.
6. Returns the authenticated user and captured session headers when authorized.

**Authentication vs. authorization:**
- Supabase Auth establishes *who is logged in*.
- `requireAdmin()` separately establishes *whether that user is allowed to administer the site*.
- A normal customer can have a valid Supabase session and still receive 403 from `requireAdmin()`.

**Diagnostics:** The helper logs configuration-presence booleans, the authenticated email, normalized email, admin lookup result, and admin error message to the browser/server console. No key or token value is intentionally logged, but the email is personal data and should be treated as sensitive operational information.

**Current consumers:**
- Hidden admin parent route loader
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

**Working-tree note:** `lib/admin-auth.ts` is currently deleted in the working tree. The active hidden-admin route imports authorization helpers from `lib/supabase-server.ts`; `lib/admin-auth.ts` should not be treated as part of the current runtime path.

---

### 3.19 Product Database Helper — `lib/db.tsx`

**Purpose:** Centralizes product reads, product CRUD, variant mapping, and product-image Storage operations.

#### 3.19.1 Data types

**`ProductVariant`**
- `id: number`
- `size: string`
- `color: string`
- `stock: number`
- optional `product_id: string`

**`Product`**
- `id`, `name`, `description`
- `price` and `discountPrice` as strings
- `gender`, optional `ageGroup`, optional `category`
- `status`
- `variants`
- `images: string[]`
- optional `subcategory` and `badge`

The database column `discount_price` is mapped to the application field `discountPrice`, and `age_group` is mapped to `ageGroup`.

#### 3.19.2 Client selection

- `cachedSupabase` caches the selected Supabase client.
- The preferred client is created through `getSupabaseServerClient()` and therefore uses the service-role key.
- If service-role configuration is unavailable, the helper catches the error and falls back to an anon-key client.
- The fallback is explicitly warned with `Service role key not available, using anon client.`.
- If neither URL/key pair is available, product operations throw `Missing Supabase credentials in environment variables.`.

**Operational implication:** The fallback can allow code to continue into database/storage calls without privileged access. Depending on deployed RLS and Storage policies, writes may fail or be silently ineffective.

#### 3.19.3 Image upload

**Input:** Base64 data URLs beginning with `data:image`.

**Flow:**
1. Extract MIME type and Base64 payload.
2. Derive an extension from the MIME type, defaulting to `png`.
3. Build the Storage path `products/<productId>/<index>.<extension>`.
4. Decode Base64 into a `Uint8Array`.
5. Upload to the `product-images` bucket with `upsert: true`.
6. Generate a public URL with `getPublicUrl()`.
7. Return the public URL.

**Failure behavior:** Upload errors and exceptions are logged, and the original Base64 string is retained in the product record instead of aborting the product save.

**Important path inconsistency:** Uploads use `products/<productId>/...`, while `deleteProduct()` lists and removes files under `<productId>/...` without the `products/` prefix. Existing uploaded images may therefore not be removed by the current delete cleanup path.

#### 3.19.4 Product reads

**`getAllProducts(env?)`**
- Selects all rows from `products`.
- Orders by `id` descending.
- Returns an empty array on query errors or no rows.
- Maps each row through `mapSupabaseProduct()`.

**Current shape caveat:** `getAllProducts()` initializes `variants` to an empty array and does not fetch `product_variants`. Only `getProductById()` performs the additional variant query. Callers should not assume that the all-products response always contains populated variants.

**`getProductById(id, env?)`**
- Selects one product by ID.
- Returns `undefined` when absent or on lookup error.
- Queries `product_variants` where `product_id` equals the product ID.
- Maps variant rows into the application shape.

#### 3.19.5 Product creation

**Flow:**
1. Generate `PROD-<Date.now()>` as the product ID.
2. Upload/normalize all Base64 images.
3. Insert the product row into `products`.
4. Map the inserted row.
5. Insert all submitted variant rows with the generated product ID.
6. Return the product with client-supplied variant data attached.

**Error behavior:**
- Product insert failure throws and is converted to an API error response.
- Variant insertion failure is logged but does not roll back or reject the already-created product.
- The operation is not wrapped in a database transaction.

**Validation:** The helper does not validate price ranges, stock ranges, duplicate variants, image dimensions, or required variant fields. Validation is primarily performed by the admin form and HTML attributes.

#### 3.19.6 Product update

**Flow:**
1. Build a whitelist of supported product fields from the partial update.
2. Upload/normalize images when `images` is supplied.
3. Update the `products` row by ID.
4. If `variants` is supplied, delete all existing rows for the product.
5. Insert the submitted variant rows.
6. Return the updated product with the submitted variant array.

**Important limitations:**
- Variant replacement is not transactional.
- A variant delete/insert failure is logged but does not make the product update fail.
- The returned variant list is the submitted list, not a fresh database read.
- Empty or malformed variant arrays are not explicitly rejected here.

#### 3.19.7 Product deletion

**Flow:**
1. Delete the product row by ID.
2. Attempt to list Storage files under `<productId>/`.
3. Remove listed files.
4. Return `true` after the database deletion even if Storage cleanup fails.

**Important limitations:**
- The Storage path mismatch described above can leave uploaded files behind.
- Storage errors are caught and logged without changing the success result.
- There is no explicit check that the product existed before deletion.

---

### 3.20 Supabase Schema and RLS — `scripts/setup-supabase.sql`

**Purpose:** Defines the repository's expected Supabase tables, indexes, RLS policies, and Storage policies.

#### 3.20.1 `public.products`

Columns defined by the script:
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `description TEXT DEFAULT ''`
- `price TEXT DEFAULT '0'`
- `discount_price TEXT DEFAULT ''`
- `gender TEXT DEFAULT 'Unisex'`
- `age_group TEXT DEFAULT 'Adults'`
- `category TEXT DEFAULT ''`
- `status TEXT DEFAULT 'In Stock'`
- `images TEXT[] DEFAULT '{}'`
- `subcategory TEXT`
- `badge TEXT`
- `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`

RLS is enabled. The script defines public SELECT access and policies named for admin insert/update/delete, but those write policies use `WITH CHECK (false)` / `USING (false)`. Privileged service-role operations bypass RLS.

#### 3.20.2 `public.product_variants`

Columns:
- `id SERIAL PRIMARY KEY`
- `product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE`
- `size TEXT NOT NULL`
- `color TEXT DEFAULT 'Default'`
- `stock INTEGER DEFAULT 0`
- `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`

An index on `product_id` is created. RLS is enabled with public SELECT and false-check/false-using write policies.

#### 3.20.3 `public.customers`

Columns:
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `email TEXT NOT NULL UNIQUE`
- `phone TEXT DEFAULT ''`
- `address TEXT DEFAULT ''`
- `total_orders INTEGER DEFAULT 0`
- `total_spent TEXT DEFAULT '₹0'`
- `spent_raw NUMERIC DEFAULT 0`
- `join_date TEXT DEFAULT ''`
- `tier TEXT DEFAULT 'Standard'`
- `recent_orders JSONB DEFAULT '[]'::jsonb`
- `created_at` and `updated_at` timestamps

An email index is created. RLS policies allow authenticated users to select, insert, or update a row only when `auth.uid()::text = id`. Anonymous users have no customer access. Service-role operations bypass RLS.

**Current API mismatch:** `/api/customers` uses an anon-key client and does not attach an authenticated user context. Its upsert can therefore be blocked by RLS depending on the deployed policy evaluation. The route still returns HTTP 201 after logging a database error, so a successful HTTP response does not guarantee persistence.

#### 3.20.4 `public.admin_users`

Columns:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `email TEXT UNIQUE NOT NULL`
- `role TEXT NOT NULL DEFAULT 'admin'`
- `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`

An email index is created and RLS is enabled. The script defines a SELECT policy with `USING (false)` and false-check/false-using client write policies. The intended model is service-role/server-side-only access; the current `requireAdmin()` helper queries this table with the service-role key.

#### 3.20.5 Storage bucket and policies

The script documents creation of a public `product-images` bucket with a 5 MB file-size limit and PNG/JPEG/WebP MIME types, but the bucket creation statement is commented out. The bucket must therefore exist through Dashboard/CLI setup or another migration.

Storage policies in the script:
- Public SELECT for objects in `product-images`
- Authenticated INSERT, UPDATE, and DELETE for `product-images`

The product helper uses the service-role client when available, so it can bypass these Storage policies.

#### 3.20.6 Tables referenced by APIs but absent from the script

The current APIs reference order and inventory concepts, but `scripts/setup-supabase.sql` does not define `orders` or `inventory` tables. Their deployed schema, columns, and RLS policies are **not determinable from the current repository**. The current order/inventory endpoints return empty arrays and do not query Supabase.

---

### 3.21 Static Data and Public Assets

#### 3.21.1 `lib/constants.ts`

Defines:
- Frontend `Product` type
- `img()` Unsplash URL helper
- Three hero slides
- Four age-group tiles
- Category, size, occasion, age, and fabric option lists

Hero and age-group images are external Unsplash URLs with cropping, resizing, and quality parameters. They are not stored in Supabase.

#### 3.21.2 `lib/data.tsx`

Re-exports the product type and static collections from `lib/constants.ts`. It is a compatibility/export module rather than a separate data source.

#### 3.21.3 JSON data files

- `lib/products.json` exists and contains product-shaped records, including embedded image data. No current application source imports this file, so it is dormant seed/sample data rather than the active catalog source.
- `lib/orders.json` is an empty array.
- `lib/inventory.json` is an empty array.
- `lib/customers.json` contains one sample customer-shaped record. No current application source imports it.
- `lib/banners.json` is an empty array.
- `lib/hero-slides.json` duplicates the static hero data represented in `lib/constants.ts`, but the current hero API reads `lib/constants.ts`, not this JSON file.
- `lib/age-groups.json` duplicates the static age-group data represented in `lib/constants.ts`, but the current age-group API reads `lib/constants.ts`, not this JSON file.

#### 3.21.4 Public assets

`public/` contains:
- `images/logo.png`
- `favicon.svg` and `favicon.ico`
- legacy framework SVG placeholders
- `public/build/` compiled artifacts

The `public/build` directory contains stale compiled route artifacts, including old `routes/admin*` filenames. The source of truth for the current route tree is `app/routes/`; stale compiled assets should not be used to infer current behavior.

---

### 3.22 Build, Type, Style, and Lint Configuration

#### 3.22.1 `package.json`

Scripts:
- `npm run dev` → `remix vite:dev`
- `npm run build` → `remix vite:build`
- `npm run start` → `remix-serve ./build/server/index.js`
- `npm run lint` → `eslint .`
- `npm run typecheck` → `tsc --noEmit`

No test script or dedicated deployment script is defined.

#### 3.22.2 `tsconfig.json`

- Target: ES2022
- Browser and ES2022 libraries
- Strict TypeScript enabled
- No emit
- ESM next module resolution with bundler resolution
- React JSX automatic runtime
- JSON module resolution enabled
- Path alias `@/*` → project root
- Includes TypeScript/TSX files and excludes `node_modules`, `build`, and `dist`

#### 3.22.3 `remix.config.ts`

- Server module format is ESM.
- Route CSS files are ignored as routes.
- No server dependencies are excluded from bundling.

#### 3.22.4 `vite.config.ts`

- Uses the Remix Vite plugin with future flags for fetcher persistence, relative splat paths, and abort-reason handling.
- Uses `vite-tsconfig-paths`.
- Adds a custom `copy-public-assets` plugin that copies top-level files from `public/` into `build/client` after bundling.
- The copy plugin iterates only top-level entries; nested directories are not recursively copied by this implementation.

#### 3.22.5 Styling pipeline

- `app/globals.css` imports Tailwind CSS.
- `postcss.config.mjs` uses `@tailwindcss/postcss`.
- Tailwind v4 theme tokens define Inter/system sans, Noto Serif Devanagari/Georgia serif, marigold, crimson, and a product-glow shadow.
- A custom dark variant targets `.dark` and descendants.
- Admin pages use CSS modules under `app/admin/`.
- `/shop` uses inline styles and a local `<style>` block rather than the shared Tailwind component styling.

#### 3.22.6 ESLint

- TypeScript parser with ECMAScript 2024 module support.
- React, React Hooks, and React Compiler plugins.
- React Compiler and several hook rules are errors.
- Exhaustive dependencies and manual memoization are warnings.
- Build, dist, and node_modules outputs are ignored.

#### 3.22.7 `env.d.ts`

References `vite/client` for Vite environment typing. It does not define custom environment variable interfaces.

#### 3.22.8 Admin CSS Modules

Five CSS Modules power the admin panel styling (no Tailwind classes in admin pages):

| File | Size | Purpose |
|---|---|---|
| `app/admin/layout.module.css` | 88 lines, 1.5 KB | Admin shell layout: dark sidebar (280px), brand area, navigation items, sidebar footer, main content area |
| `app/admin/page.module.css` | 367 lines, 5.7 KB | Dashboard page: metric cards, status badges, headers, loading spinners, table styling, panel layouts |
| `app/admin/products/page.module.css` | 859 lines, 14.8 KB | Products page: product cards, stats grid, form layout (2-column grid), upload tiles, variant rows, modal styling, toast notifications |
| `app/admin/customers/page.module.css` | ~340 lines, 9 KB | Customers page: customer table, metric cards, controls bar, profile modal, search input styling |
| `app/admin/settings/page.module.css` | ~300 lines, 7.6 KB | Settings page: banner list items, add-banner form, modal, header, upload area |

**Key patterns across all admin CSS Modules:**
- Dark sidebar: `background: #0f172a` with `#1e293b` hover states and `#2563eb` active state
- Cards/panels: white background, subtle shadow, rounded corners (typically `12px`)
- Status badges: color-coded pills (green for success, amber for warning, red for error)
- Modals: centered, max-width 480-560px, with backdrop overlay
- Toast notifications: fixed position, slide-in/fade transitions, 2.5-second lifetime
- Responsive breakpoints: admin grid collapses at 768px and 1024px
- All animations use Framer Motion on top of CSS transitions for hover/focus states

**`app/admin/layout.module.css` detail:**
- `.adminLayout`: flex container, full viewport height
- `.sidebar`: 280px fixed width, dark navy (#0f172a), white text (#e2e8f0), right border in darker shade
- `.sidebarBrand`: centered logo + wordmark, white text, bottom border separator
- `.navLinks`: flex column, gap 0.5rem, padding 1.5rem 1rem
- `.navItem`: centered items, gap 0.875rem, hover background `#1e293b`, transition all 0.2s
- `.navItemActive`: blue background `#2563eb`, white text, font-weight 600
- `.sidebarFooter`: separated by top border, centered content
- `.mainContent`: flex 1, scrollable, light gray background `#f8fafc`

#### 3.22.9 Repository documentation mismatch

`README.md` is still the default Next.js/create-next-app README and describes `app/page.tsx`, port 3000, Next.js fonts, and Vercel deployment. It does not describe the actual Remix, Vite, Supabase, or Cloudflare Worker architecture.

---

### 3.23 Cloudflare Worker and Deployment Configuration

#### 3.23.1 `wrangler.toml`

Configured values:
- Worker name: `femiknit`
- Compatibility date: `2024-09-23`
- Compatibility flag: `nodejs_compat`
- Worker entry: `worker.js`
- Assets binding: `ASSETS`, sourced from `build/client`

The file also contains environment variable assignments for the Supabase URL/anon key, owner email, and app URL. Their values are intentionally omitted from this documentation. The service-role key is not shown in the `[vars]` section and must be supplied through a secret-capable environment mechanism for privileged operations.

The configured production app URL is `https://femiknit.vebmore.workers.dev`.

#### 3.23.2 `worker.js`

**Startup behavior:**
- Creates a `process.env` object when running in Cloudflare. This is necessary because Remix and its dependencies expect `process.env` to be available, but Cloudflare Workers do not provide it natively.
- Wraps it in a Proxy backed by `workerEnv`. The proxy intercepts property access and reads from the Worker `env` object (which contains secrets, variables, and bindings configured in `wrangler.toml`).
- If a requested env property is not found in `workerEnv`, the proxy returns `undefined` rather than throwing — this means missing env vars silently degrade functionality.

**Request handling:**
- Imports the compiled Remix server entry and route/asset manifest from `./build/server/index.js`.
- Creates a Remix Cloudflare request handler using `createRequestHandler` from `@remix-run/cloudflare`.
- Passes `{ cloudflare: { env } }` as the Remix context, making environment configuration available in route loaders and actions via `context.cloudflare.env`.
- Handles `/favicon.ico` with a redirect to `/favicon.svg` to avoid 404s for the browser's automatic favicon request.
- Returns a generic HTTP 500 response for uncaught handler errors. The response body is plain text ("Internal Server Error") — no JSON error envelope or stack trace is exposed to the client.

**Error logging:**
- `logError()` serializes errors and logs the following to the Cloudflare Worker console:
  - Request method and URL
  - Request path
  - All request headers (this is a security concern — see Section 5.1)
  - Timestamp
- Because all headers are logged, cookies or other sensitive request headers may be included in Worker logs. This should be remedied before production deployment.

**What worker.js does NOT do:**
- No custom routing, caching, or middleware logic
- No request/response transformation
- No A/B testing or feature flagging
- No rate limiting or request throttling
- No static file serving (handled by ASSETS binding)

#### 3.23.3 Environment flow

Browser-safe flow:
`wrangler/env → worker.js env → Remix context.cloudflare.env → app/root.tsx loader → AuthProvider → browser Supabase client`

Server-privileged flow:
`wrangler/env → worker.js env → Remix context.cloudflare.env → lib/supabase-server.ts → service-role client → Supabase`

The root loader exposes only the Supabase URL and anon key to browser code. It does not expose `SUPABASE_SERVICE_ROLE_KEY`.

#### 3.23.4 Local development

- `npm run dev` starts the Remix Vite development server.
- `.dev.vars` exists for local environment configuration and is ignored by Git.
- Local values are intentionally not reproduced here.
- The repository does not define a separate local Worker command in `package.json`.

#### 3.23.5 Build and deploy flow

- `npm run build` produces `build/client` and `build/server`.
- Wrangler serves `build/client` through the `ASSETS` binding and dispatches application requests through `worker.js`.
- No GitHub Actions workflow, Cloudflare Pages configuration, or `deploy` script was found in the repository.
- A Wrangler deployment command is therefore not established by the current repository configuration; deployment automation is **not determinable from the current repository**.

#### 3.23.6 Configuration safety notes

- `SUPABASE_SERVICE_ROLE_KEY` is a secret and must never be placed in browser code, client loader data, logs, or documentation.
- `SUPABASE_ANON_KEY` is intended to be public but should still be treated as project configuration, not application source data.
- `OWNER_EMAIL` is an authorization input and should be treated as sensitive configuration.
- `.dev.vars` is ignored by Git, but any committed configuration containing credential values should be rotated and removed from history.
- The Worker error logger currently records all request headers, which can expose cookies in production logs.

---

### 3.24 Current Data-Layer and Deployment Limitations

1. `getAllProducts()` does not populate product variants; only the single-product helper does.
2. Product image deletion uses a different Storage prefix from image upload.
3. Product create/update variant operations are not transactional.
4. The product helper can fall back from service-role to anon access when server credentials are missing.
5. `/api/customers` is unauthenticated and can report success even when the Supabase upsert fails.
6. The schema script does not define the `orders` or `inventory` tables referenced by API concepts.
7. The Worker logs all request headers, including potentially sensitive cookies.
8. `public/build` contains stale compiled artifacts from an older admin route namespace.
9. `README.md` describes Next.js/Vercel even though the active application is Remix on Cloudflare Workers.
10. No repository-defined deployment workflow or deployment script was found.

*(Part 3 data/configuration/deployment documentation is complete. Parts 4–6 cover the UI/UX inventory, security and known issues, and appendices.)*

---

## 4. UI/UX INVENTORY

### 4.1 Design System Overview

The Femiknit application uses a mixed styling approach across its pages:

| Area | Styling Method |
|---|---|
| Storefront (most pages) | Tailwind CSS v4 classes + Framer Motion |
| Admin panel | CSS Modules (`app/admin/**/*.module.css`) + Tailwind |
| `/shop` page | Inline `style={{...}}` objects + local `<style>` block (no Tailwind) |
| Animations | Framer Motion throughout |
| Icons | `lucide-react` |

**Color palette (from Tailwind v4 theme tokens):**

| Token | Usage |
|---|---|
| Marigold | Primary brand accent, CTAs, active states, wishlisted items |
| Crimson | Errors, destructive actions, delete buttons, add-to-cart hover |
| Dark/white | Primary text/background with dark mode support |
| Gray scale | Borders, placeholders, disabled states, secondary text |

**Typography:**
- Primary font: Inter (Google Fonts) for UI and body text
- Secondary font: Noto Serif Devanagari (Google Fonts) for headings and brand elements
- Serif fallback: Georgia

**Spacing:** Standard Tailwind spacing scale (p-4, m-6, gap-8, etc.) with no custom spacing tokens.

**Shadows:** Custom `product-glow` shadow token for card hover states; standard Tailwind shadows elsewhere.

### 4.2 Visual Component Inventory

Every unique UI component used across the application:

| Component | File | Used On | Reusable? |
|---|---|---|---|
| Header | `components/Header.tsx` | Homepage (all storefront pages via root) | Yes |
| Footer | `components/Footer.tsx` | Homepage | Yes (visual only) |
| HeroCarousel | `components/HeroCarousel.tsx` | Homepage | Yes |
| GenderProductShowcase | `components/GenderProductShowcase.tsx` | Homepage | Yes |
| ProductCard | `components/ProductCard.tsx` | Homepage showcase | Yes |
| AuthPromptModal | `components/AuthPromptModal.tsx` | Global (mounted in root) | Yes |
| FloatingCart | `components/FloatingCart.tsx` | Homepage (via root) | Yes |
| FAQSection | `components/FAQSection.tsx` | Homepage + `/policies/faq` | Yes |
| TrustBadges | `components/TrustBadges.tsx` | Homepage | Yes |
| WhatsAppUpdatesSection | `components/WhatsAppUpdatesSection.tsx` | Homepage | Yes |
| ShopExperience | `components/ShopExperience.tsx` | Nowhere (dormant) | Yes |
| Motifs (ToranSvg, RotatingMandala, MandalaDivider) | `components/Motifs.tsx` | Homepage festive/divider sections | Yes |
| AdminLogin | Inline in admin root | `/RJl2QWe2qR!AEQ5CbWRv` | No |
| AdminAccessDenied | Inline in admin root | Admin root (non-admin users) | No |
| Admin sidebar | Inline in admin root | All admin pages | No |
| Admin sidebar layout | `app/routes/RJl2QWe2qR!AEQ5CbWRv.tsx` | All admin child pages | No |
| Product detail modal | Multiple components | Homepage, `/shop`, wishlist | Variants |
| Cart sidebar | `/shop` page + FloatingCart | `/shop`, Homepage | Variants |
| Checkout confirmation modal | `/shop` page | `/shop` | No |
| Toast notifications | Multiple | Global | Pattern |
| Customer profile modal | Admin customers page | Admin customers | No |
| Add banner modal | Admin settings page | Admin settings | No |
| Logout confirmation modal | Admin root | Admin pages | No |
| Login prompt (local) | ProductCard | Homepage product cards | No |

### 4.3 Form Design Patterns

The application uses several distinct form patterns:

**1. Authentication forms (`/signin`, `/signup`, admin login):**
- Centered card layout (`max-w-md`, full-height white background on auth pages)
- Email field with mail icon, password field with lock icon + show/hide toggle
- Error banner (red) above the form, success banner (green) for post-action states
- Primary CTA button with loading state ("Signing in..." / "Creating Account...")
- Divider + social auth button (Google)
- Cross-navigation links (sign-in ↔ sign-up)
- Full-screen redirect overlay with spinning arrow after success (8 second delay)
- Admin login additionally has sign-up toggle with optional Full Name field

**2. Product form (admin add/edit):**
- Two-column layout above 1024px, single column below
- Four dashed upload tiles for images (despite "Max 3" heading)
- Variant rows with Size select, Color input, Stock number input
- Right sidebar shows "Categories" (taxonomy select) + Quick Tips card
- Save button with loading state and toast confirmation
- Cancel/back returns to list view without navigation

**3. Customer directory (admin):**
- Search input + tier filter tabs (All/VIP/Standard) as controls bar
- Table with avatar, name, ID, contact info, join date, View Profile action
- Sync button triggers `window.location.reload()` (not an in-place refetch)
- Profile modal with contact info and address sections

**4. Banner settings (admin):**
- Modal form with: Title, Subtitle, Badge Text, Button Text, Destination Link, Status
- Hardcoded image value `"default-banner.jpg"` (no file picker)
- "Save Changes" button on the settings page is local-only (no API call)

**5. Account edit (`/account`):**
- Profile card with avatar, name, email (read-only)
- Editable Full Name, Phone Number (enabled), Delivery Address (textarea)
- Save button transitions to "Saved Successfully!" with check icon for 2 seconds
- Logout flow with confirmation modal (Cancel / Yes, Sign Out)

**6. WhatsApp checkout (`/shop`):**
- Customer details form (name, phone, address) inside checkout modal
- Order summary review before sending
- No payment form; sends preformatted message to WhatsApp

**Common form patterns:**
- All forms use inline error/success banners rather than per-field errors
- Loading states are typically button text changes or spinner icons
- Toasts provide post-submission feedback (success or failure)
- No form uses HTML5 `required` attributes consistently; validation is primarily JS-side

### 4.4 State-Driven UI Patterns

The application consistently applies these state patterns:

**Loading states:**
- Full-page loading: "Loading..." text or spinner (homepage hero, admin dashboard panels, admin customer table)
- Button-level loading: CTA button shows "Signing in...", "Creating Account...", etc.
- Overlay loading: Full-screen "Redirecting..." with spinning arrow (auth pages after successful action)
- Some sections silently fail (wishlist fetch errors produce empty list without error message)

**Empty states:**
- Homepage product grid: "No products found matching your filters." (desktop), "No products found." (mobile)
- Cart drawer: "Your cart is empty" with empty-cart icon
- Wishlist: Heart icon + "No products wishlisted yet" + Back to Home button
- Admin dashboard: "No orders yet.", "All stock levels healthy."
- Admin customers: "No matching customer records discovered."
- Admin settings: "No active banners configured."

**Error states:**
- Auth pages: Red error banner showing `result.error` from the sign-in/sign-up call
- Admin pages: Toast notifications with error messages; detailed errors in console
- API routes: JSON error responses with HTTP status codes (400, 401, 403, 404, 405, 501)
- Admin root route: Custom Chrome-style 404 HTML for ALL route errors (including non-404 failures) — this is a known limitation

**Success states:**
- Toast notifications (2.5 second lifetime for wishlist/cart toasts)
- "Saved Successfully!" state on account page save button
- Green "All global settings updated successfully." confirmation on admin settings
- Full-screen "Redirecting to home..." overlay on auth pages

### 4.5 Animation Inventory

Every animation type used in the application:

| Animation | Trigger | Component(s) |
|---|---|---|
| Fade entrance | Page/element mount | Virtually all pages and components |
| Slide entrance | Page/element mount | Auth pages, modals, drawers |
| Scale entrance | Modal/drawer open | Product modal, cart drawer, auth modals |
| Spring transitions | Metric card load | Admin dashboard cards |
| Crossfade (image) | Product card hover | ProductCard, GenderProductShowcase |
| Crossfade (slide) | Hero carousel change | HeroCarousel |
| Layout animations | Product grid changes | GenderProductShowcase, Wishlist |
| PopLayout transitions | Item add/remove | FloatingCart, Wishlist |
| Toran thread pulse | Continuous | Motifs (ToranSvg) — 8s cycle |
| Pennant rotation | Continuous | Motifs (ToranSvg) |
| Mandala rotation | Continuous | Motifs (RotatingMandala) — 28s cycle |
| Chevron rotation | FAQ accordion toggle | FAQSection |
| Spinning arrow | Auth redirect | SignIn, SignUp, AdminLogin |
| Refresh spin | Data refresh | Admin dashboard, Admin customers, Admin settings |
| Progress bar | Image carousel indicator | ProductCard, GenderProductShowcase |
| Border glow | Hover | ProductCard, admin product cards |
| Slide-in/out | Toast | Header, FloatingCart, admin pages |
| Height animation | FAQ answer expand | FAQSection |
| Backdrop blur | Modal open | ProductModal, AuthPromptModal, various |
| Button active-scale | Click | Multiple |
| Sidebar item scale | Hover | Admin sidebar |
| Floating button scale | Tap | FloatingCart |

**Animation library:** Framer Motion 13 throughout. The application uses:
- `motion.div` with `initial`, `animate`, `whileInView`, `whileHover`, `whileTap`
- `AnimatePresence` for enter/exit animations (mode="wait" for images, mode="popLayout" for lists)
- `useAnimation` for manual control in some cases
- Inline `@keyframes` for `/shop` page animations (which doesn't use Framer Motion)

**Performance note:** Continuous animations (toran thread, pennants, mandala) run even when off-screen because no viewport gating (`whileInView`) is applied to decorative sections.

### 4.6 Mobile and Responsive Patterns

| Pattern | Breakpoint | Behavior |
|---|---|---|
| Header search | Below `md` | Desktop search hidden; mobile search row appears below main header row |
| Mobile menu | Below `sm` | Full-height right slide-in drawer (width 320px, max 86vw) |
| Product grid (homepage) | Below `lg` | Sidebar collapses to filter drawer; grid 1-2 columns |
| Product grid (`/shop`) | All sizes | `repeat(auto-fill, minmax(260px, 1fr))` |
| Admin product grid | Below 768px | Stats 2-col, grid 1-col, toolbar stacks vertically |
| Admin form | Below 1024px | Single column; below 640px, price row also single column |
| Admin metric cards | All sizes | `repeat(auto-fit, minmax(280px, 1fr))` (dashboard) / `minmax(240px, 1fr)` (customers) |
| Category pills | All sizes | Horizontal scroll with hidden scrollbar |
| Cart drawer (FloatingCart) | All sizes | 360px width, capped at `calc(100vw - 32px)` |
| Admin sidebar | All sizes | Fixed 280px; no mobile collapse |

### 4.7 Navigation Patterns

| Navigation Type | Method | Notes |
|---|---|---|
| Internal page links | Remix `Link` | Used by Header, Footer, auth pages, account, wishlist |
| Admin sidebar navigation | `window.location.href` (button clicks) | Causes full page reloads; no client-side navigation |
| Logo/home links | Remix `Link` to `/` | Consistent across components |
| "Back to shop" links | Remix `Link` to `/` | On policy pages |
| "Back to home" links | Remix `Link` to `/` | On auth pages |
| Category nav (Header) | Plain `#` anchors | Most are non-functional placeholders; Sale → `#shop` |
| `/shop` navigation | None | Self-contained page; no internal links at all |
| External links | `window.open` or `<a target="_blank">` | WhatsApp URLs, external WhatsApp channel |
| WhatsApp checkout | `wa.me` URL in new tab | `/shop` and FloatingCart; hardcoded numbers differ |

### 4.8 Accessibility Features and Gaps

**Features:**
- SVGs use `aria-hidden="true"` (Motifs)
- Buttons have accessible labels (HeroCarousel arrows)
- Form inputs have associated labels (auth forms)
- Modal backdrop click and Escape key close modals
- Keyboard navigation works for auth forms

**Gaps:**
- No ARIA labels on icon-only buttons (wishlist heart, cart icon, search icon, etc.)
- No skip-to-content links
- No focus trap in modals (though Escape closes them)
- No screen-reader announcements for cart count changes or toast messages
- Product cards use dynamic image changes that may confuse screen readers
- `ProductCard` imports unused icons (`X`, `Eye`) that may cause confusion
- No `aria-live` regions for dynamic content updates (cart, wishlist)
- Admin sidebar navigation uses full page loads instead of client-side routing, but does not announce route changes
- Search inputs across the site are visual-only with no `aria-label` describing their purpose
- The `/shop` page uses inline styles which can override accessibility-related CSS

---

## 5. SECURITY, TESTING, AND KNOWN ISSUES

### 5.1 Security Considerations

**Authentication and Authorization:**

| Concern | Status | Detail |
|---|---|---|
| Customer session management | Implemented | Supabase Auth PKCE flow via `@supabase/ssr` browser client |
| Admin authorization | Implemented | Database-backed (`admin_users.role = 'admin'`) verified server-side in loader and API routes |
| Route-level auth guards | Partial | Admin routes guarded by parent layout loader; storefront routes have no guards |
| API-level auth | Implemented | Product mutation endpoints call `requireAdmin()` independently |
| Email normalization | Implemented | Admin lookup uses `trim().toLowerCase()` on email |
| Google OAuth callback | Implemented | Exchanges code for session; checks owner email for admin destinations |
| Password reset flow | Not implemented | No endpoint or UI for password reset |
| Email verification flow | Not implemented | No endpoint or UI for verifying email addresses |

**Data Security:**

| Concern | Status | Detail |
|---|---|---|
| Service-role key exposure | Safe | Never passed through root loader, browser code, or documentation |
| Supabase RLS bypass | Acceptable | Admin operations use service-role client which bypasses RLS by design |
| Customer RLS mismatch | Risk | `/api/customers` uses anon-key client without auth context; RLS policies may block upserts |
| Cookie security | Partial | Session cookies managed by `@supabase/ssr`; custom admin session cookie defined but not consistently set on login |
| Request header logging | Risk | Worker logs ALL request headers including cookies; should rotate or filter for production |

**Input Security:**

| Concern | Status | Detail |
|---|---|---|
| XSS prevention | Standard | React DOM escapes content; no `dangerouslySetInnerHTML` used |
| SQL injection | Safe | Supabase JS client uses parameterized queries |
| Image upload validation | Partial | Only checks MIME type begins with `image/`; no size/dimension validation |
| Price/stock validation | Missing | No validation for negative prices, negative stock, or unrealistic values |
| Email format validation | Missing | `/api/customers` does not validate email format |
| Phone format validation | Missing | No phone format validation anywhere |

### 5.2 Testing Strategy and Coverage

**Current state:** No testing framework or test files found in the repository.

| Check | Result |
|---|---|
| Test script in `package.json` | Not found |
| Test files (`*.test.*`, `*.spec.*`) | Not found |
| Testing library | Not found |
| CI/CD pipeline | Not found (no GitHub Actions, Cloudflare Pages config, or deploy script) |
| Type checking | `npm run typecheck` → `tsc --noEmit` |
| Linting | `npm run lint` → `eslint .` |

**Recommended testing priorities:**
1. `requireAdmin()` authorization logic (unit tests for 401/403/200 paths)
2. Product CRUD API routes (GET/POST/PUT/DELETE responses and edge cases)
3. `lib/db.tsx` helper functions (image upload, product transforms, variant replacement)
4. AuthContext initialization and sync flow (session retry, pending queue)
5. StoreContext cart/wishlist operations (deduplication, quantity clamping, persistence)
6. Admin route loader (authenticated/non-authenticated/non-admin states)
7. `/shop` checkout flow (validation, WhatsApp URL construction, cart clearing)
8. WhatsApp number consistency across components (3 different numbers in use)

### 5.3 Performance Characteristics

**Data fetching:**
- Homepage makes 2-3 parallel requests (banners/hero-slides, age-groups, products via showcase)
- `/shop` makes 1 request (products) on mount
- Admin dashboard makes 3 concurrent requests via `Promise.all`
- Admin product list makes 1 request (products) on mount
- No caching layer exists; all data re-fetches on every mount/refresh
- No SWR/React Query; manual `useEffect` + `fetch` pattern throughout

**Rendering:**
- Framer Motion animations run on the main thread; continuous decorative animations (mandala, toran) consume CPU even off-screen
- `ProductCard` runs image rotation intervals (900ms) on hover; multiple cards can animate simultaneously
- Wishlist runs per-product image rotation (1800ms); intervals are cleaned up on unmount
- Admin sidebar uses full page loads (no client-side navigation) — slower but simpler

**Bundle considerations:**
- `/shop` page avoids Tailwind entirely (inline styles) to reduce CSS class overhead
- Framer Motion is imported on all storefront pages even where minimal animation is used
- No code splitting beyond Remix's automatic route-based splitting

### 5.4 Known Issues and Bugs

**Critical:**
1. **Three different WhatsApp numbers in use:** `/shop` uses `7778040747`, `/policies/returns` uses `7541826227`, FloatingCart uses a different hardcoded number. Customers receive inconsistent contact information.
2. **No order persistence:** Orders only exist as WhatsApp messages; no order record is stored anywhere in Supabase. There is no order history, tracking, or fulfillment system.
3. **Admin sidebar no mobile collapse:** The 280px fixed sidebar has no hamburger menu or collapse on mobile devices.

**High:**
4. **`/api/customers` RLS risk:** Uses anon-key client without auth context; may be blocked by RLS policies depending on deployment configuration. Route still returns HTTP 201 even if the Supabase upsert fails.
5. **`getAllProducts()` missing variants:** The all-products query returns empty variant arrays; only `getProductById()` populates variants. This means homepage and shop product cards may lack variant information at the API level (the admin product list populates from the full record).
6. **Storage path mismatch:** Upload uses `products/<productId>/...`; delete lists/removes `<productId>/...` without the `products/` prefix. Existing images may not be cleaned up on product deletion.
7. **Admin sidebar uses full page loads:** `window.location.href` navigation in sidebar causes complete page reloads for every admin section, losing React state.

**Medium:**
8. **Stale `public/build` artifacts:** Contains old `routes/admin*` filenames that contradict the current hidden namespace. Could confuse deployment or debugging.
9. **README.md is wrong:** Still describes Next.js/create-next-app with port 3000 and Vercel deployment; does not match the actual Remix/Cloudflare architecture.
10. **ProductCard `pendingAction` unused:** Set when a user tries to add to cart while signed out, but never used to resume the original action after login.
11. **Admin login doesn't set session cookie:** Login form does not explicitly call `setSessionCookie()`; the server loader determines auth state on the next page load, causing a brief unauthenticated flash.
12. **Theme toggle unused:** ThemeContext is mounted but no component calls `useTheme`; the toggle in Footer does not exist.
13. **`useLocation` dead import in Header:** `useLocation` is imported but never used.
14. **Search is non-functional:** Header search, `/shop` search bar, and product keyword filters work independently; there is no unified search experience.

**Low:**
15. **"In Stock" filter inconsistency:** Admin product list has an "In Stock" filter option but the save flow never generates "In Stock" status values.
16. **"Max 3" vs 4 image slots:** Admin product form heading says "Max 3" but renders 4 image upload slots.
17. **Silent wishlist fetch failures:** Fetch errors in wishlist silently produce an empty list with no user feedback.
18. **FloatingCart checkout number:** Hardcoded WhatsApp number in `wa.me` URL differs from `/shop` and returns policy numbers.
19. **Two localStorage keys for customer data:** `/account` uses `femiknit_phone`/`femiknit_address`; `/shop` uses `femiknit_customer` object; FloatingCart reads from `/account` keys.
20. **No CSRF protection on admin logout:** Uses `fetch` with same-origin POST; no CSRF token is generated or verified.
21. **`/shop` uses inline styles:** Cannot leverage Tailwind utility classes, making responsive design and theming harder.
22. **Server auth API routes (`/api/auth/signin`, `/api/auth/signup`, `/api/auth/signout`) do not set cookies:** These legacy endpoints return user data but don't establish browser sessions.

---

## 6. APPENDICES AND REFERENCE

### 6.1 Environment Variable Reference

| Variable | Where Set | Used By | Secret? |
|---|---|---|---|
| `SUPABASE_URL` | `wrangler.toml`, `.dev.vars` | Server clients, root loader | No (public) |
| `SUPABASE_ANON_KEY` | `wrangler.toml`, `.dev.vars` | Server clients, root loader, `/api/customers` | No (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `wrangler.toml` (should be secret) | `lib/db.tsx`, `requireAdmin()`, `getSupabaseServerClient()` | **Yes** |
| `OWNER_EMAIL` | `wrangler.toml`, `.dev.vars` | `requireOwner()` (Google callback) | Sensitive |
| `APP_URL` | `wrangler.toml`, `.dev.vars` | Google OAuth redirect URL construction | No |

**Vite/browser-side:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used as fallbacks for the browser client when Cloudflare env values aren't available.

### 6.2 API Endpoint Quick Reference

| Endpoint | Method | Auth | Status | Purpose |
|---|---|---|---|---|
| `/api/products` | GET | Public | Live | List all products |
| `/api/products` | POST | Admin | Live | Create product |
| `/api/products/:id` | GET | Public | Live | Get single product |
| `/api/products/:id` | PUT | Admin | Live | Update product |
| `/api/products/:id` | DELETE | Admin | Live | Delete product |
| `/api/orders` | GET | None | Disabled | Returns `[]` |
| `/api/orders` | POST | None | Disabled (501) | WhatsApp orders only |
| `/api/inventory` | GET | None | Disabled | Returns `[]` |
| `/api/inventory` | POST | None | Disabled (501) | Disabled |
| `/api/customers` | GET | None | Live | List customers |
| `/api/customers` | POST | None | Live (risk) | Upsert customer |
| `/api/banners` | GET | None | Disabled | Returns `[]` |
| `/api/banners` | POST | None | Disabled (501) | Disabled |
| `/api/banners` | DELETE | None | Disabled (501) | Disabled |
| `/api/hero-slides` | GET | None | Live | Static hero data |
| `/api/hero-slides` | POST | None | Disabled (501) | Disabled |
| `/api/age-groups` | GET | None | Live | Static age data |
| `/api/age-groups` | POST | None | Disabled (501) | Disabled |
| `/api/auth/signin` | POST | None | Legacy | No cookie set |
| `/api/auth/signup` | POST | None | Legacy | No cookie set |
| `/api/auth/google` | GET/POST | None | Legacy | Not used by UI |
| `/api/auth/callback` | GET | None | Live | Google OAuth flow |
| `/api/auth/signout` | POST | None | Legacy | Not used by UI |

### 6.3 Database Schema Quick Reference

| Table | Key Columns | RLS | Notes |
|---|---|---|---|
| `public.products` | id, name, price, discount_price, gender, category, status, images | Enabled | Write policies are false-check/false-using |
| `public.product_variants` | id, product_id, size, color, stock | Enabled | Write policies are false-check/false-using |
| `public.customers` | id, name, email, phone, address, tier, total_orders, total_spent | Enabled | Policies keyed to `auth.uid() = id` |
| `public.admin_users` | id, email, role | Enabled | Service-role only access intended |
| `orders` | Not defined | N/A | Referenced by APIs but not in schema script |
| `inventory` | Not defined | N/A | Referenced by APIs but not in schema script |

### 6.4 Storage Paths

| Resource | Path Pattern |
|---|---|
| Product images (upload) | `products/<productId>/<index>.<ext>` (via `lib/db.tsx`) |
| Product images (delete list) | `<productId>/` (mismatched — missing `products/` prefix) |
| Public URL | `getPublicUrl()` generates from bucket root |

### 6.5 localStorage Keys Reference

| Key | Type | Used By |
|---|---|---|
| `femiknit_cart` | JSON array | StoreContext, `/shop` (separate direct access) |
| `femiknit_wishlist` | JSON array of IDs | StoreContext |
| `femiknit_customer` | JSON object | `/shop` (name, phone, address) |
| `femiknit_phone` | String | `/account` |
| `femiknit_address` | String | `/account` |
| `femiknit_theme` | `"light"` or `"dark"` | ThemeContext |
| `pending_customers` | JSON array | AuthContext (sync queue) |

### 6.6 File Index (Key Files Only)

| File | Purpose | Lines of Code (approx.) |
|---|---|---|
| `app/routes/_index.tsx` | Homepage | Large |
| `app/routes/shop.tsx` | Standalone shop page | Large |
| `app/routes/signin.tsx` / `login.tsx` | Sign-in page | Medium |
| `app/routes/signup.tsx` | Sign-up page | Medium |
| `app/routes/account.tsx` | Account management | Medium |
| `app/routes/wishlist.tsx` | Wishlist page | Medium |
| `app/routes/RJl2QWe2qR!AEQ5CbWRv.tsx` | Admin root (auth, layout) | Very large |
| `app/routes/RJl2QWe2qR!AEQ5CbWRv._index.tsx` | Admin dashboard | Large |
| `app/routes/RJl2QWe2qR!AEQ5CbWRv.products.tsx` | Admin products | Very large |
| `app/routes/RJl2QWe2qR!AEQ5CbWRv.customers.tsx` | Admin customers | Large |
| `app/routes/RJl2QWe2qR!AEQ5CbWRv.settings.tsx` | Admin settings | Large |
| `app/routes/api.products.tsx` | Product API | Medium |
| `app/routes/api.products.$id.tsx` | Product detail API | Medium |
| `app/routes/api.customers.tsx` | Customer API | Medium |
| `app/routes/api.banners.tsx` | Banner API | Small |
| `app/routes/api.hero-slides.tsx` | Hero API | Small |
| `app/routes/api.age-groups.tsx` | Age groups API | Small |
| `app/routes/api.auth.*.tsx` | Auth APIs | Small each |
| `components/Header.tsx` | Site header | Large |
| `components/FloatingCart.tsx` | Cart drawer | Large |
| `components/ProductCard.tsx` | Product card | Large |
| `components/GenderProductShowcase.tsx` | Homepage showcase | Very large |
| `components/HeroCarousel.tsx` | Hero carousel | Medium |
| `context/AuthContext.tsx` | Auth provider | Large |
| `context/StoreContext.tsx` | Store provider | Medium |
| `context/ThemeContext.tsx` | Theme provider | Small |
| `lib/supabase.ts` | Browser client | Medium |
| `lib/supabase-server.ts` | Server clients + auth | Large |
| `lib/db.tsx` | DB helper | Large |
| `lib/constants.ts` | Static data | Small |
| `worker.js` | Worker entry | Medium |
| `wrangler.toml` | Worker config | Small |
| `scripts/setup-supabase.sql` | DB schema | Medium |

### 6.7 Glossary

| Term | Definition |
|---|---|
| **PKCE** | Proof Key for Code Exchange — OAuth 2.0 extension for public clients; used by Supabase Auth |
| **RLS** | Row-Level Security — Postgres policy that controls who can read/write specific rows |
| **Service-role key** | Supabase admin key that bypasses RLS; must never be exposed to browsers |
| **Anon key** | Supabase public key for client-side access; subject to RLS policies |
| **SSR** | Server-Side Rendering — here refers to `@supabase/ssr` for cookie-aware Supabase clients |
| **Loader** | Remix data-fetching function that runs server-side before rendering a route |
| **Action** | Remix mutation function that handles form submissions |
| **Outlet** | React Router component that renders child routes |
| **Custom event** | Browser `CustomEvent` used for cross-component communication (e.g., `open-auth-modal`, `open-product-modal`) |
| **Toast** | Temporary notification message displayed at screen edges |
| **Backdrop** | Semi-transparent overlay behind modals |
| **Variant** | A specific product configuration (size + color + stock combination) |
| **Deduplication** | Merging identical cart items by `(id, size, color)` tuple |

### 6.8 Version and Changelog Notes

No formal versioning or changelog file was found in the repository. Key architectural changes inferred from code analysis:

| Change | Evidence |
|---|---|
| Admin route rename | Old `/admin` removed; new `/RJl2QWe2qR!AEQ5CbWRv` is source of truth; `public/build` contains stale artifacts |
| Auth flow migration | Legacy `/api/auth/*` routes exist but UI uses `AuthContext` + browser Supabase client |
| Cloudflare migration | Multiple APIs disabled (501) and order/inventory endpoints return empty arrays during migration |
| `/portal` redirect added | Compatibility redirect from old `/portal` URL to hidden admin namespace |
| `/shop` independence | `/shop` page is self-contained with its own cart, independent of `AuthContext` and `StoreContext` |

### 6.9 External Service Integrations

| Service | Type | URL / Endpoint | Status |
|---|---|---|---|
| Supabase Auth | Authentication | Supabase Cloud | Live |
| Supabase Postgres | Database | Supabase Cloud | Live |
| Supabase Storage | File storage | `product-images` bucket | Live |
| Cloudflare Workers | Hosting | `femiknit.vebmore.workers.dev` | Deployed |
| WhatsApp (wa.me) | Order channel | `wa.me/7778040747` (varies) | Live (manual) |
| Google OAuth | Authentication | Supabase OAuth | Live |
| Unsplash (static images) | CDN | External URLs in `lib/constants.ts` | Live (external dependency) |
| `placehold.co` | Fallback images | Used when product images missing | Fallback |

### 6.10 Recommended Next Steps

**Immediate (before production):**
1. Unify the three WhatsApp numbers into one configurable value
2. Implement `/api/orders` and `/api/inventory` with real Supabase tables
3. Fix the Storage path mismatch in `lib/db.tsx` (upload vs delete)
4. Add CSRF protection to admin logout
5. Fix the Worker error logger to exclude sensitive headers
6. Resolve the `/api/customers` RLS risk

**Short-term (next 1-2 weeks):**
7. Add a password reset flow and email verification flow
8. Implement a proper deployment script/CI pipeline
9. Add basic test coverage for auth and product APIs
10. Add mobile sidebar collapse to admin panel
11. Replace `public/build` stale artifacts with fresh build
12. Fix README.md to describe actual architecture

**Medium-term (next month):**
13. Add pagination/filtering to `GET /api/products`
14. Implement customer edit/delete in admin
15. Add order management to admin dashboard (when orders API is live)
16. Implement the dormant `ShopExperience` component or remove it
17. Add unified search across products
18. Add loading/error boundaries and proper error UI throughout

---

*(Documentation complete. Parts 7–9 cover the operational guide, data flow patterns, and code patterns.)*

---

## 7. OPERATIONAL GUIDE

### 7.1 Local Development Setup

**Prerequisites:**
- Node.js 18+ (required by Remix v2)
- npm (default package manager for this project)
- Supabase project (for backend functionality)
- Wrangler CLI (for Cloudflare Worker local testing)

**Setup steps:**
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.dev.vars` from an existing environment or create one with required variables:
   - `SUPABASE_URL` — Supabase project URL
   - `SUPABASE_ANON_KEY` — Supabase public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key (never commit this)
   - `OWNER_EMAIL` — the admin owner email
   - `APP_URL` — the application origin URL
4. Run `npm run dev` to start the Remix Vite development server on `http://localhost:5173`
5. For Cloudflare Worker local testing, run `npx wrangler dev` (no dedicated script in `package.json`)

**Environment file notes:**
- `.dev.vars` is in `.gitignore` and provides local environment configuration for Wrangler
- `.dev.vars` is consumed by `wrangler dev` to populate `context.cloudflare.env`
- The same variable names must be used in `wrangler.toml` (production) and `.dev.vars` (local)

### 7.2 Debugging Guide

**Common debugging scenarios:**

| Symptom | Likely Cause | Investigation |
|---|---|---|
| Auth not working in browser | `AuthContext` failed to initialize | Check if root loader provided `SUPABASE_URL` and `SUPABASE_ANON_KEY`; check browser console for "Missing Supabase client credentials." |
| Products not loading | `GET /api/products` returning empty | Check Supabase connectivity; check if `products` table has data; verify RLS policies |
| Admin login shows Access Denied | Email not in `admin_users` table | Verify the authenticated email matches (trimmed + lowercased) a row in `public.admin_users` with `role = 'admin'` |
| Cart not persisting | localStorage blocked or malformed | Check if localStorage is available (private browsing mode may block it); check for malformed JSON in `femiknit_cart` key |
| Admin product save fails | Service-role key not configured | Check if `getSupabaseServerClient()` can read `SUPABASE_SERVICE_ROLE_KEY`; check Worker env bindings in `wrangler.toml` |
| `/shop` checkout not opening WhatsApp | Hardcoded number mismatch | Verify the `wa.me` URL in `/shop` and `FloatingCart` — they use different numbers |
| Images not displaying | Supabase Storage URL issue | Check if public URLs are generated via `getPublicUrl()`; check Storage bucket policies |
| Route not found (404) | Stale `public/build` artifacts | The compiled `public/build/` may reference old `/admin` routes; the source `app/routes/` is authoritative |

**Browser DevTools debugging:**
- Auth state: Check `localStorage` keys `femiknit_wishlist`, `femiknit_cart`, `femiknit_theme`
- Supabase client: The cached browser client is a module-level singleton; there's no easy way to inspect it from DevTools
- Network tab: All API calls are `fetch()` requests to `/api/*` endpoints; look for 401/403 responses for auth issues
- Console: Auth sync errors, product fetch errors, and admin route diagnostics are logged to the console

**Server/Worker debugging:**
- Worker logs: `logError()` in `worker.js` logs full request details; check Cloudflare Workers logs
- Admin auth diagnostics: `requireAdmin()` logs configuration-presence booleans, authenticated email, normalized email, admin lookup result, and error messages
- Database queries: `lib/db.tsx` logs upload errors and product operation details

### 7.3 Development Workflow

**Daily development:**
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
npm run build      # Production build (outputs to build/client + build/server)
```

**No test command exists.** The repository has no test script or test files.

**No deploy script exists.** Deployment requires manual `npx wrangler deploy` or equivalent.

**Key development notes:**
- All source changes are reflected immediately in Vite dev mode (HMR)
- Admin route changes require a full page reload (sidebar uses `window.location.href`)
- Product data changes require refreshing the page or re-fetching (no client-side cache invalidation)
- Supabase schema changes require running `scripts/setup-supabase.sql` against the target database
- Environment variable changes require restarting the dev server and/or Wrangler

### 7.4 Staging vs Production

| Aspect | Development | Production |
|---|---|---|
| Env source | `.dev.vars` | `wrangler.toml` `[vars]` + secrets |
| Supabase URL | `.dev.vars` value | `wrangler.toml` value |
| Supabase Anon Key | `.dev.vars` value | `wrangler.toml` value |
| Service-role Key | `.dev.vars` value | Wrangler secret |
| App URL | `http://localhost:5173` | `https://femiknit.vebmore.workers.dev` |
| Build output | `build/` (dev mode) | `build/` (production) |
| Source of truth | `app/routes/` | `app/routes/` (same) |
| Stale artifacts | N/A | `public/build/` (requires manual cleanup) |

---

## 8. DATA FLOW PATTERNS

### 8.1 Homepage Data Flow

```
User visits /
  └─ Root loader runs → provides Supabase URL + anon key
  └─ AuthContext initializes → reads session, retries 3x
  └─ Component renders:
       ├─ Header → reads StoreContext (wishlistCount), AuthContext (user)
       ├─ HeroCarousel → GET /api/banners → [] → GET /api/hero-slides → static data
       ├─ GenderProductShowcase → GET /api/products → transform → filter/sort
       │    └─ ProductCard → StoreContext (addToCart, toggleWishlist), AuthContext (user)
       ├─ AgeGroupSection → GET /api/age-groups → static data
       ├─ WhatsAppUpdatesSection → static external link
       ├─ FAQSection → hardcoded data
       └─ Footer → static content, newsletter visual-only
```

### 8.2 Shop Page Data Flow

```
User visits /shop
  └─ No root-level dependencies (independent of AuthContext, StoreContext)
  └─ Component mounts:
       ├─ GET /api/products → transformAdminProduct() → catalog format
       ├─ Read localStorage: femiknit_cart, femiknit_customer
       └─ Component renders:
            ├─ Category filter (client-side only)
            ├─ Product grid (local state, no server filtering)
            ├─ Product detail modal → size/color/quantity → add to cart (local state)
            ├─ Cart sidebar → localStorage persistence
            └─ Checkout → validation → WhatsApp URL → new tab
```

### 8.3 Admin Authentication Flow

```
User navigates to /RJl2QWe2qR!AEQ5CbWRv
  └─ Server loader runs:
       ├─ Read context.cloudflare.env for config
       ├─ Create server Supabase client from request cookies
       ├─ Call supabase.auth.getUser()
       ├─ If no session → return { isAuthenticated: false, ... }
       ├─ If session exists → call requireAdmin()
       │    ├─ Cookie-aware server client → getUser()
       │    ├─ If no user → 401
       │    ├─ Normalize email → query admin_users by email + role='admin'
       │    └─ If admin row found → return { isAuthenticated: true, isAdmin: true, ... }
       └─ Return appropriate state
  └─ Client receives loader data:
       ├─ Not authenticated → render AdminLogin
       ├─ Authenticated but not admin → render AdminAccessDenied
       └─ Admin → render dark sidebar + <Outlet />
```

### 8.4 Customer Sync Flow

```
User signs in (email/password or Google)
  └─ AuthContext.signIn() / signInWithGoogle() succeeds
  └─ syncCustomer() called:
       ├─ Build customer payload: { email, name }
       ├─ POST /api/customers
       │    ├─ Success → done
       │    └─ Failure → queue in localStorage.pending_customers
       ├─ Wait 1 second, retry
       ├─ Wait 2 seconds, retry
       └─ All retries fail → queue remains; 5-second interval continues retrying
  └─ On next auth initialization, pending_customers are retried
```

### 8.5 Product CRUD Flow

```
Admin creates a product:
  └─ Admin form validation (client-side)
  └─ POST /api/products → requireAdmin() check
       └─ Server:
            ├─ Parse JSON body
            ├─ Generate PROD-<timestamp> ID
            ├─ Upload Base64 images → Supabase Storage (service-role client)
            ├─ Insert product row → products table
            ├─ Insert variant rows → product_variants table
            ├─ Return product JSON
            └─ Log body and product ID to console
  └─ Client: insert returned product at front of local list, show toast, return to list view

Admin edits a product:
  └─ Same as create but uses PUT /api/products/:id
  └─ Server replaces all variant rows (delete + insert)

Admin deletes a product:
  └─ DELETE /api/products/:id → requireAdmin() check
       └─ Server:
            ├─ Delete product row from products table
            ├─ List Storage files under product ID path
            ├─ Remove listed files (may fail silently due to path mismatch)
            └─ Return { success: true } or error
  └─ Client: remove from local list, show toast
```

### 8.6 Cart State Flow

```
User adds to cart (from homepage or /shop):
  └─ StoreContext.addToCart(product, size, color, quantity)
       ├─ Check for existing item matching (id, size, color)
       ├─ If exists → increment quantity
       └─ If new → append item with quantity
       ├─ Persist to localStorage: femiknit_cart (JSON array)
       ├─ Update cartCount (sum of quantities), cartTotal (price × quantity)
       └─ Emit cart toast (2.5 second lifetime)

User proceeds to checkout (/shop):
  └─ Read femiknit_cart from localStorage
  └─ Read femiknit_phone and femiknit_address from localStorage
  └─ Validate: cart non-empty + all profile fields filled
  └─ Build WhatsApp URL: wa.me/{phone}?text={encoded message}
  └─ Open in new tab
  └─ Clear cart (localStorage + state)
```

---

## 9. CODE PATTERNS AND RECIPES

### 9.1 Authentication-Gated Action Pattern

This pattern appears in ProductCard, GenderProductShowcase, and FloatingCart — wherever a shopping action requires authentication:

```
// 1. Check auth state
if (!user) {
  // 2. Dispatch event for global auth modal
  window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { source: 'cart' } }));
  // 3. Optionally store the intended action for post-login resumption
  //    (NOTE: pendingAction is set but never used to resume in current implementation)
} else {
  // 4. Execute the action
  addToCart(product, size, color, quantity);
}
```

The global `AuthPromptModal` listens for `open-auth-modal` and renders sign-in/sign-up options. After the user authenticates, the originating component must retry the action — there is no automatic resumption mechanism.

### 9.2 Server-Side Authorization Pattern

Used in admin route loaders and product API routes:

```
export async function requireAdmin(request, env) {
  // Step 1: Authentication (who is logged in?)
  const serverClient = createServerSupabaseClient(request, env);
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.email) return json({ error: 'Forbidden' }, { status: 403 });

  // Step 2: Authorization (are they allowed?)
  const adminClient = getSupabaseServerClient(env);
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select()
    .eq('email', user.email.trim().toLowerCase())
    .eq('role', 'admin')
    .maybeSingle();

  if (!adminUser) return json({ error: 'Forbidden' }, { status: 403 });
  return { user, headers: serverClient.getHeaders() };
}
```

This two-layer approach separates Supabase Auth (authentication) from database-backed authorization. A normal customer with a valid session gets 403.

### 9.3 Product Transformation Pattern

Backend products are transformed for frontend display in GenderProductShowcase, /shop, and Wishlist. Each consumer has its own transformation function:

```
// GenderProductShowcase transformation (frontend Product shape)
{
  id: backend.id,
  title: backend.name,
  category: backend.category,
  price: backend.discountPrice || backend.price,        // current price
  mrp: backend.price,                                   // original price
  badge: backend.badge,
  images: backend.images,
  rating: 4.0,                                          // fixed
  // ... + age group mapping, occasion, size list, color names
}

// /shop transformation (simplified catalog format)
// Uses mapGenderToCategory() which maps admin gender/ageGroup/category
// into 6 catalog categories (Unisex + Children → boys/girls based on name, etc.)
// Product IDs regenerated as index + 1

// Wishlist transformation (WishlistProduct shape)
{
  id, title, price, mrp, rating: 4.0, images, badge
}
```

### 9.4 Toast Notification Pattern

The application uses a consistent toast pattern across components:

```
// In StoreContext (global):
const [toast, setToast] = useState(null);
const showToast = (message, type = 'info') => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 2500); // 2.5 second lifetime
};

// In components:
// Header: renders wishlist toast (bottom center) + cart toast (above wishlist)
// FloatingCart: renders cart toast (slide/fade transitions)
// Admin pages: toast slide-in from right/left
// /shop: toast slides up from bottom center (local state)
```

### 9.5 Modal Pattern

The application uses a consistent modal pattern with Framer Motion:

```
// Common modal structure:
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  onClick={onBackdropClick}  // closes modal
>
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    onClick={(e) => e.stopPropagation()}  // prevents backdrop close
  >
    {/* Modal content */}
  </motion.div>
</motion.div>
```

Escape key closes modals via `useEffect` that listens for `keydown` events.

### 9.6 Configuration Safety Pattern

The application uses a layered configuration safety approach:

```
// Browser-safe flow:
// wrangler/env → worker.js env → Remix context.cloudflare.env → root loader → AuthProvider → browser Supabase client
// Only URL + anon key pass through this chain. Service-role key NEVER enters this path.

// Server-privileged flow:
// wrangler/env → worker.js env → Remix context.cloudflare.env → lib/supabase-server.ts → service-role client → Supabase
// Service-role key is used only in server-side code paths.

// Fallback for browser client:
// VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (import.meta.env) are used when Cloudflare env values aren't available.
```

### 9.7 localStorage Persistence Pattern

The application uses localStorage for client-side state persistence with a consistent pattern:

```
// Loading (in provider constructor or useEffect):
try {
  const stored = localStorage.getItem('KEY');
  if (stored) setState(JSON.parse(stored));
} catch { /* ignore malformed data */ }

// Saving (on every state change):
localStorage.setItem('KEY', JSON.stringify(state));

// Key naming convention:
// femiknit_ prefix for all application keys
// femiknit_cart, femiknit_wishlist, femiknit_theme, femiknit_customer,
// femiknit_phone, femiknit_address, pending_customers
```

---

*(Documentation complete. Parts 10–11 cover cross-page user journeys and the dependency matrix.)*

---

## 10. CROSS-PAGE USER JOURNEYS & EDGE CASES

### 10.1 Primary User Journeys

**Journey 1: First-time visitor browses and places an order**
```
/ → browse hero carousel → browse products → open product modal →
add to cart (auth prompt appears → navigate to /signup → sign up →
return to /wishlist or /shop → add to cart → go to /shop → checkout →
fill profile → confirm → WhatsApp message sent)
```
Friction points: Auth prompt interrupts add-to-cart twice (once on homepage, once on `/shop`). No payment confirmation — only a WhatsApp message.

**Journey 2: Returning customer signs in and manages account**
```
/signin → sign in → / (homepage) → browse → /wishlist → view wishlist →
/account → edit phone/address → save → sign out (confirmation modal)
```
Friction points: Name edits don't persist despite being editable. No password change flow.

**Journey 3: Admin manages products**
```
/RJl2QWe2qR!AEQ5CbWRv → sign in (email/password or Google) →
dashboard (shows zero metrics due to disabled APIs) → products →
add new product → fill form → save → product appears in list →
edit product → modify variants → save → delete product → confirm
```
Friction points: Dashboard shows no data. Product create can fail silently (Base64 image upload issues). No bulk operations.

**Journey 4: Customer discovers site via Google OAuth**
```
/signin → "Sign in with Google" → Supabase OAuth consent →
/api/auth/callback → session established → customer synced →
redirected to / → homepage
```
Friction points: If the Google email doesn't match an existing customer record, a new `customers` row is upserted with tier "Standard". No email verification step.

### 10.2 Cross-Page Data Consistency Issues

| Data Point | Location A | Location B | Consistent? |
|---|---|---|---|
| Cart | `femiknit_cart` (StoreContext) | `femiknit_cart` (/shop local) | **No** — separate state despite same key |
| Customer profile | `femiknit_customer` (/shop) | `femiknit_phone` + `femiknit_address` (/account) | **No** — different keys, different shapes |
| WhatsApp number | `FloatingCart` | `/shop` checkout | **No** — different hardcoded numbers |
| WhatsApp number | `/policies/returns` | `/shop` checkout | **No** — different number (7541826227 vs 7778040747) |
| Product data | Backend API | Transformed per-component | **No** — each transformer has different mappings |
| Product image paths | Upload: `products/<id>/` | Delete: `<id>/` | **No** — Storage prefix mismatch |
| Wishlist | StoreContext (persisted) | Server (none) | **No** — no server-side wishlist exists |
| Admin session | Custom cookie (admin root) | Supabase session (storefront) | **No** — two different session mechanisms |
| Theme | `femiknit_theme` (localStorage) | No visible toggle | **No** — state exists but no UI controls it |

### 10.3 Edge Cases and Their Handling

| Edge Case | Current Handling | Problem |
|---|---|---|
| User adds to cart while signed out | Auth prompt modal appears | ProductCard also has a local login prompt — two overlapping mechanisms |
| User clears all cart items | Drawer closes automatically (effect) | /shop cart doesn't auto-close |
| Product has zero images | `placehold.co` fallback URL | No indication that photos are missing |
| Product has zero variants | Modal opens with empty variant table | Cannot add to cart (no size/color to select) |
| User refreshes during redirect | May see sign-in page again | No pending-action tracking across refresh |
| Malformed localStorage data | Silently ignored by `try/catch` | User loses cart/wishlist without warning |
| Admin creates product with no images | `placehold.co` fallback | No validation warning before save |
| Admin deletes product with images | Product row deleted; images may remain in Storage | Storage path mismatch prevents cleanup |
| Rate limiting | None implemented | No protection against brute-force sign-in or API abuse |
| Session expires mid-session | `AuthContext` subscription detects it and clears user | No session-expiry warning or auto-refresh |
| Multiple tabs open | Each tab has independent StoreContext state | No cross-tab sync for cart/wishlist |
| User clicks browser back after sign-out | May see cached authenticated pages | No route-level auth re-check on browser back |
| Empty API response | Handled per-component (loading → empty state) | No global error boundary for API failures |
| Concurrent admin product edits | Last write wins; no merge | One admin's changes overwrite another's |

### 10.4 Error Recovery Patterns

The application has no centralized error recovery strategy. Each component handles errors independently:

- **API fetch failures:** Silently caught, local state set to empty array, toast shown (in some components), or error banner displayed
- **Auth failures:** Error banner with `result.error` text on auth pages; toast in admin login
- **Network failures:** Generic toast messages like "Failed to load products" or "Failed to ... product"
- **Navigation failures:** No error handling; Remix handles 404s via route-level ErrorBoundary (admin has custom Chrome-style 404)
- **No retry mechanism** exists anywhere — failures are final until the user manually refreshes or retries

---

## 11. DEPENDENCY & INTEGRATION MATRIX

### 11.1 Package Dependency Graph

```
femiknitpro
├── @remix-run/cloudflare ← Core server adapter
│   └── @remix-run/react ← React bindings
│       ├── react ← UI library (v19.2.8)
│       └── react-dom ← DOM renderer (v19.2.8)
├── @remix-run/node ← Node adapter (used by npm run start only)
├── @remix-run/dev ← Development tooling
├── @remix-run/serve ← Production server (used by npm run start only)
├── @supabase/ssr ← SSR-safe Supabase client
│   └── @supabase/supabase-js ← SDK (Auth, DB, Storage)
├── framer-motion ← Animation (v13)
├── lucide-react ← Icon set
├── tailwindcss ← CSS framework (v4 via @tailwindcss/postcss)
├── vite ← Bundler (v5.4.11)
├── @vitejs/plugin-react ← (via Remix Vite plugin)
├── vite-tsconfig-paths ← Path alias resolution
├── typescript ← Type checking (v5)
└── eslint + plugins ← Linting
```

### 11.2 Integration Points

| Integration | Method | Auth | Status | Failure Impact |
|---|---|---|---|---|
| Supabase Auth | Browser Supabase client (PKCE) | None | Live | Customers cannot sign in/out |
| Supabase Auth | Server Supabase client (cookie) | Cookie-based | Live (admin only) | Admin cannot access dashboard |
| Google OAuth | Supabase OAuth redirect | None | Live | Google sign-in unavailable |
| Supabase Postgres | Service-role client | Service-role key | Live | Product reads/writes fail |
| Supabase Storage | Service-role client | Service-role key | Live | Product images fail to upload |
| Cloudflare Workers | `@remix-run/cloudflare` | N/A | Live | Application unavailable |
| WhatsApp | `wa.me` URL | None | Live (manual) | Orders cannot be placed |
| Unsplash (static images) | External HTTPS URLs | None | Live (external) | Hero/age-group images broken |
| `placehold.co` (fallback) | External HTTPS URLs | None | Fallback | Product images missing |

### 11.3 Risk Assessment by Dependency

| Dependency | Risk Level | Risk Description | Mitigation |
|---|---|---|---|
| Supabase | Medium | Single point of failure for auth, DB, storage | Self-hosted DB alternative; auth fallback |
| Cloudflare Workers | Low | Hosting platform dependency | Standard IaC deployment |
| Framer Motion | Low | Animation library; no blocking functionality | CSS animations as fallback |
| Tailwind CSS v4 | Low | Styling pipeline; v4 is newer with breaking changes | Documented design tokens; could migrate to v3 |
| Unsplash | Medium | External image dependency; URLs can change or expire | Self-host images after design is finalized |
| WhatsApp (wa.me) | Low | External deep-link; depends on user's installed app | SMS fallback; in-app webchat |
| Google OAuth | Low | Authentication provider dependency | Email/password as alternative |
| `react` 19 | Low | Major version; API changes possible | Pinned version; test before upgrade |

### 11.4 Breaking Change Sensitivity

| Component | What would break | Downstream impact |
|---|---|---|
| `StoreContext` shape changes | All cart/wishlist components break | Homepage, `/shop`, FloatingCart, Header, ProductCard all fail |
| `AuthContext` API changes | All auth-gated actions break | ProductCard, FloatingCart, Header, `/account`, `/wishlist` fail |
| `GET /api/products` response shape | All product-displaying components break | Homepage, `/shop`, `/wishlist`, admin product list fail |
| `requireAdmin()` signature change | All admin routes fail to authorize | Entire admin panel inaccessible |
| `lib/db.tsx` function signatures | Product CRUD APIs fail | Admin products form, API endpoints fail |
| Root loader shape change | `AuthProvider` receives wrong data | All auth-gated features break |
| `worker.js` handler contract | All routes return 500 | Entire application unavailable |

### 11.5 External Resource Inventory

| Resource | URL/Location | Access | Purpose |
|---|---|---|---|
| Supabase Project | Cloud-hosted | Admin only | Database, Auth, Storage |
| Supabase Dashboard | supabase.com | Admin only | Management UI |
| Cloudflare Account | cloudflare.com | Admin only | Worker deployment, KV, D1 |
| Wrangler CLI | npm package | Developer | Deploy and manage Worker |
| Google Cloud Console | cloud.google.com | Admin only | OAuth client credentials |
| Unsplash | unsplash.com | Public | Stock photography for hero/age-group images |
| `placehold.co` | placehold.co | Public | Fallback product images |
| WhatsApp Business | whatsapp.com | End-user | Order receiving channel |

---

*(Documentation complete. For questions about specific sections, refer to the section numbers above.)*

