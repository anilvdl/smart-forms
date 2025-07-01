import React from 'react';
import styles from '../../../styles/button.module.css';
import clsx from 'clsx';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable button component with three variants:
 * - primary: filled brand orange
 * - secondary: transparent bg with orange border
 * - danger: filled red
 */
export function Button({
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  children,
}: ButtonProps) {
  return (
    <button
      type="button"
      data-testid="button"
      className={clsx(
        styles.button,
        styles[variant],
        { [styles.disabled]: disabled },
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}