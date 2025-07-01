import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function BillingForm({ data, onNext, onBack }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingDetails({ ...billingDetails, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.line1,
            line2: billingDetails.line2,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.postal_code,
            country: billingDetails.country,
          },
        },
      });

      if (pmError) {
        setError(pmError.message || "Payment method creation failed");
        setIsProcessing(false);
        return;
      }

      // Create subscription on backend
      const response = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId: data.selectedPlan,
          billingCycle: data.billingCycle,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Subscription creation failed");
        setIsProcessing(false);
        return;
      }

      // Handle 3D Secure if required
      if (result.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.clientSecret
        );

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
          setIsProcessing(false);
          return;
        }
      }

      // Success - move to next step
      onNext({
        subscriptionId: result.subscriptionId,
        paymentMethodId: paymentMethod.id,
      });

    } catch (err) {
      console.error("Payment error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="billing-form">
      <h2>Billing Information</h2>
      <p>Enter your payment details to activate your {data.selectedPlan} plan</p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-section">
        <h3>Billing Details</h3>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={billingDetails.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={billingDetails.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address Line 1</label>
          <input
            type="text"
            name="line1"
            value={billingDetails.line1}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address Line 2 (Optional)</label>
          <input
            type="text"
            name="line2"
            value={billingDetails.line2}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={billingDetails.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>State/Province</label>
            <input
              type="text"
              name="state"
              value={billingDetails.state}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={billingDetails.postal_code}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <select
            name="country"
            value={billingDetails.country}
            onChange={handleInputChange}
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            {/* Add more countries as needed */}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Payment Method</h3>
        <div className="card-element-wrapper">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="submit" disabled={!stripe || isProcessing} className="btn-primary">
          {isProcessing ? "Processing..." : "Complete Setup"}
        </button>
      </div>

      <style jsx>{`
        .billing-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .card-element-wrapper {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 30px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #ff6600;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #e55500;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }
      `}</style>
    </form>
  );
}

export default function BillingSetup(props: any) {
  return (
    <Elements stripe={stripePromise}>
      <BillingForm {...props} />
    </Elements>
  );
}
