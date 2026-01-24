"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { IconKey, Icons } from "@smartforms/shared/icons";
import { NavBar } from "@smartforms/shared/index";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  agreeToTerms: boolean;
}

interface AuthProvider {
  name: string;
  icon: IconKey;
  handler: () => void;
}

type PwdReq = {
  minLen: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
};

function getPwdReq(pwd: string): PwdReq {
  return {
    minLen: pwd.length >= 10,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  };
}

function getStrength(pwd: string) {
  const r = getPwdReq(pwd);
  const score = [r.minLen, r.upper, r.lower, r.number].filter(Boolean).length;

  // lightweight heuristic (kept intentionally simple)
  let label: "Weak" | "Okay" | "Good" | "Strong" = "Weak";
  if (score === 2) label = "Okay";
  if (score === 3) label = "Good";
  if (score === 4 && pwd.length >= 12) label = "Strong";
  if (score === 4 && pwd.length < 12) label = "Good";

  const pct = Math.min(100, Math.round((score / 4) * 100));
  return { score, pct, label, req: r };
}

export default function SignUp() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPwdFocused, setIsPwdFocused] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
    general: "",
  });

  const pwdPopoverCloseTimer = useRef<number | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Invite token handling
  useEffect(() => {
    const inviteToken = router.query.invite as string;
    if (inviteToken) {
      sessionStorage.setItem("inviteToken", inviteToken);
    }
  }, [router.query]);

  const validatePassword = (password: string): string => {
    if (password.length < 10) return "Password must be at least 10 characters";
    if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Add at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Add at least one number";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }

    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setErrors((prev) => ({ ...prev, email: emailPattern.test(value) ? "" : "Invalid email format" }));
    }

    if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordError }));
      // also re-check confirm if user typed password
      if (formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: formData.confirmPassword === value ? "" : "Passwords do not match",
        }));
      }
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value === formData.password ? "" : "Passwords do not match",
      }));
    }

    if (name === "agreeToTerms") {
      setErrors((prev) => ({ ...prev, agreeToTerms: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    if (!captchaValue) {
      alert("Please complete the CAPTCHA to verify you are human.");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors((prev) => ({ ...prev, agreeToTerms: "You must agree to the Terms & Conditions" }));
      setIsLoading(false);
      return;
    }

    if (errors.email || errors.password || errors.confirmPassword) {
      setIsLoading(false);
      return;
    }

    try {
      const inviteToken = sessionStorage.getItem("inviteToken");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          inviteToken,
          captchaToken: captchaValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem("inviteToken");
        router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
      } else {
        setErrors((prev) => ({ ...prev, general: data.error?.message || "Registration failed" }));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors((prev) => ({ ...prev, general: "An error occurred. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    setIsLoading(true);
    try {
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (inviteToken) sessionStorage.setItem("pendingInvite", inviteToken);

      await signIn(provider, {
        callbackUrl: "/auth/social-callback",
        redirect: true,
      });
    } catch (error) {
      console.error("Social signup error:", error);
      setErrors((prev) => ({ ...prev, general: "Social signup failed. Please try again." }));
      setIsLoading(false);
    }
  };

  const AUTH_PROVIDERS: AuthProvider[] = useMemo(
    () => [{ name: "Google", icon: "google", handler: () => handleSocialSignup("google") }],
    []
  );

  const strength = getStrength(formData.password);
  const showPwdPopover = isPwdFocused; // focus-only as you requested

  const canSubmit =
    !isLoading &&
    !!captchaValue &&
    !!formData.name &&
    !!formData.email &&
    !!formData.password &&
    !!formData.confirmPassword &&
    formData.agreeToTerms &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  if (status === "loading") return <div>Loading...</div>;

  return (
    <>
      <NavBar />

      <main className="auth-page">
        <div className="auth-shell">
          {/* Left “brand” panel */}
          <aside className="auth-brand" aria-hidden="true">
            <div className="auth-brand__badge">SmartForms</div>

            <h2 className="auth-brand__title">Create beautiful forms in minutes.</h2>
            <p className="auth-brand__desc">
              Build, publish, and collect submissions with a modern drag-and-drop form builder.
            </p>

            <div className="auth-brand__points">
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>Fast setup, clean UX</span>
              </div>
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>Secure auth & privacy-first</span>
              </div>
              <div className="auth-point">
                <span className="auth-point__dot" />
                <span>Publish & share instantly</span>
              </div>
            </div>

            <div className="auth-trust">
              <div className="auth-trust__row">
                <span className="auth-trust__pill">SOC2-ready roadmap</span>
                <span className="auth-trust__pill">GDPR-friendly</span>
                <span className="auth-trust__pill">Spam protection</span>
              </div>

              <div className="auth-quote">
                <div className="auth-quote__text">
                  “We created a working form + share link in under 5 minutes. Clean UI and smooth flow.”
                </div>
                <div className="auth-quote__meta">
                  <span className="auth-quote__avatar">A</span>
                  <span className="auth-quote__name">Early adopter</span>
                  <span className="auth-quote__sep">•</span>
                  <span className="auth-quote__role">Product team</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Card */}
          <section className="auth-card" aria-label="Sign up">
            <header className="auth-header">
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Start building your first SmartForm today.</p>
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

            {errors.general && <div className="auth-alert auth-alert--error">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-grid">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="name">
                    Name <span className="auth-required">*</span>
                  </label>
                  <input
                    id="name"
                    className="auth-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Email <span className="auth-required">*</span>
                  </label>
                  <input
                    id="email"
                    className="auth-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="auth-help auth-help--error">{errors.email}</p>}
                </div>

                <div className="auth-field auth-field--full">
                  <label className="auth-label" htmlFor="companyName">
                    Company <span className="auth-optional">(optional)</span>
                  </label>
                  <input
                    id="companyName"
                    className="auth-input"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Leave blank for personal use"
                    autoComplete="organization"
                  />
                </div>

                {/* Password (FULL ROW to keep it clean + avoid cramped helper text) */}
                <div className="auth-field auth-field--full">
                  <label className="auth-label" htmlFor="password">
                    Password <span className="auth-required">*</span>
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
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      onFocus={() => {
                        if (pwdPopoverCloseTimer.current) window.clearTimeout(pwdPopoverCloseTimer.current);
                        setIsPwdFocused(true);
                      }}
                      onBlur={() => {
                        // slight delay prevents flicker if user clicks around inside the field area
                        pwdPopoverCloseTimer.current = window.setTimeout(() => setIsPwdFocused(false), 80);
                      }}
                      aria-describedby="pwd-strength"
                    />

                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {/* Focus-only popover (no layout impact) */}
                    {showPwdPopover && (
                      <div className="auth-popover" role="status" aria-live="polite">
                        <div className="auth-popover__title">
                          <ShieldCheck size={16} />
                          <span>Password requirements</span>
                        </div>

                        <div className="auth-popover__list">
                          <div className="auth-popover__item">
                            {strength.req.minLen ? <CheckCircle2 size={16} className="auth-popover__icon auth-popover__icon--ok"/> : <Circle size={16} className="auth-popover__icon"/>}
                            <span>At least 10 characters</span>
                          </div>
                          <div className="auth-popover__item">
                            {strength.req.upper ? <CheckCircle2 size={16} className="auth-popover__icon auth-popover__icon--ok"/> : <Circle size={16} className="auth-popover__icon"/>}
                            <span>One uppercase letter</span>
                          </div>
                          <div className="auth-popover__item">
                            {strength.req.lower ? <CheckCircle2 size={16} className="auth-popover__icon auth-popover__icon--ok"/> : <Circle size={16} className="auth-popover__icon"/>}
                            <span>One lowercase letter</span>
                          </div>
                          <div className="auth-popover__item">
                            {strength.req.number ? <CheckCircle2 size={16} className="auth-popover__icon auth-popover__icon--ok"/> : <Circle size={16} className="auth-popover__icon"/>}
                            <span>One number</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Strength line (always below password field; lightweight) */}
                  <div id="pwd-strength" className="auth-strength">
                    <div className="auth-strength__bar" aria-hidden="true">
                      <div
                        className="auth-strength__fill"
                        style={{ width: `${formData.password ? strength.pct : 0}%` }}
                      />
                    </div>
                    <div className="auth-strength__label">
                      Strength: <strong>{formData.password ? strength.label : "—"}</strong>
                    </div>
                  </div>

                  {errors.password && <p className="auth-help auth-help--error">{errors.password}</p>}
                </div>

                {/* Confirm password (simple) */}
                <div className="auth-field auth-field--full">
                  <label className="auth-label" htmlFor="confirmPassword">
                    Confirm password <span className="auth-required">*</span>
                  </label>
                  <div className="auth-password">
                    <input
                      id="confirmPassword"
                      className="auth-input auth-input--password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      disabled={isLoading}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.confirmPassword && <p className="auth-help auth-help--error">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="auth-termsRow">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="agreeToTerms" className="auth-termsText">
                  I agree to the{" "}
                  <Link href="/terms">Terms of Service</Link>,{" "}
                  <Link href="/privacy">Privacy Policy</Link>, and{" "}
                  <Link href="/cookies">Cookie Policy</Link>.
                </label>
              </div>
              {errors.agreeToTerms && <p className="auth-help auth-help--error">{errors.agreeToTerms}</p>}

              <div className="auth-captchaWrap">
                <div className="auth-captchaWrap__label">Human verification</div>
                <div className="auth-captchaWrap__box">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={setCaptchaValue}
                  />
                </div>
              </div>

              <button type="submit" className="auth-primaryBtn" disabled={!canSubmit}>
                {isLoading && <span className="auth-spinner" aria-hidden="true" />}
                <span>{isLoading ? "Creating account..." : "Create account"}</span>
              </button>

              <p className="auth-foot">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}