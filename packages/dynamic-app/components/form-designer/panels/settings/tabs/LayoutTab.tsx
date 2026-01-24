import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { 
  ChevronRight,
  Layout,
  AlignLeft,
  AlignRight,
  Type,
  MoveVertical,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Monitor,
  Tablet,
  Smartphone,
  Info
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/layout-tab.module.css';

interface LayoutPreviewProps {
  settings: any;
  scale: number;
  device: 'desktop' | 'tablet' | 'mobile';
}

// Smart Scaling Preview Component
const SmartLayoutPreview: React.FC<LayoutPreviewProps> = ({ settings, scale, device }) => {
  const {
    labelPosition,
    labelAlignment,
    labelWidth,
    fieldSpacing,
    fontSize,
    fontWeight
  } = settings;
  
  const containerStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: device === 'mobile' ? '320px' : device === 'tablet' ? '460px' : '100%'
  };
  
  const fieldStyle = {
    marginBottom: `${fieldSpacing}px`
  };
  
  const labelStyle = {
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight,
    ...(labelPosition === 'side' && {
      width: `${labelWidth}%`,
      textAlign: labelAlignment as 'left' | 'right'
    })
  };
  
  const inputStyle = {
    fontSize: `${fontSize - 1}px`
  };
  
  const getFieldClass = () => {
    if (labelPosition === 'top') {
      return styles.fieldTop;
    }
    return styles.fieldSide;
  };
  
  return (
    <div className={styles.previewFormContainer} style={containerStyle}>
      <div className={styles.previewForm}>
        {/* Text Input Example */}
        <div className={getFieldClass()} style={fieldStyle}>
          <label className={styles.label} style={labelStyle}>
            Full Name {labelPosition === 'side' && ':'}
          </label>
          <input 
            type="text" 
            className={styles.input}
            style={inputStyle}
            placeholder="Enter your full name"
            readOnly
          />
        </div>
        
        {/* Email Input Example */}
        <div className={getFieldClass()} style={fieldStyle}>
          <label className={styles.label} style={labelStyle}>
            Email Address {labelPosition === 'side' && ':'}
          </label>
          <input 
            type="email" 
            className={styles.input}
            style={inputStyle}
            placeholder="your@email.com"
            readOnly
          />
        </div>
        
        {/* Dropdown Example */}
        <div className={getFieldClass()} style={fieldStyle}>
          <label className={styles.label} style={labelStyle}>
            Country {labelPosition === 'side' && ':'}
          </label>
          <select 
            className={styles.select}
            style={inputStyle}
            disabled
          >
            <option>Select your country</option>
          </select>
        </div>
        
        {/* Checkbox Example */}
        <div className={getFieldClass()} style={fieldStyle}>
          {labelPosition === 'top' ? (
            <>
              <label className={styles.label} style={labelStyle}>
                Newsletter Subscription
              </label>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" className={styles.checkbox} readOnly />
                <span style={{ fontSize: `${fontSize - 1}px` }}>Send me updates and news</span>
              </div>
            </>
          ) : (
            <div className={`${styles.fieldSide} ${styles.checkboxField}`}>
              <label className={styles.label} style={labelStyle}>
                Newsletter:&nbsp;
              </label>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" className={styles.checkbox} readOnly />
                <span style={{ fontSize: `${fontSize - 1}px` }}>Send me updates</span>
              </div>
            </div>
          )}
        </div>

        {/* Section Title Example */}
        <div className={styles.sectionTitle} style={{ marginTop: `${fieldSpacing * 1.5}px`, marginBottom: `${fieldSpacing}px` }}>
          <h3 style={{ fontSize: `${fontSize + 2}px`, fontWeight: fontWeight + 100 }}>
            Contact Information
          </h3>
        </div>
        
        {/* Phone Number Example */}
        <div className={getFieldClass()} style={fieldStyle}>
          <label className={styles.label} style={labelStyle}>
            Phone Number {labelPosition === 'side' && ':'}
          </label>
          <input 
            type="tel" 
            className={styles.input}
            style={inputStyle}
            placeholder="+1 (555) 123-4567"
            readOnly
          />
        </div>
        
        {/* Button Example */}
        <div style={{ marginTop: `${fieldSpacing * 1.5}px`, alignContent: 'center' }}>
          <button 
            className={styles.submitButton}
            style={{ fontSize: `${fontSize}px` }}
            disabled
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};

export const LayoutTab: React.FC = () => {
  const { form, updateFormSettings } = useFormBuilder();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['labelPosition', 'spacing'])
  );
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'fit' | 'actual'>('fit');
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const settings = form?.settings || {};
  const layoutSettings = {
    labelPosition: settings.labelPosition || 'top',
    labelAlignment: settings.labelAlignment || 'left',
    labelWidth: settings.labelWidth || 30,
    fieldSpacing: settings.fieldSpacing || 16,
    fontSize: settings.fontSize || 14,
    fontWeight: settings.fontWeight || 500,
    ...settings
  };

  // Calculate optimal scale for preview
  useEffect(() => {
    if (viewMode === 'fit' && previewContainerRef.current && previewContentRef.current) {
      const container = previewContainerRef.current;
      const content = previewContentRef.current;
      
      const containerWidth = container.clientWidth - 32; // Account for padding
      const containerHeight = container.clientHeight - 32;
      
      let contentWidth = device === 'mobile' ? 320 : device === 'tablet' ? 460 : 500;
      let contentHeight = 400; // Approximate content height
      
      // Add extra space for larger fonts and spacing
      if (layoutSettings.fontSize > 16) {
        contentHeight += (layoutSettings.fontSize - 16) * 10;
      }
      if (layoutSettings.fieldSpacing > 20) {
        contentHeight += (layoutSettings.fieldSpacing - 20) * 5;
      }
      
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const optimalScale = Math.min(scaleX, scaleY, 1); // Never scale up beyond 1
      
      setPreviewScale(Math.max(optimalScale, 0.3)); // Minimum 30% scale
    } else if (viewMode === 'actual') {
      setPreviewScale(1);
    }
  }, [viewMode, device, layoutSettings, form]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateLayoutSetting = (key: string, value: any) => {
    updateFormSettings({ [key]: value });
  };

  const resetToDefaults = () => {
    updateFormSettings({
      labelPosition: 'top',
      labelAlignment: 'left',
      labelWidth: 30,
      fieldSpacing: 16,
      fontSize: 14,
      fontWeight: 500
    });
  };

  const scalePercentage = Math.round(previewScale * 100);

  return (
    <div className={styles.layoutTab}>
      {/* Header */}
      <div className={styles.tabHeader}>
        <div className={styles.headerInfo}>
          <h3>Layout Configuration</h3>
          <p>Control how form fields are positioned and styled</p>
        </div>
        
        <div className={styles.headerActions}>
          {/* Reset Button */}
          <button className={styles.resetButton} onClick={resetToDefaults}>
            <RotateCcw size={14} />
            Reset Layout
          </button>
        </div>
      </div>

      {/* Split Layout Content */}
      <div className={styles.layoutContent}>
        {/* Settings Panel - Left Side */}
        <div className={styles.settingsPanel}>
          {/* Label Position Card */}
          <div className={styles.settingsCard}>
            <div 
              className={styles.cardHeader}
              onClick={() => toggleSection('labelPosition')}
            >
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIcon}>
                  <Layout size={16} />
                </div>
                <div>
                  <h4 className={styles.cardTitle}>Label Position</h4>
                  <p className={styles.cardSubtitle}>Choose how labels appear relative to form fields</p>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className={`${styles.expandIcon} ${expandedSections.has('labelPosition') ? styles.expanded : ''}`}
              />
            </div>
            
            {expandedSections.has('labelPosition') && (
              <div className={styles.cardContent}>
                <div className={styles.radioGroup}>
                  <div 
                    className={`${styles.radioOption} ${layoutSettings.labelPosition === 'top' ? styles.active : ''}`}
                    onClick={() => updateLayoutSetting('labelPosition', 'top')}
                  >
                    <div className={styles.radioIndicator}>
                      <div className={styles.radioDot}></div>
                    </div>
                    <div className={styles.optionContent}>
                      <div className={styles.optionTitle}>Top Position</div>
                      <div className={styles.optionDescription}>Labels appear above form fields (recommended)</div>
                      <div className={styles.miniPreview}>
                        <div className={styles.previewTop}>
                          <div className={styles.previewLabel}>Label</div>
                          <div className={styles.previewField}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`${styles.radioOption} ${layoutSettings.labelPosition === 'side' ? styles.active : ''}`}
                    onClick={() => updateLayoutSetting('labelPosition', 'side')}
                  >
                    <div className={styles.radioIndicator}>
                      <div className={styles.radioDot}></div>
                    </div>
                    <div className={styles.optionContent}>
                      <div className={styles.optionTitle}>Side Position</div>
                      <div className={styles.optionDescription}>Labels appear beside form fields (compact)</div>
                      <div className={styles.miniPreview}>
                        <div className={styles.previewSide}>
                          <div className={styles.previewLabel}>Label:</div>
                          <div className={styles.previewField}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Label Alignment - Only for side position */}
                {layoutSettings.labelPosition === 'side' && (
                  <div className={styles.subSection}>
                    <div className={styles.subSectionTitle}>Label Alignment</div>
                    <div className={styles.alignmentGroup}>
                      <button
                        className={`${styles.alignmentButton} ${layoutSettings.labelAlignment === 'left' ? styles.active : ''}`}
                        onClick={() => updateLayoutSetting('labelAlignment', 'left')}
                      >
                        <AlignLeft size={14} />
                        Left
                      </button>
                      <button
                        className={`${styles.alignmentButton} ${layoutSettings.labelAlignment === 'right' ? styles.active : ''}`}
                        onClick={() => updateLayoutSetting('labelAlignment', 'right')}
                      >
                        <AlignRight size={14} />
                        Right
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spacing & Typography Card */}
          <div className={styles.settingsCard}>
            <div 
              className={styles.cardHeader}
              onClick={() => toggleSection('spacing')}
            >
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIcon}>
                  <MoveVertical size={16} />
                </div>
                <div>
                  <h4 className={styles.cardTitle}>Spacing & Typography</h4>
                  <p className={styles.cardSubtitle}>Control field spacing, font size, and styling</p>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className={`${styles.expandIcon} ${expandedSections.has('spacing') ? styles.expanded : ''}`}
              />
            </div>
            
            {expandedSections.has('spacing') && (
              <div className={styles.cardContent}>
                <div className={styles.controlsGrid}>
                  {/* Field Spacing */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Field Spacing</label>
                    <div className={styles.sliderGroup}>
                      <input
                        type="range"
                        min="8"
                        max="40"
                        value={layoutSettings.fieldSpacing}
                        onChange={(e) => updateLayoutSetting('fieldSpacing', parseInt(e.target.value))}
                        className={styles.slider}
                      />
                      <span className={styles.sliderValue}>{layoutSettings.fieldSpacing}px</span>
                    </div>
                  </div>
                  
                  {/* Font Size */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Font Size</label>
                    <div className={styles.sliderGroup}>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={layoutSettings.fontSize}
                        onChange={(e) => updateLayoutSetting('fontSize', parseInt(e.target.value))}
                        className={styles.slider}
                      />
                      <span className={styles.sliderValue}>{layoutSettings.fontSize}px</span>
                    </div>
                  </div>
                  
                  {/* Font Weight */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Label Weight</label>
                    <select
                      value={layoutSettings.fontWeight}
                      onChange={(e) => updateLayoutSetting('fontWeight', parseInt(e.target.value))}
                      className={styles.select}
                    >
                      <option value={400}>Normal</option>
                      <option value={500}>Medium</option>
                      <option value={600}>Semi-bold</option>
                      <option value={700}>Bold</option>
                    </select>
                  </div>
                  
                  {/* Label Width - Only for side position */}
                  {layoutSettings.labelPosition === 'side' && (
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>Label Width</label>
                      <div className={styles.sliderGroup}>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          value={layoutSettings.labelWidth}
                          onChange={(e) => updateLayoutSetting('labelWidth', parseInt(e.target.value))}
                          className={styles.slider}
                        />
                        <span className={styles.sliderValue}>{layoutSettings.labelWidth}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Advanced Layout Card */}
            <div className={styles.settingsCard}>
            <div 
                className={styles.cardHeader}
                onClick={() => toggleSection('advanced')}
            >
                <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIcon}>
                    <Type size={16} />
                </div>
                <div>
                    <h4 className={styles.cardTitle}>Advanced Layout</h4>
                    <p className={styles.cardSubtitle}>Grid, spacing, and responsive behavior</p>
                </div>
                </div>
                <ChevronRight 
                size={16} 
                className={`${styles.expandIcon} ${expandedSections.has('advanced') ? styles.expanded : ''}`}
                />
            </div>
            
            {expandedSections.has('advanced') && (
                <div className={styles.cardContent}>
                <div className={styles.controlsGrid}>
                    {/* Grid Size */}
                    <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Grid Size</label>
                    <div className={styles.sliderGroup}>
                        <input
                        type="range"
                        min="16"
                        max="32"
                        step="4"
                        value={settings.gridSize || 20}
                        onChange={(e) => updateLayoutSetting('gridSize', parseInt(e.target.value))}
                        className={styles.slider}
                        />
                        <span className={styles.sliderValue}>{settings.gridSize || 20}px</span>
                    </div>
                    </div>

                    {/* Show Grid Toggle */}
                    <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Show Grid</label>
                    <label className={styles.toggleSwitch}>
                        <input
                        type="checkbox"
                        checked={settings.showGrid || false}
                        onChange={(e) => updateLayoutSetting('showGrid', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                    </label>
                    </div>
                </div>
                </div>
            )}
            </div>

            {/* Theme & Styling Card */}
            <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIcon}>
                    <Type size={16} />
                </div>
                <div>
                    <h4 className={styles.cardTitle}>Theme & Styling</h4>
                    <p className={styles.cardSubtitle}>Customize colors and appearance</p>
                </div>
                </div>
                <div className={styles.comingSoon}>Coming Soon</div>
            </div>
            </div>
          </div>
        </div>

        {/* Integrated Preview Panel - Right Side */}
        <div className={styles.previewPanel}>
          {/* Preview Header */}
          <div className={styles.previewHeader}>
            <div className={styles.previewTitle}>
              <Layout size={16} />
              <span>Live Preview</span>
              <div className={styles.liveBadge}>
                <div className={styles.liveDot}></div>
                LIVE
              </div>
            </div>
            
            <div className={styles.previewControls}>
              {/* Device Toggle */}
              <div className={styles.deviceToggle}>
                <button
                  className={`${styles.deviceButton} ${device === 'desktop' ? styles.active : ''}`}
                  onClick={() => setDevice('desktop')}
                  title="Desktop view"
                >
                  <Monitor size={12} />
                </button>
                <button
                  className={`${styles.deviceButton} ${device === 'tablet' ? styles.active : ''}`}
                  onClick={() => setDevice('tablet')}
                  title="Tablet view"
                >
                  <Tablet size={12} />
                </button>
                <button
                  className={`${styles.deviceButton} ${device === 'mobile' ? styles.active : ''}`}
                  onClick={() => setDevice('mobile')}
                  title="Mobile view"
                >
                  <Smartphone size={12} />
                </button>
              </div>
              
              {/* Scale Toggle */}
              <div className={styles.scaleToggle}>
                <button
                  className={`${styles.scaleButton} ${viewMode === 'fit' ? styles.active : ''}`}
                  onClick={() => setViewMode('fit')}
                  title="Fit to container"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  className={`${styles.scaleButton} ${viewMode === 'actual' ? styles.active : ''}`}
                  onClick={() => setViewMode('actual')}
                  title="Actual size"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Scale Indicator */}
          {viewMode === 'fit' && scalePercentage < 100 && (
            <div className={styles.scaleIndicator}>
              <Info size={12} />
              <span>Preview scaled to {scalePercentage}%</span>
            </div>
          )}
          
          {/* Preview Content */}
          <div 
            ref={previewContainerRef}
            className={`${styles.previewContent} ${styles[device]}`}
          >
            <div ref={previewContentRef}>
              <SmartLayoutPreview 
                settings={layoutSettings}
                scale={previewScale}
                device={device}
              />
            </div>
          </div>
          
          {/* Preview Footer */}
          <div className={styles.previewFooter}>
            <div className={styles.previewInfo}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Position:</span>
                <span className={styles.previewValue}>{layoutSettings.labelPosition}</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Spacing:</span>
                <span className={styles.previewValue}>{layoutSettings.fieldSpacing}px</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Font:</span>
                <span className={styles.previewValue}>{layoutSettings.fontSize}px</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Scale:</span>
                <span className={styles.previewValue}>{scalePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};