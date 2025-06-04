// src/components/propertyEditors/TimeFormatEditor.tsx
import React, { useState, useEffect } from "react";
import { format as formatDate } from "date-fns";
import { FormElement } from "store/formStore";

const TIME_SEPS = [":", "."];

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function TimeFormatEditor({ element, onChange }: Props) {
  const isDateTime = element.type === "datetime-local";
  const props = element.properties || {};

  // Determine initial mode and separator
  const initHourMode = /h/.test(props.timeFormat || "") ? "12" : "24";
  const initSep =
    TIME_SEPS.find((s) => (props.timeFormat || "").includes(s)) || ":";

  const [hourMode, setHourMode] = useState<"12" | "24">(initHourMode as any);
  const [sep, setSep] = useState(initSep);
  const [ampm, setAmpm] = useState<string>(props.ampm || "AM");

  useEffect(() => {
    const base =
      hourMode === "24" ? "HH{sep}mm" : "hh{sep}mm aa";
    const fmt = base.replace(/{sep}/g, sep);

    const dateFmt = props.dateFormat || "yyyy-MM-dd";
    const combinedFmt = `${dateFmt} ${fmt}`.trim();
    const now = formatDate(new Date(), combinedFmt);

    const newProps = {
      ...props,
      timeFormat: fmt,
      defaultValue: isDateTime ? now : formatDate(new Date(), fmt),
      ampm,
    };

    onChange({ ...element, properties: newProps });
  }, [hourMode, sep, ampm]);

  return (
    <div className="format-section">
      <hr className="divider" />
      <label className="field-label">
        {isDateTime ? "Time Format" : "Formatting"}
      </label>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            checked={hourMode === "24"}
            onChange={() => setHourMode("24")}
          />
          24-Hour
        </label>
        <label>
          <input
            type="radio"
            checked={hourMode === "12"}
            onChange={() => setHourMode("12")}
          />
          12-Hour
        </label>
      </div>

      <label className="field-label">Separator</label>
      <select
        className="field-input"
        value={sep}
        onChange={(e) => setSep(e.target.value)}
      >
        {TIME_SEPS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {hourMode === "12" && (
        <>
          <label className="field-label">AM/PM</label>
          <select
            className="field-input"
            value={ampm}
            onChange={(e) => setAmpm(e.target.value as any)}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </>
      )}
    </div>
  );
}
