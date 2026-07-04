import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage/HomePage";
import { AboutPage } from "./pages/AboutPage/AboutPage";
import { ProductPage, type ProductSelection } from "./pages/ProductPage/ProductPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { SupportPage } from "./pages/SupportPage/SupportPage";
import { SellerPage } from "./pages/SellerPage/SellerPage";
import { AdminPage } from "./pages/AdminPage/AdminPage";
import { FooterSection } from "./components/FooterSection";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { CustomerAccountModal } from "./components/CustomerAccountModal";
import { fetchProducts, recordProductInterest, type AboutContentSettings, type CustomerAccount, type PageContentSettings, type StoreOperationSettings } from "./lib/api";
import type { Product } from "./types/product";
import { FiHeadphones, FiMapPin, FiRefreshCw, FiTruck } from "react-icons/fi";

type Page = "home" | "about" | "products" | "cart" | "checkout" | "support" | "seller" | "admin";

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

const hiddenCategoryOptions = new Set(["audio", "wearables"]);

const defaultPageContent: PageContentSettings = {
  bannerPrimary: "Hot Deals",
  bannerSecondary: "Premium picks only",
  bannerTertiary: "Auto-updating flash sale",
  homeHeroImage: "/images/Herosection.png",
  homeHeroImages: [
    "/images/HeroSection/Hero1.png",
    "/images/HeroSection/Hero2.png",
    "/images/HeroSection/Hero3.png",
  ],
  brandIntroText:
    "Vinex Nepal is built for everyday style, useful tech, and smart essentials that feel easy to choose and better to own. We bring clean, reliable products together with a shopping experience made for Nepal.",
  collectionTitle: "Our Collection",
  collectionProductIds: [1, 2],
  electronicsTitle: "Electronics Products",
  electronicsProductIds: [1, 2, 3],
  garmentsTitle: "Garment Products",
  garmentsProductIds: [5, 6, 7],
  shoesTitle: "Shoes",
  shoesProductIds: [11, 12, 13],
  flashProductIds: [1],
  flashDescription: "Limited-time Vinex picks with sharp pricing, clean utility, and fast local support.",
  flashCta: "Quick Add",
  shopNowImage: "/images/shopnow.png",
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
  sectionTitle: "Built for everyday.",
  sectionText:
    "Premium tech, clean style, and daily essentials curated for Nepal.",
};

const defaultAboutContent: AboutContentSettings = {
  heroMetaLeft: "Est. 2025",
  heroMetaRight: "#About",
  heroTitle:
    "Vinex Nepal brings carefully picked gadgets, accessories, and daily essentials into one simple store, built for easy discovery, fair prices, and reliable local support.",
  storyImages: [
    "/images/About Us Images/1st image.png",
    "/images/About Us Images/2nd image.png",
    "/images/About Us Images/3rd image.png",
  ],
  teamMembers: [
    {
      name: "Grish Katwal",
      titles: ["Founder", "CEO", "Managing Director"],
      message:
        "Building Vinex Nepal as a cleaner way to discover practical products, with a focus on trust, speed, and everyday value for local customers.",
      imageLabel: "Grish Katwal",
      imageSrc: "/images/Team Images/Grish Katwal.jpg",
    },
    {
      name: "Himalaya Jung Katwal",
      titles: ["Cofounder", "Executive Director"],
      message:
        "Shaping the operations behind Vinex Nepal so each order feels simple, responsive, and supported from product selection to delivery.",
      imageLabel: "Himalaya Jung Katwal",
      imageSrc: "/images/Team Images/Himalaya Katwal.jpg",
    },
  ],
  storyHeadline:
    'Vinex takes "Vin" from Vinayak, Lord Ganesh, and pairs it with "ex" for modern expression. Together, it reflects thoughtful, quick, and smarter shopping.',
  storyParagraphs: [
    "We started Vinex Nepal because finding useful, good-looking products should not feel scattered. Customers should be able to discover practical gadgets, accessories, and daily essentials without guessing where to buy, what to trust, or whether support will be available after checkout.",
    "Our store is shaped around clarity: focused collections, fair pricing, simple ordering, and local communication that feels human. Vinex is not trying to make shopping louder. We are building a cleaner place to choose products that fit real routines.",
    "Every product we highlight has to earn its space. It should be easy to understand, useful to own, and backed by a team that cares about the full experience from first look to final delivery.",
    "That is the long-term idea behind Vinex Nepal: a modern ecommerce brand rooted in local trust, built carefully enough that customers can come back with confidence.",
  ],
  galleryLogo: "/images/brand/VinexLogo.png",
  galleryText: "Join our community for new drops, behind-the-scenes updates, and product stories made for everyday Nepal.",
  galleryImages: [
    "/images/Gallery Images/1st.png",
    "/images/Gallery Images/2nd.png",
    "/images/Gallery Images/3rd.png",
    "/images/Gallery Images/4th.png",
  ],
  socialLinks: [
    { label: "Instagram", url: "https://www.instagram.com/vinexnepal/" },
    { label: "TikTok", url: "https://www.tiktok.com/@vinexnepal" },
    { label: "Facebook", url: "https://www.facebook.com/" },
  ],
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
  supportPageTag: "Help & Support",
  supportPageTitle: "We are here to help",
  supportPageText: "For order updates, product questions, or quick support, message us directly on your preferred platform.",
  supportContactTitle: "Direct Contact",
  supportContactText: "Reach Vinex Nepal on WhatsApp, Instagram, TikTok, or call us at",
  supportPhone: "+977 9748285909",
  supportWhatsappUrl: "https://wa.me/9779748285909",
  supportInstagramUrl: "https://www.instagram.com/vinexnepal/",
  supportInstagramLabel: "vinexnepal",
  supportTiktokUrl: "https://www.tiktok.com/@vinexnepal",
  supportTiktokLabel: "@vinexnepal",
  supportHoursTag: "Support Hours",
  supportHoursTitle: "Fast replies on social",
  supportHoursText: "WhatsApp and Instagram are best for quick order questions.",
};

const customerSessionStorageKey = "vinex-customer-session";

function getPageFromPathname(pathname: string): Page {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/about") return "about";
  if (normalizedPath === "/shopnow" || normalizedPath === "/products") return "products";
  if (normalizedPath === "/cart") return "cart";
  if (normalizedPath === "/checkout") return "checkout";
  if (normalizedPath === "/support") return "support";
  if (normalizedPath === "/become-a-seller" || normalizedPath === "/seller") return "seller";
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
  if (page === "seller") return "/become-a-seller";
  return "/admin";
}

function getTitleForPage(page: Page) {
  if (page === "about") return "About Us | Vinex Nepal";
  if (page === "products") return "Shop Now | Vinex Nepal";
  if (page === "cart") return "Cart | Vinex Nepal";
  if (page === "checkout") return "Checkout | Vinex Nepal";
  if (page === "support") return "Contact Us | Vinex Nepal";
  if (page === "seller") return "Become a Seller | Vinex Nepal";
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
  onViewCart,
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
  onViewCart: () => void;
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
              <button className="cart-drawer-view-all" type="button" onClick={onViewCart}>
                View All
              </button>
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
  categoryTarget,
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
  categoryTarget: string | null;
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenCart: () => void;
  onAddToCart: (productId: number, selection?: ProductSelection) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("featured");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [shopPage, setShopPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const [hasReturnedFromProduct, setHasReturnedFromProduct] = useState(false);
  const [isSupplierDetailsOpen, setIsSupplierDetailsOpen] = useState(false);
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.category)
            .filter((category) => category && !hiddenCategoryOptions.has(category.toLowerCase())),
        ),
      ),
    [products],
  );
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCategoryFilter(categoryTarget && categories.includes(categoryTarget) ? categoryTarget : "all");
  }, [categories, categoryTarget, isOpen]);

  const normalizedShopSearchQuery = shopSearchQuery.trim().toLowerCase();
  const visibleProducts = products
    .filter((product) => {
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch =
        !normalizedShopSearchQuery ||
        [product.name, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedShopSearchQuery));

      return matchesCategory && matchesSearch;
    })
    .sort((first, second) => {
      if (sortMode === "sale") {
        return Number(Boolean(second.originalPrice && second.originalPrice > second.price)) - Number(Boolean(first.originalPrice && first.originalPrice > first.price));
      }

      if (sortMode === "price-low") return first.price - second.price;
      if (sortMode === "price-high") return second.price - first.price;
      if (sortMode === "name") return first.name.localeCompare(second.name);
      return Number(second.featured ?? false) - Number(first.featured ?? false);
    });
  const productsPerShopPage = 4;
  const shopPageCount = Math.max(1, Math.ceil(visibleProducts.length / productsPerShopPage));
  const currentShopPage = Math.min(shopPage, shopPageCount);
  const paginatedProducts = visibleProducts.slice(
    (currentShopPage - 1) * productsPerShopPage,
    currentShopPage * productsPerShopPage,
  );
  const paginationItems = Array.from({ length: shopPageCount }, (_, index) => index + 1);
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
  const supplierDetails = selectedProduct
    ? {
        description:
          selectedProduct.supplierDescription ||
          "Vinex Nepal curates practical, quality-checked products with local order support.",
        location: selectedProduct.supplierLocation || "Kathmandu, Nepal",
        contact: selectedProduct.supplierContact || "+977 9748285909",
      }
    : null;

  useEffect(() => {
    document.body.classList.toggle("shop-product-detail-open", isProductPanelOpen);

    return () => {
      document.body.classList.remove("shop-product-detail-open");
    };
  }, [isProductPanelOpen]);

  useEffect(() => {
    setShopPage(1);
  }, [categoryFilter, normalizedShopSearchQuery, sortMode]);

  const openProductPanel = (product: Product) => {
    setHasReturnedFromProduct(false);
    setSelectedProductId(product.id);
    setSelectedColor(product.colorOptions?.[0] ?? "");
    setSelectedSize(product.sizeOptions?.[0] ?? "");
    setActiveImage(product.image);
    setIsSupplierDetailsOpen(false);
    window.requestAnimationFrame(() => {
      setIsProductPanelOpen(true);
    });
  };

  const closeProductPanel = () => {
    setHasReturnedFromProduct(true);
    setIsProductPanelOpen(false);
    window.setTimeout(() => {
      setSelectedProductId(null);
      setActiveImage("");
      setIsSupplierDetailsOpen(false);
    }, 420);
  };

  const shopWindowClassName = [
    "shop-window",
    isPage ? "shop-window-page" : "",
    isOpen ? "open" : "",
    selectedProduct || isProductPanelOpen ? "product-open" : "",
    hasReturnedFromProduct ? "product-returned" : "",
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
          <label className="shop-window-search">
            <span>Search</span>
            <input
              type="search"
              value={shopSearchQuery}
              onChange={(event) => setShopSearchQuery(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
            />
          </label>

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
          {visibleProducts.length === 0 ? (
            <div className="shop-window-empty">
              <span>No products found</span>
              <strong>Try another search or category.</strong>
            </div>
          ) : null}
          {paginatedProducts.map((product) => {
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

        {shopPageCount > 1 ? (
          <nav className="shop-window-pagination" aria-label="Product pagination">
            <button
              type="button"
              onClick={() => setShopPage((page) => Math.max(1, page - 1))}
              disabled={currentShopPage === 1}
              aria-label="Previous products"
            >
              &lt;
            </button>
            {paginationItems.map((page) => (
              <button
                className={page === currentShopPage ? "active" : ""}
                type="button"
                onClick={() => setShopPage(page)}
                aria-current={page === currentShopPage ? "page" : undefined}
                key={page}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShopPage((page) => Math.min(shopPageCount, page + 1))}
              disabled={currentShopPage === shopPageCount}
              aria-label="Next products"
            >
              &gt;
            </button>
          </nav>
        ) : (
          <div className="shop-window-pagination-spacer" aria-hidden="true" />
        )}

        <div className="shop-window-service-strip" aria-label="Shop benefits">
          <span>
            <FiTruck aria-hidden="true" />
            <strong>Free delivery</strong>
            <small>For all orders above Rs 3,000</small>
          </span>
          <span>
            <FiMapPin aria-hidden="true" />
            <strong>Our delivery partner</strong>
            <small>Nepal can move</small>
          </span>
          <span>
            <FiRefreshCw aria-hidden="true" />
            <strong>Easy returns</strong>
            <small>7 days return policy</small>
          </span>
          <span>
            <FiHeadphones aria-hidden="true" />
            <strong>Customer support</strong>
            <small>We're here to help</small>
          </span>
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
                <div className="shop-product-supplier" aria-label={`Supplier: ${selectedProduct.supplierName ?? "Vinex Nepal"}`}>
                  <span>Supplier</span>
                  <strong>{selectedProduct.supplierName ?? "Vinex Nepal"}</strong>
                  {supplierDetails ? (
                    <>
                      <button
                        className="supplier-detail-toggle"
                        type="button"
                        onClick={() => setIsSupplierDetailsOpen((current) => !current)}
                        aria-expanded={isSupplierDetailsOpen}
                      >
                        {isSupplierDetailsOpen ? "Hide details" : "View details"}
                      </button>
                      {isSupplierDetailsOpen ? (
                        <div className="supplier-detail-panel">
                          {supplierDetails.description ? <p>{supplierDetails.description}</p> : null}
                          {supplierDetails.location ? (
                            <div>
                              <span>Location</span>
                              <strong>{supplierDetails.location}</strong>
                            </div>
                          ) : null}
                          {supplierDetails.contact ? (
                            <div>
                              <span>Contact</span>
                              <strong>{supplierDetails.contact}</strong>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : null}
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
  aboutContent,
  heroImages,
}: {
  isOpen: boolean;
  cartCount: number;
  onClose: () => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
  aboutContent: AboutContentSettings;
  heroImages: string[];
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
        <AboutPage aboutContent={aboutContent} heroImages={heroImages} onFooterVisibilityChange={setIsAboutHeaderHidden} />
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPathname(window.location.pathname));
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopCategoryTarget, setShopCategoryTarget] = useState<string | null>(null);
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
  const [aboutContent, setAboutContent] = useState<AboutContentSettings>(defaultAboutContent);
  const [storeOperations, setStoreOperations] = useState<StoreOperationSettings>(defaultStoreOperations);
  const [isPastHomeHero, setIsPastHomeHero] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true);
  const [isPreloaderExiting, setIsPreloaderExiting] = useState(false);
  const [preloaderProgress, setPreloaderProgress] = useState(0);
  const [hasLoadedStorefront, setHasLoadedStorefront] = useState(false);
  const lastScrollY = useRef(0);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (getPageFromPathname(window.location.pathname) === "home") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

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
    if (page !== "home") {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
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
        setPageContent({ ...defaultPageContent, ...(result.settings?.pageContent ?? {}) });
        setAboutContent({ ...defaultAboutContent, ...(result.settings?.aboutContent ?? {}) });
        setStoreOperations({
          ...defaultStoreOperations,
          ...(result.settings?.operations ?? {}),
        });
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setHasLoadedStorefront(true);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    if (!isPreloaderVisible) {
      return undefined;
    }

    const progressTimer = window.setInterval(() => {
      setPreloaderProgress((current) => {
        if (hasLoadedStorefront) {
          return Math.min(100, current + Math.max(1, (100 - current) * 0.18));
        }

        return Math.min(94, current + Math.max(0.35, (94 - current) * 0.035));
      });
    }, 28);

    return () => window.clearInterval(progressTimer);
  }, [hasLoadedStorefront, isPreloaderVisible]);

  useEffect(() => {
    if (!isPreloaderVisible || preloaderProgress < 100) {
      return undefined;
    }

    setIsPreloaderExiting(true);

    const hideTimer = window.setTimeout(() => {
      setIsPreloaderVisible(false);
    }, 720);

    return () => window.clearTimeout(hideTimer);
  }, [isPreloaderVisible, preloaderProgress]);

  useEffect(() => {
    const updateHeaderState = () => {
      const scrollY = window.scrollY;
      const footer = document.querySelector<HTMLElement>(".site-footer-home");
      const footerTop = footer ? footer.offsetTop : Number.POSITIVE_INFINITY;
      const footerCanHideHeader = page === "home" || page === "support" || page === "seller";
      const footerIsReached = footerCanHideHeader && scrollY >= footerTop - 90;
      const isScrollingDown = scrollY > lastScrollY.current;
      const homeHeaderShouldHide = page === "home" && scrollY > 8 && isScrollingDown;
      const contactHero = document.querySelector<HTMLElement>(".contact-hero");
      const heroThreshold =
        (page === "support" || page === "seller") && contactHero
          ? contactHero.offsetTop + contactHero.offsetHeight - 80
          : window.innerHeight - 72;

      setIsPastHomeHero(scrollY >= heroThreshold);
      setIsHeaderHidden(homeHeaderShouldHide || (footerIsReached && isScrollingDown));
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
    setShopCategoryTarget(null);
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
    const product = products.find((entry) => entry.id === productId);
    setSearchQuery("");
    setShopCategoryTarget(product?.category ?? null);
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
    <div
      className={[
        "app-shell",
        page === "home" ? "app-shell-home" : "",
        page === "about" ? "app-shell-about" : "",
        page === "admin" ? "app-shell-admin" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />

      {isPreloaderVisible ? (
        <section
          className={isPreloaderExiting ? "site-preloader exiting" : "site-preloader"}
          aria-label="Loading Vinex Nepal"
          aria-live="polite"
        >
          <div className="site-preloader-mark">
            <img src="/images/brand/VinexLogo.png" alt="Vinex Nepal" />
          </div>
          <div className="site-preloader-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${preloaderProgress / 100})` }} />
          </div>
          <strong>{Math.round(preloaderProgress)}%</strong>
          <div className="site-preloader-copy">
            <span>Welcome to the Vinex Nepal experience</span>
            <small>Loading storefront</small>
          </div>
        </section>
      ) : null}

      {page !== "admin" ? (
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
      ) : null}
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
        <AboutPage
          aboutContent={aboutContent}
          heroImages={pageContent.homeHeroImages?.length ? pageContent.homeHeroImages : [pageContent.homeHeroImage]}
          onFooterVisibilityChange={setIsHeaderHidden}
        />
      ) : page === "products" ? (
        <ProductShopWindow
          isOpen
          isPage
          products={searchedProducts}
          cartCount={cartCount}
          storeOperations={storeOperations}
          categoryTarget={shopCategoryTarget}
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
        <SupportPage storeOperations={storeOperations} />
      ) : page === "seller" ? (
        <SellerPage storeOperations={storeOperations} />
      ) : (
        <AdminPage
          cartCount={cartCount}
          onSearchChange={setSearchQuery}
          onNavigate={navigate}
          onOpenAbout={openAboutPanel}
          onOpenShop={openShopWindow}
          onOpenCart={openCartDrawer}
        />
      )}

      {page !== "admin" && page !== "about" && page !== "products" && page !== "cart" && page !== "checkout" ? (
        <FooterSection showWelcome={page === "home"} showProductRequest={true} onNavigate={navigate} />
      ) : null}

      {page !== "admin" && page !== "about" && page !== "products" ? (
        <LiveChatWidget />
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
        onViewCart={() => navigate("cart")}
      />

      <ProductShopWindow
        isOpen={isShopWindowOpen}
        products={products}
        cartCount={cartCount}
        storeOperations={storeOperations}
        categoryTarget={shopCategoryTarget}
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
        aboutContent={aboutContent}
        heroImages={pageContent.homeHeroImages?.length ? pageContent.homeHeroImages : [pageContent.homeHeroImage]}
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
