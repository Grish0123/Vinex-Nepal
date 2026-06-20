import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  adminLogin,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminDashboard,
  replyToLiveChat,
  updateAboutContentSettings,
  updateAdminProduct,
  updateFlashSaleSettings,
  updatePageContentSettings,
  updateOrderStatus,
  updateContactMessageStatus,
  updateProductRequestStatus,
  uploadAdminImage,
  type AdminDashboard,
  type AboutContentSettings,
  type OrderStatus,
  type PageContentSettings,
  type StoreOperationSettings,
  updateStoreOperationSettings,
} from "../../lib/api";
import type { Product } from "../../types/product";
import { Header } from "../../components/Header";
import styles from "./AdminPage.module.scss";

const adminTokenStorageKey = "vinex-nepal-admin-token";

type ProductForm = {
  name: string;
  category: string;
  image: string;
  hoverImage: string;
  galleryImages: string;
  colorOptions: string;
  sizeOptions: string;
  description: string;
  price: string;
  originalPrice: string;
  featured: boolean;
  inStock: boolean;
};

type AdminView =
  | "add-product"
  | "product-details"
  | "orders"
  | "analytics"
  | "customer-care"
  | "flash-time"
  | "page-editing"
  | "about-editing"
  | "store-setup"
  | "customers";
type PageEditingSection = "home" | "middle-hero" | "flash-window";
type OrderFilter = "all" | OrderStatus;
type AdminToast = {
  id: number;
  label: string;
  message: string;
  tone?: "success" | "error";
};
type FlashSaleForm = {
  enabled: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type AdminPageProps = {
  cartCount: number;
  onSearchChange: (query: string) => void;
  onNavigate: (page: "home" | "about" | "products" | "cart" | "checkout" | "support" | "admin") => void;
  onOpenAbout: () => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
};

const adminNavigationItems: Array<{
  view: AdminView;
  label: string;
  description: string;
}> = [
  { view: "analytics", label: "Analytics", description: "Revenue, sales, and performance reports" },
  { view: "add-product", label: "Add Product", description: "Create or edit product listings" },
  { view: "product-details", label: "Products", description: "Manage catalog, stock, and product records" },
  { view: "orders", label: "Orders", description: "Review orders and update fulfillment status" },
  { view: "customer-care", label: "Customer Care", description: "Product requests and live chat replies" },
  { view: "flash-time", label: "Flash Time", description: "Configure the storefront countdown timer" },
  { view: "page-editing", label: "Home CMS", description: "Edit homepage and promotional content" },
  { view: "about-editing", label: "About CMS", description: "Edit about page, team, gallery, and socials" },
  { view: "store-setup", label: "Store Setup", description: "Coupons, categories, delivery, and payment" },
  { view: "customers", label: "Customers", description: "Customer accounts, orders, and activity" },
];

function AdminNavIcon({ view }: { view: AdminView }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  if (view === "add-product") {
    return (
      <svg {...commonProps}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (view === "product-details") {
    return (
      <svg {...commonProps}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }

  if (view === "orders") {
    return (
      <svg {...commonProps}>
        <path d="M7 4h10l2 4v12H5V8z" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    );
  }

  if (view === "analytics") {
    return (
      <svg {...commonProps}>
        <path d="M5 19V9M12 19V5M19 19v-7" />
      </svg>
    );
  }

  if (view === "customer-care") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16v10H8l-4 4z" />
        <path d="M8 10h8M8 13h5" />
      </svg>
    );
  }

  if (view === "flash-time") {
    return (
      <svg {...commonProps}>
        <path d="M13 2 5 14h6l-1 8 9-13h-6z" />
      </svg>
    );
  }

  if (view === "page-editing") {
    return (
      <svg {...commonProps}>
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (view === "about-editing") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  if (view === "store-setup") {
    return (
      <svg {...commonProps}>
        <path d="M4 10h16l-1-5H5zM6 10v10h12V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

const initialProductForm: ProductForm = {
  name: "",
  category: "",
  image: "",
  hoverImage: "",
  galleryImages: "",
  colorOptions: "",
  sizeOptions: "",
  description: "",
  price: "",
  originalPrice: "",
  featured: true,
  inStock: true,
};

const initialPageContentForm: PageContentSettings = {
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
  flashProductIds: [1],
  flashDescription:
    "Limited-time Vinex picks with sharp pricing, clean utility, and fast local support.",
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
  sectionTitle: "Only two clean premium deals, front and center.",
  sectionText:
    "The storefront now focuses on a tighter, ad-driven experience with fast product discovery, visible discounts, and a hero area that keeps rotating between the airbuds and Apple Watch.",
};

const initialAboutContentForm: AboutContentSettings = {
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
  galleryText:
    "Join our community for new drops, behind-the-scenes updates, and product stories made for everyday Nepal.",
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

const initialStoreOperationForm: StoreOperationSettings = {
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

function formatPrice(value: number) {
  return `Rs ${value.toLocaleString()}`;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isSameMonth(firstDate: Date, secondDate: Date) {
  return firstDate.getFullYear() === secondDate.getFullYear() && firstDate.getMonth() === secondDate.getMonth();
}

function formatOrderStatus(status: OrderStatus) {
  if (status === "new") return "Pending";
  if (status === "processing") return "Processing";
  if (status === "shipped") return "Shipped";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

function getStoredAdminToken() {
  try {
    return window.localStorage.getItem(adminTokenStorageKey) ?? "";
  } catch {
    return "";
  }
}

function setStoredAdminToken(token: string) {
  try {
    window.localStorage.setItem(adminTokenStorageKey, token);
  } catch {
    // Ignore storage failures.
  }
}

function clearStoredAdminToken() {
  try {
    window.localStorage.removeItem(adminTokenStorageKey);
  } catch {
    // Ignore storage failures.
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

type ImageUrlFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  previewAlt: string;
  onChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

function ImageUrlField({ label, value, placeholder, previewAlt, onChange, onUpload }: ImageUrlFieldProps) {
  return (
    <div className="admin-image-field full-span">
      <label className="form-field">
        <span>{label}</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder ?? "Paste an image URL or upload from computer"} />
      </label>
      <label className="form-field">
        <span>Upload From Computer</span>
        <input type="file" accept="image/*" onChange={onUpload} />
      </label>
      {value ? (
        <div className="admin-upload-preview full-span">
          <img src={value} alt={previewAlt} className="admin-product-image preview" />
        </div>
      ) : null}
    </div>
  );
}

export function AdminPage({ cartCount, onSearchChange, onNavigate, onOpenAbout, onOpenShop, onOpenCart }: AdminPageProps) {
  const [token, setToken] = useState(getStoredAdminToken);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [adminView, setAdminView] = useState<AdminView>("analytics");
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [pageEditingSection, setPageEditingSection] = useState<PageEditingSection>("home");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(initialProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productMessage, setProductMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [adminToasts, setAdminToasts] = useState<AdminToast[]>([]);
  const [flashSaleMessage, setFlashSaleMessage] = useState("");
  const [pageContentMessage, setPageContentMessage] = useState("");
  const [aboutContentMessage, setAboutContentMessage] = useState("");
  const [storeSetupMessage, setStoreSetupMessage] = useState("");
  const [customerCareMessage, setCustomerCareMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isSavingFlashSale, setIsSavingFlashSale] = useState(false);
  const [isSavingPageContent, setIsSavingPageContent] = useState(false);
  const [isSavingAboutContent, setIsSavingAboutContent] = useState(false);
  const [isSavingStoreSetup, setIsSavingStoreSetup] = useState(false);
  const [isSendingChatReply, setIsSendingChatReply] = useState(false);
  const [pageContentForm, setPageContentForm] =
    useState<PageContentSettings>(initialPageContentForm);
  const [aboutContentForm, setAboutContentForm] =
    useState<AboutContentSettings>(initialAboutContentForm);
  const [storeOperationForm, setStoreOperationForm] =
    useState<StoreOperationSettings>(initialStoreOperationForm);
  const [flashSaleForm, setFlashSaleForm] = useState<FlashSaleForm>({
    enabled: true,
    days: "3",
    hours: "22",
    minutes: "35",
    seconds: "22",
  });

  const loadDashboard = async (nextToken: string) => {
    setIsLoadingDashboard(true);
    try {
      const result = await fetchAdminDashboard(nextToken);
      const flashSaleSettings = result.settings?.flashSale ?? {
        enabled: true,
        endsAt: null,
      };
      setDashboard(result);
      setPageContentForm({
        ...initialPageContentForm,
        ...(result.settings?.pageContent ?? {}),
      });
      setAboutContentForm({
        ...initialAboutContentForm,
        ...(result.settings?.aboutContent ?? {}),
      });
      setStoreOperationForm({
        ...initialStoreOperationForm,
        ...(result.settings?.operations ?? {}),
      });
      setSelectedOrderId((current) => current || result.orders[0]?.id || "");
      if (flashSaleSettings.enabled && flashSaleSettings.endsAt) {
        const totalSeconds = Math.max(
          0,
          Math.floor((new Date(flashSaleSettings.endsAt).getTime() - Date.now()) / 1000),
        );
        setFlashSaleForm({
          enabled: true,
          days: String(Math.floor(totalSeconds / (60 * 60 * 24))),
          hours: String(Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))),
          minutes: String(Math.floor((totalSeconds % (60 * 60)) / 60)),
          seconds: String(totalSeconds % 60),
        });
      } else {
        setFlashSaleForm({
          enabled: false,
          days: "0",
          hours: "0",
          minutes: "0",
          seconds: "0",
        });
      }
      setLoginMessage("");
    } catch (error) {
      setToken("");
      setDashboard(null);
      clearStoredAdminToken();
      setLoginMessage(error instanceof Error ? error.message : "Unable to load admin dashboard.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadDashboard(token);
    }
  }, [token]);

  const filteredOrders = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    if (orderFilter === "all") {
      return dashboard.orders;
    }

    return dashboard.orders.filter((order) => order.status === orderFilter);
  }, [dashboard, orderFilter]);

  const selectedOrder = useMemo(() => {
    if (!dashboard) return null;
    return (
      dashboard.orders.find((order) => order.id === selectedOrderId) ??
      filteredOrders[0] ??
      dashboard.orders[0] ??
      null
    );
  }, [dashboard, filteredOrders, selectedOrderId]);

  const topSellingProduct = dashboard?.topSelling[0] ?? null;
  const pendingOrderCount = dashboard?.orders.filter((order) => order.status === "new").length ?? 0;
  const newProductRequestCount = dashboard?.productRequests.filter((request) => request.status === "new").length ?? 0;
  const contactMessages = dashboard?.contactMessages ?? [];
  const newContactMessageCount = contactMessages.filter((message) => message.status === "new").length;
  const openChatCount = dashboard?.liveChats.filter((chat) => chat.status === "open").length ?? 0;
  const selectedChat = dashboard?.liveChats.find((chat) => chat.id === selectedChatId) ?? null;
  const analyticsReport = useMemo(() => {
    if (!dashboard) {
      return {
        monthlyRevenue: 0,
        todayRevenue: 0,
        monthlyOrders: 0,
        ordersToday: 0,
        monthlyItemsSold: 0,
        todayItemsSold: 0,
        allTimeItemsSold: 0,
        monthlyProductsSold: 0,
        allTimeProductsSold: 0,
        averageOrderValue: 0,
        monthlyAverageOrderValue: 0,
        completedOrders: 0,
        processingOrders: 0,
        cancelledOrders: 0,
        productReports: [],
      };
    }

    const now = new Date();
    const productReportMap = new Map<
      number,
      {
        id: number;
        name: string;
        category: string;
        monthlySold: number;
        allTimeSold: number;
        revenue: number;
        selected: number;
      }
    >();

    dashboard.products.forEach((product) => {
      productReportMap.set(product.id, {
        id: product.id,
        name: product.name,
        category: product.category,
        monthlySold: 0,
        allTimeSold: 0,
        revenue: 0,
        selected: product.interestCount,
      });
    });

    const report = dashboard.orders.reduce(
      (report, order) => {
        const orderDate = new Date(order.createdAt);
        const isOrderThisMonth = isSameMonth(orderDate, now);
        const isOrderToday = isSameDay(orderDate, now);
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

        report.allTimeItemsSold += itemCount;

        if (isOrderThisMonth) {
          report.monthlyRevenue += order.subtotal;
          report.monthlyOrders += 1;
          report.monthlyItemsSold += itemCount;
        }

        if (isOrderToday) {
          report.todayRevenue += order.subtotal;
          report.ordersToday += 1;
          report.todayItemsSold += itemCount;
        }

        if (order.status === "completed") {
          report.completedOrders += 1;
        }

        if (order.status === "processing") {
          report.processingOrders += 1;
        }

        if (order.status === "cancelled") {
          report.cancelledOrders += 1;
        }

        order.items.forEach((item) => {
          const productId = item.productId ?? 0;
          const existingReport =
            productReportMap.get(productId) ??
            {
              id: productId,
              name: item.name,
              category: item.category ?? "Unknown",
              monthlySold: 0,
              allTimeSold: 0,
              revenue: 0,
              selected: 0,
            };

          existingReport.allTimeSold += item.quantity;
          existingReport.revenue += item.total ?? 0;

          if (isOrderThisMonth) {
            existingReport.monthlySold += item.quantity;
          }

          productReportMap.set(productId, existingReport);
        });

        return report;
      },
      {
        monthlyRevenue: 0,
        todayRevenue: 0,
        monthlyOrders: 0,
        ordersToday: 0,
        monthlyItemsSold: 0,
        todayItemsSold: 0,
        allTimeItemsSold: 0,
        monthlyProductsSold: 0,
        allTimeProductsSold: 0,
        averageOrderValue: 0,
        monthlyAverageOrderValue: 0,
        completedOrders: 0,
        processingOrders: 0,
        cancelledOrders: 0,
        productReports: [] as Array<{
          id: number;
          name: string;
          category: string;
          monthlySold: number;
          allTimeSold: number;
          revenue: number;
          selected: number;
        }>,
      },
    );

    const productReports = Array.from(productReportMap.values()).sort((firstProduct, secondProduct) => {
      if (secondProduct.monthlySold !== firstProduct.monthlySold) {
        return secondProduct.monthlySold - firstProduct.monthlySold;
      }

      return secondProduct.allTimeSold - firstProduct.allTimeSold;
    });

    return {
      ...report,
      averageOrderValue:
        dashboard.overview.totalOrders > 0 ? Math.round(dashboard.overview.totalRevenue / dashboard.overview.totalOrders) : 0,
      monthlyAverageOrderValue: report.monthlyOrders > 0 ? Math.round(report.monthlyRevenue / report.monthlyOrders) : 0,
      monthlyProductsSold: productReports.filter((product) => product.monthlySold > 0).length,
      allTimeProductsSold: productReports.filter((product) => product.allTimeSold > 0).length,
      productReports,
    };
  }, [dashboard]);

  const customerReports = useMemo(() => {
    if (!dashboard) return [];

    const customerMap = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        orders: number;
        spent: number;
        latestOrder: string;
        provider: string;
        loginCount: number;
        createdAt: string;
      }
    >();

    (dashboard.customers ?? []).forEach((customer) => {
      customerMap.set(customer.email, {
        name: customer.name,
        email: customer.email,
        phone: "-",
        orders: 0,
        spent: 0,
        latestOrder: customer.lastLoginAt ?? customer.createdAt,
        provider: customer.provider,
        loginCount: customer.loginCount,
        createdAt: customer.createdAt,
      });
    });

    dashboard.orders.forEach((order) => {
      const email = order.customer.email || "No email";
      const existing = customerMap.get(email) ?? {
        name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        email,
        phone: order.customer.contactNumber,
        orders: 0,
        spent: 0,
        latestOrder: order.createdAt,
        provider: "checkout",
        loginCount: 0,
        createdAt: order.createdAt,
      };

      existing.name = existing.name || `${order.customer.firstName} ${order.customer.lastName}`.trim();
      existing.phone = existing.phone === "-" ? order.customer.contactNumber : existing.phone;
      existing.orders += 1;
      existing.spent += order.subtotal;
      if (new Date(order.createdAt).getTime() > new Date(existing.latestOrder).getTime()) {
        existing.latestOrder = order.createdAt;
      }
      customerMap.set(email, existing);
    });

    return Array.from(customerMap.values()).sort(
      (firstCustomer, secondCustomer) =>
        new Date(secondCustomer.latestOrder).getTime() - new Date(firstCustomer.latestOrder).getTime(),
    );
  }, [dashboard]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
  };

  const showAdminToast = (toast: Omit<AdminToast, "id">) => {
    const toastId = Date.now();
    setAdminToasts((current) => [...current, { ...toast, id: toastId }].slice(-4));
    window.setTimeout(() => {
      setAdminToasts((current) => current.filter((entry) => entry.id !== toastId));
    }, 2400);
  };

  const openAdminView = (nextView: AdminView) => {
    setProductMessage("");
    setOrderMessage("");
    setFlashSaleMessage("");
    setPageContentMessage("");
    setAboutContentMessage("");
    setStoreSetupMessage("");
    setCustomerCareMessage("");

    if (nextView === "add-product") {
      resetProductForm();
    }

    if (nextView === "page-editing") {
      setPageEditingSection("home");
    }

    setAdminView(nextView);
    setIsAdminMenuOpen(false);
  };

  const mapProductToForm = (product: Product): ProductForm => ({
    name: product.name,
    category: product.category,
    image: product.image,
    hoverImage: product.hoverImage ?? "",
    galleryImages: (product.galleryImages ?? []).join("\n"),
    colorOptions: (product.colorOptions ?? []).join("\n"),
    sizeOptions: (product.sizeOptions ?? []).join("\n"),
    description: product.description,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : "",
    featured: Boolean(product.featured),
    inStock: product.inStock !== false,
  });

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage("");

    try {
      const result = await adminLogin(loginUsername, loginPassword);
      setToken(result.token);
      setStoredAdminToken(result.token);
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const uploadSelectedAdminImage = async (
    event: ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void,
    onMessage: (message: string) => void,
    previousUrl: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!token) {
      onMessage("Log in again before uploading images.");
      return;
    }

    onMessage("Uploading image...");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUploaded(dataUrl);
      const result = await uploadAdminImage(token, { fileName: file.name, dataUrl });
      onUploaded(result.url);
      onMessage("Image uploaded successfully.");
    } catch (error) {
      onUploaded(previousUrl);
      onMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadSelectedAdminImage(
      event,
      (image) => setProductForm((current) => ({ ...current, image })),
      setProductMessage,
      productForm.image,
    );
  };

  const handleHoverImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadSelectedAdminImage(
      event,
      (hoverImage) => setProductForm((current) => ({ ...current, hoverImage })),
      setProductMessage,
      productForm.hoverImage,
    );
  };

  const handleGalleryImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    if (!token) {
      setProductMessage("Log in again before uploading images.");
      return;
    }

    setProductMessage("Uploading gallery images...");
    const previousGalleryImages = productForm.galleryImages;
    try {
      const dataUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      setProductForm((current) => ({ ...current, galleryImages: dataUrls.join("\n") }));

      const images = await Promise.all(
        files.map(async (file, index) => {
          const dataUrl = dataUrls[index];
          const result = await uploadAdminImage(token, { fileName: file.name, dataUrl });
          return result.url;
        }),
      );
      const nextImages = images.filter(Boolean);
      setProductForm((current) => ({ ...current, galleryImages: nextImages.join("\n") }));
      setProductMessage("Gallery images uploaded successfully.");
    } catch (error) {
      setProductForm((current) => ({ ...current, galleryImages: previousGalleryImages }));
      setProductMessage(error instanceof Error ? error.message : "Unable to upload gallery images.");
    } finally {
      event.target.value = "";
    }
  };

  const handlePageImageUpload =
    (field: "homeHeroImage" | "shopNowImage") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      void uploadSelectedAdminImage(
        event,
        (imageUrl) => setPageContentForm((current) => ({ ...current, [field]: imageUrl })),
        setPageContentMessage,
        pageContentForm[field],
      );
    };

  const updateHeroCarouselImage = (index: number, imageUrl: string) => {
    setPageContentForm((current) => {
      const nextImages = [...(current.homeHeroImages?.length ? current.homeHeroImages : [current.homeHeroImage])];
      nextImages[index] = imageUrl;
      return {
        ...current,
        homeHeroImage: index === 0 ? imageUrl : current.homeHeroImage,
        homeHeroImages: nextImages,
      };
    });
  };

  const handleHeroCarouselImageUpload =
    (index: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const currentImages = pageContentForm.homeHeroImages?.length
        ? pageContentForm.homeHeroImages
        : [pageContentForm.homeHeroImage];
      void uploadSelectedAdminImage(
        event,
        (imageUrl) => updateHeroCarouselImage(index, imageUrl),
        setPageContentMessage,
        currentImages[index] ?? "",
      );
    };

  const handleAboutImageUpload =
    (field: "galleryLogo") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      void uploadSelectedAdminImage(
        event,
        (imageUrl) => setAboutContentForm((current) => ({ ...current, [field]: imageUrl })),
        setAboutContentMessage,
        aboutContentForm[field],
      );
    };

  const handleAboutArrayImageUpload =
    (field: "storyImages" | "galleryImages", index: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      void uploadSelectedAdminImage(
        event,
        (imageUrl) =>
          setAboutContentForm((current) => {
            const nextImages = [...current[field]];
            nextImages[index] = imageUrl;
            return { ...current, [field]: nextImages };
          }),
        setAboutContentMessage,
        aboutContentForm[field][index] ?? "",
      );
    };

  const handleTeamImageUpload = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    void uploadSelectedAdminImage(
      event,
      (imageUrl) =>
        setAboutContentForm((current) => ({
          ...current,
          teamMembers: current.teamMembers.map((member, memberIndex) =>
            memberIndex === index ? { ...member, imageSrc: imageUrl } : member,
          ),
        })),
      setAboutContentMessage,
      aboutContentForm.teamMembers[index]?.imageSrc ?? "",
    );
  };

  const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSavingProduct(true);
    setProductMessage("");

    const payload = {
      name: productForm.name,
      category: productForm.category,
      image: productForm.image,
      hoverImage: productForm.hoverImage || undefined,
      galleryImages: productForm.galleryImages
        .split("\n")
        .map((image) => image.trim())
        .filter(Boolean),
      colorOptions: productForm.colorOptions
        .split("\n")
        .map((color) => color.trim())
        .filter(Boolean),
      sizeOptions: productForm.sizeOptions
        .split("\n")
        .map((size) => size.trim())
        .filter(Boolean),
      description: productForm.description,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      featured: productForm.featured,
      inStock: productForm.inStock,
    };

    try {
      if (editingProductId) {
        await updateAdminProduct(token, editingProductId, payload);
        setProductMessage("Product updated successfully.");
      } else {
        await createAdminProduct(token, payload);
        setProductMessage("Product added successfully.");
      }

      resetProductForm();
      await loadDashboard(token);
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!token) {
      return;
    }

    setProductMessage("");
    try {
      await deleteAdminProduct(token, productId);
      if (editingProductId === productId) {
        resetProductForm();
      }
      await loadDashboard(token);
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : "Unable to delete product.");
    }
  };

  const handleToggleProductStock = async (product: Product) => {
    if (!token) return;

    setProductMessage("");
    try {
      await updateAdminProduct(token, product.id, {
        name: product.name,
        category: product.category,
        image: product.image,
        hoverImage: product.hoverImage,
        galleryImages: product.galleryImages ?? [],
        colorOptions: product.colorOptions ?? [],
        sizeOptions: product.sizeOptions ?? [],
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        featured: product.featured,
        inStock: product.inStock === false,
      });
      await loadDashboard(token);
      setProductMessage(product.inStock === false ? "Product marked in stock." : "Product marked out of stock.");
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : "Unable to update stock.");
    }
  };

  const handleOrderStatusChange = async (
    status: OrderStatus,
  ) => {
    if (!token || !selectedOrder) {
      return;
    }

    setIsUpdatingOrder(true);
    setOrderMessage("");

    try {
      const nextDashboard = await updateOrderStatus(token, selectedOrder.id, status);
      setDashboard(nextDashboard);
      setSelectedOrderId(selectedOrder.id);
      const nextStatus = formatOrderStatus(status).toLowerCase();
      const message = `Order marked as ${nextStatus}.`;
      setOrderMessage(message);
      showAdminToast({
        label: "Order status updated",
        message,
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update order.";
      setOrderMessage(message);
      showAdminToast({
        label: "Order update failed",
        message,
        tone: "error",
      });
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setDashboard(null);
    setAdminView("analytics");
    setSelectedOrderId("");
    setLoginUsername("");
    setLoginPassword("");
    clearStoredAdminToken();
  };

  const handleSaveFlashSale = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSavingFlashSale(true);
    setFlashSaleMessage("");

    try {
      const totalSeconds =
        Number(flashSaleForm.days || 0) * 24 * 60 * 60 +
        Number(flashSaleForm.hours || 0) * 60 * 60 +
        Number(flashSaleForm.minutes || 0) * 60 +
        Number(flashSaleForm.seconds || 0);

      const endsAt =
        flashSaleForm.enabled && totalSeconds > 0
          ? new Date(Date.now() + totalSeconds * 1000).toISOString()
          : null;

      const nextDashboard = await updateFlashSaleSettings(token, {
        enabled: flashSaleForm.enabled && totalSeconds > 0,
        endsAt,
      });

      setDashboard(nextDashboard);
      setFlashSaleMessage("Flash sale time updated successfully.");
    } catch (error) {
      setFlashSaleMessage(error instanceof Error ? error.message : "Unable to update flash sale time.");
    } finally {
      setIsSavingFlashSale(false);
    }
  };

  const handleSavePageContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSavingPageContent(true);
    setPageContentMessage("");

    try {
      const homeHeroImages = (pageContentForm.homeHeroImages?.length
        ? pageContentForm.homeHeroImages
        : initialPageContentForm.homeHeroImages
      ).map((image) => image.trim()).filter(Boolean);
      const submittedPageContent = {
        ...pageContentForm,
        homeHeroImage: homeHeroImages[0] ?? pageContentForm.homeHeroImage,
        homeHeroImages,
        flashProductIds: pageContentForm.flashProductIds.map((productId) => Number(productId)).filter(Number.isFinite),
      };
      const nextDashboard = await updatePageContentSettings(token, submittedPageContent);
      const savedPageContent = nextDashboard.settings?.pageContent ?? {};
      setDashboard(nextDashboard);
      setPageContentForm({
        ...initialPageContentForm,
        ...submittedPageContent,
        ...savedPageContent,
        flashProductIds: Array.isArray(savedPageContent.flashProductIds)
          ? savedPageContent.flashProductIds
          : submittedPageContent.flashProductIds,
      });
      setPageContentMessage("Homepage writing updated successfully.");
    } catch (error) {
      setPageContentMessage(error instanceof Error ? error.message : "Unable to update homepage writing.");
    } finally {
      setIsSavingPageContent(false);
    }
  };

  const handleSaveAboutContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSavingAboutContent(true);
    setAboutContentMessage("");

    try {
      const nextDashboard = await updateAboutContentSettings(token, aboutContentForm);
      setDashboard(nextDashboard);
      setAboutContentForm({
        ...initialAboutContentForm,
        ...(nextDashboard.settings?.aboutContent ?? {}),
      });
      setAboutContentMessage("About page content updated successfully.");
    } catch (error) {
      setAboutContentMessage(error instanceof Error ? error.message : "Unable to update about page content.");
    } finally {
      setIsSavingAboutContent(false);
    }
  };

  const handleSaveStoreSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSavingStoreSetup(true);
    setStoreSetupMessage("");

    try {
      const nextDashboard = await updateStoreOperationSettings(token, storeOperationForm);
      setDashboard(nextDashboard);
      setStoreOperationForm({
        ...initialStoreOperationForm,
        ...(nextDashboard.settings?.operations ?? {}),
      });
      setStoreSetupMessage("Store setup updated successfully.");
    } catch (error) {
      setStoreSetupMessage(error instanceof Error ? error.message : "Unable to update store setup.");
    } finally {
      setIsSavingStoreSetup(false);
    }
  };

  const handleProductRequestStatus = async (requestId: string, status: string) => {
    if (!token) return;

    setCustomerCareMessage("");
    try {
      const nextDashboard = await updateProductRequestStatus(token, requestId, status);
      setDashboard(nextDashboard);
      setCustomerCareMessage("Product request updated.");
    } catch (error) {
      setCustomerCareMessage(error instanceof Error ? error.message : "Unable to update product request.");
    }
  };

  const handleContactMessageStatus = async (messageId: string, status: string) => {
    if (!token) return;

    setCustomerCareMessage("");
    try {
      const nextDashboard = await updateContactMessageStatus(token, messageId, status);
      setDashboard(nextDashboard);
      setCustomerCareMessage("Contact message updated.");
    } catch (error) {
      setCustomerCareMessage(error instanceof Error ? error.message : "Unable to update contact message.");
    }
  };

  const handleSendChatReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedChat || !chatReply.trim()) return;

    setIsSendingChatReply(true);
    setCustomerCareMessage("");

    try {
      const nextDashboard = await replyToLiveChat(token, selectedChat.id, chatReply);
      setDashboard(nextDashboard);
      setSelectedChatId(selectedChat.id);
      setChatReply("");
      setCustomerCareMessage("Reply sent to live chat.");
    } catch (error) {
      setCustomerCareMessage(error instanceof Error ? error.message : "Unable to send chat reply.");
    } finally {
      setIsSendingChatReply(false);
    }
  };

  if (!token) {
    return (
      <main className={`${styles.page} page-shell admin-login-shell`}>
        <Header
          currentPage="admin"
          cartCount={cartCount}
          searchQuery=""
          onSearchChange={onSearchChange}
          onNavigate={onNavigate}
          onOpenAbout={onOpenAbout}
          onOpenShop={onOpenShop}
          onOpenCart={onOpenCart}
          onOpenAccount={() => undefined}
        />

        <div className="admin-login-center">
          <section className="admin-login-card">
            <span className="section-tag">Admin Access</span>
            <h2>Private admin panel</h2>
            <p>Only your admin login can enter here and manage products, orders, and store data.</p>

            <form className="admin-login-form" onSubmit={handleLogin}>
              <label className="form-field">
                <span>Username</span>
                <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} />
              </label>
              <label className="form-field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </label>

              {loginMessage ? <div className="form-status form-status-error">{loginMessage}</div> : null}

              <button type="submit" className="primary-button" disabled={isLoggingIn}>
                {isLoggingIn ? "Checking..." : "Enter Admin Panel"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  if (isLoadingDashboard || !dashboard) {
    return (
      <main className={`${styles.page} page-shell admin-shell`}>
        <section className="page-intro">
          <span className="section-tag">Admin Dashboard</span>
          <h2>Loading admin data...</h2>
        </section>
      </main>
    );
  }

  const activeNavigationItem = adminNavigationItems.find((item) => item.view === adminView) ?? adminNavigationItems[0];
  const careBadgeCount = newProductRequestCount + newContactMessageCount + openChatCount;

  return (
    <main className={`${styles.page} page-shell admin-shell`}>
      <button
        className={isAdminMenuOpen ? "admin-menu-scrim open" : "admin-menu-scrim"}
        type="button"
        onClick={() => setIsAdminMenuOpen(false)}
        aria-label="Close admin menu"
        tabIndex={isAdminMenuOpen ? 0 : -1}
      />

      <aside className={isAdminMenuOpen ? "admin-sidebar open" : "admin-sidebar"} aria-label="Admin CMS navigation">
        <div className="admin-sidebar-brand" title="Vinex Nepal Admin" data-tooltip="Vinex Nepal Admin">
          <span aria-hidden="true">
            <img src="/images/brand/VinexLogo.png" alt="" />
          </span>
          <strong>Vinex Nepal</strong>
        </div>

        <div className="admin-sidebar-profile" title="Signed in as admin" data-tooltip="Signed in as admin">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </span>
          <div>
            <strong>Admin</strong>
            <small>CMS Control</small>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          {adminNavigationItems.map((item) => {
            const badgeCount = item.view === "customer-care" ? careBadgeCount : 0;

            return (
              <button
                type="button"
                className={adminView === item.view ? "admin-sidebar-link active" : "admin-sidebar-link"}
                onClick={() => openAdminView(item.view)}
                title={item.description}
                data-tooltip={item.description}
                key={item.view}
              >
                <span className="admin-sidebar-icon">
                  <AdminNavIcon view={item.view} />
                </span>
                <span className="admin-sidebar-copy">
                  <strong>{item.label}</strong>
                </span>
                {badgeCount > 0 ? <em>{badgeCount}</em> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="admin-header-card">
        <button
          className="admin-mobile-menu-button"
          type="button"
          onClick={() => setIsAdminMenuOpen((current) => !current)}
          aria-expanded={isAdminMenuOpen}
          aria-label={isAdminMenuOpen ? "Close admin menu" : "Open admin menu"}
        >
          <span />
          <span />
          <span />
        </button>
        <div>
          <h2>{activeNavigationItem.label}</h2>
        </div>
        <button className="ghost-button admin-logout-button" onClick={handleLogout} title="End the admin session">
          Log Out
        </button>
      </section>

      {adminToasts.length > 0 ? (
        <div className="admin-toast-stack" role="status" aria-live="polite">
          {adminToasts.map((toast) => (
            <div className={toast.tone === "error" ? "admin-toast error" : "admin-toast"} key={toast.id}>
              <span>{toast.label}</span>
              <strong>{toast.message}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {adminView === "add-product" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Add Product</span>
          </div>

          <h3>{editingProductId ? "Edit product" : "Add new product"}</h3>

          <form className="admin-product-form" onSubmit={handleSaveProduct}>
            <label className="form-field">
              <span>Product Name</span>
              <input
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Category</span>
              <input
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              />
            </label>
            <ImageUrlField
              label="Display Image URL"
              value={productForm.image}
              previewAlt="Display preview"
              onChange={(image) => setProductForm((current) => ({ ...current, image }))}
              onUpload={handleImageUpload}
            />
            <ImageUrlField
              label="Hover Image URL"
              value={productForm.hoverImage}
              previewAlt="Hover preview"
              placeholder="Second image shown when a customer points at the product"
              onChange={(hoverImage) => setProductForm((current) => ({ ...current, hoverImage }))}
              onUpload={handleHoverImageUpload}
            />
            <label className="form-field full-span">
              <span>Gallery Images</span>
              <input type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} />
            </label>
            <label className="form-field full-span">
              <span>Gallery Image URLs</span>
              <textarea
                rows={4}
                value={productForm.galleryImages}
                onChange={(event) => setProductForm({ ...productForm, galleryImages: event.target.value })}
                placeholder="One image URL per line. These appear in the product detail slider."
              />
            </label>
            {productForm.galleryImages ? (
              <div className="admin-gallery-preview full-span">
                {productForm.galleryImages
                  .split("\n")
                  .map((image) => image.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((image) => (
                    <img src={image} alt="Gallery preview" className="admin-product-image preview" key={image} />
                  ))}
              </div>
            ) : null}
            <label className="form-field">
              <span>Color Options</span>
              <textarea
                rows={4}
                value={productForm.colorOptions}
                onChange={(event) => setProductForm({ ...productForm, colorOptions: event.target.value })}
                placeholder="One color per line, for example Black, White, Pink"
              />
            </label>
            <label className="form-field">
              <span>Size Options</span>
              <textarea
                rows={4}
                value={productForm.sizeOptions}
                onChange={(event) => setProductForm({ ...productForm, sizeOptions: event.target.value })}
                placeholder="One size per line, for example S, M, L, free size, 45mm"
              />
            </label>
            <label className="form-field full-span">
              <span>Description</span>
              <textarea
                rows={4}
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Selling Price</span>
              <input
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Original Price</span>
              <input
                type="number"
                value={productForm.originalPrice}
                onChange={(event) => setProductForm({ ...productForm, originalPrice: event.target.value })}
              />
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })}
              />
              <span>Mark as featured deal</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={productForm.inStock}
                onChange={(event) => setProductForm({ ...productForm, inStock: event.target.checked })}
              />
              <span>Product is in stock</span>
            </label>

            {productMessage ? <div className="form-status">{productMessage}</div> : null}

            <div className="checkout-actions full-span">
              <button type="submit" className="primary-button" disabled={isSavingProduct}>
                {isSavingProduct ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
              </button>
            </div>

          </form>
        </section>
      ) : null}

      {adminView === "product-details" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Product Details</span>
          </div>

          <h3>All products</h3>

          {topSellingProduct ? (
            <div className="admin-highlight-card">
              <strong>Highest Sold Product</strong>
              <span>
                {topSellingProduct.name} - {topSellingProduct.soldCount} item(s) sold
              </span>
            </div>
          ) : null}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Options</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Selected</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {(product.colorOptions?.length ?? 0) > 0 ? `${product.colorOptions?.length} color(s)` : "No colors"}
                      {" / "}
                      {(product.sizeOptions?.length ?? 0) > 0 ? `${product.sizeOptions?.length} size(s)` : "No sizes"}
                    </td>
                    <td>{product.inStock === false ? "Out" : "In"}</td>
                    <td>{product.soldCount}</td>
                    <td>{product.interestCount}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            setEditingProductId(product.id);
                            setProductForm(mapProductToForm(product));
                            setAdminView("add-product");
                          }}
                        >
                          Edit
                        </button>
                        <button className="ghost-button" onClick={() => handleToggleProductStock(product)}>
                          {product.inStock === false ? "Mark In Stock" : "Mark Out"}
                        </button>
                        <button className="remove-link" onClick={() => handleDeleteProduct(product.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      ) : null}

      {adminView === "orders" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Orders</span>
          </div>

          <div className="admin-order-filter-row">
            <button
              className={orderFilter === "all" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("all")}
            >
              All Orders
            </button>
            <button
              className={orderFilter === "new" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("new")}
            >
              Pending Orders
            </button>
            <button
              className={orderFilter === "processing" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("processing")}
            >
              Processing
            </button>
            <button
              className={orderFilter === "shipped" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("shipped")}
            >
              Shipped
            </button>
            <button
              className={orderFilter === "completed" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("completed")}
            >
              Completed
            </button>
            <button
              className={orderFilter === "cancelled" ? "nav-button active" : "nav-button"}
              onClick={() => setOrderFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>

          <section className="admin-layout admin-orders-layout">
            <div className="admin-panel-card nested-card admin-order-list-panel">
              <h3>Order list</h3>
              <div className="admin-order-list">
                {filteredOrders.length === 0 ? (
                  <p>No orders found in this section.</p>
                ) : (
                  filteredOrders.map((order, index) => (
                    <button
                      key={order.id}
                      className={selectedOrder?.id === order.id ? "admin-order-card active" : "admin-order-card"}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="admin-order-card-top">
                        <strong>{order.orderNumber}</strong>
                        <span className={`order-status-pill status-${order.status}`}>
                          {formatOrderStatus(order.status)}
                        </span>
                      </div>
                      <span>
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                      <small>Ordered at: {new Date(order.createdAt).toLocaleString()}</small>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="admin-panel-card nested-card admin-order-details-panel">
              <h3>Order details</h3>
              {selectedOrder ? (
                <>
                  <div className="admin-mini-list">
                    <div className="summary-row">
                      <span>Order Number</span>
                      <strong>{selectedOrder.orderNumber}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Customer</span>
                      <strong>
                        {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                      </strong>
                    </div>
                    <div className="summary-row">
                      <span>Email</span>
                      <strong>{selectedOrder.customer.email}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Phone</span>
                      <strong>{selectedOrder.customer.contactNumber}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Ordered At</span>
                      <strong>{new Date(selectedOrder.createdAt).toLocaleString()}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Status</span>
                      <strong>{formatOrderStatus(selectedOrder.status)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <strong>{formatPrice(selectedOrder.subtotal)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Discount</span>
                      <strong>-{formatPrice(selectedOrder.discount ?? 0)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Delivery</span>
                      <strong>{formatPrice(selectedOrder.deliveryCharge ?? 0)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Total</span>
                      <strong>{formatPrice(selectedOrder.total ?? selectedOrder.subtotal)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Payment</span>
                      <strong>{selectedOrder.paymentMethod ?? "Cash on Delivery"}</strong>
                    </div>
                  </div>

                  <div className="admin-order-items">
                    {selectedOrder.items.map((item, index) => (
                      <div className="summary-row" key={`${selectedOrder.id}-${index}`}>
                        <span>
                          {item.name} x {item.quantity}
                          {item.selectedColor ? ` / ${item.selectedColor}` : ""}
                          {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                        </span>
                        <strong>{formatPrice(item.total ?? 0)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-status-panel">
                    <div>
                      <span className="section-tag">Delivery Status</span>
                      <h4>Update order state</h4>
                    </div>
                    <div className="admin-status-actions">
                      <button
                        className="ghost-button"
                        onClick={() => handleOrderStatusChange("processing")}
                        disabled={isUpdatingOrder}
                        title="Mark order as processing"
                      >
                        Processing
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => handleOrderStatusChange("shipped")}
                        disabled={isUpdatingOrder}
                        title="Mark order as shipped"
                      >
                        Shipped
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => handleOrderStatusChange("completed")}
                        disabled={isUpdatingOrder}
                        title="Mark order as completed"
                      >
                        Complete Order
                      </button>
                      <button
                        className="remove-link"
                        onClick={() => handleOrderStatusChange("cancelled")}
                        disabled={isUpdatingOrder}
                        title="Mark order as cancelled"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p>Select an order from the left side to see its details.</p>
              )}
            </div>
          </section>

        </section>
      ) : null}

      {adminView === "analytics" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Analytics & Reports</span>
          </div>

          <h3>Sales report</h3>

          <section className="admin-report-grid" aria-label="Sales and revenue report">
            <article className="admin-report-card revenue-card">
              <span>Total Revenue (all-time)</span>
              <strong>{formatPrice(dashboard.overview.totalRevenue)}</strong>
            </article>
            <article className="admin-report-card">
              <span>Monthly Revenue</span>
              <strong>{formatPrice(analyticsReport.monthlyRevenue)}</strong>
            </article>
            <article className="admin-report-card">
              <span>Today's Revenue</span>
              <strong>{formatPrice(analyticsReport.todayRevenue)}</strong>
            </article>
            <article className="admin-report-card">
              <span>Total Orders</span>
              <strong>{dashboard.overview.totalOrders}</strong>
            </article>
            <article className="admin-report-card">
              <span>Orders Today</span>
              <strong>{analyticsReport.ordersToday}</strong>
            </article>
            <article className="admin-report-card">
              <span>Monthly Items Sold</span>
              <strong>{analyticsReport.monthlyItemsSold}</strong>
            </article>
            <article className="admin-report-card">
              <span>Today Items Sold</span>
              <strong>{analyticsReport.todayItemsSold}</strong>
            </article>
            <article className="admin-report-card">
              <span>All-Time Items Sold</span>
              <strong>{analyticsReport.allTimeItemsSold}</strong>
            </article>
            <article className="admin-report-card">
              <span>Monthly Products Sold</span>
              <strong>{analyticsReport.monthlyProductsSold}</strong>
            </article>
            <article className="admin-report-card">
              <span>All-Time Products Sold</span>
              <strong>{analyticsReport.allTimeProductsSold}</strong>
            </article>
          </section>

          <section className="admin-layout admin-care-layout">
            <div className="admin-panel-card nested-card admin-care-request-panel">
              <h3>Order health</h3>
              <div className="admin-mini-list">
                <div className="summary-row">
                  <span>Pending Orders</span>
                  <strong>{pendingOrderCount}</strong>
                </div>
                <div className="summary-row">
                  <span>Monthly Orders</span>
                  <strong>{analyticsReport.monthlyOrders}</strong>
                </div>
                <div className="summary-row">
                  <span>Processing Orders</span>
                  <strong>{analyticsReport.processingOrders}</strong>
                </div>
                <div className="summary-row">
                  <span>Completed Orders</span>
                  <strong>{analyticsReport.completedOrders}</strong>
                </div>
                <div className="summary-row">
                  <span>Cancelled Orders</span>
                  <strong>{analyticsReport.cancelledOrders}</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel-card nested-card admin-care-chat-panel">
              <h3>Top sales</h3>
              <div className="admin-mini-list">
                <div className="summary-row">
                  <span>Highest Sold Product</span>
                  <strong>{topSellingProduct ? topSellingProduct.name : "No sales yet"}</strong>
                </div>
                <div className="summary-row">
                  <span>Sold Units</span>
                  <strong>{topSellingProduct ? topSellingProduct.soldCount : 0}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Sold Units</span>
                  <strong>{dashboard.overview.totalSoldUnits}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Product Selections</span>
                  <strong>{dashboard.overview.totalInterest}</strong>
                </div>
                <div className="summary-row">
                  <span>Average Order Value</span>
                  <strong>{formatPrice(analyticsReport.averageOrderValue)}</strong>
                </div>
                <div className="summary-row">
                  <span>Monthly Average Order</span>
                  <strong>{formatPrice(analyticsReport.monthlyAverageOrderValue)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-panel-card nested-card admin-report-table-card">
            <div className="admin-panel-header">
              <div>
                <span className="section-tag">Product Breakdown</span>
                <h3>Monthly and all-time product sales</h3>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Monthly Sold</th>
                    <th>All-Time Sold</th>
                    <th>Revenue</th>
                    <th>Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsReport.productReports.map((product) => (
                    <tr key={product.id || product.name}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.monthlySold}</td>
                      <td>{product.allTimeSold}</td>
                      <td>{formatPrice(product.revenue)}</td>
                      <td>{product.selected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </section>
      ) : null}

      {adminView === "customer-care" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Customer Care</span>
          </div>

          <h3>Requests and live chat</h3>

          <section className="admin-layout admin-care-layout">
            <div className="admin-panel-card nested-card admin-care-request-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="section-tag">Product Requests</span>
                  <h3>{newProductRequestCount} new request(s)</h3>
                </div>
              </div>

              <div className="admin-care-list">
                {dashboard.productRequests.length === 0 ? (
                  <p>No product recommendations yet.</p>
                ) : (
                  dashboard.productRequests.map((request) => (
                    <article className="admin-care-card" key={request.id}>
                      <div className="admin-order-card-top">
                        <strong>{request.productName}</strong>
                        <span className="order-status-pill status-processing">{request.status}</span>
                      </div>
                      <span>{request.customerName}</span>
                      <small>{request.contact}</small>
                      {request.details ? <p>{request.details}</p> : null}
                      <small>Requested at: {new Date(request.createdAt).toLocaleString()}</small>
                      <div className="admin-status-actions">
                        <button
                          className="ghost-button"
                          onClick={() => handleProductRequestStatus(request.id, "reviewed")}
                        >
                          Mark Reviewed
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => handleProductRequestStatus(request.id, "sourcing")}
                        >
                          Mark Sourcing
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="admin-panel-card nested-card admin-care-contact-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="section-tag">Contact Messages</span>
                  <h3>{newContactMessageCount} new message(s)</h3>
                </div>
              </div>

              <div className="admin-care-list">
                {contactMessages.length === 0 ? (
                  <p>No contact form messages yet.</p>
                ) : (
                  contactMessages.map((message) => (
                    <article className="admin-care-card" key={message.id}>
                      <div className="admin-order-card-top">
                        <strong>{message.requestType}</strong>
                        <span className={`order-status-pill ${message.status === "new" ? "status-new" : "status-completed"}`}>
                          {message.status}
                        </span>
                      </div>
                      <span>{`${message.firstName} ${message.lastName}`.trim()}</span>
                      <small>{message.email}</small>
                      {message.phone ? <small>{message.phone}</small> : null}
                      <small>{message.title} / {message.language}</small>
                      {message.message ? <p>{message.message}</p> : null}
                      <small>Submitted at: {new Date(message.createdAt).toLocaleString()}</small>
                      <div className="admin-status-actions">
                        <button
                          className="ghost-button"
                          onClick={() => handleContactMessageStatus(message.id, "reviewed")}
                        >
                          Mark Reviewed
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => handleContactMessageStatus(message.id, "handled")}
                        >
                          Mark Handled
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="admin-panel-card nested-card admin-care-chat-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="section-tag">Live Chat</span>
                  <h3>{openChatCount} open chat(s)</h3>
                </div>
              </div>

              <div className="admin-chat-layout">
                <div className="admin-care-list">
                  {dashboard.liveChats.length === 0 ? (
                    <p>No live chat messages yet.</p>
                  ) : (
                    dashboard.liveChats.map((chat) => (
                      <button
                        className={selectedChat?.id === chat.id ? "admin-order-card active" : "admin-order-card"}
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                      >
                        <div className="admin-order-card-top">
                          <strong>{chat.customerName}</strong>
                          <span className={`order-status-pill ${chat.status === "open" ? "status-new" : "status-completed"}`}>
                            {chat.status === "open" ? "New" : "Answered"}
                          </span>
                        </div>
                        <small>{chat.contact}</small>
                        <small>{chat.messages[chat.messages.length - 1]?.text ?? "No message"}</small>
                        <small>{new Date(chat.createdAt).toLocaleString()}</small>
                      </button>
                    ))
                  )}
                </div>

                {selectedChat ? (
                  <form className="admin-chat-detail" onSubmit={handleSendChatReply}>
                    <div className="admin-chat-thread">
                      {selectedChat.messages.map((message) => (
                        <div
                          className={
                            message.sender === "admin"
                              ? "chat-bubble chat-bubble-admin"
                              : "chat-bubble"
                          }
                          key={message.id}
                        >
                          <span>{message.sender === "admin" ? "Admin" : selectedChat.customerName}</span>
                          <p>{message.text}</p>
                        </div>
                      ))}
                    </div>

                    <label className="form-field">
                      <span>Reply</span>
                      <textarea
                        rows={3}
                        value={chatReply}
                        onChange={(event) => setChatReply(event.target.value)}
                      />
                    </label>
                    <button className="primary-button" type="submit" disabled={isSendingChatReply}>
                      {isSendingChatReply ? "Sending..." : "Send Reply"}
                    </button>
                  </form>
                ) : (
                  <div className="admin-chat-empty">
                    <span className="section-tag">Select Chat</span>
                    <p>Choose a customer name from the list to open their messages and reply.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {customerCareMessage ? <div className="form-status">{customerCareMessage}</div> : null}

        </section>
      ) : null}

      {adminView === "flash-time" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Flash Time</span>
          </div>

          <h3>Manage countdown timer</h3>

          <form className="admin-product-form" onSubmit={handleSaveFlashSale}>
            <label className="admin-checkbox full-span">
              <input
                type="checkbox"
                checked={flashSaleForm.enabled}
                onChange={(event) =>
                  setFlashSaleForm((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
              />
              <span>Show flash sale countdown on homepage</span>
            </label>

            <label className="form-field">
              <span>Days</span>
              <input
                type="number"
                min="0"
                value={flashSaleForm.days}
                onChange={(event) =>
                  setFlashSaleForm((current) => ({ ...current, days: event.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Hours</span>
              <input
                type="number"
                min="0"
                value={flashSaleForm.hours}
                onChange={(event) =>
                  setFlashSaleForm((current) => ({ ...current, hours: event.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Minutes</span>
              <input
                type="number"
                min="0"
                value={flashSaleForm.minutes}
                onChange={(event) =>
                  setFlashSaleForm((current) => ({ ...current, minutes: event.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Seconds</span>
              <input
                type="number"
                min="0"
                value={flashSaleForm.seconds}
                onChange={(event) =>
                  setFlashSaleForm((current) => ({ ...current, seconds: event.target.value }))
                }
              />
            </label>

            {flashSaleMessage ? <div className="form-status">{flashSaleMessage}</div> : null}

            <div className="checkout-actions full-span">
              <button type="submit" className="primary-button" disabled={isSavingFlashSale}>
                {isSavingFlashSale ? "Saving..." : "Update Time"}
              </button>
            </div>

          </form>
        </section>
      ) : null}

      {adminView === "store-setup" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Store Setup</span>
          </div>

          <h3>Store settings</h3>

          <form className="admin-product-form" onSubmit={handleSaveStoreSetup}>
            <label className="form-field full-span">
              <span>Categories</span>
              <textarea
                rows={4}
                value={storeOperationForm.categories.join("\n")}
                onChange={(event) =>
                  setStoreOperationForm((current) => ({
                    ...current,
                    categories: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean),
                  }))
                }
                placeholder="One category per line"
              />
            </label>

            <label className="form-field">
              <span>Delivery Charge</span>
              <input
                type="number"
                min="0"
                value={storeOperationForm.deliveryCharge}
                onChange={(event) =>
                  setStoreOperationForm((current) => ({
                    ...current,
                    deliveryCharge: Number(event.target.value || 0),
                  }))
                }
              />
            </label>

            <label className="form-field">
              <span>Payment Methods</span>
              <textarea
                rows={4}
                value={storeOperationForm.paymentMethods.join("\n")}
                onChange={(event) =>
                  setStoreOperationForm((current) => ({
                    ...current,
                    paymentMethods: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean),
                  }))
                }
                placeholder="Cash on Delivery, eSewa, Khalti"
              />
            </label>

            <label className="form-field full-span">
              <span>Coupons</span>
              <textarea
                rows={5}
                value={storeOperationForm.coupons
                  .map((coupon) => `${coupon.code}, ${coupon.discount}, ${coupon.enabled ? "on" : "off"}`)
                  .join("\n")}
                onChange={(event) =>
                  setStoreOperationForm((current) => ({
                    ...current,
                    coupons: event.target.value
                      .split("\n")
                      .map((line) => {
                        const [code = "", discount = "0", enabled = "on"] = line.split(",").map((value) => value.trim());
                        return {
                          code: code.toUpperCase(),
                          discount: Number(discount || 0),
                          enabled: enabled.toLowerCase() !== "off",
                        };
                      })
                      .filter((coupon) => coupon.code),
                  }))
                }
                placeholder="SAVE10, 10, on"
              />
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showCategorySection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showCategorySection: event.target.checked }))}
              />
              <span>Show category section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showBestProductsSection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showBestProductsSection: event.target.checked }))}
              />
              <span>Show best products section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showFeaturedSection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showFeaturedSection: event.target.checked }))}
              />
              <span>Show featured section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showBestSellersSection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showBestSellersSection: event.target.checked }))}
              />
              <span>Show best sellers section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showNewArrivalsSection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showNewArrivalsSection: event.target.checked }))}
              />
              <span>Show new arrivals section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showTrustSection}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showTrustSection: event.target.checked }))}
              />
              <span>Show trust section on home</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showRelatedProducts}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showRelatedProducts: event.target.checked }))}
              />
              <span>Show related products in product detail</span>
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={storeOperationForm.showProductPageIntro}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, showProductPageIntro: event.target.checked }))}
              />
              <span>Show product page intro box</span>
            </label>

            {[
              ["homeCategoryTitle", "Home Category Title"],
              ["homeBestProductsTitle", "Home Best Products Title"],
              ["homeFeaturedTitle", "Home Featured Title"],
              ["homeBestSellersTitle", "Home Best Sellers Title"],
              ["homeNewArrivalsTitle", "Home New Arrivals Title"],
              ["homeTrustTitle", "Home Trust Title"],
              ["productPageTag", "Product Page Tag"],
              ["productPageTitle", "Product Page Title"],
              ["relatedProductsTitle", "Related Products Title"],
            ].map(([field, label]) => (
              <label className="form-field" key={field}>
                <span>{label}</span>
                <input
                  value={String(storeOperationForm[field as keyof StoreOperationSettings] ?? "")}
                  onChange={(event) =>
                    setStoreOperationForm((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}

            <label className="form-field full-span">
              <span>Product Page Text</span>
              <textarea
                rows={3}
                value={storeOperationForm.productPageText}
                onChange={(event) => setStoreOperationForm((current) => ({ ...current, productPageText: event.target.value }))}
              />
            </label>

            <div className="admin-promo-edit-card full-span">
              <div className="admin-panel-header full-span">
                <div>
                  <span className="section-tag">Support Page</span>
                  <h3>Contact page content</h3>
                </div>
              </div>
              {[
                ["supportPageTag", "Support Page Tag"],
                ["supportPageTitle", "Support Page Title"],
                ["supportContactTitle", "Contact Card Title"],
                ["supportPhone", "Phone Number"],
                ["supportWhatsappUrl", "WhatsApp URL"],
                ["supportInstagramUrl", "Instagram URL"],
                ["supportInstagramLabel", "Instagram Label"],
                ["supportTiktokUrl", "TikTok URL"],
                ["supportTiktokLabel", "TikTok Label"],
                ["supportHoursTag", "Support Hours Tag"],
                ["supportHoursTitle", "Support Hours Title"],
              ].map(([field, label]) => (
                <label className="form-field" key={field}>
                  <span>{label}</span>
                  <input
                    value={String(storeOperationForm[field as keyof StoreOperationSettings] ?? "")}
                    onChange={(event) =>
                      setStoreOperationForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
              <label className="form-field full-span">
                <span>Support Page Text</span>
                <textarea
                  rows={3}
                  value={storeOperationForm.supportPageText}
                  onChange={(event) => setStoreOperationForm((current) => ({ ...current, supportPageText: event.target.value }))}
                />
              </label>
              <label className="form-field full-span">
                <span>Contact Card Text</span>
                <textarea
                  rows={3}
                  value={storeOperationForm.supportContactText}
                  onChange={(event) => setStoreOperationForm((current) => ({ ...current, supportContactText: event.target.value }))}
                />
              </label>
              <label className="form-field full-span">
                <span>Support Hours Text</span>
                <textarea
                  rows={3}
                  value={storeOperationForm.supportHoursText}
                  onChange={(event) => setStoreOperationForm((current) => ({ ...current, supportHoursText: event.target.value }))}
                />
              </label>
            </div>

            {storeSetupMessage ? <div className="form-status">{storeSetupMessage}</div> : null}

            <div className="checkout-actions full-span">
              <button type="submit" className="primary-button" disabled={isSavingStoreSetup}>
                {isSavingStoreSetup ? "Saving..." : "Save Store Setup"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {adminView === "about-editing" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">About Page Editing</span>
          </div>

          <h3>About page content</h3>

          <form className="admin-product-form" onSubmit={handleSaveAboutContent}>
            <label className="form-field">
              <span>Hero Meta Left</span>
              <input
                value={aboutContentForm.heroMetaLeft}
                onChange={(event) => setAboutContentForm((current) => ({ ...current, heroMetaLeft: event.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>Hero Meta Right</span>
              <input
                value={aboutContentForm.heroMetaRight}
                onChange={(event) => setAboutContentForm((current) => ({ ...current, heroMetaRight: event.target.value }))}
              />
            </label>
            <label className="form-field full-span">
              <span>Hero Heading</span>
              <textarea
                rows={4}
                value={aboutContentForm.heroTitle}
                onChange={(event) => setAboutContentForm((current) => ({ ...current, heroTitle: event.target.value }))}
              />
            </label>
            <div className="admin-promo-edit-card full-span">
              <div className="admin-panel-header full-span">
                <div>
                  <span className="section-tag">Story Images</span>
                  <h3>About story photos</h3>
                </div>
              </div>
              {Array.from({ length: Math.max(3, aboutContentForm.storyImages.length) }).map((_, imageIndex) => (
                <ImageUrlField
                  key={`story-image-${imageIndex}`}
                  label={`Story Image ${imageIndex + 1} URL`}
                  value={aboutContentForm.storyImages[imageIndex] ?? ""}
                  previewAlt={`Story image ${imageIndex + 1} preview`}
                  onChange={(image) =>
                    setAboutContentForm((current) => {
                      const storyImages = [...current.storyImages];
                      storyImages[imageIndex] = image;
                      return { ...current, storyImages };
                    })
                  }
                  onUpload={handleAboutArrayImageUpload("storyImages", imageIndex)}
                />
              ))}
            </div>

            {aboutContentForm.teamMembers.map((member, index) => (
              <div className="admin-promo-edit-card full-span" key={`team-member-${index}`}>
                <div className="admin-panel-header full-span">
                  <div>
                    <span className="section-tag">Team Member {index + 1}</span>
                    <h3>{member.name || "Team member"}</h3>
                  </div>
                </div>
                <label className="form-field">
                  <span>Name</span>
                  <input
                    value={member.name}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        teamMembers: current.teamMembers.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, name: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Titles</span>
                  <textarea
                    rows={3}
                    value={member.titles.join("\n")}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        teamMembers: current.teamMembers.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, titles: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) }
                            : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label className="form-field full-span">
                  <span>Message</span>
                  <textarea
                    rows={3}
                    value={member.message}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        teamMembers: current.teamMembers.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, message: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Image Label</span>
                  <input
                    value={member.imageLabel}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        teamMembers: current.teamMembers.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, imageLabel: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <ImageUrlField
                  label="Image URL"
                  value={member.imageSrc}
                  previewAlt={`${member.name || "Team member"} preview`}
                  onChange={(imageSrc) =>
                    setAboutContentForm((current) => ({
                      ...current,
                      teamMembers: current.teamMembers.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, imageSrc } : entry,
                      ),
                    }))
                  }
                  onUpload={handleTeamImageUpload(index)}
                />
              </div>
            ))}

            <label className="form-field full-span">
              <span>Story Headline</span>
              <textarea
                rows={4}
                value={aboutContentForm.storyHeadline}
                onChange={(event) => setAboutContentForm((current) => ({ ...current, storyHeadline: event.target.value }))}
              />
            </label>
            <label className="form-field full-span">
              <span>Story Paragraphs</span>
              <textarea
                rows={8}
                value={aboutContentForm.storyParagraphs.join("\n\n")}
                onChange={(event) =>
                  setAboutContentForm((current) => ({
                    ...current,
                    storyParagraphs: event.target.value.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean),
                  }))
                }
                placeholder="Separate paragraphs with a blank line"
              />
            </label>
            <ImageUrlField
              label="Gallery Logo URL"
              value={aboutContentForm.galleryLogo}
              previewAlt="Gallery logo preview"
              onChange={(galleryLogo) => setAboutContentForm((current) => ({ ...current, galleryLogo }))}
              onUpload={handleAboutImageUpload("galleryLogo")}
            />
            <label className="form-field full-span">
              <span>Gallery Text</span>
              <textarea
                rows={3}
                value={aboutContentForm.galleryText}
                onChange={(event) => setAboutContentForm((current) => ({ ...current, galleryText: event.target.value }))}
              />
            </label>
            <div className="admin-promo-edit-card full-span">
              <div className="admin-panel-header full-span">
                <div>
                  <span className="section-tag">Gallery Images</span>
                  <h3>Social gallery photos</h3>
                </div>
              </div>
              {Array.from({ length: Math.max(4, aboutContentForm.galleryImages.length) }).map((_, imageIndex) => (
                <ImageUrlField
                  key={`gallery-image-${imageIndex}`}
                  label={`Gallery Image ${imageIndex + 1} URL`}
                  value={aboutContentForm.galleryImages[imageIndex] ?? ""}
                  previewAlt={`Gallery image ${imageIndex + 1} preview`}
                  onChange={(image) =>
                    setAboutContentForm((current) => {
                      const galleryImages = [...current.galleryImages];
                      galleryImages[imageIndex] = image;
                      return { ...current, galleryImages };
                    })
                  }
                  onUpload={handleAboutArrayImageUpload("galleryImages", imageIndex)}
                />
              ))}
            </div>
            <label className="form-field full-span">
              <span>Social Links</span>
              <textarea
                rows={4}
                value={aboutContentForm.socialLinks.map((link) => `${link.label}, ${link.url}`).join("\n")}
                onChange={(event) =>
                  setAboutContentForm((current) => ({
                    ...current,
                    socialLinks: event.target.value
                      .split("\n")
                      .map((line) => {
                        const [label = "", ...urlParts] = line.split(",");
                        return {
                          label: label.trim(),
                          url: urlParts.join(",").trim(),
                        };
                      })
                      .filter((link) => link.label && link.url),
                  }))
                }
                placeholder="Instagram, https://www.instagram.com/vinexnepal/"
              />
            </label>

            {aboutContentMessage ? <div className="form-status">{aboutContentMessage}</div> : null}

            <div className="checkout-actions full-span">
              <button type="submit" className="primary-button" disabled={isSavingAboutContent}>
                {isSavingAboutContent ? "Saving..." : "Save About Page"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {adminView === "customers" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Customers</span>
          </div>

          <h3>Customer list</h3>

          <section className="admin-metric-grid compact-metric-grid" aria-label="Customer account stats">
            <article className="admin-metric-card">
              <span>Total Users</span>
              <strong>{dashboard.accountStats?.totalUsers ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Email Users</span>
              <strong>{dashboard.accountStats?.emailUsers ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Google Users</span>
              <strong>{dashboard.accountStats?.googleUsers ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Facebook Users</span>
              <strong>{dashboard.accountStats?.facebookUsers ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Total Logins</span>
              <strong>{dashboard.accountStats?.totalLogins ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Email Logins</span>
              <strong>{dashboard.accountStats?.emailLogins ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Google Logins</span>
              <strong>{dashboard.accountStats?.googleLogins ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Facebook Logins</span>
              <strong>{dashboard.accountStats?.facebookLogins ?? 0}</strong>
            </article>
          </section>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Logins</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Latest Activity</th>
                </tr>
              </thead>
              <tbody>
                {customerReports.map((customer) => (
                  <tr key={customer.email}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.provider}</td>
                    <td>{customer.loginCount}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.orders}</td>
                    <td>{formatPrice(customer.spent)}</td>
                    <td>{new Date(customer.latestOrder).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      ) : null}

      {adminView === "page-editing" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <span className="section-tag">Page Editing</span>
          </div>

          <h3>Homepage editing console</h3>

          <div className="admin-page-editor-layout">
            <div className="admin-page-editor-main">
              {pageEditingSection === "home" ? (
                <>
                  <div className="admin-panel-header">
                    <div>
                      <span className="section-tag">Home Page</span>
                      <h3>Choose what you want to edit</h3>
                    </div>
                  </div>

                  <div className="admin-section-grid page-editing-grid">
                    <button className="admin-section-card" onClick={() => setPageEditingSection("middle-hero")}>
                      <span className="section-tag">Home</span>
                      <h3>Main Home Sections</h3>
                      <p>Edit the main hero image, brand intro, collection title, and shop-now section.</p>
                    </button>
                    <button className="admin-section-card" onClick={() => setPageEditingSection("flash-window")}>
                      <span className="section-tag">Flash</span>
                      <h3>Flash Window</h3>
                      <p>Edit the flash tag, description, inactive text, and button label. Product names come from product listings.</p>
                    </button>
                  </div>
                </>
              ) : (
                <form className="admin-product-form" onSubmit={handleSavePageContent}>
                  <div className="admin-panel-header full-span">
                    <div>
                      <span className="section-tag">Home Page</span>
                      <h3>{pageEditingSection === "middle-hero" ? "Main home sections" : "Flash window"}</h3>
                    </div>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setPageEditingSection("home")}
                    >
                      Back
                    </button>
                  </div>

                  {pageEditingSection === "middle-hero" ? (
                    <>
                      {(pageContentForm.homeHeroImages?.length
                        ? pageContentForm.homeHeroImages
                        : initialPageContentForm.homeHeroImages
                      ).slice(0, 3).map((image, index) => (
                        <ImageUrlField
                          label={`Hero Carousel Slide ${index + 1} URL`}
                          value={image}
                          previewAlt={`Home hero slide ${index + 1} preview`}
                          onChange={(imageUrl) => updateHeroCarouselImage(index, imageUrl)}
                          onUpload={handleHeroCarouselImageUpload(index)}
                          key={`hero-slide-${index}`}
                        />
                      ))}
                      <label className="form-field full-span">
                        <span>Brand Intro Text</span>
                        <textarea
                          rows={3}
                          value={pageContentForm.brandIntroText}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, brandIntroText: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Collection Title</span>
                        <input
                          value={pageContentForm.collectionTitle}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, collectionTitle: event.target.value }))
                          }
                        />
                      </label>
                      <div className="admin-promo-edit-card full-span">
                        <div className="admin-panel-header full-span">
                          <div>
                            <span className="section-tag">Our Collection</span>
                            <h3>Featured collection products</h3>
                          </div>
                        </div>
                        <div className="admin-collection-picker full-span">
                          {dashboard.products.map((product) => {
                            const isSelected = pageContentForm.collectionProductIds.includes(product.id);
                            return (
                              <label className="admin-checkbox" key={product.id}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(event) =>
                                    setPageContentForm((current) => ({
                                      ...current,
                                      collectionProductIds: event.target.checked
                                        ? [...new Set([...current.collectionProductIds, product.id])]
                                        : current.collectionProductIds.filter((productId) => productId !== product.id),
                                    }))
                                  }
                                />
                                <span>
                                  {product.name} / Rs {product.price.toLocaleString()}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <label className="form-field">
                        <span>Shop Now Button Text</span>
                        <input
                          value={pageContentForm.heroButton}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, heroButton: event.target.value }))
                          }
                        />
                      </label>
                      <ImageUrlField
                        label="Shop Now Image URL"
                        value={pageContentForm.shopNowImage}
                        previewAlt="Shop now preview"
                        onChange={(shopNowImage) => setPageContentForm((current) => ({ ...current, shopNowImage }))}
                        onUpload={handlePageImageUpload("shopNowImage")}
                      />
                    </>
                  ) : null}

                  {pageEditingSection === "flash-window" ? (
                    <>
                      <label className="form-field">
                        <span>Flash Window Tag</span>
                        <input
                          value={pageContentForm.flashTag}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashTag: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Text When Timer Is Off</span>
                        <textarea
                          rows={3}
                          value={pageContentForm.flashInactiveText}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashInactiveText: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Flash Description</span>
                        <textarea
                          rows={3}
                          value={pageContentForm.flashDescription}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashDescription: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Flash Button Text</span>
                        <input
                          value={pageContentForm.flashCta}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashCta: event.target.value }))
                          }
                        />
                      </label>
                      <div className="admin-promo-edit-card full-span">
                        <div className="admin-panel-header full-span">
                          <div>
                            <span className="section-tag">Flash Items</span>
                            <h3>Flash sale products</h3>
                          </div>
                        </div>
                        <div className="admin-collection-picker full-span">
                          {dashboard.products.map((product) => {
                            const isSelected = pageContentForm.flashProductIds.includes(product.id);
                            return (
                              <label className="admin-checkbox" key={product.id}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(event) =>
                                    setPageContentForm((current) => ({
                                      ...current,
                                      flashProductIds: event.target.checked
                                        ? [...new Set([...current.flashProductIds, product.id])]
                                        : current.flashProductIds.filter((productId) => productId !== product.id),
                                    }))
                                  }
                                />
                                <span>
                                  {product.name} / Rs {product.price.toLocaleString()}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {pageContentMessage ? <div className="form-status">{pageContentMessage}</div> : null}

                  <div className="checkout-actions full-span">
                    <button type="submit" className="primary-button" disabled={isSavingPageContent}>
                      {isSavingPageContent ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setPageEditingSection("home")}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="admin-page-preview">
              <span className="section-tag">Live Preview</span>
              <div
                className="admin-preview-hero"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(34, 17, 7, 0.76), rgba(34, 17, 7, 0.18)), url(${pageContentForm.homeHeroImages?.[0] ?? pageContentForm.homeHeroImage})`,
                }}
              >
                <span>{pageContentForm.collectionTitle}</span>
                <strong>{pageContentForm.heroButton}</strong>
              </div>
              <h3>
                {pageContentForm.flashProductIds.length > 1
                  ? `${pageContentForm.flashProductIds.length} flash products selected`
                  : "Flash product name comes from Product Details"}
              </h3>
              <p>{pageContentForm.flashDescription}</p>
            </aside>
          </div>
        </section>
      ) : null}
    </main>
  );
}
