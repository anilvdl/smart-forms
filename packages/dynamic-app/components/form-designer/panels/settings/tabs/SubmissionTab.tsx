// Form Submission Settings Component
import React, { useState } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { 
  ChevronRight, 
  Check, 
  Mail, 
  ExternalLink, 
  Hash,
  MessageSquare,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/submission-tab.module.css';

export const SubmissionTab: React.FC = () => {
  const { form, updateFormSettings } = useFormBuilder();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['confirmation', 'limits'])
  );

  const settings = form?.settings || {};
  const submissionSettings = settings.submission || {
    maxSubmissions: null,
    acceptSubmissions: true,
    confirmationMessage: 'Thank you for your submission!',
    redirectUrl: '',
    emailNotifications: {
      enabled: false,
      recipients: '',
      subject: 'New form submission'
    },
    showProgressBar: false,
    requireConfirmation: false,
    allowMultipleSubmissions: true
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

  const updateSubmissionSetting = (key: string, value: any) => {
    const newSettings = {
      ...settings,
      submission: {
        ...submissionSettings,
        [key]: value
      }
    };
    updateFormSettings(newSettings);
  };

  const updateEmailSetting = (key: string, value: any) => {
    // Ensure emailNotifications always has proper structure with required fields
    const currentEmailSettings = submissionSettings.emailNotifications || {
        enabled: false,
        recipients: '',
        subject: 'New form submission'
    };
    
    const newSettings = {
        ...settings,
        submission: {
        ...submissionSettings,
        emailNotifications: {
            enabled: currentEmailSettings.enabled,      // Always boolean
            recipients: currentEmailSettings.recipients, // Always string
            subject: currentEmailSettings.subject,       // Always string
            [key]: value  // Update the specific field
        }
        }
    };
    updateFormSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      maxSubmissions: null,
      acceptSubmissions: true,
      confirmationMessage: 'Thank you for your submission!',
      redirectUrl: '',
      emailNotifications: {
        enabled: false,
        recipients: '',
        subject: 'New form submission'
      },
      showProgressBar: false,
      requireConfirmation: false,
      allowMultipleSubmissions: true
    };
    
    const newSettings = {
      ...settings,
      submission: defaultSettings
    };
    updateFormSettings(newSettings);
  };

  return (
    <div className={styles.submissionTab}>
      {/* Header with Reset */}
      <div className={styles.tabHeader}>
        <div className={styles.headerInfo}>
          <h3>Submission Settings</h3>
          <p>Configure how your form handles submissions and user feedback</p>
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

      {/* Accept Submissions Toggle */}
      <div className={styles.acceptToggle}>
        <div className={styles.toggleContainer}>
          <div className={styles.toggleInfo}>
            <label className={styles.toggleLabel}>Accept Submissions</label>
            <p className={styles.toggleDescription}>
              When disabled, the form will show as closed and won't accept new submissions
            </p>
          </div>
          <button
            className={`${styles.toggle} ${submissionSettings.acceptSubmissions ? styles.active : ''}`}
            onClick={() => updateSubmissionSetting('acceptSubmissions', !submissionSettings.acceptSubmissions)}
          >
            {submissionSettings.acceptSubmissions ? (
              <ToggleRight size={24} />
            ) : (
              <ToggleLeft size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Settings */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('confirmation')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('confirmation') ? styles.expanded : ''}`}
          />
          <MessageSquare size={16} className={styles.sectionIcon} />
          <span>Confirmation Settings</span>
        </button>
        
        {expandedSections.has('confirmation') && (
          <div className={styles.sectionContent}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Success Message
                <span className={styles.required}>*</span>
              </label>
              <textarea
                value={submissionSettings.confirmationMessage}
                onChange={(e) => updateSubmissionSetting('confirmationMessage', e.target.value)}
                className={styles.fieldTextarea}
                rows={3}
                placeholder="Thank you for your submission!"
                required
              />
              <span className={styles.fieldHint}>
                Message shown to users after successful submission
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Redirect URL (Optional)
              </label>
              <div className={styles.inputGroup}>
                <ExternalLink size={16} className={styles.inputIcon} />
                <input
                  type="url"
                  value={submissionSettings.redirectUrl}
                  onChange={(e) => updateSubmissionSetting('redirectUrl', e.target.value)}
                  className={styles.fieldInput}
                  placeholder="https://yoursite.com/thank-you"
                />
              </div>
              <span className={styles.fieldHint}>
                Redirect users to this page after submission (overrides success message)
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={submissionSettings.requireConfirmation}
                  onChange={(e) => updateSubmissionSetting('requireConfirmation', e.target.checked)}
                />
                <span>Require email confirmation before submission is recorded</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submission Limits */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('limits')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('limits') ? styles.expanded : ''}`}
          />
          <Hash size={16} className={styles.sectionIcon} />
          <span>Submission Limits</span>
        </button>
        
        {expandedSections.has('limits') && (
          <div className={styles.sectionContent}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Maximum Submissions
              </label>
              <input
                type="number"
                value={submissionSettings.maxSubmissions || ''}
                onChange={(e) => updateSubmissionSetting('maxSubmissions', e.target.value ? parseInt(e.target.value) : null)}
                className={styles.fieldInput}
                placeholder="Unlimited"
                min="1"
              />
              <span className={styles.fieldHint}>
                Leave empty for unlimited submissions
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={submissionSettings.allowMultipleSubmissions}
                  onChange={(e) => updateSubmissionSetting('allowMultipleSubmissions', e.target.checked)}
                />
                <span>Allow multiple submissions from same user/IP</span>
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={submissionSettings.showProgressBar}
                  onChange={(e) => updateSubmissionSetting('showProgressBar', e.target.checked)}
                />
                <span>Show progress bar on multi-page forms</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('notifications')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('notifications') ? styles.expanded : ''}`}
          />
          <Mail size={16} className={styles.sectionIcon} />
          <span>Email Notifications</span>
        </button>
        
        {expandedSections.has('notifications') && (
          <div className={styles.sectionContent}>
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={submissionSettings.emailNotifications?.enabled}
                  onChange={(e) => updateEmailSetting('enabled', e.target.checked)}
                />
                <span>Send email notifications for new submissions</span>
              </label>
            </div>

            {submissionSettings.emailNotifications?.enabled && (
              <>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Recipients
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    value={submissionSettings.emailNotifications.recipients}
                    onChange={(e) => updateEmailSetting('recipients', e.target.value)}
                    className={styles.fieldInput}
                    placeholder="admin@yoursite.com, user@example.com"
                    required
                  />
                  <span className={styles.fieldHint}>
                    Separate multiple emails with commas
                  </span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={submissionSettings.emailNotifications.subject}
                    onChange={(e) => updateEmailSetting('subject', e.target.value)}
                    className={styles.fieldInput}
                    placeholder="New form submission"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Form Status Info */}
      <div className={styles.statusInfo}>
        <div className={styles.statusRow}>
          <Info size={16} className={styles.infoIcon} />
          <div className={styles.statusContent}>
            <span className={styles.statusLabel}>Current Status:</span>
            <span className={`${styles.statusBadge} ${submissionSettings.acceptSubmissions ? styles.active : styles.closed}`}>
              {submissionSettings.acceptSubmissions ? 'Accepting Submissions' : 'Closed'}
            </span>
          </div>
        </div>
        
        {submissionSettings.maxSubmissions && (
          <div className={styles.statusRow}>
            <Hash size={16} className={styles.infoIcon} />
            <div className={styles.statusContent}>
              <span className={styles.statusLabel}>Submission Limit:</span>
              <span className={styles.statusValue}>{submissionSettings.maxSubmissions}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};