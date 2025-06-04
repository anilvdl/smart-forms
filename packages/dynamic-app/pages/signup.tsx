"use client";
import { useState, useEffect } from "react";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image"; 
import { signIn, signOut, useSession } from "next-auth/react"; 
import Link from "next/link";
import { Icons } from "@smartforms/shared/icons";

interface GoogleCredentialResponse {
    credential: string;
  }

  export default function SignUp() {

  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });

    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setErrors({ ...errors, email: emailPattern.test(value) ? "" : "Invalid email format" });
    }

    if (name === "password") {
      setErrors({ ...errors, password: value.length >= 8 ? "" : "Password must be at least 8 characters" });
    }

    if (name === "confirmPassword") {
      setErrors({ ...errors, confirmPassword: value === formData.password ? "" : "Passwords do not match" });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaValue) {
      alert("Please complete the CAPTCHA to verify you are human.");
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors({ ...errors, agreeToTerms: "You must agree to the Terms & Conditions" });
      return;
    }

    if (errors.email || errors.password || errors.confirmPassword) {
      alert("Please correct the errors before submitting.");
      return;
    }

    console.log("Form submitted:", formData);
    alert("Signup Successful!");
  };

  useEffect(() => {
      //alert('Google Sign-In script loaded from signup page');
//     if (session) {
//       localStorage.setItem("user", JSON.stringify(session.user));
//     }
//   }, [session]
        // Load Google Sign-In script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => {
            if (window.google) {
              //alert('Google Sign-In script loaded from signup page : ' + window.google);
              window.google.accounts.id.initialize({
                  client_id: process.env.GOOGLE_CLIENT_ID!,
                  callback: handleCredentialResponse,
              });
            }
        };
        document.body.appendChild(script);
        }, []
    );

    const handleCredentialResponse = (response: GoogleCredentialResponse) => {
        alert('Google Sign-In response: ' + response);
        console.log("Google Sign-In response:", response);
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
      <div className="signup-container">
        {/* dynamically display Sign In or Sign Up form */}
        {session ? (
            <div className="session-alert">
                <p>You are already signed in as {session.user?.name}.</p>
                <button onClick={() => signOut()} className="signup-btn">Sign out</button>
            </div>
        ) : (
            <div className="signup-card">
            <h1>Sign Up Now</h1>
            <p>Collect information, payments, and signatures with custom online forms.</p>
            
            {/* Social Login Buttons */}
            <p>Sign up with</p> 
            <div className="social-login">
                <div className="social-row">
                    <button className="social-btn google" onClick={() => {
                                                               signIn("google", { callbackUrl: "/", method: "post", prompt: "select_account", });
                                                            }}>
                        <Image src={Icons["google"]} alt="Google" width={60} height={60} /> Google
                    </button>
                    <button className="social-btn microsoft">
                        <Image src={Icons["microsoft"]} alt="Microsoft" width={20} height={20} /> Microsoft
                    </button>
                    <button className="social-btn facebook">
                        <Image src={Icons["facebook"]} alt="Facebook" width={50} height={50} /> Facebook
                    </button>
                </div>
                <div className="social-row">
                    <button className="social-btn apple">
                        <Image src={Icons["apple"]} alt="Apple" width={20} height={20} /> Apple
                    </button>
                    <button className="social-btn salesforce">
                        <Image src={Icons["salesforce"]} alt="Salesforce" width={20} height={20} /> Salesforce
                    </button>
                    <button className="social-btn linkedin">
                        <Image src={Icons["linkedin"]} alt="LinkedIn" width={20} height={20} /> LinkedIn
                    </button>
                </div>
            </div>

            <div className="separator">OR</div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                {errors.email && <p className="error">{errors.email}</p>}
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
                <small>Your password must be at least 8 characters.</small>
                {errors.password && <p className="error">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    <button type="button" className="toggle-password" onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? "👁" : "👁‍🗨"}
                    </button>
                </div>
                <small>Confirm password must be at least 8 characters.</small>
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                </div>

                <div className="form-group terms">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                <label>I agree to the <Link href="/terms">Terms of Service</Link>, <Link href="/privacy">Privacy Policy</Link>, and <Link href="/cookies">Cookie Policy</Link>.</label>
                {errors.agreeToTerms && <p className="error">{errors.agreeToTerms}</p>}
                </div>

                <div className="form-group captcha">
                <ReCAPTCHA sitekey="YOUR_RECAPTCHA_SITE_KEY" onChange={setCaptchaValue} />
                </div>

                <button type="submit" className="submit-btn">Sign up</button>
            </form>

            <p className="login-link">Already have an account? <Link href="/login">Log in</Link></p>
            </div>
        )}
      </div>
      <Footer />
    </>
  );
}