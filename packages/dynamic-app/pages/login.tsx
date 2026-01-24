"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { IconKey, Icons } from "@smartforms/shared/icons";
import { NavBar } from "@smartforms/shared/index";

interface AuthProvider {
  name: string;
  icon: IconKey;
  handler: () => void;
}

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const AUTH_PROVIDERS: AuthProvider[] = useMemo(
    () => [
      {
        name: "Google",
        icon: "google",
        handler: () =>
          signIn("google", {
            callbackUrl: "/",
            prompt: "select_account",
          }),
      },
    ],
    []
  );

  const isFormValid =
    formData.identifier.trim().length >= 3 &&
    formData.password.length >= 8 &&
    !!captchaValue &&
    !errors.identifier &&
    !errors.password;

  // Handle error modal from query string
  useEffect(() => {
    const { error } = router.query;
    if (typeof error === "string") {
      switch (error) {
        case "OAuthAccountNotLinked":
          setAuthError("This email is already registered. Please sign in using your originally linked provider.");
          break;
        case "AccessDenied":
          setAuthError("You do not have access to sign in. Please contact support.");
          break;
        default:
          setAuthError("An unexpected error occurred during login. Please try again.");
          break;
      }
    }
  }, [router.query]);

  // Close reset modal on ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowResetModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "identifier") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailPattern.test(value);
      setErrors((prev) => ({
        ...prev,
        identifier: isEmail || value.length >= 3 ? "" : "Enter a valid email or username",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value.length >= 8 ? "" : "Password must be at least 8 characters",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaValue) {
      alert("Please complete the CAPTCHA verification.");
      return;
    }
    if (errors.identifier || errors.password) {
      alert("Please correct the errors before submitting.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      /**
       * ✅ Preferred (real login):
       * This assumes you have a NextAuth "credentials" provider configured.
       * If you DON'T have credentials provider yet, replace this block with your current alert().
       */
      const res = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
        captchaToken: captchaValue,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setAuthError(res.error === "CredentialsSignin" ? "Invalid username/email or password." : res.error);
        setIsLoading(false);
        return;
      }

      const target = res?.url || "/dashboard";
      router.push(target);
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(resetEmail)) {
      setResetError("Please enter a valid email.");
      return;
    }

    // TODO: Replace with your real reset endpoint when ready
    alert(`Password reset link sent to: ${resetEmail}`);
    setShowResetModal(false);
    setResetEmail("");
    setResetError("");
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <>
      <NavBar />
      {/* Minimal SaaS Auth Header (same as signup) */}
      {/* <header className="authTopbar">
        <div className="authTopbar__inner">
          <Link href="/" className="authTopbar__brand" aria-label="Go to SmartForms home">
            <span className="authTopbar__logoMark">SF</span>
            <span className="authTopbar__brandName">SmartForms</span>
          </Link>

          <nav className="authTopbar__nav">
            <Link className="authTopbar__link" href="/about">
              About
            </Link>
            <Link className="authTopbar__link" href="/pricing">
              Pricing
            </Link>
            <Link className="authTopbar__link" href="/contact">
              Contact
            </Link>
            <Link className="authTopbar__ghostBtn" href="/signup">
              New user? Sign up
            </Link>
          </nav>
        </div>
      </header> */}

      <main className="auth-page"> 
        <div className="auth-shell">
          {/* Left brand panel (same style as signup) */}
          <aside className="auth-brand" aria-hidden="true">
            <div className="auth-brand__badge">SmartForms</div>

            <h2 className="auth-brand__title">Welcome back.</h2>
            <p className="auth-brand__desc">
              Sign in to access your workspace, manage forms, and view submissions.
            </p>

            <div className="auth-brand__points">
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>Access published forms</span>
              </div>
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>View responses & analytics</span>
              </div>
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>Secure sign-in</span>
              </div>
            </div>

            <div className="auth-trust">
              <div className="auth-trust__row">
                <span className="auth-trust__pill">Secure sessions</span>
                <span className="auth-trust__pill">Spam protection</span>
                <span className="auth-trust__pill">Privacy-first</span>
              </div>

              <div className="auth-quote">
                <div className="auth-quote__text">
                  “The login + signup experience feels modern and smooth — exactly what we wanted.”
                </div>
                <div className="auth-quote__meta">
                  <span className="auth-quote__avatar">S</span>
                  <span className="auth-quote__name">SmartForms user</span>
                  <span className="auth-quote__sep">•</span>
                  <span className="auth-quote__role">Ops team</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Card */}
          <section className="auth-card" aria-label="Login">
            {session ? (
              <div className="auth-session">
                <h1 className="auth-title">You’re already signed in</h1>
                <p className="auth-subtitle">
                  Signed in as <strong>{session.user?.name || session.user?.email}</strong>
                </p>

                <div className="auth-session__buttons">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="auth-primaryBtn"
                  >
                    Go to Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="auth-secondaryBtn"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <header className="auth-header">
                  <h1 className="auth-title">Log in</h1>
                  <p className="auth-subtitle">Access your workspace by signing in.</p>
                </header>

                {/* Social */}
                <div className="auth-social">
                  {AUTH_PROVIDERS.map(({ name, icon, handler }) => (
                    <button
                      key={name}
                      type="button"
                      className="auth-socialBtn"
                      onClick={handler}
                      disabled={isLoading}
                    >
                      <Image src={Icons[icon]} alt={name} width={18} height={18} />
                      <span>Continue with {name}</span>
                    </button>
                  ))}
                </div>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                {authError && <div className="auth-alert auth-alert--error">{authError}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-grid auth-grid--single">
                    <div className="auth-field auth-field--full">
                      <label className="auth-label" htmlFor="identifier">
                        Username or Email
                      </label>
                      <input
                        id="identifier"
                        className="auth-input"
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        placeholder="you@company.com"
                        autoComplete="username"
                      />
                      {errors.identifier && <p className="auth-help auth-help--error">{errors.identifier}</p>}
                    </div>

                    <div className="auth-field auth-field--full">
                      <label className="auth-label" htmlFor="password">
                        Password
                      </label>
                      <div className="auth-password">
                        <input
                          id="password"
                          className="auth-input auth-input--password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="Your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="auth-eye"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {/* <p className="auth-help">Password must be at least 8 characters.</p> */}
                      {errors.password && <p className="auth-help auth-help--error">{errors.password}</p>}
                    </div>
                  </div>

                  <div className="auth-forgotRow">
                    <button
                      type="button"
                      className="auth-linkBtn"
                      onClick={() => {
                        setResetError("");
                        setResetEmail("");
                        setShowResetModal(true);
                      }}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="auth-captchaWrap">
                    <div className="auth-captchaWrap__label">Human verification</div>
                    <div className="auth-captchaWrap__box">
                      <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        ref={recaptchaRef}
                        onChange={setCaptchaValue}
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-primaryBtn" disabled={!isFormValid || isLoading}>
                    {isLoading && <span className="auth-spinner" aria-hidden="true" />}
                    <span>{isLoading ? "Signing in..." : "Log in"}</span>
                  </button>

                  <p className="auth-foot">
                    New user? <Link href="/signup">Sign up</Link>
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="close-btn" onClick={() => setShowResetModal(false)}>
                ✖
              </button>
            </div>

            <p>Enter your email, and we&apos;ll send you a reset link.</p>

            <input
              type="email"
              placeholder="you@company.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            {resetError && <p className="error">{resetError}</p>}

            <div className="modal-actions">
              <button
                onClick={handlePasswordReset}
                className="auth-primaryBtn"
                style={{ width: "100%" }}
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OAuth Error Modal (kept, but now we show inline alert too) */}
      {authError && false && (
        <div className="modal-overlay" onClick={() => setAuthError(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login Error</h2>
              <button className="close-btn" onClick={() => setAuthError(null)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <Image src={Icons["google"] ?? "/fallback.png"} alt="Error Icon" width={32} height={32} />
              <p>{authError}</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setAuthError(null)} className="auth-primaryBtn" style={{ width: "100%" }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}