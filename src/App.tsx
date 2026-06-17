import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage/HomePage";
import { AboutPage } from "./pages/AboutPage/AboutPage";
import { ProductPage, type ProductSelection } from "./pages/ProductPage/ProductPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { SupportPage } from "./pages/SupportPage/SupportPage";
import { AdminPage } from "./pages/AdminPage/AdminPage";
import { FooterSection } from "./components/FooterSection";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { CustomerAccountModal } from "./components/CustomerAccountModal";
import { fetchProducts, recordProductInterest, type CustomerAccount, type PageContentSettings, type StoreOperationSettings } from "./lib/api";
import type { Product } from "./types/product";

type Page = "home" | "about" | "products" | "cart" | "checkout" | "support" | "admin";

type CartItem = {
  cartKey: string;
  productId: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

type CartProduct = Product & CartItem;

type CartToast = {
  id: number;
  productName: string;
};

const defaultPageContent: PageContentSettings = {
  bannerPrimary: "Hot Deals",
  bannerSecondary: "Premium picks only",
  bannerTertiary: "Auto-updating flash sale",
  heroPromos: [
    {
      title: "Hot Sellers",
      subtitle: "Fresh style edits",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "New Arrivals",
      subtitle: "Weekend ready",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Home & Decor",
      subtitle: "Soft room upgrades",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Top Deal",
      subtitle: "Smart picks",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Trending Now",
      subtitle: "Beauty and daily tech",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Premium Picks",
      subtitle: "Accessories edit",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=80",
    },
  ],
  heroImageOne: "/images/products/airbuds-display.png",
  heroImageTwo: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
  heroTag: "Hot Deals",
  heroButton: "Shop Now",
  flashTag: "Flash Window",
  flashTitle: "Hot deals end soon",
  flashActiveText: "The flash sale countdown is live and can be managed from the admin panel.",
  flashInactiveText: "Limited-time offers are still highlighted for shoppers right now.",
  sideTag: "Trending Now",
  sectionTag: "Flash Sale",
  sectionTitle: "Only two clean premium deals, front and center.",
  sectionText:
    "The storefront now focuses on a tighter, ad-driven experience with fast product discovery, visible discounts, and a hero area that keeps rotating between the airbuds and Apple Watch.",
};

const defaultStoreOperations: StoreOperationSettings = {
  categories: ["Audio", "Wearables"],
  coupons: [],
  deliveryCharge: 0,
  paymentMethods: ["Cash on Delivery"],
  showCategorySection: true,
  showBestProductsSection: true,
  showFeaturedSection: true,
  showBestSellersSection: true,
  showNewArrivalsSection: true,
  showTrustSection: true,
  showRelatedProducts: false,
  showProductPageIntro: true,
  homeCategoryTitle: "Shop by category",
  homeBestProductsTitle: "Best products",
  homeFeaturedTitle: "Featured products",
  homeBestSellersTitle: "Best sellers",
  homeNewArrivalsTitle: "New arrivals",
  homeTrustTitle: "Why customers choose us",
  productPageTag: "Products",
  productPageTitle: "Shop all products",
  productPageText: "Browse every available product, filter by category, and open details before buying.",
  relatedProductsTitle: "Related products",
};

const customerSessionStorageKey = "vinex-customer-session";

function getPageFromPathname(pathname: string): Page {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/about") return "about";
  if (normalizedPath === "/shopnow" || normalizedPath === "/products") return "products";
  if (normalizedPath === "/cart") return "cart";
  if (normalizedPath === "/checkout") return "checkout";
  if (normalizedPath === "/support") return "support";
  if (normalizedPath === "/admin") return "admin";
  return "home";
}

function getPathForPage(page: Page) {
  if (page === "home") return "/";
  if (page === "about") return "/about";
  if (page === "products") return "/shopnow";
  if (page === "cart") return "/cart";
  if (page === "checkout") return "/checkout";
  if (page === "support") return "/support";
  return "/admin";
}

function getTitleForPage(page: Page) {
  if (page === "about") return "About Us | Vinex Nepal";
  if (page === "products") return "Shop Now | Vinex Nepal";
  if (page === "cart") return "Cart | Vinex Nepal";
  if (page === "checkout") return "Checkout | Vinex Nepal";
  if (page === "support") return "Contact Us | Vinex Nepal";
  if (page === "admin") return "Admin | Vinex Nepal";
  return "Home | Vinex Nepal";
}

function MobileBottomNav({
  currentPage,
  isCartOpen,
  onNavigate,
  onSearchChange,
  onOpenShop,
  onOpenCart,
  onOpenAccount,
}: {
  currentPage: Page;
  isCartOpen: boolean;
  onNavigate: (page: Page) => void;
  onSearchChange: (query: string) => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
}) {
  const openCategory = (category: string) => {
    if (category === "Categories") {
      onSearchChange("");
    } else {
      onSearchChange(category);
    }

    onOpenShop();
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile shop navigation">
      <button className={currentPage === "home" ? "active" : ""} type="button" onClick={() => onNavigate("home")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
        </svg>
        <span>Shop</span>
      </button>
      <button className={currentPage === "products" ? "active" : ""} type="button" onClick={() => openCategory("Categories")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16M4 12h16M4 19h16" />
        </svg>
        <span>Category</span>
      </button>
      <button type="button" onClick={() => openCategory("Hot Deals")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m4 16 5-5 4 4 7-8" />
          <path d="M14 7h6v6" />
        </svg>
        <span>Deals</span>
      </button>
      <button className={currentPage === "cart" || isCartOpen ? "active" : ""} type="button" onClick={onOpenCart}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.1 4.3h2l1.8 8.9a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 1.9-1.4l1.4-4.8H8.1" />
          <path d="M7.2 19.7h.1M17.3 19.7h.1" />
        </svg>
        <span>Cart</span>
      </button>
      <button type="button" onClick={onOpenAccount}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
        <span>Me</span>
      </button>
    </nav>
  );
}

function CartDrawer({
  isOpen,
  items,
  subtotal,
  discount,
  deliveryCharge,
  orderTotal,
  couponCode,
  appliedCouponCode,
  couponMessage,
  onClose,
  onCouponCodeChange,
  onApplyCoupon,
  onClearCoupon,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
}: {
  isOpen: boolean;
  items: CartProduct[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  orderTotal: number;
  couponCode: string;
  appliedCouponCode: string;
  couponMessage: string;
  onClose: () => void;
  onCouponCodeChange: (couponCode: string) => void;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
  onIncreaseQuantity: (cartKey: string) => void;
  onDecreaseQuantity: (cartKey: string) => void;
  onRemoveItem: (cartKey: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const submitCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApplyCoupon();
  };

  return (
    <div className={isOpen ? "cart-drawer-layer open" : "cart-drawer-layer"} aria-hidden={!isOpen}>
      <button className="cart-drawer-backdrop" type="button" aria-label="Close cart" onClick={onClose} />
      <aside className="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <button className="cart-drawer-close" type="button" aria-label="Close cart" onClick={onClose}>
          ×
        </button>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <p>
              Your cart is currently empty.{" "}
              <button type="button" onClick={onContinueShopping}>
                Shop Now
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <article className="cart-drawer-item" key={item.cartKey}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-drawer-item-main">
                    <h3>{item.name}</h3>
                    <div className="cart-drawer-qty">
                      <span>Qty</span>
                      <button type="button" onClick={() => onDecreaseQuantity(item.cartKey)} disabled={item.quantity <= 1}>
                        -
                      </button>
                      <strong>{item.quantity}</strong>
                      <button type="button" onClick={() => onIncreaseQuantity(item.cartKey)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-drawer-item-side">
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                    <button type="button" onClick={() => onRemoveItem(item.cartKey)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-drawer-summary">
                <div className="cart-drawer-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <form className="cart-drawer-coupon" onSubmit={submitCoupon}>
                  <label htmlFor="cart-drawer-coupon">Coupon</label>
                  <div>
                    <input
                      id="cart-drawer-coupon"
                      value={couponCode}
                      onChange={(event) => onCouponCodeChange(event.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <button type="submit">Apply</button>
                  </div>
                  {couponMessage ? <p>{couponMessage}</p> : null}
                </form>

                {appliedCouponCode ? (
                  <div className="cart-drawer-summary-row">
                    <span>Discount ({appliedCouponCode})</span>
                    <strong>-{formatPrice(discount)}</strong>
                  </div>
                ) : null}

                <div className="cart-drawer-summary-row">
                  <span>Delivery</span>
                  <strong>{formatPrice(deliveryCharge)}</strong>
                </div>

                <div className="cart-drawer-summary-row total">
                  <span>Total</span>
                  <strong>{formatPrice(orderTotal)}</strong>
                </div>
              </div>

              {appliedCouponCode ? (
                <button className="cart-drawer-secondary-action" type="button" onClick={onClearCoupon}>
                  Remove Coupon
                </button>
              ) : null}
              <button type="button" onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductShopWindow({
  isOpen,
  isPage = false,
  products,
  cartCount,
  storeOperations,
  onClose,
  onOpenAbout,
  onOpenCart,
  onAddToCart,
}: {
  isOpen: boolean;
  isPage?: boolean;
  products: Product[];
  cartCount: number;
  storeOperations: StoreOperationSettings;
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenCart: () => void;
  onAddToCart: (productId: number, selection?: ProductSelection) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("featured");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const categories = Array.from(new Set([...(storeOperations.categories ?? []), ...products.map((product) => product.category)].filter(Boolean)));
  const visibleProducts = products
    .filter((product) => categoryFilter === "all" || product.category === categoryFilter)
    .sort((first, second) => {
      if (sortMode === "sale") {
        return Number(Boolean(second.originalPrice && second.originalPrice > second.price)) - Number(Boolean(first.originalPrice && first.originalPrice > first.price));
      }

      if (sortMode === "price-low") return first.price - second.price;
      if (sortMode === "price-high") return second.price - first.price;
      if (sortMode === "name") return first.name.localeCompare(second.name);
      return Number(second.featured ?? false) - Number(first.featured ?? false);
    });
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const selectedProductImages = selectedProduct
    ? Array.from(new Set([selectedProduct.image, ...(selectedProduct.galleryImages ?? []), selectedProduct.hoverImage].filter((image): image is string => Boolean(image))))
    : [];
  const selectedProductColors = selectedProduct?.colorOptions ?? [];
  const selectedProductSizes = selectedProduct?.sizeOptions ?? [];
  const selectedProductSelection = {
    color: selectedColor || selectedProductColors[0],
    size: selectedSize || selectedProductSizes[0],
  };

  const openProductPanel = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedColor(product.colorOptions?.[0] ?? "");
    setSelectedSize(product.sizeOptions?.[0] ?? "");
    setActiveImage(product.image);
    window.requestAnimationFrame(() => {
      setIsProductPanelOpen(true);
    });
  };

  const closeProductPanel = () => {
    setIsProductPanelOpen(false);
    window.setTimeout(() => {
      setSelectedProductId(null);
      setActiveImage("");
    }, 420);
  };

  const shopWindowClassName = [
    "shop-window",
    isPage ? "shop-window-page" : "",
    isOpen ? "open" : "",
    selectedProduct || isProductPanelOpen ? "product-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <section className={shopWindowClassName} aria-hidden={!isOpen}>
      <div className="shop-window-panel" role={isPage ? undefined : "dialog"} aria-modal={isPage ? undefined : true} aria-label="Shop products">
        {isPage ? null : (
          <Header
            currentPage="products"
            cartCount={cartCount}
            searchQuery=""
            onSearchChange={() => undefined}
            onNavigate={(nextPage) => {
              if (nextPage === "home") {
                onClose();
              }
            }}
            onOpenAbout={() => {
              onClose();
              onOpenAbout();
            }}
            onOpenShop={() => undefined}
            onOpenCart={onOpenCart}
            onOpenAccount={() => undefined}
          />
        )}

        <div className="shop-window-meta">
          <div className="shop-window-summary">
            <span>Our Products</span>
            <strong>{visibleProducts.length} products ready</strong>
          </div>

          <div className="shop-window-filter">
            <label>
              <span>Category</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All</option>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="sale">Discount</option>
                <option value="price-low">Low Price</option>
                <option value="price-high">High Price</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        <div className="shop-window-grid">
          {visibleProducts.map((product) => {
            const discountPercent = product.originalPrice && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <article className="shop-window-card" key={product.id}>
                <button
                  className="shop-window-image"
                  type="button"
                  onClick={() => openProductPanel(product)}
                  disabled={product.inStock === false}
                >
                  <img className="shop-window-primary" src={product.image} alt={product.name} />
                  {product.hoverImage ? <img className="shop-window-hover" src={product.hoverImage} alt="" aria-hidden="true" /> : null}
                  <span>{product.inStock === false ? "Out of Stock" : "View Product"}</span>
                  {discountPercent > 0 ? <em>{discountPercent}% off</em> : null}
                </button>
                <div className="shop-window-card-meta">
                  <strong>{product.name}</strong>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className={isProductPanelOpen ? "shop-product-panel open" : "shop-product-panel"} aria-hidden={!selectedProduct}>
          {selectedProduct ? (
            <article className="shop-product-detail" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} details`}>
              <div className="shop-product-gallery">
                <div className="shop-product-image-frame">
                  <img src={activeImage || selectedProduct.image} alt={selectedProduct.name} />
                </div>
              </div>

              <div className="shop-product-copy">
                <button className="shop-product-close" type="button" onClick={closeProductPanel} aria-label="Close product details">
                  ×
                </button>
                <span className="shop-product-category">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <div className="shop-product-price">
                  {selectedProduct.originalPrice ? <span>{formatPrice(selectedProduct.originalPrice)}</span> : null}
                  <strong>{formatPrice(selectedProduct.price)}</strong>
                </div>

                {selectedProductImages.length > 1 ? (
                  <div className="shop-product-thumbs">
                    {selectedProductImages.map((image) => (
                      <button
                        className={(activeImage || selectedProduct.image) === image ? "active" : ""}
                        type="button"
                        key={image}
                        onClick={() => setActiveImage(image)}
                      >
                        <img src={image} alt="" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedProductColors.length > 0 ? (
                  <div className="shop-product-options">
                    <span>Color</span>
                    <div>
                      {selectedProductColors.map((color) => (
                        <button
                          className={selectedProductSelection.color === color ? "active" : ""}
                          type="button"
                          key={color}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedProductSizes.length > 0 ? (
                  <div className="shop-product-options">
                    <span>Size</span>
                    <div>
                      {selectedProductSizes.map((size) => (
                        <button
                          className={selectedProductSelection.size === size ? "active" : ""}
                          type="button"
                          key={size}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="shop-product-actions">
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(selectedProduct.id, selectedProductSelection);
                      closeProductPanel();
                    }}
                    disabled={selectedProduct.inStock === false}
                  >
                    {selectedProduct.inStock === false ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AboutPanel({
  isOpen,
  cartCount,
  onClose,
  onOpenShop,
  onOpenCart,
}: {
  isOpen: boolean;
  cartCount: number;
  onClose: () => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
}) {
  const [isAboutHeaderHidden, setIsAboutHeaderHidden] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAboutHeaderHidden(false);
    }
  }, [isOpen]);

  return (
    <section className={isOpen ? "about-panel open" : "about-panel"} aria-hidden={!isOpen}>
      <div className="about-panel-content" role="dialog" aria-modal="true" aria-label="About Vinex Nepal">
        <Header
          currentPage="products"
          cartCount={cartCount}
          searchQuery=""
          isHidden={isAboutHeaderHidden}
          onSearchChange={() => undefined}
          onNavigate={(nextPage) => {
            if (nextPage === "home") {
              onClose();
            }
          }}
          onOpenAbout={() => undefined}
          onOpenShop={onOpenShop}
          onOpenCart={onOpenCart}
          onOpenAccount={() => undefined}
        />
        <AboutPage onFooterVisibilityChange={setIsAboutHeaderHidden} />
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPathname(window.location.pathname));
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [productToOpen, setProductToOpen] = useState<number | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isShopWindowOpen, setIsShopWindowOpen] = useState(false);
  const [isAboutPanelOpen, setIsAboutPanelOpen] = useState(false);
  const [cartToasts, setCartToasts] = useState<CartToast[]>([]);
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(() => {
    try {
      const storedCustomer = window.localStorage.getItem(customerSessionStorageKey);
      return storedCustomer ? (JSON.parse(storedCustomer) as CustomerAccount) : null;
    } catch {
      return null;
    }
  });
  const [flashSaleSettings, setFlashSaleSettings] = useState<{
    enabled: boolean;
    endsAt: string | null;
  }>({
    enabled: true,
    endsAt: null,
  });
  const [pageContent, setPageContent] = useState<PageContentSettings>(defaultPageContent);
  const [storeOperations, setStoreOperations] = useState<StoreOperationSettings>(defaultStoreOperations);
  const [isPastHomeHero, setIsPastHomeHero] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const syncPageFromLocation = () => {
      setPage(getPageFromPathname(window.location.pathname));
      setIsCartDrawerOpen(false);
      setIsShopWindowOpen(false);
      setIsAboutPanelOpen(false);
    };

    syncPageFromLocation();
    window.addEventListener("popstate", syncPageFromLocation);
    return () => window.removeEventListener("popstate", syncPageFromLocation);
  }, []);

  useEffect(() => {
    document.title = getTitleForPage(page);
  }, [page]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        setProducts(result.products);
        setFlashSaleSettings(
          result.settings?.flashSale ?? {
            enabled: true,
            endsAt: null,
          },
        );
        setPageContent(result.settings?.pageContent ?? defaultPageContent);
        setStoreOperations({
          ...defaultStoreOperations,
          ...(result.settings?.operations ?? {}),
        });
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    const updateHeaderState = () => {
      const scrollY = window.scrollY;
      const footer = document.querySelector<HTMLElement>(".site-footer-home");
      const footerTop = footer ? footer.offsetTop : Number.POSITIVE_INFINITY;
      const footerIsReached = page === "home" && scrollY >= footerTop - 90;
      const isScrollingDown = scrollY > lastScrollY.current;

      setIsPastHomeHero(scrollY >= window.innerHeight - 72);
      setIsHeaderHidden(footerIsReached && isScrollingDown);
      lastScrollY.current = scrollY;
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [page]);

  useEffect(() => {
    if (!isCartDrawerOpen && !isShopWindowOpen && !isAboutPanelOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCartDrawerOpen(false);
        setIsShopWindowOpen(false);
        setIsAboutPanelOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAboutPanelOpen, isCartDrawerOpen, isShopWindowOpen]);

  const navigate = (nextPage: Page) => {
    setIsCartDrawerOpen(false);
    setIsShopWindowOpen(false);
    setIsAboutPanelOpen(false);
    const nextPath = getPathForPage(nextPage);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    setPage(nextPage);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const cartProducts = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...product, ...item } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [cartItems],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartProducts.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartProducts],
  );
  const appliedCoupon = useMemo(
    () =>
      storeOperations.coupons.find(
        (coupon) =>
          coupon.enabled !== false &&
          coupon.code.toLowerCase() === appliedCouponCode.trim().toLowerCase(),
      ) ?? null,
    [appliedCouponCode, storeOperations.coupons],
  );
  const discount = useMemo(
    () => Math.min(subtotal, appliedCoupon ? Number(appliedCoupon.discount) : 0),
    [appliedCoupon, subtotal],
  );
  const deliveryCharge = cartProducts.length > 0 ? Number(storeOperations.deliveryCharge ?? 0) : 0;
  const orderTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const searchedProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    const relatedKeywords: Record<string, string[]> = {
      airbuds: ["earbuds", "earbud", "earphone", "earphones", "pods", "airpods", "headset", "audio", "sound", "music", "electronics", "wireless"],
      earbuds: ["airbuds", "earbud", "earphone", "earphones", "pods", "airpods", "audio", "sound", "music", "electronics", "wireless"],
      watch: ["smartwatch", "wearable", "wearables", "fitness", "tracker", "time", "apple", "electronics", "gadget"],
      wearable: ["watch", "smartwatch", "fitness", "tracker", "electronics", "gadget"],
      electronics: ["airbuds", "earbuds", "earphone", "pods", "watch", "smartwatch", "wearable", "gadget", "audio"],
    };

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
    const expandedQueries = new Set([
      normalizedQuery,
      ...queryWords,
      ...queryWords.flatMap((word) => relatedKeywords[word] ?? []),
    ]);

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.name.toLowerCase().includes("airbud") ? "earbuds earphone earphones pods airpods audio sound music electronics wireless" : "",
        product.name.toLowerCase().includes("watch") ? "smartwatch wearable wearables fitness tracker time electronics gadget" : "",
      ]
        .join(" ")
        .toLowerCase();

      return Array.from(expandedQueries).some((query) => searchableText.includes(query));
    });
  }, [products, searchQuery]);

  const getCartKey = (productId: number, selection: ProductSelection = {}) =>
    [productId, selection.color ?? "", selection.size ?? ""].join("::");

  const addToCart = (productId: number, selection: ProductSelection = {}) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product || product.inStock === false) {
      return;
    }

    void recordProductInterest(productId);
    const toastId = Date.now();
    setCartToasts((current) => [...current, { id: toastId, productName: product.name }].slice(-4));
    window.setTimeout(() => {
      setCartToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, 2400);
    const cartKey = getCartKey(productId, selection);
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartKey === cartKey);
      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...currentItems,
        {
          cartKey,
          productId,
          quantity: 1,
          selectedColor: selection.color,
          selectedSize: selection.size,
        },
      ];
    });
  };

  const buyNow = (productId: number, selection: ProductSelection = {}) => {
    addToCart(productId, selection);
    navigate("checkout");
  };

  const openCartDrawer = () => {
    setIsShopWindowOpen(false);
    setIsAboutPanelOpen(false);
    setIsCartDrawerOpen(true);
  };

  const openShopWindow = () => {
    setSearchQuery("");
    navigate("products");
  };

  const openAboutPanel = () => {
    navigate("about");
  };

  const updateQuantity = (cartKey: string, change: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  };

  const removeFromCart = (cartKey: string) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  };

  const handleOrderPlaced = () => {
    setCartItems([]);
    setCouponCode("");
    setAppliedCouponCode("");
    setCouponMessage("");
  };

  const signInCustomer = (customer: CustomerAccount) => {
    setCustomerAccount(customer);
    window.localStorage.setItem(customerSessionStorageKey, JSON.stringify(customer));
  };

  const signOutCustomer = () => {
    setCustomerAccount(null);
    window.localStorage.removeItem(customerSessionStorageKey);
  };

  const openProductFromHome = (productId: number) => {
    setSearchQuery("");
    setProductToOpen(productId);
    navigate("products");
  };

  const applyCoupon = () => {
    const normalizedCoupon = couponCode.trim();
    if (!normalizedCoupon) {
      setAppliedCouponCode("");
      setCouponMessage("Enter a coupon code first.");
      return;
    }

    const coupon = storeOperations.coupons.find(
      (entry) => entry.enabled !== false && entry.code.toLowerCase() === normalizedCoupon.toLowerCase(),
    );

    if (!coupon) {
      setAppliedCouponCode("");
      setCouponMessage("Coupon not found or inactive.");
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponMessage(`Coupon ${coupon.code} applied.`);
  };

  return (
    <div className={["app-shell", page === "home" ? "app-shell-home" : "", page === "about" ? "app-shell-about" : ""].filter(Boolean).join(" ")}>
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />

      <Header
        currentPage={page}
        cartCount={cartCount}
        customerName={customerAccount?.name}
        searchQuery={searchQuery}
        isPastHero={isPastHomeHero}
        isHidden={isHeaderHidden}
        onSearchChange={setSearchQuery}
        onNavigate={navigate}
        onOpenAbout={openAboutPanel}
        onOpenShop={openShopWindow}
        onOpenCart={openCartDrawer}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />
      {page !== "admin" ? (
        <MobileBottomNav
          currentPage={page}
          isCartOpen={isCartDrawerOpen}
          onNavigate={navigate}
          onSearchChange={setSearchQuery}
          onOpenShop={openShopWindow}
          onOpenCart={openCartDrawer}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
      ) : null}

      {page === "home" ? (
        <HomePage
          products={products}
          flashSaleSettings={flashSaleSettings}
          pageContent={pageContent}
          storeOperations={storeOperations}
          onBrowseProducts={openShopWindow}
          onOpenProduct={openProductFromHome}
        />
      ) : page === "about" ? (
        <AboutPage onFooterVisibilityChange={setIsHeaderHidden} />
      ) : page === "products" ? (
        <ProductShopWindow
          isOpen
          isPage
          products={searchedProducts}
          cartCount={cartCount}
          storeOperations={storeOperations}
          onClose={() => navigate("home")}
          onOpenAbout={openAboutPanel}
          onOpenCart={openCartDrawer}
          onAddToCart={addToCart}
        />
      ) : page === "cart" ? (
        <CartPage
          items={cartProducts}
          subtotal={subtotal}
          discount={discount}
          deliveryCharge={deliveryCharge}
          orderTotal={orderTotal}
          couponCode={couponCode}
          appliedCouponCode={appliedCouponCode}
          couponMessage={couponMessage}
          onCouponCodeChange={setCouponCode}
          onApplyCoupon={applyCoupon}
          onClearCoupon={() => {
            setAppliedCouponCode("");
            setCouponMessage("");
          }}
          onIncreaseQuantity={(cartKey) => updateQuantity(cartKey, 1)}
          onDecreaseQuantity={(cartKey) => updateQuantity(cartKey, -1)}
          onRemoveItem={removeFromCart}
          onContinueShopping={openShopWindow}
          onCheckout={() => navigate("checkout")}
        />
      ) : page === "checkout" ? (
        <CheckoutPage
          items={cartProducts}
          subtotal={subtotal}
          discount={discount}
          deliveryCharge={deliveryCharge}
          orderTotal={orderTotal}
          couponCode={appliedCouponCode}
          paymentMethods={storeOperations.paymentMethods}
          onBackToCart={() => navigate("cart")}
          onOrderPlaced={handleOrderPlaced}
        />
      ) : page === "support" ? (
        <SupportPage />
      ) : (
        <AdminPage />
      )}

      {page !== "admin" && page !== "about" && page !== "products" ? (
        <>
          <FooterSection showWelcome={page === "home"} showProductRequest={true} onNavigateSupport={() => navigate("support")} />
          <LiveChatWidget />
        </>
      ) : null}

      <CartDrawer
        isOpen={isCartDrawerOpen}
        items={cartProducts}
        subtotal={subtotal}
        discount={discount}
        deliveryCharge={deliveryCharge}
        orderTotal={orderTotal}
        couponCode={couponCode}
        appliedCouponCode={appliedCouponCode}
        couponMessage={couponMessage}
        onClose={() => setIsCartDrawerOpen(false)}
        onCouponCodeChange={setCouponCode}
        onApplyCoupon={applyCoupon}
        onClearCoupon={() => {
          setAppliedCouponCode("");
          setCouponMessage("");
        }}
        onIncreaseQuantity={(cartKey) => updateQuantity(cartKey, 1)}
        onDecreaseQuantity={(cartKey) => updateQuantity(cartKey, -1)}
        onRemoveItem={removeFromCart}
        onCheckout={() => navigate("checkout")}
        onContinueShopping={openShopWindow}
      />

      <ProductShopWindow
        isOpen={isShopWindowOpen}
        products={products}
        cartCount={cartCount}
        storeOperations={storeOperations}
        onClose={() => setIsShopWindowOpen(false)}
        onOpenAbout={openAboutPanel}
        onOpenCart={openCartDrawer}
        onAddToCart={addToCart}
      />

      <AboutPanel
        isOpen={isAboutPanelOpen}
        cartCount={cartCount}
        onClose={() => setIsAboutPanelOpen(false)}
        onOpenShop={openShopWindow}
        onOpenCart={openCartDrawer}
      />

      {cartToasts.length > 0 ? (
        <div className="cart-toast-stack" role="status" aria-live="polite">
          {cartToasts.map((toast) => (
            <div className="cart-toast" key={toast.id}>
              <span>Added to cart</span>
              <strong>{toast.productName}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {isAccountModalOpen ? (
        <CustomerAccountModal
          currentCustomer={customerAccount}
          onClose={() => setIsAccountModalOpen(false)}
          onSignIn={signInCustomer}
          onSignOut={signOutCustomer}
        />
      ) : null}
    </div>
  );
}
