import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  adminLogin,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminDashboard,
  replyToLiveChat,
  updateAdminProduct,
  updateFlashSaleSettings,
  updatePageContentSettings,
  updateOrderStatus,
  updateProductRequestStatus,
  type AdminDashboard,
  type OrderStatus,
  type PageContentSettings,
  type StoreOperationSettings,
  updateStoreOperationSettings,
} from "../lib/api";
import type { Product } from "../types/product";

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
  | "home"
  | "add-product"
  | "product-details"
  | "orders"
  | "analytics"
  | "customer-care"
  | "flash-time"
  | "page-editing"
  | "store-setup"
  | "customers";
type PageEditingSection = "home" | "top-banner" | "middle-hero" | "side-promos" | "flash-window" | "lower-section";
type OrderFilter = "all" | OrderStatus;
type FlashSaleForm = {
  enabled: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

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

export function AdminPage() {
  const [token, setToken] = useState(getStoredAdminToken);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [adminView, setAdminView] = useState<AdminView>("home");
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
  const [flashSaleMessage, setFlashSaleMessage] = useState("");
  const [pageContentMessage, setPageContentMessage] = useState("");
  const [storeSetupMessage, setStoreSetupMessage] = useState("");
  const [customerCareMessage, setCustomerCareMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isSavingFlashSale, setIsSavingFlashSale] = useState(false);
  const [isSavingPageContent, setIsSavingPageContent] = useState(false);
  const [isSavingStoreSetup, setIsSavingStoreSetup] = useState(false);
  const [isSendingChatReply, setIsSendingChatReply] = useState(false);
  const [pageContentForm, setPageContentForm] =
    useState<PageContentSettings>(initialPageContentForm);
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

  const goToAdminHome = () => {
    setAdminView("home");
    setProductMessage("");
    setOrderMessage("");
    setFlashSaleMessage("");
    setPageContentMessage("");
    setStoreSetupMessage("");
    setCustomerCareMessage("");
    setPageEditingSection("home");
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

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageResult = reader.result;
      if (typeof imageResult === "string") {
        setProductForm((current) => ({
          ...current,
          image: imageResult,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHoverImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageResult = reader.result;
      if (typeof imageResult === "string") {
        setProductForm((current) => ({
          ...current,
          hoverImage: imageResult,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
            reader.readAsDataURL(file);
          }),
      ),
    ).then((images) => {
      const existingImages = productForm.galleryImages
        .split("\n")
        .map((image) => image.trim())
        .filter(Boolean);
      const nextImages = [...existingImages, ...images.filter(Boolean)];
      setProductForm((current) => ({ ...current, galleryImages: nextImages.join("\n") }));
    });
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
      setOrderMessage(`Order marked as ${formatOrderStatus(status).toLowerCase()}.`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setDashboard(null);
    setAdminView("home");
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
      const nextDashboard = await updatePageContentSettings(token, pageContentForm);
      setDashboard(nextDashboard);
      setPageContentForm({
        ...initialPageContentForm,
        ...(nextDashboard.settings?.pageContent ?? {}),
      });
      setPageContentMessage("Homepage writing updated successfully.");
    } catch (error) {
      setPageContentMessage(error instanceof Error ? error.message : "Unable to update homepage writing.");
    } finally {
      setIsSavingPageContent(false);
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
      <main className="page-shell admin-shell">
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
      </main>
    );
  }

  if (isLoadingDashboard || !dashboard) {
    return (
      <main className="page-shell admin-shell">
        <section className="page-intro">
          <span className="section-tag">Admin Dashboard</span>
          <h2>Loading admin data...</h2>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell admin-shell">
      <section className="admin-header-card">
        <div>
          <span className="section-tag">Admin Dashboard</span>
          <h2>Admin Home</h2>
          <p>Open the section you want to manage.</p>
        </div>
        <button className="ghost-button" onClick={handleLogout}>
          Log Out
        </button>
      </section>

      {adminView === "home" ? (
        <>
          <section className="admin-metric-grid" aria-label="Admin overview">
            <article className="admin-metric-card">
              <span>Products</span>
              <strong>{dashboard.overview.totalProducts}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Orders</span>
              <strong>{dashboard.overview.totalOrders}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Pending</span>
              <strong>{pendingOrderCount}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Revenue</span>
              <strong>{formatPrice(dashboard.overview.totalRevenue)}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Sold Units</span>
              <strong>{dashboard.overview.totalSoldUnits}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Care Inbox</span>
              <strong>{newProductRequestCount + openChatCount}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Total Users</span>
              <strong>{dashboard.accountStats?.totalUsers ?? 0}</strong>
            </article>
            <article className="admin-metric-card">
              <span>User Logins</span>
              <strong>{dashboard.accountStats?.totalLogins ?? 0}</strong>
            </article>
          </section>

          <section className="admin-section-grid">
          <button
            className="admin-section-card"
            onClick={() => {
              resetProductForm();
              setAdminView("add-product");
            }}
          >
            <span className="admin-card-index">1</span>
            <h3>Add Product</h3>
            <p>Open a separate page to add product name, display image, hover image, description, price, and discount.</p>
          </button>

          <button className="admin-section-card" onClick={() => setAdminView("product-details")}>
            <span className="admin-card-index">2</span>
            <h3>Product Details</h3>
            <p>See all products in a table and review the highest sold product with sold quantity.</p>
          </button>

        <button className="admin-section-card" onClick={() => setAdminView("orders")}>
            <span className="admin-card-index">3</span>
            <h3>Orders</h3>
          <p>Check new, processing, shipped, completed, cancelled orders, and full order time details.</p>
        </button>

        <button className="admin-section-card" onClick={() => setAdminView("analytics")}>
          <span className="admin-card-index">4</span>
          <h3>Analytics & Reports</h3>
          <p>See all-time revenue, monthly revenue, today's revenue, total orders, and orders today.</p>
        </button>

        <button className="admin-section-card" onClick={() => setAdminView("customer-care")}>
          <span className="admin-card-index">5</span>
          {newProductRequestCount + openChatCount > 0 ? (
            <span className="admin-card-badge">{newProductRequestCount + openChatCount}</span>
          ) : null}
          <h3>Customer Care</h3>
          <p>Review requested products and answer customer live chat messages from one inbox.</p>
        </button>

        <button className="admin-section-card" onClick={() => setAdminView("flash-time")}>
          <span className="admin-card-index">6</span>
          <h3>Flash Time</h3>
          <p>Increase, decrease, hide, or reset the countdown timer from admin only.</p>
        </button>

        <button
          className="admin-section-card"
          onClick={() => {
            setPageEditingSection("home");
            setAdminView("page-editing");
          }}
        >
          <span className="admin-card-index">7</span>
          <h3>Page Editing</h3>
          <p>Edit the homepage ad banner, hero writing, flash window text, and section copy.</p>
        </button>

        <button className="admin-section-card" onClick={() => setAdminView("store-setup")}>
          <span className="admin-card-index">8</span>
          <h3>Store Setup</h3>
          <p>Manage categories, coupons, delivery charge, and payment methods from separate input boxes.</p>
        </button>

        <button className="admin-section-card" onClick={() => setAdminView("customers")}>
          <span className="admin-card-index">9</span>
          <h3>Customers</h3>
          <p>Review customer names, contact numbers, email addresses, and order counts.</p>
        </button>
          </section>
        </>
      ) : null}

      {adminView === "add-product" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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
            <label className="form-field full-span">
              <span>Display Image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {productForm.image ? (
              <div className="admin-upload-preview full-span">
                <img src={productForm.image} alt="Display preview" className="admin-product-image preview" />
              </div>
            ) : null}
            <label className="form-field full-span">
              <span>Hover Image</span>
              <input type="file" accept="image/*" onChange={handleHoverImageUpload} />
            </label>
            <label className="form-field full-span">
              <span>Hover Image URL (optional)</span>
              <input
                value={productForm.hoverImage}
                onChange={(event) => setProductForm({ ...productForm, hoverImage: event.target.value })}
                placeholder="Second image shown when a customer points at the product"
              />
            </label>
            {productForm.hoverImage ? (
              <div className="admin-upload-preview full-span">
                <img src={productForm.hoverImage} alt="Hover preview" className="admin-product-image preview" />
              </div>
            ) : null}
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

            <div className="checkout-actions full-span">
              <button type="button" className="ghost-button" onClick={goToAdminHome}>
                Back
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {adminView === "product-details" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={goToAdminHome}>
              Back
            </button>
          </div>
        </section>
      ) : null}

      {adminView === "orders" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

          <section className="admin-layout">
            <div className="admin-panel-card nested-card">
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

            <div className="admin-panel-card nested-card">
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

                  {orderMessage ? <div className="form-status">{orderMessage}</div> : null}

                  <div className="admin-status-actions">
                    <button
                      className="ghost-button"
                      onClick={() => handleOrderStatusChange("processing")}
                      disabled={isUpdatingOrder}
                    >
                      Processing
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => handleOrderStatusChange("shipped")}
                      disabled={isUpdatingOrder}
                    >
                      Shipped
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => handleOrderStatusChange("completed")}
                      disabled={isUpdatingOrder}
                    >
                      Complete Order
                    </button>
                    <button
                      className="remove-link"
                      onClick={() => handleOrderStatusChange("cancelled")}
                      disabled={isUpdatingOrder}
                    >
                      Cancel Order
                    </button>
                  </div>
                </>
              ) : (
                <p>Select an order from the left side to see its details.</p>
              )}
            </div>
          </section>

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={goToAdminHome}>
              Back
            </button>
          </div>
        </section>
      ) : null}

      {adminView === "analytics" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

          <section className="admin-layout">
            <div className="admin-panel-card nested-card">
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

            <div className="admin-panel-card nested-card">
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

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={goToAdminHome}>
              Back
            </button>
          </div>
        </section>
      ) : null}

      {adminView === "customer-care" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
            <span className="section-tag">Customer Care</span>
          </div>

          <h3>Requests and live chat</h3>

          <section className="admin-layout">
            <div className="admin-panel-card nested-card">
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

            <div className="admin-panel-card nested-card">
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

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={goToAdminHome}>
              Back
            </button>
          </div>
        </section>
      ) : null}

      {adminView === "flash-time" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

            <div className="checkout-actions full-span">
              <button type="button" className="ghost-button" onClick={goToAdminHome}>
                Back
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {adminView === "store-setup" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

            {storeSetupMessage ? <div className="form-status">{storeSetupMessage}</div> : null}

            <div className="checkout-actions full-span">
              <button type="submit" className="primary-button" disabled={isSavingStoreSetup}>
                {isSavingStoreSetup ? "Saving..." : "Save Store Setup"}
              </button>
              <button type="button" className="ghost-button" onClick={goToAdminHome}>
                Back
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {adminView === "customers" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={goToAdminHome}>
              Back
            </button>
          </div>
        </section>
      ) : null}

      {adminView === "page-editing" ? (
        <section className="admin-panel-card">
          <div className="admin-panel-header">
            <button className="ghost-button" onClick={goToAdminHome}>
              Back To Admin Home
            </button>
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
                    <button className="ghost-button" onClick={goToAdminHome}>
                      Back
                    </button>
                  </div>

                  <div className="admin-section-grid page-editing-grid">
                    <button className="admin-section-card" onClick={() => setPageEditingSection("top-banner")}>
                      <span className="section-tag">Top</span>
                      <h3>Top Banner</h3>
                      <p>Edit the three small banner writings above the main hero.</p>
                    </button>
                    <button className="admin-section-card" onClick={() => setPageEditingSection("middle-hero")}>
                      <span className="section-tag">Middle</span>
                      <h3>Hero Area</h3>
                      <p>Edit hero image links, label writing, button text, and side-card tag.</p>
                    </button>
                    <button className="admin-section-card" onClick={() => setPageEditingSection("side-promos")}>
                      <span className="section-tag">Promos</span>
                      <h3>Hero Promo Cards</h3>
                      <p>Edit the six side banner names, subtitles, and campaign images.</p>
                    </button>
                    <button className="admin-section-card" onClick={() => setPageEditingSection("flash-window")}>
                      <span className="section-tag">Flash</span>
                      <h3>Flash Window</h3>
                      <p>Edit the flash window tag, heading, and active/inactive text.</p>
                    </button>
                    <button className="admin-section-card" onClick={() => setPageEditingSection("lower-section")}>
                      <span className="section-tag">Below</span>
                      <h3>Lower Section</h3>
                      <p>Edit the writing below the hero and above the product cards.</p>
                    </button>
                  </div>
                </>
              ) : (
                <form className="admin-product-form" onSubmit={handleSavePageContent}>
                  <div className="admin-panel-header full-span">
                    <div>
                      <span className="section-tag">Home Page</span>
                      <h3>
                        {pageEditingSection === "top-banner"
                          ? "Top banner"
                          : pageEditingSection === "middle-hero"
                            ? "Middle hero area"
                            : pageEditingSection === "side-promos"
                              ? "Hero promo cards"
                              : pageEditingSection === "flash-window"
                                ? "Flash window"
                                : "Lower section"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setPageEditingSection("home")}
                    >
                      Back
                    </button>
                  </div>

                  {pageEditingSection === "top-banner" ? (
                    <>
                      <label className="form-field">
                        <span>Top Banner Text 1</span>
                        <input
                          value={pageContentForm.bannerPrimary}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, bannerPrimary: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Top Banner Text 2</span>
                        <input
                          value={pageContentForm.bannerSecondary}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, bannerSecondary: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Top Banner Text 3</span>
                        <input
                          value={pageContentForm.bannerTertiary}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, bannerTertiary: event.target.value }))
                          }
                        />
                      </label>
                    </>
                  ) : null}

                  {pageEditingSection === "middle-hero" ? (
                    <>
                      <label className="form-field full-span">
                        <span>Hero Picture 1 URL</span>
                        <input
                          value={pageContentForm.heroImageOne}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, heroImageOne: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Hero Picture 2 URL</span>
                        <input
                          value={pageContentForm.heroImageTwo}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, heroImageTwo: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Hero Tag</span>
                        <input
                          value={pageContentForm.heroTag}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, heroTag: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Hero Button</span>
                        <input
                          value={pageContentForm.heroButton}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, heroButton: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Side Card Tag</span>
                        <input
                          value={pageContentForm.sideTag}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, sideTag: event.target.value }))
                          }
                        />
                      </label>
                    </>
                  ) : null}

                  {pageEditingSection === "side-promos" ? (
                    <>
                      {pageContentForm.heroPromos.map((promo, index) => (
                        <div className="admin-promo-edit-card full-span" key={`hero-promo-${index}`}>
                          <div className="admin-panel-header full-span">
                            <div>
                              <span className="section-tag">Card {index + 1}</span>
                              <h3>{promo.title || "Promo card"}</h3>
                            </div>
                          </div>
                          <label className="form-field">
                            <span>Card Title</span>
                            <input
                              value={promo.title}
                              onChange={(event) =>
                                setPageContentForm((current) => ({
                                  ...current,
                                  heroPromos: current.heroPromos.map((entry, entryIndex) =>
                                    entryIndex === index ? { ...entry, title: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Card Subtitle</span>
                            <input
                              value={promo.subtitle}
                              onChange={(event) =>
                                setPageContentForm((current) => ({
                                  ...current,
                                  heroPromos: current.heroPromos.map((entry, entryIndex) =>
                                    entryIndex === index ? { ...entry, subtitle: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                          </label>
                          <label className="form-field full-span">
                            <span>Card Image URL</span>
                            <input
                              value={promo.image}
                              onChange={(event) =>
                                setPageContentForm((current) => ({
                                  ...current,
                                  heroPromos: current.heroPromos.map((entry, entryIndex) =>
                                    entryIndex === index ? { ...entry, image: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                          </label>
                        </div>
                      ))}
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
                      <label className="form-field">
                        <span>Flash Window Heading</span>
                        <input
                          value={pageContentForm.flashTitle}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashTitle: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Text When Timer Is On</span>
                        <textarea
                          rows={3}
                          value={pageContentForm.flashActiveText}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, flashActiveText: event.target.value }))
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
                    </>
                  ) : null}

                  {pageEditingSection === "lower-section" ? (
                    <>
                      <label className="form-field">
                        <span>Lower Section Tag</span>
                        <input
                          value={pageContentForm.sectionTag}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, sectionTag: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Lower Section Heading</span>
                        <input
                          value={pageContentForm.sectionTitle}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, sectionTitle: event.target.value }))
                          }
                        />
                      </label>
                      <label className="form-field full-span">
                        <span>Lower Section Text</span>
                        <textarea
                          rows={4}
                          value={pageContentForm.sectionText}
                          onChange={(event) =>
                            setPageContentForm((current) => ({ ...current, sectionText: event.target.value }))
                          }
                        />
                      </label>
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
              <div className="admin-preview-banner">
                <span>{pageContentForm.bannerPrimary}</span>
                <span>{pageContentForm.bannerSecondary}</span>
                <span>{pageContentForm.bannerTertiary}</span>
              </div>
              <div
                className="admin-preview-hero"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(34, 17, 7, 0.76), rgba(34, 17, 7, 0.18)), url(${pageContentForm.heroImageOne})`,
                }}
              >
                <span>{pageContentForm.heroTag}</span>
                <strong>{pageContentForm.heroButton}</strong>
              </div>
              <div className="admin-preview-promo-grid">
                {pageContentForm.heroPromos.map((promo, index) => (
                  <div
                    className="admin-preview-promo-card"
                    key={`preview-promo-${index}`}
                    style={{
                      backgroundImage: `linear-gradient(90deg, rgba(20, 8, 3, 0.72), rgba(20, 8, 3, 0.22)), url(${promo.image})`,
                    }}
                  >
                    <span>{promo.title}</span>
                    <strong>{promo.subtitle}</strong>
                  </div>
                ))}
              </div>
              <h3>{pageContentForm.flashTitle}</h3>
              <p>{pageContentForm.flashActiveText}</p>
              <strong>{pageContentForm.sectionTitle}</strong>
              <p>{pageContentForm.sectionText}</p>
            </aside>
          </div>
        </section>
      ) : null}
    </main>
  );
}
