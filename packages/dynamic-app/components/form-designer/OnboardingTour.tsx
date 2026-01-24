// Interactive Onboarding Tour Component
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { onboardingSteps } from '../../services/form-designer/mockData';
import styles from '../../styles/form-designer/components/onboarding-tour.module.css';

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  
  useEffect(() => {
    const updateTargetPosition = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
      }
    };
    
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [step]);
  
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%' };
    
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 20;
    
    let top = targetRect.top;
    let left = targetRect.left;
    
    switch (step.placement) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }
    
    // Keep tooltip within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    
    return { top: `${top}px`, left: `${left}px` };
  };
  
  return (
    <div className={styles.tourOverlay}>
      {/* Highlight */}
      {targetRect && step.placement !== 'center' && (
        <div 
          ref={highlightRef}
          className={styles.highlight}
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        className={`${styles.tooltip} ${styles[step.placement]}`}
        style={getTooltipPosition()}
      >
        <button className={styles.skipButton} onClick={handleSkip}>
          <X size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={styles.stepIndicator}>
            Step {currentStep + 1} of {onboardingSteps.length}
          </div>
          
          <p className={styles.stepContent}>{step.content}</p>
          
          <div className={styles.actions}>
            <button
              className={styles.previousButton}
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className={styles.dots}>
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.dot} ${index === currentStep ? styles.active : ''}`}
                />
              ))}
            </div>
            
            <button
              className={styles.nextButton}
              onClick={handleNext}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};