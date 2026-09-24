import { useState } from 'react';
import { useNavigate } from 'react-router';

const paymentOptions = [
  { value: 'cash', label: 'Cash on delivery', icon: '💵', desc: 'Pay when your order arrives' },
  { value: 'card', label: 'Card on delivery', icon: '💳', desc: 'Swipe or tap on arrival' },
  { value: 'online', label: 'Online payment', icon: '🔒', desc: 'Secure digital payment' },
];

const OrderForm = ({ cart = [], socket, onShowNotification }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', customerPhone: '', customerAddress: '', specialNotes: '', paymentMethod: 'cash' });
  const [errors, setErrors] = useState({});
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const deliveryFee = 5;
  const total = subtotal + tax + deliveryFee;

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.customerName.trim()) nextErrors.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) nextErrors.customerPhone = 'Phone number is required';
    else if (formData.customerPhone.replace(/\D/g, '').length < 10) nextErrors.customerPhone = 'Enter a valid phone number';
    if (!formData.customerAddress.trim()) nextErrors.customerAddress = 'Delivery address is required';
    else if (formData.customerAddress.trim().length < 10) nextErrors.customerAddress = 'Please enter a complete address';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return onShowNotification?.('Please complete the required fields.', 'error');
    if (!socket?.connected) return onShowNotification?.('The ordering service is offline. Please try again shortly.', 'error');
    setLoading(true);
    socket.emit('placeOrder', {
      ...formData,
      items: cart.map(({ id, name, quantity, price, image }) => ({ id, name, quantity, price, image })),
      subtotal, tax, deliveryFee, totalAmount: total,
    }, (response) => {
      setLoading(false);
      if (!response.success) return onShowNotification?.(response.message || 'Failed to place order', 'error');
      onShowNotification?.('Order placed successfully.', 'success');
      navigate(`/track/${response.order.orderId}`);
    });
  };

  if (cart.length === 0) return (
    <main className="route-page route-empty">
      <div><span className="route-empty__icon" aria-hidden="true">🛒</span><h2>Your cart is empty</h2><p>Add something delicious before checking out.</p><button className="route-button" onClick={() => navigate('/')}>Browse menu</button></div>
    </main>
  );

  return (
    <main className="route-page">
      <div className="route-container">
        <span className="route-kicker">Checkout</span>
        <h1 className="route-title">Complete your order</h1>
        <p className="route-subtitle">A few details, then we will get your meal moving.</p>
        <form className="route-grid" onSubmit={handleSubmit}>
          <div className="route-stack">
            <section className="route-card">
              <h2 className="route-card__title"><span className="route-card__icon">👤</span>Delivery details</h2>
              <div className="route-fields">
                {[['customerName', 'Full name', 'text', 'Your name'], ['customerPhone', 'Phone number', 'tel', '+1 234 567 8900']].map(([name, label, type, placeholder]) => <div className="route-field" key={name}>
                  <label htmlFor={name}>{label} <span aria-hidden="true">*</span></label>
                  <input id={name} name={name} type={type} className="route-input" value={formData[name]} onChange={handleChange} placeholder={placeholder} aria-invalid={Boolean(errors[name])} />
                  {errors[name] && <p className="route-error">{errors[name]}</p>}
                </div>)}
                <div className="route-field"><label htmlFor="customerAddress">Delivery address <span aria-hidden="true">*</span></label><textarea id="customerAddress" name="customerAddress" className="route-input" rows="3" value={formData.customerAddress} onChange={handleChange} placeholder="House, road, area, city" />{errors.customerAddress && <p className="route-error">{errors.customerAddress}</p>}</div>
                <div className="route-field"><label htmlFor="specialNotes">Special instructions</label><textarea id="specialNotes" name="specialNotes" className="route-input" rows="2" value={formData.specialNotes} onChange={handleChange} placeholder="Ring the bell twice..." /></div>
              </div>
            </section>
            <section className="route-card">
              <h2 className="route-card__title"><span className="route-card__icon">◈</span>Payment method</h2>
              <div className="payment-list">{paymentOptions.map((option) => <label key={option.value} className={`payment-option${formData.paymentMethod === option.value ? ' active' : ''}`}><input type="radio" name="paymentMethod" value={option.value} checked={formData.paymentMethod === option.value} onChange={handleChange} /><span aria-hidden="true">{option.icon}</span><span className="payment-option__copy"><span className="payment-option__label">{option.label}</span><span className="payment-option__desc">{option.desc}</span></span></label>)}</div>
              <button className="route-submit" type="submit" disabled={loading}>{loading ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}</button>
            </section>
          </div>
          <aside className="route-card summary-card">
            <h2 className="route-card__title"><span className="route-card__icon">≡</span>Order summary</h2>
            <div className="summary-items">{cart.map((item) => <div className="summary-item" key={item.id}><span><strong>{item.quantity}×</strong> {item.name}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>)}</div>
            <hr className="summary-divider" />
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div><div className="summary-row"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div><div className="summary-row summary-row--total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default OrderForm;
