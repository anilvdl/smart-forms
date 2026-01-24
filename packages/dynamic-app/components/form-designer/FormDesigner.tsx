import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FormBuilderProvider, useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { DesignerHeader } from './DesignerHeader';
import { ComponentPanel } from './ComponentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { FormSettingsPanel } from './panels/settings/FormSettingsPanel';
import { MobileBottomNav } from './MobileBottomNav';
import { BottomSheet } from './BottomSheet';
import { ErrorBoundary } from './ErrorBoundary';
import { OnboardingTour } from './OnboardingTour';
import { ConfirmationModal } from './ConfirmationModal';
import styles from '@smartforms/dynamic-app/styles/form-designer/layout.module.css';
import Canvas from 'components/canvas/Canvas';

interface FormDesignerProps {
  formId: string;
}

const FormDesignerContent: React.FC = () => {
  const {
    form,
    user,
    isComponentPanelOpen,
    isPropertiesPanelOpen,
    activeView,
    selectedElement,
    toggleComponentPanel,
    togglePropertiesPanel
  } = useFormBuilder();
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<'components' | 'properties' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check if first time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('smartforms_designer_tour_completed');
    if (!hasSeenTour && user) {
      setShowOnboarding(true);
    }
  }, [user]);
  
  // Auto-open properties panel on element selection (desktop)
  useEffect(() => {
    if (selectedElement && !isMobile && !isSettingsOpen) {
      if (!isPropertiesPanelOpen) {
        togglePropertiesPanel();
      }
    }
  }, [selectedElement, isMobile, isPropertiesPanelOpen, togglePropertiesPanel, isSettingsOpen]);
  
  // Close other panels when settings opens
  useEffect(() => {
    if (isSettingsOpen) {
      if (isComponentPanelOpen) toggleComponentPanel();
      if (isPropertiesPanelOpen) togglePropertiesPanel();
      if (activeBottomSheet) setActiveBottomSheet(null);
    }
  }, [isSettingsOpen, isComponentPanelOpen, isPropertiesPanelOpen, activeBottomSheet, toggleComponentPanel, togglePropertiesPanel]);
  
  const handleMobileNavClick = (panel: 'components' | 'properties') => {
    if (activeBottomSheet === panel) {
      setActiveBottomSheet(null);
    } else {
      setActiveBottomSheet(panel);
    }
  };
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('smartforms_designer_tour_completed', 'true');
    setShowOnboarding(false);
  };
  
  // Settings handlers
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };
  
  if (!form || !user) {
    return (
      <div className={styles.designerContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading form designer...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.designerContainer}>
      {/* Header */}
      <DesignerHeader 
        onOpenSettings={handleOpenSettings}
        onCloseSettings={handleCloseSettings}
        isSettingsOpen={isSettingsOpen}
      />
      
      {/* Settings Panel */}
      <FormSettingsPanel 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
      
      <div className={`${styles.designerContent} ${isSettingsOpen ? styles.blurred : ''}`}>
        {/* Desktop Component Panel */}
        {!isMobile && !isSettingsOpen && (
          <div className={`${styles.componentPanel} ${!isComponentPanelOpen ? styles.collapsed : ''}`}>
            <ComponentPanel />
          </div>
        )}
        
        {/* Canvas */}
        <div className={styles.canvasContainer}>
          {activeView === 'design' && <Canvas />}
          {activeView === 'code' && (
            <div className={styles.codeView}>
              <pre className={styles.codeContent}>
                {JSON.stringify(form.elements, null, 2)}
              </pre>
            </div>
          )}
          {activeView === 'preview' && (
            <div className={styles.previewView}>
              <div className={styles.previewContent}>
                <h3>Preview Mode</h3>
                <p>Form preview functionality coming soon!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop Properties Panel */}
        {!isMobile && selectedElement && !isSettingsOpen && (
          <div className={`${styles.propertiesPanel} ${!isPropertiesPanelOpen ? styles.collapsed : ''}`}>
            <PropertiesPanel />
          </div>
        )}
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && !isSettingsOpen && (
        <MobileBottomNav
          activePanel={activeBottomSheet}
          onPanelClick={handleMobileNavClick}
        />
      )}
      
      {/* Mobile Bottom Sheets */}
      {isMobile && activeBottomSheet === 'components' && (
        <BottomSheet
          title="Components"
          onClose={() => setActiveBottomSheet(null)}
          isOpen={true}
        >
          <ComponentPanel />
        </BottomSheet>
      )}
      
      {isMobile && activeBottomSheet === 'properties' && selectedElement && (
        <BottomSheet
          title="Properties"
          onClose={() => setActiveBottomSheet(null)}
          isOpen={true}
        >
          <PropertiesPanel />
        </BottomSheet>
      )}
      
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export const FormDesigner: React.FC<FormDesignerProps> = ({ formId }) => {
  return (
    <ErrorBoundary>
      <FormBuilderProvider formId={formId}>
        <FormDesignerContent />
      </FormBuilderProvider>
    </ErrorBoundary>
  );
};