// Modern Confirmation Modal Component
import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/confirmation-modal.module.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);
  
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 size={28} />;
      case 'warning':
        return <AlertTriangle size={28} />;
      case 'success':
        return <CheckCircle size={28} />;
      default:
        return <Info size={28} />;
    }
  };
  
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onCancel}>
          <X size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={`${styles.iconContainer} ${styles[type]}`}>
            {getIcon()}
          </div>
          
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
          
          <div className={styles.actions}>
            <button 
              className={styles.cancelButton}
              onClick={onCancel}
              autoFocus
            >
              {cancelText}
            </button>
            <button 
              className={`${styles.confirmButton} ${styles[type]}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};