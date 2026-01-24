// General Tab with Form Details and Logo Settings
import React, { useState } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { LogoUploader } from '../components/LogoUploader';
import { 
  ChevronRight, 
  FileText,
  Image,
  RotateCcw,
  Info 
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/general-tab.module.css';

export const GeneralTab: React.FC = () => {
  const { form, updateFormSettings } = useFormBuilder();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['formDetails']));
  
  // Get current settings with defaults
  const currentSettings = {
    title: form?.title || '',
    description: form?.description || '',
    customId: form?.settings?.customId || '',
    status: form?.status || 'draft',
    logo: form?.settings?.logo || null,
    ...form?.settings
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
  
  const handleSettingChange = (key: string, value: any) => {
    if (key === 'title' || key === 'description' || key === 'status') {
      // These are form-level properties, not in settings
      updateFormSettings({ [key]: value });
    } else {
      updateFormSettings({ [key]: value });
    }
  };
  
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const handleTitleChange = (title: string) => {
    handleSettingChange('title', title);
    
    // Auto-generate slug if customId is empty
    if (!currentSettings.customId) {
      const slug = generateSlugFromTitle(title);
      handleSettingChange('customId', slug);
    }
  };
  
  const resetFormDetails = () => {
    updateFormSettings({
      title: 'Untitled Form',
      description: '',
      customId: 'untitled-form',
      status: 'draft'
    });
  };
  
  const handleLogoUpdate = (logoData: any) => {
    updateFormSettings({
      logo: logoData
    });
  };
  
  const removeLogo = () => {
    updateFormSettings({
      logo: undefined
    });
  };
  
  return (
    <div className={styles.generalTab}>
      {/* Form Details Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('formDetails')}
          aria-expanded={expandedSections.has('formDetails')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('formDetails') ? styles.expanded : ''}`}
          />
          <FileText size={18} />
          <span>Form Details</span>
        </button>
        
        {expandedSections.has('formDetails') && (
          <div className={styles.sectionContent}>
            <div className={styles.settingGrid}>
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  Form Title
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={currentSettings.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={styles.input}
                  placeholder="Enter form title"
                />
                <p className={styles.helpText}>
                  This title will appear at the top of your form
                </p>
              </div>
              
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>Form Description</label>
                <textarea
                  value={currentSettings.description}
                  onChange={(e) => handleSettingChange('description', e.target.value)}
                  className={styles.textarea}
                  placeholder="Describe what this form is for..."
                  rows={3}
                />
                <p className={styles.helpText}>
                  Optional description to help users understand the form's purpose
                </p>
              </div>
              
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  Custom Form ID / Slug
                  <span className={styles.optional}>Optional</span>
                </label>
                <div className={styles.urlInput}>
                  <span className={styles.urlPrefix}>smartforms.com/f/</span>
                  <input
                    type="text"
                    value={currentSettings.customId}
                    onChange={(e) => handleSettingChange('customId', e.target.value)}
                    className={styles.slugInput}
                    placeholder="custom-form-name"
                  />
                </div>
                <p className={styles.helpText}>
                  Create a custom URL for your form. Leave empty for auto-generated ID.
                </p>
              </div>
              
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>Form Status</label>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioOption} ${currentSettings.status === 'draft' ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={currentSettings.status === 'draft'}
                      onChange={(e) => handleSettingChange('status', e.target.value)}
                    />
                    <div className={styles.radioContent}>
                      <span className={styles.radioLabel}>Draft</span>
                      <span className={styles.radioDescription}>Form is not live yet</span>
                    </div>
                  </label>
                  
                  <label className={`${styles.radioOption} ${currentSettings.status === 'published' ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={currentSettings.status === 'published'}
                      onChange={(e) => handleSettingChange('status', e.target.value)}
                    />
                    <div className={styles.radioContent}>
                      <span className={styles.radioLabel}>Published</span>
                      <span className={styles.radioDescription}>Form is live and accepting submissions</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className={styles.actionRow}>
              <button 
                className={styles.resetButton}
                onClick={resetFormDetails}
              >
                <RotateCcw size={16} />
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Logo Settings Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('logoSettings')}
          aria-expanded={expandedSections.has('logoSettings')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('logoSettings') ? styles.expanded : ''}`}
          />
          <Image size={18} />
          <span>Logo Settings</span>
          {currentSettings.logo && (
            <div className={styles.hasLogo}>
              <div className={styles.logoIndicator} />
              <span>Logo Added</span>
            </div>
          )}
        </button>
        
        {expandedSections.has('logoSettings') && (
          <div className={styles.sectionContent}>
            <div className={styles.logoSection}>
              <LogoUploader
                currentLogo={currentSettings.logo}
                onLogoUpdate={handleLogoUpdate}
                onLogoRemove={removeLogo}
              />
              
              {currentSettings.logo && (
                <div className={styles.logoControls}>
                  <div className={styles.controlRow}>
                    <div className={styles.controlItem}>
                      <label className={styles.controlLabel}>Size</label>
                      <select
                        value={currentSettings.logo.size || 'medium'}
                        onChange={(e) => handleLogoUpdate({
                          ...currentSettings.logo,
                          size: e.target.value
                        })}
                        className={styles.select}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    <div className={styles.controlItem}>
                      <label className={styles.controlLabel}>Alignment</label>
                      <select
                        value={currentSettings.logo.alignment || 'center'}
                        onChange={(e) => handleLogoUpdate({
                          ...currentSettings.logo,
                          alignment: e.target.value
                        })}
                        className={styles.select}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.infoBox}>
                    <Info size={16} />
                    <span>Logo will automatically replace the "+ ADD YOUR LOGO" placeholder in your form</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};