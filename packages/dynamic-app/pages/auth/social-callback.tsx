import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function SocialCallback() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function handleRedirect() {
      // Don't do anything while session is loading
      if (status === 'loading') {
        return;
      }
      
      // If unauthenticated after loading, redirect to login
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      
      // If authenticated but no session data yet, force update
      if (status === 'authenticated' && !session?.user) {
        await update();
        return;
      }
      
      // Process authenticated user with session data
      if (status === 'authenticated' && session?.user) {
        setIsProcessing(false);
        
        // Add a small delay to ensure session is fully established
        setTimeout(() => {
          // Social auth users don't need email verification
          if (session.user.needsOnboarding) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        }, 500);
      }
    }
    
    handleRedirect();
  }, [session, status, router, update]);

  // Always show loading state until we have session data
  if (status === 'loading' || isProcessing) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner"></div>
          <h2 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
            Fetching your account...
          </h2>
          <p style={{ color: "#666", margin: 0 }}>
            Please wait while we retrieve your information.
          </p>
        </div>
        
        <style jsx>{`
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ff6600;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  } else {
    return (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          flexDirection: "column"
        }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner"></div>
            <h2 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
              Setting up your account...
            </h2>
            <p style={{ color: "#666", margin: 0 }}>
              Please wait while we complete your registration.
            </p>
          </div>
          
          <style jsx>{`
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #ff6600;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
  }
}