import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import ConnectionStatus from './ConnectionStatus';

const Header = ({ cartCount = 0, showCart = true, showAdmin = true, connected }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header style={{
      background: '#0f1117',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#f5a623',
            boxShadow: '0 0 0 4px rgba(245,166,35,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 19, flexShrink: 0,
          }}>🍕</div>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: '#f0ece4', margin: 0, letterSpacing: -0.2 }}>FoodTrack</h1>
            <p style={{ fontSize: 10.5, color: 'rgba(240,236,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, fontWeight: 300 }}>Live order tracking</p>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ConnectionStatus connected={connected} />

            <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.08)' }} />

            <Link to="/orders" style={pillStyle}>
              <i className="ti ti-receipt-2" aria-hidden="true" style={{ fontSize: 15, color: 'rgba(240,236,228,0.5)' }} />
              My orders
            </Link>

            {showAdmin && (
              <Link to="/admin" style={adminStyle}>
                <i className="ti ti-layout-dashboard" aria-hidden="true" style={{ fontSize: 14 }} />
                Admin
              </Link>
            )}
          </nav>

          {/* Cart */}
          {showCart && (
            <button onClick={() => navigate('/cart')} style={{ position: 'relative', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <i className="ti ti-shopping-bag" aria-hidden="true" style={{ fontSize: 17, color: '#f0ece4' }} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: '#f5a623', color: '#0f1117', fontSize: 10, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0ece4', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <i className={`ti ${isMenuOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div style={{ background: '#1a1d27', borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 4, borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.5)' }}>Connection status</span>
            <ConnectionStatus connected={connected} />
          </div>
          {[
            { to: '/', label: 'Home', icon: 'ti-home' },
            { to: '/orders', label: 'My orders', icon: 'ti-receipt-2' },
            ...(showAdmin ? [{ to: '/admin', label: 'Admin dashboard', icon: 'ti-layout-dashboard', amber: true }] : []),
          ].map(({ to, label, icon, amber }) => (
            <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, color: amber ? '#f5a623' : '#f0ece4', fontSize: 14, textDecoration: 'none', border: '0.5px solid transparent' }}>
              <i className={`ti ${icon}`} style={{ fontSize: 17, color: amber ? '#f5a623' : 'rgba(240,236,228,0.5)' }} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

const pillStyle = {
  display: 'flex', alignItems: 'center', gap: 7,
  padding: '7px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: 999,
  color: '#f0ece4',
  fontSize: 13.5,
  fontWeight: 400,
  textDecoration: 'none',
  transition: 'background 0.2s',
};

const adminStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '7px 16px',
  background: 'rgba(245,166,35,0.12)',
  border: '0.5px solid rgba(245,166,35,0.25)',
  borderRadius: 999,
  color: '#f5a623',
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
};

export default Header;