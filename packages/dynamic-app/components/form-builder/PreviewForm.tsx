"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useFormStore } from 'store/formStore';
import FieldRenderer from 'components/core/FieldRenderer';

export default function PreviewForm() {
  const { canvasElements, formId } = useFormStore();
  const elements = useFormStore(s => s.elements);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // grab the logo element from your panel library
  const logoElement = elements.find(el => el.type === 'logo' && el.placeholder);

  // ── Group consecutive buttons into runs ───────────────────────────────
  const runs: typeof canvasElements[] = [];
  let buf: typeof canvasElements = [];
  canvasElements.forEach((el) => {
    const isBtn = el.type === "submit" || el.type === "reset";
    if (isBtn) {
      buf.push(el);
    } else {
      if (buf.length) {
        runs.push(buf);
        buf = [];
      }
      runs.push([el]);
    }
  });
  if (buf.length) runs.push(buf);


  if (submitted) {
    return <div className="thank-you">Thank you for submitting!</div>;
  }

  return (
    <form
      className="preview-form"
      onSubmit={async e => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {};
        canvasElements.forEach(el => {
          data[el.id] = formData.get(el.id);
        });
        try {
          await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId, data }),
          }).catch(err => {
            console.error('Submission error:', err);
            setError('Submission failed.');
          }).then(res => {
            setSubmitted(true);
          });
        } catch(e) {
          console.error('Submission error:', e);
          setError('Submission failed.');
        }
      }}
    >
      {logoElement && (
        <div className="preview-logo">
          {/** Static logo, using same sizing logic as CanvasLogo */}
          <Image
            src={logoElement.placeholder!}
            alt="Logo"
            unoptimized
            width={
              typeof logoElement.style?.width === 'number'
                ? logoElement.style.width
                : 100
            }
            height={
              typeof logoElement.style?.width === 'number'
                ? logoElement.style.width
                : 100
            }
            style={logoElement.style || {}}
          />
          {logoElement.properties?.title && (
            <div
              className="logo-title"
              dangerouslySetInnerHTML={{
                __html: logoElement.properties.title as string,
              }}
            />
          )}
        </div>
      )}

      {runs.map((run, runIdx) => {
        const allButtons = run.every(
          (el) => el.type === "submit" || el.type === "reset"
        );
        if (allButtons) {
          return (
            <div key={`btn-row-p-${runIdx}`} className="button-row">
              {run.map((el) => (
                <div key={el.id} className="preview-row">
                   <FieldRenderer key={el.id} element={el} mode="preview" />
                </div>
              ))}
            </div>
          );
        }
        return run.map((el) => (
          <div key={el.id} className="preview-row">
             <FieldRenderer key={el.id} element={el} mode="preview" />
          </div>
        ));
      })}

      {error && <div className="error">{error}</div>}
    </form>
  );
}