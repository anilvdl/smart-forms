// Properties Panel Component
import React, { useState, useEffect } from 'react';
import { useFormBuilder } from '../../services/form-designer/formBuilderContext';
import { getComponentByType } from '../../services/form-designer/componentRegistry';
import { getIcon } from '../../services/form-designer/iconMapping';
import { X, ChevronRight, Trash2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import styles from '../../styles/form-designer/components/properties-panel.module.css';

type TabType = 'general' | 'validation' | 'style' | 'advanced';

export const PropertiesPanel: React.FC = () => {
  const {
    form,
    selectedElement,
    updateElement,
    deleteElement,
    togglePropertiesPanel
  } = useFormBuilder();
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  
  const element = form?.elements.find(el => el.id === selectedElement);
  const component = element ? getComponentByType(element.type) : null;
  const Icon = element ? getIcon(element.type) : null;
  
  // Reset to general tab when element changes
  useEffect(() => {
    setActiveTab('general');
  }, [selectedElement]);
  
  if (!element || !component) {
    return (
      <div className={styles.propertiesPanel}>
        <div className={styles.emptyState}>
          <p>Select an element to view its properties</p>
        </div>
      </div>
    );
  }
  
  const handlePropertyChange = (property: string, value: any) => {
    updateElement(element.id, {
      props: { ...element.props, [property]: value }
    });
  };
  
  const handleDelete = () => {
    deleteElement(element.id);
    setShowDeleteConfirm(false);
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
  
  const renderGeneralTab = () => (
    <div className={styles.tabContent}>
      {/* Basic Properties */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('basic')}
        >
          <ChevronRight 
            size={16} 
            className={`${styles.chevron} ${expandedSections.has('basic') ? styles.expanded : ''}`}
          />
          <span>Basic Properties</span>
        </button>
        
        {expandedSections.has('basic') && (
          <div className={styles.sectionContent}>
            {/* Label */}
            {element.props.label !== undefined && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Label</label>
                <input
                  type="text"
                  value={element.props.label || ''}
                  onChange={(e) => handlePropertyChange('label', e.target.value)}
                  className={styles.fieldInput}
                />
              </div>
            )}
            
            {/* Name */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Field Name</label>
              <input
                type="text"
                value={element.props.name || element.id}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                className={styles.fieldInput}
                placeholder="field_name"
              />
            </div>
            
            {/* Placeholder */}
            {['text', 'email', 'password', 'number', 'phone', 'url', 'search', 'textarea'].includes(element.type) && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Placeholder</label>
                <input
                  type="text"
                  value={element.props.placeholder || ''}
                  onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                  className={styles.fieldInput}
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}
            
            {/* Default Value */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Default Value</label>
              <input
                type="text"
                value={element.props.defaultValue || ''}
                onChange={(e) => handlePropertyChange('defaultValue', e.target.value)}
                className={styles.fieldInput}
              />
            </div>
            
            {/* Help Text */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Help Text</label>
              <textarea
                value={element.props.helpText || ''}
                onChange={(e) => handlePropertyChange('helpText', e.target.value)}
                className={styles.fieldTextarea}
                rows={2}
                placeholder="Additional instructions..."
              />
            </div>
            
            {/* Required */}
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={element.props.required || false}
                  onChange={(e) => handlePropertyChange('required', e.target.checked)}
                />
                <span>Required field</span>
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Type-specific Properties */}
      {renderTypeSpecificProperties()}
    </div>
  );
  
  const renderTypeSpecificProperties = () => {
    switch (element.type) {
      case 'textarea':
        return (
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('textarea')}
            >
              <ChevronRight 
                size={16} 
                className={`${styles.chevron} ${expandedSections.has('textarea') ? styles.expanded : ''}`}
              />
              <span>Textarea Settings</span>
            </button>
            
            {expandedSections.has('textarea') && (
              <div className={styles.sectionContent}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Rows</label>
                  <input
                    type="number"
                    value={element.props.rows || 4}
                    onChange={(e) => handlePropertyChange('rows', parseInt(e.target.value))}
                    className={styles.fieldInput}
                    min="2"
                    max="20"
                  />
                </div>
              </div>
            )}
          </div>
        );
        
      case 'checkbox':
      case 'radio':
      case 'dropdown':
      case 'multiselect':
        return (
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('options')}
            >
              <ChevronRight 
                size={16} 
                className={`${styles.chevron} ${expandedSections.has('options') ? styles.expanded : ''}`}
              />
              <span>Options</span>
            </button>
            
            {expandedSections.has('options') && (
              <div className={styles.sectionContent}>
                <OptionsEditor
                  options={element.props.options || []}
                  onChange={(options) => handlePropertyChange('options', options)}
                />
              </div>
            )}
          </div>
        );
        
      case 'number':
      case 'range':
        return (
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('number')}
            >
              <ChevronRight 
                size={16} 
                className={`${styles.chevron} ${expandedSections.has('number') ? styles.expanded : ''}`}
              />
              <span>Number Settings</span>
            </button>
            
            {expandedSections.has('number') && (
              <div className={styles.sectionContent}>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Min</label>
                    <input
                      type="number"
                      value={element.props.min || ''}
                      onChange={(e) => handlePropertyChange('min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className={styles.fieldInput}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Max</label>
                    <input
                      type="number"
                      value={element.props.max || ''}
                      onChange={(e) => handlePropertyChange('max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className={styles.fieldInput}
                    />
                  </div>
                </div>
                {element.type === 'range' && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Step</label>
                    <input
                      type="number"
                      value={element.props.step || 1}
                      onChange={(e) => handlePropertyChange('step', parseInt(e.target.value))}
                      className={styles.fieldInput}
                      min="1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const renderValidationTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>Validation Rules</div>
        <div className={styles.sectionContent}>
          <p className={styles.comingSoon}>Advanced validation rules coming soon!</p>
        </div>
      </div>
    </div>
  );
  
  const renderStyleTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>Appearance</div>
        <div className={styles.sectionContent}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Width</label>
            <select
              value={element.props.width || '100%'}
              onChange={(e) => handlePropertyChange('width', e.target.value)}
              className={styles.fieldSelect}
            >
              <option value="25%">25%</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
            </select>
          </div>
          
          <div className={styles.field}>
            <label className={styles.fieldLabel}>CSS Class</label>
            <input
              type="text"
              value={element.props.className || ''}
              onChange={(e) => handlePropertyChange('className', e.target.value)}
              className={styles.fieldInput}
              placeholder="custom-class"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAdvancedTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>Advanced Settings</div>
        <div className={styles.sectionContent}>
          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={element.props.disabled || false}
                onChange={(e) => handlePropertyChange('disabled', e.target.checked)}
              />
              <span>Disabled</span>
            </label>
          </div>
          
          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={element.props.readOnly || false}
                onChange={(e) => handlePropertyChange('readOnly', e.target.checked)}
              />
              <span>Read Only</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className={styles.propertiesPanel}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.elementInfo}>
            {Icon && <Icon size={10} className={styles.elementIcon} />}
            <div>
              <h3 className={styles.panelTitle}>Properties</h3>
              <p className={styles.elementType}>{component.label}</p>
            </div>
          </div>
          <button 
            className={styles.closeButton}
            onClick={togglePropertiesPanel}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'validation' ? styles.active : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            Validation
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'style' ? styles.active : ''}`}
            onClick={() => setActiveTab('style')}
          >
            Style
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'advanced' ? styles.active : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>
        
        {/* Tab Content */}
        <div className={styles.tabContainer}>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'validation' && renderValidationTab()}
          {activeTab === 'style' && renderStyleTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
        </div>
        
        {/* Delete Button */}
        <div className={styles.panelFooter}>
          <button
            className={styles.deleteButton}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            <span>Delete Field</span>
          </button>
        </div>
      </div>
      
      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Element"
          message="Are you sure you want to delete this element? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          type="danger"
        />
      )}
    </>
  );
};

// Options Editor Component
const OptionsEditor: React.FC<{
  options: string[];
  onChange: (options: string[]) => void;
}> = ({ options, onChange }) => {
  const addOption = () => {
    onChange([...options, `Option ${options.length + 1}`]);
  };
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };
  
  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };
  
  return (
    <div className={styles.optionsEditor}>
      {options.map((option, index) => (
        <div key={index} className={styles.optionItem}>
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className={styles.optionInput}
          />
          <button
            className={styles.removeOptionButton}
            onClick={() => removeOption(index)}
            disabled={options.length <= 1}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button className={styles.addOptionButton} onClick={addOption}>
        + Add Option
      </button>
    </div>
  );
};