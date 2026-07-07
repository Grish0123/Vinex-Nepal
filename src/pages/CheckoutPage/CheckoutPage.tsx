import emailjs from "@emailjs/browser";
import { useRef, useState, type FormEvent } from "react";
import { recordOrder } from "../../lib/api";
import type { Product } from "../../types/product";
import styles from "./CheckoutPage.module.scss";

type CartProduct = Product & {
  cartKey: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

type CheckoutPageProps = {
  items: CartProduct[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  orderTotal: number;
  couponCode: string;
  paymentMethods: string[];
  onBackToCart: () => void;
  onOrderPlaced: () => void;
};

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  alternateContact: string;
  province: string;
  city: string;
  area: string;
  postalCode: string;
  landmark: string;
};

type SubmittedOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartProduct[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  orderTotal: number;
  couponCode?: string;
  paymentMethod: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const provinces = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const districts = [
  "Achham",
  "Arghakhanchi",
  "Baglung",
  "Baitadi",
  "Bajhang",
  "Bajura",
  "Banke",
  "Bara",
  "Bardiya",
  "Bhaktapur",
  "Bhojpur",
  "Chitwan",
  "Dadeldhura",
  "Dailekh",
  "Dang",
  "Darchula",
  "Dhading",
  "Dhankuta",
  "Dhanusha",
  "Dolakha",
  "Dolpa",
  "Doti",
  "Gorkha",
  "Gulmi",
  "Humla",
  "Ilam",
  "Jajarkot",
  "Jhapa",
  "Jumla",
  "Kailali",
  "Kalikot",
  "Kanchanpur",
  "Kapilvastu",
  "Kaski",
  "Kathmandu",
  "Kavrepalanchok",
  "Khotang",
  "Lalitpur",
  "Lamjung",
  "Mahottari",
  "Makwanpur",
  "Manang",
  "Morang",
  "Mugu",
  "Mustang",
  "Myagdi",
  "Nawalparasi",
  "Nawalpur",
  "Nuwakot",
  "Okhaldhunga",
  "Palpa",
  "Panchthar",
  "Parbat",
  "Parsa",
  "Pyuthan",
  "Ramechhap",
  "Rasuwa",
  "Rautahat",
  "Rolpa",
  "Rukum East",
  "Rukum West",
  "Rupandehi",
  "Salyan",
  "Sankhuwasabha",
  "Saptari",
  "Sarlahi",
  "Sindhuli",
  "Sindhupalchok",
  "Siraha",
  "Solukhumbu",
  "Sunsari",
  "Surkhet",
  "Syangja",
  "Tanahun",
  "Taplejung",
  "Terhathum",
  "Udayapur",
];

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  alternateContact: "",
  province: "",
  city: "",
  area: "",
  postalCode: "",
  landmark: "",
};

function SocialIcon({ platform }: { platform: "whatsapp" | "instagram" | "tiktok" }) {
  if (platform === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.04 2C6.52 2 2.04 6.37 2.04 11.77c0 1.72.46 3.4 1.33 4.88L2 22l5.58-1.45a10.2 10.2 0 0 0 4.46 1.02h.01c5.52 0 10-4.37 10-9.77C22.05 6.37 17.57 2 12.04 2Zm0 17.9a8.3 8.3 0 0 1-4.23-1.15l-.3-.18-3.31.86.89-3.17-.2-.32a7.92 7.92 0 0 1-1.23-4.14c0-4.43 3.74-8.04 8.36-8.04 4.6 0 8.35 3.6 8.35 8.03 0 4.44-3.74 8.05-8.33 8.05Zm4.58-5.98c-.25-.12-1.49-.72-1.72-.8-.23-.08-.4-.12-.57.12-.17.24-.66.8-.81.97-.15.16-.3.18-.55.06-.25-.12-1.06-.38-2.02-1.2-.74-.64-1.24-1.43-1.39-1.67-.14-.24-.01-.37.11-.49.11-.11.25-.29.38-.44.13-.14.17-.24.25-.4.08-.16.04-.3-.02-.42-.06-.12-.57-1.35-.78-1.84-.2-.48-.41-.41-.57-.42h-.48c-.17 0-.44.06-.67.3-.23.24-.88.85-.88 2.07 0 1.22.9 2.4 1.02 2.56.13.16 1.76 2.77 4.35 3.77.61.24 1.09.38 1.46.49.61.18 1.17.15 1.61.09.49-.07 1.49-.6 1.7-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.28Z"
        />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.65 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 6.4A5.6 5.6 0 1 1 6.4 12 5.6 5.6 0 0 1 12 6.4Zm0 1.8A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.58 3h2.71a4.94 4.94 0 0 0 1.47 3.24A4.98 4.98 0 0 0 22 7.71v2.76a7.72 7.72 0 0 1-4.67-1.51v6.13A6.09 6.09 0 1 1 11.24 9v2.86a3.23 3.23 0 1 0 3.34 3.23V3Z"
      />
      <path
        fill="#25F4EE"
        d="M13.5 3h1.08v12.02a4.31 4.31 0 0 1-4.52 4.25 4.25 4.25 0 0 1-1.98-.48 4.3 4.3 0 0 0 6.42-3.7V3Z"
      />
      <path
        fill="#FE2C55"
        d="M14.58 5.8A4.94 4.94 0 0 0 17.29 9a4.96 4.96 0 0 0 2.71.8V8.24a4.98 4.98 0 0 1-3.24-1.47A4.94 4.94 0 0 1 15.29 3h-.71v2.8Z"
      />
    </svg>
  );
}

export function CheckoutPage({
  items,
  subtotal,
  discount,
  deliveryCharge,
  orderTotal,
  couponCode,
  paymentMethods,
  onBackToCart,
  onOrderPlaced,
}: CheckoutPageProps) {
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? "Cash on Delivery");
  const [isProvincePickerOpen, setIsProvincePickerOpen] = useState(false);
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [isPaymentPickerOpen, setIsPaymentPickerOpen] = useState(false);
  const isSubmittingRef = useRef(false);
  const clientOrderIdRef = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;
  const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const availablePaymentMethods = paymentMethods.length > 0 ? paymentMethods : ["Cash on Delivery"];
  const provinceQuery = form.province.trim().toLowerCase();
  const districtQuery = form.city.trim().toLowerCase();
  const provinceSuggestions = provinceQuery
    ? provinces.filter((province) => province.toLowerCase().includes(provinceQuery))
    : [];
  const districtSuggestions = districtQuery
    ? districts.filter((district) => district.toLowerCase().includes(districtQuery))
    : [];

  const selectProvince = (province: string) => {
    setForm({ ...form, province });
    setIsProvincePickerOpen(false);
  };

  const selectDistrict = (district: string) => {
    setForm({ ...form, city: district });
    setIsDistrictPickerOpen(false);
  };

  const selectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    setIsPaymentPickerOpen(false);
  };

  if (submitState === "success" && submittedOrder) {
    return (
      <main className={`${styles.page} ${styles.checkoutPage} page-shell`}>
        <section className="success-card">
          <div className="success-hero">
            <span className="section-tag">Order Received</span>
            <h2>We have received your order request.</h2>
            <p>
              Thank you for choosing Vinex Nepal. Our team will review your order and
              contact you as soon as possible with confirmation and next steps.
            </p>
          </div>

          <div className="success-layout">
            <article className="success-panel">
              <h3>We will reach out shortly</h3>
              <p>
                Your request has been safely delivered to our team. For faster updates,
                you can also contact us directly on any of the platforms below.
              </p>

              <div className="contact-grid">
                <a
                  className="contact-link whatsapp-link"
                  href="https://wa.me/9779748285909"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-logo"><SocialIcon platform="whatsapp" /></span>
                  <span className="contact-copy">
                    <strong>WhatsApp</strong>
                    <span>+977 9748285909</span>
                  </span>
                </a>

                <a
                  className="contact-link instagram-link"
                  href="https://www.instagram.com/vinexnepal/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-logo"><SocialIcon platform="instagram" /></span>
                  <span className="contact-copy">
                    <strong>Instagram</strong>
                    <span>vinexnepal</span>
                  </span>
                </a>

                <a
                  className="contact-link tiktok-link"
                  href="https://www.tiktok.com/@vinex.nepal?_r=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-logo"><SocialIcon platform="tiktok" /></span>
                  <span className="contact-copy">
                    <strong>TikTok</strong>
                    <span>@vinex.nepal</span>
                  </span>
                </a>
              </div>
            </article>

            <aside className="success-summary">
              <span className="section-tag">Order Summary</span>
              <h3>{submittedOrder.orderNumber}</h3>
              <p>{submittedOrder.customerName}</p>
              <p>{submittedOrder.customerEmail}</p>
              <p>{submittedOrder.customerPhone}</p>
              {submittedOrder.items.map((item) => (
                <div className="checkout-item-row" key={item.cartKey}>
                  <img className="checkout-item-image" src={item.image} alt={item.name} />
                  <span className="checkout-item-copy">
                    <strong>{item.name}</strong>
                    <span>
                      Qty {item.quantity}
                      {item.selectedColor ? ` / ${item.selectedColor}` : ""}
                      {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                    </span>
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div className="summary-row total-row">
                <span>Total</span>
                <strong>{formatPrice(submittedOrder.orderTotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Payment</span>
                <strong>{submittedOrder.paymentMethod}</strong>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={`${styles.page} ${styles.checkoutPage} page-shell`}>
        <section className="empty-card checkout-empty">
          <h2>No items to checkout</h2>
          <p>Add something to your cart first, then return here to enter delivery details.</p>
          <button className="primary-button" onClick={onBackToCart}>
            Back to Cart
          </button>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingRef.current || submitState === "submitting") {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitState("submitting");
    setSubmitMessage("Placing your order...");

    try {
      const orderLines = items
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} (${item.category})${item.selectedColor ? ` - Color: ${item.selectedColor}` : ""}${item.selectedSize ? ` - Size: ${item.selectedSize}` : ""} - Qty: ${item.quantity} - Rs ${(item.price * item.quantity).toLocaleString()}`,
        )
        .join("\n");

      const orderResult = await recordOrder({
        clientOrderId: clientOrderIdRef.current,
        customer: {
          ...form,
          country: "Nepal",
        },
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          total: item.price * item.quantity,
        })),
        subtotal,
        discount,
        deliveryCharge,
        total: orderTotal,
        couponCode: couponCode || undefined,
        paymentMethod,
      });

      if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
        try {
          await emailjs.send(
            emailJsServiceId,
            emailJsTemplateId,
            {
              customer_first_name: form.firstName,
              customer_last_name: form.lastName,
              customer_email: form.email,
              contact_number: form.contactNumber,
              alternate_contact: form.alternateContact || "N/A",
              country: "Nepal",
              province: form.province,
              city: form.city,
              area: form.area,
              postal_code: form.postalCode || "N/A",
              landmark: form.landmark || "N/A",
              order_number: orderResult.orderNumber,
              order_id: orderResult.orderNumber,
              order_lines: orderLines,
              subtotal: formatPrice(subtotal),
              discount: formatPrice(discount),
              delivery_charge: formatPrice(deliveryCharge),
              total: formatPrice(orderTotal),
              coupon_code: couponCode || "N/A",
              payment_method: paymentMethod,
              item_count: items.reduce((total, item) => total + item.quantity, 0),
            },
            {
              publicKey: emailJsPublicKey,
            },
          );
        } catch (emailError) {
          console.error("Order was saved, but the notification email failed:", emailError);
        }
      }

      setSubmittedOrder({
        orderNumber: orderResult.orderNumber,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
        customerPhone: form.contactNumber,
        items,
        subtotal,
        discount,
        deliveryCharge,
        orderTotal,
        couponCode,
        paymentMethod,
      });
      setSubmitState("success");
      setSubmitMessage(
        "We have received your order request and will contact you as soon as possible.",
      );
      onOrderPlaced();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to place order.";
      setSubmitState("error");
      setSubmitMessage(message || "Unable to place order. Please try again.");
      isSubmittingRef.current = false;
    }
  };

  return (
    <main className={`${styles.page} ${styles.checkoutPage} page-shell`}>
      <section className="page-intro checkout-intro">
        <span className="section-tag">Checkout</span>
        <h2>Delivery details</h2>
        <p>Complete the form below with contact and address details for delivery.</p>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>First Name</span>
            <input
              required
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Last Name</span>
            <input
              required
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Email Address</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Contact Number</span>
            <input
              type="tel"
              required
              placeholder="Primary phone number"
              value={form.contactNumber}
              onChange={(event) => setForm({ ...form, contactNumber: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Alternate Contact</span>
            <input
              type="tel"
              placeholder="Optional backup number"
              value={form.alternateContact}
              onChange={(event) => setForm({ ...form, alternateContact: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Country</span>
            <input value="Nepal" readOnly disabled className="fixed-input" />
          </label>

          <label className="form-field">
            <span>Province / State</span>
            <div className="form-combobox" onBlur={() => window.setTimeout(() => setIsProvincePickerOpen(false), 100)}>
              <input
                required
                autoComplete="off"
                placeholder="Start typing province"
                value={form.province}
                onFocus={() => setIsProvincePickerOpen(true)}
                onChange={(event) => {
                  setForm({ ...form, province: event.target.value });
                  setIsProvincePickerOpen(true);
                }}
              />
              {isProvincePickerOpen && provinceSuggestions.length > 0 ? (
                <div className="form-option-list province-option-list" role="listbox">
                  {provinceSuggestions.map((province) => (
                    <button
                      type="button"
                      key={province}
                      className={form.province === province ? "active" : ""}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectProvince(province)}
                    >
                      {province}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <label className="form-field">
            <span>District / City</span>
            <div className="form-combobox" onBlur={() => window.setTimeout(() => setIsDistrictPickerOpen(false), 100)}>
              <input
                required
                autoComplete="off"
                placeholder="Start typing district"
                value={form.city}
                onFocus={() => setIsDistrictPickerOpen(Boolean(form.city.trim()))}
                onChange={(event) => {
                  setForm({ ...form, city: event.target.value });
                  setIsDistrictPickerOpen(Boolean(event.target.value.trim()));
                }}
              />
              {isDistrictPickerOpen && districtSuggestions.length > 0 ? (
                <div className="form-option-list district-option-list" role="listbox">
                  {districtSuggestions.map((district) => (
                    <button
                      type="button"
                      key={district}
                      className={form.city === district ? "active" : ""}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectDistrict(district)}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <label className="form-field">
            <span>Area / Street Address</span>
            <input
              required
              placeholder="Tole, ward, street, house number"
              value={form.area}
              onChange={(event) => setForm({ ...form, area: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Postal Code</span>
            <input
              placeholder="Optional postal code"
              value={form.postalCode}
              onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
            />
          </label>

          <label className="form-field">
            <span>Landmark</span>
            <input
              placeholder="Nearby landmark for easier delivery"
              value={form.landmark}
              onChange={(event) => setForm({ ...form, landmark: event.target.value })}
            />
          </label>

          <label className="form-field full-span">
            <span>Payment Method</span>
            <div className="form-combobox" onBlur={() => window.setTimeout(() => setIsPaymentPickerOpen(false), 100)}>
              <button
                type="button"
                className={isPaymentPickerOpen ? "form-select-button open" : "form-select-button"}
                aria-expanded={isPaymentPickerOpen}
                onClick={() => setIsPaymentPickerOpen((current) => !current)}
              >
                <span>{paymentMethod}</span>
              </button>
              {isPaymentPickerOpen ? (
                <div className="form-option-list payment-option-list" role="listbox">
                  {availablePaymentMethods.map((method) => (
                    <button
                      type="button"
                      key={method}
                      className={method === paymentMethod ? "active" : ""}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectPaymentMethod(method)}
                    >
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          {submitMessage ? (
            <div
              className={
                submitState === "error" ? "form-status form-status-error" : "form-status"
              }
            >
              {submitMessage}
            </div>
          ) : null}

          <div className="checkout-actions full-span">
            <button type="button" className="ghost-button" onClick={onBackToCart}>
              Back to Cart
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={submitState === "submitting"}
            >
              {submitState === "submitting" ? "Sending..." : "Place Order"}
            </button>
          </div>
        </form>

        <aside className="checkout-sidebar">
          <div className="cart-summary">
            <span className="section-tag">Checkout Summary</span>
            <h3>{items.length} item(s)</h3>
            {items.map((item) => (
              <div className="checkout-item-row" key={item.cartKey}>
                <img className="checkout-item-image" src={item.image} alt={item.name} />
                <span className="checkout-item-copy">
                  <strong>{item.name}</strong>
                  <span>
                    Qty {item.quantity}
                    {item.selectedColor ? ` / ${item.selectedColor}` : ""}
                    {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                  </span>
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="summary-row total-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {discount > 0 ? (
              <div className="summary-row">
                <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
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
            <div className="summary-row">
              <span>Payment</span>
              <strong>{paymentMethod}</strong>
            </div>
          </div>

          <div className="delivery-partner" aria-label="Official delivery partner">
            <span>Official Delivery Partner</span>
            <img src="/images/nepal can move.png" alt="Nepal Can Move" />
          </div>
        </aside>
      </section>
    </main>
  );
}
