import { useState } from "react";

type HeaderProps = {
  currentPage: "home" | "products" | "cart" | "checkout" | "support" | "admin";
  cartCount: number;
  customerName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: "home" | "products" | "cart" | "checkout" | "support" | "admin") => void;
  onOpenAccount: () => void;
};

export function Header({ currentPage, cartCount, customerName, searchQuery, onSearchChange, onNavigate, onOpenAccount }: HeaderProps) {
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const shouldShowSearch = currentPage !== "checkout" && currentPage !== "admin";
  const headerCategories = ["Home", "Products", "Categories", "New In", "Sale", "Audio", "Wearables", "Earbuds", "Smart Watch", "Accessories", "Best Sellers", "Hot Deals"];
  const searchSuggestions = [
    "Electronics",
    "Earphones",
    "Earbuds",
    "Wireless pods",
    "Smart Watch",
    "Wearables",
    "Audio gadgets",
  ].filter((suggestion) => suggestion.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  const visibleSuggestions = isSearchMenuOpen && searchQuery.trim() ? searchSuggestions.slice(0, 5) : [];
  const openCategory = (category: string) => {
    if (category === "Home") {
      onNavigate("home");
      return;
    }

    if (category === "Products" || category === "Categories") {
      onSearchChange("");
    } else {
      onSearchChange(category);
    }

    onNavigate("products");
  };

  return (
    <header className="site-header">
      <div className="header-main">
        <div className="brand-lockup" aria-label="Vinex Nepal">
          <img className="brand-symbol-mark" src="/images/brand/vinex-logo-mark.png" alt="" />
          <div className="brand-block">
            <h1>
              <span>Vinex</span>
              <strong>Nepal</strong>
            </h1>
            <div className="brand-slogan">Elevate your world</div>
          </div>
        </div>

        {shouldShowSearch ? (
          <div className="header-search-field">
            <span id="header-search-label">Search Products</span>
            <input
              value={searchQuery}
              aria-labelledby="header-search-label"
              onChange={(event) => {
                setIsSearchMenuOpen(true);
                onSearchChange(event.target.value);
                if (currentPage !== "products" && event.target.value.trim()) {
                  onNavigate("products");
                }
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsSearchMenuOpen(true);
                }
              }}
              placeholder="Search in Vinex Nepal"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setIsSearchMenuOpen(false);
                  if (currentPage !== "products") {
                    onNavigate("products");
                  }
                }}
                aria-label="Search products"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m21 21-4.3-4.3" />
                  <circle cx="11" cy="11" r="7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate("products")}
                aria-label="Search products"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m21 21-4.3-4.3" />
                  <circle cx="11" cy="11" r="7" />
                </svg>
              </button>
            )}
            {visibleSuggestions.length > 0 ? (
              <div className="header-search-suggestions">
                {visibleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setIsSearchMenuOpen(false);
                      onSearchChange(suggestion);
                      if (currentPage !== "products") {
                        onNavigate("products");
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="header-action-icons" aria-label="Quick actions">
          <button className="mobile-header-search-button" type="button" onClick={() => onNavigate("products")} aria-label="Search products">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.3-4.3" />
              <circle cx="11" cy="11" r="7" />
            </svg>
          </button>
          <button className="account-icon-button" type="button" onClick={onOpenAccount} aria-label={customerName ? `Account for ${customerName}` : "Sign in or create account"}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
            {customerName ? <span>{customerName.slice(0, 1).toUpperCase()}</span> : null}
          </button>
          <button type="button" onClick={() => onNavigate("products")} aria-label="Favorites">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 1 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z" />
            </svg>
          </button>
        </div>

        <button
          className={currentPage === "cart" ? "cart-icon-button active" : "cart-icon-button"}
          onClick={() => onNavigate("cart")}
          aria-label={`Open cart${cartCount > 0 ? ` with ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.2 19.7a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm10.1 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM4.1 4.3h2l1.8 8.9a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 1.9-1.4l1.4-4.8H8.1" />
          </svg>
          {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
        </button>
      </div>

      <nav className="header-category-bar" aria-label="Shop categories">
        {headerCategories.map((category) => (
          <button
            className={
              (category === "Home" && currentPage === "home") ||
              ((category === "Products" || category === "Categories") && currentPage === "products")
                ? "active"
                : ""
            }
            key={category}
            type="button"
            onClick={() => openCategory(category)}
          >
            {category}
            {category === "Categories" ? <span aria-hidden="true">v</span> : null}
          </button>
        ))}
      </nav>

    </header>
  );
}
