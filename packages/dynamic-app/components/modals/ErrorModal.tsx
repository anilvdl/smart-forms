import React from 'react';
import Image from 'next/image';
import { Icons } from '@smartforms/shared/icons';

interface SaveErrorModalProps {
  message: string;
  onClose: () => void;
}

export const SaveErrorModal: React.FC<SaveErrorModalProps> = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Error</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="modal-body">
        <Image
          src={Icons["error"] ?? Icons["error-computer"]}
          alt="Error Icon"
          width={32}
          height={32}
        />
        <p>{message}</p>
      </div>
      <div className="modal-actions">
        <button className="submit-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  </div>
);
