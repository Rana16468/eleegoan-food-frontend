import { useState } from "react";
import { menuItems, categories } from "../../utils/menuData";

const Menu = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .menu-root {
          font-family: 'DM Sans', sans-serif;
          background: #faf8f4;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          background: #1c1208;
          overflow: hidden;
          padding: clamp(3rem, 8vw, 6rem) 1.5rem clamp(2.5rem, 6vw, 5rem);
          text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 50%, rgba(210,110,30,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 80% 40%, rgba(180,80,20,0.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(210,130,40,0.18);
          border: 1px solid rgba(210,130,40,0.35);
          color: #f0a84a;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 7vw, 5rem);
          font-weight: 900;
          color: #fdf6ec;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
        }
        .hero-title span {
          color: #e8853a;
        }
        .hero-sub {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem);
          color: rgba(253,246,236,0.6);
          font-weight: 300;
          max-width: 460px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: clamp(1.5rem, 5vw, 3.5rem);
          flex-wrap: wrap;
        }
        .hero-stat {
          text-align: center;
        }
        .hero-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.4rem, 3vw, 1.8rem);
          font-weight: 700;
          color: #e8853a;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 11px;
          color: rgba(253,246,236,0.45);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        /* ── Category Filters ── */
        .filter-bar-wrap {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250,248,244,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          padding: 0.85rem 1.5rem;
        }
        .filter-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          max-width: 1300px;
          margin: 0 auto;
          padding-bottom: 2px;
        }
        .filter-bar::-webkit-scrollbar { display: none; }
        .filter-btn {
          flex-shrink: 0;
          padding: 8px 20px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .filter-btn.active {
          background: #1c1208;
          color: #fdf6ec;
          border-color: #1c1208;
        }
        .filter-btn.inactive {
          background: white;
          color: #5a4a38;
          border-color: rgba(0,0,0,0.1);
        }
        .filter-btn.inactive:hover {
          border-color: #e8853a;
          color: #e8853a;
          background: #fff8f2;
        }

        /* ── Grid ── */
        .menu-section {
          max-width: 1300px;
          margin: 0 auto;
          padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem);
        }
        .section-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 3vw, 1.75rem);
          font-weight: 700;
          color: #1c1208;
          margin: 0;
        }
        .section-count {
          font-size: 13px;
          color: #a08060;
          font-weight: 400;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr));
          gap: clamp(14px, 2.5vw, 24px);
        }

        /* ── Card ── */
        .card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }
        .card-img {
          height: clamp(130px, 22vw, 175px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #fff8f0 0%, #fdebd5 100%);
        }
        .card-emoji {
          font-size: clamp(3.5rem, 8vw, 5rem);
          line-height: 1;
          position: relative;
          z-index: 1;
          transition: transform 0.25s ease;
        }
        .card:hover .card-emoji {
          transform: scale(1.12) rotate(-4deg);
        }
        .card-category-chip {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(28,18,8,0.75);
          color: #f0d8b8;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          backdrop-filter: blur(6px);
        }
        .card-body {
          padding: clamp(0.9rem, 2.5vw, 1.25rem);
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 6px;
        }
        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1rem, 2.5vw, 1.15rem);
          font-weight: 700;
          color: #1c1208;
          margin: 0;
          line-height: 1.3;
        }
        .card-desc {
          font-size: 12.5px;
          color: #8a7060;
          line-height: 1.55;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          gap: 10px;
        }
        .card-price {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.2rem, 3vw, 1.45rem);
          font-weight: 700;
          color: #c4601e;
        }
        .add-btn {
          background: #1c1208;
          color: #fdf6ec;
          border: none;
          border-radius: 10px;
          padding: 9px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .add-btn:hover {
          background: #e8853a;
          transform: scale(1.04);
        }
        .add-btn:active {
          transform: scale(0.97);
        }
        .add-btn-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
        }
        .empty-emoji {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 1rem;
        }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1c1208;
          margin: 0 0 0.4rem;
        }
        .empty-sub {
          font-size: 14px;
          color: #a08060;
        }

        /* ── Responsive tweaks ── */
        @media (max-width: 480px) {
          .hero-stats { gap: 1.5rem; }
          .card-footer { flex-direction: column; align-items: stretch; }
          .card-footer .card-price { text-align: center; }
          .add-btn { justify-content: center; }
        }
        @media (min-width: 768px) {
          .menu-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }
        @media (min-width: 1200px) {
          .menu-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      <div className="menu-root">
        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-badge">🍽️ Live Menu</div>
          <h1 className="hero-title">
            Welcome to <span>FoodTrack</span>
          </h1>
          <p className="hero-sub">
            Order your favourite dishes and track every step — from kitchen to your door.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{menuItems.length}+</div>
              <div className="hero-stat-label">Dishes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">15'</div>
              <div className="hero-stat-label">Avg delivery</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">4.9★</div>
              <div className="hero-stat-label">Rating</div>
            </div>
          </div>
        </div>

        {/* ── Sticky Category Filter ── */}
        <div className="filter-bar-wrap">
          <div className="filter-bar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`filter-btn ${selectedCategory === category ? "active" : "inactive"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* ── Menu Grid ── */}
        <div className="menu-section">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory === "All" ? "All Dishes" : selectedCategory}
            </h2>
            <span className="section-count">{filteredItems.length} items</span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="card">
                  <div className="card-img">
                    <span className="card-emoji">{item.image}</span>
                    <span className="card-category-chip">{item.category}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-name">{item.name}</h3>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-footer">
                      <span className="card-price">${item.price.toFixed(2)}</span>
                      <button
                        className="add-btn"
                        onClick={() => onAddToCart(item)}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <span className="add-btn-icon">+</span> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-emoji">🍽️</span>
              <p className="empty-title">Nothing here yet</p>
              <p className="empty-sub">Try selecting a different category above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;