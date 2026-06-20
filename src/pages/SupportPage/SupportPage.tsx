import { useState, type FormEvent } from "react";
import type { StoreOperationSettings } from "../../lib/api";
import { submitContactMessage } from "../../lib/api";
import styles from "./SupportPage.module.scss";

function ContactIcon({ type }: { type: "mail" | "whatsapp" | "phone" }) {
  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.4 19.1 6.3 16A8 8 0 1 1 9 18.2l-3.6.9Z" />
        <path d="M9.6 8.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.6l-.4.5c-.1.1-.2.3-.1.5.4.8 1.3 1.7 2.2 2.1.2.1.3 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .5-.4 1.3-.9 1.5-.6.3-2 .2-3.8-.8-2-1.1-3.5-3-4-4.5-.5-1.4 0-2.4.4-2.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 3.8 9 3.2l2 4.5-1.5 1.1c.9 1.9 2.4 3.4 4.4 4.3l1.1-1.5 4.5 2-.6 2.4c-.2.8-.9 1.4-1.8 1.4C10.8 17.4 5.2 11.8 5.2 5.5c0-.8.6-1.5 1.4-1.7Z" />
    </svg>
  );
}

type SupportPageProps = {
  storeOperations: StoreOperationSettings;
};

export function SupportPage({ storeOperations }: SupportPageProps) {
  const [form, setForm] = useState({
    requestType: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    language: "English",
    message: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const result = await submitContactMessage(form);
      setStatusType("success");
      setStatusMessage(
        result.emailSent
          ? "Your request was sent successfully."
          : "Your request was saved. Email delivery is not configured on the server yet.",
      );
      setForm({
        requestType: "",
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        language: "English",
        message: "",
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Unable to send your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} page-shell support-shell`}>
      <section className="contact-hero" aria-label="Contact page hero">
        <h1>Contact Us</h1>
      </section>

      <section className="contact-intro" aria-label="Contact introduction">
        <h2>May we help you?</h2>
        <p>Our Customer Care will be happy to assist you with your requests.</p>
      </section>

      <section className="contact-layout" aria-label="Contact Vinex Nepal">
        <form className="contact-request-form" onSubmit={handleSubmit}>
          <div className="contact-section-heading">
            <ContactIcon type="mail" />
            <h2>Write us your request</h2>
          </div>
          <p>We will reply to you as soon as possible.</p>
          <p>Fields marked with an asterisk (*) are required.</p>

          <label>
            <span>Type of request*</span>
            <select
              value={form.requestType}
              onChange={(event) => updateField("requestType", event.target.value)}
              required
            >
              <option value="" disabled>Select...</option>
              <option>Order support</option>
              <option>Product question</option>
              <option>Payment help</option>
              <option>Delivery update</option>
              <option>General enquiry</option>
            </select>
          </label>

          <label>
            <span>Title*</span>
            <select
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            >
              <option value="" disabled>Select...</option>
              <option>Mr.</option>
              <option>Ms.</option>
              <option>Mrs.</option>
              <option>Prefer not to say</option>
            </select>
          </label>

          <label>
            <span>First Name*</span>
            <input type="text" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
          </label>

          <label>
            <span>Last Name*</span>
            <input type="text" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
          </label>

          <label>
            <span>E-mail*</span>
            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          </label>

          <label>
            <span>Phone</span>
            <input type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>

          <label>
            <span>Language*</span>
            <select value={form.language} onChange={(event) => updateField("language", event.target.value)} required>
              <option>English</option>
              <option>Nepali</option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Write your message here"
            />
          </label>

          <small>
            For more information, see our Privacy Policy. This site is protected by reCAPTCHA
            and the Google Privacy Policy and Terms of Service apply.
          </small>

          {statusMessage ? (
            <div className={`contact-form-status contact-form-status-${statusType}`} role="status">
              {statusMessage}
            </div>
          ) : null}

          <button type="submit" data-tooltip="Send your request by e-mail" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send us an e-mail"}
          </button>
        </form>

        <aside className="contact-info-panel">
          <article className="contact-info-block">
            <div className="contact-section-heading">
              <ContactIcon type="whatsapp" />
              <h2>WhatsApp</h2>
            </div>
            <p>{storeOperations.supportHoursText}</p>
            <a
              href={storeOperations.supportWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              data-tooltip="Open WhatsApp chat"
            >
              Send us a message
            </a>
          </article>

          <article className="contact-info-block">
            <div className="contact-section-heading">
              <ContactIcon type="phone" />
              <h2>Telephone support</h2>
            </div>
            <p>
              Our customer care team is available for order questions, product support, and
              quick delivery updates during business hours.
            </p>
            <a
              href={`tel:${storeOperations.supportPhone.replace(/\s/g, "")}`}
              data-tooltip="Call Vinex Nepal"
            >
              <span>Call us</span>
              {storeOperations.supportPhone}
            </a>
          </article>

          <article className="contact-info-block contact-social-block">
            <h2>Social support</h2>
            <p>Message us on Instagram or TikTok for quick product questions.</p>
            <div>
              <a
                href={storeOperations.supportInstagramUrl}
                target="_blank"
                rel="noreferrer"
                data-tooltip={storeOperations.supportInstagramLabel}
              >
                Instagram
              </a>
              <a
                href={storeOperations.supportTiktokUrl}
                target="_blank"
                rel="noreferrer"
                data-tooltip={storeOperations.supportTiktokLabel}
              >
                TikTok
              </a>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
