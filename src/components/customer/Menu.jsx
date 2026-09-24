import { useState } from 'react';
import { categories, menuItems } from '../../utils/menuData';

const Menu = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <main className="menu-root">
      <section className="menu-hero">
        <div className="menu-hero__inner">
          <div className="menu-eyebrow"><span aria-hidden="true">✦</span> Fresh from the kitchen</div>
          <h1 className="menu-title">Good food, <em>good mood.</em></h1>
          <p className="menu-subtitle">Order your favourites and follow every step from our kitchen to your door.</p>
          <div className="menu-metrics" aria-label="Restaurant highlights">
            <div className="menu-metric"><strong>{menuItems.length}+</strong><span>Signature dishes</span></div>
            <div className="menu-metric"><strong>15 min</strong><span>Average delivery</span></div>
            <div className="menu-metric"><strong>4.9 / 5</strong><span>Customer rating</span></div>
          </div>
        </div>
      </section>

      <div className="filter-bar-wrap">
        <div className="filter-bar" role="tablist" aria-label="Filter menu by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category}
              className={`filter-btn${selectedCategory === category ? ' active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="menu-section" aria-labelledby="menu-heading">
        <div className="section-header">
          <h2 id="menu-heading" className="section-title">{selectedCategory === 'All' ? 'The menu' : selectedCategory}</h2>
          <span className="section-count">{filteredItems.length} items</span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="card">
                <div className="card-img">
                  <span className="card-emoji" aria-hidden="true">{item.image}</span>
                  <span className="card-category-chip">{item.category}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-name">{item.name}</h3>
                  <p className="card-desc">{item.description}</p>
                  <div className="card-footer">
                    <span className="card-price">${item.price.toFixed(2)}</span>
                    <button type="button" className="add-btn" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name} to cart`}>
                      <span aria-hidden="true">+</span> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-emoji" aria-hidden="true">🍽️</span>
            <p className="empty-title">Nothing here yet</p>
            <p className="empty-sub">Try another category.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Menu;