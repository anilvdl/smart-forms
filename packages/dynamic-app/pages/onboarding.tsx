import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import PlanSelection from "../components/onboarding/PlanSelection";
import BillingSetup from "../components/onboarding/BillingSetup";
import OnboardingComplete from "../components/onboarding/OnboardingComplete";

const ONBOARDING_STEPS = [
  { id: "plan", title: "Choose Your Plan", component: PlanSelection },
  { id: "billing", title: "Billing Information", component: BillingSetup },
  { id: "complete", title: "Welcome to SmartForms", component: OnboardingComplete },
];

export default function Onboarding() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    selectedPlan: "",
    billingCycle: "monthly" as "monthly" | "annual",
    paymentMethod: null,
  });
  
  useEffect(() => {
    
    // Check if user is verified
    const emailVerified = session?.user.emailVerified; 
    
    if (!emailVerified && status === "authenticated") {
      router.push("/auth/verify-email");
    }
  }, [status, router]);

  const handleNext = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    
    // Skip billing for free plan
    if (currentStep === 0 && data.selectedPlan === "free") {
      setCurrentStep(2); // Skip to complete
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].component;

  return (
    <>
      <Navbar />
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Complete Your Setup</h1>
          <div className="progress-bar">
            {ONBOARDING_STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`step ${index <= currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="onboarding-content">
          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .onboarding-container {
          min-height: calc(100vh - 200px);
          padding: 2rem;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .progress-bar {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          gap: 2rem;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .step.active {
          opacity: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .step.active .step-number {
          background: #ff6600;
          color: white;
        }

        .step.completed .step-number {
          background:linear-gradient(135deg, #5b6af3 0%, #8b5cf6 100%);
          color: white;
        }

        .step-title {
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .onboarding-content {
          max-width: 2000px;
          margin: 0 auto;
        }
      `}</style>
    </>
  );
}
