import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from '../../styles/modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const defaultFooter = (
  <div className={styles.footerDefault}>
    Powered by SmartForms
  </div>
);

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button
            aria-label="Close"
            className={styles.closeButton}
            onClick={onClose}
          >×</button>
        </header>
        <section className={styles.body}>{children}</section>
        <footer className={styles.footer}>
          {footer ?? defaultFooter}
        </footer>
      </div>
    </div>,
    document.body
  );
};