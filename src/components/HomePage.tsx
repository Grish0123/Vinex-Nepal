import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { PageContentSettings, StoreOperationSettings } from "../lib/api";
import type { Product } from "../types/product";

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

function CountdownBox({ value, label }: { value: number; label: string }) {
  const displayValue = String(value).padStart(2, "0");

  return (
    <div key={displayValue} className="countdown-box countdown-flip">
      <strong>
        {displayValue}
      </strong>
      <span>{label}</span>
    </div>
  );
}

function getRemainingFlashSaleTime(target: number) {
  if (!Number.isFinite(target) || target <= 0) {
    return 0;
  }

  return Math.max(target - Date.now(), 0);
}

function HeroPromoCard({
  title,
  subtitle,
  image,
  product,
  onOpenProduct,
}: {
  title: string;
  subtitle: string;
  image: string;
  product: Product;
  onOpenProduct: (productId: number) => void;
}) {
  return (
    <button
      className="hero-promo-card"
      type="button"
      onClick={() => onOpenProduct(product.id)}
      aria-label={`Open ${title}: ${product.name}`}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(20, 8, 3, 0.72), rgba(20, 8, 3, 0.2)), url(${image})`,
      }}
    >
      <span>{title}</span>
      <strong>{subtitle}</strong>
    </button>
  );
}

function ProductFeedCard({ product, onOpenProduct }: { product: Product; onOpenProduct: (productId: number) => void }) {
  return (
    <button className="feed-product-card" type="button" onClick={() => onOpenProduct(product.id)}>
      <img src={product.image} alt="" aria-hidden="true" />
      <span>{product.name}</span>
      <strong>Rs {product.price.toLocaleString()}</strong>
    </button>
  );
}

function DealLane({
  title,
  products,
  onOpenProduct,
  onBrowseProducts,
}: {
  title: string;
  products: Product[];
  onOpenProduct: (productId: number) => void;
  onBrowseProducts: () => void;
}) {
  return (
    <section className="shopping-lane-card">
      <button className="shopping-lane-title" type="button" onClick={onBrowseProducts}>
        <strong>{title}</strong>
        <span aria-hidden="true">›</span>
      </button>
      <div className="shopping-lane-products">
        {products.slice(0, 2).map((product, index) => (
          <button className="shopping-lane-product" key={`${title}-${product.id}`} type="button" onClick={() => onOpenProduct(product.id)}>
            <img src={index === 1 && product.hoverImage ? product.hoverImage : product.image} alt="" aria-hidden="true" />
            <strong>Rs {product.price.toLocaleString()}</strong>
            <span>{index === 0 ? "Flash Sale" : product.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HomePage({ products, flashSaleSettings, pageContent, storeOperations, onBrowseProducts, onOpenProduct }: HomePageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchPreviewCardKey, setTouchPreviewCardKey] = useState("");
  const [visibleForYouCount, setVisibleForYouCount] = useState(8);
  const countdownTarget = flashSaleSettings.endsAt ? new Date(flashSaleSettings.endsAt).getTime() : 0;
  const [timeLeft, setTimeLeft] = useState(() => getRemainingFlashSaleTime(countdownTarget));

  useEffect(() => {
    if (products.length === 0) {
      return undefined;
    }

    const sliderInterval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % products.length);
    }, 4000);

    return () => window.clearInterval(sliderInterval);
  }, [products.length]);

  useEffect(() => {
    setActiveSlide((current) => (products.length === 0 ? 0 : current % products.length));
  }, [products.length]);

  useEffect(() => {
    if (!flashSaleSettings.enabled || countdownTarget <= 0) {
      setTimeLeft(0);
      return undefined;
    }

    const countdownInterval = window.setInterval(() => {
      setTimeLeft(getRemainingFlashSaleTime(countdownTarget));
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, [countdownTarget, flashSaleSettings.enabled]);

  useEffect(() => {
    setTimeLeft(getRemainingFlashSaleTime(countdownTarget));
  }, [countdownTarget]);

  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(timeLeft / 1000);

    return {
      days: Math.floor(totalSeconds / (60 * 60 * 24)),
      hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
      minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
      seconds: totalSeconds % 60,
    };
  }, [timeLeft]);

  const activeProduct = products[activeSlide];
  const featuredProducts = products.filter((product) => product.featured);
  const newProducts = [...products].slice(-4).reverse();
  const bestSellerProducts = [...products].sort((first, second) => first.price - second.price).slice(0, 4);
  const categoryTiles = Array.from(
    products.reduce((categoryMap, product) => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, product);
      }

      return categoryMap;
    }, new Map<string, Product>()),
  ).slice(0, 8);
  const getHeroImage = (product: Product, index: number) => {
    if (index === 0 && pageContent.heroImageOne) return pageContent.heroImageOne;
    if (index === 1 && pageContent.heroImageTwo) return pageContent.heroImageTwo;
    return product.image;
  };
  const getHeroMediaStyle = (product: Product, index: number) => {
    const isWatch = product.name.toLowerCase().includes("watch");

    return {
      backgroundImage: `linear-gradient(90deg, rgba(34, 17, 7, 0.78), rgba(34, 17, 7, 0.16)), url(${getHeroImage(product, index)})`,
      "--hero-mobile-image-position": isWatch ? "right bottom" : "center bottom",
      "--hero-mobile-image-size": isWatch ? "auto 94%" : "cover",
    } as CSSProperties;
  };
  const showTouchPreview = (cardKey: string, pointerType: string) => {
    if (pointerType !== "mouse") {
      setTouchPreviewCardKey(cardKey);
    }
  };
  const hideTouchPreview = (pointerType: string) => {
    if (pointerType !== "mouse") {
      setTouchPreviewCardKey("");
    }
  };
  const featuredProductCards = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 4);
  const forYouProducts = products;
  const visibleForYouProducts = forYouProducts.slice(0, visibleForYouCount);
  const hasMoreForYouProducts = visibleForYouCount < forYouProducts.length;
  const showFlashSaleCountdown = flashSaleSettings.enabled && timeLeft > 0;
  const heroPromos = pageContent.heroPromos?.length === 6
    ? pageContent.heroPromos
    : [
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
      ];
  const featuredProductsSection = storeOperations.showFeaturedSection ? (
    <section className="homepage-section for-you-section">
      <div className="feed-section-title">
        <span />
        <h3>For You</h3>
        <span />
      </div>
      <div className="for-you-grid" aria-label="Recommended products">
        {visibleForYouProducts.map((product) => (
          <ProductFeedCard key={product.id} product={product} onOpenProduct={onOpenProduct} />
        ))}
      </div>
      {hasMoreForYouProducts ? (
        <button className="view-more-button" type="button" onClick={() => setVisibleForYouCount((count) => count + 8)}>
          View More
        </button>
      ) : null}
    </section>
  ) : null;

  if (products.length === 0 || !activeProduct) {
    return (
      <main className="page-shell homepage-shell">
        <section className="page-intro">
          <span className="section-tag">Hot Deals</span>
          <h2>Loading products...</h2>
          <p>Your storefront is preparing the latest deals from the backend.</p>
        </section>
      </main>
    );
  }

  const hotSellerProduct = bestSellerProducts[0] ?? activeProduct;
  const newArrivalProduct = newProducts[0] ?? activeProduct;
  const featuredProduct = featuredProductCards[0] ?? activeProduct;
  const valuePickProduct = bestSellerProducts[1] ?? products[1] ?? activeProduct;
  const premiumPickProduct = featuredProductCards[1] ?? products[2] ?? activeProduct;

  return (
    <main className="page-shell homepage-shell">
      <section className="deals-banner">
        <span>{pageContent.bannerPrimary}</span>
        <span>{pageContent.bannerSecondary}</span>
        <span>{pageContent.bannerTertiary}</span>
      </section>

      <section className="hero-card hero-card-commerce">
        <aside className="hero-promo-rail" aria-label="Featured shopping shortcuts">
          <HeroPromoCard {...heroPromos[0]} product={hotSellerProduct} onOpenProduct={onOpenProduct} />
          <HeroPromoCard {...heroPromos[1]} product={newArrivalProduct} onOpenProduct={onOpenProduct} />
          <HeroPromoCard {...heroPromos[2]} product={featuredProduct} onOpenProduct={onOpenProduct} />
        </aside>

        <div className="hero-slider">
          {products.map((product, index) => (
            <article
              key={product.id}
              className={index === activeSlide ? "deal-slide deal-slide-active" : "deal-slide"}
              aria-hidden={index !== activeSlide}
            >
              <div
                className="deal-slide-media"
                onClick={() => onOpenProduct(product.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onOpenProduct(product.id);
                  }
                }}
                style={getHeroMediaStyle(product, index)}
              >
                <div className="deal-slide-copy">
                  <span className="section-tag section-tag-dark">{pageContent.heroTag}</span>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>

                  <div className="hero-price-row">
                    <span className="hero-original-price">Rs {product.originalPrice?.toLocaleString()}</span>
                    <strong className="hero-sale-price">Rs {product.price.toLocaleString()}</strong>
                    <span className="hero-discount-pill">
                      {Math.round(
                        ((Number(product.originalPrice) - product.price) / Number(product.originalPrice)) * 100,
                      )}
                      % OFF
                    </span>
                  </div>

                  <div className="hero-actions">
                    <button
                      className="primary-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onBrowseProducts();
                      }}
                    >
                      {pageContent.heroButton}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          <div className="hero-slider-dots" aria-label="Deal slides">
            {products.map((product, index) => (
              <button
                key={product.id}
                className={index === activeSlide ? "slider-dot slider-dot-active" : "slider-dot"}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${product.name}`}
              />
            ))}
          </div>
        </div>

        <aside className="hero-promo-rail hero-promo-rail-right" aria-label="More product shortcuts">
          <HeroPromoCard {...heroPromos[3]} product={valuePickProduct} onOpenProduct={onOpenProduct} />
          <HeroPromoCard {...heroPromos[4]} product={featuredProduct} onOpenProduct={onOpenProduct} />
          <HeroPromoCard {...heroPromos[5]} product={premiumPickProduct} onOpenProduct={onOpenProduct} />
        </aside>
      </section>

      {showFlashSaleCountdown ? (
        <section className="homepage-countdown-strip" aria-label="Flash sale countdown">
          <span>{pageContent.flashTag}</span>
          <strong>{pageContent.flashTitle}</strong>
          <div className="countdown-grid">
            <CountdownBox value={countdown.days} label="Days" />
            <CountdownBox value={countdown.hours} label="Hr" />
            <CountdownBox value={countdown.minutes} label="Min" />
            <CountdownBox value={countdown.seconds} label="Sec" />
          </div>
        </section>
      ) : null}

      <section className="category-showcase" aria-label="Shop by category">
        {categoryTiles.map(([category, product]) => (
          <button className="category-showcase-item" key={category} type="button" onClick={() => onOpenProduct(product.id)}>
            <span>
              <img src={product.image} alt="" aria-hidden="true" />
            </span>
            <strong>{category}</strong>
          </button>
        ))}
      </section>

      <section className="shopping-lane-grid" aria-label="Shopping highlights">
        <DealLane title="Super Deals" products={bestSellerProducts} onOpenProduct={onOpenProduct} onBrowseProducts={onBrowseProducts} />
        <DealLane title="Top Trends" products={[newArrivalProduct, featuredProduct, ...newProducts]} onOpenProduct={onOpenProduct} onBrowseProducts={onBrowseProducts} />
        <DealLane title="Brand Zone" products={[premiumPickProduct, valuePickProduct, ...featuredProductCards]} onOpenProduct={onOpenProduct} onBrowseProducts={onBrowseProducts} />
      </section>

      {featuredProductsSection}

      <section className="page-intro hot-deals-intro" id="highlights">
        <span className="section-tag">{pageContent.sectionTag}</span>
        <h2>{pageContent.sectionTitle}</h2>
        <p>{pageContent.sectionText}</p>
      </section>

      {storeOperations.showBestSellersSection ? (
        <section className="homepage-section">
          <div className="section-heading-row">
            <h3>{storeOperations.homeBestSellersTitle}</h3>
            <button className="ghost-button" onClick={onBrowseProducts}>Browse</button>
          </div>
          <div className="mini-product-row">
            {bestSellerProducts.map((product) => (
              <button className="mini-product-card" key={product.id} onClick={() => onOpenProduct(product.id)}>
                <img src={product.image} alt="" aria-hidden="true" />
                <span>{product.name}</span>
                <strong>Rs {product.price.toLocaleString()}</strong>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {storeOperations.showNewArrivalsSection ? (
        <section className="homepage-section">
          <div className="section-heading-row">
            <h3>{storeOperations.homeNewArrivalsTitle}</h3>
            <button className="ghost-button" onClick={onBrowseProducts}>Explore</button>
          </div>
          <div className="mini-product-row">
            {newProducts.map((product) => (
              <button className="mini-product-card" key={product.id} onClick={() => onOpenProduct(product.id)}>
                <img src={product.image} alt="" aria-hidden="true" />
                <span>{product.name}</span>
                <strong>{product.category}</strong>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {storeOperations.showTrustSection ? (
        <section className="homepage-section trust-strip">
          <h3>{storeOperations.homeTrustTitle}</h3>
          <div className="trust-grid">
            <span>Fast local support</span>
            <span>Clear order tracking</span>
            <span>Checkout-ready delivery</span>
          </div>
        </section>
      ) : null}

      {false && storeOperations.showBestProductsSection ? (
        <section className="homepage-section">
          <div className="section-heading-row">
            <h3>{storeOperations.homeBestProductsTitle}</h3>
            <button className="ghost-button" onClick={onBrowseProducts}>View All</button>
          </div>
          <div className="highlights-grid deal-grid" aria-label="Best products">
            {products.map((product) => {
              const cardKey = `best-${product.id}`;

              return (
              <article
                className={[
                  "highlight-card deal-highlight-card",
                  touchPreviewCardKey === cardKey ? "touch-preview-active" : "",
                ].filter(Boolean).join(" ")}
                key={product.id}
              >
                <div className="deal-highlight-top">
                  <span className="section-tag">{product.category}</span>
                  <span className="featured-pill">Hot Deal</span>
                </div>
                <button
                  className="deal-highlight-image-wrap home-product-open"
                  type="button"
                  onPointerDown={(event) => showTouchPreview(cardKey, event.pointerType)}
                  onPointerUp={(event) => hideTouchPreview(event.pointerType)}
                  onPointerLeave={(event) => hideTouchPreview(event.pointerType)}
                  onPointerCancel={(event) => hideTouchPreview(event.pointerType)}
                  onClick={() => onOpenProduct(product.id)}
                >
                  <img src={product.image} alt={product.name} className="deal-highlight-image deal-highlight-image-primary" />
                  {product.hoverImage ? (
                    <img
                      src={product.hoverImage}
                      alt=""
                      className="deal-highlight-image deal-highlight-image-hover"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="price-row">
                  <span className="product-original-price">Rs {product.originalPrice?.toLocaleString()}</span>
                  <span className="product-price">Rs {product.price.toLocaleString()}</span>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      ) : null}

    </main>
  );
}
