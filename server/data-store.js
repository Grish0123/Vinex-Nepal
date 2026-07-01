import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const storeFile = path.join(dataDir, "store.json");

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
  electronicsTitle: "Electronics Products",
  electronicsProductIds: [1, 2, 3],
  garmentsTitle: "Garment Products",
  garmentsProductIds: [5, 6, 7],
  shoesTitle: "Shoes",
  shoesProductIds: [11, 12, 13],
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
  sectionTitle: "Built for everyday.",
  sectionText:
    "Premium tech, clean style, and daily essentials curated for Nepal.",
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

const defaultStore = {
  nextProductId: 3,
  settings: {
    flashSale: {
      enabled: true,
      endsAt: new Date(Date.now() + (((3 * 24 + 22) * 60 + 35) * 60 + 22) * 1000).toISOString(),
    },
    pageContent: defaultPageContent,
    aboutContent: defaultAboutContent,
    operations: {
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
    },
  },
  products: [
    {
      id: 1,
      name: "Airbuds Pro 2",
      price: 4499,
      originalPrice: 7000,
      featured: true,
      category: "Audio",
      supplierName: "Vinex Nepal",
      image: "/images/products/airbuds-display.png",
      hoverImage: "/images/products/airbuds-hover.png",
      galleryImages: [
        "/images/products/airbuds-display.png",
        "/images/products/airbuds-hover.png",
        "/images/products/airbuds-iphone-connection.png",
      ],
      colorOptions: ["White", "Black"],
      sizeOptions: ["Standard"],
      inStock: true,
      description:
        "Premium wireless airbuds with deep bass, long battery life, and a sharp launch discount for fast movers.",
    },
    {
      id: 2,
      name: "Apple Watch Series 9",
      price: 4499,
      originalPrice: 7000,
      featured: true,
      category: "Wearables",
      supplierName: "Vinex Nepal",
      image:
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
      hoverImage: "/images/products/watch-hover.png",
      galleryImages: [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
        "/images/products/watch-hover.png",
      ],
      colorOptions: ["Midnight", "Silver", "Pink"],
      sizeOptions: ["41mm", "45mm"],
      inStock: true,
      description:
        "A clean, premium smartwatch deal with polished styling, fitness tracking, and an aggressive flash-sale price.",
    },
  ],
  orders: [],
  invoices: [],
  customers: [],
  productRequests: [],
  contactMessages: [],
  liveChats: [],
  productStats: {
    1: { interestCount: 0, soldCount: 0 },
    2: { interestCount: 0, soldCount: 0 },
  },
};

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(storeFile, "utf8");
  } catch {
    await writeFile(storeFile, JSON.stringify(defaultStore, null, 2));
  }
}

export async function readStore() {
  await ensureStoreFile();
  const raw = await readFile(storeFile, "utf8");
  return JSON.parse(raw);
}

export async function writeStore(store) {
  await ensureStoreFile();
  await writeFile(storeFile, JSON.stringify(store, null, 2));
}

export async function updateStore(updater) {
  const currentStore = await readStore();
  const nextStore = await updater(currentStore);
  await writeStore(nextStore);
  return nextStore;
}
