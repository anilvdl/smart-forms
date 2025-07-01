import React from 'react';
import styles from '../../../styles/card.module.css';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({
  title,
  children,
  footer,
  className = '',
}: CardProps) {
  return (
    <div data-testid="card" className={`${styles.card} ${className}`}>
      {title && <div className={styles.header}>{title}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}