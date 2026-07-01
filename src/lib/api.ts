import type { Product } from "../types/product";

const apiBase = "/api";

export type OrderStatus = "new" | "processing" | "shipped" | "completed" | "cancelled";

export type BillingInvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total?: number;
};

export type BillingInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  paymentMethod: string;
  notes: string;
  discount: number;
  shipping: number;
  subtotal: number;
  total: number;
  items: BillingInvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
};

export type PageContentSettings = {
  bannerPrimary: string;
  bannerSecondary: string;
  bannerTertiary: string;
  homeHeroImage: string;
  homeHeroImages: string[];
  brandIntroText: string;
  collectionTitle: string;
  collectionProductIds: number[];
  electronicsTitle: string;
  electronicsProductIds: number[];
  garmentsTitle: string;
  garmentsProductIds: number[];
  shoesTitle: string;
  shoesProductIds: number[];
  flashProductIds: number[];
  flashDescription: string;
  flashCta: string;
  shopNowImage: string;
  heroPromos: Array<{
    title: string;
    subtitle: string;
    image: string;
  }>;
  heroImageOne: string;
  heroImageTwo: string;
  heroTag: string;
  heroButton: string;
  flashTag: string;
  flashTitle: string;
  flashActiveText: string;
  flashInactiveText: string;
  sideTag: string;
  sectionTag: string;
  sectionTitle: string;
  sectionText: string;
};

export type AboutContentSettings = {
  heroMetaLeft: string;
  heroMetaRight: string;
  heroTitle: string;
  storyImages: string[];
  teamMembers: Array<{
    name: string;
    titles: string[];
    message: string;
    imageLabel: string;
    imageSrc: string;
  }>;
  storyHeadline: string;
  storyParagraphs: string[];
  galleryLogo: string;
  galleryText: string;
  galleryImages: string[];
  socialLinks: Array<{
    label: string;
    url: string;
  }>;
};

export type StoreOperationSettings = {
  categories: string[];
  coupons: Array<{
    code: string;
    discount: number;
    enabled: boolean;
  }>;
  deliveryCharge: number;
  paymentMethods: string[];
  showCategorySection: boolean;
  showBestProductsSection: boolean;
  showFeaturedSection: boolean;
  showBestSellersSection: boolean;
  showNewArrivalsSection: boolean;
  showTrustSection: boolean;
  showRelatedProducts: boolean;
  showProductPageIntro: boolean;
  homeCategoryTitle: string;
  homeBestProductsTitle: string;
  homeFeaturedTitle: string;
  homeBestSellersTitle: string;
  homeNewArrivalsTitle: string;
  homeTrustTitle: string;
  productPageTag: string;
  productPageTitle: string;
  productPageText: string;
  relatedProductsTitle: string;
  supportPageTag: string;
  supportPageTitle: string;
  supportPageText: string;
  supportContactTitle: string;
  supportContactText: string;
  supportPhone: string;
  supportWhatsappUrl: string;
  supportInstagramUrl: string;
  supportInstagramLabel: string;
  supportTiktokUrl: string;
  supportTiktokLabel: string;
  supportHoursTag: string;
  supportHoursTitle: string;
  supportHoursText: string;
};

export type OrderPayload = {
  clientOrderId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    alternateContact: string;
    country: string;
    province: string;
    city: string;
    area: string;
    postalCode: string;
    landmark: string;
  };
  items: Array<{
    productId: number;
    name: string;
    category: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode?: string;
  paymentMethod: string;
};

export type ProductRequest = {
  id: string;
  status: string;
  customerName: string;
  contact: string;
  productName: string;
  details: string;
  createdAt: string;
  updatedAt?: string;
};

export type LiveChatMessage = {
  id: string;
  sender: "customer" | "admin";
  text: string;
  createdAt: string;
};

export type LiveChat = {
  id: string;
  status: string;
  customerName: string;
  contact?: string;
  messages: LiveChatMessage[];
  createdAt: string;
  updatedAt?: string;
};

export type ContactMessage = {
  id: string;
  status: string;
  requestType: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language: string;
  message?: string;
  createdAt: string;
  updatedAt?: string;
};

export type SellerApplication = {
  id: string;
  status: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  productCategory?: string;
  message?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ContactMessagePayload = {
  requestType: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  message: string;
};

export type SellerApplicationPayload = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  productCategory: string;
  message: string;
};

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  items: Array<{ name: string; quantity: number; selectedColor?: string; selectedSize?: string }>;
  subtotal: number;
  createdAt: string;
  updatedAt?: string;
};

export type AdminDashboard = {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalSoldUnits: number;
    totalInterest: number;
    totalUsers?: number;
  };
  accountStats?: {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    facebookUsers: number;
    totalLogins: number;
    emailLogins: number;
    googleLogins: number;
    facebookLogins: number;
  };
  customers?: Array<{
    id: string;
    name: string;
    email: string;
    provider: "email" | "google" | "facebook";
    loginCount: number;
    createdAt: string;
    lastLoginAt?: string;
  }>;
  topSelling: Array<Product & { soldCount: number; interestCount: number }>;
  mostLoved: Array<Product & { soldCount: number; interestCount: number }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      contactNumber: string;
    };
    items: Array<{ productId?: number; name: string; quantity: number; total?: number; category?: string; selectedColor?: string; selectedSize?: string }>;
    subtotal: number;
    discount?: number;
    deliveryCharge?: number;
    total?: number;
    couponCode?: string;
    paymentMethod?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      contactNumber: string;
    };
    items: Array<{ productId?: number; name: string; quantity: number; total?: number; category?: string; selectedColor?: string; selectedSize?: string }>;
    subtotal: number;
    discount?: number;
    deliveryCharge?: number;
    total?: number;
    couponCode?: string;
    paymentMethod?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  products: Array<Product & { soldCount: number; interestCount: number }>;
  productRequests: ProductRequest[];
  contactMessages?: ContactMessage[];
  sellerApplications?: SellerApplication[];
  liveChats: LiveChat[];
  invoices?: BillingInvoice[];
  settings: {
    flashSale: {
      enabled: boolean;
      endsAt: string | null;
    };
    pageContent: PageContentSettings;
    aboutContent: AboutContentSettings;
    operations: StoreOperationSettings;
  };
};

type ProductsResponse = {
  products: Product[];
  settings: {
    flashSale: {
      enabled: boolean;
      endsAt: string | null;
    };
    pageContent: PageContentSettings;
    aboutContent: AboutContentSettings;
    operations: StoreOperationSettings;
  };
};

export type CustomerAccount = {
  id?: string;
  name: string;
  email: string;
  provider?: "email" | "google" | "facebook";
};

class ApiResponseError extends Error {}
class ApiFormatError extends Error {}

async function parseJsonResponse<T>(response: Response, formatErrorMessage?: string): Promise<T> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new ApiFormatError(formatErrorMessage ?? "The server returned a page instead of account data. Please restart the dev server and try again.");
  }

  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new ApiResponseError(result.message ?? "Request failed.");
  }
  return result;
}

function saveLocalOrder(payload: OrderPayload) {
  const createdAt = new Date();
  const datePart = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  const storageKey = "vinex-local-orders";
  const storedOrders = (() => {
    if (typeof window === "undefined") return [];

    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const orderNumber = `VN-${datePart}-${String(storedOrders.length + 1).padStart(4, "0")}`;
  const nextOrders = [
    {
      ...payload,
      id: `local-${Date.now()}`,
      orderNumber,
      status: "new",
      createdAt: createdAt.toISOString(),
    },
    ...storedOrders,
  ].slice(0, 100);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextOrders));
    } catch {
      // The checkout can still continue; EmailJS may notify the store owner.
    }
  }

  return { orderNumber, orderCount: nextOrders.length };
}

export async function fetchProducts() {
  try {
    const response = await fetch(`${apiBase}/products`);
    return await parseJsonResponse<ProductsResponse>(response);
  } catch (error) {
    console.warn("Products API unavailable. Loading static storefront data.", error);
    const fallbackResponse = await fetch("/data/store.json");
    const fallbackStore = await parseJsonResponse<ProductsResponse & { settings: ProductsResponse["settings"] }>(fallbackResponse);
    return {
      products: fallbackStore.products,
      settings: fallbackStore.settings,
    };
  }
}

export async function recordProductInterest(productId: number) {
  await fetch(`${apiBase}/analytics/interests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });
}

export async function recordOrder(payload: OrderPayload) {
  try {
    const response = await fetch(`${apiBase}/orders/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await parseJsonResponse<{ ok: true; orderCount: number; orderNumber: string }>(response);
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }

    console.warn("Orders API unavailable. Saving checkout order locally.", error);
    const localOrder = saveLocalOrder(payload);
    return { ok: true, ...localOrder };
  }
}

export async function submitProductRequest(payload: {
  customerName: string;
  contact: string;
  productName: string;
  details: string;
}) {
  const response = await fetch(`${apiBase}/product-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ ok: true; request: ProductRequest }>(response);
}

export async function registerCustomerAccount(payload: { name: string; email: string; password: string }) {
  const response = await fetch(`${apiBase}/customers/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ customer: CustomerAccount }>(response);
}

export async function loginCustomerAccount(payload: { email: string; password: string }) {
  const response = await fetch(`${apiBase}/customers/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ customer: CustomerAccount }>(response);
}

export async function startLiveChat(payload: {
  customerName: string;
  contact: string;
  message: string;
}) {
  const response = await fetch(`${apiBase}/live-chat/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ ok: true; chat: LiveChat }>(response);
}

export async function fetchLiveChat(chatId: string) {
  const response = await fetch(`${apiBase}/live-chat/${chatId}`);
  return parseJsonResponse<{ chat: LiveChat }>(response);
}

export async function sendLiveChatMessage(chatId: string, message: string) {
  const response = await fetch(`${apiBase}/live-chat/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return parseJsonResponse<{ ok: true; chat: LiveChat }>(response);
}

export async function submitContactMessage(payload: ContactMessagePayload) {
  const response = await fetch(`${apiBase}/contact-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ ok: true; emailSent: boolean; message: ContactMessage }>(response);
}

export async function submitSellerApplication(payload: SellerApplicationPayload) {
  const response = await fetch(`${apiBase}/seller-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ ok: true; emailSent: boolean; application: SellerApplication }>(response);
}

export async function trackOrder(orderNumber: string) {
  const response = await fetch(`${apiBase}/orders/track/${encodeURIComponent(orderNumber.trim())}`);
  return parseJsonResponse<{ order: TrackedOrder }>(response);
}

export async function adminLogin(username: string, password: string) {
  const response = await fetch(`${apiBase}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return parseJsonResponse<{ ok: true; token: string }>(response);
}

function buildAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchAdminDashboard(token: string) {
  const response = await fetch(`${apiBase}/admin/dashboard`, {
    headers: buildAdminHeaders(token),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function createAdminProduct(token: string, product: Omit<Product, "id">) {
  const response = await fetch(`${apiBase}/admin/products`, {
    method: "POST",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(product),
  });

  return parseJsonResponse<{ products: Product[] }>(response);
}

export async function updateAdminProduct(token: string, productId: number, product: Omit<Product, "id">) {
  const response = await fetch(`${apiBase}/admin/products/${productId}`, {
    method: "PUT",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(product),
  });

  return parseJsonResponse<{ products: Product[] }>(response);
}

export async function deleteAdminProduct(token: string, productId: number) {
  const response = await fetch(`${apiBase}/admin/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse<{ products: Product[] }>(response);
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
) {
  const response = await fetch(`${apiBase}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateProductRequestStatus(token: string, requestId: string, status: string) {
  const response = await fetch(`${apiBase}/admin/product-requests/${requestId}/status`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateContactMessageStatus(token: string, messageId: string, status: string) {
  const response = await fetch(`${apiBase}/admin/contact-messages/${messageId}/status`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateSellerApplicationStatus(token: string, applicationId: string, status: string) {
  const response = await fetch(`${apiBase}/admin/seller-applications/${applicationId}/status`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function replyToLiveChat(token: string, chatId: string, message: string) {
  const response = await fetch(`${apiBase}/admin/live-chats/${chatId}/reply`, {
    method: "POST",
    headers: buildAdminHeaders(token),
    body: JSON.stringify({ message }),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function saveBillingInvoice(
  token: string,
  payload: Omit<BillingInvoice, "subtotal" | "total" | "createdAt" | "updatedAt">,
) {
  const response = await fetch(`${apiBase}/admin/invoices`, {
    method: "POST",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function deleteBillingInvoice(token: string, invoiceId: string) {
  const response = await fetch(`${apiBase}/admin/invoices/${encodeURIComponent(invoiceId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateFlashSaleSettings(
  token: string,
  payload: {
    enabled: boolean;
    endsAt: string | null;
  },
) {
  const response = await fetch(`${apiBase}/admin/settings/flash-sale`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updatePageContentSettings(token: string, payload: PageContentSettings) {
  const response = await fetch(`${apiBase}/admin/settings/page-content`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateAboutContentSettings(token: string, payload: AboutContentSettings) {
  const response = await fetch(`${apiBase}/admin/settings/about-content`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function updateStoreOperationSettings(token: string, payload: StoreOperationSettings) {
  const response = await fetch(`${apiBase}/admin/settings/operations`, {
    method: "PATCH",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AdminDashboard>(response);
}

export async function uploadAdminImage(token: string, payload: { fileName: string; dataUrl: string }) {
  const response = await fetch(`${apiBase}/admin/uploads`, {
    method: "POST",
    headers: buildAdminHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ url: string }>(
    response,
    "The image upload API is not available. Restart both the backend server and Vite dev server, then try uploading again.",
  );
}
