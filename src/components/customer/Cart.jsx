import { useNavigate } from "react-router";

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const deliveryFee = 5.0;
  const total = subtotal + tax + deliveryFee;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .cart-root {
      --cream: #faf7f2;
      --warm-white: #fff9f4;
      --amber: #d97706;
      --amber-light: #fbbf24;
      --amber-dark: #92400e;
      --terracotta: #c2440a;
      --terracotta-light: #ea5e28;
      --brown: #3b1a08;
      --brown-mid: #6b3a1f;
      --brown-light: #9a6040;
      --sand: #e8d5bc;
      --sand-light: #f5ece0;
      --muted: #a08060;
      font-family: 'DM Sans', sans-serif;
      background: var(--cream);
      min-height: 100vh;
      width: 100%;
    }

    /* ── Wrapper ── */
    .cart-wrapper {
      max-width: 1040px;
      margin: 0 auto;
      padding: 32px 14px 100px;
    }
    @media (min-width: 480px)  { .cart-wrapper { padding: 40px 20px 100px; } }
    @media (min-width: 768px)  { .cart-wrapper { padding: 48px 28px 80px; } }
    @media (min-width: 1024px) { .cart-wrapper { padding: 56px 32px 80px; } }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 60px 16px; }
    .empty-emoji {
      font-size: 60px;
      display: block;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    @media (min-width: 480px) { .empty-emoji { font-size: 80px; } }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-12px); }
    }
    .empty-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: var(--brown);
      margin-bottom: 10px;
    }
    @media (min-width: 480px) { .empty-title { font-size: 36px; } }
    .empty-sub { color: var(--muted); font-size: 15px; margin-bottom: 32px; }
    .btn-primary {
      background: var(--terracotta);
      color: #fff;
      border: none;
      padding: 13px 30px;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover { background: var(--terracotta-light); transform: translateY(-2px); }

    /* ── Page header ── */
    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--sand);
      padding-bottom: 16px;
    }
    .cart-title {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      color: var(--brown);
      font-weight: 700;
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    @media (min-width: 480px) { .cart-title { font-size: 32px; } }
    @media (min-width: 768px) { .cart-title { font-size: 40px; } }

    .item-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--terracotta);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .clear-btn {
      background: none;
      border: 1.5px solid var(--sand);
      color: var(--brown-light);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      padding: 7px 14px;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .clear-btn:hover { border-color: var(--terracotta); color: var(--terracotta); background: #fff0eb; }

    /* ── Main grid ── */
    .cart-grid {
      display: grid;
      grid-template-columns: 1fr;   /* mobile: stacked */
      gap: 20px;
      align-items: start;
    }
    @media (min-width: 860px) {
      .cart-grid { grid-template-columns: 1fr 290px; gap: 28px; }
    }
    @media (min-width: 1024px) {
      .cart-grid { grid-template-columns: 1fr 320px; gap: 32px; }
    }

    /* ── Item list ── */
    .item-list { display: flex; flex-direction: column; gap: 12px; }
    @media (min-width: 480px) { .item-list { gap: 14px; } }

    /* ── Item card ── */
    .item-card {
      background: var(--warm-white);
      border: 1.5px solid var(--sand);
      border-radius: 16px;
      padding: 12px;
      /* Mobile layout: 2-column top row (image | details), full-width bottom row (controls) */
      display: grid;
      grid-template-areas:
        "img  details"
        "ctrl ctrl";
      grid-template-columns: 64px 1fr;
      gap: 10px 12px;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.25s, transform 0.2s;
    }
    @media (min-width: 480px) {
      .item-card {
        padding: 16px;
        /* sm: image | details | controls all in one row */
        grid-template-areas: "img details ctrl";
        grid-template-columns: 80px 1fr auto;
        grid-template-rows: 1fr;
        align-items: center;
        gap: 14px;
      }
    }
    @media (min-width: 768px) {
      .item-card { padding: 18px 20px; gap: 16px; }
    }

    .item-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, var(--amber-light), var(--terracotta));
      border-radius: 4px 0 0 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .item-card:hover { box-shadow: 0 6px 28px rgba(59,26,8,0.10); transform: translateY(-2px); }
    .item-card:hover::before { opacity: 1; }

    /* Image */
    .item-img {
      grid-area: img;
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--sand-light), var(--sand));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }
    @media (min-width: 480px) {
      .item-img { width: 80px; height: 80px; font-size: 34px; border-radius: 14px; }
    }

    /* Details */
    .item-details {
      grid-area: details;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .item-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--brown);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (min-width: 480px) { .item-name { font-size: 17px; } }
    @media (min-width: 768px) { .item-name { font-size: 18px; } }
    .item-desc {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (min-width: 480px) { .item-desc { font-size: 13px; } }
    .item-price {
      font-size: 13px;
      font-weight: 600;
      color: var(--amber-dark);
      margin-top: 5px;
    }
    @media (min-width: 480px) { .item-price { font-size: 14px; } }

    /* Controls */
    .item-controls {
      grid-area: ctrl;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Mobile: spread across full row */
    @media (max-width: 479px) {
      .item-controls { justify-content: space-between; }
    }
    /* sm+: column stack aligned to end */
    @media (min-width: 480px) {
      .item-controls {
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        gap: 8px;
      }
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--sand);
      font-size: 20px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .remove-btn:hover { background: #ffe4d6; color: var(--terracotta); }

    .qty-control {
      display: flex;
      align-items: center;
      background: var(--sand-light);
      border: 1.5px solid var(--sand);
      border-radius: 50px;
      overflow: hidden;
    }
    .qty-btn {
      background: none;
      border: none;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 17px;
      color: var(--brown-mid);
      font-weight: 600;
      transition: background 0.15s, color 0.15s;
    }
    @media (min-width: 480px) { .qty-btn { width: 34px; height: 34px; } }
    .qty-btn:hover { background: var(--amber-light); color: var(--brown); }
    .qty-display {
      font-weight: 700;
      font-size: 14px;
      color: var(--brown);
      min-width: 26px;
      text-align: center;
    }
    @media (min-width: 480px) { .qty-display { font-size: 15px; min-width: 30px; } }

    .item-total {
      font-size: 15px;
      font-weight: 700;
      color: var(--brown);
      white-space: nowrap;
    }
    @media (min-width: 480px) { .item-total { font-size: 17px; } }

    /* ── Order summary card ── */
    .summary-card {
      background: var(--brown);
      border-radius: 20px;
      padding: 22px 18px;
      color: #fff;
    }
    @media (min-width: 480px) { .summary-card { padding: 26px 22px; border-radius: 22px; } }
    @media (min-width: 860px) {
      .summary-card { position: sticky; top: 24px; padding: 30px 26px; border-radius: 24px; }
    }

    .summary-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--amber-light);
      margin-bottom: 18px;
    }
    @media (min-width: 480px) { .summary-title { font-size: 22px; margin-bottom: 22px; } }
    @media (min-width: 860px) { .summary-title { font-size: 24px; margin-bottom: 26px; } }

    .summary-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    @media (min-width: 860px) { .summary-rows { gap: 14px; margin-bottom: 20px; } }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: rgba(255,255,255,0.65);
    }
    @media (min-width: 480px) { .summary-row { font-size: 14px; } }
    .summary-row span:last-child { color: rgba(255,255,255,0.88); font-weight: 500; }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.18);
      margin-bottom: 20px;
    }
    @media (min-width: 860px) { .summary-total { padding-top: 16px; margin-bottom: 26px; } }

    .summary-total-label {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #fff;
    }
    @media (min-width: 480px) { .summary-total-label { font-size: 20px; } }

    .summary-total-amount {
      font-size: 22px;
      font-weight: 700;
      color: var(--amber-light);
    }
    @media (min-width: 480px) { .summary-total-amount { font-size: 26px; } }

    .checkout-btn {
      width: 100%;
      background: linear-gradient(135deg, var(--amber-light), var(--terracotta-light));
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 4px 20px rgba(234,94,40,0.35);
    }
    @media (min-width: 480px) { .checkout-btn { font-size: 16px; padding: 15px; } }
    .checkout-btn:hover  { opacity: 0.9; transform: translateY(-2px); }
    .checkout-btn:active { transform: scale(0.98); }

    .continue-btn {
      width: 100%;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      border: 1.5px solid rgba(255,255,255,0.15);
      padding: 12px;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
      transition: background 0.2s, color 0.2s;
    }
    .continue-btn:hover { background: rgba(255,255,255,0.14); color: rgba(255,255,255,0.85); }

    /* ── Sticky checkout bar — mobile only ── */
    .mobile-bar {
      display: none;
    }
    @media (max-width: 859px) {
      .mobile-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        background: var(--brown);
        padding: 13px 18px;
        padding-bottom: calc(13px + env(safe-area-inset-bottom));
        box-shadow: 0 -4px 24px rgba(59,26,8,0.2);
        z-index: 200;
      }
      .mobile-bar-total-label { font-size: 11px; color: rgba(255,255,255,0.5); }
      .mobile-bar-total       { font-size: 20px; font-weight: 700; color: var(--amber-light); font-family: 'Playfair Display', serif; }
      .mobile-bar-btn {
        background: linear-gradient(135deg, var(--amber-light), var(--terracotta-light));
        color: #fff;
        border: none;
        padding: 12px 22px;
        border-radius: 50px;
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(234,94,40,0.35);
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      .mobile-bar-btn:hover { opacity: 0.9; }
      /* hide the summary card's buttons on mobile; sticky bar handles checkout */
      .summary-checkout-area { display: none; }
    }
  `;

  if (cart.length === 0) {
    return (
      <div className="cart-root">
        <style>{styles}</style>
        <div className="cart-wrapper">
          <div className="empty-state">
            <span className="empty-emoji">🛒</span>
            <h2 className="empty-title">Your Cart is Empty</h2>
            <p className="empty-sub">Add some delicious items to get started!</p>
            <button className="btn-primary" onClick={() => navigate("/")}>Browse Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-root">
      <style>{styles}</style>

      <div className="cart-wrapper">

        {/* ── Header ── */}
        <div className="cart-header">
          <h1 className="cart-title">
            Your Cart
            <span className="item-count-badge">{cart.length}</span>
          </h1>
          <button className="clear-btn" onClick={onClearCart}>Clear all</button>
        </div>

        <div className="cart-grid">

          {/* ── Item list ── */}
          <div className="item-list">
            {cart.map((item) => (
              <div className="item-card" key={item.id}>

                <div className="item-img">
                  <span>{item.image}</span>
                </div>

                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.description}</div>
                  <div className="item-price">${item.price.toFixed(2)} each</div>
                </div>

                <div className="item-controls">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span className="qty-display">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  <button className="remove-btn" onClick={() => onRemoveItem(item.id)} title="Remove">×</button>
                </div>

              </div>
            ))}
          </div>

          {/* ── Order summary ── */}
          <div className="summary-card">
            <div className="summary-title">Order Summary</div>

            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="summary-row"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
            </div>

            <div className="summary-total">
              <span className="summary-total-label">Total</span>
              <span className="summary-total-amount">${total.toFixed(2)}</span>
            </div>

            {/* Hidden on mobile — sticky bar takes over */}
            <div className="summary-checkout-area">
              <button className="checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout →</button>
              <button className="continue-btn" onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky bottom bar (mobile & tablet only) ── */}
      <div className="mobile-bar">
        <div>
          <div className="mobile-bar-total-label">Total</div>
          <div className="mobile-bar-total">${total.toFixed(2)}</div>
        </div>
        <button className="mobile-bar-btn" onClick={() => navigate("/checkout")}>
          Checkout →
        </button>
      </div>

    </div>
  );
};

export default Cart;