import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { submitProductRequest } from "../lib/api";

type ProductRequestForm = {
  customerName: string;
  contact: string;
  productName: string;
  details: string;
};

type FooterSectionProps = {
  showWelcome: boolean;
  showProductRequest: boolean;
  onNavigateSupport?: () => void;
};

type LegalPageKey = "privacy" | "returns" | "terms" | "contact";

const initialForm: ProductRequestForm = {
  customerName: "",
  contact: "",
  productName: "",
  details: "",
};

const legalPages: Record<
  LegalPageKey,
  {
    title: string;
    intro: string;
    sections: Array<{ heading: string; body: string[] }>;
  }
> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "This policy explains how Vinex Nepal collects, uses, stores, and protects customer information when you browse, request products, chat with us, or place an order.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Name, phone number, email address, delivery address, province, city, area, landmark, order details, product requests, live chat messages, and payment method selection.",
          "Basic technical information may be collected by the website/browser for security, performance, and order reliability.",
        ],
      },
      {
        heading: "Why we use your information",
        body: [
          "To confirm orders, deliver products, contact customers, answer support questions, prevent duplicate or false orders, and keep order records.",
          "We use personal details only for the purpose for which they were collected, following privacy principles reflected in Nepal's Privacy Act, 2075.",
        ],
      },
      {
        heading: "Sharing and security",
        body: [
          "We do not sell customer data. We may share necessary delivery/order details with delivery partners, payment/support tools, or legal authorities when required by law.",
          "We keep customer information as safely as reasonably possible and limit access to people who need it for order, support, or admin work.",
        ],
      },
      {
        heading: "Customer choices",
        body: [
          "Customers may contact us to ask about stored order information, request correction of wrong contact details, or request deletion where business/legal record keeping does not require retention.",
        ],
      },
    ],
  },
  returns: {
    title: "Return and Refund Policy",
    intro:
      "Vinex Nepal accepts returns only in limited cases, mainly when the wrong product is sent or the item arrives physically damaged before customer use.",
    sections: [
      {
        heading: "Return accepted only for",
        body: [
          "Wrong item delivered compared with the confirmed order.",
          "Item received with clear physical damage during delivery, reported immediately with photos/video proof.",
          "Missing main item from the package, if verified by our team.",
        ],
      },
      {
        heading: "No return / no warranty cases",
        body: [
          "No return for change of mind, dislike of color/design after correct delivery, wrong order placed by customer, or products damaged after delivery.",
          "No warranty for physical damage, water damage, burnt parts, broken screen/body, cuts, dents, scratches from use, tampering, repair by third party, missing packaging/accessories, or misuse.",
          "Destroyed, opened, heavily used, physically damaged, or customer-damaged products are not returnable.",
        ],
      },
      {
        heading: "Return process",
        body: [
          "Customer must contact us as soon as possible after delivery with order number, photos/video, and full issue details.",
          "Returned products must include original item, box, accessories, manuals, and invoice/order proof where available.",
          "Replacement, refund, or rejection is decided after verification. Delivery charges may not be refundable unless the error is ours.",
        ],
      },
      {
        heading: "Fair use",
        body: [
          "This policy is intended to be clear and fair while respecting consumer rights, product condition, and seller verification needs under Nepal consumer-protection principles.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "By using this website or placing an order with Vinex Nepal, you agree to these terms.",
    sections: [
      {
        heading: "Orders and product information",
        body: [
          "Product images, colors, prices, stock, and offers may change. We try to keep information accurate, but small visual differences may happen due to lighting, screen settings, or supplier updates.",
          "An order is considered confirmed only after our team verifies product availability, customer details, and delivery possibility.",
        ],
      },
      {
        heading: "Customer responsibility",
        body: [
          "Customers must provide correct name, phone number, delivery address, and order details.",
          "Customers must check the package at delivery where possible and report wrong/damaged items immediately.",
        ],
      },
      {
        heading: "Payment, delivery, and cancellation",
        body: [
          "Available payment methods and delivery charges are shown during checkout or confirmed by our team.",
          "We may cancel orders if product is out of stock, address/contact is invalid, payment fails, fraud is suspected, or delivery is not possible.",
        ],
      },
      {
        heading: "Website use",
        body: [
          "Do not misuse the website, place fake orders, attempt unauthorized admin access, copy content for commercial misuse, or disrupt service.",
          "Vinex Nepal may update these terms, policies, prices, and services when needed.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact Information",
    intro: "Use these contact details for order support, product requests, returns, and general questions.",
    sections: [
      {
        heading: "Contact channels",
        body: [
          "Phone / WhatsApp: +977 9748285909",
          "Instagram: vinexnepal",
          "TikTok: @vinexnepal",
          "Email: katwalgrish@gmail.com",
        ],
      },
      {
        heading: "Support notes",
        body: [
          "For order support, send your order number, full name, phone number, and issue details.",
          "For damage or wrong item claims, send clear photos/video of the product, package, and invoice/order details.",
        ],
      },
    ],
  },
};

function FooterSocialIcon({ platform }: { platform: "facebook" | "instagram" | "youtube" | "tiktok" }) {
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.4l.6-3h-3V9c0-.6.4-1 1-1Z" />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="1" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12s0-3.4-.4-4.6a2.5 2.5 0 0 0-1.8-1.8C17.6 5.3 12 5.3 12 5.3s-5.6 0-6.8.3a2.5 2.5 0 0 0-1.8 1.8C3 8.6 3 12 3 12s0 3.4.4 4.6a2.5 2.5 0 0 0 1.8 1.8c1.2.3 6.8.3 6.8.3s5.6 0 6.8-.3a2.5 2.5 0 0 0 1.8-1.8C21 15.4 21 12 21 12Z" />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3v11.2a4.2 4.2 0 1 1-3-4V13a1.8 1.8 0 1 0 1.3 1.7V3h3.2c.4 2.1 2 3.7 4.1 4.1v3.1A7 7 0 0 1 17 9.5v5.2A6.9 6.9 0 1 1 10.1 8c.3 0 .6 0 .9.1v3.1" />
    </svg>
  );
}

function LegalPageModal({
  legalPage,
  onClose,
}: {
  legalPage: (typeof legalPages)[LegalPageKey];
  onClose: () => void;
}) {
  return createPortal(
    <section
      className="legal-page-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={legalPage.title}
      onClick={onClose}
    >
      <article className="legal-page-panel" onClick={(event) => event.stopPropagation()}>
        <div className="legal-page-topbar">
          <span className="section-tag">Vinex Nepal</span>
          <button className="legal-page-close" type="button" onClick={onClose} aria-label="Close policy page">
            X
          </button>
        </div>
        <div className="legal-page-reader">
          <h2>{legalPage.title}</h2>
          <p>{legalPage.intro}</p>
          <div className="legal-page-content">
            {legalPage.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <ul>
                  {section.body.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className="legal-page-note">
            This page is a practical store policy template for customer clarity and is not a substitute for advice from a licensed Nepali legal professional.
          </p>
        </div>
      </article>
    </section>,
    document.body,
  );
}

export function FooterSection({ showProductRequest, onNavigateSupport }: FooterSectionProps) {
  const [form, setForm] = useState<ProductRequestForm>(initialForm);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageKey | null>(null);
  const legalPage = activeLegalPage ? legalPages[activeLegalPage] : null;

  useEffect(() => {
    if (!activeLegalPage) {
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
  }, [activeLegalPage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      await submitProductRequest(form);
      setForm(initialForm);
      setStatus("Product request sent. We will review it from the admin panel.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send product request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerClassName = ["site-footer", showProductRequest ? "site-footer-home" : ""].filter(Boolean).join(" ");

  return (
    <footer className={footerClassName}>
      {showProductRequest ? (
        <section className="footer-request-panel">
          <div className="footer-request-logo" aria-hidden="true">
            <img src="/images/brand/VinexLogo.png" alt="" />
          </div>

          <div className="footer-request-copy">
            <h3>Recommend a product</h3>
            <p>A modern request for what you need</p>
          </div>

          <form className="footer-request-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input
                required
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Email or phone</span>
              <input
                required
                value={form.contact}
                onChange={(event) => setForm({ ...form, contact: event.target.value })}
              />
            </label>
            <label className="form-field full-span">
              <span>Product</span>
              <input
                required
                value={form.productName}
                onChange={(event) => setForm({ ...form, productName: event.target.value })}
              />
            </label>
            <label className="form-field full-span">
              <span>Details</span>
              <textarea
                rows={2}
                value={form.details}
                onChange={(event) => setForm({ ...form, details: event.target.value })}
              />
            </label>

            {status ? <div className="form-status">{status}</div> : null}

            <button className="primary-button full-span" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="footer-links" aria-label="Footer navigation">
        <div className="footer-link-column">
          <h3>Site Index</h3>
          <div>
            <a href="/shopnow">Shop Now</a>
            <a href="/">Home</a>
            <button type="button" onClick={onNavigateSupport}>Contact Us</button>
          </div>
        </div>
        <div className="footer-link-column">
          <h3>Social</h3>
          <div>
            <a href="https://www.instagram.com/vinexnepal/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@vinexnepal" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
        <div className="footer-link-column">
          <h3>Get In Touch</h3>
          <div>
            <a href="mailto:katwalgrish@gmail.com">katwalgrish@gmail.com</a>
            <a href="tel:+9779748285909">+977 9748285909</a>
            {onNavigateSupport ? <button type="button" onClick={onNavigateSupport}>Help &amp; Support</button> : null}
          </div>
        </div>
        <div className="footer-link-column">
          <h3>Legal</h3>
          <div>
            <button type="button" onClick={() => setActiveLegalPage("privacy")}>Privacy Policy</button>
            <button type="button" onClick={() => setActiveLegalPage("returns")}>Refunds</button>
            <button type="button" onClick={() => setActiveLegalPage("terms")}>Terms of Service</button>
            <button type="button" onClick={() => setActiveLegalPage("contact")}>Contact Information</button>
          </div>
        </div>
        <p className="footer-rights">All Rights Reserved _ Vinex Nepal (c)2026</p>
        <p className="footer-credit">Website by Vinex Nepal</p>
      </section>

      {legalPage ? <LegalPageModal legalPage={legalPage} onClose={() => setActiveLegalPage(null)} /> : null}
    </footer>
  );
}
