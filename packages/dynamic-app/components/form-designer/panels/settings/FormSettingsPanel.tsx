import React, { useState, useEffect } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { GeneralTab } from './tabs/GeneralTab';
import { LayoutTab } from './tabs/LayoutTab';
import { SubmissionTab } from './tabs/SubmissionTab';
import { PrivacyTab } from './tabs/PrivacyTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { 
  X, 
  Settings, 
  Layout, 
  Send, 
  Shield, 
  Code,
  ArrowLeft,
  Check,
  Save
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/form-settings-panel.module.css';

type SettingsTab = 'general' | 'layout' | 'submission' | 'privacy' | 'advanced';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'submission', label: 'Submission', icon: Send },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'advanced', label: 'Advanced', icon: Code },
] as const;

interface FormSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormSettingsPanel: React.FC<FormSettingsPanelProps> = ({
  isOpen, 
  onClose
}) => {
  const { 
    form,
    isSaving,
    lastSaveTime
  } = useFormBuilder();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle opening/closing with proper animation
  useEffect(() => {
    if (isOpen && !isVisible) {
      setIsVisible(true);
      // Allow animation to start
      setTimeout(() => setIsAnimating(true), 10);
    } else if (!isOpen && isVisible) {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen, isVisible]);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop with animation class */}
      <div 
        className={`${styles.settingsBackdrop} ${isAnimating ? styles.open : ''}`}
        onClick={onClose}
      />
      
      {/* Settings Panel with animation class */}
      <div className={`${styles.settingsPanel} ${isAnimating ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.backButton}
              onClick={onClose}
            >
              <ArrowLeft size={16} />
            </button>
            
            <div className={styles.headerTitle}>
              <h2>Form Settings</h2>
              <p>Configure your form's behavior and appearance</p>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            {/* Auto-save indicator */}
            <div className={styles.saveStatus}>
              {isSaving ? (
                <div className={styles.saving}>
                  <div className={styles.savingSpinner} />
                  <span>Saving...</span>
                </div>
              ) : lastSaveTime ? (
                <div className={styles.saved}>
                  <Check size={14} />
                  <span>Saved</span>
                </div>
              ) : null}
            </div>
            
            <button 
              className={styles.closeButton}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Fixed Height Tab Content */}
        <div className={styles.panelContent}>
          <div className={styles.tabContent}>
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'layout' && <LayoutTab />}
            {activeTab === 'submission' && <SubmissionTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
            {activeTab === 'advanced' && <AdvancedTab />}
          </div>
        </div>
      </div>
    </>
  );
};