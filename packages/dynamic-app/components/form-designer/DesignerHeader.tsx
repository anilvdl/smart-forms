import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { useKeyboardShortcuts } from '@smartforms/dynamic-app/services/form-designer/useKeyboardShortcuts';
import { 
  ChevronLeft, 
  Save, 
  Settings, 
  Eye, 
  Undo, 
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Loader2,
  Code,
  Layers,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Keyboard,
  X,
  Reply
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/header.module.css';

interface DesignerHeaderProps {
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
}

export const DesignerHeader: React.FC<DesignerHeaderProps> = ({ 
  onOpenSettings, 
  onCloseSettings,
  isSettingsOpen 
}) => {
  const router = useRouter();
  const {
    form,
    user,
    isDirty,
    isSaving,
    lastSaveTime,
    canUndo,
    canRedo,
    activeView,
    devicePreview,
    showGrid,
    zoom,
    saveForm,
    publishForm,
    undo,
    redo,
    setActiveView,
    setDevicePreview,
    updateUiMode,
    toggleGrid,
    setZoom
  } = useFormBuilder();
  
  // Initialize keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [formTitle, setFormTitle] = useState(form?.title || '');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [settingsClickEffect, setSettingsClickEffect] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Update local title when form changes
  useEffect(() => {
    if (form?.title) {
      setFormTitle(form.title);
    }
  }, [form?.title]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  
  // Close shortcuts when settings opens
  useEffect(() => {
    if (isSettingsOpen && showShortcuts) {
      setShowShortcuts(false);
    }
  }, [isSettingsOpen, showShortcuts]);
  
  const handleTitleSave = async () => {
    if (formTitle.trim() && formTitle !== form?.title) {
      await saveForm();
    }
    setIsEditingTitle(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setFormTitle(form?.title || '');
      setIsEditingTitle(false);
    }
  };
  
  const handleSave = async () => {
    try {
      await saveForm();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };
  
  const handlePublish = async () => {
    try {
      await publishForm();
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };
  
  const handleUiModeToggle = () => {
    const newMode = user?.uiMode === 'recipe' ? 'traditional' : 'recipe';
    updateUiMode(newMode);
  };
  
  // Simple settings click handler
  const handleSettingsClick = () => {
    if (isSettingsOpen) {
      onCloseSettings();
    } else {
      setSettingsClickEffect(true);
      setTimeout(() => setSettingsClickEffect(false), 200);
      onOpenSettings();
    }
  };
  
  const formatSaveTime = (date: Date | null) => {
    if (!date) return 'Not saved';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just saved';
    if (minutes === 1) return 'Saved 1m ago';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Saved 1h ago';
    if (hours < 24) return `Saved ${hours}h ago`;
    
    return 'Saved ' + date.toLocaleDateString();
  };
  
  // Group shortcuts by category for display
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);
  
  return (
    <header className={`${styles.designerHeader} ${isSettingsOpen ? styles.settingsActive : ''}`}>
      {/* Row 1: Main Navigation */}
      <div className={styles.headerRow1}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/forms" className={styles.backButton}>
            <Reply size={18} />
            <span>Back</span>
          </Link>
          
          <div className={styles.formTitleSection}>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className={styles.formTitleInput}
                placeholder="Enter form title..."
              />
            ) : (
              <h1 
                className={styles.formTitle}
                onClick={() => !isSettingsOpen && setIsEditingTitle(true)}
                title="Click to edit title"
              >
                {form?.title || 'Untitled Form'}
              </h1>
            )}
            
            <span className={`${styles.statusBadge} ${form?.status === 'published' ? styles.published : styles.draft}`}>
              {form?.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          
          <div className={`${styles.saveIndicator} ${isSaving ? styles.saving : isDirty ? '' : styles.saved}`}>
            {isSaving ? (
              <>
                <Loader2 size={14} className={styles.spinning} />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <span>Unsaved changes</span>
            ) : (
              <>
                <Check size={14} />
                <span>{formatSaveTime(lastSaveTime)}</span>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button 
            className={styles.iconButton}
            onClick={() => !isSettingsOpen && setShowShortcuts(!showShortcuts)}
            title="Keyboard shortcuts"
            disabled={isSettingsOpen}
          >
            <Keyboard size={18} />
          </button>
          
          <button 
            className={styles.iconButton}
            onClick={handleSave}
            disabled={!isDirty || isSaving || isSettingsOpen}
            title="Save form (Ctrl+S)"
          >
            <Save size={18} />
          </button>
          
          {/* Settings Button */}
          <button 
            className={`${styles.settingsButton} ${isSettingsOpen ? styles.active : ''} ${settingsClickEffect ? styles.clickEffect : ''}`}
            onClick={handleSettingsClick}
            title={isSettingsOpen ? "Close Settings" : "Form Settings"}
            disabled={isSaving}
          >
            <Settings size={18} />
          </button>
          
          <button 
            className={styles.primaryButton}
            onClick={handlePublish}
            disabled={isSaving || isSettingsOpen}
          >
            Publish
          </button>
        </div>
      </div>
      
      {/* Row 2: Toolbar */}
      <div className={`${styles.headerRow2} ${isSettingsOpen ? styles.disabled : ''}`}>
        <div className={styles.leftToolbar}>
          <div className={styles.viewTabs}>
            <button
              className={`${styles.viewTab} ${activeView === 'design' ? styles.active : ''}`}
              onClick={() => setActiveView('design')}
              disabled={isSettingsOpen}
            >
              <Layers size={16} />
              Design
            </button>
            <button
              className={`${styles.viewTab} ${activeView === 'code' ? styles.active : ''}`}
              onClick={() => setActiveView('code')}
              disabled={isSettingsOpen}
            >
              <Code size={16} />
              Code
            </button>
            <button
              className={`${styles.viewTab} ${activeView === 'preview' ? styles.active : ''}`}
              onClick={() => setActiveView('preview')}
              disabled={isSettingsOpen}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>
        
        <div className={styles.centerToolbar}>
          <div className={styles.actionGroup}>
            <button
              className={styles.toolButton}
              onClick={undo}
              disabled={!canUndo || isSettingsOpen}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              className={styles.toolButton}
              onClick={redo}
              disabled={!canRedo || isSettingsOpen}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
          </div>
          
          <div className={styles.separator} />
          
          <div className={styles.canvasControls}>
            <button
              className={`${styles.toolButton} ${showGrid ? styles.active : ''}`}
              onClick={toggleGrid}
              disabled={isSettingsOpen}
              title="Toggle grid"
            >
              <Grid3x3 size={18} />
            </button>
            
            <div className={styles.zoomControls}>
              <button
                className={styles.toolButton}
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25 || isSettingsOpen}
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className={styles.zoomLevel}>{zoom}%</span>
              <button
                className={styles.toolButton}
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200 || isSettingsOpen}
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.rightToolbar}>
          <button
            className={`${styles.toolButton} ${user?.uiMode === 'recipe' ? styles.active : ''}`}
            onClick={handleUiModeToggle}
            disabled={isSettingsOpen}
            title={`Switch to ${user?.uiMode === 'recipe' ? 'Traditional' : 'Recipe Card'} mode`}
          >
            <Maximize2 size={16} />
          </button>
          
          <div className={styles.devicePreview}>
            <button
              className={`${styles.deviceOption} ${devicePreview === 'desktop' ? styles.active : ''}`}
              onClick={() => setDevicePreview('desktop')}
              disabled={isSettingsOpen}
              title="Desktop view"
            >
              <Monitor size={18} />
            </button>
            <button
              className={`${styles.deviceOption} ${devicePreview === 'tablet' ? styles.active : ''}`}
              onClick={() => setDevicePreview('tablet')}
              disabled={isSettingsOpen}
              title="Tablet view"
            >
              <Tablet size={18} />
            </button>
            <button
              className={`${styles.deviceOption} ${devicePreview === 'mobile' ? styles.active : ''}`}
              onClick={() => setDevicePreview('mobile')}
              disabled={isSettingsOpen}
              title="Mobile view"
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Settings Overlay */}
      {isSettingsOpen && (
        <div className={styles.settingsOverlay}>
          <div className={styles.overlayContent}>
            <Settings size={20} />
            <span>Form Settings Active</span>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && !isSettingsOpen && (
        <div className={styles.shortcutsPanel}>
          <div className={styles.shortcutsPanelHeader}>
            <h4>Keyboard Shortcuts</h4>
            <button onClick={() => setShowShortcuts(false)}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.shortcutsContent}>
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className={styles.shortcutCategory}>
                <h5>{category}</h5>
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className={styles.shortcutItem}>
                    <span className={styles.shortcutKey}>{shortcut.key}</span>
                    <span className={styles.shortcutDesc}>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};