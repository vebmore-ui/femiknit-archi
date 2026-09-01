import React from "react";
import { Outlet } from "@remix-run/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings
} from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import styles from "../admin/layout.module.css";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className={styles.adminLayout}>
      {/* Professional Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <img src="/images/logo.png" alt="Femiknit" className={styles.brandLogoImage} />
          <span>Femiknit</span>
        </div>

        <nav className={styles.navLinks}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <p>v2.4.0 Professional</p>
        </div>
      </aside>

      {/* Main Dynamic View Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
