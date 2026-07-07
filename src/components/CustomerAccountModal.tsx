import { useState, type FormEvent } from "react";
import { loginCustomerAccount, registerCustomerAccount, type CustomerAccount } from "../lib/api";

type CustomerAccountModalProps = {
  currentCustomer: CustomerAccount | null;
  onClose: () => void;
  onSignIn: (customer: CustomerAccount) => void;
  onSignOut: () => void;
};

export function CustomerAccountModal({ currentCustomer, onClose, onSignIn, onSignOut }: CustomerAccountModalProps) {
  const [mode, setMode] = useState<"login" | "create">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(currentCustomer?.email ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password.trim();
    const nextName = name.trim();

    if (!nextEmail || !nextPassword || (mode === "create" && !nextName)) {
      setMessage("Please fill all required details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === "create"
        ? await registerCustomerAccount({ name: nextName, email: nextEmail, password: nextPassword })
        
        : await loginCustomerAccount({ email: nextEmail, password: nextPassword });
      onSignIn(result.customer);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="customer-auth-overlay" role="dialog" aria-modal="true" aria-label="Customer account" onClick={onClose}>
      <div className="customer-auth-panel" onClick={(event) => event.stopPropagation()}>
        <button className="customer-auth-close" type="button" onClick={onClose} aria-label="Close account panel">
          X
        </button>

        <div className="customer-auth-brand">
          <img src="/images/Logo Vinex.svg" alt="" />
          <div>
            <strong>Vinex Nepal</strong>
            <span>Customer account</span>
          </div>
        </div>

        {currentCustomer ? (
          <div className="customer-auth-signed-in">
            <span className="section-tag">Signed in</span>
            <h2>Hi, {currentCustomer.name}</h2>
            <p>{currentCustomer.email}</p>
            <button className="customer-auth-primary" type="button" onClick={onClose}>
              Continue Shopping
            </button>
            <button
              className="customer-auth-secondary"
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <div className="customer-auth-heading">
              <span className="section-tag">{mode === "login" ? "Sign in" : "Create account"}</span>
              <h2>{mode === "login" ? "Welcome back" : "Join Vinex Nepal"}</h2>
              <p>Save your details and make checkout faster next time.</p>
            </div>

            <form className="customer-auth-form" onSubmit={handleSubmit}>
              {mode === "create" ? (
                <label>
                  <span>Full Name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </label>
              ) : null}
              <label>
                <span>Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
              </label>
              <label>
                <span>Password</span>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </label>
              {message ? <div className="form-status form-status-error">{message}</div> : null}
              <button className="customer-auth-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="customer-social-login">
              <button type="button" onClick={() => setMessage("Google login needs Google OAuth setup before it can work live.")}>
                <span>G</span>
                Continue with Google
              </button>
              <button type="button" onClick={() => setMessage("Facebook login needs Meta app setup before it can work live.")}>
                <span>f</span>
                Continue with Facebook
              </button>
            </div>

            <button
              className="customer-auth-switch"
              type="button"
              onClick={() => {
                setMessage("");
                setMode(mode === "login" ? "create" : "login");
              }}
            >
              {mode === "login" ? "Create a new account" : "Already have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
