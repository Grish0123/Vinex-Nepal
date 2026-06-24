import { useEffect, useState } from "react";

type HeaderProps = {
  currentPage: "home" | "about" | "products" | "cart" | "checkout" | "support" | "seller" | "admin";
  cartCount: number;
  customerName?: string;
  searchQuery: string;
  isPastHero?: boolean;
  isHidden?: boolean;
  onSearchChange: (query: string) => void;
  onNavigate: (page: "home" | "about" | "products" | "cart" | "checkout" | "support" | "seller" | "admin") => void;
  onOpenAbout: () => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
};

export function Header({ currentPage, cartCount, isPastHero = false, isHidden = false, onSearchChange, onNavigate, onOpenAbout, onOpenShop, onOpenCart }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuPreview, setActiveMenuPreview] = useState("/images/Herosection.png");

  const openShop = () => {
    onSearchChange("");
    onOpenShop();
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openMenuShop = () => {
    closeMenu();
    openShop();
  };

  const navigateFromMenu = (page: "home" | "support" | "seller" | "admin") => {
    closeMenu();
    onNavigate(page);
  };

  const openAbout = () => {
    closeMenu();
    onOpenAbout();
  };

  const headerClassName = [
    "site-header",
    currentPage === "home" || currentPage === "support" || currentPage === "seller" || currentPage === "admin" ? "site-header-over-hero" : "",
    currentPage === "support" || currentPage === "seller" ? "site-header-contact" : "",
    (currentPage === "home" || currentPage === "support" || currentPage === "seller") && isPastHero ? "site-header-scrolled" : "",
    isHidden ? "site-header-hidden" : "",
    isMenuOpen ? "site-header-menu-open" : "",
  ].filter(Boolean).join(" ");
  const menuItems = [
    {
      label: "Home",
      preview: "/images/Herosection.png",
      onClick: () => navigateFromMenu("home"),
    },
    {
      label: "About",
      preview: "/images/About Us Images/1st image.png",
      onClick: openAbout,
    },
    {
      label: "Shop",
      preview: "/images/shopnow.png",
      onClick: openMenuShop,
    },
    {
      label: "Contact",
      preview: "/images/Gallery Images/1st.png",
      onClick: () => navigateFromMenu("support"),
    },
    {
      label: "Become a seller",
      preview: "/images/shopnow.png",
      onClick: () => navigateFromMenu("seller"),
    },
    {
      label: "Admin login",
      preview: "/images/Login.png",
      onClick: () => navigateFromMenu("admin"),
    },
  ];

  return (
    <>
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

          <button
            className="header-menu-toggle"
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu-panel"
          >
            <span />
            <span />
            <span />
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

      <div id="site-menu-panel" className={isMenuOpen ? "site-menu-panel open" : "site-menu-panel"} aria-hidden={!isMenuOpen}>
        <div className="site-menu-panel-top">
          <span>Menu</span>
          <button type="button" onClick={closeMenu} aria-label="Close menu">
            X
          </button>
        </div>
        <div className="site-menu-body">
          <nav className="site-menu-links" aria-label="Menu navigation">
            {menuItems.map((item) => (
              <button
                type="button"
                onClick={item.onClick}
                onFocus={() => setActiveMenuPreview(item.preview)}
                onMouseEnter={() => setActiveMenuPreview(item.preview)}
                key={item.label}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="site-menu-preview" aria-hidden="true">
            <img src={activeMenuPreview} alt="" />
          </div>
        </div>

        <footer className="site-menu-footer">
          <div>
            <span>Contact</span>
            <a href="tel:+9779748285909">+977 9748285909</a>
            <a href="mailto:katwalgrish@gmail.com">katwalgrish@gmail.com</a>
          </div>
          <nav aria-label="Social links">
            <a href="https://www.instagram.com/vinexnepal/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://wa.me/9779748285909" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </nav>
        </footer>
      </div>
      <button
        className={isMenuOpen ? "site-menu-scrim open" : "site-menu-scrim"}
        type="button"
        onClick={closeMenu}
        aria-label="Close menu"
        tabIndex={isMenuOpen ? 0 : -1}
      />
    </>
  );
}
