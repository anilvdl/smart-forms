// Live Layout Preview Component
import React from 'react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/layout-preview.module.css';

interface LayoutPreviewProps {
  settings: {
    labelPosition: 'top' | 'side';
    labelAlignment: 'left' | 'right';
    labelWidth: number;
    fieldSpacing: number;
    fontSize: number;
    fontWeight: number;
  };
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({ settings }) => {
  const {
    labelPosition,
    labelAlignment,
    labelWidth,
    fieldSpacing,
    fontSize,
    fontWeight
  } = settings;
  
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
    <div className={styles.previewContainer}>
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
                Preferences
              </label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" disabled />
                  <span style={{ fontSize: `${fontSize - 1}px` }}>Newsletter updates</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" disabled />
                  <span style={{ fontSize: `${fontSize - 1}px` }}>Product announcements</span>
                </label>
              </div>
            </>
          ) : (
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" disabled />
                <span style={{ fontSize: `${fontSize - 1}px` }}>I agree to the terms and conditions</span>
              </label>
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
      </div>
      
      <div className={styles.previewInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Layout:</span>
          <span className={styles.infoValue}>
            {labelPosition === 'top' ? 'Labels on Top' : `Labels on Side (${labelAlignment}-aligned)`}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Spacing:</span>
          <span className={styles.infoValue}>{fieldSpacing}px between fields</span>
        </div>
        {labelPosition === 'side' && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Label Width:</span>
            <span className={styles.infoValue}>{labelWidth}% / Input {100 - labelWidth}%</span>
          </div>
        )}
      </div>
    </div>
  );
};