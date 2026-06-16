import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { ProductPage, type ProductSelection } from "./components/ProductPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { SupportPage } from "./components/SupportPage";
import { AdminPage } from "./components/AdminPage";
import { FooterSection } from "./components/FooterSection";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { CustomerAccountModal } from "./components/CustomerAccountModal";
import { fetchProducts, recordProductInterest, type CustomerAccount, type PageContentSettings, type StoreOperationSettings } from "./lib/api";
import type { Product } from "./types/product";

type Page = "home" | "products" | "cart" | "checkout" | "support" | "admin";

type CartItem = {
  cartKey: string;
  productId: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
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

  if (normalizedPath === "/products") return "products";
  if (normalizedPath === "/cart") return "cart";
  if (normalizedPath === "/checkout") return "checkout";
  if (normalizedPath === "/support") return "support";
  if (normalizedPath === "/admin") return "admin";
  return "home";
}

function MobileBottomNav({
  currentPage,
  onNavigate,
  onSearchChange,
  onOpenAccount,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSearchChange: (query: string) => void;
  onOpenAccount: () => void;
}) {
  const openCategory = (category: string) => {
    if (category === "Categories") {
      onSearchChange("");
    } else {
      onSearchChange(category);
    }

    onNavigate("products");
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
      <button className={currentPage === "cart" ? "active" : ""} type="button" onClick={() => onNavigate("cart")}>
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

  useEffect(() => {
    const syncPageFromLocation = () => {
      setPage(getPageFromPathname(window.location.pathname));
    };

    syncPageFromLocation();
    window.addEventListener("popstate", syncPageFromLocation);
    return () => window.removeEventListener("popstate", syncPageFromLocation);
  }, []);

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

  const navigate = (nextPage: Page) => {
    const nextPath =
      nextPage === "home"
        ? "/"
        : nextPage === "products"
          ? "/products"
          : nextPage === "cart"
            ? "/cart"
            : nextPage === "checkout"
              ? "/checkout"
              : nextPage === "support"
                ? "/support"
                : "/admin";

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
    <div className="app-shell">
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />

      <Header
        currentPage={page}
        cartCount={cartCount}
        customerName={customerAccount?.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={navigate}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />
      {page !== "admin" ? (
        <MobileBottomNav
          currentPage={page}
          onNavigate={navigate}
          onSearchChange={setSearchQuery}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
      ) : null}

      {page === "home" ? (
        <HomePage
          products={products}
          flashSaleSettings={flashSaleSettings}
          pageContent={pageContent}
          storeOperations={storeOperations}
          onBrowseProducts={() => navigate("products")}
          onOpenProduct={openProductFromHome}
        />
      ) : page === "products" ? (
        <ProductPage
          products={searchedProducts}
          searchQuery={searchQuery}
          storeOperations={storeOperations}
          productToOpen={productToOpen}
          onProductOpened={() => setProductToOpen(null)}
          onClearSearch={() => setSearchQuery("")}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
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
          onContinueShopping={() => navigate("products")}
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

      {page !== "admin" ? (
        <>
          <FooterSection showWelcome={page === "home"} showProductRequest={page === "home"} onNavigateSupport={() => navigate("support")} />
          <LiveChatWidget />
        </>
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
