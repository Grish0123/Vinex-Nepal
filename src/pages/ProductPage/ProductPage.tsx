import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StoreOperationSettings } from "../../lib/api";
import type { Product } from "../../types/product";
import styles from "./ProductPage.module.scss";

export type ProductSelection = {
  color?: string;
  size?: string;
};

type ProductPageProps = {
  products: Product[];
  searchQuery: string;
  storeOperations: StoreOperationSettings;
  productToOpen: number | null;
  onProductOpened: () => void;
  onClearSearch: () => void;
  onAddToCart: (productId: number, selection: ProductSelection) => void;
  onBuyNow: (productId: number, selection: ProductSelection) => void;
};

export function ProductPage({
  products,
  searchQuery,
  storeOperations,
  productToOpen,
  onProductOpened,
  onClearSearch,
  onAddToCart,
  onBuyNow,
}: ProductPageProps) {
  const [recentlyAdded, setRecentlyAdded] = useState<number[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [galleryDirection, setGalleryDirection] = useState<"next" | "previous">("next");
  const [imageViewerIndex, setImageViewerIndex] = useState<number | null>(null);
  const [touchPreviewProductId, setTouchPreviewProductId] = useState<number | null>(null);
  const [focusedProductId, setFocusedProductId] = useState<number | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const galleryDragStartX = useRef<number | null>(null);
  const productCardRefs = useRef<Record<number, HTMLElement | null>>({});
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const categories = Array.from(new Set([...(storeOperations.categories ?? []), ...products.map((product) => product.category)].filter(Boolean)));
  const visibleProducts = products
    .filter((product) => categoryFilter === "all" || product.category === categoryFilter)
    .sort((first, second) => {
      if (sortMode === "price-low") return first.price - second.price;
      if (sortMode === "price-high") return second.price - first.price;
      if (sortMode === "name") return first.name.localeCompare(second.name);
      return Number(second.featured ?? false) - Number(first.featured ?? false);
    });
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const selectedProductImages = selectedProduct
    ? Array.from(new Set([selectedProduct.image, ...(selectedProduct.galleryImages ?? []), selectedProduct.hoverImage].filter(Boolean)))
    : [];
  const selectedProductColors = selectedProduct?.colorOptions ?? [];
  const selectedProductSizes = selectedProduct?.sizeOptions ?? [];
  const selectedProductSelection = {
    color: selectedColor || selectedProductColors[0],
    size: selectedSize || selectedProductSizes[0],
  };
  const relatedProducts = selectedProduct
    ? products
        .filter((product) => product.id !== selectedProduct.id && product.category === selectedProduct.category)
        .slice(0, 3)
    : [];
  const activeViewerImage =
    selectedProduct && imageViewerIndex !== null
      ? selectedProductImages[imageViewerIndex] ?? selectedProduct.image
      : null;

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    setSelectedColor(selectedProduct.colorOptions?.[0] ?? "");
    setSelectedSize(selectedProduct.sizeOptions?.[0] ?? "");
    setImageViewerIndex(null);
    setImageZoom(1);
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [selectedProduct]);

  useEffect(() => {
    if (!productToOpen) {
      return;
    }

    const productExists = products.some((product) => product.id === productToOpen);
    if (!productExists) {
      return;
    }

    setCategoryFilter("all");
    setFocusedProductId(productToOpen);
    onProductOpened();
  }, [onProductOpened, productToOpen, products]);

  useEffect(() => {
    if (!focusedProductId) {
      return undefined;
    }

    const productCard = productCardRefs.current[focusedProductId];
    if (!productCard) {
      return undefined;
    }

    productCard.scrollIntoView({ behavior: "smooth", block: "center" });
    productCard.focus({ preventScroll: true });

    const highlightTimeout = window.setTimeout(() => {
      setFocusedProductId((current) => (current === focusedProductId ? null : current));
    }, 1800);

    return () => window.clearTimeout(highlightTimeout);
  }, [focusedProductId, visibleProducts]);

  if (products.length === 0 && !searchQuery.trim()) {
    return (
      <main className={`${styles.page} page-shell`}>
        <section className="page-intro">
          <span className="section-tag">Products</span>
          <h2>Loading products...</h2>
          <p>The catalog is loading from the backend.</p>
        </section>
      </main>
    );
  }

  const handleAddToCart = (productId: number, selection: ProductSelection = {}) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product || product.inStock === false) {
      return false;
    }

    onAddToCart(productId, selection);
    setRecentlyAdded((current) => [...new Set([...current, productId])]);

    window.setTimeout(() => {
      setRecentlyAdded((current) => current.filter((id) => id !== productId));
    }, 900);

    return true;
  };

  const handleBuyNow = (productId: number, selection: ProductSelection = {}) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product || product.inStock === false) {
      return;
    }

    onBuyNow(productId, selection);
  };

  const openProduct = (productId: number) => {
    setTouchPreviewProductId(null);
    setSelectedProductId(productId);
    setActiveImageIndex(0);
    setImageViewerIndex(null);
    setImageZoom(1);
  };

  const showTouchPreview = (productId: number, pointerType: string) => {
    if (pointerType !== "mouse") {
      setTouchPreviewProductId(productId);
    }
  };

  const hideTouchPreview = (pointerType: string) => {
    if (pointerType !== "mouse") {
      setTouchPreviewProductId(null);
    }
  };

  const closeProduct = () => {
    setSelectedProductId(null);
    setImageViewerIndex(null);
    setImageZoom(1);
  };

  const handleDetailAddToCart = (productId: number, selection: ProductSelection = {}) => {
    if (handleAddToCart(productId, selection)) {
      closeProduct();
    }
  };

  const openImageViewer = (index: number) => {
    setImageViewerIndex(index);
    setImageZoom(1);
  };

  const closeImageViewer = () => {
    setImageViewerIndex(null);
    setImageZoom(1);
  };

  const showPreviousImage = () => {
    if (selectedProductImages.length < 2) return;
    setGalleryDirection("previous");
    setActiveImageIndex((current) =>
      current === 0 ? selectedProductImages.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    if (selectedProductImages.length < 2) return;
    setGalleryDirection("next");
    setActiveImageIndex((current) => (current + 1) % selectedProductImages.length);
  };

  const jumpToImage = (index: number) => {
    setGalleryDirection(index > activeImageIndex ? "next" : "previous");
    setActiveImageIndex(index);
  };

  const finishGalleryDrag = (clientX: number) => {
    if (galleryDragStartX.current === null) {
      return { didSlide: false, didTap: false };
    }

    const dragDistance = clientX - galleryDragStartX.current;
    galleryDragStartX.current = null;

    if (Math.abs(dragDistance) < 8) {
      return { didSlide: false, didTap: true };
    }

    if (Math.abs(dragDistance) < 36) {
      return { didSlide: false, didTap: false };
    }

    if (dragDistance > 0) {
      showPreviousImage();
    } else {
      showNextImage();
    }

    return { didSlide: true, didTap: false };
  };

  const imageViewerModal = selectedProduct && activeViewerImage
    ? createPortal(
        <section
          className="product-image-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProduct.name} image preview`}
          onClick={closeImageViewer}
        >
          <div className="product-image-viewer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="product-image-viewer-toolbar">
              <button type="button" onClick={() => setImageZoom((current) => Math.max(1, current - 0.5))} aria-label="Zoom out">
                -
              </button>
              <button type="button" onClick={() => setImageZoom(1)} aria-label="Reset zoom">
                1x
              </button>
              <button type="button" onClick={() => setImageZoom((current) => Math.min(3, current + 0.5))} aria-label="Zoom in">
                +
              </button>
              <button type="button" onClick={closeImageViewer} aria-label="Close image preview">
                X
              </button>
            </div>
            <div
              className="product-image-viewer-scroll"
              onWheel={(event) => {
                event.preventDefault();
                setImageZoom((current) => {
                  const nextZoom = current + (event.deltaY < 0 ? 0.18 : -0.18);
                  return Math.min(3, Math.max(1, nextZoom));
                });
              }}
            >
              <img
                src={activeViewerImage}
                alt={selectedProduct.name}
                className="product-image-viewer-image"
                draggable={false}
                style={{ width: `${imageZoom * 100}%` }}
                onDoubleClick={() => setImageZoom((current) => (current > 1 ? 1 : 2))}
              />
            </div>
          </div>
        </section>,
        document.body,
      )
    : null;

  const productDetailModal = selectedProduct
    ? createPortal(
        <section
          className="product-detail-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeProduct}
        >
          <article className="product-detail-panel" onClick={(event) => event.stopPropagation()}>
            <button className="product-detail-close" type="button" onClick={closeProduct} aria-label="Close product details">
              X
            </button>

            <div className="product-detail-gallery">
              <div
                className="product-detail-image-frame"
                role="button"
                tabIndex={0}
                aria-label={`Open ${selectedProduct.name} image preview`}
                onPointerDown={(event) => {
                  galleryDragStartX.current = event.clientX;
                }}
                onPointerUp={(event) => {
                  const galleryAction = finishGalleryDrag(event.clientX);
                  if (galleryAction.didTap) {
                    openImageViewer(activeImageIndex);
                  }
                }}
                onPointerCancel={() => {
                  galleryDragStartX.current = null;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openImageViewer(activeImageIndex);
                  }
                }}
              >
                <img
                  key={`${selectedProduct.id}-${activeImageIndex}`}
                  src={selectedProductImages[activeImageIndex] ?? selectedProduct.image}
                  alt={selectedProduct.name}
                  className={`product-detail-image image-slide-${galleryDirection}`}
                  draggable={false}
                />
              </div>

              <div className="product-gallery-thumbs">
                {selectedProductImages.map((image, index) => (
                  <button
                    className={index === activeImageIndex ? "active" : ""}
                    key={image}
                    type="button"
                    onClick={() => jumpToImage(index)}
                  >
                    <img src={image} alt="" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-detail-copy">
              <span className="section-tag">{selectedProduct.category}</span>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <div className="price-row">
                {selectedProduct.originalPrice ? (
                  <span className="product-original-price">{formatPrice(selectedProduct.originalPrice)}</span>
                ) : null}
                <span className="product-price">{formatPrice(selectedProduct.price)}</span>
              </div>
              {selectedProduct.inStock === false ? (
                <div className="form-status form-status-error">This product is currently out of stock.</div>
              ) : null}
              {selectedProductColors.length > 0 ? (
                <div className="product-option-group">
                  <span>Color</span>
                  <div className="product-option-list">
                    {selectedProductColors.map((color) => (
                      <button
                        className={color === selectedProductSelection.color ? "active" : ""}
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {selectedProductSizes.length > 0 ? (
                <div className="product-option-group">
                  <span>Size</span>
                  <div className="product-option-list">
                    {selectedProductSizes.map((size) => (
                      <button
                        className={size === selectedProductSelection.size ? "active" : ""}
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="product-detail-actions">
                <button
                  className="buy-now-button"
                  onClick={() => handleBuyNow(selectedProduct.id, selectedProductSelection)}
                  disabled={selectedProduct.inStock === false}
                >
                  Buy Now
                </button>
                <button
                  className={
                    recentlyAdded.includes(selectedProduct.id)
                      ? "add-cart-button add-cart-button-success"
                      : "add-cart-button"
                  }
                  onClick={() => handleDetailAddToCart(selectedProduct.id, selectedProductSelection)}
                  disabled={selectedProduct.inStock === false}
                >
                  {selectedProduct.inStock === false
                    ? "Out of Stock"
                    : recentlyAdded.includes(selectedProduct.id)
                      ? "Added to Cart"
                      : "Add to Cart"}
                </button>
              </div>
              {storeOperations.showRelatedProducts && relatedProducts.length > 0 ? (
                <div className="related-products">
                  <h3>{storeOperations.relatedProductsTitle}</h3>
                  <div className="related-product-row">
                    {relatedProducts.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => openProduct(product.id)}
                      >
                        <img src={product.image} alt="" aria-hidden="true" />
                        <span>{product.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        </section>,
        document.body,
      )
    : null;

  return (
    <main className={`${styles.page} page-shell`}>
      {storeOperations.showProductPageIntro ? (
        <section className="page-intro product-page-intro">
          <span className="section-tag">{storeOperations.productPageTag}</span>
          <h2>{storeOperations.productPageTitle}</h2>
          <p>{storeOperations.productPageText}</p>
        </section>
      ) : null}

      <section className="product-results-area">
        <div className="product-results-bar">
          <div>
            <h3>{searchQuery ? searchQuery : storeOperations.productPageTitle}</h3>
            <p>{visibleProducts.length} item(s) found</p>
          </div>
          <button
            className="filter-toggle-button"
            type="button"
            onClick={() => setIsFilterOpen((current) => !current)}
            aria-expanded={isFilterOpen}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            Filter
          </button>
        </div>

        <section className={isFilterOpen ? "product-filter-panel open" : "product-filter-panel"}>
        <div className="filter-panel-heading">
          <div>
            <span className="section-tag">Refine</span>
            <h3>Find the right product</h3>
          </div>
          <button
            type="button"
            className="filter-close-button"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Close filter"
          >
            ×
          </button>
        </div>

        <div className="filter-control-card">
          <span>Sort By</span>
          <div className="sort-pill-grid">
            {[
              ["featured", "Best Match"],
              ["price-low", "Low to High"],
              ["price-high", "High to Low"],
              ["name", "Name A-Z"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={sortMode === value ? "active" : ""}
                onClick={() => setSortMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-control-card">
          <span>Category</span>
          <div className="category-pill-grid">
            <button
              type="button"
              className={categoryFilter === "all" ? "active" : ""}
              onClick={() => setCategoryFilter("all")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                className={categoryFilter === category ? "active" : ""}
                onClick={() => setCategoryFilter(category)}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-panel-footer">
          <span>{visibleProducts.length} result(s)</span>
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              setCategoryFilter("all");
              setSortMode("featured");
            }}
          >
            Reset
          </button>
        </div>
        </section>
      </section>

      {products.length === 0 ? (
        <section className="empty-card product-search-empty">
          <span className="section-tag">No Match</span>
          <h3>No products found</h3>
          <p>
            {searchQuery
              ? `No products matched "${searchQuery}". Try earbuds, earphone, pods, watch, wearable, or electronics.`
              : "No products are available right now."}
          </p>
          <button className="ghost-button" onClick={onClearSearch}>
            Reset Search
          </button>
        </section>
      ) : null}

      <section className="product-grid" aria-label="All products">
        {visibleProducts.map((product) => (
          <article
            className={[
              product.featured ? "product-card featured-card" : "product-card",
              touchPreviewProductId === product.id ? "touch-preview-active" : "",
              focusedProductId === product.id ? "product-card-focused" : "",
            ].filter(Boolean).join(" ")}
            key={product.id}
            ref={(element) => {
              productCardRefs.current[product.id] = element;
            }}
            tabIndex={-1}
          >
            <button
              className="product-image-wrap"
              type="button"
              onPointerDown={(event) => showTouchPreview(product.id, event.pointerType)}
              onPointerUp={(event) => hideTouchPreview(event.pointerType)}
              onPointerLeave={(event) => hideTouchPreview(event.pointerType)}
              onPointerCancel={(event) => hideTouchPreview(event.pointerType)}
              onClick={() => openProduct(product.id)}
              aria-label={`Open ${product.name} details`}
            >
              <img src={product.image} alt={product.name} className="product-image product-image-primary" />
              {product.hoverImage ? (
                <img
                  src={product.hoverImage}
                  alt=""
                  className="product-image product-image-hover"
                  aria-hidden="true"
                />
              ) : null}
              {product.originalPrice ? (
                <div className="discount-badge" aria-label="Discount offer">
                  <strong>
                    {Math.round(
                      ((product.originalPrice - product.price) / product.originalPrice) * 100,
                    )}
                    % OFF
                  </strong>
                  <span>Save Rs {(product.originalPrice - product.price).toLocaleString()}</span>
                </div>
              ) : null}
              {product.inStock === false ? <span className="stock-ribbon">Out of Stock</span> : null}
            </button>
            <div className="product-content">
              <h3>{product.name}</h3>
              <span className="product-price">{formatPrice(product.price)}</span>
            </div>
          </article>
        ))}
      </section>

      {productDetailModal}
      {imageViewerModal}
    </main>
  );
}
