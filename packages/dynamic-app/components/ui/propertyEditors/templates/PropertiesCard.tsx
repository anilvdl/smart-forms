"use client";
import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig, FieldValue, OptionItem } from "./FieldConfig";

/** 
 * The props for our dynamic card:
 * - title: e.g. "Logo Properties Editor"
 * - element: the actual FormElement we’re editing
 * - fields: array describing which UI controls to render
 * - onChange: callback with updated FormElement
 * - children: any custom UI (like OptionListEditor) to render after standard fields
 */
export interface PropertiesCardProps {
  title?: string;
  element: FormElement;
  fields: FieldConfig[];
  onChange: (updated: FormElement) => void;
  handleFieldChanges?: (name: string, value: FieldValue) => void;
  children?: React.ReactNode;
}

/** Recursively read “foo.bar” off obj */
function getValueByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/** Recursively set “foo.bar” on a FormElement */
function setValueByPath(el: FormElement, path: string, value: any): FormElement {
  // alert( `element: ${JSON.stringify(el)} and path: ${path} and value: ${value}`);
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) {
    // simple top-level
    return { ...el, [head]: value };
  }
  if (head === "properties") {
    // nested under el.properties
    return {
      ...el,
      properties: {
        ...(el.properties || {}),
        [rest[0]]: value,
      },
    };
  }
  // add more branches here if you ever nest deeper
  return el;
}

/**
 * A reusable card-based editor that loops over the fields array
 * and renders them in a consistent style, plus any children. 
 */
export default function PropertiesCard({
  title,
  element,
  fields,
  onChange,
  children,
}: PropertiesCardProps) {

  function handleFieldChange(name: string, value: FieldValue) {
    // const updated = { ...element, [name]: value };
    // alert(`element name: ${name} and its value: ${value}`);
    const updated = setValueByPath(element, name, value);
    onChange(updated);
  }

  return (
    <div className="properties-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-body">
        {fields.map((field, idx) => {
          // If shouldShow is defined and returns false, skip rendering
          if (field.shouldShow && !field.shouldShow(element)) {
            return null;
          } 
          return (
            <div className={`card-field${field.type === "component" ? " component-field" : ""}`} key={idx} style={field.style}>
                {renderField(field, element, handleFieldChange, onChange)}
            </div>
          );
        })}
        {/* Render any nested custom UI */}
        {children}
      </div>
    </div>
  );
}

/** 
 * Renders a single field. 
 * We handle standard types + "divider" + "component".
 */
function renderField(
  field: FieldConfig,
  element: FormElement,
  handleFieldChange: (name: string, value: FieldValue) => void,
  onChange: (updated: FormElement) => void // for custom components
) {
  const { type, label, placeholder, min, max, step, options, name, helpText, style } = field;

  // If the field has a name, we read that from the element
  // const fieldValue = name ? element[name] : undefined;
  // If the field has a name/path, we read it (deeply) from the element
  const fieldValue = name ? getValueByPath(element, name) : undefined;

  switch (type) {
    case "divider":
        return <hr style={styles.divider} />;
    case "color":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="color"
            className="field-input"
            value={(fieldValue as string) || "#000000"}
            onChange={e => {
              if (!name) return;
              handleFieldChange(name, e.target.value);
            }}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );
        
    case "number":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="number"
            className="field-input"
            placeholder={placeholder || ""}
            value={
              fieldValue !== undefined && fieldValue !== null
                ? String(fieldValue)
                : ""
            }
            onChange={e => {
              if (!name) return;
              const val = e.target.value;
              // If step is fractional, parse as float; otherwise parse as integer
              const parsed =
                step && step % 1 !== 0
                  ? parseFloat(val)
                  : parseInt(val, 10);
              handleFieldChange(name, isNaN(parsed) ? undefined : parsed);
            }}
            min={min}
            max={max}
            step={step}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    case "text":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="text"
            className="field-input"
            placeholder={placeholder || ""}
            value={(fieldValue as string) || ""}
            maxLength={max ? max : undefined}
            minLength={min ? min : undefined}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    case "textarea":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <textarea
            className="field-textarea"
            placeholder={placeholder || ""}
            value={(fieldValue as string) || ""}
            maxLength={max ? max : undefined}
            minLength={min ? min : undefined}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    case "checkbox":
      return (
        <label className="field-label checkbox-label">
          <input
            type="checkbox"
            checked={!!fieldValue}
            onChange={(e) => name && handleFieldChange(name, e.target.checked)}
          />
          {label}
        </label>
      );

    case "slider": {
      const numericValue = typeof fieldValue === "number" ? fieldValue : 100;
      const minVal = min ?? 50;
      const maxVal = max ?? 200;
      const fraction = (numericValue - minVal) / (maxVal - minVal);

      return (
        <div className="slider-wrapper">
          {label && <label className="field-label">{label}</label>}
          <div style={{ position: "relative", marginTop: "10px" }}>
            <input
              type="range"
              min={minVal}
              max={maxVal}
              step={step ?? 1}
              value={numericValue}
              onChange={(e) => name && handleFieldChange(name, parseInt(e.target.value))}
              className="slider-input"
              style={style}
            />
            <span
              className="slider-value-bubble"
              style={{
                left: `${fraction * 100}%`,
              }}
            >
              {numericValue}px
            </span>
          </div>
          {helpText && <small className="help-text">{helpText}</small>}
        </div>
      );
    }

    case "alignment":
      // e.g. left/center/right with optional icons
      return (
        <div className="alignment-group">
          {label && <div className="field-label">{label}</div>}
            {(options || defaultAlignmentOptions).map((opt: OptionItem) => (
                <button
                key={opt.value}
                className={`align-btn ${fieldValue === opt.value ? "active" : ""}`}
                onClick={() => name && handleFieldChange(name, opt.value)}
                title={opt.label || opt.value}
                >
                    {opt.icon || opt.label || opt.value}
                </button>
            ))}
            {helpText && <small className="help-text">{helpText}</small>}
        </div>
      );
    
    // ── Select (e.g. Time Zone dropdown) ────────────────────────────────
    case "select":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <select
            className="field-input"
            value={(fieldValue as string) || ""}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label || opt.value}
              </option>
            ))}
          </select>
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    // ── Date Picker ─────────────────────────────────────────────────────
    case "date":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="date"
            className="field-input"
            value={(fieldValue as string) || ""}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    // ── Time Picker ─────────────────────────────────────────────────────
    case "time":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="time"
            className="field-input"
            value={(fieldValue as string) || ""}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    // ── Date & Time Picker ──────────────────────────────────────────────
    case "datetime-local":
      return (
        <>
          {label && <label className="field-label">{label}</label>}
          <input
            type="datetime-local"
            className="field-input"
            value={(fieldValue as string) || ""}
            onChange={(e) => name && handleFieldChange(name, e.target.value)}
          />
          {helpText && <small className="help-text">{helpText}</small>}
        </>
      );

    case "component":
      // For a fully custom component, we pass the element & onChange
      if (field.component) {
        const CustomComp = field.component;
        return (
          <CustomComp
            element={element}
            onChange={onChange}
          />
        );
      }
      return <div>Missing `component` for custom field.</div>;

    default:
      return <div>Unsupported field type: {type}</div>;
  }
}

/** Default alignment options if none are provided */
const defaultAlignmentOptions: OptionItem[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const styles: Record<string, React.CSSProperties> = {
  divider: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "2px",
  },
};