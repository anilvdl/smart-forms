import React, { useEffect, useState } from 'react';
import PlanCard from '@smartforms/shared/components/ui/PlanCard';
import { Footer, NavBar } from '@smartforms/shared/index';

const subscriptionPlans = [
  {
    name: 'Starter',
    price: '$10',
    period: 'mo',
    features: [
      '50 submissions/month',
      'AI-powered form suggestions',
      'Branding removal'
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Pro',
    price: '$25',
    period: 'mo',
    features: [
      '250 submissions/month',
      'White-label forms',
      'Advanced AI & automation workflows'
    ],
    buttonText: 'Get Started',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited submissions',
      'Compliance support (HIPAA, GDPR, SOC 2)',
      'Priority support'
    ],
    buttonText: 'Contact Sales'
  }
];

const payuPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'mo',
    features: ['5 Forms', '25 monthly submissions included', '$0.05 per extra submission'],
    buttonText: 'Try for Free'
  },
  {
    name: 'Starter PAYU',
    price: '$5',
    period: 'mo',
    features: ['10 Forms', '50 submissions included', '$0.03 per extra submission'],
    buttonText: 'Get Started'
  },
  {
    name: 'Pro PAYU',
    price: '$15',
    period: 'mo',
    features: ['100 Forms', '500 submissions included', '$0.02 per extra submission'],
    buttonText: 'Get Started',
    popular: true
  },
  {
    name: 'Enterprise PAYU',
    price: 'Custom',
    period: '',
    features: ['Unlimited submissions', 'Negotiable per-submission pricing'],
    buttonText: 'Contact Sales'
  }
];

const subscriptionComparison = [
  {
    feature: 'Price / month',
    values: subscriptionPlans.map(p => `${p.price}${p.period ? `/${p.period}` : ''}`)
  },
  { feature: 'Submissions included', values: ['50', '250', 'Unlimited'] },
  { feature: 'Extra submissions cost', values: ['—', '—', '—'] },
  { feature: 'AI-powered suggestions', values: ['Yes', 'Yes', 'Yes'] },
  { feature: 'Branding removal', values: ['No', 'Yes', 'Yes'] },
  { feature: 'Automation workflows', values: ['Basic', 'Advanced', 'Advanced'] },
  { feature: 'Compliance support', values: ['No', 'No', 'Yes'] }
];

const payuComparison = [
  {
    feature: 'Price / month',
    values: payuPlans.map(p => `${p.price}${p.period ? `/${p.period}` : ''}`)
  },
  { feature: 'Submissions included', values: ['25', '50', '100', 'Unlimited'] },
  { feature: 'Extra submissions cost', values: ['$0.05', '$0.03', '$0.02', 'Negotiable'] },
  { feature: 'AI-powered suggestions', values: ['Yes', 'Yes', 'Yes', 'Yes'] },
  { feature: 'Branding removal', values: ['No', 'No', 'No', 'No'] },
  { feature: 'Automation workflows', values: ['Basic', 'Basic', 'Advanced', 'Advanced'] },
  { feature: 'Compliance support', values: ['No', 'No', 'No', 'Yes'] }
];

export default function PricingPage() {
  const [tab, setTab] = useState<'subscription' | 'payu'>('subscription');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // default-select the “popular” plan (or first one) on tab change
  useEffect(() => {
    const plans = tab === 'subscription' ? subscriptionPlans : payuPlans;
    const defaultName = plans.find(p => p.popular)?.name ?? plans[0].name;
    setSelectedPlan(defaultName);
  }, [tab]);

  const plans = tab === 'subscription' ? subscriptionPlans : payuPlans;
  const comparisonData =
    tab === 'subscription' ? subscriptionComparison : payuComparison;

  return (
    <>
      <NavBar />

      <div className="pricing-page">
        <div className="pricing-container">
          <h1>SmartForms Pricing Plans</h1>
          <p>Choose the plan that fits your needs—subscription or pay-as-you-use.</p>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-button${tab === 'subscription' ? ' active' : ''}`}
              onClick={() => setTab('subscription')}
            >
              Subscription
            </button>
            <button
              className={`tab-button${tab === 'payu' ? ' active' : ''}`}
              onClick={() => setTab('payu')}
            >
              Pay-As-You-Use
            </button>
          </div>

          {/* Plan cards */}
          <div className="plans">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`plan-wrapper${selectedPlan === plan.name ? ' selected' : ''}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.popular && <div className="badge-top">Popular</div>}
                <PlanCard {...plan} />
              </div>
            ))}
          </div>
          
          {/* Comparison table */}
          <section className="comparison-section">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Compare all plans
            </h2>
            <div className="overflow-x-auto">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th></th>
                    {plans.map(p => (
                      <th key={p.name}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map(row => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      {row.values.map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}