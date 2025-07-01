"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image"; 
import { signIn, useSession } from "next-auth/react"; 
import Link from "next/link";
import { IconKey, Icons } from "@smartforms/shared/icons";

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

export default function SignUp() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
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
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
    general: "",
  });

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
      // Store invite token for later use
      sessionStorage.setItem("inviteToken", inviteToken);
    }
  }, [router.query]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validatePassword = (password: string): string => {
    if (password.length < 10) return "Password must be at least 10 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors({ ...errors, general: "" });
    }

    // Validate fields
    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setErrors({ ...errors, email: emailPattern.test(value) ? "" : "Invalid email format" });
    }

    if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    }

    if (name === "confirmPassword" || (name === "password" && formData.confirmPassword)) {
      const confirmValue = name === "confirmPassword" ? value : formData.confirmPassword;
      const passwordValue = name === "password" ? value : formData.password;
      setErrors({ 
        ...errors, 
        confirmPassword: confirmValue === passwordValue ? "" : "Passwords do not match" 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ ...errors, general: "" });

    // Validate all fields
    if (!captchaValue) {
      alert("Please complete the CAPTCHA to verify you are human.");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors({ ...errors, agreeToTerms: "You must agree to the Terms & Conditions" });
      setIsLoading(false);
      return;
    }

    if (errors.email || errors.password || errors.confirmPassword) {
      setIsLoading(false);
      return;
    }

    try {
      // Get invite token if exists
      const inviteToken = sessionStorage.getItem("inviteToken");
      console.log("calling registration API with invite token:", inviteToken);
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          inviteToken: inviteToken,
          captchaToken: captchaValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear invite token
        sessionStorage.removeItem("inviteToken");
        
        // Redirect to email verification page
        router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
      } else {
        setErrors({ ...errors, general: data.error?.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ ...errors, general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    setIsLoading(true);
    try {
      // Store any invite token before social auth
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (inviteToken) {
        // We'll handle this after social auth callback
        sessionStorage.setItem("pendingInvite", inviteToken);
      }
      
      // Use signIn with callback to handle post-auth flow
      await signIn(provider, { 
        callbackUrl: "/auth/social-callback",
        redirect: true,
      });
    } catch (error) {
      console.error("Social signup error:", error);
      setErrors({ ...errors, general: "Social signup failed. Please try again." });
      setIsLoading(false);
    }
  };

  const AUTH_PROVIDERS: AuthProvider[] = [
    { name: "Google", icon: "google", handler: () => { handleSocialSignup("google") } },
    { name: "Microsoft", icon: "microsoft", handler: () => console.log("Microsoft Login") },
    { name: "Facebook", icon: "facebook", handler: () => console.log("Facebook Login") },
    { name: "Apple", icon: "apple", handler: () => console.log("Apple Login") },
    { name: "Salesforce", icon: "salesforce", handler: () => console.log("Salesforce Login") },
    { name: "LinkedIn", icon: "linkedin", handler: () => console.log("LinkedIn Login") },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-card">
          <h1>Sign Up Now</h1>
          <p>Collect information, payments, and signatures with custom online forms.</p>
          
          {/* Social Login Buttons */}
          <p>Sign up with</p> 
          <div className="social-login">
            {AUTH_PROVIDERS.map(({ name, icon, handler }) => (
              <button key={name} className={`social-btn ${name.toLowerCase()}`} onClick={handler}>
                <Image src={Icons[icon]} alt={name} width={24} height={24} /> {name}
              </button>
            ))}
          </div>

          <div className="separator">OR</div>

          {/* Error Message */}
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Company Name (Optional)</label>
              <input 
                type="text" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                placeholder="Leave blank for personal account"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password *</label>
              <div className="password-input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              {errors.password && <p className="error">{errors.password}</p>}
              <small>Must contain uppercase, lowercase, number, and be 8+ characters</small>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="password-input">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>

            <div className="form-group terms">
              <input 
                type="checkbox" 
                name="agreeToTerms" 
                checked={formData.agreeToTerms} 
                onChange={handleChange} 
                disabled={isLoading}
              />
              <label>
                I agree to the 
                <Link href="/terms">Terms of Service</Link>, 
                <Link href="/privacy"> Privacy Policy</Link>, and 
                <Link href="/cookies"> Cookie Policy</Link>.
              </label>
              {errors.agreeToTerms && <p className="error">{errors.agreeToTerms}</p>}
            </div>

            <div className="form-group captcha">
              <ReCAPTCHA 
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} 
                onChange={setCaptchaValue} 
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign up"}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}