import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

/* ─── Design tokens ─────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:        #0d0f14;
    --surface:   #161920;
    --card:      #1c2028;
    --border:    #2a2f3d;
    --accent:    #f97316;
    --accent2:   #fb923c;
    --text:      #f1f5f9;
    --muted:     #64748b;
    --success:   #22c55e;
    --info:      #38bdf8;
    --warn:      #facc15;
    --danger:    #f87171;
    --purple:    #a78bfa;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .oh-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    padding: clamp(1rem, 4vw, 2.5rem);
  }

  /* ── Phone gate ──────────────────────────────────────────────── */
  .gate-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
  }
  .gate-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: clamp(2rem, 5vw, 3.5rem);
    width: min(480px, 100%);
    animation: slideUp .45s cubic-bezier(.16,1,.3,1) both;
  }
  .gate-icon {
    font-size: 3.5rem;
    margin-bottom: 1.25rem;
    display: block;
    filter: drop-shadow(0 0 18px var(--accent));
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .gate-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800;
    letter-spacing: -.02em;
    margin-bottom: .5rem;
  }
  .gate-sub { color: var(--muted); font-size: .95rem; margin-bottom: 2rem; }

  .field-label {
    display: block;
    font-size: .8rem;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: .5rem;
  }
  .field-input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-family: inherit;
    font-size: 1rem;
    padding: .85rem 1.1rem;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    margin-bottom: 1rem;
  }
  .field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(249,115,22,.18);
  }
  .field-input::placeholder { color: var(--muted); }

  .btn-primary {
    width: 100%;
    background: var(--accent);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    border-radius: 12px;
    padding: .9rem;
    cursor: pointer;
    transition: background .2s, transform .1s;
    margin-bottom: .75rem;
  }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    width: 100%;
    background: transparent;
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: .95rem;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: .85rem;
    cursor: pointer;
    transition: color .2s, border-color .2s;
  }
  .btn-ghost:hover { color: var(--text); border-color: var(--muted); }

  /* ── Loading ─────────────────────────────────────────────────── */
  .loader-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh; gap: 1rem;
  }
  .spinner {
    width: 52px; height: 52px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-text { color: var(--muted); font-size: 1.05rem; }

  /* ── Main layout ─────────────────────────────────────────────── */
  .oh-inner { max-width: 900px; margin: 0 auto; }

  .oh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .oh-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: 800;
    letter-spacing: -.03em;
  }
  .oh-title span { color: var(--accent); }

  .btn-change {
    background: var(--surface);
    border: 1.5px solid var(--border);
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: .85rem;
    border-radius: 10px;
    padding: .55rem 1.1rem;
    cursor: pointer;
    transition: color .2s, border-color .2s;
    white-space: nowrap;
  }
  .btn-change:hover { color: var(--text); border-color: var(--muted); }

  /* ── Filter tabs ─────────────────────────────────────────────── */
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
    margin-bottom: 1.75rem;
  }
  .filter-btn {
    background: var(--surface);
    border: 1.5px solid var(--border);
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: .85rem;
    border-radius: 99px;
    padding: .45rem 1.1rem;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
  }
  .filter-btn:hover { color: var(--text); border-color: var(--muted); }
  .filter-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  /* ── Empty state ─────────────────────────────────────────────── */
  .empty-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: clamp(2.5rem, 6vw, 4rem);
    text-align: center;
    animation: slideUp .4s ease both;
  }
  .empty-icon { font-size: 4rem; display: block; margin-bottom: 1.25rem; }
  .empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: .5rem;
  }
  .empty-sub { color: var(--muted); margin-bottom: 1.75rem; }
  .btn-cta {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: .95rem;
    border: none;
    border-radius: 12px;
    padding: .8rem 2rem;
    cursor: pointer;
    transition: background .2s, transform .1s;
  }
  .btn-cta:hover { background: var(--accent2); transform: translateY(-1px); }

  /* ── Order cards ─────────────────────────────────────────────── */
  .orders-list { display: flex; flex-direction: column; gap: 1rem; }

  .order-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: clamp(1.1rem, 3vw, 1.6rem);
    cursor: pointer;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: slideUp .35s ease both;
  }
  .order-card:hover {
    transform: translateY(-3px);
    border-color: var(--accent);
    box-shadow: 0 8px 32px rgba(249,115,22,.12);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .card-id-row {
    display: flex;
    align-items: center;
    gap: .65rem;
    flex-wrap: wrap;
    margin-bottom: .3rem;
  }
  .card-id {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: .02em;
  }
  .card-date { color: var(--muted); font-size: .85rem; }

  .card-amount {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.55rem;
    color: var(--accent);
    line-height: 1;
  }
  .card-qty { color: var(--muted); font-size: .8rem; text-align: right; margin-top: .2rem; }

  .card-items {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem;
    margin-bottom: .9rem;
    font-size: .88rem;
    color: var(--muted);
  }
  .item-chip {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: .25rem .65rem;
    display: flex;
    align-items: center;
    gap: .3rem;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: .85rem;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
    gap: .5rem;
  }
  .card-eta { color: var(--muted); font-size: .82rem; }
  .card-cta {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: .85rem;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: .3rem;
    transition: gap .2s;
  }
  .order-card:hover .card-cta { gap: .55rem; }

  /* ── Status badges ───────────────────────────────────────────── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    font-size: .75rem;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    letter-spacing: .04em;
    text-transform: uppercase;
    border-radius: 99px;
    padding: .28rem .75rem;
  }
  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-pending  { background: rgba(250,204,21,.12); color: var(--warn); }
  .badge-pending .badge-dot { background: var(--warn); }
  .badge-confirmed { background: rgba(56,189,248,.12); color: var(--info); }
  .badge-confirmed .badge-dot { background: var(--info); animation: blink 1s ease infinite; }
  .badge-preparing { background: rgba(249,115,22,.12); color: var(--accent); }
  .badge-preparing .badge-dot { background: var(--accent); animation: blink 1s ease infinite; }
  .badge-ready     { background: rgba(34,197,94,.12); color: var(--success); }
  .badge-ready .badge-dot { background: var(--success); }
  .badge-out_for_delivery { background: rgba(167,139,250,.12); color: var(--purple); }
  .badge-out_for_delivery .badge-dot { background: var(--purple); animation: blink 1s ease infinite; }
  .badge-delivered { background: rgba(34,197,94,.14); color: var(--success); }
  .badge-delivered .badge-dot { background: var(--success); }
  .badge-cancelled { background: rgba(248,113,113,.12); color: var(--danger); }
  .badge-cancelled .badge-dot { background: var(--danger); }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .card-top { flex-direction: column; gap: .5rem; }
    .card-amount { font-size: 1.25rem; }
    .card-qty { text-align: left; }
  }
`;

/* ─── Badge config ───────────────────────────────────────────────── */
const BADGE_META = {
  pending:          { cls: 'badge-pending',          label: 'Pending' },
  confirmed:        { cls: 'badge-confirmed',         label: 'Confirmed' },
  preparing:        { cls: 'badge-preparing',         label: 'Preparing' },
  ready:            { cls: 'badge-ready',             label: 'Ready' },
  out_for_delivery: { cls: 'badge-out_for_delivery',  label: 'On the Way' },
  delivered:        { cls: 'badge-delivered',         label: 'Delivered' },
  cancelled:        { cls: 'badge-cancelled',         label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const meta = BADGE_META[status] || BADGE_META.pending;
  return (
    <span className={`badge ${meta.cls}`}>
      <span className="badge-dot" />
      {meta.label}
    </span>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const ACTIVE = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/* ─── Component ──────────────────────────────────────────────────── */
const OrderHistory = ({ socket, onShowNotification }) => {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(false);          // ← start false
  const [filterStatus, setFilterStatus] = useState('all');
  const [customerPhone, setCustomerPhone] = useState(
    () => localStorage.getItem('customerPhone') || ''
  );
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const didFetch = useRef(false);                               // ← guard

  /* ── Auto-load if phone already saved ── */
  useEffect(() => {
    if (didFetch.current) return;
    const saved = localStorage.getItem('customerPhone');
    if (!saved) return;                                         // ← no setState here

    didFetch.current = true;
    setLoading(true);                                           // ← still inside effect but
    socket.emit('getMyOrders', { customerPhone: saved }, (res) => {
      // setState in async callback — safe ✓
      setLoading(false);
      if (res.success) {
        setOrders(res.orders);
        setShowPhoneInput(false);
      } else {
        onShowNotification('Failed to load orders', 'error');
      }
    });
  }, [socket, onShowNotification]);

  /* ── Manual load ── */
  const loadOrders = (phone) => {
    setLoading(true);
    socket.emit('getMyOrders', { customerPhone: phone }, (res) => {
      setLoading(false);
      if (res.success) {
        setOrders(res.orders);
        setShowPhoneInput(false);
        localStorage.setItem('customerPhone', phone);
      } else {
        onShowNotification('Failed to load orders', 'error');
      }
    });
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      onShowNotification('Please enter your phone number', 'error');
      return;
    }
    loadOrders(customerPhone);
  };

  /* ── Filtered orders ── */
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all')       return true;
    if (filterStatus === 'active')    return ACTIVE.includes(o.status);
    if (filterStatus === 'completed') return o.status === 'delivered';
    if (filterStatus === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const tabCounts = {
    all:       orders.length,
    active:    orders.filter(o => ACTIVE.includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{styles}</style>

      <div className="oh-root">
        {/* ── Phone gate ── */}
        {showPhoneInput && !loading && (
          <div className="gate-wrap">
            <div className="gate-card">
              <div className="text-center" style={{ marginBottom: '2rem' }}>
                <span className="gate-icon">📱</span>
                <h2 className="gate-title">Your Orders</h2>
                <p className="gate-sub">Enter your phone number to view your order history</p>
              </div>

              <form onSubmit={handlePhoneSubmit}>
                <label className="field-label">Phone Number</label>
                <input
                  type="tel"
                  className="field-input"
                  placeholder="+1 234 567 8900"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <button type="submit" className="btn-primary">View My Orders</button>
                <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
                  ← Back to Menu
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Loader ── */}
        {loading && (
          <div className="loader-wrap">
            <div className="spinner" />
            <p className="loader-text">Loading your orders…</p>
          </div>
        )}

        {/* ── Main view ── */}
        {!showPhoneInput && !loading && (
          <div className="oh-inner">
            {/* Header */}
            <div className="oh-header">
              <h1 className="oh-title">Order <span>History</span></h1>
              <button
                className="btn-change"
                onClick={() => {
                  localStorage.removeItem('customerPhone');
                  didFetch.current = false;
                  setShowPhoneInput(true);
                  setOrders([]);
                }}
              >
                ✦ Change Phone
              </button>
            </div>

            {/* Filter tabs */}
            <div className="filter-row">
              {[
                { key: 'all',       label: 'All' },
                { key: 'active',    label: 'Active' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-btn${filterStatus === key ? ' active' : ''}`}
                  onClick={() => setFilterStatus(key)}
                >
                  {label} · {tabCounts[key]}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 ? (
              <div className="empty-card">
                <span className="empty-icon">📦</span>
                <h3 className="empty-title">No Orders Found</h3>
                <p className="empty-sub">Nothing here yet — time to place your first order!</p>
                <button className="btn-cta" onClick={() => navigate('/')}>Browse Menu</button>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order, i) => (
                  <div
                    key={order.orderId}
                    className="order-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => navigate(`/track/${order.orderId}`)}
                  >
                    <div className="card-top">
                      <div>
                        <div className="card-id-row">
                          <span className="card-id">{order.orderId}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="card-date">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="card-amount">${order.totalAmount.toFixed(2)}</p>
                        <p className="card-qty">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="card-items">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="item-chip">
                          <span>{item.image}</span>
                          <span>{item.quantity}× {item.name}</span>
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="item-chip">+{order.items.length - 3} more</span>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="card-eta">
                        {order.estimatedTime && !['delivered', 'cancelled'].includes(order.status)
                          ? `⏱ Est. ${order.estimatedTime} min`
                          : ''}
                      </span>
                      <span className="card-cta">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;