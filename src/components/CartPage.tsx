import { useState } from "react";
import type { Product } from "../types/product";

type CartProduct = Product & {
  cartKey: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

type CartPageProps = {
  items: CartProduct[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  orderTotal: number;
  couponCode: string;
  appliedCouponCode: string;
  couponMessage: string;
  onIncreaseQuantity: (cartKey: string) => void;
  onDecreaseQuantity: (cartKey: string) => void;
  onRemoveItem: (cartKey: string) => void;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
};

export function CartPage({
  items,
  subtotal,
  discount,
  deliveryCharge,
  orderTotal,
  couponCode,
  appliedCouponCode,
  couponMessage,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onCouponCodeChange,
  onApplyCoupon,
  onClearCoupon,
  onContinueShopping,
  onCheckout,
}: CartPageProps) {
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const [selectedCartKeys, setSelectedCartKeys] = useState<string[]>([]);
  const selectedCount = selectedCartKeys.length;

  const toggleSelectedItem = (cartKey: string) => {
    setSelectedCartKeys((current) =>
      current.includes(cartKey)
        ? current.filter((key) => key !== cartKey)
        : [...current, cartKey],
    );
  };

  const deleteSelectedItems = () => {
    selectedCartKeys.forEach((cartKey) => onRemoveItem(cartKey));
    setSelectedCartKeys([]);
  };

  return (
    <main className="page-shell cart-page-shell">
      <section className="page-intro cart-page-intro">
        <span className="section-tag">Your Cart</span>
        <h2>Review your selected items</h2>
        <p>Update quantities, remove products, and continue to checkout when ready.</p>
      </section>

      <section className="cart-layout">
        <div className="cart-list">
          {items.length === 0 ? (
            <div className="empty-card cart-empty-card">
              <h3>Your cart is empty</h3>
              <p>Add products first, then come back here to complete your order.</p>
              <button className="cart-empty-browse-button" onClick={onContinueShopping}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="cart-delete-toolbar">
                <span>{selectedCount > 0 ? `${selectedCount} selected` : "Select item to delete"}</span>
                <button
                  className="cart-delete-button"
                  type="button"
                  onClick={deleteSelectedItems}
                  disabled={selectedCount === 0}
                  aria-label="Delete selected cart items"
                  title="Delete selected"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 14h10l1-14" />
                    <path d="M9 7V4h6v3" />
                  </svg>
                </button>
              </div>
              {items.map((item) => (
                <article className={selectedCartKeys.includes(item.cartKey) ? "cart-item-card selected" : "cart-item-card"} key={item.cartKey}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-content">
                    <div className="cart-item-top">
                      <label className="cart-select-control">
                        <input
                          type="checkbox"
                          checked={selectedCartKeys.includes(item.cartKey)}
                          onChange={() => toggleSelectedItem(item.cartKey)}
                        />
                        <span>Select</span>
                      </label>
                      <div>
                        <span className="product-category">{item.category}</span>
                        <h3>{item.name}</h3>
                        {item.selectedColor || item.selectedSize ? (
                          <div className="cart-variant-row">
                            {item.selectedColor ? <span>Color: {item.selectedColor}</span> : null}
                            {item.selectedSize ? <span>Size: {item.selectedSize}</span> : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <p>{item.description}</p>
                    <div className="cart-item-footer">
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => onDecreaseQuantity(item.cartKey)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => onIncreaseQuantity(item.cartKey)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>

        <aside className="cart-summary">
          <span className="section-tag">Summary</span>
          <h3>Order total</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <label className="coupon-box">
            <span>Coupon</span>
            <div>
              <input
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value)}
                placeholder="Enter coupon"
              />
              <button type="button" className="ghost-button" onClick={onApplyCoupon}>
                Apply
              </button>
            </div>
          </label>
          {couponMessage ? <p className="cart-note">{couponMessage}</p> : null}
          {appliedCouponCode ? (
            <div className="summary-row">
              <span>Discount ({appliedCouponCode})</span>
              <strong>-{formatPrice(discount)}</strong>
            </div>
          ) : null}
          <div className="summary-row">
            <span>Delivery</span>
            <strong>{formatPrice(deliveryCharge)}</strong>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <strong>{formatPrice(orderTotal)}</strong>
          </div>
          {appliedCouponCode ? (
            <button className="ghost-button full-width" type="button" onClick={onClearCoupon}>
              Remove Coupon
            </button>
          ) : null}
          <button className="primary-button" onClick={onCheckout} disabled={items.length === 0}>
            Proceed to Checkout
          </button>
          <button className="ghost-button full-width" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </aside>
      </section>
    </main>
  );
}
