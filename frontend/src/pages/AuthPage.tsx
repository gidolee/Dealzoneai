import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { loginUser, registerUser } from "../services/api";

type AuthMode = "login" | "register";

const trustPoints = [
  "Exclusive member pricing",
  "Fast checkout-ready coupons"
];

export default function AuthPage(): JSX.Element {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [message, setMessage] = useState("Sign in to view your personalized deals.");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser({ email, fullName, password, role: "CUSTOMER" });
        setStatusType("success");
        setMessage("Account created. Signing you in...");
      }

      const session = await loginUser({ email, password });
      setSession(session, rememberMe);
      navigate("/deals", { replace: true });
    } catch (error) {
      setStatusType("error");
      const fallbackMessage = mode === "login" ? "Login failed. Check credentials." : "Signup failed.";
      const maybeError = error as { response?: { data?: { message?: string } } };
      setMessage(maybeError.response?.data?.message ?? fallbackMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <aside className="auth-promo">
        <div className="auth-hero-media">
          <img
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80"
            alt="People shopping in a modern retail store"
          />
        </div>
        <span className="eyebrow">DEALZONE</span>
        <h1>Deals that fit how you shop.</h1>
        <p>Sign in to continue to your personalized offers.</p>
        <ul>
          {trustPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </aside>

      <div className="auth-card">
        <div className="auth-card-brand">
          <span className="auth-card-logo" aria-label="Dealzone logo">
            DZ
          </span>
          <strong>Dealzone</strong>
        </div>

        <div className="auth-mode-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("login");
              setStatusType("info");
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("register");
              setStatusType("info");
            }}
            type="button"
          >
            Create Account
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          {mode === "register" ? (
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              required
            />
          ) : null}

          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />

          {mode === "login" ? (
            <div className="auth-aux-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember login details
              </label>
              <a className="auth-forgot" href="mailto:support@dealzone.app?subject=Password%20Reset%20Request">
                Forgot password?
              </a>
            </div>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create and Sign In"}
          </button>
          <small className={`auth-message ${statusType}`}>{message}</small>
        </form>
      </div>
    </section>
  );
}
