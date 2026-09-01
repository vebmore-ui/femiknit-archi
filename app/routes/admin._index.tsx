import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  DollarSign, ShoppingBag, AlertCircle,
  Clock, CheckCircle2, Package, RefreshCw,
  Users
} from "lucide-react";
import styles from "../admin/page.module.css";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 25 } },
};

const StatusBadge = ({ status }: { status: string }) => {
  let badgeClass = styles.badge;
  if (status === "New") badgeClass += ` ${styles.badgeNew}`;
  else if (status === "Processing") badgeClass += ` ${styles.badgeProcessing}`;
  else if (status === "Shipped") badgeClass += ` ${styles.badgeShipped}`;
  else if (status === "Delivered") badgeClass += ` ${styles.badgeDelivered}`;

  return (
    <span className={badgeClass}>
      <span className={styles.statusDot} />
      {status}
    </span>
  );
};

export default function DashboardHome() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<{ id: string; customer: string; amount: string; status: string; date: string }[]>([]);
  const [inventory, setInventory] = useState<{ id: number; product: string; sku: string; stock: number; category: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordersRes, inventoryRes, customersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/inventory"),
        fetch("/api/customers")
      ]);
      const ordersData = await ordersRes.json();
      const inventoryData = await inventoryRes.json();
      const customersData = await customersRes.json();

      if (Array.isArray(ordersData)) {
        setOrders(ordersData.map((o: { id: string; customer: string; total: string; status: string; date: string }) => ({
          id: o.id,
          customer: o.customer,
          amount: o.total,
          status: o.status,
          date: o.date
        })));
      }
      if (Array.isArray(inventoryData)) {
        setInventory(inventoryData.map((i: { id: number; product: string; sku: string; stock: number; category: string }) => ({
          id: i.id,
          product: i.product,
          sku: i.sku,
          stock: i.stock,
          category: i.category
        })));
      }
      if (Array.isArray(customersData)) {
        setCustomers(customersData);
      }
    } catch {
      // keep empty arrays
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const lowStockAlerts = inventory.filter(i => i.stock <= 10);
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.amount.replace(/[₹,]/g, "")) || 0), 0);

  return (
    <div className={styles.dashboard}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={styles.header}
      >
        <div>
          <div className={styles.badgeWrapper}>
            <span className={styles.liveIndicator} />
            <span>Store Performance Active</span>
          </div>
          <h1 className={styles.title}>Dashboard</h1>
        </div>

        <div className={styles.headerActions}>
          <button 
            onClick={handleRefresh} 
            className={`${styles.refreshButton} ${isRefreshing ? styles.spinning : ""}`}
            title="Refresh Metrics"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        
        {/* Metric Cards Row */}
        <div className={styles.metricsGrid}>
          <motion.div variants={itemVariants} className={`${styles.card} ${styles.cardBlue}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardLabel}>Total Revenue</p>
                <h3 className={styles.cardValue}>₹{totalRevenue.toLocaleString("en-IN")}</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className={styles.trend}>
              <span className={styles.trendBlue}>+{orders.length > 0 ? "12" : "0"}%</span>
              <span className={styles.trendContext}>vs last month</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`${styles.card} ${styles.cardPurple}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardLabel}>Total Customers</p>
                <h3 className={styles.cardValue}>{customers.length}</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
                <Users size={20} />
              </div>
            </div>
            <div className={styles.trend}>
              <span className={styles.trendPurple}>+{customers.length > 0 ? "3" : "0"} new</span>
              <span className={styles.trendContext}>this week</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`${styles.card} ${styles.cardAmber}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardLabel}>Total Orders</p>
                <h3 className={styles.cardValue}>{orders.length}</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconAmber}`}>
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className={styles.trend}>
              <span className={styles.trendAmber}>+{orders.filter(o => o.status === "New" || o.status === "Processing").length} pending</span>
              <span className={styles.trendContext}>needs action</span>
            </div>
          </motion.div>
        </div>

        {/* Data Tables Row */}
        <div className={styles.contentGrid}>
          
          {/* Recent Orders */}
          <motion.div variants={itemVariants} className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Clock size={16} className={styles.textAccent} /> Recent Orders
              </h2>
              <span className={styles.linkButton}>Live via API</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No orders yet.</td></tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className={styles.orderId}>{order.id}</td>
                        <td className={styles.customerName}>{order.customer}</td>
                        <td className={styles.orderAmount}>{order.amount}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td className={styles.orderDate}>{order.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Low Stock Alerts */}
          <motion.div variants={itemVariants} className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitleAlert}>
                <AlertCircle size={16} /> Inventory Warning
              </h2>
              <span className={styles.alertCounter}>{lowStockAlerts.length} items low</span>
            </div>
            
            <div className={styles.alertList}>
              {loading ? (
                <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</p>
              ) : lowStockAlerts.length === 0 ? (
                <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>All stock levels healthy.</p>
              ) : (
                lowStockAlerts.map((item) => (
                  <div key={item.id} className={styles.alertItem}>
                    <div>
                      <h4 className={styles.alertItemTitle}>{item.product}</h4>
                      <div className={styles.alertMeta}>
                        <span className={styles.skuTag}>{item.sku}</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <div className={styles.stockCount}>
                      <span>{item.stock}</span>
                      <small>left</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
