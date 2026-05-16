import { useState } from 'react';
import { useNavigate } from 'react-router';

const OrderForm = ({ cart = [], socket, onShowNotification }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    specialNotes: '',
    paymentMethod: 'cash'
  });
  const [errors, setErrors] = useState({});

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const deliveryFee = 5.0;
    const total = subtotal + tax + deliveryFee;
    return { subtotal, tax, deliveryFee, total };
  };

  const totals = calculateTotals();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    else if (formData.customerPhone.length < 10) newErrors.customerPhone = 'Enter a valid phone number';
    if (!formData.customerAddress.trim()) newErrors.customerAddress = 'Delivery address is required';
    else if (formData.customerAddress.length < 10) newErrors.customerAddress = 'Please enter a complete address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { onShowNotification?.('Please fill all required fields correctly', 'error'); return; }
    if (cart.length === 0) { onShowNotification?.('Your cart is empty', 'error'); return; }
    setLoading(true);
    const orderData = {
      ...formData,
      items: cart.map(({ id, name, quantity, price, image }) => ({ id, name, quantity, price, image })),
      subtotal: totals.subtotal, tax: totals.tax, deliveryFee: totals.deliveryFee, totalAmount: totals.total
    };
    socket?.emit('placeOrder', orderData, (response) => {
      setLoading(false);
      if (response.success) {
        onShowNotification?.('Order placed successfully! 🎉', 'success');
        setTimeout(() => navigate(`/track/${response.order.orderId}`), 1000);
      } else {
        onShowNotification?.(response.message || 'Failed to place order', 'error');
      }
    });
  };

  const paymentOptions = [
    { value: 'cash', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
    { value: 'card', label: 'Card on Delivery', icon: '💳', desc: 'Swipe or tap on arrival' },
    { value: 'online', label: 'Online Payment', icon: '🔒', desc: 'Secure digital payment' },
  ];

  if (cart.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
          .of-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f7f4ef; display: flex; align-items: center; justify-content: center; }
          .of-empty { text-align: center; padding: 2rem; }
          .of-empty-icon { font-size: 5rem; margin-bottom: 1.5rem; animation: float 3s ease-in-out infinite; }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          .of-empty h2 { font-family: 'Sora', sans-serif; font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; color: #1a1a2e; margin-bottom: 0.75rem; }
          .of-empty p { color: #777; font-size: 1rem; margin-bottom: 2rem; }
          .btn-primary { background: #ff5c35; color: #fff; border: none; padding: 0.85rem 2.2rem; border-radius: 50px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform .2s, box-shadow .2s; box-shadow: 0 4px 16px rgba(255,92,53,.35); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,92,53,.45); }
        `}</style>
        <div className="of-root">
          <div className="of-empty">
            <div className="of-empty-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some delicious items before checking out</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Browse Menu</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .of-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f7f4ef;
          background-image: radial-gradient(ellipse at 20% 50%, rgba(255,92,53,.06) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,.05) 0%, transparent 55%);
          padding: clamp(1rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem);
        }

        .of-container {
          max-width: 1040px;
          margin: 0 auto;
        }

        .of-header {
          margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
        }
        .of-header-label {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,92,53,.12); color: #ff5c35;
          font-size: 0.78rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.75rem;
        }
        .of-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 800; color: #1a1a2e; line-height: 1.1;
        }
        .of-title span { color: #ff5c35; }

        .of-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .of-grid { grid-template-columns: 3fr 2fr; align-items: start; }
        }
        @media (min-width: 1024px) {
          .of-grid { grid-template-columns: 7fr 4fr; gap: 2rem; }
        }

        /* Cards */
        .of-card {
          background: #fff;
          border-radius: 20px;
          padding: clamp(1.25rem, 4vw, 2rem);
          box-shadow: 0 2px 24px rgba(0,0,0,.06), 0 0 0 1px rgba(0,0,0,.03);
          transition: box-shadow .3s;
        }
        .of-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,.09); }

        .of-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem; font-weight: 700; color: #1a1a2e;
          display: flex; align-items: center; gap: 0.5rem;
          padding-bottom: 1rem; margin-bottom: 1.25rem;
          border-bottom: 2px solid #f0ede8;
        }
        .of-section-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #ff5c35, #ff8c69);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }

        /* Fields */
        .of-fields { display: flex; flex-direction: column; gap: 1.1rem; }

        .of-field label {
          display: block; font-size: 0.83rem; font-weight: 500;
          color: #555; margin-bottom: 0.45rem; letter-spacing: .01em;
        }
        .of-field label .req { color: #ff5c35; margin-left: 2px; }

        .of-input, .of-textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #ebe8e2;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #1a1a2e;
          background: #fdfcfa;
          transition: border-color .2s, box-shadow .2s, background .2s;
          outline: none;
          -webkit-appearance: none;
        }
        .of-input::placeholder, .of-textarea::placeholder { color: #bbb; }
        .of-input:focus, .of-textarea:focus {
          border-color: #ff5c35;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(255,92,53,.1);
        }
        .of-input.error, .of-textarea.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239,68,68,.09);
        }
        .of-textarea { resize: vertical; min-height: 80px; }
        .of-error-msg {
          font-size: 0.78rem; color: #ef4444;
          margin-top: 0.35rem; display: flex; align-items: center; gap: 4px;
        }

        /* Payment */
        .of-payment-options { display: flex; flex-direction: column; gap: 0.75rem; }
        @media (min-width: 480px) and (max-width: 767px) {
          .of-payment-options { flex-direction: row; flex-wrap: wrap; }
          .of-payment-option { flex: 1 1 calc(33% - 0.5rem); }
        }

        .of-payment-option {
          position: relative;
          border: 2px solid #ebe8e2;
          border-radius: 14px;
          padding: 0.9rem 1rem;
          cursor: pointer;
          transition: border-color .2s, background .2s, transform .15s;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .of-payment-option:hover { border-color: #ffb39e; transform: translateY(-1px); }
        .of-payment-option.active {
          border-color: #ff5c35;
          background: linear-gradient(135deg, rgba(255,92,53,.06), rgba(255,92,53,.02));
        }
        .of-payment-option input { position: absolute; opacity: 0; pointer-events: none; }
        .of-pay-icon { font-size: 1.4rem; flex-shrink: 0; }
        .of-pay-info { flex: 1; min-width: 0; }
        .of-pay-label { font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700; color: #1a1a2e; }
        .of-pay-desc { font-size: 0.75rem; color: #999; margin-top: 1px; }
        .of-pay-check {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #ddd; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color .2s, background .2s;
        }
        .of-payment-option.active .of-pay-check {
          border-color: #ff5c35; background: #ff5c35;
        }
        .of-pay-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #fff; opacity: 0; transform: scale(0);
          transition: opacity .2s, transform .2s;
        }
        .of-payment-option.active .of-pay-dot { opacity: 1; transform: scale(1); }

        /* Submit */
        .of-submit {
          width: 100%; margin-top: 1.5rem;
          background: linear-gradient(135deg, #ff5c35 0%, #ff3d0d 100%);
          color: #fff; border: none;
          padding: 1.05rem 1.5rem;
          border-radius: 14px;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem;
          cursor: pointer; letter-spacing: .02em;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          box-shadow: 0 6px 24px rgba(255,92,53,.4);
          transition: transform .2s, box-shadow .2s, opacity .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .of-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,92,53,.5); }
        .of-submit:active:not(:disabled) { transform: translateY(0); }
        .of-submit:disabled { opacity: 0.65; cursor: not-allowed; box-shadow: none; }

        .of-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.4);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Summary card */
        .of-summary { position: sticky; top: 1.5rem; }

        .of-items-list {
          max-height: 220px; overflow-y: auto;
          margin-bottom: 1rem;
          scrollbar-width: thin; scrollbar-color: #eee transparent;
        }
        .of-items-list::-webkit-scrollbar { width: 4px; }
        .of-items-list::-webkit-scrollbar-thumb { background: #e0dcd6; border-radius: 4px; }

        .of-item-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.6rem 0; border-bottom: 1px solid #f5f2ee; gap: 0.5rem;
        }
        .of-item-row:last-child { border-bottom: none; }
        .of-item-name { font-size: 0.88rem; color: #444; flex: 1; min-width: 0; }
        .of-item-qty {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 6px;
          background: #f0ede8; font-size: 0.72rem; font-weight: 700; color: #ff5c35;
          flex-shrink: 0; margin-right: 0.35rem;
        }
        .of-item-price { font-size: 0.88rem; font-weight: 600; color: #1a1a2e; flex-shrink: 0; }

        .of-totals { border-top: 2px dashed #f0ede8; padding-top: 1rem; }
        .of-total-row {
          display: flex; justify-content: space-between;
          font-size: 0.88rem; color: #777; padding: 0.3rem 0;
        }
        .of-total-final {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-top: 0.75rem; padding-top: 0.75rem;
          border-top: 2px solid #1a1a2e;
        }
        .of-total-final-label {
          font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 800; color: #1a1a2e;
        }
        .of-total-final-amount {
          font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: #ff5c35;
        }

        .of-trust-badges {
          display: flex; gap: 0.5rem; margin-top: 1.25rem; flex-wrap: wrap;
        }
        .of-badge {
          flex: 1; min-width: 70px;
          background: #f7f4ef; border-radius: 10px;
          padding: 0.55rem 0.4rem; text-align: center;
          font-size: 0.7rem; color: #888; font-weight: 500;
        }
        .of-badge-icon { font-size: 1.1rem; display: block; margin-bottom: 2px; }
      `}</style>

      <div className="of-page">
        <div className="of-container">

          <div className="of-header">
            <div className="of-header-label">🛍️ Checkout</div>
            <h1 className="of-title">Complete Your <span>Order</span></h1>
          </div>

          <div className="of-grid">

            {/* LEFT: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Customer Info */}
              <div className="of-card">
                <div className="of-section-title">
                  <div className="of-section-icon">👤</div>
                  Customer Information
                </div>
                <div className="of-fields">
                  {[
                    { name: 'customerName', label: 'Full Name', type: 'input', inputType: 'text', placeholder: 'John Doe', req: true },
                    { name: 'customerPhone', label: 'Phone Number', type: 'input', inputType: 'tel', placeholder: '+880 1700 000000', req: true },
                  ].map(({ name, label,  inputType, placeholder, req }) => (
                    <div className="of-field" key={name}>
                      <label>{label}{req && <span className="req">*</span>}</label>
                      <input
                        type={inputType}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className={`of-input${errors[name] ? ' error' : ''}`}
                        placeholder={placeholder}
                      />
                      {errors[name] && <div className="of-error-msg">⚠ {errors[name]}</div>}
                    </div>
                  ))}
                  <div className="of-field">
                    <label>Delivery Address<span className="req">*</span></label>
                    <textarea
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleChange}
                      className={`of-textarea${errors.customerAddress ? ' error' : ''}`}
                      placeholder="House 12, Road 4, Block B, Narsingdi..."
                      rows="3"
                    />
                    {errors.customerAddress && <div className="of-error-msg">⚠ {errors.customerAddress}</div>}
                  </div>
                  <div className="of-field">
                    <label>Special Instructions <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                    <textarea
                      name="specialNotes"
                      value={formData.specialNotes}
                      onChange={handleChange}
                      className="of-textarea"
                      placeholder="Ring bell twice, leave at door..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="of-card">
                <div className="of-section-title">
                  <div className="of-section-icon">💳</div>
                  Payment Method
                </div>
                <div className="of-payment-options">
                  {paymentOptions.map(({ value, label, icon, desc }) => (
                    <label
                      key={value}
                      className={`of-payment-option${formData.paymentMethod === value ? ' active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={formData.paymentMethod === value}
                        onChange={handleChange}
                      />
                      <div className="of-pay-icon">{icon}</div>
                      <div className="of-pay-info">
                        <div className="of-pay-label">{label}</div>
                        <div className="of-pay-desc">{desc}</div>
                      </div>
                      <div className="of-pay-check"><div className="of-pay-dot" /></div>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="of-submit"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <><div className="of-spinner" /> Placing Order…</>
                  ) : (
                    <>🚀 Place Order — ${totals.total.toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT: Summary */}
            <div className="of-summary">
              <div className="of-card">
                <div className="of-section-title">
                  <div className="of-section-icon">🧾</div>
                  Order Summary
                </div>

                <div className="of-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="of-item-row">
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <span className="of-item-qty">{item.quantity}×</span>
                        <span className="of-item-name">{item.name}</span>
                      </div>
                      <span className="of-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="of-totals">
                  {[
                    { label: 'Subtotal', value: totals.subtotal },
                    { label: 'Tax (10%)', value: totals.tax },
                    { label: 'Delivery Fee', value: totals.deliveryFee },
                  ].map(({ label, value }) => (
                    <div className="of-total-row" key={label}>
                      <span>{label}</span>
                      <span>${value.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="of-total-final">
                    <span className="of-total-final-label">Total</span>
                    <span className="of-total-final-amount">${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="of-trust-badges">
                  {[['🔒','Secure'], ['⚡','Fast'], ['✅','Verified'], ['💬','Support']].map(([icon, label]) => (
                    <div className="of-badge" key={label}>
                      <span className="of-badge-icon">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OrderForm;