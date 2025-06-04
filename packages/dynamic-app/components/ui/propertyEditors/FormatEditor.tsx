import React, { useState, useEffect } from "react";
import { FormElement } from "store/formStore";
import { format as formatDate } from "date-fns";

interface FormatEditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}

export default function FormatEditor({ element, onChange }: FormatEditorProps) {
    // 1) Determine defaults based on element.type
    let defaultFmt: string;
    let placeholder: string;
    switch (element.type) {
      case "time":
        defaultFmt = "HH:mm";
        placeholder = "e.g. HH:mm";
        break;
      case "datetime-local":
        defaultFmt = "yyyy-MM-dd'T'HH:mm";
        placeholder = "e.g. yyyy-MM-dd'T'HH:mm";
        break;
      case "date":
      default:
        defaultFmt = "yyyy-MM-dd";
        placeholder = "e.g. yyyy-MM-dd";
        break;
    }
  
    // 2) Local state
    const initial = element.properties?.format || "";
    const [fmt, setFmt] = useState(initial);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState("");
  
    // 3) Recompute preview whenever `fmt` or element.type changes
    useEffect(() => {
      try {
        // Use fmt if provided, otherwise the default for this type
        const p = formatDate(new Date(), fmt || defaultFmt);
        setPreview(p);
        setError(null);
      } catch {
        setPreview("");
        // don’t mark error here—only on blur
      }
    }, [fmt, defaultFmt]);
  
    const handleBlur = () => {
      try {
        // Validate by formatting now
        formatDate(new Date(), fmt || defaultFmt);
        setError(null);
        onChange({
          ...element,
          properties: { ...element.properties, format: fmt },
        });
      } catch {
        setError("Invalid format string");
      }
    };
  
    return (
      <div className="format-section">
        <hr className="divider" />
        <label className="field-label">Formatting</label>
        <input
          type="text"
          className={`field-input format-input ${error ? "error" : ""}`}
          value={fmt}
          placeholder={placeholder}
          onChange={(e) => setFmt(e.target.value)}
          onBlur={handleBlur}
        />
        {error && <small className="format-error">{error}</small>}
        {!error && preview && (
          <small className="format-preview">Preview: {preview}</small>
        )}
      </div>
    );
}