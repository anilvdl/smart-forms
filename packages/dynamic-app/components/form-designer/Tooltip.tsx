// Custom Tooltip Component with Auto-positioning
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/tooltip.module.css';

interface TooltipProps {
  content: string;
  children: React.ReactElement<any>;
  delay?: number;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  delay = 150,
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const spacing = 8;
    let placement = 'top';
    let top = 0;
    let left = 0;
    
    // Calculate center position
    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;
    
    // Try different placements based on available space
    const placements = [
      {
        name: 'top',
        top: triggerRect.top - tooltipRect.height - spacing,
        left: centerX - tooltipRect.width / 2,
        fits: triggerRect.top - tooltipRect.height - spacing > 0
      },
      {
        name: 'bottom',
        top: triggerRect.bottom + spacing,
        left: centerX - tooltipRect.width / 2,
        fits: triggerRect.bottom + tooltipRect.height + spacing < viewport.height
      },
      {
        name: 'right',
        top: centerY - tooltipRect.height / 2,
        left: triggerRect.right + spacing,
        fits: triggerRect.right + tooltipRect.width + spacing < viewport.width
      },
      {
        name: 'left',
        top: centerY - tooltipRect.height / 2,
        left: triggerRect.left - tooltipRect.width - spacing,
        fits: triggerRect.left - tooltipRect.width - spacing > 0
      }
    ];
    
    // Find the best placement
    const bestPlacement = placements.find(p => p.fits) || placements[0];
    
    // Adjust horizontal position to stay within viewport
    left = Math.max(spacing, Math.min(bestPlacement.left, viewport.width - tooltipRect.width - spacing));
    
    // Adjust vertical position to stay within viewport
    top = Math.max(spacing, Math.min(bestPlacement.top, viewport.height - tooltipRect.height - spacing));
    
    setPosition({
      top: top + window.scrollY,
      left: left + window.scrollX,
      placement: bestPlacement.name
    });
  };
  
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Clone children to add event handlers
  const trigger = React.cloneElement(children, {
    ...children.props,
    ref: useCallback((node: HTMLElement) => {
      triggerRef.current = node;
      // Handle existing ref if present
      const existingRef = (children as any).ref;
      if (typeof existingRef === 'function') {
        existingRef(node);
      } else if (existingRef && typeof existingRef === 'object') {
        existingRef.current = node;
      }
    }, [children]),
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      if (children.props?.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      if (children.props?.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      if (children.props?.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      if (children.props?.onBlur) {
        children.props.onBlur(e);
      }
    }
  });
  
  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className={`${styles.tooltip} ${styles[position.placement]}`}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      <div className={styles.tooltipContent}>
        {content}
      </div>
      <div className={styles.tooltipArrow} />
    </div>
  );
  
  return (
    <>
      {trigger}
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};