'use client';
import React from 'react';

export type ThreeDMode = 'none' | 'floating' | 'tilt';

interface ThreeDToggleProps {
  mode: ThreeDMode;
  onChange: (m: ThreeDMode) => void;
}

export default function ThreeDToggle({ mode, onChange }: ThreeDToggleProps) {
  return (
    <div className="three-d-toggle">
      {(['none','floating','tilt'] as ThreeDMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={mode === m ? 'active' : ''}
          style={{
            marginRight: '0.5rem',
            padding: '0.5rem 1rem',
            border: mode===m ? '2px solid #ff6600' : '1px solid #ccc',
            background: mode===m ? '#ffedd5' : '#fff',
            cursor: 'pointer'
          }}
        >
          {m === 'none' ? 'Flat' : m === 'floating' ? 'Floating' : 'Tilted'}
        </button>
      ))}
    </div>
  );
}