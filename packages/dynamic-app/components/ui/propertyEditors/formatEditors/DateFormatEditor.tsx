import React, { useState, useEffect } from "react";
import { format as formatDate } from "date-fns";
import { FormElement } from "store/formStore";

const BASE_PATTERNS = [
  { label: "YYYY / MM / DD", pattern: "yyyy{sep}MM{sep}dd" },
  { label: "MM / DD / YYYY", pattern: "MM{sep}dd{sep}yyyy" },
  { label: "DD / MM / YYYY", pattern: "dd{sep}MM{sep}yyyy" },
  { label: "Month D, YYYY", pattern: "MMMM{sep}d{sep}yyyy" },
];
const SEPARATORS = ["/", "-", "."];

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function DateFormatEditor({ element, onChange }: Props) {
  const isDateTime = element.type === "datetime-local";
  const props = element.properties || {};

  // Initialize from either dateFormat (for datetime) or format (for date-only)
  const existingPattern = isDateTime ? props.dateFormat : props.dateFormat ?? (props.defaultValue && props.dateFormat);
  let initBase = BASE_PATTERNS[0].pattern;
  let initSep = "/";

  if (existingPattern) {
    for (const sep of SEPARATORS) {
      if (existingPattern.includes(sep)) {
        initSep = sep;
        break;
      }
    }
    const candidate = existingPattern.replace(
      new RegExp(`\\${initSep}`, "g"),
      "{sep}"
    );
    if (BASE_PATTERNS.some((b) => b.pattern === candidate)) {
      initBase = candidate;
    }
  }

  const [basePattern, setBasePattern] = useState(initBase);
  const [sep, setSep] = useState(initSep);

  useEffect(() => {
    const fmt = basePattern.replace(/{sep}/g, sep);
    const now = formatDate(new Date(), fmt);

    const newProps = {
      ...props,
      dateFormat: fmt,
      defaultValue: isDateTime
        ? // combine existing timeFormat
          `${formatDate(new Date(), fmt)} ${props.timeFormat || ""}`.trim()
        : now,
    };

    onChange({ ...element, properties: newProps });
  }, [basePattern, sep]);

  return (
    <div className="format-section">
      <hr className="divider" />
      <label className="field-label">
        {isDateTime ? "Date Format" : "Formatting"}
      </label>

      <select
        className="field-input"
        value={basePattern}
        onChange={(e) => setBasePattern(e.target.value)}
      >
        {BASE_PATTERNS.map((opt) => (
          <option key={opt.pattern} value={opt.pattern}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="field-label">Separator</label>
      <select
        className="field-input"
        value={sep}
        onChange={(e) => setSep(e.target.value)}
      >
        {SEPARATORS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
