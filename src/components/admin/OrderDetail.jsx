import { useState } from 'react';
import {
  CalendarDays, Check, ChefHat, CircleAlert, ClipboardList, Clock3, CreditCard,
  History, MapPin, Minus, NotebookPen, Package, Phone, Plus, Save, ShoppingBag,
  UserRound, WalletCards, X,
} from 'lucide-react';

const statusMeta = {
  pending: { label: 'Pending', tone: 'amber' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  preparing: { label: 'Preparing', tone: 'orange' },
  ready: { label: 'Ready', tone: 'green' },
  out_for_delivery: { label: 'On the way', tone: 'violet' },
  delivered: { label: 'Delivered', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'rose' },
};

const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const money = (value = 0) => `$${Number(value).toFixed(2)}`;

const SectionHeading = ({ icon, children }) => {
  const IconComponent = icon;
  return <h3 className="od-section-title"><span className="od-section-icon"><IconComponent size={17} strokeWidth={2.2} /></span>{children}</h3>;
};

const OrderDetail = ({ order, onClose, socket, onShowNotification }) => {
  const [estimatedTime, setEstimatedTime] = useState(order.estimatedTime || 30);
  const [saving, setSaving] = useState(false);
  const status = statusMeta[order.status] || statusMeta.pending;

  const handleSetTime = () => {
    if (!socket?.connected) return onShowNotification('The admin service is offline.', 'error');
    setSaving(true);
    socket.emit('setEstimatedTime', { orderId: order.orderId, estimatedTime }, (response) => {
      setSaving(false);
      onShowNotification(response.success ? `Estimate updated to ${estimatedTime} minutes.` : response.message || 'Failed to update estimate.', response.success ? 'success' : 'error');
    });
  };

  return (
    <div className="od-overlay" role="presentation">
      <button className="od-backdrop" onClick={onClose} aria-label="Close order details" />
      <section className="od-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <header className="od-header">
          <div className="od-header__identity"><span className="od-header__icon"><ClipboardList size={21} /></span><div><p className="od-eyebrow">Order workspace</p><h2 id="order-detail-title">Order details</h2><p className="od-order-id">{order.orderId}</p></div></div>
          <button className="od-close" onClick={onClose} aria-label="Close order details"><X size={20} /></button>
        </header>

        <div className="od-body">
          <div className="od-overview-grid"><div className="od-overview-card"><span className={`od-status od-status--${status.tone}`}><span className="od-status__dot" />{status.label}</span><p className="od-label">Current status</p></div><div className="od-overview-card"><span className="od-overview-icon"><CalendarDays size={18} /></span><div><p className="od-label">Placed on</p><p className="od-value">{formatDate(order.createdAt)}</p></div></div></div>

          <section className="od-panel od-customer-panel"><SectionHeading icon={UserRound}>Customer details</SectionHeading><div className="od-info-grid"><div><p className="od-label">Name</p><p className="od-value">{order.customerName}</p></div><div><p className="od-label">Phone</p><a className="od-link" href={`tel:${order.customerPhone}`}><Phone size={15} />{order.customerPhone}</a></div><div className="od-info-wide"><p className="od-label"><MapPin size={14} /> Delivery address</p><p className="od-address">{order.customerAddress}</p></div>{order.specialNotes && <div className="od-info-wide od-note"><p className="od-label"><NotebookPen size={14} /> Special instructions</p><p>{order.specialNotes}</p></div>}</div></section>

          <section className="od-panel"><SectionHeading icon={ShoppingBag}>Order items</SectionHeading><div className="od-items">{order.items.map((item, index) => <div className="od-item" key={item.id || `${item.name}-${index}`}><div className="od-item__visual">{item.image || <Package size={22} />}</div><div className="od-item__copy"><div><span className="od-quantity">{item.quantity}×</span><strong>{item.name}</strong></div><p>{money(item.price)} each</p>{item.specialInstructions && <small><NotebookPen size={12} /> {item.specialInstructions}</small>}</div><strong className="od-item__total">{money(item.price * item.quantity)}</strong></div>)}</div><div className="od-totals"><div><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div><div><span>Tax</span><strong>{money(order.tax)}</strong></div><div><span>Delivery fee</span><strong>{money(order.deliveryFee)}</strong></div><div className="od-total"><span>Total due</span><strong>{money(order.totalAmount)}</strong></div></div></section>

          <section className="od-panel"><SectionHeading icon={CreditCard}>Payment details</SectionHeading><div className="od-payment-grid"><div><p className="od-label">Method</p><p className="od-value od-capitalize"><WalletCards size={16} />{order.paymentMethod || 'Cash'}</p></div><div><p className="od-label">Payment status</p><span className={`od-payment-status ${order.paymentStatus === 'paid' ? 'is-paid' : 'is-pending'}`}>{order.paymentStatus === 'paid' ? <><Check size={14} />Paid</> : <><Clock3 size={14} />Pending</>}</span></div></div></section>

          {!['delivered', 'cancelled'].includes(order.status) && <section className="od-panel od-estimate"><SectionHeading icon={ChefHat}>Delivery estimate</SectionHeading><div className="od-estimate__row"><div className="od-stepper"><button onClick={() => setEstimatedTime(Math.max(5, estimatedTime - 5))} aria-label="Decrease estimate"><Minus size={16} /></button><strong>{estimatedTime}<small>MIN</small></strong><button onClick={() => setEstimatedTime(estimatedTime + 5)} aria-label="Increase estimate"><Plus size={16} /></button></div><button className="od-save" onClick={handleSetTime} disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Update estimate'}</button></div></section>}

          {order.statusHistory?.length > 0 && <section className="od-panel"><SectionHeading icon={History}>Status history</SectionHeading><div className="od-timeline">{[...order.statusHistory].reverse().map((entry, index) => <div className="od-timeline__item" key={`${entry.timestamp}-${index}`}><span className="od-timeline__dot" /> <div><strong>{entry.status.replaceAll('_', ' ')}</strong><time>{formatDate(entry.timestamp)}</time>{entry.note && <p>{entry.note}</p>}</div></div>)}</div></section>}
        </div>
        <footer className="od-footer"><span><CircleAlert size={14} /> Changes sync to the live order feed.</span><button className="od-footer__close" onClick={onClose}>Close details</button></footer>
      </section>
    </div>
  );
};

export default OrderDetail;
