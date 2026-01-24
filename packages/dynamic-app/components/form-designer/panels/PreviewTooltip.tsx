import React from 'react';
import { X } from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/preview-tooltip.module.css';

interface PreviewTooltipProps {
  isVisible: boolean;
  preview: string;
  position: { x: number; y: number };
  placement: 'right' | 'bottom';
  onClose: () => void;
}

export const PreviewTooltip: React.FC<PreviewTooltipProps> = ({
  isVisible,
  preview,
  position,
  placement,
  onClose
}) => {
  if (!isVisible || !preview) return null;

  return (
    <div
      className={`${styles.previewTooltip} ${styles[placement]}`}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 9999
      }}
    >
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipTitle}>Preview</span>
        <button onClick={onClose} className={styles.tooltipClose}>
          <X size={12} />
        </button>
      </div>
      <div className={styles.tooltipContent}>
        <pre className={styles.previewCode}>{preview}</pre>
      </div>
    </div>
  );
};