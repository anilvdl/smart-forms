import React, { useState } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { 
  ChevronRight, 
  Code, 
  Save, 
  Zap, 
  Webhook, 
  Database, 
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Clock,
  Archive,
  Download,
  Gauge
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/advanced-tab.module.css';

export const AdvancedTab: React.FC = () => {
  const { form, updateFormSettings } = useFormBuilder();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['autoSave', 'performance'])
  );

  const settings = form?.settings || {};
  const advancedSettings = settings.advanced || {
    autoSaveInterval: 30,
    maxVersions: 50,
    enableVersioning: true,
    webhooks: [],
    customCSS: '',
    customJS: '',
    dataExport: {
      format: 'json',
      includeMetadata: true,
      compression: false
    },
    performance: {
      lazyLoading: true,
      optimizedImages: true,
      cacheTimeout: 3600
    }
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

  const updateAdvancedSetting = (key: string, value: any) => {
    const newSettings = {
      ...settings,
      advanced: {
        ...advancedSettings,
        [key]: value
      }
    };
    updateFormSettings(newSettings);
  };

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    const currentParentValue = advancedSettings[parent as keyof typeof advancedSettings];
    const newSettings = {
      ...settings,
      advanced: {
        ...advancedSettings,
        [parent]: {
          ...(currentParentValue && typeof currentParentValue === 'object' ? currentParentValue : {}),
          [key]: value
        }
      }
    };
    updateFormSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      autoSaveInterval: 30,
      maxVersions: 50,
      enableVersioning: true,
      webhooks: [],
      customCSS: '',
      customJS: '',
      dataExport: {
        format: 'json',
        includeMetadata: true,
        compression: false
      },
      performance: {
        lazyLoading: true,
        optimizedImages: true,
        cacheTimeout: 3600
      }
    };
    
    const newSettings = {
      ...settings,
      advanced: defaultSettings
    };
    updateFormSettings(newSettings);
  };

  return (
    <div className={styles.advancedTab}>
      {/* Header with Reset */}
      <div className={styles.tabHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <Code size={24} />
          </div>
          <div>
            <h3>Advanced Settings</h3>
            <p>Configure advanced form behavior, integrations, and performance</p>
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

      {/* Auto-save Configuration */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('autoSave')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('autoSave') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Save size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Auto-save Configuration</h4>
            <p>How often to automatically save form changes</p>
          </div>
        </button>
        
        {expandedSections.has('autoSave') && (
          <div className={styles.sectionContent}>
            <div className={styles.configGrid}>
              <div className={styles.configItem}>
                <label className={styles.configLabel}>
                  <Clock size={16} />
                  Auto-save Interval (seconds)
                </label>
                <div className={styles.sliderGroup}>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={advancedSettings.autoSaveInterval}
                    onChange={(e) => updateAdvancedSetting('autoSaveInterval', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.sliderValue}>{advancedSettings.autoSaveInterval}s</span>
                </div>
                <p className={styles.configHint}>
                  How often to automatically save form changes
                </p>
              </div>
              
              <div className={styles.configItem}>
                <label className={styles.configLabel}>
                  <Archive size={16} />
                  Maximum Versions to Keep
                </label>
                <div className={styles.sliderGroup}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={advancedSettings.maxVersions}
                    onChange={(e) => updateAdvancedSetting('maxVersions', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.sliderValue}>{advancedSettings.maxVersions}</span>
                </div>
                <p className={styles.configHint}>
                  Older versions will be automatically deleted
                </p>
              </div>
            </div>
            
            <div className={styles.featureToggle}>
              <div className={styles.toggleHeader}>
                <div className={styles.toggleInfo}>
                  <h5>Enable version history</h5>
                  <p>Keep track of form changes for rollback capability</p>
                </div>
                <button
                  className={`${styles.toggle} ${advancedSettings.enableVersioning ? styles.active : ''}`}
                  onClick={() => updateAdvancedSetting('enableVersioning', !advancedSettings.enableVersioning)}
                >
                  {advancedSettings.enableVersioning ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Webhooks & Integrations */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('webhooks')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('webhooks') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Webhook size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Webhooks & Integrations</h4>
            <p>Connect your form to external services</p>
          </div>
          <div className={styles.sectionBadge}>
            <span className={styles.comingSoon}>Coming Soon</span>
          </div>
        </button>
        
        {expandedSections.has('webhooks') && (
          <div className={styles.sectionContent}>
            <div className={styles.placeholderContent}>
              <div className={styles.placeholderIcon}>
                <Webhook size={32} />
              </div>
              <h5>Webhook Integration</h5>
              <p>Send form submissions to external URLs, integrate with Zapier, or connect to your custom API endpoints.</p>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>• Real-time submission notifications</div>
                <div className={styles.featureItem}>• Custom payload formatting</div>
                <div className={styles.featureItem}>• Retry mechanisms and error handling</div>
                <div className={styles.featureItem}>• Integration with popular services</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Code */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('customCode')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('customCode') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Code size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Custom Code</h4>
            <p>Add custom CSS and JavaScript to your form</p>
          </div>
        </button>
        
        {expandedSections.has('customCode') && (
          <div className={styles.sectionContent}>
            <div className={styles.codeEditor}>
              <div className={styles.codeSection}>
                <label className={styles.codeLabel}>
                  Custom CSS
                </label>
                <textarea
                  value={advancedSettings.customCSS || ''}
                  onChange={(e) => updateAdvancedSetting('customCSS', e.target.value)}
                  placeholder="/* Add your custom CSS here */&#10;.form-container {&#10;  background: #f0f0f0;&#10;}"
                  className={styles.codeTextarea}
                  rows={6}
                />
                <p className={styles.codeHint}>
                  Custom styles will be applied to your form
                </p>
              </div>
              
              <div className={styles.codeSection}>
                <label className={styles.codeLabel}>
                  Custom JavaScript
                </label>
                <textarea
                  value={advancedSettings.customJS || ''}
                  onChange={(e) => updateAdvancedSetting('customJS', e.target.value)}
                  placeholder="// Add your custom JavaScript here&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  // Your code here&#10;});"
                  className={styles.codeTextarea}
                  rows={6}
                />
                <p className={styles.codeHint}>
                  Custom scripts will be executed on form load
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Export Settings */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('dataExport')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('dataExport') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Download size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Data Export Settings</h4>
            <p>Configure how form data is exported</p>
          </div>
        </button>
        
        {expandedSections.has('dataExport') && (
          <div className={styles.sectionContent}>
            <div className={styles.configGrid}>
              <div className={styles.configItem}>
                <label className={styles.configLabel}>
                  Export Format
                </label>
                <select
                  value={advancedSettings.dataExport?.format || 'json'}
                  onChange={(e) => updateNestedSetting('dataExport', 'format', e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="xml">XML</option>
                </select>
              </div>
            </div>
            
            <div className={styles.featureToggles}>
              <div className={styles.featureToggle}>
                <div className={styles.toggleHeader}>
                  <div className={styles.toggleInfo}>
                    <h5>Include metadata</h5>
                    <p>Export submission timestamps, IP addresses, and other metadata</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${advancedSettings.dataExport?.includeMetadata ? styles.active : ''}`}
                    onClick={() => updateNestedSetting('dataExport', 'includeMetadata', !advancedSettings.dataExport?.includeMetadata)}
                  >
                    {advancedSettings.dataExport?.includeMetadata ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
              
              <div className={styles.featureToggle}>
                <div className={styles.toggleHeader}>
                  <div className={styles.toggleInfo}>
                    <h5>Enable compression</h5>
                    <p>Compress exported files to reduce file size</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${advancedSettings.dataExport?.compression ? styles.active : ''}`}
                    onClick={() => updateNestedSetting('dataExport', 'compression', !advancedSettings.dataExport?.compression)}
                  >
                    {advancedSettings.dataExport?.compression ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Optimization */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('performance')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('performance') ? styles.expanded : ''}`}
          />
          <div className={styles.sectionIcon}>
            <Gauge size={18} />
          </div>
          <div className={styles.sectionInfo}>
            <h4>Performance Optimization</h4>
            <p>Optimize form loading and rendering performance</p>
          </div>
        </button>
        
        {expandedSections.has('performance') && (
          <div className={styles.sectionContent}>
            <div className={styles.configGrid}>
              <div className={styles.configItem}>
                <label className={styles.configLabel}>
                  Cache Timeout (seconds)
                </label>
                <div className={styles.sliderGroup}>
                  <input
                    type="range"
                    min="300"
                    max="7200"
                    step="300"
                    value={advancedSettings.performance?.cacheTimeout || 3600}
                    onChange={(e) => updateNestedSetting('performance', 'cacheTimeout', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.sliderValue}>{Math.floor((advancedSettings.performance?.cacheTimeout || 3600) / 60)}m</span>
                </div>
                <p className={styles.configHint}>
                  How long to cache form assets in the browser
                </p>
              </div>
            </div>
            
            <div className={styles.featureToggles}>
              <div className={styles.featureToggle}>
                <div className={styles.toggleHeader}>
                  <div className={styles.toggleInfo}>
                    <h5>Enable lazy loading</h5>
                    <p>Load form sections only when needed to improve initial load time</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${advancedSettings.performance?.lazyLoading ? styles.active : ''}`}
                    onClick={() => updateNestedSetting('performance', 'lazyLoading', !advancedSettings.performance?.lazyLoading)}
                  >
                    {advancedSettings.performance?.lazyLoading ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              </div>
              
              <div className={styles.featureToggle}>
                <div className={styles.toggleHeader}>
                  <div className={styles.toggleInfo}>
                    <h5>Optimize images</h5>
                    <p>Automatically compress and resize uploaded images</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${advancedSettings.performance?.optimizedImages ? styles.active : ''}`}
                    onClick={() => updateNestedSetting('performance', 'optimizedImages', !advancedSettings.performance?.optimizedImages)}
                  >
                    {advancedSettings.performance?.optimizedImages ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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