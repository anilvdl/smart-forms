// Upgrade Modal for locked components
import React from 'react';
import { useRouter } from 'next/router';
import { useFormBuilder } from '../../services/form-designer/formBuilderContext';
import { ComponentDefinition } from '../../services/form-designer/componentRegistry';
import { X, Check, Zap, Crown } from 'lucide-react';
import styles from '../../styles/form-designer/components/upgrade-modal.module.css';

interface UpgradeModalProps {
  component: ComponentDefinition;
  onClose: () => void;
}

const planFeatures = {
  PRO: [
    'All Basic features',
    'Advanced form elements',
    'Date & time ranges',
    'File uploads',
    'Custom styling',
    'Form analytics',
    'Priority support'
  ],
  ENTERPRISE: [
    'All Pro features',
    'Signature pad',
    'Location picker',
    'Matrix questions',
    'Payment integrations',
    'Custom branding',
    'Dedicated support',
    'SLA guarantees'
  ]
};

const planPricing = {
  PRO: { monthly: 29, yearly: 290 },
  ENTERPRISE: { monthly: 99, yearly: 990 }
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ component, onClose }) => {
  const router = useRouter();
  const { user } = useFormBuilder();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  
  const requiredPlan = component.minPlan;
  const features = planFeatures[requiredPlan as keyof typeof planFeatures] || [];
  const pricing = planPricing[requiredPlan as keyof typeof planPricing];
  
  const handleUpgrade = () => {
    router.push(`/billing/upgrade?plan=${requiredPlan.toLowerCase()}&billing=${billingCycle}`);
  };
  
  const handleStartTrial = () => {
    // Handle trial start
    console.log('Starting trial for', component.type);
    onClose();
  };
  
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              {requiredPlan === 'PRO' ? <Zap size={32} /> : <Crown size={32} />}
            </div>
            <h2 className={styles.title}>
              Upgrade to {requiredPlan} Plan
            </h2>
            <p className={styles.subtitle}>
              The <strong>{component.label}</strong> component requires a {requiredPlan} plan.
            </p>
          </div>
          
          <div className={styles.planDetails}>
            <div className={styles.pricingToggle}>
              <button
                className={`${styles.toggleButton} ${billingCycle === 'monthly' ? styles.active : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`${styles.toggleButton} ${billingCycle === 'yearly' ? styles.active : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className={styles.saveBadge}>Save 17%</span>
              </button>
            </div>
            
            <div className={styles.pricing}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>
                {billingCycle === 'monthly' ? pricing.monthly : Math.floor(pricing.yearly / 12)}
              </span>
              <span className={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'month'}</span>
              {billingCycle === 'yearly' && (
                <span className={styles.yearlyTotal}>
                  ${pricing.yearly}/year
                </span>
              )}
            </div>
            
            <div className={styles.currentPlan}>
              Your current plan: <strong>{user?.plan}</strong>
            </div>
            
            <div className={styles.features}>
              <h4 className={styles.featuresTitle}>What's included:</h4>
              <ul className={styles.featuresList}>
                {features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className={styles.actions}>
            {component.trialAllowed && (
              <button 
                className={`${styles.button} ${styles.trialButton}`}
                onClick={handleStartTrial}
              >
                Try for 7 days
              </button>
            )}
            <button 
              className={`${styles.button} ${styles.upgradeButton}`}
              onClick={handleUpgrade}
            >
              Upgrade Now
            </button>
          </div>
          
          <p className={styles.disclaimer}>
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </>
  );
};