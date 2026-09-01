import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Search, Users, Mail, Phone, 
  MapPin, ShoppingBag, Eye, X, 
  Download, Calendar, CheckSquare, Square, 
  ArrowUpDown, RefreshCw, CheckCircle, ShieldCheck
} from "lucide-react";
import styles from "../admin/customers/page.module.css";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15, ease: "easeIn" } }
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: string;
  spentRaw: number;
  joinDate: string;
  tier: string;
  recentOrders: { id: string; date: string; total: string; status: string }[];
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        console.log("Admin customers API response:", data);
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          showToast("Failed to load customers: " + (data.error || "Invalid response"));
        }
      } catch {
        showToast("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    showToast("Customer directory exported as CSV successfully.");
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            customer.phone.includes(searchQuery);
      const matchesTier = tierFilter === "All" || customer.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [customers, searchQuery, tierFilter]);

  const getBadgeClass = (status: string) => {
    switch(status) {
      case "New": return `${styles.badgeInner} ${styles.badgeInnerNew}`;
      case "Processing": return `${styles.badgeInner} ${styles.badgeInnerProcessing}`;
      case "Shipped": return `${styles.badgeInner} ${styles.badgeInnerShipped}`;
      case "Delivered": return `${styles.badgeInner} ${styles.badgeInnerDelivered}`;
      default: return styles.badgeInner;
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={styles.toast}
          >
            <CheckCircle size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Directory</h1>
          <p className={styles.subtitle}>Comprehensive user relationship profiles and lifetime tracking.</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => window.location.reload()} className={styles.btnSecondary} title="Sync Records">
            <RefreshCw size={16} /> Sync
          </button>
          <button onClick={handleExportCSV} className={styles.btnPrimary}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className={styles.metricsGrid}>
        <motion.div variants={itemVariants} className={styles.metricCard}>
          <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
            <Users size={22} />
          </div>
          <div>
            <p className={styles.metricLabel}>Total Customers</p>
            <p className={styles.metricValue}>{customers.length}</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className={styles.metricCard}>
          <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className={styles.metricLabel}>VIP Members</p>
            <p className={styles.metricValue}>{customers.filter(c => c.tier === "VIP").length}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterTabs}>
          {["All", "VIP", "Standard"].map((tier) => (
            <button 
              key={tier} 
              className={`${styles.filterTab} ${tierFilter === tier ? styles.activeTab : ""}`}
              onClick={() => setTierFilter(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedCustomerIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.bulkBar}
          >
            <span className={styles.bulkText}><b>{selectedCustomerIds.length}</b> customers selected</span>
            <button onClick={() => showToast(`Sent bulk email blast to ${selectedCustomerIds.length} users`)} className={styles.bulkActionBtn}>
              Send Announcement Email
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customers Table */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <button onClick={toggleSelectAll} className={styles.checkboxBtn}>
                    {selectedCustomerIds.length > 0 && selectedCustomerIds.length === filteredCustomers.length ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th>Customer Profile</th>
                <th>Contact Details</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading customers...</td></tr>
              ) : filteredCustomers.map((customer) => {
                const isSelected = selectedCustomerIds.includes(customer.id);
                return (
                  <tr key={customer.id} className={isSelected ? styles.selectedRow : ""}>
                    <td>
                      <button onClick={() => toggleSelectCustomer(customer.id)} className={styles.checkboxBtn}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td>
                      <div className={styles.customerInfo}>
                        <div className={styles.avatar}>
                          {customer.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className={styles.nameRow}>
                            <p className={styles.customerName}>{customer.name}</p>
                            {customer.tier === "VIP" && <span className={styles.vipBadge}>VIP</span>}
                          </div>
                          <p className={styles.customerId}>{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactInfo}>
                        <p><Mail size={13} /> {customer.email}</p>
                        <p><Phone size={13} /> {customer.phone}</p>
                      </div>
                    </td>
                    <td><span className={styles.joinDate}>{customer.joinDate}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className={styles.btnAction}
                      >
                        <Eye size={15} /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>No matching customer records discovered.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className={styles.modalOverlay}>
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={styles.modalContent}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalProfile}>
                  <div className={styles.modalAvatar}>
                    {selectedCustomer.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 className={styles.modalName}>{selectedCustomer.name}</h3>
                      {selectedCustomer.tier === "VIP" && <span className={styles.vipBadge}>VIP</span>}
                    </div>
                    <p className={styles.modalId}>{selectedCustomer.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.infoGrid}>
                  <div>
                    <h4 className={styles.sectionTitle}>Contact Information</h4>
                    <div>
                      <p className={styles.infoItem}><Mail className={styles.infoIcon} size={16} /> {selectedCustomer.email}</p>
                      <p className={styles.infoItem}><Phone className={styles.infoIcon} size={16} /> {selectedCustomer.phone}</p>
                      <p className={styles.infoItem}><Calendar className={styles.infoIcon} size={16} /> Joined {selectedCustomer.joinDate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className={styles.sectionTitle}>Default Shipping Address</h4>
                    <div className={styles.addressBox}>
                      <MapPin className={styles.addressIcon} size={16} />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
