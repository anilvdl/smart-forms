import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutPreview } from './LayoutPreview';
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Move, 
  X,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/floating-preview-modal.module.css';

interface FloatingPreviewModalProps {
  settings: any;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface Position {
  x: number;
  y: number;
}

export const FloatingPreviewModal: React.FC<FloatingPreviewModalProps> = ({
  settings,
  isVisible,
  onToggleVisibility
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ 
    x: window.innerWidth - 340, // Start on right side
    y: 120 // Below header
  });
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPosition = useRef<Position>({ x: 0, y: 0 });
  
  // Initialize position on mount and when visibility changes
  useEffect(() => {
    if (isVisible) {
      const modalWidth = isExpanded ? 500 : 500;
      const modalHeight = isExpanded ? 600 : 400;
      const padding = 20;
      
      // Position on right side of screen
    //   const initialX = window.innerWidth - modalWidth - padding;
      const initialX = 1760;
      console.log(`window.innerWidth: ${window.innerWidth}, modalWidth: ${modalWidth}, padding: ${padding}`);
      const initialY = 250; // Below header
      
      setPosition({ x: initialX, y: initialY });
    }
  }, [isVisible, isExpanded]);
  
  // Enhanced smooth dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!modalRef.current) return;
    
    const rect = modalRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    isDraggingRef.current = true;
    
    // Store last position for momentum calculation
    lastPosition.current = { x: e.clientX, y: e.clientY };
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    if (modalRef.current) {
      modalRef.current.style.pointerEvents = 'auto';
    }
    
    // Add cursor style
    document.body.style.cursor = 'grabbing';
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !modalRef.current) return;
    
    e.preventDefault();
    
    // Calculate new position based on mouse position minus initial offset
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Get modal dimensions
    const modalWidth = isExpanded ? 500 : 500;
    const modalHeight = isExpanded ? 600 : 400;
    
    // Calculate viewport constraints
    const padding = 10;
    const maxX = window.innerWidth - modalWidth - padding;
    const maxY = window.innerHeight - modalHeight - padding;
    
    // Apply smooth constraints
    const constrainedX = Math.max(padding, Math.min(newX, maxX));
    const constrainedY = Math.max(padding, Math.min(newY, maxY));
    
    // Use requestAnimationFrame for smooth movement
    requestAnimationFrame(() => {
      setPosition({
        x: constrainedX,
        y: constrainedY
      });
    });
    
    // Update last position for momentum
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, [dragOffset, isExpanded]);
  
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    setIsDragging(false);
    
    // Restore body styles
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    document.body.style.cursor = '';
    
    if (modalRef.current) {
      modalRef.current.style.pointerEvents = '';
    }
    
    // Snap to edges if close enough
    const snapThreshold = 30;
    const modalWidth = isExpanded ? 400 : 320;
    const modalHeight = isExpanded ? 600 : 400;
    
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      // Snap to left edge
      if (prev.x < snapThreshold) {
        newX = 10;
      }
      // Snap to right edge
      else if (prev.x > window.innerWidth - modalWidth - snapThreshold) {
        newX = window.innerWidth - modalWidth - 10;
      }
      
      // Snap to top edge
      if (prev.y < snapThreshold + 80) { // Account for header
        newY = 90;
      }
      // Snap to bottom edge
      else if (prev.y > window.innerHeight - modalHeight - snapThreshold) {
        newY = window.innerHeight - modalHeight - 10;
      }
      
      return { x: newX, y: newY };
    });
  }, [isExpanded]);
  
  // Enhanced event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent) => handleMouseMove(e);
      const handleUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('mouseleave', handleUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('mouseleave', handleUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const modalWidth = isExpanded ? 400 : 320;
      const modalHeight = isExpanded ? 600 : 400;
      const padding = 10;
      const maxX = window.innerWidth - modalWidth - padding;
      const maxY = window.innerHeight - modalHeight - padding;
      
      setPosition(prev => ({
        x: Math.max(padding, Math.min(prev.x, maxX)),
        y: Math.max(90, Math.min(prev.y, maxY)) // Keep below header
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  const getDeviceClass = () => {
    switch (device) {
      case 'tablet': return styles.tablet;
      case 'mobile': return styles.mobile;
      default: return styles.desktop;
    }
  };
  
  return (
    <div
      ref={modalRef}
      className={`${styles.floatingModal} ${isExpanded ? styles.expanded : ''} ${
        isDragging ? styles.dragging : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1100 : 1050,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Professional Modal Header */}
      <div 
        className={styles.modalHeader} 
        onMouseDown={handleMouseDown}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.dragHandle}>
            <MoreHorizontal size={14} />
          </div>
          <div className={styles.headerTitle}>
            <Eye size={14} />
            <span>Live Preview</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
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
          
          {/* Expand/Collapse */}
          {/* <button
            className={styles.actionButton}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button> */}
          
          {/* Close */}
          {/* <button
            className={styles.actionButton}
            onClick={onToggleVisibility}
            title="Close preview"
          >
            <X size={14} />
          </button> */}
        </div>
      </div>
      
      {/* Modal Content */}
      <div className={styles.modalContent}>
        <div className={`${styles.previewContainer} ${getDeviceClass()}`}>
          {/* Live Badge */}
          <div className={styles.liveBadge}>
            <div className={styles.liveDot} />
            <span>LIVE</span>
          </div>
          
          {/* Form Preview */}
          <div className={styles.formPreview}>
            <LayoutPreview settings={settings} />
             {/* device={device} /> */}
          </div>
        </div>
        
        {/* Settings Summary (when expanded) */}
        {isExpanded && (
          <div className={styles.settingsSummary}>
            <div className={styles.summaryHeader}>
              <Settings size={12} />
              <span>Current Settings</span>
            </div>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Label Position</span>
                <span className={styles.summaryValue}>{settings.labelPosition || 'Top'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Field Spacing</span>
                <span className={styles.summaryValue}>{settings.fieldSpacing || 16}px</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Font Size</span>
                <span className={styles.summaryValue}>{settings.fontSize || 14}px</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Theme</span>
                <span className={styles.summaryValue}>{settings.theme || 'Light'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};