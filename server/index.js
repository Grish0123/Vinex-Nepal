import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { createAdminToken, verifyAdminToken } from "./auth.js";
import { readStore, updateStore } from "./data-store.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const uploadsDir = path.join(publicDir, "uploads");

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(uploadsDir));

const defaultPageContent = {
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
  heroImageTwo:
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
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

const defaultAboutContent = {
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

const defaultOperations = {
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

function buildSettings(store) {
  return {
    flashSale: store.settings?.flashSale ?? {
      enabled: true,
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    pageContent: {
      ...defaultPageContent,
      ...(store.settings?.pageContent ?? {}),
      collectionProductIds: Array.isArray(store.settings?.pageContent?.collectionProductIds)
        ? store.settings.pageContent.collectionProductIds.map((productId) => Number(productId)).filter(Number.isFinite)
        : defaultPageContent.collectionProductIds,
      flashProductIds: Array.isArray(store.settings?.pageContent?.flashProductIds)
        ? store.settings.pageContent.flashProductIds.map((productId) => Number(productId)).filter(Number.isFinite)
        : defaultPageContent.flashProductIds,
      homeHeroImages: Array.isArray(store.settings?.pageContent?.homeHeroImages)
        ? store.settings.pageContent.homeHeroImages.filter((image) => typeof image === "string" && image.trim())
        : defaultPageContent.homeHeroImages,
    },
    aboutContent: {
      ...defaultAboutContent,
      ...(store.settings?.aboutContent ?? {}),
      storyImages: Array.isArray(store.settings?.aboutContent?.storyImages)
        ? store.settings.aboutContent.storyImages
        : defaultAboutContent.storyImages,
      teamMembers: Array.isArray(store.settings?.aboutContent?.teamMembers)
        ? store.settings.aboutContent.teamMembers
        : defaultAboutContent.teamMembers,
      storyParagraphs: Array.isArray(store.settings?.aboutContent?.storyParagraphs)
        ? store.settings.aboutContent.storyParagraphs
        : defaultAboutContent.storyParagraphs,
      galleryImages: Array.isArray(store.settings?.aboutContent?.galleryImages)
        ? store.settings.aboutContent.galleryImages
        : defaultAboutContent.galleryImages,
      socialLinks: Array.isArray(store.settings?.aboutContent?.socialLinks)
        ? store.settings.aboutContent.socialLinks
        : defaultAboutContent.socialLinks,
    },
    operations: {
      ...defaultOperations,
      ...(store.settings?.operations ?? {}),
      categories: Array.isArray(store.settings?.operations?.categories)
        ? store.settings.operations.categories
        : defaultOperations.categories,
      coupons: Array.isArray(store.settings?.operations?.coupons)
        ? store.settings.operations.coupons
        : defaultOperations.coupons,
      paymentMethods: Array.isArray(store.settings?.operations?.paymentMethods)
        ? store.settings.operations.paymentMethods
        : defaultOperations.paymentMethods,
    },
  };
}

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME?.trim(),
    password: process.env.ADMIN_PASSWORD?.trim(),
  };
}

function sanitizeProduct(product) {
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.map((image) => String(image).trim()).filter(Boolean)
    : [];
  const colorOptions = Array.isArray(product.colorOptions)
    ? product.colorOptions.map((color) => String(color).trim()).filter(Boolean)
    : [];
  const sizeOptions = Array.isArray(product.sizeOptions)
    ? product.sizeOptions.map((size) => String(size).trim()).filter(Boolean)
    : [];

  return {
    id: Number(product.id),
    name: String(product.name).trim(),
    price: Number(product.price),
    originalPrice:
      product.originalPrice === undefined || product.originalPrice === null || product.originalPrice === ""
        ? undefined
        : Number(product.originalPrice),
    featured: Boolean(product.featured),
    category: String(product.category).trim(),
    supplierName: textValue(product.supplierName, 140) || "Vinex Nepal",
    supplierDescription: textValue(product.supplierDescription, 700) || undefined,
    supplierLocation: textValue(product.supplierLocation, 180) || undefined,
    supplierContact: textValue(product.supplierContact, 180) || undefined,
    image: String(product.image).trim(),
    hoverImage: product.hoverImage ? String(product.hoverImage).trim() : undefined,
    galleryImages,
    colorOptions,
    sizeOptions,
    description: String(product.description).trim(),
    inStock: product.inStock !== false,
  };
}

function validateProductInput(product) {
  if (!product || typeof product !== "object") {
    return "Product details are required.";
  }

  const requiredTextFields = ["name", "category", "image", "description"];
  for (const field of requiredTextFields) {
    if (!String(product[field] ?? "").trim()) {
      return `Missing ${field}.`;
    }
  }

  if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
    return "Price must be a valid number.";
  }

  if (
    product.originalPrice !== undefined &&
    product.originalPrice !== null &&
    product.originalPrice !== "" &&
    (!Number.isFinite(Number(product.originalPrice)) || Number(product.originalPrice) <= 0)
  ) {
    return "Original price must be a valid number.";
  }

  return null;
}

function textValue(value, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function sanitizeInvoice(invoice) {
  const items = Array.isArray(invoice?.items)
    ? invoice.items
        .map((item) => {
          const quantity = Math.max(0, numberValue(item?.quantity));
          const rate = Math.max(0, numberValue(item?.rate));
          return {
            id: textValue(item?.id, 80) || `item-${crypto.randomUUID()}`,
            description: textValue(item?.description, 240),
            quantity,
            rate,
            total: quantity * rate,
          };
        })
        .filter((item) => item.description)
    : [];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = Math.max(0, numberValue(invoice?.discount));
  const shipping = Math.max(0, numberValue(invoice?.shipping));

  return {
    invoiceNumber: textValue(invoice?.invoiceNumber, 80),
    invoiceDate: textValue(invoice?.invoiceDate, 40),
    dueDate: textValue(invoice?.dueDate, 40),
    customerName: textValue(invoice?.customerName, 140),
    customerPhone: textValue(invoice?.customerPhone, 80),
    customerEmail: textValue(invoice?.customerEmail, 180),
    customerAddress: textValue(invoice?.customerAddress, 500),
    paymentMethod: textValue(invoice?.paymentMethod, 100) || "Cash on Delivery",
    notes: textValue(invoice?.notes, 900),
    discount,
    shipping,
    subtotal,
    total: Math.max(0, subtotal - discount + shipping),
    items,
  };
}

function publicInvoice(invoice) {
  const sanitized = sanitizeInvoice(invoice);
  return {
    ...sanitized,
    id: textValue(invoice?.id, 120),
    createdAt: textValue(invoice?.createdAt, 80),
    updatedAt: textValue(invoice?.updatedAt, 80),
  };
}

function validateInvoiceInput(invoice) {
  if (!invoice || typeof invoice !== "object") {
    return "Invoice details are required.";
  }

  const sanitized = sanitizeInvoice(invoice);
  if (!sanitized.customerName) return "Customer name is required.";
  if (!sanitized.invoiceNumber) return "Invoice number is required.";
  if (sanitized.items.length < 1) return "Add at least one invoice item.";

  return null;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUploadFileName(fileName) {
  const extension = path.extname(String(fileName ?? "")).toLowerCase();
  const safeExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(extension) ? extension : ".png";
  const baseName = path
    .basename(String(fileName ?? "image"), extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${baseName || "image"}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${safeExtension}`;
}

function normalizeEmail(value) {
  return textValue(value, 180).toLowerCase();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    provider: customer.provider ?? "email",
    loginCount: Number(customer.loginCount ?? 0),
    createdAt: customer.createdAt,
    lastLoginAt: customer.lastLoginAt,
  };
}

function publicChat(chat) {
  if (!chat) return null;

  return {
    id: chat.id,
    status: chat.status ?? "open",
    customerName: chat.customerName,
    messages: chat.messages ?? [],
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

function buildOrderNumber(sequence, createdAt = new Date()) {
  const datePart = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `VN-${datePart}-${String(sequence).padStart(4, "0")}`;
}

function formatPrice(value) {
  return `Rs ${Number(value ?? 0).toLocaleString()}`;
}

function orderCustomerName(order) {
  return `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim() || "Customer";
}

function orderAddress(order) {
  return [
    order.customer?.area,
    order.customer?.city,
    order.customer?.province,
    order.customer?.country,
  ]
    .map((part) => textValue(part, 120))
    .filter(Boolean)
    .join(", ");
}

function statusLabel(status) {
  if (status === "new") return "Order received";
  if (status === "processing") return "Order being processed";
  if (status === "shipped") return "Order on the way";
  if (status === "completed") return "Order completed";
  if (status === "cancelled") return "Order cancelled";
  return "Order update";
}

function statusMessage(status) {
  if (status === "processing") return "We have started preparing your order. We will contact you if any detail needs confirmation.";
  if (status === "shipped") return "Your order has been handed over for delivery. Please keep your phone available for the delivery call.";
  if (status === "completed") return "Your order is marked as completed. Thank you for shopping with Vinex Nepal.";
  if (status === "cancelled") return "Your order has been cancelled. If this does not look right, please contact Vinex Nepal support.";
  return "We received your order and our team will review it shortly.";
}

function absoluteAssetUrl(assetPath) {
  const value = textValue(assetPath, 500);
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const siteUrl = process.env.PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return "";

  return `${siteUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

function productImageForItem(item, products = []) {
  return item.image || products.find((product) => Number(product.id) === Number(item.productId))?.image || "";
}

let mailTransporter;

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim().replace(/\s/g, "");

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return mailTransporter;
}

function buildOrderEmail(order, status, products = []) {
  const items = (order.items ?? [])
    .map((item, index) => {
      const itemImage = productImageForItem(item, products);
      const remoteImage = absoluteAssetUrl(itemImage);

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #3a3a3a;color:#ffffff;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:112px;vertical-align:top;">
                  ${
                    remoteImage
                      ? `<img src="${remoteImage}" alt="${item.name}" width="96" style="display:block;width:96px;max-width:96px;height:auto;border-radius:12px;border:1px solid #555;background:#ffffff;" />`
                      : `<div style="width:96px;height:96px;border-radius:12px;background:#2a2a2a;border:1px solid #555;"></div>`
                  }
                </td>
                <td style="vertical-align:top;">
                  <strong style="display:block;margin-bottom:4px;font-size:17px;line-height:1.25;color:#ffffff;">${item.name}</strong>
                  <span style="display:block;color:#c9c9c9;font-size:13px;line-height:1.55;">
                    ${item.category ?? "Product"}<br />
                    Qty ${item.quantity}${item.selectedColor ? ` / ${item.selectedColor}` : ""}${item.selectedSize ? ` / ${item.selectedSize}` : ""}
                  </span>
                </td>
              </tr>
            </table>
          </td>
          <td style="width:92px;padding:16px 0;border-bottom:1px solid #3a3a3a;text-align:right;color:#ffffff;font-weight:800;vertical-align:top;white-space:nowrap;">
            ${formatPrice(item.total)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:720px;margin:0 auto;background:#111111;">
        <div style="padding:24px 30px;background:#050505;color:#ffffff;border-bottom:4px solid #f97316;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <div style="font-size:28px;font-weight:900;letter-spacing:.02em;line-height:1;">Vinex Nepal</div>
                <div style="margin-top:8px;color:#ffd1b0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">Elevate your world</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:28px 30px;">
          <p style="margin:0 0 10px;color:#c9c9c9;">Hi ${orderCustomerName(order)},</p>
          <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#ffb38a;">${statusLabel(status)}</h1>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#ffffff;">${statusMessage(status)}</p>
          <div style="padding:16px 18px;border-radius:14px;background:#241b16;border:1px solid #8a4b2b;color:#ffffff;">
            <strong>Order number:</strong> ${order.orderNumber}<br />
            <strong>Payment:</strong> ${order.paymentMethod ?? "Cash on Delivery"}<br />
            <strong>Delivery:</strong> ${orderAddress(order) || "Address received"}
          </div>
          <table style="width:100%;border-collapse:collapse;margin-top:22px;">
            <tr>
              <td colspan="2" style="padding:0 0 10px;color:#ffb38a;font-size:18px;font-weight:900;">Ordered products</td>
            </tr>
            ${items}
            <tr><td style="padding:16px 0 4px;text-align:right;color:#c9c9c9;">Subtotal</td><td style="padding:16px 0 4px;text-align:right;color:#ffffff;white-space:nowrap;">${formatPrice(order.subtotal)}</td></tr>
            <tr><td style="padding:4px 0;text-align:right;color:#c9c9c9;">Discount</td><td style="padding:4px 0;text-align:right;color:#ffffff;white-space:nowrap;">-${formatPrice(order.discount)}</td></tr>
            <tr><td style="padding:4px 0;text-align:right;color:#c9c9c9;">Delivery</td><td style="padding:4px 0;text-align:right;color:#ffffff;white-space:nowrap;">${formatPrice(order.deliveryCharge)}</td></tr>
            <tr><td style="padding:14px 0 0;text-align:right;font-weight:900;color:#ffffff;">Total</td><td style="padding:14px 0 0;text-align:right;font-size:24px;font-weight:900;color:#f97316;white-space:nowrap;">${formatPrice(order.total)}</td></tr>
          </table>
        </div>
        <div style="padding:22px 30px;background:#1a1a1a;color:#c9c9c9;font-size:13px;line-height:1.6;text-align:center;">
          Need help? WhatsApp us at +977 9748285909 or reply with your order number.
        </div>
      </div>
    </div>
  `;
}

async function sendOrderEmail(order, status, products = []) {
  const transporter = getMailTransporter();
  const to = textValue(order.customer?.email, 180);

  if (!transporter || !to) {
    if (!transporter) console.warn("Order email skipped: SMTP is not configured.");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
    to,
    subject: `${statusLabel(status)} ${order.orderNumber}`,
    html: buildOrderEmail(order, status, products),
    text: `${statusLabel(status)}\n\n${statusMessage(status)}\n\nOrder: ${order.orderNumber}\nTotal: ${formatPrice(order.total)}`,
  });
}

async function sendAdminOrderEmail(order, products = []) {
  const transporter = getMailTransporter();
  const to = process.env.ADMIN_ORDER_EMAIL?.trim() || process.env.SMTP_USER?.trim();

  if (!transporter || !to) {
    if (!transporter) console.warn("Admin order email skipped: SMTP is not configured.");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
    to,
    subject: `New Vinex order ${order.orderNumber}`,
    html: buildOrderEmail(order, "new", products),
    text: `New Vinex order\n\nOrder: ${order.orderNumber}\nCustomer: ${orderCustomerName(order)}\nEmail: ${order.customer?.email ?? "N/A"}\nPhone: ${order.customer?.contactNumber ?? "N/A"}\nTotal: ${formatPrice(order.total)}`,
  });
}

function buildContactRequestEmail(message) {
  const fullName = escapeHtml(`${message.firstName} ${message.lastName}`.trim());

  return `
    <div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dedede;">
        <div style="padding:24px 28px;background:#050505;color:#ffffff;">
          <div style="font-size:26px;font-weight:900;line-height:1;">Vinex Nepal</div>
          <div style="margin-top:8px;color:#d6d6d6;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">New contact request</div>
        </div>
        <div style="padding:28px;">
          <h1 style="margin:0 0 18px;font-size:24px;color:#050505;">${escapeHtml(message.requestType)}</h1>
          <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.55;">
            <tr><td style="width:140px;padding:8px 0;color:#666;">Name</td><td style="padding:8px 0;color:#111;font-weight:700;">${fullName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Title</td><td style="padding:8px 0;color:#111;">${escapeHtml(message.title || "N/A")}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;color:#111;">${escapeHtml(message.email)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;color:#111;">${escapeHtml(message.phone || "N/A")}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Language</td><td style="padding:8px 0;color:#111;">${escapeHtml(message.language)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:18px;background:#f4f4f4;border:1px solid #dddddd;">
            <strong style="display:block;margin-bottom:8px;color:#050505;">Message</strong>
            <p style="margin:0;color:#111;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message.message || "No message provided.")}</p>
          </div>
          <p style="margin:18px 0 0;color:#666;font-size:13px;">Submitted at ${new Date(message.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;
}

async function sendContactRequestEmail(message) {
  const transporter = getMailTransporter();
  const to = process.env.CONTACT_REQUEST_EMAIL?.trim() || "katwalgrish@gmail.com";

  if (!transporter || !to) {
    if (!transporter) console.warn("Contact request email skipped: SMTP is not configured.");
    return false;
  }

  const fullName = `${message.firstName} ${message.lastName}`.trim();
  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
    to,
    replyTo: message.email,
    subject: `New Vinex contact request from ${fullName}`,
    html: buildContactRequestEmail(message),
    text: [
      "New Vinex contact request",
      "",
      `Type: ${message.requestType}`,
      `Name: ${fullName}`,
      `Title: ${message.title || "N/A"}`,
      `Email: ${message.email}`,
      `Phone: ${message.phone || "N/A"}`,
      `Language: ${message.language}`,
      "",
      message.message || "No message provided.",
    ].join("\n"),
  });

  return true;
}

function buildSellerApplicationEmail(application) {
  return `
    <div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dedede;">
        <div style="padding:24px 28px;background:#050505;color:#ffffff;">
          <div style="font-size:26px;font-weight:900;line-height:1;">Vinex Nepal</div>
          <div style="margin-top:8px;color:#d6d6d6;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">New seller application</div>
        </div>
        <div style="padding:28px;">
          <h1 style="margin:0 0 18px;font-size:24px;color:#050505;">${escapeHtml(application.businessName)}</h1>
          <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.55;">
            <tr><td style="width:150px;padding:8px 0;color:#666;">Contact Name</td><td style="padding:8px 0;color:#111;font-weight:700;">${escapeHtml(application.contactName)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;color:#111;">${escapeHtml(application.email)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;color:#111;">${escapeHtml(application.phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Category</td><td style="padding:8px 0;color:#111;">${escapeHtml(application.productCategory || "N/A")}</td></tr>
          </table>
          <div style="margin-top:20px;padding:18px;background:#f4f4f4;border:1px solid #dddddd;">
            <strong style="display:block;margin-bottom:8px;color:#050505;">Message</strong>
            <p style="margin:0;color:#111;white-space:pre-wrap;line-height:1.6;">${escapeHtml(application.message || "No message provided.")}</p>
          </div>
          <p style="margin:18px 0 0;color:#666;font-size:13px;">Submitted at ${new Date(application.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;
}

async function sendSellerApplicationEmail(application) {
  const transporter = getMailTransporter();
  const to = process.env.SELLER_APPLICATION_EMAIL?.trim() || process.env.CONTACT_REQUEST_EMAIL?.trim() || "katwalgrish@gmail.com";

  if (!transporter || !to) {
    if (!transporter) console.warn("Seller application email skipped: SMTP is not configured.");
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
    to,
    replyTo: application.email,
    subject: `New Vinex seller application from ${application.businessName}`,
    html: buildSellerApplicationEmail(application),
    text: [
      "New Vinex seller application",
      "",
      `Business: ${application.businessName}`,
      `Contact: ${application.contactName}`,
      `Email: ${application.email}`,
      `Phone: ${application.phone}`,
      `Category: ${application.productCategory || "N/A"}`,
      "",
      application.message || "No message provided.",
    ].join("\n"),
  });

  return true;
}

function buildCustomerWelcomeEmail(customer) {
  const firstName = textValue(customer.name, 120).split(/\s+/)[0] || "there";
  const siteUrl = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:5173";

  return `
    <div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;">
        <div style="padding:24px 28px;background:#050505;color:#ffffff;border-bottom:4px solid #f97316;">
          <div style="font-size:28px;font-weight:900;line-height:1;">Vinex Nepal</div>
          <div style="margin-top:8px;color:#ffd1b0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">Elevate your world</div>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 10px;color:#5b6472;">Hi ${firstName},</p>
          <h1 style="margin:0 0 12px;color:#7c2d12;font-size:30px;line-height:1.1;">Your Vinex account is ready</h1>
          <p style="margin:0 0 20px;color:#1f2937;font-size:16px;line-height:1.6;">
            Thanks for creating your customer account. You can now sign in faster, keep your shopping details ready, and receive order updates from Vinex Nepal.
          </p>

          <div style="padding:16px 18px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;color:#111827;">
            <div style="margin-bottom:8px;"><strong style="color:#7c2d12;">Account name:</strong> ${customer.name}</div>
            <div><strong style="color:#7c2d12;">Email:</strong> ${customer.email}</div>
          </div>

          <table role="presentation" style="width:100%;border-collapse:collapse;margin:22px 0;">
            <tr>
              <td style="padding:14px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb;">
                <strong style="display:block;margin-bottom:6px;color:#111827;">What you can do next</strong>
                <span style="display:block;color:#4b5563;font-size:14px;line-height:1.6;">
                  Browse products, add items to cart, and use this email during checkout so order confirmations reach the right inbox.
                </span>
              </td>
            </tr>
          </table>

          <a href="${siteUrl}" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:12px;background:#ea580c;color:#ffffff;font-weight:900;text-decoration:none;">
            Visit Vinex Nepal
          </a>
        </div>
        <div style="padding:18px 28px;background:#111111;color:#d1d5db;font-size:13px;line-height:1.6;text-align:center;">
          Need help? WhatsApp us at +977 9748285909.
        </div>
      </div>
    </div>
  `;
}

async function sendCustomerWelcomeEmail(customer) {
  const transporter = getMailTransporter();
  const to = textValue(customer.email, 180);

  if (!transporter || !to) {
    if (!transporter) console.warn("Customer welcome email skipped: SMTP is not configured.");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
    to,
    subject: "Your Vinex Nepal account is ready",
    html: buildCustomerWelcomeEmail(customer),
    text: `Hi ${customer.name},\n\nYour Vinex Nepal account has been created successfully.\n\nEmail: ${customer.email}\n\nYou can now sign in faster and receive order updates from Vinex Nepal.`,
  });
}

function extractAdminToken(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length);
}

function requireAdmin(request, response, next) {
  const token = extractAdminToken(request);
  const payload = verifyAdminToken(token);

  if (!payload) {
    response.status(401).json({ message: "Admin access denied." });
    return;
  }

  request.admin = payload;
  next();
}

function buildDashboard(store) {
  const statsMap = store.productStats ?? {};
  const normalizedOrders = store.orders.map((order) => ({
    ...order,
    status: order.status ?? "new",
    orderNumber: order.orderNumber ?? buildOrderNumber(0, new Date(order.createdAt ?? Date.now())),
  }));
  const productsWithStats = store.products.map((product) => ({
    ...product,
    interestCount: Number(statsMap[product.id]?.interestCount ?? 0),
    soldCount: Number(statsMap[product.id]?.soldCount ?? 0),
  }));

  const totalRevenue = normalizedOrders.reduce((total, order) => total + Number(order.total ?? order.subtotal ?? 0), 0);
  const totalSoldUnits = productsWithStats.reduce((total, product) => total + product.soldCount, 0);
  const totalInterest = productsWithStats.reduce((total, product) => total + product.interestCount, 0);
  const customers = (store.customers ?? []).map(publicCustomer);
  const accountStats = customers.reduce(
    (stats, customer) => {
      const provider = customer.provider ?? "email";
      const loginCount = Number(customer.loginCount ?? 0);
      stats.totalUsers += 1;
      stats.totalLogins += loginCount;

      if (provider === "google") {
        stats.googleUsers += 1;
        stats.googleLogins += loginCount;
      } else if (provider === "facebook") {
        stats.facebookUsers += 1;
        stats.facebookLogins += loginCount;
      } else {
        stats.emailUsers += 1;
        stats.emailLogins += loginCount;
      }

      return stats;
    },
    {
      totalUsers: 0,
      emailUsers: 0,
      googleUsers: 0,
      facebookUsers: 0,
      totalLogins: 0,
      emailLogins: 0,
      googleLogins: 0,
      facebookLogins: 0,
    },
  );

  return {
    overview: {
      totalProducts: store.products.length,
      totalOrders: normalizedOrders.length,
      totalRevenue,
      totalSoldUnits,
      totalInterest,
      totalUsers: accountStats.totalUsers,
    },
    accountStats,
    customers: customers.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()),
    topSelling: [...productsWithStats]
      .sort((left, right) => right.soldCount - left.soldCount)
      .slice(0, 5),
    mostLoved: [...productsWithStats]
      .sort((left, right) => right.interestCount - left.interestCount)
      .slice(0, 5),
    orders: [...normalizedOrders].reverse(),
    recentOrders: [...normalizedOrders].reverse().slice(0, 8),
    products: productsWithStats,
    productRequests: [...(store.productRequests ?? [])].reverse(),
    contactMessages: [...(store.contactMessages ?? [])].reverse(),
    sellerApplications: [...(store.sellerApplications ?? [])].reverse(),
    liveChats: [...(store.liveChats ?? [])].reverse(),
    invoices: [...(store.invoices ?? [])].map(publicInvoice).reverse(),
    settings: buildSettings(store),
  };
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/products", async (_request, response) => {
  const store = await readStore();
  response.json({
    products: store.products,
    settings: buildSettings(store),
  });
});

app.get("/api/orders/track/:orderNumber", async (request, response) => {
  const orderNumber = textValue(request.params.orderNumber, 80).toUpperCase();
  const store = await readStore();
  const order = (store.orders ?? []).find((entry) => String(entry.orderNumber ?? "").toUpperCase() === orderNumber);

  if (!order) {
    response.status(404).json({ message: "Order number not found. Please check the number and try again." });
    return;
  }

  response.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status ?? "new",
      customerName: `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim(),
      items: (order.items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
      subtotal: Number(order.subtotal ?? 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
});

app.post("/api/analytics/interests", async (request, response) => {
  const productId = Number(request.body?.productId);

  if (!Number.isFinite(productId)) {
    response.status(400).json({ message: "A valid productId is required." });
    return;
  }

  await updateStore((store) => {
    const existingProduct = store.products.find((product) => product.id === productId);
    if (!existingProduct) {
      return store;
    }

    const currentStats = store.productStats?.[productId] ?? { interestCount: 0, soldCount: 0 };

    return {
      ...store,
      productStats: {
        ...store.productStats,
        [productId]: {
          ...currentStats,
          interestCount: Number(currentStats.interestCount ?? 0) + 1,
        },
      },
    };
  });

  response.json({ ok: true });
});

app.post("/api/orders/record", async (request, response) => {
  const { clientOrderId, customer, items } = request.body ?? {};

  if (!clientOrderId || typeof clientOrderId !== "string") {
    response.status(400).json({ message: "Missing checkout reference. Please refresh and try again." });
    return;
  }

  if (!customer || !Array.isArray(items) || items.length === 0) {
    response.status(400).json({ message: "Missing customer details or ordered products." });
    return;
  }

  const createdAt = new Date().toISOString();

  const nextStore = await updateStore((store) => {
    const existingOrder = store.orders.find((order) => order.clientOrderId === clientOrderId);
    if (existingOrder) {
      return store;
    }

    const itemMap = new Map();

    for (const item of items) {
      const productId = Number(item.productId ?? item.id);
      const quantity = Number(item.quantity ?? 0);
      const product = store.products.find((entry) => entry.id === productId);

      if (!product || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
        continue;
      }

      const selectedColor = textValue(item.selectedColor, 80);
      const selectedSize = textValue(item.selectedSize, 80);
      const itemKey = [productId, selectedColor, selectedSize].join("::");
      const existingItem = itemMap.get(itemKey);
      const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

      itemMap.set(itemKey, {
        productId,
        name: product.name,
        category: product.category,
        image: product.image,
        quantity: Math.min(nextQuantity, 99),
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
        total: product.price * Math.min(nextQuantity, 99),
      });
    }

    const normalizedItems = Array.from(itemMap.values());

    if (normalizedItems.length === 0) {
      return store;
    }

    const normalizedSubtotal = normalizedItems.reduce((total, item) => total + item.total, 0);
    const operations = buildSettings(store).operations;
    const couponCode = textValue(request.body?.couponCode, 40).toUpperCase();
    const matchingCoupon = operations.coupons.find(
      (coupon) => coupon.enabled !== false && String(coupon.code ?? "").toUpperCase() === couponCode,
    );
    const requestedDiscount = Number(request.body?.discount ?? 0);
    const discount = matchingCoupon
      ? Math.min(normalizedSubtotal, Number(matchingCoupon.discount ?? 0))
      : Math.max(0, Math.min(normalizedSubtotal, requestedDiscount));
    const deliveryCharge = Number(operations.deliveryCharge ?? 0);
    const total = Math.max(0, normalizedSubtotal - discount + deliveryCharge);
    const requestedPaymentMethod = textValue(request.body?.paymentMethod, 80);
    const paymentMethod = operations.paymentMethods.includes(requestedPaymentMethod)
      ? requestedPaymentMethod
      : operations.paymentMethods[0] ?? "Cash on Delivery";
    const updatedStats = { ...store.productStats };
    const orderSequence = (store.orders ?? []).length + 1;
    const orderNumber = buildOrderNumber(orderSequence, new Date(createdAt));

    for (const item of normalizedItems) {
      const productId = item.productId;
      const quantity = item.quantity;
      const currentStats = updatedStats[productId] ?? { interestCount: 0, soldCount: 0 };

      updatedStats[productId] = {
        ...currentStats,
        soldCount: Number(currentStats.soldCount ?? 0) + quantity,
      };
    }

    return {
      ...store,
      orders: [
        ...store.orders,
        {
          id: `order-${Date.now()}`,
          orderNumber,
          clientOrderId,
          status: "new",
          customer,
          items: normalizedItems,
          subtotal: normalizedSubtotal,
          discount,
          deliveryCharge,
          total,
          couponCode: matchingCoupon ? matchingCoupon.code : undefined,
          paymentMethod,
          createdAt,
        },
      ],
      productStats: updatedStats,
    };
  });

  const savedOrder = nextStore.orders.find((order) => order.clientOrderId === clientOrderId);
  if (!savedOrder) {
    response.status(400).json({ message: "No valid products were found in this order." });
    return;
  }

  try {
    await sendOrderEmail(savedOrder, "new", nextStore.products);
  } catch (error) {
    console.error("Order confirmation email failed:", error);
  }

  try {
    await sendAdminOrderEmail(savedOrder, nextStore.products);
  } catch (error) {
    console.error("Admin order email failed:", error);
  }

  response.json({ ok: true, orderCount: nextStore.orders.length, orderNumber: savedOrder.orderNumber });
});

app.post("/api/product-requests", async (request, response) => {
  const customerName = textValue(request.body?.customerName, 120);
  const contact = textValue(request.body?.contact, 160);
  const productName = textValue(request.body?.productName, 180);
  const details = textValue(request.body?.details, 900);

  if (!customerName || !contact || !productName) {
    response.status(400).json({ message: "Name, contact, and product name are required." });
    return;
  }

  const createdAt = new Date().toISOString();
  const requestId = `request-${Date.now()}`;

  const nextStore = await updateStore((store) => ({
    ...store,
    productRequests: [
      ...(store.productRequests ?? []),
      {
        id: requestId,
        status: "new",
        customerName,
        contact,
        productName,
        details,
        createdAt,
      },
    ],
  }));

  response.status(201).json({ ok: true, request: nextStore.productRequests.at(-1) });
});

app.post("/api/contact-messages", async (request, response) => {
  const requestType = textValue(request.body?.requestType, 120);
  const title = textValue(request.body?.title, 80);
  const firstName = textValue(request.body?.firstName, 120);
  const lastName = textValue(request.body?.lastName, 120);
  const email = normalizeEmail(request.body?.email);
  const phone = textValue(request.body?.phone, 80);
  const language = textValue(request.body?.language, 80) || "English";
  const message = textValue(request.body?.message, 1500);

  if (!requestType || !title || !firstName || !lastName || !email || !language) {
    response.status(400).json({ message: "Request type, title, name, email, and language are required." });
    return;
  }

  const createdAt = new Date().toISOString();
  const contactMessage = {
    id: `contact-${Date.now()}`,
    status: "new",
    requestType,
    title,
    firstName,
    lastName,
    email,
    phone,
    language,
    message,
    createdAt,
  };

  const nextStore = await updateStore((store) => ({
    ...store,
    contactMessages: [
      ...(store.contactMessages ?? []),
      contactMessage,
    ],
  }));

  let emailSent = false;
  try {
    emailSent = await sendContactRequestEmail(contactMessage);
  } catch (error) {
    console.error("Contact request email failed:", error);
  }

  response.status(201).json({
    ok: true,
    emailSent,
    message: nextStore.contactMessages.at(-1),
  });
});

app.post("/api/seller-applications", async (request, response) => {
  const businessName = textValue(request.body?.businessName, 160);
  const contactName = textValue(request.body?.contactName, 140);
  const email = normalizeEmail(request.body?.email);
  const phone = textValue(request.body?.phone, 80);
  const productCategory = textValue(request.body?.productCategory, 160);
  const message = textValue(request.body?.message, 1500);

  if (!businessName || !contactName || !email || !phone) {
    response.status(400).json({ message: "Business name, contact name, email, and phone are required." });
    return;
  }

  const createdAt = new Date().toISOString();
  const sellerApplication = {
    id: `seller-${Date.now()}`,
    status: "new",
    businessName,
    contactName,
    email,
    phone,
    productCategory,
    message,
    createdAt,
  };

  const nextStore = await updateStore((store) => ({
    ...store,
    sellerApplications: [
      ...(store.sellerApplications ?? []),
      sellerApplication,
    ],
  }));

  let emailSent = false;
  try {
    emailSent = await sendSellerApplicationEmail(sellerApplication);
  } catch (error) {
    console.error("Seller application email failed:", error);
  }

  response.status(201).json({
    ok: true,
    emailSent,
    application: nextStore.sellerApplications.at(-1),
  });
});

app.post("/api/customers/register", async (request, response) => {
  const name = textValue(request.body?.name, 120);
  const email = normalizeEmail(request.body?.email);
  const password = textValue(request.body?.password, 120);

  if (!name || !email || !password) {
    response.status(400).json({ message: "Name, email, and password are required." });
    return;
  }

  let createdCustomer = null;
  const now = new Date().toISOString();
  const nextStore = await updateStore((store) => {
    const customers = store.customers ?? [];
    const existingCustomer = customers.find((customer) => normalizeEmail(customer.email) === email);
    if (existingCustomer) {
      return store;
    }

    createdCustomer = {
      id: `customer-${Date.now()}`,
      name,
      email,
      provider: "email",
      passwordHash: hashPassword(password),
      loginCount: 1,
      createdAt: now,
      lastLoginAt: now,
    };

    return {
      ...store,
      customers: [...customers, createdCustomer],
    };
  });

  if (!createdCustomer) {
    response.status(409).json({ message: "Account already exists. Please sign in." });
    return;
  }

  try {
    await sendCustomerWelcomeEmail(createdCustomer);
  } catch (error) {
    console.error("Customer welcome email failed:", error);
  }

  response.status(201).json({ customer: publicCustomer(createdCustomer), accountStats: buildDashboard(nextStore).accountStats });
});

app.post("/api/customers/login", async (request, response) => {
  const email = normalizeEmail(request.body?.email);
  const password = textValue(request.body?.password, 120);

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required." });
    return;
  }

  let loggedInCustomer = null;
  const now = new Date().toISOString();
  const nextStore = await updateStore((store) => {
    const customers = store.customers ?? [];
    const existingCustomer = customers.find((customer) => normalizeEmail(customer.email) === email);

    if (!existingCustomer || existingCustomer.passwordHash !== hashPassword(password)) {
      return store;
    }

    return {
      ...store,
      customers: customers.map((customer) => {
        if (customer.id !== existingCustomer.id) return customer;
        loggedInCustomer = {
          ...customer,
          loginCount: Number(customer.loginCount ?? 0) + 1,
          lastLoginAt: now,
        };
        return loggedInCustomer;
      }),
    };
  });

  if (!loggedInCustomer) {
    response.status(401).json({ message: "Email or password is incorrect." });
    return;
  }

  response.json({ customer: publicCustomer(loggedInCustomer), accountStats: buildDashboard(nextStore).accountStats });
});

app.post("/api/live-chat/start", async (request, response) => {
  const customerName = textValue(request.body?.customerName, 120);
  const contact = textValue(request.body?.contact, 160);
  const message = textValue(request.body?.message, 900);

  if (!customerName || !contact || !message) {
    response.status(400).json({ message: "Name, contact, and message are required." });
    return;
  }

  const createdAt = new Date().toISOString();
  const chatId = `chat-${Date.now()}`;

  const nextStore = await updateStore((store) => ({
    ...store,
    liveChats: [
      ...(store.liveChats ?? []),
      {
        id: chatId,
        status: "open",
        customerName,
        contact,
        createdAt,
        updatedAt: createdAt,
        messages: [
          {
            id: `message-${Date.now()}`,
            sender: "customer",
            text: message,
            createdAt,
          },
        ],
      },
    ],
  }));

  response.status(201).json({ ok: true, chat: publicChat(nextStore.liveChats.at(-1)) });
});

app.get("/api/live-chat/:id", async (request, response) => {
  const chatId = textValue(request.params.id, 120);
  const store = await readStore();
  const chat = (store.liveChats ?? []).find((entry) => entry.id === chatId);

  if (!chat) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  response.json({ chat: publicChat(chat) });
});

app.post("/api/live-chat/:id/messages", async (request, response) => {
  const chatId = textValue(request.params.id, 120);
  const message = textValue(request.body?.message, 900);

  if (!message) {
    response.status(400).json({ message: "Message is required." });
    return;
  }

  const createdAt = new Date().toISOString();
  let savedChat = null;

  const nextStore = await updateStore((store) => ({
    ...store,
    liveChats: (store.liveChats ?? []).map((chat) => {
      if (chat.id !== chatId) return chat;

      savedChat = {
        ...chat,
        status: "open",
        updatedAt: createdAt,
        messages: [
          ...(chat.messages ?? []),
          {
            id: `message-${Date.now()}`,
            sender: "customer",
            text: message,
            createdAt,
          },
        ],
      };

      return savedChat;
    }),
  }));

  savedChat = savedChat ?? (nextStore.liveChats ?? []).find((chat) => chat.id === chatId);
  if (!savedChat) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  response.json({ ok: true, chat: publicChat(savedChat) });
});

app.post("/api/admin/login", (request, response) => {
  const credentials = getAdminCredentials();

  if (!credentials.username || !credentials.password) {
    response.status(500).json({
      message: "Admin access is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.",
    });
    return;
  }

  const username = String(request.body?.username ?? "").trim();
  const password = String(request.body?.password ?? "").trim();

  if (username !== credentials.username || password !== credentials.password) {
    response.status(401).json({ message: "Invalid admin credentials." });
    return;
  }

  response.json({
    ok: true,
    token: createAdminToken(username),
  });
});

app.get("/api/admin/dashboard", requireAdmin, async (_request, response) => {
  const store = await readStore();
  response.json(buildDashboard(store));
});

app.post("/api/admin/uploads", requireAdmin, async (request, response) => {
  const dataUrl = textValue(request.body?.dataUrl, 10_000_000);
  const fileName = textValue(request.body?.fileName, 180);
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp|gif|avif));base64,([a-z0-9+/=]+)$/i);

  if (!match) {
    response.status(400).json({ message: "Upload an image file in PNG, JPG, WEBP, GIF, or AVIF format." });
    return;
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) {
    response.status(400).json({ message: "Image must be smaller than 8MB." });
    return;
  }

  await mkdir(uploadsDir, { recursive: true });
  const safeFileName = sanitizeUploadFileName(fileName);
  await writeFile(path.join(uploadsDir, safeFileName), buffer);

  response.status(201).json({ url: `/uploads/${safeFileName}` });
});

app.patch("/api/admin/orders/:id/status", requireAdmin, async (request, response) => {
  const orderId = String(request.params.id ?? "").trim();
  const nextStatus = String(request.body?.status ?? "").trim();
  const allowedStatuses = new Set(["new", "processing", "shipped", "completed", "cancelled"]);

  if (!orderId) {
    response.status(400).json({ message: "Order id is required." });
    return;
  }

  if (!allowedStatuses.has(nextStatus)) {
    response.status(400).json({ message: "Invalid order status." });
    return;
  }

  let updatedOrder = null;
  let shouldEmailCustomer = false;
  const nextStore = await updateStore((store) => ({
    ...store,
    orders: store.orders.map((order) => {
      if (order.id !== orderId) return order;

      shouldEmailCustomer = (order.status ?? "new") !== nextStatus;
      updatedOrder = {
        ...order,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };

      return updatedOrder;
    }),
  }));

  if (!updatedOrder) {
    response.status(404).json({ message: "Order not found." });
    return;
  }

  if (shouldEmailCustomer) {
    try {
      await sendOrderEmail(updatedOrder, nextStatus, nextStore.products);
    } catch (error) {
      console.error("Order status email failed:", error);
    }
  }

  response.json(buildDashboard(nextStore));
});

app.post("/api/admin/invoices", requireAdmin, async (request, response) => {
  const validationError = validateInvoiceInput(request.body);

  if (validationError) {
    response.status(400).json({ message: validationError });
    return;
  }

  const now = new Date().toISOString();
  const incomingId = textValue(request.body?.id, 120);
  const sanitizedInvoice = sanitizeInvoice(request.body);
  const nextStore = await updateStore((store) => {
    const invoices = Array.isArray(store.invoices) ? store.invoices : [];
    const existingInvoice = invoices.find((invoice) => invoice.id === incomingId);
    const invoiceId = existingInvoice?.id ?? (incomingId || `invoice-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`);
    const nextInvoice = {
      ...sanitizedInvoice,
      id: invoiceId,
      createdAt: existingInvoice?.createdAt ?? now,
      updatedAt: now,
    };
    const nextInvoices = existingInvoice
      ? invoices.map((invoice) => (invoice.id === invoiceId ? nextInvoice : invoice))
      : [nextInvoice, ...invoices];

    return {
      ...store,
      invoices: nextInvoices,
    };
  });

  response.status(201).json(buildDashboard(nextStore));
});

app.delete("/api/admin/invoices/:id", requireAdmin, async (request, response) => {
  const invoiceId = textValue(request.params.id, 120);

  if (!invoiceId) {
    response.status(400).json({ message: "Invoice id is required." });
    return;
  }

  let removedInvoice = false;
  const nextStore = await updateStore((store) => {
    const invoices = Array.isArray(store.invoices) ? store.invoices : [];
    const nextInvoices = invoices.filter((invoice) => invoice.id !== invoiceId);
    removedInvoice = nextInvoices.length !== invoices.length;

    return {
      ...store,
      invoices: nextInvoices,
    };
  });

  if (!removedInvoice) {
    response.status(404).json({ message: "Invoice not found." });
    return;
  }

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/product-requests/:id/status", requireAdmin, async (request, response) => {
  const requestId = textValue(request.params.id, 120);
  const status = textValue(request.body?.status, 40) || "reviewed";

  const nextStore = await updateStore((store) => ({
    ...store,
    productRequests: (store.productRequests ?? []).map((requestEntry) =>
      requestEntry.id === requestId
        ? {
            ...requestEntry,
            status,
            updatedAt: new Date().toISOString(),
          }
        : requestEntry,
    ),
  }));

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/contact-messages/:id/status", requireAdmin, async (request, response) => {
  const messageId = textValue(request.params.id, 120);
  const status = textValue(request.body?.status, 40) || "reviewed";

  const nextStore = await updateStore((store) => ({
    ...store,
    contactMessages: (store.contactMessages ?? []).map((message) =>
      message.id === messageId
        ? {
            ...message,
            status,
            updatedAt: new Date().toISOString(),
          }
        : message,
    ),
  }));

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/seller-applications/:id/status", requireAdmin, async (request, response) => {
  const applicationId = textValue(request.params.id, 120);
  const status = textValue(request.body?.status, 40) || "reviewed";

  const nextStore = await updateStore((store) => ({
    ...store,
    sellerApplications: (store.sellerApplications ?? []).map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status,
            updatedAt: new Date().toISOString(),
          }
        : application,
    ),
  }));

  response.json(buildDashboard(nextStore));
});

app.post("/api/admin/live-chats/:id/reply", requireAdmin, async (request, response) => {
  const chatId = textValue(request.params.id, 120);
  const message = textValue(request.body?.message, 900);

  if (!message) {
    response.status(400).json({ message: "Reply message is required." });
    return;
  }

  const createdAt = new Date().toISOString();
  let chatFound = false;

  const nextStore = await updateStore((store) => ({
    ...store,
    liveChats: (store.liveChats ?? []).map((chat) => {
      if (chat.id !== chatId) return chat;
      chatFound = true;

      return {
        ...chat,
        status: "answered",
        updatedAt: createdAt,
        messages: [
          ...(chat.messages ?? []),
          {
            id: `message-${Date.now()}`,
            sender: "admin",
            text: message,
            createdAt,
          },
        ],
      };
    }),
  }));

  if (!chatFound) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/settings/flash-sale", requireAdmin, async (request, response) => {
  const enabled = Boolean(request.body?.enabled);
  const endsAt = String(request.body?.endsAt ?? "").trim();

  if (enabled && !endsAt) {
    response.status(400).json({ message: "Flash sale end time is required." });
    return;
  }

  if (enabled && Number.isNaN(Date.parse(endsAt))) {
    response.status(400).json({ message: "Flash sale end time is invalid." });
    return;
  }

  const nextStore = await updateStore((store) => ({
    ...store,
    settings: {
      ...store.settings,
      flashSale: {
        enabled,
        endsAt: enabled ? new Date(endsAt).toISOString() : null,
      },
    },
  }));

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/settings/page-content", requireAdmin, async (request, response) => {
  const nextPageContent = {};
  const promoCards = Array.isArray(request.body?.heroPromos) ? request.body.heroPromos : [];

  if (promoCards.length !== defaultPageContent.heroPromos.length) {
    response.status(400).json({ message: "All hero promo cards are required." });
    return;
  }

  for (const key of Object.keys(defaultPageContent)) {
    if (key === "heroPromos") {
      nextPageContent.heroPromos = promoCards.map((promo, index) => {
        const title = textValue(promo?.title, 60);
        const subtitle = textValue(promo?.subtitle, 80);
        const image = textValue(promo?.image, 500);

        if (!title || !subtitle || !image) {
          response.status(400).json({ message: `Missing hero promo card ${index + 1}.` });
          return null;
        }

        return { title, subtitle, image };
      });

      if (nextPageContent.heroPromos.some((promo) => promo === null)) {
        return;
      }

      continue;
    }

    if (key === "collectionProductIds") {
      nextPageContent.collectionProductIds = Array.isArray(request.body?.collectionProductIds)
        ? request.body.collectionProductIds.map((productId) => Number(productId)).filter(Number.isFinite)
        : [];
      continue;
    }

    if (key === "flashProductIds") {
      nextPageContent.flashProductIds = Array.isArray(request.body?.flashProductIds)
        ? request.body.flashProductIds.map((productId) => Number(productId)).filter(Number.isFinite)
        : [];
      continue;
    }

    if (key === "homeHeroImages") {
      nextPageContent.homeHeroImages = Array.isArray(request.body?.homeHeroImages)
        ? request.body.homeHeroImages.map((image) => textValue(image, 500)).filter(Boolean)
        : [];

      if (nextPageContent.homeHeroImages.length < 3) {
        response.status(400).json({ message: "Three hero carousel images are required." });
        return;
      }

      continue;
    }

    const value = String(request.body?.[key] ?? "").trim();
    if (!value) {
      response.status(400).json({ message: `Missing ${key}.` });
      return;
    }
    nextPageContent[key] = value;
  }

  const nextStore = await updateStore((store) => ({
    ...store,
    settings: {
      ...store.settings,
      pageContent: nextPageContent,
    },
  }));

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/settings/about-content", requireAdmin, async (request, response) => {
  const storyImages = Array.isArray(request.body?.storyImages)
    ? request.body.storyImages.map((image) => textValue(image, 500)).filter(Boolean)
    : [];
  const storyParagraphs = Array.isArray(request.body?.storyParagraphs)
    ? request.body.storyParagraphs.map((paragraph) => textValue(paragraph, 1200)).filter(Boolean)
    : [];
  const galleryImages = Array.isArray(request.body?.galleryImages)
    ? request.body.galleryImages.map((image) => textValue(image, 500)).filter(Boolean)
    : [];
  const socialLinks = Array.isArray(request.body?.socialLinks)
    ? request.body.socialLinks
        .map((link) => ({
          label: textValue(link?.label, 80),
          url: textValue(link?.url, 500),
        }))
        .filter((link) => link.label && link.url)
    : [];
  const teamMembers = Array.isArray(request.body?.teamMembers)
    ? request.body.teamMembers
        .map((member) => ({
          name: textValue(member?.name, 100),
          titles: Array.isArray(member?.titles)
            ? member.titles.map((title) => textValue(title, 80)).filter(Boolean)
            : [],
          message: textValue(member?.message, 900),
          imageLabel: textValue(member?.imageLabel, 120),
          imageSrc: textValue(member?.imageSrc, 500),
        }))
        .filter((member) => member.name && member.titles.length > 0 && member.message && member.imageLabel && member.imageSrc)
    : [];

  const nextAboutContent = {
    heroMetaLeft: textValue(request.body?.heroMetaLeft, 80),
    heroMetaRight: textValue(request.body?.heroMetaRight, 80),
    heroTitle: textValue(request.body?.heroTitle, 600),
    storyImages,
    teamMembers,
    storyHeadline: textValue(request.body?.storyHeadline, 700),
    storyParagraphs,
    galleryLogo: textValue(request.body?.galleryLogo, 500),
    galleryText: textValue(request.body?.galleryText, 500),
    galleryImages,
    socialLinks,
  };

  if (!nextAboutContent.heroMetaLeft || !nextAboutContent.heroMetaRight || !nextAboutContent.heroTitle) {
    response.status(400).json({ message: "About hero content is required." });
    return;
  }

  if (storyImages.length < 3 || galleryImages.length < 4 || teamMembers.length < 2 || storyParagraphs.length < 1) {
    response.status(400).json({ message: "About story images, team members, gallery images, and story paragraphs are required." });
    return;
  }

  if (!nextAboutContent.storyHeadline || !nextAboutContent.galleryLogo || !nextAboutContent.galleryText || socialLinks.length < 1) {
    response.status(400).json({ message: "About story and gallery content is required." });
    return;
  }

  const nextStore = await updateStore((store) => ({
    ...store,
    settings: {
      ...store.settings,
      aboutContent: nextAboutContent,
    },
  }));

  response.json(buildDashboard(nextStore));
});

app.patch("/api/admin/settings/operations", requireAdmin, async (request, response) => {
  const categories = Array.isArray(request.body?.categories)
    ? request.body.categories.map((category) => textValue(category, 80)).filter(Boolean)
    : [];
  const paymentMethods = Array.isArray(request.body?.paymentMethods)
    ? request.body.paymentMethods.map((method) => textValue(method, 80)).filter(Boolean)
    : [];
  const coupons = Array.isArray(request.body?.coupons)
    ? request.body.coupons
        .map((coupon) => ({
          code: textValue(coupon?.code, 40).toUpperCase(),
          discount: Number(coupon?.discount ?? 0),
          enabled: coupon?.enabled !== false,
        }))
        .filter((coupon) => coupon.code && Number.isFinite(coupon.discount) && coupon.discount >= 0)
    : [];
  const deliveryCharge = Number(request.body?.deliveryCharge ?? 0);
  const stringSetting = (key, fallback, maxLength = 140) => textValue(request.body?.[key], maxLength) || fallback;

  if (categories.length === 0) {
    response.status(400).json({ message: "At least one category is required." });
    return;
  }

  if (paymentMethods.length === 0) {
    response.status(400).json({ message: "At least one payment method is required." });
    return;
  }

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    response.status(400).json({ message: "Delivery charge must be zero or more." });
    return;
  }

  const nextStore = await updateStore((store) => ({
    ...store,
    settings: {
      ...store.settings,
      operations: {
        ...defaultOperations,
        categories,
        coupons,
        deliveryCharge,
        paymentMethods,
        showCategorySection: request.body?.showCategorySection !== false,
        showBestProductsSection: request.body?.showBestProductsSection !== false,
        showFeaturedSection: request.body?.showFeaturedSection !== false,
        showBestSellersSection: request.body?.showBestSellersSection !== false,
        showNewArrivalsSection: request.body?.showNewArrivalsSection !== false,
        showTrustSection: request.body?.showTrustSection !== false,
        showRelatedProducts: request.body?.showRelatedProducts !== false,
        showProductPageIntro: request.body?.showProductPageIntro !== false,
        homeCategoryTitle: stringSetting("homeCategoryTitle", defaultOperations.homeCategoryTitle),
        homeBestProductsTitle: stringSetting("homeBestProductsTitle", defaultOperations.homeBestProductsTitle),
        homeFeaturedTitle: stringSetting("homeFeaturedTitle", defaultOperations.homeFeaturedTitle),
        homeBestSellersTitle: stringSetting("homeBestSellersTitle", defaultOperations.homeBestSellersTitle),
        homeNewArrivalsTitle: stringSetting("homeNewArrivalsTitle", defaultOperations.homeNewArrivalsTitle),
        homeTrustTitle: stringSetting("homeTrustTitle", defaultOperations.homeTrustTitle),
        productPageTag: stringSetting("productPageTag", defaultOperations.productPageTag),
        productPageTitle: stringSetting("productPageTitle", defaultOperations.productPageTitle),
        productPageText: stringSetting("productPageText", defaultOperations.productPageText, 260),
        relatedProductsTitle: stringSetting("relatedProductsTitle", defaultOperations.relatedProductsTitle),
        supportPageTag: stringSetting("supportPageTag", defaultOperations.supportPageTag),
        supportPageTitle: stringSetting("supportPageTitle", defaultOperations.supportPageTitle),
        supportPageText: stringSetting("supportPageText", defaultOperations.supportPageText, 360),
        supportContactTitle: stringSetting("supportContactTitle", defaultOperations.supportContactTitle),
        supportContactText: stringSetting("supportContactText", defaultOperations.supportContactText, 360),
        supportPhone: stringSetting("supportPhone", defaultOperations.supportPhone),
        supportWhatsappUrl: stringSetting("supportWhatsappUrl", defaultOperations.supportWhatsappUrl, 500),
        supportInstagramUrl: stringSetting("supportInstagramUrl", defaultOperations.supportInstagramUrl, 500),
        supportInstagramLabel: stringSetting("supportInstagramLabel", defaultOperations.supportInstagramLabel),
        supportTiktokUrl: stringSetting("supportTiktokUrl", defaultOperations.supportTiktokUrl, 500),
        supportTiktokLabel: stringSetting("supportTiktokLabel", defaultOperations.supportTiktokLabel),
        supportHoursTag: stringSetting("supportHoursTag", defaultOperations.supportHoursTag),
        supportHoursTitle: stringSetting("supportHoursTitle", defaultOperations.supportHoursTitle),
        supportHoursText: stringSetting("supportHoursText", defaultOperations.supportHoursText, 260),
      },
    },
  }));

  response.json(buildDashboard(nextStore));
});

app.get("/api/admin/products", requireAdmin, async (_request, response) => {
  const store = await readStore();
  response.json({ products: store.products });
});

app.post("/api/admin/products", requireAdmin, async (request, response) => {
  const validationMessage = validateProductInput(request.body);
  if (validationMessage) {
    response.status(400).json({ message: validationMessage });
    return;
  }

  const nextStore = await updateStore((store) => {
    const product = sanitizeProduct({
      ...request.body,
      id: store.nextProductId,
    });

    return {
      ...store,
      nextProductId: store.nextProductId + 1,
      products: [...store.products, product],
      productStats: {
        ...store.productStats,
        [product.id]: { interestCount: 0, soldCount: 0 },
      },
    };
  });

  response.status(201).json({ products: nextStore.products });
});

app.put("/api/admin/products/:id", requireAdmin, async (request, response) => {
  const validationMessage = validateProductInput(request.body);
  if (validationMessage) {
    response.status(400).json({ message: validationMessage });
    return;
  }

  const productId = Number(request.params.id);
  if (!Number.isFinite(productId)) {
    response.status(400).json({ message: "Invalid product id." });
    return;
  }

  const nextStore = await updateStore((store) => ({
    ...store,
    products: store.products.map((product) =>
      product.id === productId ? sanitizeProduct({ ...request.body, id: productId }) : product,
    ),
  }));

  response.json({ products: nextStore.products });
});

app.delete("/api/admin/products/:id", requireAdmin, async (request, response) => {
  const productId = Number(request.params.id);
  if (!Number.isFinite(productId)) {
    response.status(400).json({ message: "Invalid product id." });
    return;
  }

  const nextStore = await updateStore((store) => {
    const remainingProducts = store.products.filter((product) => product.id !== productId);
    const remainingStats = { ...store.productStats };
    delete remainingStats[productId];

    return {
      ...store,
      products: remainingProducts,
      productStats: remainingStats,
    };
  });

  response.json({ products: nextStore.products });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
