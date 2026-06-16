type HeaderProps = {
  currentPage: "home" | "products" | "cart" | "checkout" | "support" | "admin";
  cartCount: number;
  customerName?: string;
  searchQuery: string;
  isPastHero?: boolean;
  isHidden?: boolean;
  onSearchChange: (query: string) => void;
  onNavigate: (page: "home" | "products" | "cart" | "checkout" | "support" | "admin") => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
};

export function Header({ currentPage, cartCount, isPastHero = false, isHidden = false, onSearchChange, onNavigate, onOpenShop, onOpenCart }: HeaderProps) {
  const openShop = () => {
    onSearchChange("");
    onOpenShop();
  };
  const headerClassName = [
    "site-header",
    currentPage === "home" ? "site-header-over-hero" : "",
    currentPage === "home" && isPastHero ? "site-header-scrolled" : "",
    isHidden ? "site-header-hidden" : "",
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClassName}>
      <div className="header-main">
        <button className="brand-lockup" type="button" onClick={() => onNavigate("home")} aria-label="Vinex Nepal home">
          <div className="brand-block">
            <h1>
              <span>Vinex</span>
              <strong>Nepal</strong>
            </h1>
          </div>
        </button>

        <nav className="header-minimal-nav" aria-label="Primary navigation">
          <button className={currentPage === "products" ? "active" : ""} type="button" onClick={openShop}>
            Shop Now
          </button>
          <button
            className={currentPage === "cart" ? "active" : ""}
            type="button"
            onClick={onOpenCart}
            aria-label={`Open cart${cartCount > 0 ? ` with ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
          >
            Cart{cartCount > 0 ? <span>{cartCount}</span> : null}
          </button>
        </nav>
      </div>
    </header>
  );
}
