import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "error" | "waiting">("waiting");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get email from query params
    const emailParam = router.query.email as string;
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Check if we have a token to verify
    const token = router.query.token as string;
    if (token) {
      verifyEmail(token);
    }
  }, [router.query]);

  const verifyEmail = async (token: string) => {
    setStatus("checking");
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        
        // Store verification success
        sessionStorage.setItem("emailVerified", "true");
        sessionStorage.setItem("userEmail", data.user.email);
        
        // Redirect to onboarding after 2 seconds
        setTimeout(() => {
          router.push("/onboarding");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error?.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Verification email resent. Please check your inbox.");
      } else {
        setMessage("Failed to resend email. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="verify-email-container">
        <div className="verify-email-card">
          {status === "checking" && (
            <>
              <div className="spinner"></div>
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your email address.</p>
            </>
          )}

          {status === "waiting" && (
            <>
              <h2>Check Your Email</h2>
              <p>We've sent a verification email to:</p>
              <p className="email-display">{email}</p>
              <p>Please click the link in the email to verify your account.</p>
              
              <div className="resend-section">
                <p>Didn't receive the email?</p>
                <button 
                  onClick={resendVerificationEmail} 
                  disabled={isResending}
                  className="resend-btn"
                >
                  {isResending ? "Sending..." : "Resend Email"}
                </button>
              </div>
              
              <div className="tips">
                <p>Tips:</p>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Add noreply@smartform.fyi to your contacts</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="success-icon">✅</div>
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <p>Redirecting to complete your setup...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="error-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <Link href="/signup">
                <a className="btn-primary">Back to Sign Up</a>
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .verify-email-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .verify-email-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #ff6600;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .email-display {
          font-weight: bold;
          color: #ff6600;
          margin: 1rem 0;
        }

        .resend-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .resend-btn {
          background: #ff6600;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }

        .resend-btn:hover:not(:disabled) {
          background: #e55500;
        }

        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tips {
          margin-top: 2rem;
          text-align: left;
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
        }

        .tips ul {
          margin: 0.5rem 0 0 1rem;
          padding: 0;
        }

        .success-icon, .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .btn-primary {
          display: inline-block;
          background: #ff6600;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}