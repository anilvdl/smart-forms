// Mobile Bottom Navigation Component
import React from 'react';
import { useFormBuilder } from '../../services/form-designer/formBuilderContext';
import { Plus, Settings } from 'lucide-react';
import styles from '../../styles/form-designer/components/mobile-bottom-nav.module.css';

interface MobileBottomNavProps {
  activePanel: 'components' | 'properties' | null;
  onPanelClick: (panel: 'components' | 'properties') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePanel,
  onPanelClick
}) => {
  const { selectedElement, form } = useFormBuilder();
  
  const hasSelection = !!selectedElement;
  const elementCount = form?.elements.length || 0;
  
  return (
    <div className={styles.mobileBottomNav}>
      <div className={styles.navButtons}>
        <button
          className={`${styles.navButton} ${activePanel === 'components' ? styles.active : ''}`}
          onClick={() => onPanelClick('components')}
        >
          <Plus size={20} />
          <span>Add</span>
          {elementCount > 0 && (
            <span className={styles.badge}>{elementCount}</span>
          )}
        </button>
        
        <button
          className={`${styles.navButton} ${activePanel === 'properties' ? styles.active : ''} ${!hasSelection ? styles.disabled : ''}`}
          onClick={() => hasSelection && onPanelClick('properties')}
          disabled={!hasSelection}
        >
          <Settings size={20} />
          <span>Properties</span>
          {hasSelection && (
            <span className={styles.indicator} />
          )}
        </button>
      </div>
    </div>
  );
};