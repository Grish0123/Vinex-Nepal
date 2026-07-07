import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionTemplate, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
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

function HomeHeroImage({
  images,
  title,
  text,
  buttonText,
  onBrowseProducts,
}: {
  images: string[];
  title: string;
  text: string;
  buttonText: string;
  onBrowseProducts: () => void;
}) {
  const heroImages = images.filter(Boolean);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const titleParts = title.replace(/,\s+/g, ", ").split(/,\s*(?=front\b)/i);

  useEffect(() => {
    if (heroImages.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  useEffect(() => {
    if (activeImageIndex >= heroImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, heroImages.length]);

  return (
    <section className={styles.heroImageSection} aria-label="Featured collection">
      {heroImages.map((image, index) => (
        <img
          className={`${styles.heroImage} ${index === activeImageIndex ? styles.heroImageActive : ""}`}
          src={image}
          alt=""
          aria-hidden="true"
          key={`${image}-${index}`}
        />
      ))}
      <div className={styles.heroImageOverlay} aria-hidden="true" />
      <motion.div
        className={`${styles.heroImageCopy} ${styles.heroImageCopyRight}`}
        key={activeImageIndex}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>
          {titleParts.length > 1 ? (
            <>
              {titleParts[0]},
              <br />
              {titleParts.slice(1).join(", ")}
            </>
          ) : (
            title
          )}
        </h1>
        <p>{text}</p>
        <button type="button" onClick={onBrowseProducts}>
          {buttonText}
        </button>
      </motion.div>
    </section>
  );
}

function DeliveryPartnerBadge({ side, onDismiss }: { side: "left" | "right"; onDismiss: () => void }) {
  return (
    <aside
      className={`${styles.deliveryPartnerBadge} ${
        side === "right" ? styles.deliveryPartnerBadgeRight : styles.deliveryPartnerBadgeLeft
      }`}
      aria-label="Our delivery partner: Nepal Can Move"
    >
      <button className={styles.deliveryPartnerClose} type="button" onClick={onDismiss} aria-label="Hide Nepal Can Move badge">
        X
      </button>
      <div className={styles.deliveryPartnerInner}>
        <div className={styles.deliveryPartnerLogoBox}>
          <div className={styles.deliveryPartnerLogoMark} role="img" aria-label="Nepal Can Move" />
        </div>
      </div>
    </aside>
  );
}

function BrandIntroSection({ text }: { text: string }) {
  return (
    <section className={styles.brandIntro} aria-label="About Vinex Nepal">
      <div className={styles.brandIntroLogo}>
        <img src="/images/Logo Vinex.svg" alt="Vinex Nepal" />
      </div>
      <div className={styles.brandIntroCopy}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.p>
      </div>
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

function CollectionSection({
  products,
  collectionProductIds,
  title,
  onOpenProduct,
}: {
  products: Product[];
  collectionProductIds: number[];
  title: string;
  onOpenProduct: (productId: number) => void;
}) {
  const titleId = useId();
  const selectedProducts = collectionProductIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is Product => Boolean(product));
  const collectionProducts = selectedProducts.length > 0
    ? selectedProducts
    : products.filter((product) => product.featured).slice(0, 3);
  const visibleCollectionProducts = collectionProducts.length > 0 ? collectionProducts : products.slice(0, 3);

  return (
    <section className={styles.collectionSection} aria-labelledby={titleId}>
      <h2 id={titleId}>
        <span aria-hidden="true">•</span>
        {title}
      </h2>
      <div className={styles.collectionGrid}>
        {visibleCollectionProducts.map((product) => {
          const discountPercentage = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
          const content = (
            <>
              <span className={styles.collectionImageWrap}>
                <img
                  className={`${styles.collectionImagePrimary} ${product.hoverImage ? styles.collectionImagePrimaryWithHover : ""}`}
                  src={product.image}
                  alt=""
                  aria-hidden="true"
                />
                {product.hoverImage ? (
                  <img className={styles.collectionImageHover} src={product.hoverImage} alt="" aria-hidden="true" />
                ) : null}
                {discountPercentage > 0 ? (
                  <span className={styles.collectionDiscountBadge}>{discountPercentage}% OFF</span>
                ) : null}
                {product.inStock === false ? <span className={styles.collectionStockBadge}>Out of Stock</span> : null}
                <span className={styles.collectionSelect}>Select</span>
              </span>
              <span className={styles.collectionMeta}>
                <strong>{product.name}</strong>
                <span>Rs {product.price.toLocaleString()}</span>
              </span>
            </>
          );

          return (
            <button
              className={styles.collectionCard}
              key={product.id}
              type="button"
              onClick={() => {
                onOpenProduct(product.id);
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function resolveFlashProducts(products: Product[], flashProductIds: number[]) {
  const selectedProducts = flashProductIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is Product => Boolean(product));
  const discountedProducts = (products.length > 0 ? products : [defaultFlashProduct])
    .filter((product) => product.originalPrice && product.originalPrice > product.price)
    .slice(0, 3);

  return selectedProducts.length > 0
    ? selectedProducts
    : discountedProducts.length > 0
      ? discountedProducts
      : (products.length > 0 ? products : [defaultFlashProduct]).slice(0, 3);
}

function FlashProductPanel({
  product,
  index,
  productCount,
  flashSaleSettings,
  pageContent,
  onOpenProduct,
  y,
}: {
  product: Product;
  index: number;
  productCount: number;
  flashSaleSettings: HomePageProps["flashSaleSettings"];
  pageContent: PageContentSettings;
  onOpenProduct: (productId: number) => void;
  y: MotionValue<string>;
}) {
  const [now, setNow] = useState(() => Date.now());
  const endsAtTime = flashSaleSettings.endsAt ? new Date(flashSaleSettings.endsAt).getTime() : 0;
  const remainingSeconds = Math.max(0, Math.floor((endsAtTime - now) / 1000));
  const showCountdown = flashSaleSettings.enabled && remainingSeconds > 0;
  const countdownParts = useMemo(
    () => [
      { label: "Days", value: Math.floor(remainingSeconds / 86400) },
      { label: "Hours", value: Math.floor((remainingSeconds % 86400) / 3600) },
      { label: "Min", value: Math.floor((remainingSeconds % 3600) / 60) },
      { label: "Sec", value: remainingSeconds % 60 },
    ],
    [remainingSeconds],
  );
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const featureAccentStyle = {
    "--flash-image": `url(${product.hoverImage ?? product.image})`,
  } as CSSProperties;

  useEffect(() => {
    if (!flashSaleSettings.enabled || !flashSaleSettings.endsAt) {
      return undefined;
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [flashSaleSettings.enabled, flashSaleSettings.endsAt]);

  return (
    <motion.div
      className={styles.flashPanelLayer}
      style={{ y, zIndex: index + 1 }}
      aria-label={`${product.name} flash sale panel`}
    >
      <div className={styles.flashPanel} style={featureAccentStyle}>
        <div className={styles.flashCopy}>
          <span className={styles.flashEyebrow}>{pageContent.flashTag}</span>
          {!showCountdown && pageContent.flashInactiveText ? (
            <p className={styles.flashDescription}>{pageContent.flashInactiveText}</p>
          ) : null}
          <p className={styles.flashDescription}>{pageContent.flashDescription}</p>
          {showCountdown ? (
            <div className={styles.flashCountdown} aria-label="Flash sale countdown">
              {countdownParts.map((part) => (
                <span key={part.label}>
                  <strong>{String(part.value).padStart(2, "0")}</strong>
                  <em>{part.label}</em>
                </span>
              ))}
            </div>
          ) : null}
          <div className={styles.flashTitleRow}>
            <h2 id={index === 0 ? "flash-sale-title" : undefined}>{product.name}</h2>
            <strong>{String(index + 1).padStart(3, "0")}</strong>
          </div>
          <div className={styles.flashPriceRow}>
            {product.originalPrice ? <span>Rs {product.originalPrice.toLocaleString()}</span> : null}
            <strong>Rs {product.price.toLocaleString()}</strong>
            {discountPercentage > 0 ? <em>{discountPercentage}% off</em> : null}
          </div>
          <div className={styles.flashMiniProducts} aria-label="Flash sale product">
            <button
              key={product.id || product.name}
              type="button"
              onClick={() => {
                if (product.id) {
                  onOpenProduct(product.id);
                }
              }}
            >
              <img src={product.hoverImage ?? product.image} alt="" aria-hidden="true" />
              <span>{productCount > 1 ? `${index + 1} / ${productCount}` : product.name}</span>
            </button>
          </div>
        </div>
        <button
          className={styles.flashImagePane}
          type="button"
          onClick={() => {
            if (product.id) {
              onOpenProduct(product.id);
            }
          }}
        >
          <img src={product.hoverImage ?? product.image} alt={product.name} />
        </button>
      </div>
    </motion.div>
  );
}

function FlashStackedProductPanel({
  product,
  index,
  productCount,
  scrollYProgress,
  slideStart,
  slideEnd,
  flashSaleSettings,
  pageContent,
  onOpenProduct,
}: {
  product: Product;
  index: number;
  productCount: number;
  scrollYProgress: MotionValue<number>;
  slideStart: number;
  slideEnd: number;
  flashSaleSettings: HomePageProps["flashSaleSettings"];
  pageContent: PageContentSettings;
  onOpenProduct: (productId: number) => void;
}) {
  const stackedPanelCount = Math.max(1, productCount - 1);
  const slideSlot = (slideEnd - slideStart) / stackedPanelCount;
  const start = index === 0 ? 0 : slideStart + (index - 1) * slideSlot;
  const settle = index === 0 ? 1 : start + slideSlot * 0.72;
  const end = index === 0 ? 1 : start + slideSlot;
  const panelYOffset = useTransform(
    scrollYProgress,
    [start, settle, end],
    [index === 0 ? 0 : 100, 0, 0],
  );
  const panelY = useMotionTemplate`${panelYOffset}vh`;

  return (
    <FlashProductPanel
      product={product}
      index={index}
      productCount={productCount}
      flashSaleSettings={flashSaleSettings}
      pageContent={pageContent}
      onOpenProduct={onOpenProduct}
      y={panelY}
    />
  );
}

function FlashSaleParallaxSection({
  products,
  flashSaleSettings,
  pageContent,
  onOpenProduct,
  y,
  scrollYProgress,
  slideStart,
  slideEnd,
}: {
  products: Product[];
  flashSaleSettings: HomePageProps["flashSaleSettings"];
  pageContent: PageContentSettings;
  onOpenProduct: (productId: number) => void;
  y: MotionValue<string>;
  scrollYProgress: MotionValue<number>;
  slideStart: number;
  slideEnd: number;
}) {
  const visibleFlashProducts = resolveFlashProducts(products, pageContent.flashProductIds);
  const featuredProduct = visibleFlashProducts[0] ?? defaultFlashProduct;
  const staticPanelY = useTransform(scrollYProgress, [0, 1], ["0vh", "0vh"]);
  const featureAccentStyle = {
    "--flash-image": `url(${featuredProduct.hoverImage ?? featuredProduct.image})`,
  } as CSSProperties;

  return (
    <motion.section className={styles.flashParallaxSection} style={{ ...featureAccentStyle, y }} aria-labelledby="flash-sale-title">
      {visibleFlashProducts.length > 1 ? (
        visibleFlashProducts.map((product, index) => (
          <FlashStackedProductPanel
            product={product}
            index={index}
            productCount={visibleFlashProducts.length}
            scrollYProgress={scrollYProgress}
            slideStart={slideStart}
            slideEnd={slideEnd}
            flashSaleSettings={flashSaleSettings}
            pageContent={pageContent}
            onOpenProduct={onOpenProduct}
            key={product.id || `${product.name}-${index}`}
          />
        ))
      ) : (
        <FlashProductPanel
          product={featuredProduct}
          index={0}
          productCount={1}
          flashSaleSettings={flashSaleSettings}
          pageContent={pageContent}
          onOpenProduct={onOpenProduct}
          y={staticPanelY}
        />
      )}
    </motion.section>
  );
}

function FlashSaleStackSection({
  products,
  flashSaleSettings,
  pageContent,
  onOpenProduct,
}: {
  products: Product[];
  flashSaleSettings: HomePageProps["flashSaleSettings"];
  pageContent: PageContentSettings;
  onOpenProduct: (productId: number) => void;
}) {
  const collectionSections = [
    {
      title: pageContent.collectionTitle,
      productIds: pageContent.collectionProductIds,
    },
    {
      title: pageContent.electronicsTitle,
      productIds: pageContent.electronicsProductIds,
    },
    {
      title: pageContent.garmentsTitle,
      productIds: pageContent.garmentsProductIds,
    },
  ];
  const stackRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.38,
    restDelta: 0.0008,
  });
  const panelScrollSlotVh = 140;
  const panelSettleRatio = 0.42;
  const flashProductCount = resolveFlashProducts(products, pageContent.flashProductIds).length;
  const revealPanelCount = collectionSections.length + 1;
  const stackSceneHeight = Math.max(
    300,
    100 + Math.max(0, revealPanelCount - 1) * panelScrollSlotVh + Math.max(0, flashProductCount - 1) * panelScrollSlotVh,
  );
  const flashHoldStart = 1 - 100 / (stackSceneHeight - 100);
  const revealStepCount = Math.max(1, revealPanelCount);
  const revealSlideEnd = flashProductCount > 1 ? Math.max(0.55, flashHoldStart - 0.24) : 1;
  const revealStep = revealSlideEnd / revealStepCount;
  const flashStart = collectionSections.length * revealStep;
  const flashSettle = flashStart + revealStep * panelSettleRatio;
  const stackedPanelSlideStart = Math.max(flashSettle + 0.04, flashHoldStart - 0.24);
  const stackedPanelSlideEnd = flashHoldStart;
  const flashYOffset = useTransform(
    smoothScrollYProgress,
    [flashStart, flashSettle, 1],
    [100, 0, 0],
  );
  const flashY = useMotionTemplate`${flashYOffset}vh`;
  const stackSceneStyle = {
    "--stack-scene-height": `${stackSceneHeight}vh`,
  } as CSSProperties;

  return (
    <section ref={stackRef} className={styles.stackScene} style={stackSceneStyle}>
      <div className={styles.stackSticky}>
        {collectionSections.map((section, index) => (
          <StackedCollectionPanel
            products={products}
            collectionProductIds={section.productIds}
            title={section.title}
            index={index}
            revealStep={revealStep}
            panelSettleRatio={panelSettleRatio}
            scrollYProgress={smoothScrollYProgress}
            onOpenProduct={onOpenProduct}
            key={`${section.title}-${index}`}
          />
        ))}
        <FlashSaleParallaxSection
          products={products}
          flashSaleSettings={flashSaleSettings}
          pageContent={pageContent}
          onOpenProduct={onOpenProduct}
          y={flashY}
          scrollYProgress={smoothScrollYProgress}
          slideStart={stackedPanelSlideStart}
          slideEnd={stackedPanelSlideEnd}
        />
      </div>
    </section>
  );
}

function StackedCollectionPanel({
  products,
  collectionProductIds,
  title,
  index,
  revealStep,
  panelSettleRatio,
  scrollYProgress,
  onOpenProduct,
}: {
  products: Product[];
  collectionProductIds: number[];
  title: string;
  index: number;
  revealStep: number;
  panelSettleRatio: number;
  scrollYProgress: MotionValue<number>;
  onOpenProduct: (productId: number) => void;
}) {
  const start = index === 0 ? 0 : index * revealStep;
  const settle = index === 0 ? 1 : start + revealStep * panelSettleRatio;
  const end = index === 0 ? 1 : start + revealStep;
  const panelYOffset = useTransform(
    scrollYProgress,
    [start, settle, end],
    [index === 0 ? 0 : 100, 0, 0],
  );
  const panelY = useMotionTemplate`${panelYOffset}vh`;

  return (
    <motion.div className={styles.collectionPanelLayer} style={{ y: panelY, zIndex: index + 1 }}>
      <CollectionSection
        products={products}
        collectionProductIds={collectionProductIds}
        title={title}
        onOpenProduct={onOpenProduct}
      />
    </motion.div>
  );
}

function ShopNowImageSection({ image, buttonText, onBrowseProducts }: { image: string; buttonText: string; onBrowseProducts: () => void }) {
  return (
    <section className={styles.shopNowHoldSection} aria-label="Shop Vinex Nepal">
      <div className={styles.shopNowImageSection}>
        <img className={styles.shopNowImage} src={image} alt="" aria-hidden="true" />
        <button className={styles.shopNowButton} type="button" onClick={onBrowseProducts}>
          {buttonText}
        </button>
      </div>
    </section>
  );
}

export function HomePage({ products, flashSaleSettings, pageContent, storeOperations, onOpenProduct, onBrowseProducts }: HomePageProps) {
  const heroImages = pageContent.homeHeroImages?.length ? pageContent.homeHeroImages : [pageContent.homeHeroImage];
  const [isDeliveryBadgeVisible, setIsDeliveryBadgeVisible] = useState(true);
  const showCollectionStack =
    storeOperations.showCategorySection ||
    storeOperations.showBestProductsSection ||
    storeOperations.showFeaturedSection ||
    storeOperations.showBestSellersSection ||
    storeOperations.showNewArrivalsSection;

  return (
    <main className={`${styles.page} page-shell homepage-shell`}>
      {isDeliveryBadgeVisible ? <DeliveryPartnerBadge side="left" onDismiss={() => setIsDeliveryBadgeVisible(false)} /> : null}
      <HomeHeroImage
        images={heroImages}
        title={pageContent.sectionTitle}
        text={pageContent.sectionText}
        buttonText={pageContent.heroButton}
        onBrowseProducts={onBrowseProducts}
      />
      <BrandIntroSection text={pageContent.brandIntroText} />
      {showCollectionStack ? (
        <FlashSaleStackSection
          products={products}
          flashSaleSettings={flashSaleSettings}
          pageContent={pageContent}
          onOpenProduct={onOpenProduct}
        />
      ) : null}
      <ShopNowImageSection image={pageContent.shopNowImage} buttonText={pageContent.heroButton} onBrowseProducts={onBrowseProducts} />
    </main>
  );
}
