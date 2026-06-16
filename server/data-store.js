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

const defaultStore = {
  nextProductId: 3,
  settings: {
    flashSale: {
      enabled: true,
      endsAt: new Date(Date.now() + (((3 * 24 + 22) * 60 + 35) * 60 + 22) * 1000).toISOString(),
    },
    pageContent: defaultPageContent,
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
  customers: [],
  productRequests: [],
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
