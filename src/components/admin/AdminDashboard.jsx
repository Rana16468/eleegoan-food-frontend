/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import OrderCard from './OrderCard';
import OrderDetail from './OrderDetail';
import ConnectionStatus from '../common/ConnectionStatus';
import ThemeToggle from '../common/ThemeToggle';

const tabs = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'active', label: 'In progress', icon: '◌' },
  { key: 'delivery', label: 'Delivery', icon: '↗' },
  { key: 'completed', label: 'Completed', icon: '✓' },
  { key: 'cancelled', label: 'Cancelled', icon: '×' },
];

const AdminDashboard = ({ socket, onShowNotification, onLogout, theme, onToggleTheme }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    if (!socket?.connected) { setLoading(false); return onShowNotification('The admin service is offline. Please try again shortly.', 'error'); }
    setLoading(true);
    socket.emit('getAllOrders', {}, (response) => { setLoading(false); if (response.success) setOrders(response.orders); else onShowNotification('Failed to load orders.', 'error'); });
  };
  const loadStats = () => { if (socket?.connected) socket.emit('getLiveStats', (response) => { if (response.success) setStats(response.stats); }); };
  useEffect(() => {
    if (!socket) return;
    loadOrders(); loadStats();
    const handleNewOrder = (data) => { setOrders((current) => [data.order, ...current]); onShowNotification(`New order: ${data.order.orderId}`, 'info'); loadStats(); };
    const refresh = () => { loadOrders(); loadStats(); };
    socket.on('newOrder', handleNewOrder); socket.on('orderStatusChanged', refresh); socket.on('orderCancelled', refresh);
    return () => { socket.off('newOrder', handleNewOrder); socket.off('orderStatusChanged', refresh); socket.off('orderCancelled', refresh); };
  }, [socket]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'active') return ['confirmed', 'preparing', 'ready'].includes(order.status);
    if (activeTab === 'delivery') return order.status === 'out_for_delivery';
    if (activeTab === 'completed') return order.status === 'delivered';
    return order.status === 'cancelled';
  });
  const countFor = (key) => orders.filter((order) => key === 'pending' ? order.status === 'pending' : key === 'active' ? ['confirmed', 'preparing', 'ready'].includes(order.status) : key === 'delivery' ? order.status === 'out_for_delivery' : key === 'completed' ? order.status === 'delivered' : order.status === 'cancelled').length;
  const handleUpdateStatus = (orderId, newStatus) => { if (!socket?.connected) return onShowNotification('The admin service is offline.', 'error'); socket.emit('updateOrderStatus', { orderId, newStatus }, (response) => { if (response.success) { onShowNotification(`Status updated to ${newStatus}.`, 'success'); loadOrders(); loadStats(); } else onShowNotification(response.message || 'Failed to update status.', 'error'); }); };
  const handleAccept = (order) => { const time = Number(window.prompt('Estimated time in minutes:', '30')); if (!time || time < 5) return onShowNotification('Enter a valid estimate of at least 5 minutes.', 'error'); socket.emit('acceptOrder', { orderId: order.orderId, estimatedTime: time }, (response) => { if (response.success) { onShowNotification('Order accepted.', 'success'); loadOrders(); loadStats(); } else onShowNotification(response.message || 'Failed to accept order.', 'error'); }); };
  const handleReject = (order) => { const reason = window.prompt('Reason for rejection:'); if (!reason?.trim()) return; socket.emit('rejectOrder', { orderId: order.orderId, reason }, (response) => { if (response.success) { onShowNotification('Order rejected.', 'success'); loadOrders(); loadStats(); } else onShowNotification(response.message || 'Failed to reject order.', 'error'); }); };
  const statCards = stats ? [['Orders today', stats.totalToday], ['Pending', stats.pending], ['In kitchen', stats.preparing + stats.confirmed], ['Delivered', stats.delivered]] : [];

  return <main className="admin-page"><header className="admin-topbar"><div className="admin-topbar__inner"><div className="admin-brand"><span className="admin-brand__mark">◈</span><div><h1>FoodTrack Ops</h1><p>Real-time fulfilment workspace</p></div></div><div className="admin-actions"><ConnectionStatus connected={socket?.connected} /><ThemeToggle theme={theme} onToggle={onToggleTheme} /><button className="admin-icon-button" onClick={loadOrders} aria-label="Refresh orders">↻</button><button className="admin-logout" onClick={onLogout}>Sign out</button></div></div></header><div className="admin-main"><div className="route-kicker">Operations overview</div><h2 className="route-title">Keep service moving.</h2><p className="route-subtitle">Monitor demand, resolve exceptions, and move orders through fulfilment.</p>{stats && <div className="admin-stats">{statCards.map(([label, value]) => <div className="admin-stat" key={label}><p className="admin-stat__label">{label}</p><p className="admin-stat__value">{value}</p></div>)}</div>}<div className="admin-layout"><nav className="admin-tabs" aria-label="Order status filters">{tabs.map((tab) => <button key={tab.key} className={`admin-tab${activeTab === tab.key ? ' active' : ''}`} onClick={() => setActiveTab(tab.key)}><span>{tab.icon}</span><span>{tab.label}</span><span className="admin-tab__count">{countFor(tab.key)}</span></button>)}</nav><section className="admin-orders" aria-live="polite">{loading ? <div className="admin-empty"><div><strong>Loading orders</strong><span>Syncing with the kitchen...</span></div></div> : filteredOrders.length === 0 ? <div className="admin-empty"><div><strong>All clear</strong><span>No orders in this queue right now.</span></div></div> : <div className="admin-card-grid">{filteredOrders.map((order) => <OrderCard key={order.orderId} order={order} onViewDetails={setSelectedOrder} onAccept={handleAccept} onReject={handleReject} onUpdateStatus={handleUpdateStatus} />)}</div>}</section></div></div>{selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} socket={socket} onShowNotification={onShowNotification} />}</main>;
};

export default AdminDashboard;
