import React, { useState, useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSubmit,
  useLoaderData,
} from "@remix-run/react";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  X,
  RefreshCw,
  Lock,
} from "lucide-react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabaseClient, requireAdmin } from "@/lib/supabase-server";
import { serialize } from "cookie";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import styles from "../admin/layout.module.css";

const ADMIN_SESSION_COOKIE = "femiknit_admin_session";
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

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
.error-message{font-size:13px;color:#666;margin-bottom:12px;line-height:1.5}
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

function notFoundResponse(): Response {
  return new Response(chrome404HTML, {
    status: 404,
    statusText: "Not Found",
    headers: { "Content-Type": "text/html" },
  });
}

type LoaderData = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | undefined;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context as any)?.cloudflare?.env as Record<string, string | undefined> | undefined;
  try {
    const { client: supabase } = createServerSupabaseClient(request, env);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      return json({ isAuthenticated: false, isAdmin: false, userEmail: undefined } satisfies LoaderData);
    }

    try {
      const adminResult = await requireAdmin(request, env);
      return json({
        isAuthenticated: true,
        isAdmin: true,
        userEmail: adminResult.user.email ?? undefined,
      } satisfies LoaderData);
    } catch {
      return json({
        isAuthenticated: true,
        isAdmin: false,
        userEmail: user.email ?? undefined,
      } satisfies LoaderData);
    }
  } catch {
    return json({ isAuthenticated: false, isAdmin: false, userEmail: undefined } satisfies LoaderData);
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any)?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const formData = await request.formData();
  const phase = formData.get("phase")?.toString() || "login";

  if (phase === "logout") {
    try {
      const { client: supabase } = createServerSupabaseClient(request, env);
      await supabase.auth.signOut();
    } catch {
      // ignore sign out errors
    }

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
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    navigate("/api/auth/google?next=/admin");
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
        <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: "2rem" }}>
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Admin Access
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#64748b", marginTop: "0.5rem" }}>
            Sign in with your Google account to access the admin panel
          </p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isRedirecting}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              fontSize: "1.125rem",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: isRedirecting ? "#94a3bc" : "#0f172b",
              border: "none",
              borderRadius: "12px",
              cursor: isRedirecting ? "default" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!isRedirecting) {
                e.currentTarget.style.backgroundColor = "#1e293b";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(15, 23, 42, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRedirecting) {
                e.currentTarget.style.backgroundColor = "#0f172b";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isRedirecting ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Redirecting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.953 25.123c0-1.59-.134-3.127-.384-4.618l.032-3.07h-5.756c-.718 4.1-2.858 7.56-5.846 9.884l0 0-.228.001 3.392 5.102 0 0 2.526 3.904c3.47-2.826 5.826-7.094 6.804-12.29z" />
                  <path fill="#FF3D00" d="M24.978 29.514c-2.62 0-4.944-.992-6.623-2.646l-.012.01-3.392 5.102 0 0 2.526 3.904c3.47-2.826 5.826-7.094 6.804-12.29z" />
                  <path fill="#000" d="M24.978 15.373c1.426 0 2.77.26 3.93.75l.012.01-3.942 0 0 0-3.392-5.102 0 0 2.526 3.904 0 0 2.526 3.904 0 0 0 0z" />
                  <path fill="#4285F4" d="M24.978 34.887c1.992 0 3.85-.44 5.484-1.204l-.04-0.026c-.62-.44-1.39-.81-2.29-.97 0 0-.006 0-.006 0 0 0 0 0 0 0-.9 0-1.67.36-2.29.97l-3.82 6.004 0 0 2.526 3.904c0 .006 0 .012.007.017-.001.001-.001.001-.001.001 0 0 0 0 0 0 1.992 0 3.85-.44 5.484-1.204l-.04-0.026c-.62-.44-1.39-.81-2.29-.97 0 0-.012 0-.012 0 0 0 0 0 0 0v0.001c-.9 0-1.67.36-2.29.97 0 0-.006 0-.006 0 0 0 0 0 0 0-.9 0-1.67.36-2.29.97l-3.82 6.004 0 0 2.526 3.904c0 .006 0 .012.007.017 0 0 0 0 0 0v0h0c-1.992 0-3.85-.44-5.484-1.204l-.012 0 0 0z" />
                  <path fill="#4285F4" d="M43.953 25.123c0-1.59-.134-3.127-.384-4.618l.032-3.07h-5.756c-.718 4.1-2.858 7.56-5.846 9.884l0 0-.228.001 3.392 5.102 0 0 2.526 3.904c3.47-2.826 5.826-7.094 6.804-12.29z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
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
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AdminAccessDenied({ userEmail }: { userEmail?: string }) {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 12 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "#ffffff",
            marginBottom: "1rem",
            boxShadow: "0 8px 32px rgba(220, 38, 38, 0.25)",
          }}
        >
          <X size={32} />
        </motion.div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#64748b", marginTop: "0.5rem" }}>
          You are signed in as <strong>{userEmail}</strong>, but this account does not have administrator access.
        </p>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.875rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 500,
            color: "#ffffff",
            backgroundColor: "#dc2626",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Sign Out
        </motion.button>
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            marginTop: "0.75rem",
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
        </button>
      </motion.div>
    </div>
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
  const { isAuthenticated, isAdmin, userEmail } = useLoaderData<LoaderData>();
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

  if (!isAdmin) {
    return <AdminAccessDenied userEmail={userEmail} />;
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
          {[
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { name: "Products", href: "/admin/products", icon: Package },
            { name: "Customers", href: "/admin/customers", icon: Users },
            { name: "Settings", href: "/admin/settings", icon: Settings },
          ].map((item) => {
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
