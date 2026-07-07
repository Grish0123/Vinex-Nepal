import { useState, type FormEvent } from "react";
import { submitSellerApplication } from "../../lib/api";
import type { StoreOperationSettings } from "../../lib/api";
import styles from "./SellerPage.module.scss";

type SellerPageProps = {
  storeOperations: StoreOperationSettings;
};

export function SellerPage({ storeOperations }: SellerPageProps) {
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    productCategory: "",
    message: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const result = await submitSellerApplication(form);
      setStatusType("success");
      setStatusMessage(
        result.emailSent
          ? "Your seller request was sent successfully."
          : "Your seller request was saved. Email delivery is not configured on the server yet.",
      );
      setForm({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        productCategory: "",
        message: "",
      });
      setShowSuccessModal(true);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Unable to send your seller request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} page-shell support-shell`}>
      <section className="contact-hero" aria-label="Become a seller hero">
        <h1>Become a Seller</h1>
      </section>

      <section className="contact-intro" aria-label="Seller introduction">
        <h2>Sell with Vinex Nepal</h2>
        <p>Share your product details with us. Our team will review your request and contact you soon.</p>
      </section>

      <section className="contact-layout" aria-label="Become a seller form">
        <form className="contact-request-form" onSubmit={handleSubmit}>
          <div className="contact-section-heading">
            <h2>Seller request</h2>
          </div>
          <p>Tell us who you are and what products you want to sell.</p>
          <p>Fields marked with an asterisk (*) are required.</p>

          <label>
            <span>Business Name*</span>
            <input type="text" value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} required />
          </label>

          <label>
            <span>Contact Person*</span>
            <input type="text" value={form.contactName} onChange={(event) => updateField("contactName", event.target.value)} required />
          </label>

          <label>
            <span>E-mail*</span>
            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          </label>

          <label>
            <span>Phone*</span>
            <input type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
          </label>

          <label>
            <span>Product Category</span>
            <input
              type="text"
              value={form.productCategory}
              onChange={(event) => updateField("productCategory", event.target.value)}
              placeholder="Electronics, accessories, gadgets..."
            />
          </label>

          <label>
            <span>Message</span>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Tell us about your products, pricing, supply capacity, or brand."
            />
          </label>

          {statusMessage ? (
            <div className={`contact-form-status contact-form-status-${statusType}`} role="status">
              {statusMessage}
            </div>
          ) : null}

          <button type="submit" data-tooltip="Send seller request" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit seller request"}
          </button>
        </form>

        <aside className="contact-info-panel">
          <article className="contact-info-block">
            <div className="contact-section-heading">
              <h2>What happens next?</h2>
            </div>
            <p>Our representative will review your seller request, check product fit, and contact you for the next steps.</p>
            <a href={`tel:${storeOperations.supportPhone.replace(/\s/g, "")}`}>Call us {storeOperations.supportPhone}</a>
          </article>

          <article className="contact-info-block">
            <div className="contact-section-heading">
              <h2>Direct Contact</h2>
            </div>
            <p>You can also reach us directly if you want to discuss product supply or seller onboarding.</p>
            <a href="mailto:vinexnepal@gmail.com">vinexnepal@gmail.com</a>
          </article>
        </aside>
      </section>

      {showSuccessModal ? (
        <div className={styles.sellerModalOverlay} role="dialog" aria-modal="true" aria-label="Seller request submitted">
          <article className={styles.sellerModal}>
            <h2>Request received</h2>
            <p>Our representative will contact you soon. You can also reach us directly using the details below.</p>
            <div className={styles.sellerModalContact}>
              <a href={`tel:${storeOperations.supportPhone.replace(/\s/g, "")}`}>{storeOperations.supportPhone}</a>
              <a href="mailto:vinexnepal@gmail.com">vinexnepal@gmail.com</a>
              <a href={storeOperations.supportWhatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <button type="button" onClick={() => setShowSuccessModal(false)}>Close</button>
          </article>
        </div>
      ) : null}
    </main>
  );
}
