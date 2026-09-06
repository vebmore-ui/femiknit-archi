import React, { useState, useEffect } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useActionData,
  useSubmit,
  useNavigation,
  Form,
} from "@remix-run/react";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Lock,
  ArrowRight,
  LogOut,
  X,
  RefreshCw,
} from "lucide-react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { serialize } from "cookie";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import styles from "../admin/layout.module.css";

const ADMIN_SESSION_COOKIE = "femiknit_admin_session";
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function getOwnerEmail(env?: Record<string, string | undefined>): string {
  return env?.OWNER_EMAIL || process.env.OWNER_EMAIL || "owner@example.com";
}

function getAdminPassword(env?: Record<string, string | undefined>): string | undefined {
  return env?.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
}

function getAdminSessionSecret(env?: Record<string, string | undefined>): string | undefined {
  return env?.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
}

const chrome404HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 Not Found</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,"Courier New",monospace;background:#f5f5f5;color:#333;display:flex;align-items:center;justify-content:center;min-height:100vh}
.error-container{max-width:560px;width:100%;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.15);overflow:hidden}
.error-header{background:#f0f0f0;padding:14px 16px;font-weight:600;font-size:13px;color:#000;white-space:nowrap}
.error-body{padding:24px;text-align:center}
.error-icon{width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:#f1f1f1;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:600;color:#555}
.error-title{font-size:16px;font-weight:500;margin-bottom:12px;color:#000}
.error-message{font-size:13px;color:#666;margin-bottom:16px;line-height:1.5}
</style>
</head>
<body>
<div class="error-container">
  <div class="error-header">Not Found</div>
  <div class="error-body">
    <div class="error-icon">!</div>
    <h1 class="error-title">This page isn't available</h1>
    <p class="error-message">The page you&#39;re looking for might have been removed or you don&#39;t have permission to access it.</p>
    <p class="error-message">Error: 404 (Not Found)</p>
  </div>
</div>
</body>
</html>`;

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type LoaderData = {
  isAuthenticated: boolean;
  userEmail: string | undefined;
};

type ActionData = {
  error?: string;
};

function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (name) {
      try {
        acc[name] = decodeURIComponent(rest.join("="));
      } catch {
        acc[name] = rest.join("=");
      }
    }
    return acc;
  }, {} as Record<string, string>);
}

function setSessionCookie(token: string): string {
  return serialize(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_EXPIRY_MS,
    path: "/",
    sameSite: "lax",
  });
}

function clearSessionCookie(): string {
  return serialize(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
}

function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getSigningKey(): Promise<CryptoKey | null> {
  if (!getAdminSessionSecret()) return null;
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAdminSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return keyMaterial;
}

async function signSession(email: string): Promise<string> {
  const key = await getSigningKey();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not configured");

  const payload = {
    email,
    exp: Date.now() + SESSION_EXPIRY_MS,
  };

  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const payloadB64 = base64urlEncode(payloadBytes);

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  return payloadB64 + "." + base64urlEncode(new Uint8Array(signature));
}

async function verifySession(token: string): Promise<string | null> {
  const key = await getSigningKey();
  if (!key) return null;

  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const signatureBytes = base64urlDecode(signatureB64);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes.buffer.slice(signatureBytes.byteOffset, signatureBytes.byteOffset + signatureBytes.byteLength) as ArrayBuffer,
      encoder.encode(payloadB64)
    );

    if (!valid) return null;

    const payloadBytes = base64urlDecode(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { email: string; exp: number };

    if (Date.now() > payload.exp) return null;

    return payload.email;
  } catch {
    return null;
  }
}

function notFoundResponse(): Response {
  return new Response(chrome404HTML, {
    status: 404,
    statusText: "Not Found",
    headers: { "Content-Type": "text/html" },
  });
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionToken = cookies[ADMIN_SESSION_COOKIE];
  const sessionEmail = sessionToken ? await verifySession(sessionToken) : null;
  const env = (context as any)?.cloudflare?.env as Record<string, string | undefined> | undefined;

  const isAuthenticated = sessionEmail === getOwnerEmail(env);

  return json({
    isAuthenticated,
    userEmail: sessionEmail ?? undefined,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const phase = formData.get("phase")?.toString() || "login";
  const env = (context as any)?.cloudflare?.env as Record<string, string | undefined> | undefined;

  if (phase === "login") {
    const password = formData.get("password")?.toString() || "";

    if (!password) {
      return json({ error: "Please enter your password." });
    }

    if (!getAdminPassword(env)) {
      return json({ error: "Admin authentication is not configured." }, { status: 500 });
    }

    if (password !== getAdminPassword(env)) {
      return json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signSession(getOwnerEmail(env));

    const headers = new Headers();
    headers.append("Set-Cookie", setSessionCookie(token));
    headers.set("Location", "/admin");
    return new Response(null, { status: 302, headers });
  }

  if (phase === "logout") {
    const headers = new Headers();
    headers.append("Set-Cookie", clearSessionCookie());
    headers.set("Location", "/admin");
    return new Response(null, { status: 302, headers });
  }

  return json({ error: "Invalid request" }, { status: 400 });
}

const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function AdminLogin() {
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [password, setPassword] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    formData.set("password", password.trim());
    submit(formData, { method: "post" });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="login"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          width: "100%",
          maxWidth: "420px",
          margin: "0 auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 12 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "#ffffff",
              marginBottom: "1rem",
              boxShadow: "0 8px 32px rgba(15, 23, 42, 0.25)",
            }}
          >
            <Lock size={32} />
          </motion.div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Admin Access
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#64748b",
              marginTop: "0.5rem",
            }}
          >
            Enter the admin password to continue
          </p>
        </motion.div>

        <form method="post" onSubmit={handleSubmit}>
          <input type="hidden" name="phase" value="login" />

          <motion.div variants={itemVariants}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#334155",
                marginBottom: "0.75rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem 1.25rem 3.5rem",
                  fontSize: "1.25rem",
                  border: "2px solid " + (actionData?.error ? "#fca5a5" : "#e2e8f0"),
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = actionData?.error ? "#fca5a5" : "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <Lock
                size={22}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3bc",
                }}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {actionData?.error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "10px",
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <X size={16} />
                {actionData.error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} style={{ marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                fontSize: "1.125rem",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: password.trim() && !isSubmitting ? "#0f172b" : "#94a3bc",
                border: "none",
                borderRadius: "12px",
                cursor: password.trim() && !isSubmitting ? "pointer" : "default",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (password.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#1e293b";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(15, 23, 42, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (password.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#0f172b";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Admin
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          variants={itemVariants}
          style={{ marginTop: "1.5rem", textAlign: "center" }}
        >
          <motion.button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              background: "none",
              border: "none",
              color: "#94a3bc",
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3bc";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={14} />
            Back to site
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const submit = useSubmit();

  const handleLogout = () => {
    const form = document.createElement("form");
    form.method = "post";
    const phaseInput = document.createElement("input");
    phaseInput.type = "hidden";
    phaseInput.name = "phase";
    phaseInput.value = "logout";
    form.appendChild(phaseInput);
    document.body.appendChild(form);
    submit(form);
  };

  return (
    <>
      <motion.button
        onClick={() => setShowConfirm(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          width: "100%",
          padding: "0.875rem 1rem",
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#fecaca",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          border: "1px solid #7f1d1d",
          borderRadius: "0.5rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.2)";
          e.currentTarget.style.color = "#fca5a5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
          e.currentTarget.style.color = "#fecaca";
        }}
      >
        <LogOut size={20} />
        Logout
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "1.5rem",
                maxWidth: "360px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: "0.75rem",
                }}
              >
                Confirm Logout
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#64748b",
                  marginBottom: "1.25rem",
                }}
              >
                Are you sure you want to log out? You will need to verify
                again to access the admin panel.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: "0.625rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#475569",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "0.625rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#fff",
                    backgroundColor: "#dc2626",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminLayout() {
  const { isAuthenticated } = useLoaderData<LoaderData>();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: "1rem",
        }}
      >
        <AdminLogin />
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <img
            src="/images/logo.png"
            alt="Femiknit"
            className={styles.brandLogoImage}
          />
          <span>Femiknit</span>
        </div>

        <nav className={styles.navLinks}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
               <motion.button
                key={item.href}
                onClick={() => {
                  window.location.href = item.href;
                }}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon size={24} />
                <span>{item.name}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <LogoutButton />
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  let status = 404;
  if (error instanceof Response) {
    status = error.status || 404;
  }

  if (status === 404) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: chrome404HTML }}
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: chrome404HTML }}
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
