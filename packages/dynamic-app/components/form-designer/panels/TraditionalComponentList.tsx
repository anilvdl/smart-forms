import React from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { ComponentDefinition, ComponentCategory } from '@smartforms/dynamic-app/services/form-designer/componentRegistry';
import { getIcon, categoryIcons } from '@smartforms/dynamic-app/services/form-designer/iconMapping';
import { ChevronDown, ChevronRight, Lock, Plus } from 'lucide-react';
import { UpgradeModal } from '../UpgradeModal';
import { Tooltip } from '../Tooltip';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/traditional-list.module.css';

interface TraditionalComponentListProps {
  componentsByCategory: Record<ComponentCategory, ComponentDefinition[]>;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  searchQuery: string;
}

const categoryLabels: Record<ComponentCategory, string> = {
  basic: 'Basic Elements',
  selection: 'Selection Elements',
  datetime: 'Date & Time',
  file_media: 'File & Media',
  layout: 'Layout',
  advanced: 'Advanced',
  composite: 'Composite',
  payment: 'Payment'
};

export const TraditionalComponentList: React.FC<TraditionalComponentListProps> = ({
  componentsByCategory,
  expandedCategories,
  onToggleCategory,
  searchQuery
}) => {
  const { 
    addElement, 
    setDraggedComponent, 
    canAccessComponent,
    trackComponentUsage 
  } = useFormBuilder();
  
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState<ComponentDefinition | null>(null);
  const [draggedComponentId, setDraggedComponentId] = React.useState<string | null>(null);
  
  const handleComponentClick = (component: ComponentDefinition) => {
    if (canAccessComponent(component)) {
      addElement(component.type);
    } else {
      setSelectedComponent(component);
      setShowUpgradeModal(true);
      trackComponentUsage(component.type, 'attempted');
    }
  };
  
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    if (canAccessComponent(component)) {
      setDraggedComponent(component);
      setDraggedComponentId(component.id);
      e.dataTransfer.effectAllowed = 'copy';
    } else {
      e.preventDefault();
    }
  };
  
  const handleDragEnd = () => {
    setDraggedComponent(null);
    setDraggedComponentId(null);
  };
  
  const renderComponent = (component: ComponentDefinition) => {
    const Icon = getIcon(component.type);
    const hasAccess = canAccessComponent(component);
    const isDragging = draggedComponentId === component.id;
    
    const componentItem = (
      <div
        key={component.id}
        className={`${styles.componentItem} ${!hasAccess ? styles.locked : ''} ${isDragging ? styles.dragging : ''}`}
        onClick={() => handleComponentClick(component)}
        draggable={hasAccess}
        onDragStart={(e) => handleDragStart(e, component)}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.componentIcon}>
          <Icon size={16} />
        </div>
        <div className={styles.componentInfo}>
          <span className={styles.componentLabel}>{component.label}</span>
          {/* Remove description from here since it's now in tooltip */}
        </div>
        
        {!hasAccess && (
          <div className={styles.lockBadge}>
            <Lock size={12} />
            <span>{component.minPlan}</span>
          </div>
        )}
        
        {!isDragging && (
          <button 
            className={styles.addButton}
            onClick={(e) => {
              e.stopPropagation();
              if (hasAccess) {
                addElement(component.type);
              }
            }}
            disabled={!hasAccess}
            aria-label="Add component"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    );
    
    // Wrap with tooltip if component has description
    if (component.description) {
      return (
        <Tooltip key={component.id} content={component.description}>
          {componentItem}
        </Tooltip>
      );
    }
    
    return componentItem;
  };
  
  const categories = Object.keys(categoryLabels) as ComponentCategory[];
  console.log('categories: ', categories);
  // Show all components in a flat list when searching
  if (searchQuery) {
    const allComponents = categories.flatMap(cat => componentsByCategory[cat]);
    
    if (allComponents.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <p className={styles.emptyStateText}>No components found</p>
          <p className={styles.emptyStateSubtext}>Try a different search term</p>
        </div>
      );
    }
    
    return (
      <div className={styles.searchResults}>
        <div className={styles.searchHeader}>
          <span className={styles.searchCount}>
            {allComponents.length} component{allComponents.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className={styles.componentGrid}>
          {allComponents.map(renderComponent)}
        </div>
      </div>
    );
  }
  
  // Show categorized view
  return (
    <>
      <div className={styles.categoryList}>
        {categories.map(category => {
          const components = componentsByCategory[category];
          if (components.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          const CategoryIcon = categoryIcons[category];
          
          return (
            <div key={category} className={styles.category}>
              <button
                className={styles.categoryHeader}
                onClick={() => onToggleCategory(category)}
                aria-expanded={isExpanded}
              >
                <div className={styles.categoryLeft}>
                  {/* Fixed: No rotation for chevron icon */}
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div className={styles.categoryIconWrapper}>
                    <CategoryIcon size={16} />
                  </div>
                  <span className={styles.categoryTitle}>{categoryLabels[category]}</span>
                </div>
                <span className={styles.componentCount}>({components.length})</span>
              </button>
              
              {isExpanded && (
                <div className={styles.categoryContent}>
                  <div className={styles.componentGrid}>
                    {components.map(renderComponent)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showUpgradeModal && selectedComponent && (
        <UpgradeModal
          component={selectedComponent}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedComponent(null);
          }}
        />
      )}
    </>
  );
};