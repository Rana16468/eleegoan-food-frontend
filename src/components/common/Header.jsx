import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { House, LayoutDashboard, Menu, Pizza, ReceiptText, ShoppingBag, X } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import ThemeToggle from './ThemeToggle';

const Header = ({ cartCount = 0, showCart = true, showAdmin = true, connected, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand__mark" aria-hidden="true"><Pizza size={20} strokeWidth={2.3} /></span>
          <span>
            <span className="brand__name">FoodTrack</span>
            <span className="brand__tagline">Live order tracking</span>
          </span>
        </Link>

        <div className="site-header__actions">
          <nav className="desktop-nav" aria-label="Primary navigation">
            <ConnectionStatus connected={connected} />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <Link to="/orders" className="nav-link">
              <ReceiptText size={16} strokeWidth={2} aria-hidden="true" /> My orders
            </Link>
            {showAdmin && <Link to="/admin" className="admin-link"><LayoutDashboard size={15} strokeWidth={2} aria-hidden="true" /> Admin</Link>}
          </nav>

          {showCart && (
            <button className="cart-button" onClick={() => navigate('/cart')} aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ''}`}>
              <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
              {cartCount > 0 && <span className="cart-count" aria-label={`${cartCount} items in cart`}>{cartCount}</span>}
            </button>
          )}

          <span className="mobile-theme"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></span>

          <button className="menu-toggle" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
            {isMenuOpen ? <X size={19} strokeWidth={2.2} aria-hidden="true" /> : <Menu size={19} strokeWidth={2.2} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <div className="mobile-nav__status"><span>Live connection</span><ConnectionStatus connected={connected} /></div>
          <Link to="/" className="mobile-nav__link" onClick={closeMenu}><House size={17} strokeWidth={2} aria-hidden="true" /> Home</Link>
          <Link to="/orders" className="mobile-nav__link" onClick={closeMenu}><ReceiptText size={17} strokeWidth={2} aria-hidden="true" /> My orders</Link>
          {showAdmin && <Link to="/admin" className="mobile-nav__link" onClick={closeMenu}><LayoutDashboard size={17} strokeWidth={2} aria-hidden="true" /> Admin dashboard</Link>}
        </nav>
      )}
    </header>
  );
};

export default Header;