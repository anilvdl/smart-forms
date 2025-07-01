import { useRouter } from "next/router";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function OnboardingComplete({ data }: any) {
  const router = useRouter();

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 500,
      spread: 250,
      origin: { y: 0.6 },
    });

    // Clear onboarding data from session
    sessionStorage.removeItem("emailVerified");
    sessionStorage.removeItem("userEmail");
  }, []);

  const finishOnboarding = async () => {
    // do whatever needs onBoardingComplete=true
    await router.push(
      // 1) the actual URL _with_ the query so your page/component sees it:
      {
        pathname: '/dashboard',
        query: { onBoardingComplete: 'true' },
      },
      // 2) the URL you want to display in the browser (no query):
      '/dashboard',
      // 3) optional shallow so you don’t fully reload getServerSideProps, etc.
      { shallow: true }
    )
  }

  const goToDashboard = () => {
    finishOnboarding();
  };

  return (
    <div className="complete-container">
      <div className="success-icon">🎉</div>
      <h1>Welcome to SmartForms!</h1>
      <p className="subtitle">Your account is all set up and ready to go</p>

      <div className="summary">
        <h3>Your Setup Summary:</h3>
        <div className="summary-item">
          <span className="label">Plan:</span>
          <span className="value">{data.selectedPlan}</span>
        </div>
        <div className="summary-item">
          <span className="label">Billing:</span>
          <span className="value">{data.billingCycle}</span>
        </div>
      </div>

      <div className="next-steps">
        <h3>What's Next?</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">📝</div>
            <h4>Create Your First Form</h4>
            <p>Start with a template or build from scratch</p>
          </div>
          <div className="step-card">
            <div className="step-icon">👥</div>
            <h4>Invite Team Members</h4>
            <p>Collaborate with your team on forms</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🎨</div>
            <h4>Customize Your Brand</h4>
            <p>Add your logo and brand colors</p>
          </div>
        </div>
      </div>

      <button onClick={goToDashboard} className="btn-primary">
        Go to Dashboard
      </button>

      <style jsx>{`
        .complete-container {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .summary {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .summary h3 {
          margin-bottom: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .label {
          font-weight: 500;
        }

        .value {
          color: #ff6600;
          font-weight: bold;
        }

        .next-steps {
          margin-bottom: 2rem;
        }

        .next-steps h3 {
          margin-bottom: 1rem;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .step-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .step-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .step-card h4 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .step-card p {
          color: #666;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: #ff6600;
          color: white;
          border: none;
          padding: 1rem 3rem;
          border-radius: 30px;
          font-size: 1.125rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-primary:hover {
          background: #e55500;
        }
      `}</style>
    </div>
  );
}