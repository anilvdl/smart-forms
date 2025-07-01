import { useState } from "react";
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  recommended?: boolean;
  enterprise?: boolean;
  type: "subscription" | "payu";
}

const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: "free",
    name: "FREE",
    priceMonthly: 0,
    priceAnnual: 0,
    type: "subscription",
    features: [
      "5 Forms",
      "5 Submissions/month",
      "Basic form elements",
      "Email notifications",
      "SmartForms branding",
    ],
  },
  {
    id: "starter",
    name: "STARTER",
    priceMonthly: 10,
    priceAnnual: 108,
    type: "subscription",
    features: [
      "10 Forms",
      "50 Submissions/month",
      "All form elements",
      "Custom branding",
      "2 Team members",
      "1GB Storage",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    priceMonthly: 25,
    priceAnnual: 270,
    type: "subscription",
    recommended: true,
    features: [
      "25 Forms",
      "250 Submissions/month",
      "Advanced features",
      "White-label options",
      "5 Team members",
      "5GB Storage",
      "Priority support",
      "API access",
      "Custom integrations",
      "Advanced analytics",
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    priceMonthly: 0,
    priceAnnual: 0,
    enterprise: true,
    type: "subscription",
    features: [
      "Unlimited Forms",
      "Unlimited Submissions",
      "All Pro features",
      "Unlimited team members",
      "Dedicated support",
      "Custom SLA",
      "SSO integration",
      "Advanced security",
      "On-premise option",
    ],
  },
];

const PAYU_PLANS: Plan[] = [
  {
    id: "starter-payu",
    name: "STARTER",
    priceMonthly: 5,
    priceAnnual: 54,
    type: "payu",
    features: [
      "5 Forms included",
      "25 Submissions included",
      "$0.20 per extra submission",
      "1 Team member",
      "Basic features",
    ],
  },
  {
    id: "pro-payu",
    name: "PRO",
    priceMonthly: 15,
    priceAnnual: 162,
    type: "payu",
    recommended: true,
    features: [
      "50 Forms included",
      "150 Submissions included",
      "$0.15 per extra submission",
      "3 Team members",
      "All features",
      "API access",
    ],
  },
  {
    id: "enterprise-payu",
    name: "ENTERPRISE",
    priceMonthly: 0,
    priceAnnual: 0,
    enterprise: true,
    type: "payu",
    features: [
      "Custom forms quota",
      "Custom submissions quota",
      "Volume-based pricing",
      "All Pro features",
      "Dedicated support",
      "Custom contract",
    ],
  },
];

export default function PlanSelection({ data, onNext }: any) {
  const { data: session } = useSession();
  const [billingType, setBillingType] = useState<"subscription" | "payu">("subscription");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isPayAsYouUse, setIsPayAsYouUse] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const plans = billingType === "subscription" ? SUBSCRIPTION_PLANS : PAYU_PLANS;

  const handleSelectPlan = (planId: string) => {
    if (planId.includes("enterprise")) {
      // Handle enterprise differently
      alert("Please contact our sales team for Enterprise pricing");
      return;
    }
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan to continue');
      return;
    }

    setIsUpdating(true);

    try {
      // Construct the full plan name
      let fullPlanName = selectedPlan;
      if (isPayAsYouUse && selectedPlan !== 'FREE') {
        fullPlanName = `${selectedPlan}-PAYU`;
      }

      // Call the billing update API
      const response = await fetch('/api/billing/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: session?.user?.activeOrgId,
          billingPlan: fullPlanName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update billing plan');
      }

      const data = await response.json();

      // Store selected plan info for next steps
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        plan: fullPlanName,
        billingCycle,
        requiresPayment: data.requiresPayment
      }));

      onNext({
        selectedPlan,
        billingCycle: billingCycle,
        billingType,
      }); 
      // Navigate to next step
      // if (data.requiresPayment) {
      //   onNext('billing'); // Go to billing setup for paid plans
      // } else {
        // onNext('complete'); // Skip billing for FREE plan
      // }

    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSavingsText = (plan: Plan) => {
    if (plan.priceMonthly === 0) return "Contact sales";
    const monthlyCost = plan.priceMonthly * 12;
    const savings = monthlyCost - plan.priceAnnual;
    return `Save $${savings} a year`;
  };

  const getMonthlyTagline = (plan: Plan) => {
    if (plan.enterprise) return "Custom pricing";
    if (plan.priceMonthly === 0) return "Get started free";
    return "Flexible billing";
  };

  const renderFeatures = (plan: Plan, isExpanded: boolean = false) => {
    const displayFeatures = isExpanded ? plan.features : plan.features.slice(0, 5);
    const hasMore = plan.features.length > 5 && !isExpanded;

    return (
      <>
        <ul className="features">
          {displayFeatures.map((feature, index) => (
            <li key={index}>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M1 6L5.5 10.5L14.5 1.5" stroke="#5b6af3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{color: "black", fontSize: 15}}>   {feature}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button 
            className="show-more"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedCard(plan.id);
            }}
          >
            + Show more
          </button>
        )}
      </>
    );
  };

  return (
    <div className="plan-selection">
      <div className="header">
        <h1>Choose a plan</h1>
        <p>Give your team the features they need to succeed.</p>
      </div>

      {/* Billing Type Toggle */}
      <div className="toggles-container">
        <div className="pill-toggle billing-cycle">
          <button
            className={billingType === "subscription" ? "active" : ""}
            onClick={() => setBillingType("subscription")}
          >
            Subscription Plan
          </button>
          <button
            className={billingType === "payu" ? "active" : ""}
            onClick={() => setBillingType("payu")}
          >
            Pay As You Use
          </button>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="pill-toggle billing-cycle">
          <button
            className={billingCycle === "monthly" ? "active" : ""}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={billingCycle === "yearly" ? "active" : ""}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            {billingCycle === "yearly" && (
              <div className="thumbs-up-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#5b6af3">
                  <path d="M1 21h4V9H1v12zM23 10c0-1.1-0.9-2-2-2h-6.31l0.95-4.57.03-0.32c0-0.41-0.17-0.79-0.44-1.06L15.17 2 7.59 9.59C7.22 9.95 7 10.45 7 11v8c0 1.1 0.9 2 2 2h8c0.83 0 1.54-0.5 1.84-1.22l3.02-7.05c0.09-0.23 0.14-0.47 0.14-0.73v-0.01L23 10z"/>
                </svg>
              </div>
            )}
          </button>
          <div className="save-indicator">
            <svg width="60" height="40" viewBox="0 0 60 40" className="save-arrow">
                <g transform="scale(0.1171875,0.078125)">
                  <path
                    fill="#5b6af3" stroke="#5b6af3" strokeWidth="3"
                    d="M398.929,111.802c-0.007-0.005-0.01-0.008-0.014-0.014c-0.604-0.599-1.233-1.17-1.889-1.706
                    c-0.323-0.264-0.664-0.49-0.994-0.735c-0.326-0.24-0.641-0.494-0.977-0.719c-0.482-0.321-0.981-0.604-1.479-0.889
                    c-0.211-0.122-0.416-0.257-0.631-0.372c-0.475-0.255-0.967-0.475-1.459-0.698c-0.26-0.118-0.516-0.254-0.779-0.364
                    c-0.426-0.176-0.862-0.318-1.292-0.47c-0.353-0.125-0.703-0.26-1.06-0.37c-0.347-0.105-0.697-0.181-1.047-0.269
                    c-0.457-0.118-0.911-0.245-1.376-0.336c-0.264-0.052-0.531-0.079-0.793-0.123c-0.551-0.091-1.102-0.184-1.66-0.24
                    c-0.215-0.022-0.433-0.02-0.651-0.036c-0.599-0.044-1.195-0.086-1.802-0.086c-0.333,0-0.668,0.032-1.001,0.046
                    c-0.482,0.019-0.96,0.022-1.446,0.069c-0.839,0.079-1.677,0.206-2.506,0.369c-0.007,0.002-0.017,0.002-0.024,0.003
                    c-0.103,0.02-0.194,0.054-0.298,0.074c-0.717,0.15-1.43,0.325-2.134,0.538c-0.26,0.078-0.509,0.181-0.766,0.267
                    c-0.529,0.179-1.057,0.357-1.576,0.571c-0.347,0.144-0.68,0.314-1.021,0.473c-0.406,0.189-0.812,0.37-1.212,0.583
                    c-0.413,0.22-0.807,0.47-1.202,0.71c-0.308,0.186-0.617,0.358-0.918,0.558c-0.482,0.323-0.942,0.676-1.4,1.031
                    c-0.198,0.152-0.402,0.289-0.599,0.45c-0.599,0.49-1.165,1.009-1.714,1.55c-0.049,0.047-0.103,0.086-0.149,0.135l-0.024,0.024
                    c-0.034,0.032-0.063,0.063-0.096,0.093L257.409,217.451c-9.905,9.903-9.905,25.962,0,35.867c4.952,4.954,11.442,7.428,17.934,7.428
                    c6.489,0,12.982-2.477,17.931-7.428l65.664-65.662c-7.265,79.976-66.287,149.227-148.908,165.662
                    c-60.48,12.03-122.865-6.657-166.873-49.988c-9.984-9.829-26.04-9.703-35.867,0.277c-9.829,9.981-9.702,26.038,0.277,35.867
                    c44.808,44.118,104.584,68.154,166.13,68.152h0.002l0,0c15.364-0.002,30.848-1.5,46.228-4.558
                    c104.643-20.815,179.471-108.065,189.377-209.151l59.399,59.397c9.903,9.905,25.962,9.905,35.867,0
                    c9.906-9.905,9.906-25.962,0-35.867L398.929,111.802z"
                  />
                </g>
              </svg>
            <span className="save-text">Save 10%</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${selectedPlan === plan.id ? "selected" : ""} ${plan.enterprise ? "enterprise" : ""}`}
            onClick={() => !plan.enterprise && handleSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="popular-ribbon">
                <span>POPULAR</span>
              </div>
            )}
            
            <div className="plan-content">
              <div className="plan-header">
                <h3>{plan.name}</h3>
              </div>

              <div className="pricing">
                {!plan.enterprise ? (
                  <>
                    <div className="price">
                      <span className="currency">$</span>
                      <span className="amount">
                        {billingCycle === "monthly" ? plan.priceMonthly : Math.round(plan.priceAnnual / 12)}
                      </span>
                      <span className="period">/ mo</span>
                    </div>
                    <div className="tagline">
                      {billingCycle === "yearly" ? getSavingsText(plan) : getMonthlyTagline(plan)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="enterprise-pricing">
                      <span>Custom Pricing</span>
                    </div>
                    <div className="tagline">
                      Tailored for your needs
                    </div>
                  </>
                )}
              </div>

              {renderFeatures(plan)}
            </div>

            <button 
              className={`select-btn ${plan.enterprise ? "enterprise-btn" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPlan(plan.id);
              }}
            >
              {plan.enterprise 
                ? "CONTACT SALES" 
                : selectedPlan === plan.id 
                  ? "SELECTED" 
                  : `CHOOSE ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Expanded Card Modal */}
      {expandedCard && (
        <div className="modal-overlay" onClick={() => setExpandedCard(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setExpandedCard(null)}>×</button>
            {(() => {
              const plan = plans.find(p => p.id === expandedCard);
              if (!plan) return null;
              
              return (
                <>
                  <h3>{plan.name} Plan Features</h3>
                  <div className="modal-features">
                    {renderFeatures(plan, true)}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Taxes Note */}
      <p className="taxes-note">* Plus applicable taxes</p>

      {/* Continue Button */}
      {selectedPlan && (
        <div className="actions">
          <button className="btn-continue" onClick={handleContinue}>
            {isUpdating ? 'Updating...' : 'Continue'}
          </button>
        </div>
      )}

      {/* Trusted By Section */}
      <div className="trusted-by">
        <p>TRUSTED BY</p>
        <div className="logos">
          <span style={{ fontFamily: 'Arial Black', fontSize: '1.25rem' }}>myideas4u</span>
          <span style={{ fontFamily: 'Arial', fontSize: '1.25rem', fontWeight: 'bold' }}>murthyastro</span>
          <span style={{ fontFamily: 'Arial Black', fontSize: '1.25rem' }}>kidzeal</span>
          <span style={{ fontFamily: 'Arial', fontSize: '1.25rem', fontWeight: 'bold' }}>dayone.dev</span>
        </div>
      </div>

      <style jsx>{`
        .thumbs-up-icon { 
          position: absolute; 
          top: -10px; 
          left: 220px; 
          animation: bounce 1s infinite; 
        }

        .plan-selection {
          max-width: 2000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #666;
          font-size: 1.125rem;
        }

        .toggles-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .pill-toggle {
          display: inline-flex;
          background:rgb(231, 231, 233);
          border-radius: 100px;
          padding: 1px;
          position: relative;
        }

        .pill-toggle button {
          padding: 0.75rem 2rem;
          border: none;
          background: transparent;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
          color: #666;
          font-size: 0.95rem;
        }

        .pill-toggle button.active {
          background: #ff6600;
          color: white;
          box-shadow: 0 2px 8px rgba(255, 102, 0, 0.3);
        }

        .billing-cycle {
          position: relative;
        }

        .save-indicator {
          position: absolute;
          top: 15px;
          right: -80px;
        }

        .save-arrow {
          position: absolute;
          top: 0px;
          right: 30px;
        }

        .save-text {
          position: absolute;
          width: 90px;
          top: -20px;
          right: -30px;
          font-size: 1rem;
          font-weight: bold;
          color: #5b6af3;
          font-family: 'Comic Sans MS', cursive;
          transform: rotate(-10deg);
        }

        .plans-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          max-width: 2000px;
        }

        @media (min-width: 2000px) {
          .plans-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1199px) and (min-width: 900px) {
          .plans-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .plan-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 0;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          // height: 500px;
          overflow: hidden;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .plan-card.selected {
          border-color: #ff6600;
          background: #fff5f0;
        }

        .plan-card.enterprise {
          border-color:rgb(187, 118, 118);
          cursor: pointer;
        }

        .popular-ribbon {
          position: absolute;
          background: #5b6af3;
          color: white;
          padding: 5px 30px;
          font-size: 0.75rem;
          font-weight: bold;
          top: 20px;
          right: -30px;
          transform: rotate(45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .plan-content {
          padding: 2.5rem;
          flex: none;
          display: flex;
          flex-direction: column;
        }

        .plan-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          text-align: center;
        }

        .pricing {
          text-align: center;
          margin-bottom: 1.5rem;
          height: 10px;
        }

        .price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .currency {
          font-size: 1.25rem;
          color: #333;
          margin-right: 2px;
        }

        .amount {
          font-size: 3rem;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }

        .period {
          font-size: 1rem;
          color: #6b7280;
          margin-left: 1px;
        }

        .enterprise-pricing {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .tagline {
          color: #5b6af3;
          font-size: 0.875rem;
          font-weight: 500;
          height: 10px;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
        }

        .features li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
          color: #4b5563;
          font-size: 0.2rem;
        }

        .features svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #5b6af3;
        }

        .show-more {
          background: none;
          border: none;
          color: #5b6af3;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 0.5rem;
          padding: 0;
        }

        .show-more:hover {
          color: #4b4ed0;
        }

        .select-btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0 0 14px 14px;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.025em;
          cursor: pointer;
          transition: all 0.2s;
          background: #5b6af3;
          color: white;
          margin-top: auto;
        }

        .select-btn:hover {
          background: #4b4ed0;
        }

        .plan-card.selected .select-btn {
          background: #ff6600;
        }

        .plan-card.selected .select-btn:hover {
          background: #e55500;
        }

        .enterprise-btn {
          background: rgb(187, 118, 118);
        }

        .enterprise-btn:hover {
          background: #dc2626;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-card h3 {
          margin-bottom: 0.1rem;
          color: #333;
        }

        .modal-features {
          max-height: 400px;
          overflow-y: auto;
        }

        .close-btn {
          position: absolute;
          top: 0.1rem;
          right: 0.1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #999;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #333;
        }

        .taxes-note {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .actions {
          text-align: center;
          margin: 2rem 0;
        }

        .btn-continue {
          background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%);
          color: white;
          border: none;
          padding: 1rem 3rem;
          border-radius: 30px;
          font-size: 1.125rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);
        }

        .btn-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 102, 0, 0.4);
        }

        .trusted-by {
          text-align: center;
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .trusted-by p {
          font-size: 0.75rem;
          color: #9ca3af;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
          opacity: 0.5;
          filter: grayscale(100%);
        }
      `}</style>
    </div>
  );
}