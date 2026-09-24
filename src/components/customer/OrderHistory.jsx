import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const ACTIVE = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' };
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const OrderHistory = ({ socket, onShowNotification }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('customerPhone') || '');
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const didFetch = useRef(false);

  const loadOrders = (phone) => {
    if (!socket?.connected) return onShowNotification('Order history is currently unavailable. Please try again shortly.', 'error');
    setLoading(true);
    socket.emit('getMyOrders', { customerPhone: phone }, (response) => {
      setLoading(false);
      if (!response.success) return onShowNotification('Failed to load orders.', 'error');
      setOrders(response.orders);
      setShowPhoneInput(false);
      localStorage.setItem('customerPhone', phone);
    });
  };

  useEffect(() => {
    if (didFetch.current) return;
    const savedPhone = localStorage.getItem('customerPhone');
    if (!savedPhone) return;
    didFetch.current = true;
    if (!socket?.connected) return onShowNotification('Order history is currently unavailable. Please try again shortly.', 'error');
    socket.emit('getMyOrders', { customerPhone: savedPhone }, (response) => {
      if (response.success) { setOrders(response.orders); setShowPhoneInput(false); }
      else onShowNotification('Failed to load orders.', 'error');
    });
  }, [socket, onShowNotification]);

  const submitPhone = (event) => { event.preventDefault(); if (!customerPhone.trim()) return onShowNotification('Please enter your phone number.', 'error'); loadOrders(customerPhone.trim()); };
  const counts = { all: orders.length, active: orders.filter((order) => ACTIVE.includes(order.status)).length, completed: orders.filter((order) => order.status === 'delivered').length, cancelled: orders.filter((order) => order.status === 'cancelled').length };
  const filteredOrders = orders.filter((order) => filterStatus === 'all' || (filterStatus === 'active' && ACTIVE.includes(order.status)) || (filterStatus === 'completed' && order.status === 'delivered') || (filterStatus === 'cancelled' && order.status === 'cancelled'));

  if (showPhoneInput && !loading) return (
    <main className="route-page"><div className="route-container history-gate"><section className="route-card history-gate__card"><span className="route-kicker">Order history</span><h1 className="route-title">Find your orders</h1><p className="route-subtitle">Use the phone number from checkout to securely view your recent orders.</p><form className="route-fields" onSubmit={submitPhone} style={{ marginTop: 26 }}><div className="route-field"><label htmlFor="history-phone">Phone number</label><input id="history-phone" type="tel" className="route-input" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+1 234 567 8900" /></div><button className="route-submit" type="submit">View my orders</button><button className="route-button" type="button" onClick={() => navigate('/')}>Back to menu</button></form></section></div></main>
  );

  if (loading) return <main className="route-page route-empty"><div><span className="route-empty__icon" aria-hidden="true">◌</span><h2>Loading your orders</h2><p>Fetching the latest activity.</p></div></main>;

  return (
    <main className="route-page"><div className="route-container">
      <div className="history-header"><div><span className="route-kicker">Your activity</span><h1 className="route-title">Order history</h1><p className="route-subtitle">A clear view of every meal, status, and delivery.</p></div><button className="admin-icon-button" type="button" onClick={() => { localStorage.removeItem('customerPhone'); didFetch.current = false; setShowPhoneInput(true); setOrders([]); }}>Change phone</button></div>
      <div className="history-toolbar"><div className="history-tabs" role="tablist">{Object.entries(counts).map(([key, count]) => <button type="button" role="tab" aria-selected={filterStatus === key} key={key} className={`history-tab${filterStatus === key ? ' active' : ''}`} onClick={() => setFilterStatus(key)}>{key[0].toUpperCase() + key.slice(1)} · {count}</button>)}</div></div>
      {filteredOrders.length === 0 ? <section className="route-card route-empty"><div><span className="route-empty__icon" aria-hidden="true">📦</span><h2>No orders here</h2><p>Ready for something new? Browse the menu and place your first order.</p><button className="route-button" onClick={() => navigate('/')}>Browse menu</button></div></section> : <div className="history-list">{filteredOrders.map((order) => <article key={order.orderId} className="history-order" role="button" tabIndex="0" onClick={() => navigate(`/track/${order.orderId}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/track/${order.orderId}`); }}><div className="history-order__top"><div><p className="history-order__id">{order.orderId}</p><p className="history-order__date">{formatDate(order.createdAt)}</p></div><div><p className="history-order__amount">${order.totalAmount.toFixed(2)}</p><p className="history-order__meta">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p></div></div><div className="history-order__items">{order.items.slice(0, 3).map((item) => <span className="history-item-chip" key={item.id || item.name}>{item.image} {item.quantity}× {item.name}</span>)}{order.items.length > 3 && <span className="history-item-chip">+{order.items.length - 3} more</span>}</div><div className="history-order__footer"><span className="history-order__meta">{order.estimatedTime && !['delivered', 'cancelled'].includes(order.status) ? `Estimated ${order.estimatedTime} min` : 'Order complete'}</span><span className="history-order__cta">{statusLabels[order.status] || order.status} · View details →</span></div></article>)}</div>}
    </div></main>
  );
};

export default OrderHistory;
