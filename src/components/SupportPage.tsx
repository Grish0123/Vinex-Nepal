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

export function SupportPage() {
  return (
    <main className="page-shell support-shell">
      <section className="page-intro">
        <span className="section-tag">Help &amp; Support</span>
        <h2>We are here to help</h2>
        <p>
          For order updates, product questions, or quick support, message us directly on your
          preferred platform.
        </p>
      </section>

      <section className="support-page-grid">
        <article className="success-panel">
          <h3>Direct Contact</h3>
          <p>
            Reach Vinex Nepal on WhatsApp, Instagram, TikTok, or call us at
            <strong> +977 9748285909</strong>.
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
              href="https://www.tiktok.com/@vinexnepal"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-logo"><SocialIcon platform="tiktok" /></span>
              <span className="contact-copy">
                <strong>TikTok</strong>
                <span>@vinexnepal</span>
              </span>
            </a>
          </div>
        </article>

        <aside className="success-summary">
          <span className="section-tag">Support Hours</span>
          <h3>Fast replies on social</h3>
          <p>WhatsApp and Instagram are best for quick order questions.</p>
          <div className="summary-row">
            <span>Phone</span>
            <strong>+977 9748285909</strong>
          </div>
          <div className="summary-row">
            <span>Instagram</span>
            <strong>vinexnepal</strong>
          </div>
          <div className="summary-row">
            <span>TikTok</span>
            <strong>@vinexnepal</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}
