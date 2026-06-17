import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { PageContentSettings, StoreOperationSettings } from "../../lib/api";
import type { Product } from "../../types/product";
import styles from "./HomePage.module.scss";

type HomePageProps = {
  products: Product[];
  flashSaleSettings: {
    enabled: boolean;
    endsAt: string | null;
  };
  pageContent: PageContentSettings;
  storeOperations: StoreOperationSettings;
  onBrowseProducts: () => void;
  onOpenProduct: (productId: number) => void;
};

function HomeHeroImage() {
  return (
    <section className={styles.heroImageSection} aria-label="Featured collection">
      <img className={styles.heroImage} src="/images/Herosection.png" alt="" aria-hidden="true" />
    </section>
  );
}

function BrandIntroSection() {
  return (
    <section className={styles.brandIntro} aria-label="About Vinex Nepal">
      <div className={styles.brandIntroLogo}>
        <img src="/images/brand/VinexLogo.png" alt="Vinex Nepal" />
      </div>
      <p>
        Vinex Nepal is built for everyday style, useful tech, and smart essentials that feel easy to choose and better to own. We bring clean, reliable products together with a shopping experience made for Nepal.
      </p>
    </section>
  );
}

const defaultFlashProduct: Product = {
  id: 0,
  name: "Airbuds Pro 2",
  price: 4499,
  originalPrice: 7000,
  category: "Audio",
  image: "/images/products/airbuds-display.png",
  hoverImage: "/images/products/airbuds-hover.png",
  description: "Premium wireless audio with deep bass, all-day battery life, and a clean launch discount.",
};

function CollectionSection({ products, onBrowseProducts }: { products: Product[]; onBrowseProducts: () => void }) {
  const airbudsProduct = products.find((product) => product.name.toLowerCase().includes("airbud")) ?? products[0];
  const watchProduct = products.find((product) => product.name.toLowerCase().includes("watch")) ?? products[1];
  const collectionProducts = [
    {
      title: airbudsProduct?.name ?? "Airbuds Pro 2",
      price: airbudsProduct ? `Rs ${airbudsProduct.price.toLocaleString()}` : "Rs 4,499",
      image: airbudsProduct?.image ?? "/images/products/airbuds-display.png",
      hoverImage: airbudsProduct?.hoverImage,
      productId: airbudsProduct?.id,
      tone: "light",
    },
    {
      title: watchProduct?.name ?? "Apple Watch Series 9",
      price: watchProduct ? `Rs ${watchProduct.price.toLocaleString()}` : "Rs 4,499",
      image: "/images/products/watch.png",
      hoverImage: "/images/products/watch-hover.png",
      productId: watchProduct?.id,
      tone: "soft",
    },
    {
      title: "Headphones",
      price: "Coming Soon",
      image: "/images/products/headphones.png",
      hoverImage: "/images/products/headphones-hover.png",
      productId: undefined,
      tone: "soft",
    },
  ];

  return (
    <section className={styles.collectionSection} aria-labelledby="home-collection-title">
      <h2 id="home-collection-title">
        <span aria-hidden="true">•</span>
        Our Collection
      </h2>
      <div className={styles.collectionGrid}>
        {collectionProducts.map((product) => {
          const content = (
            <>
              <span className={`${styles.collectionImageWrap} ${product.tone === "soft" ? styles.collectionImageWrapSoft : ""}`}>
                <img
                  className={`${styles.collectionImagePrimary} ${product.hoverImage ? styles.collectionImagePrimaryWithHover : ""}`}
                  src={product.image}
                  alt=""
                  aria-hidden="true"
                />
                {product.hoverImage ? (
                  <img className={styles.collectionImageHover} src={product.hoverImage} alt="" aria-hidden="true" />
                ) : null}
                <span className={styles.collectionSelect}>Select</span>
              </span>
              <span className={styles.collectionMeta}>
                <strong>{product.title}</strong>
                <span>{product.price}</span>
              </span>
            </>
          );

          return (
            <button
              className={styles.collectionCard}
              key={product.title}
              type="button"
              onClick={onBrowseProducts}
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FlashSaleParallaxSection({
  products,
  onOpenProduct,
  y,
}: {
  products: Product[];
  onOpenProduct: (productId: number) => void;
  y: MotionValue<string>;
}) {
  const flashProducts = (products.length > 0 ? products : [defaultFlashProduct])
    .filter((product) => product.originalPrice && product.originalPrice > product.price)
    .slice(0, 3);
  const visibleFlashProducts = flashProducts.length > 0 ? flashProducts : (products.length > 0 ? products : [defaultFlashProduct]).slice(0, 3);
  const featuredProduct = visibleFlashProducts[0] ?? defaultFlashProduct;
  const discountPercentage = featuredProduct.originalPrice
    ? Math.round(((featuredProduct.originalPrice - featuredProduct.price) / featuredProduct.originalPrice) * 100)
    : 0;
  const featureAccentStyle = {
    "--flash-image": `url(${featuredProduct.hoverImage ?? featuredProduct.image})`,
  } as CSSProperties;

  return (
    <motion.section className={styles.flashParallaxSection} style={{ ...featureAccentStyle, y }} aria-labelledby="flash-sale-title">
      <div className={styles.flashPanel} style={featureAccentStyle}>
        <div className={styles.flashCopy}>
          <span className={styles.flashEyebrow}>Flash Sale</span>
          <p className={styles.flashDescription}>
            Limited-time Vinex picks with sharp pricing, clean utility, and fast local support.
          </p>
          <div className={styles.flashTitleRow}>
            <h2 id="flash-sale-title">{featuredProduct.name}</h2>
            <strong>001</strong>
          </div>
          <div className={styles.flashPriceRow}>
            {featuredProduct.originalPrice ? <span>Rs {featuredProduct.originalPrice.toLocaleString()}</span> : null}
            <strong>Rs {featuredProduct.price.toLocaleString()}</strong>
            {discountPercentage > 0 ? <em>{discountPercentage}% off</em> : null}
          </div>
          <div className={styles.flashMiniProducts} aria-label="Flash sale product">
            <button
              key={featuredProduct.id || featuredProduct.name}
              type="button"
              onClick={() => {
                if (featuredProduct.id) {
                  onOpenProduct(featuredProduct.id);
                }
              }}
            >
              <img src={featuredProduct.hoverImage ?? featuredProduct.image} alt="" aria-hidden="true" />
              <span>{featuredProduct.name}</span>
            </button>
          </div>
          <button
            className={styles.flashQuickAdd}
            type="button"
            onClick={() => {
              if (featuredProduct.id) {
                onOpenProduct(featuredProduct.id);
              }
            }}
          >
            Quick Add
          </button>
        </div>
        <button
          className={styles.flashImagePane}
          type="button"
          onClick={() => {
            if (featuredProduct.id) {
              onOpenProduct(featuredProduct.id);
            }
          }}
        >
          <img src={featuredProduct.hoverImage ?? featuredProduct.image} alt={featuredProduct.name} />
        </button>
      </div>
    </motion.section>
  );
}

function CollectionStackSection({
  products,
  onOpenProduct,
  onBrowseProducts,
}: {
  products: Product[];
  onOpenProduct: (productId: number) => void;
  onBrowseProducts: () => void;
}) {
  const stackRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const flashY = useTransform(scrollYProgress, [0.18, 0.62], ["100vh", "0vh"]);

  return (
    <section ref={stackRef} className={styles.stackScene}>
      <div className={styles.stackSticky}>
        <CollectionSection products={products} onBrowseProducts={onBrowseProducts} />
        <FlashSaleParallaxSection products={products} onOpenProduct={onOpenProduct} y={flashY} />
      </div>
    </section>
  );
}

function ShopNowImageSection({ onBrowseProducts }: { onBrowseProducts: () => void }) {
  return (
    <section className={styles.shopNowImageSection} aria-label="Shop Vinex Nepal">
      <img className={styles.shopNowImage} src="/images/shopnow.png" alt="" aria-hidden="true" />
      <button className={styles.shopNowButton} type="button" onClick={onBrowseProducts}>
        Shop Now
      </button>
    </section>
  );
}

export function HomePage({ products, onOpenProduct, onBrowseProducts }: HomePageProps) {
  return (
    <main className={`${styles.page} page-shell homepage-shell`}>
      <HomeHeroImage />
      <BrandIntroSection />
      <CollectionStackSection products={products} onOpenProduct={onOpenProduct} onBrowseProducts={onBrowseProducts} />
      <ShopNowImageSection onBrowseProducts={onBrowseProducts} />
    </main>
  );
}
