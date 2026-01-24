import React, { useState } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { 
  ChevronRight, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Users, 
  Key,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info,
  Globe,
  UserCheck,
  Database,
  Clock
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/privacy-tab.module.css';

export const PrivacyTab: React.FC = () => {
  const { form, updateFormSettings, user } = useFormBuilder();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['visibility', 'security'])
  );

  const settings = form?.settings || {};
  const privacySettings = settings.privacy || {
    isPublic: true,
    requiresPassword: false,
    password: '',
    allowedUsers: [],
    allowedRoles: ['all'],
    captchaEnabled: false,
    captchaType: 'recaptcha',
    ipBlocking: false,
    blockedIPs: [],
    dataRetention: 'forever',
    gdprCompliance: true,
    collectAnalytics: true
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updatePrivacySetting = (key: string, value: any) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...privacySettings,
        [key]: value
      }
    };
    updateFormSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      isPublic: true,
      requiresPassword: false,
      password: '',
      allowedUsers: [],
      allowedRoles: ['all'],
      captchaEnabled: false,
      captchaType: 'recaptcha',
      ipBlocking: false,
      blockedIPs: [],
      dataRetention: 'forever',
      gdprCompliance: true,
      collectAnalytics: true
    };
    
    const newSettings = {
      ...settings,
      privacy: defaultSettings
    };
    updateFormSettings(newSettings);
  };

  return (
    <div className={styles.privacyTab}>
      {/* Header with Reset */}
      <div className={styles.tabHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <Shield size={24} />
          </div>
          <div>
            <h3>Privacy & Security</h3>
            <p>Control who can access your form and how data is protected</p>
          </div>
        </div>
        <button 
          className={styles.resetButton}
          onClick={resetToDefaults}
          title="Reset to defaults"
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>

      {/* Security Status Summary */}
      <div className={styles.securityStatus}>
        <div className={styles.statusHeader}>
          <div className={styles.statusIcon}>
            <AlertTriangle size={16} />
          </div>
          <span>Security Status</span>
        </div>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <Globe size={14} />
            <span className={styles.statusLabel}>Public access</span>
          </div>
          <div className={styles.statusItem}>
            <Key size={14} />
            <span className={styles.statusLabel}>No password</span>
          </div>
          <div className={styles.statusItem}>
            <Shield size={14} />
            <span className={styles.statusLabel}>No CAPTCHA</span>
          </div>
        </div>
      </div>

      {/* Form Visibility */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('visibility')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('visibility') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Eye size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Form Visibility</h4>
            <p>Choose who can access and view your form</p>
          </div>
        </button>
        
        {expandedSections.has('visibility') && (
          <div className={styles.sectionContent}>
            <div className={styles.optionGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  checked={privacySettings.isPublic}
                  onChange={() => updatePrivacySetting('isPublic', true)}
                  className={styles.radioInput}
                />
                <label htmlFor="public" className={styles.radioLabel}>
                  <div className={styles.radioContent}>
                    <div className={styles.radioHeader}>
                      <Globe size={16} />
                      <span className={styles.radioTitle}>Public</span>
                    </div>
                    <p className={styles.radioDescription}>
                      Anyone with the link can access this form
                    </p>
                  </div>
                </label>
              </div>
              
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="private"
                  name="visibility"
                  checked={!privacySettings.isPublic}
                  onChange={() => updatePrivacySetting('isPublic', false)}
                  className={styles.radioInput}
                />
                <label htmlFor="private" className={styles.radioLabel}>
                  <div className={styles.radioContent}>
                    <div className={styles.radioHeader}>
                      <UserCheck size={16} />
                      <span className={styles.radioTitle}>Private</span>
                    </div>
                    <p className={styles.radioDescription}>
                      Only specified users or roles can access this form
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Protection */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('password')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('password') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Lock size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Password Protection</h4>
            <p>Require a password to access your form</p>
          </div>
          <div className={styles.sectionToggle}>
            <button
              className={`${styles.toggle} ${privacySettings.requiresPassword ? styles.active : ''}`}
              onClick={() => updatePrivacySetting('requiresPassword', !privacySettings.requiresPassword)}
            >
              {privacySettings.requiresPassword ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          </div>
        </button>
        
        {expandedSections.has('password') && privacySettings.requiresPassword && (
          <div className={styles.sectionContent}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Password
              </label>
              <input
                type="password"
                value={privacySettings.password || ''}
                onChange={(e) => updatePrivacySetting('password', e.target.value)}
                placeholder="Enter form password"
                className={styles.textInput}
              />
              <p className={styles.inputHint}>
                Users will need this password to access the form
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security Features */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('security')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('security') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Shield size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Security Features</h4>
            <p>Prevent spam and bot submissions</p>
          </div>
        </button>
        
        {expandedSections.has('security') && (
          <div className={styles.sectionContent}>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureHeader}>
                  <div className={styles.featureInfo}>
                    <h5>Enable CAPTCHA verification</h5>
                    <p>Prevent spam and bot submissions</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${privacySettings.captchaEnabled ? styles.active : ''}`}
                    onClick={() => updatePrivacySetting('captchaEnabled', !privacySettings.captchaEnabled)}
                  >
                    {privacySettings.captchaEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
                {privacySettings.captchaEnabled && (
                  <div className={styles.featureOptions}>
                    <select
                      value={privacySettings.captchaType}
                      onChange={(e) => updatePrivacySetting('captchaType', e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="recaptcha">Google reCAPTCHA</option>
                      <option value="hcaptcha">hCaptcha</option>
                      <option value="turnstile">Cloudflare Turnstile</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureHeader}>
                  <div className={styles.featureInfo}>
                    <h5>Enable IP address blocking</h5>
                    <p>Block specific IP addresses from submitting</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${privacySettings.ipBlocking ? styles.active : ''}`}
                    onClick={() => updatePrivacySetting('ipBlocking', !privacySettings.ipBlocking)}
                  >
                    {privacySettings.ipBlocking ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Protection */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('dataProtection')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('dataProtection') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Database size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Data Protection</h4>
            <p>Configure data retention and compliance settings</p>
          </div>
        </button>
        
        {expandedSections.has('dataProtection') && (
          <div className={styles.sectionContent}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Data Retention Period
              </label>
              <select
                value={privacySettings.dataRetention}
                onChange={(e) => updatePrivacySetting('dataRetention', e.target.value)}
                className={styles.selectInput}
              >
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="2years">2 years</option>
                <option value="forever">Forever</option>
              </select>
              <p className={styles.inputHint}>
                How long to keep form submission data
              </p>
            </div>
            
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureHeader}>
                  <div className={styles.featureInfo}>
                    <h5>GDPR Compliance</h5>
                    <p>Enable GDPR data protection features</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${privacySettings.gdprCompliance ? styles.active : ''}`}
                    onClick={() => updatePrivacySetting('gdprCompliance', !privacySettings.gdprCompliance)}
                  >
                    {privacySettings.gdprCompliance ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureHeader}>
                  <div className={styles.featureInfo}>
                    <h5>Collect Analytics</h5>
                    <p>Track form views and submission analytics</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${privacySettings.collectAnalytics ? styles.active : ''}`}
                    onClick={() => updatePrivacySetting('collectAnalytics', !privacySettings.collectAnalytics)}
                  >
                    {privacySettings.collectAnalytics ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};