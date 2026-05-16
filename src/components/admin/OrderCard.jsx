import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   Download helpers  (jsPDF + SheetJS via CDN)
───────────────────────────────────────────── */

// Lazy-load jsPDF + autoTable once
let jsPDFLoaded = false;
const loadJsPDF = () =>
  new Promise((resolve) => {
    if (jsPDFLoaded) return resolve();
    const s1 = document.createElement("script");
    s1.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload = () => {
        jsPDFLoaded = true;
        resolve();
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });

// Lazy-load SheetJS once
let xlsxLoaded = false;
const loadXLSX = () =>
  new Promise((resolve) => {
    if (xlsxLoaded) return resolve();
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => {
      xlsxLoaded = true;
      resolve();
    };
    document.head.appendChild(s);
  });

/* ─────────────────────────────────────────────
   PDF generator
───────────────────────────────────────────── */
const downloadPDF = async (order) => {
  await loadJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header bar
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER RECEIPT", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Order #${order.orderId.slice(-6)}`, 14, 20);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    196,
    20,
    { align: "right" }
  );

  // Status badge
  const statusColors = {
    pending: [245, 158, 11],
    confirmed: [99, 102, 241],
    preparing: [249, 115, 22],
    ready: [16, 185, 129],
    out_for_delivery: [139, 92, 246],
    delivered: [5, 150, 105],
    cancelled: [239, 68, 68],
  };
  const [r, g, b] = statusColors[order.status] || [100, 116, 139];
  doc.setFillColor(r, g, b);
  doc.roundedRect(14, 32, 44, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(order.status.replace(/_/g, " ").toUpperCase(), 36, 37.5, {
    align: "center",
  });

  // Customer info section
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", 14, 50);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 52, 196, 52);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(order.customerName, 14, 60);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(order.customerPhone, 14, 66);
  doc.text(order.customerAddress, 14, 72);

  if (order.estimatedTime) {
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(130, 55, 66, 18, 3, 3, "F");
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(130, 55, 66, 18, 3, 3, "S");
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("EST. DELIVERY TIME", 163, 61, { align: "center" });
    doc.setFontSize(14);
    doc.text(`${order.estimatedTime} min`, 163, 69, { align: "center" });
  }

  // Items table
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER ITEMS", 14, 84);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 86, 196, 86);

  doc.autoTable({
    startY: 90,
    head: [["#", "Item", "Qty", "Unit Price", "Subtotal"]],
    body: order.items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`,
    ]),
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
  });

  // Total row
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFillColor(r, g, b);
  doc.roundedRect(120, finalY, 76, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", 130, finalY + 8);
  doc.text(`$${order.totalAmount.toFixed(2)}`, 192, finalY + 8, {
    align: "right",
  });

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 280, 210, 17, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your order!", 105, 289, { align: "center" });
  doc.text(`Order ID: ${order.orderId}`, 105, 294, { align: "center" });

  doc.save(`order_${order.orderId.slice(-6)}.pdf`);
};

/* ─────────────────────────────────────────────
   Excel generator
───────────────────────────────────────────── */
const downloadExcel = async (order) => {
  await loadXLSX();
  const XLSX = window.XLSX;

  // Sheet 1 – Order Summary
  const summaryRows = [
    ["ORDER SUMMARY", ""],
    ["", ""],
    ["Order ID", order.orderId],
    ["Order #", `#${order.orderId.slice(-6)}`],
    ["Status", order.status.replace(/_/g, " ").toUpperCase()],
    ["Date", new Date(order.createdAt).toLocaleString()],
    ["", ""],
    ["CUSTOMER", ""],
    ["Name", order.customerName],
    ["Phone", order.customerPhone],
    ["Address", order.customerAddress],
    ["", ""],
    ["FINANCIALS", ""],
    ["Total Amount", order.totalAmount],
    ["Items Count", order.items.length],
    ...(order.estimatedTime
      ? [["Estimated Time (min)", order.estimatedTime]]
      : []),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 22 }, { wch: 40 }];

  // Sheet 2 – Items
  const itemRows = [
    ["#", "Item Name", "Quantity", "Unit Price ($)", "Subtotal ($)"],
    ...order.items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity,
      parseFloat(item.price.toFixed(2)),
      parseFloat((item.price * item.quantity).toFixed(2)),
    ]),
    ["", "", "", "TOTAL", parseFloat(order.totalAmount.toFixed(2))],
  ];

  const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
  wsItems["!cols"] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, "Order Summary");
  XLSX.utils.book_append_sheet(wb, wsItems, "Items");

  XLSX.writeFile(wb, `order_${order.orderId.slice(-6)}.xlsx`);
};

/* ─────────────────────────────────────────────
   OrderCard Component
───────────────────────────────────────────── */
const OrderCard = ({ order, onViewDetails, onAccept, onReject, onUpdateStatus }) => {

  const statusConfig = {
    pending: {
      border: "#F59E0B",
      bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      badge: { bg: "#FDE68A", color: "#92400E" },
      amount: "#D97706",
      qty: "#D97706",
      label: "Pending",
    },
    confirmed: {
      border: "#6366F1",
      bg: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
      badge: { bg: "#C7D2FE", color: "#3730A3" },
      amount: "#4F46E5",
      qty: "#4F46E5",
      label: "Confirmed",
    },
    preparing: {
      border: "#F97316",
      bg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
      badge: { bg: "#FED7AA", color: "#9A3412" },
      amount: "#EA580C",
      qty: "#EA580C",
      label: "Preparing",
    },
    ready: {
      border: "#10B981",
      bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      badge: { bg: "#A7F3D0", color: "#065F46" },
      amount: "#059669",
      qty: "#059669",
      label: "Ready",
    },
    out_for_delivery: {
      border: "#8B5CF6",
      bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
      badge: { bg: "#DDD6FE", color: "#5B21B6" },
      amount: "#7C3AED",
      qty: "#7C3AED",
      label: "Out for Delivery",
    },
    delivered: {
      border: "#059669",
      bg: "linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)",
      badge: { bg: "#6EE7B7", color: "#064E3B" },
      amount: "#047857",
      qty: "#047857",
      label: "Delivered",
    },
    cancelled: {
      border: "#EF4444",
      bg: "linear-gradient(135deg, #FFF5F5 0%, #FEE2E2 100%)",
      badge: { bg: "#FCA5A5", color: "#7F1D1D" },
      amount: "#DC2626",
      qty: "#DC2626",
      label: "Cancelled",
    },
  };

  const cfg = statusConfig[order.status] || {
    border: "#94A3B8",
    bg: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
    badge: { bg: "#E2E8F0", color: "#475569" },
    amount: "#64748B",
    qty: "#64748B",
    label: order.status,
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 h ago";
    if (diffHours < 24) return `${diffHours} h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      confirmed: ["preparing"],
      preparing: ["ready"],
      ready: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
    };
    return transitions[currentStatus] || [];
  };

  const nextStatuses = getNextStatuses(order.status);

  const s = {
    card: {
      background: cfg.bg,
      borderLeft: `6px solid ${cfg.border}`,
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      height: "100%",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    orderId: {
      fontSize: "17px",
      fontWeight: "800",
      color: "#1E293B",
      letterSpacing: "-0.3px",
    },
    badge: {
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "0.05em",
      padding: "3px 9px",
      borderRadius: "999px",
      textTransform: "uppercase",
      background: cfg.badge.bg,
      color: cfg.badge.color,
    },
    timeLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#94A3B8",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginTop: "4px",
    },
    amount: {
      fontSize: "20px",
      fontWeight: "800",
      color: cfg.amount,
      textAlign: "right",
    },
    itemsLabel: {
      fontSize: "11px",
      color: "#94A3B8",
      fontWeight: "600",
      textAlign: "right",
      marginTop: "2px",
    },
    divider: {
      border: "none",
      borderTop: "1px solid rgba(0,0,0,0.07)",
    },
    infoRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    },
    infoIcon: {
      fontSize: "14px",
      minWidth: "18px",
      textAlign: "center",
    },
    infoText: {
      fontSize: "12px",
      color: "#475569",
      fontWeight: "500",
      lineHeight: "1.5",
    },
    itemRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "12px",
      padding: "7px 10px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(0,0,0,0.06)",
      color: "#334155",
    },
    itemQty: {
      fontWeight: "800",
      marginRight: "6px",
      color: cfg.qty,
    },
    itemPrice: {
      color: "#94A3B8",
      fontFamily: "monospace",
      fontSize: "11px",
    },
    moreItems: {
      textAlign: "center",
      fontSize: "11px",
      fontWeight: "700",
      color: "#94A3B8",
      background: "rgba(255,255,255,0.5)",
      borderRadius: "8px",
      padding: "5px",
    },
    btnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    },
    downloadRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    },
    btnPDF: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      background: "#fff",
      color: "#DC2626",
      border: "1.5px solid #FCA5A5",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
      borderRadius: "12px",
      padding: "9px 0",
      width: "100%",
      transition: "all 0.15s",
    },
    btnExcel: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      background: "#fff",
      color: "#16A34A",
      border: "1.5px solid #86EFAC",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
      borderRadius: "12px",
      padding: "9px 0",
      width: "100%",
      transition: "all 0.15s",
    },
    selectWrapper: {
      position: "relative",
    },
    select: {
      width: "100%",
      padding: "10px 36px 10px 14px",
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(0,0,0,0.1)",
      color: "#334155",
      fontSize: "13px",
      fontWeight: "700",
      borderRadius: "12px",
      appearance: "none",
      cursor: "pointer",
      outline: "none",
    },
    selectArrow: {
      position: "absolute",
      inset: "0",
      right: "0",
      display: "flex",
      alignItems: "center",
      paddingRight: "12px",
      pointerEvents: "none",
      fontSize: "11px",
      color: "#64748B",
      justifyContent: "flex-end",
    },
    eta: {
      alignSelf: "center",
      fontSize: "11px",
      fontWeight: "700",
      padding: "5px 14px",
      borderRadius: "999px",
      background: "#EFF6FF",
      color: "#1D4ED8",
      border: "1px solid #BFDBFE",
      marginTop: "4px",
    },
    sectionLabel: {
      fontSize: "10px",
      fontWeight: "700",
      color: "#94A3B8",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "-4px",
    },
  };

  return (
    <div
      style={s.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
    >
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
            <span style={s.orderId}>#{order.orderId.slice(-6)}</span>
            <span style={s.badge}>{cfg.label}</span>
          </div>
          <p style={s.timeLabel}>⏱ {getTimeAgo(order.createdAt)}</p>
        </div>
        <div>
          <p style={s.amount}>${order.totalAmount.toFixed(2)}</p>
          <p style={s.itemsLabel}>{order.items.length} items</p>
        </div>
      </div>

      <hr style={s.divider} />

      {/* ── Customer Info ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={s.infoRow}>
          <span style={s.infoIcon}>👤</span>
          <div>
            <p style={{ ...s.infoText, fontWeight: "600", color: "#1E293B" }}>
              {order.customerName}
            </p>
            <p style={s.infoText}>{order.customerPhone}</p>
          </div>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoIcon}>📍</span>
          <p style={s.infoText}>{order.customerAddress}</p>
        </div>
      </div>

      {/* ── Items Preview ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} style={s.itemRow}>
            <span>
              <span style={s.itemQty}>{item.quantity}x</span>
              {item.name}
            </span>
            <span style={s.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p style={s.moreItems}>+ {order.items.length - 2} more items</p>
        )}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>

        {/* Accept / Reject */}
        {order.status === "pending" && (
          <div style={s.btnGrid}>
            <button
              onClick={() => onAccept(order)}
              style={{
                background: "#10B981", color: "#fff", border: "none",
                cursor: "pointer", fontWeight: "700", fontSize: "13px",
                borderRadius: "12px", padding: "10px 0", width: "100%",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              ✓ Accept
            </button>
            <button
              onClick={() => onReject(order)}
              style={{
                background: "#fff", color: "#EF4444",
                border: "1.5px solid #FCA5A5", cursor: "pointer",
                fontWeight: "700", fontSize: "13px", borderRadius: "12px",
                padding: "10px 0", width: "100%", transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Reject
            </button>
          </div>
        )}

        {/* Status Update */}
        {nextStatuses.length > 0 && (
          <div style={s.selectWrapper}>
            <select
              onChange={(e) => onUpdateStatus(order.orderId, e.target.value)}
              style={s.select}
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              {nextStatuses.map((status) => (
                <option key={status} value={status}>
                  Make {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <div style={s.selectArrow}>▼</div>
          </div>
        )}

        {/* View Details */}
        <button
          onClick={() => onViewDetails(order)}
          style={{
            background: "#1E293B", color: "#fff", border: "none",
            cursor: "pointer", fontWeight: "700", fontSize: "13px",
            borderRadius: "12px", padding: "10px 0", width: "100%",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View Details
        </button>

        {/* ── Download Section ── */}
        <p style={s.sectionLabel}>⬇ Download Order</p>
        <div style={s.downloadRow}>
          {/* PDF Button */}
          <button
            onClick={() => downloadPDF(order)}
            style={s.btnPDF}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF5F5";
              e.currentTarget.style.borderColor = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#FCA5A5";
            }}
            title="Download as PDF"
          >
            <span style={{ fontSize: "15px" }}>📄</span> PDF
          </button>

          {/* Excel Button */}
          <button
            onClick={() => downloadExcel(order)}
            style={s.btnExcel}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F0FDF4";
              e.currentTarget.style.borderColor = "#16A34A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#86EFAC";
            }}
            title="Download as Excel"
          >
            <span style={{ fontSize: "15px" }}>📊</span> Excel
          </button>
        </div>
      </div>

      {/* ── ETA Badge ── */}
      {order.estimatedTime && !["delivered", "cancelled"].includes(order.status) && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span style={s.eta}>⏱️ {order.estimatedTime} min remaining</span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;