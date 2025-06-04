"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react"; 
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";
import Link from "next/link";
import { IconKey, Icons } from "@smartforms/shared/icons";

interface AuthProvider {
  name: string;
  icon: IconKey;
  handler: () => void;
}

const AUTH_PROVIDERS: AuthProvider[] = [
  { name: "Google", icon: "google", handler: () => { signIn("google", { callbackUrl: "/", method: "post", prompt: "select_account", })} },
  { name: "Microsoft", icon: "microsoft", handler: () => console.log("Microsoft Login") },
  { name: "Facebook", icon: "facebook", handler: () => console.log("Facebook Login") },
  { name: "Apple", icon: "apple", handler: () => console.log("Apple Login") },
  { name: "Salesforce", icon: "salesforce", handler: () => console.log("Salesforce Login") },
  { name: "LinkedIn", icon: "linkedin", handler: () => console.log("LinkedIn Login") },
];

declare global {
    interface Window {
      google?: {
        accounts: {
          id: {
            initialize: (options: {
              client_id: string;
              callback: (response: { credential: string }) => void;
            }) => void;
            prompt: () => void;
            renderButton: (
              element: HTMLElement,
              options: { theme: string; size: string }
            ) => void;
          };
        };
      };
    }
  }
interface GoogleCredentialResponse {
    credential: string;
  }

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [errors, setErrors] = useState({ identifier: "", password: "" });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);

  const isFormValid = formData.identifier.trim() && formData.password.length >= 8 && captchaValue;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle error modal from query string
  useEffect(() => {
    const { error } = router.query;
    if (typeof error === "string") {
      switch (error) {
        case "OAuthAccountNotLinked":
          setAuthError(
            "This email is already registered. Please sign in using your originally linked provider."
          );
          break;
        case "AccessDenied":
          setAuthError(
            "You do not have access to sign in. Please contact support."
          );
          break;
        default:
          setAuthError(
            "An unexpected error occurred during login. Please try again."
          );
          break;
      }
    }
  }, [router.query]);

  // Close Modal on ESC Key Press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResetModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "identifier") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailPattern.test(value);
      setErrors({ ...errors, identifier: isEmail || value.length >= 3 ? "" : "Enter a valid email or username" });
    }

    if (name === "password") {
      setErrors({ ...errors, password: value.length >= 8 ? "" : "Password must be at least 8 characters" });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Please complete the CAPTCHA verification.");
      return;
    }
    if (errors.identifier || errors.password) {
      alert("Please correct the errors before submitting.");
      return;
    }
    console.log("Login Successful:", formData);
    alert("Login Successful!");
  };

  const handlePasswordReset = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(resetEmail)) {
      setResetError("Please enter a valid email.");
      return;
    }
    alert(`Password reset link sent to: ${resetEmail}`);
    setShowResetModal(false);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleCredentialResponse = (response: GoogleCredentialResponse) => {
    if (!response.credential) {
        console.error("No credential received from Google.");
        return;
      }
    
      try {
        const userData = JSON.parse(atob(response.credential.split(".")[1]));
        localStorage.setItem("googleUser", JSON.stringify(userData));
        console.log("Google User Info:", userData);
        alert(`Welcome, ${userData.name}!`);
      } catch (error) {
        console.error("Error decoding Google credential:", error);
      }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        {session ? (
            <div className="session-alert">
                <p>You are already signed in as {session.user?.name}.</p>
                <button onClick={() => signOut()} className="logout-btn">Sign out</button>
            </div>
        ) : (
        <div className="login-card">
          <h1>Login</h1>
          <p>Access your workspace by signing in.</p>
          {/* Social Login Options */}
          <p>Sign in with</p>
          <div className="social-login">
            {AUTH_PROVIDERS.map(({ name, icon, handler }) => (
              <button key={name} className={`social-btn ${name.toLowerCase()}`} onClick={handler}>
                <Image src={Icons[icon]} alt={name} width={24} height={24} /> {name}
              </button>
            ))}
          </div>

          <div className="separator">OR</div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username or Email</label>
              <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required />
              {errors.identifier && <p className="error">{errors.identifier}</p>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
                <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              <small>Password must be at least 8 characters.</small>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="forgot-password">
              <Link href="#" onClick={() => setShowResetModal(true)}>Forgot Password?</Link>
            </div>

            <div className="form-group captcha">
              <ReCAPTCHA sitekey="YOUR_RECAPTCHA_SITE_KEY" onChange={setCaptchaValue} />
            </div>

            <button type="submit" className="submit-btn" disabled={!isFormValid}>
              Log in
            </button>
          </form>

          <p className="signup-link">New user? <Link href="/signup">Sign up</Link></p>
        </div>
        )}
      </div>
      <Footer />

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="close-btn" onClick={() => setShowResetModal(false)}>✖</button>
            </div>
            <p>Enter your email, and we&apos;ll send you a reset link.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {resetError && <p className="error">{resetError}</p>}
            <div className="modal-actions">
              <button onClick={() => setShowResetModal(false)} className="close-btn"></button>
              <button onClick={handlePasswordReset} className="submit-btn">Send Reset Link</button>
            </div>
          </div>
        </div>
      )}

      {/* OAuth Error Modal */}
      {authError && (
        <div className="modal-overlay" onClick={() => setAuthError(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login Error</h2>
              <button className="close-btn" onClick={() => setAuthError(null)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <Image
                src={Icons["google"] ?? "/fallback.png"}
                alt="Error Icon"
                width={32}
                height={32}
              />
              <p>{authError}</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setAuthError(null)}
                className="submit-btn"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}