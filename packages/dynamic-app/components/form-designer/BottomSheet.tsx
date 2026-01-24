// Mobile Bottom Sheet Component
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/form-designer/components/bottom-sheet.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentY.current = e.touches[0].clientY;
    const translateY = Math.max(0, currentY.current - startY.current);
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${translateY}px)`;
    }
  };
  
  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    
    const translateY = currentY.current - startY.current;
    if (translateY > 100) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
    
    isDragging.current = false;
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div 
        ref={sheetRef}
        className={`${styles.bottomSheet} ${isOpen ? styles.open : ''}`}
      >
        <div 
          className={styles.handle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.handleBar} />
        </div>
        
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};