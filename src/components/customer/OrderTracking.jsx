import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

const OrderTracking = ({ socket, onShowNotification }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Moved above useEffect so it's declared before use
  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Waiting for restaurant confirmation...',
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your food is being prepared',
      ready: 'Your order is ready for pickup!',
      out_for_delivery: 'Driver is on the way',
      delivered: 'Delivered! Enjoy your meal!',
      cancelled: 'Order was cancelled',
    };
    return messages[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      pending:          { bg: '#F59E0B', light: '#FEF3C7', text: '#92400E' },
      confirmed:        { bg: '#3B82F6', light: '#DBEAFE', text: '#1E3A8A' },
      preparing:        { bg: '#F97316', light: '#FFEDD5', text: '#7C2D12' },
      ready:            { bg: '#10B981', light: '#D1FAE5', text: '#064E3B' },
      out_for_delivery: { bg: '#8B5CF6', light: '#EDE9FE', text: '#4C1D95' },
      delivered:        { bg: '#059669', light: '#D1FAE5', text: '#064E3B' },
      cancelled:        { bg: '#EF4444', light: '#FEE2E2', text: '#7F1D1D' },
    };
    return map[status] || { bg: '#6B7280', light: '#F3F4F6', text: '#1F2937' };
  };

  const statusSteps = [
    { key: 'pending',          label: 'Placed',    icon: '📝' },
    { key: 'confirmed',        label: 'Confirmed', icon: '✅' },
    { key: 'preparing',        label: 'Preparing', icon: '🍳' },
    { key: 'ready',            label: 'Ready',     icon: '📦' },
    { key: 'out_for_delivery', label: 'On the Way',icon: '🚗' },
    { key: 'delivered',        label: 'Delivered', icon: '🎉' },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex((s) => s.key === order.status);
  };

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('trackOrder', { orderId }, (response) => {
      setLoading(false);
      if (response.success) {
        setOrder(response.order);
      } else {
        onShowNotification(response.message || 'Order not found', 'error');
        setTimeout(() => navigate('/'), 2000);
      }
    });

    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrder(data.order);
        // ✅ Now safe: getStatusMessage is declared above
        onShowNotification(`Status updated: ${getStatusMessage(data.status)}`, 'info');
      }
    };

    const handleOrderAccepted = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Order confirmed! Ready in ${data.estimatedTime} minutes`, 'success');
        socket.emit('trackOrder', { orderId }, (r) => { if (r.success) setOrder(r.order); });
      }
    };

    const handleOrderRejected = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Order rejected: ${data.reason}`, 'error');
        socket.emit('trackOrder', { orderId }, (r) => { if (r.success) setOrder(r.order); });
      }
    };

    const handleOrderCancelled = (data) => {
      if (data.orderId === orderId) {
        onShowNotification('Order has been cancelled', 'warning');
        socket.emit('trackOrder', { orderId }, (r) => { if (r.success) setOrder(r.order); });
      }
    };

    const handleTimeUpdated = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Updated: Ready in ${data.estimatedTime} minutes`, 'info');
        socket.emit('trackOrder', { orderId }, (r) => { if (r.success) setOrder(r.order); });
      }
    };

    socket.on('statusUpdated',        handleStatusUpdate);
    socket.on('orderAccepted',        handleOrderAccepted);
    socket.on('orderRejected',        handleOrderRejected);
    socket.on('orderCancelled',       handleOrderCancelled);
    socket.on('estimatedTimeUpdated', handleTimeUpdated);

    return () => {
      socket.off('statusUpdated',        handleStatusUpdate);
      socket.off('orderAccepted',        handleOrderAccepted);
      socket.off('orderRejected',        handleOrderRejected);
      socket.off('orderCancelled',       handleOrderCancelled);
      socket.off('estimatedTimeUpdated', handleTimeUpdated);
    };
  }, [socket, orderId, navigate, onShowNotification]);

  const handleCancelOrder = () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const reason = prompt('Reason for cancellation (optional):') || 'No reason provided';
    socket.emit('cancelOrder', { orderId, reason }, (response) => {
      if (response.success) {
        onShowNotification('Order cancelled successfully', 'success');
      } else {
        onShowNotification(response.message || 'Failed to cancel order', 'error');
      }
    });
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    onShowNotification('Order ID copied!', 'success');
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} />
        </div>
        <p style={styles.loadingText}>Fetching your order…</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (!order) {
    return (
      <div style={styles.centered}>
        <span style={{ fontSize: 64 }}>❌</span>
        <p style={styles.loadingText}>Order not found</p>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const canCancel        = ['pending', 'confirmed'].includes(order.status);
  const statusColors     = getStatusColor(order.status);
  const progressPct      = order.status === 'cancelled'
    ? 0
    : (currentStepIndex / (statusSteps.length - 1)) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Top nav ── */}
        <div style={styles.topNav}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>
            ← Menu
          </button>
          <span style={styles.navTitle}>Live Order Tracking</span>
          <div style={{ width: 72 }} />
        </div>

        {/* ── Status Hero ── */}
        <div style={{ ...styles.heroCard, background: statusColors.bg }}>
          <div style={styles.heroInner}>
            <div>
              <p style={styles.heroLabel}>Current Status</p>
              <p style={styles.heroStatus}>{getStatusMessage(order.status)}</p>
              {order.estimatedTime && !['delivered', 'cancelled'].includes(order.status) && (
                <p style={styles.heroEta}>⏱ {order.estimatedTime} min estimated</p>
              )}
            </div>
            <div style={{ ...styles.heroBadge, background: 'rgba(255,255,255,0.25)' }}>
              {statusSteps.find(s => s.key === order.status)?.icon || '🔄'}
            </div>
          </div>
          {/* Order ID row */}
          <div style={styles.orderIdRow}>
            <span style={styles.orderIdLabel}>Order ID</span>
            <code style={styles.orderIdCode}>{orderId}</code>
            <button onClick={copyOrderId} style={styles.copyBtn} title="Copy">📋</button>
          </div>
        </div>

        {/* ── Progress Stepper ── */}
        {order.status !== 'cancelled' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Order Progress</h2>
            {/* Track */}
            <div style={styles.trackWrap}>
              <div style={styles.trackBg}>
                <div style={{ ...styles.trackFill, width: `${progressPct}%`, background: statusColors.bg }} />
              </div>
              <div style={styles.stepsRow}>
                {statusSteps.map((step, i) => {
                  const done    = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  return (
                    <div key={step.key} style={styles.stepCol}>
                      <div style={{
                        ...styles.stepDot,
                        background:  done ? statusColors.bg : '#E5E7EB',
                        boxShadow:   current ? `0 0 0 4px ${statusColors.light}` : 'none',
                        transform:   current ? 'scale(1.15)' : 'scale(1)',
                      }}>
                        <span style={{ fontSize: current ? 18 : 14 }}>{step.icon}</span>
                      </div>
                      <span style={{
                        ...styles.stepLabel,
                        color:      done ? statusColors.bg : '#9CA3AF',
                        fontWeight: current ? 700 : 400,
                      }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Order Items ── */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          <div style={styles.itemsList}>
            {order.items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <span style={styles.itemEmoji}>{item.image}</span>
                <div style={styles.itemInfo}>
                  <p style={styles.itemName}>{item.quantity}× {item.name}</p>
                  {item.specialInstructions && (
                    <p style={styles.itemNote}>📌 {item.specialInstructions}</p>
                  )}
                </div>
                <span style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div style={styles.totalsWrap}>
            {[
              { label: 'Subtotal',     value: order.subtotal },
              { label: 'Tax',          value: order.tax },
              { label: 'Delivery Fee', value: order.deliveryFee },
            ].map(({ label, value }) => (
              <div key={label} style={styles.totalRow}>
                <span style={styles.totalLabel}>{label}</span>
                <span style={styles.totalValue}>${value.toFixed(2)}</span>
              </div>
            ))}
            <div style={styles.grandRow}>
              <span style={styles.grandLabel}>Total</span>
              <span style={{ ...styles.grandValue, color: statusColors.bg }}>
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Delivery Info ── */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Delivery Information</h2>
          <div style={styles.infoGrid}>
            {[
              { icon: '👤', label: 'Name',    value: order.customerName },
              { icon: '📞', label: 'Phone',   value: order.customerPhone },
              { icon: '📍', label: 'Address', value: order.customerAddress },
              ...(order.specialNotes
                ? [{ icon: '📝', label: 'Notes', value: order.specialNotes }]
                : []),
            ].map(({ icon, label, value }) => (
              <div key={label} style={styles.infoItem}>
                <span style={styles.infoIcon}>{icon}</span>
                <div>
                  <p style={styles.infoLabel}>{label}</p>
                  <p style={styles.infoValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cancel ── */}
        {canCancel && (
          <button onClick={handleCancelOrder} style={styles.cancelBtn}>
            Cancel Order
          </button>
        )}

      </div>
    </div>
  );
};

/* ── Inline styles ────────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    paddingBottom: 40,
  },
  container: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '0 16px',
  },

  /* nav */
  topNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0 12px',
  },
  backBtn: {
    background: 'none',
    border: '1.5px solid #CBD5E1',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 14,
    color: '#475569',
    fontWeight: 600,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1E293B',
  },

  /* hero */
  heroCard: {
    borderRadius: 20,
    padding: '24px 24px 20px',
    marginBottom: 16,
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  heroInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.85,
    marginBottom: 4,
  },
  heroStatus: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  heroEta: {
    fontSize: 15,
    opacity: 0.9,
    fontWeight: 500,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    flexShrink: 0,
  },
  orderIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: '8px 14px',
    flexWrap: 'wrap',
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.8,
  },
  orderIdCode: {
    fontSize: 13,
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.2)',
    padding: '2px 8px',
    borderRadius: 6,
    flex: 1,
    minWidth: 0,
    wordBreak: 'break-all',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 2,
  },

  /* card */
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '24px',
    marginBottom: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1E293B',
    marginBottom: 20,
    marginTop: 0,
  },

  /* stepper */
  trackWrap: { position: 'relative', paddingBottom: 8 },
  trackBg: {
    position: 'absolute',
    top: 20,
    left: '8%',
    right: '8%',
    height: 4,
    background: '#E5E7EB',
    borderRadius: 4,
    zIndex: 0,
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.6s ease',
  },
  stepsRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
  },
  stepCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stepDot: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s ease',
  },
  stepLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'inherit',
    transition: 'color 0.4s ease',
    lineHeight: 1.2,
  },

  /* items */
  itemsList: { marginBottom: 20 },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  itemEmoji: { fontSize: 28, flexShrink: 0 },
  itemInfo:  { flex: 1, minWidth: 0 },
  itemName:  { fontSize: 15, fontWeight: 600, color: '#1E293B', marginBottom: 2 },
  itemNote:  { fontSize: 12, color: '#64748B' },
  itemPrice: { fontSize: 15, fontWeight: 700, color: '#1E293B', flexShrink: 0 },

  /* totals */
  totalsWrap: { borderTop: '2px dashed #E2E8F0', paddingTop: 16 },
  totalRow:   { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: '#64748B' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: 500 },
  grandRow:   {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #E2E8F0',
  },
  grandLabel: { fontSize: 18, fontWeight: 700, color: '#1E293B' },
  grandValue: { fontSize: 20, fontWeight: 800 },

  /* delivery info */
  infoGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '12px 16px',
    background: '#F8FAFC',
    borderRadius: 12,
  },
  infoIcon:  { fontSize: 20, marginTop: 2 },
  infoLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1E293B', fontWeight: 500 },

  /* cancel */
  cancelBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
    marginTop: 4,
  },

  /* loading */
  centered: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '5px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 500,
  },
};

export default OrderTracking;