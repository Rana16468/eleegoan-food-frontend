/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import OrderDetail from './OrderDetail';
import ConnectionStatus from '../common/ConnectionStatus';

const AdminDashboard = ({ socket, onShowNotification, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    loadOrders();
    loadStats();

    socket.on('newOrder', (data) => {
      setOrders(prev => [data.order, ...prev]);
      onShowNotification(`🔔 New order: ${data.order.orderId}`, 'info');
      loadStats();
      new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77FeCg==').play().catch(() => {});
    });

    socket.on('orderStatusChanged', () => { loadOrders(); loadStats(); });
    socket.on('orderCancelled', (data) => {
      onShowNotification(`Order ${data.orderId} was cancelled`, 'warning');
      loadOrders(); loadStats();
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusChanged');
      socket.off('orderCancelled');
    };
  }, [socket]);

  const loadOrders = () => {
    setLoading(true);
    socket.emit('getAllOrders', {}, (response) => {
      setLoading(false);
      if (response.success) setOrders(response.orders);
      else onShowNotification('Failed to load orders', 'error');
    });
  };

  const loadStats = () => {
    socket.emit('getLiveStats', (response) => {
      if (response.success) setStats(response.stats);
    });
  };

  const handleAcceptOrder = (order) => {
    const time = prompt('Enter estimated time (minutes):', '30');
    if (!time) return;
    const estimatedTime = parseInt(time);
    if (isNaN(estimatedTime) || estimatedTime < 5) { onShowNotification('Please enter a valid time', 'error'); return; }
    socket.emit('acceptOrder', { orderId: order.orderId, estimatedTime }, (response) => {
      if (response.success) { onShowNotification(`Order ${order.orderId} accepted!`, 'success'); loadOrders(); loadStats(); }
      else onShowNotification(response.message || 'Failed to accept order', 'error');
    });
  };

  const handleRejectOrder = (order) => {
    const reasons = ['Out of ingredients', 'Kitchen at capacity', 'Outside delivery area', 'Payment issue', 'Other'];
    const reasonIndex = prompt(`Select reason:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEnter number (1-${reasons.length}):`);
    if (!reasonIndex) return;
    const index = parseInt(reasonIndex) - 1;
    let reason = reasons[index] || 'Other';
    if (reason === 'Other') { reason = prompt('Enter custom reason:'); if (!reason) return; }
    socket.emit('rejectOrder', { orderId: order.orderId, reason }, (response) => {
      if (response.success) { onShowNotification(`Order ${order.orderId} rejected`, 'success'); loadOrders(); loadStats(); }
      else onShowNotification(response.message || 'Failed to reject order', 'error');
    });
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    socket.emit('updateOrderStatus', { orderId, newStatus }, (response) => {
      if (response.success) { onShowNotification(`Status updated to ${newStatus}`, 'success'); loadOrders(); loadStats(); }
      else onShowNotification(response.message || 'Failed to update status', 'error');
    });
  };

  const filterOrders = (status) => {
    if (status === 'pending') return orders.filter(o => o.status === 'pending');
    if (status === 'active') return orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
    if (status === 'delivery') return orders.filter(o => o.status === 'out_for_delivery');
    if (status === 'completed') return orders.filter(o => o.status === 'delivered');
    if (status === 'cancelled') return orders.filter(o => o.status === 'cancelled');
    return orders;
  };

  const filteredOrders = filterOrders(activeTab);

  const tabs = [
    { key: 'pending',   label: 'Pending',     icon: '⏳', accent: '#F59E0B', bg: '#FEF3C7', dot: '#D97706' },
    { key: 'active',    label: 'In Progress',  icon: '🔄', accent: '#3B82F6', bg: '#DBEAFE', dot: '#2563EB' },
    { key: 'delivery',  label: 'Delivery',     icon: '🚗', accent: '#8B5CF6', bg: '#EDE9FE', dot: '#7C3AED' },
    { key: 'completed', label: 'Completed',    icon: '✓',  accent: '#10B981', bg: '#D1FAE5', dot: '#059669' },
    { key: 'cancelled', label: 'Cancelled',    icon: '✕',  accent: '#EF4444', bg: '#FEE2E2', dot: '#DC2626' },
  ];

  const statCards = stats ? [
    { label: "Today's Orders", value: stats.totalToday,                   icon: '📅', accent: '#6366F1', light: '#EEF2FF' },
    { label: 'Pending',        value: stats.pending,                       icon: '⏳', accent: '#F59E0B', light: '#FEF3C7' },
    { label: 'In Kitchen',     value: stats.preparing + stats.confirmed,   icon: '🍳', accent: '#F97316', light: '#FFEDD5' },
    { label: 'Delivered',      value: stats.delivered,                     icon: '✅', accent: '#10B981', light: '#D1FAE5' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #F1F5FF 50%, #F8F9FA 100%)' }} className="pb-20">

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 1px 30px rgba(99,102,241,0.06)',
      }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:h-20 gap-4">

            {/* Brand */}
            <div className="flex items-center gap-4">
              <div style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}>
                👨‍💼
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.3px', margin: 0 }}>
                  Admin Dashboard
                </h1>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', letterSpacing: '1.5px', margin: 0 }}>
                  REAL-TIME OVERVIEW
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
              <ConnectionStatus connected={socket?.connected} />

              <button
                onClick={loadOrders}
                title="Refresh"
                style={{
                  padding: '9px', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 12, background: 'white', cursor: 'pointer',
                  color: '#6366F1', fontSize: 18, lineHeight: 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                🔄
              </button>

              <button
                onClick={onLogout}
                style={{
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(30,27,75,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,27,75,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(30,27,75,0.3)'; }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* ── Stat Cards ── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {statCards.map(({ label, value, icon, accent, light }) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  borderRadius: 20,
                  padding: '20px 22px',
                  border: `1px solid ${accent}22`,
                  boxShadow: `0 4px 24px ${accent}12`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px ${accent}12`; }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute', top: -18, right: -18,
                  width: 80, height: 80, borderRadius: '50%',
                  background: light, opacity: 0.8,
                }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', margin: 0 }}>
                      {label}
                    </p>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: light, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {icon}
                    </div>
                  </div>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#1E1B4B', margin: 0, letterSpacing: '-1px' }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar Tabs */}
          <div className="w-full md:w-60 shrink-0 sticky top-24 z-30 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            <div style={{
              background: 'white', borderRadius: 20,
              border: '1px solid rgba(99,102,241,0.1)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.07)',
              padding: 8,
            }}
              className="flex md:flex-col gap-1 min-w-max md:min-w-0"
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                const count = filterOrders(tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', borderRadius: 14, width: '100%',
                      textAlign: 'left', border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isActive
                        ? `linear-gradient(135deg, ${tab.accent}18 0%, ${tab.accent}08 100%)`
                        : 'transparent',
                      borderLeft: isActive ? `3px solid ${tab.accent}` : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFF'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 17, opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: isActive ? 700 : 500,
                      color: isActive ? tab.accent : '#64748B',
                    }}>
                      {tab.label}
                    </span>
                    {count > 0 && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: isActive ? tab.accent : tab.bg,
                        color: isActive ? 'white' : tab.dot,
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '3px solid #EEF2FF', borderTopColor: '#6366F1',
                  animation: 'spin 0.8s linear infinite', marginBottom: 16,
                }} />
                <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: 14 }}>Fetching orders…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: 24,
                border: '2px dashed rgba(99,102,241,0.2)',
                padding: '64px 32px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(99,102,241,0.04)',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#F0F3FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 38, margin: '0 auto 20px',
                }}>
                  🍃
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', margin: '0 0 8px' }}>
                  All caught up!
                </h3>
                <p style={{ color: '#94A3B8', margin: 0 }}>No orders in this category right now.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onViewDetails={setSelectedOrder}
                    onAccept={handleAcceptOrder}
                    onReject={handleRejectOrder}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          socket={socket}
          onShowNotification={onShowNotification}
        />
      )}
    </div>
  );
};

export default AdminDashboard;