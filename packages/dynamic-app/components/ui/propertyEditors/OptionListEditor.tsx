import React from "react";
import { FormElement } from "store/formStore";
import PropertiesCard from "./templates/PropertiesCard";

interface OptionListEditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}

export default function OptionListEditor({ element, onChange }: OptionListEditorProps) {
  const opts = element.properties?.options || [];
  const dv = element.properties?.defaultValue || "";

  const isMulti = element.type === "checkbox";
  const inputType: "radio" | "checkbox" = isMulti ? "checkbox" : "radio";

  // update the options array itself (labels/values)
  const updateOpts = (newOpts: { label: string; value: string }[]) => {
    onChange({
      ...element,
      properties: { ...element.properties, options: newOpts },
    });
  };

  // update defaultValue when user toggles inline selector
  const updateDefault = (value: string, checked: boolean) => {
    let newDV: string;
    if (isMulti) {
      // multi=comma list
      const current = dv ? dv.split(",") : [];
      newDV = checked
        ? Array.from(new Set([...current, value])).join(",")
        : current.filter((v) => v !== value).join(",");
    } else {
      // single/dropdown
      newDV = checked ? value : "";
    }
    onChange({
      ...element,
      properties: { ...element.properties, defaultValue: newDV },
    });
  };

  const handleLabelChange = (i: number, text: string) => {
    const newOpts = [...opts];
    newOpts[i] = { label: text, value: text };
    updateOpts(newOpts);
  };

  const removeOption = (i: number) => {
    // if removed option was default, clear it
    const removed = opts[i].value;
    const newDV = isMulti
      ? dv.split(",").filter((v) => v !== removed).join(",")
      : dv === removed
      ? ""
      : dv;
    updateOpts(opts.filter((_, idx) => idx !== i));
    onChange({
      ...element,
      properties: { ...element.properties, defaultValue: newDV, options: opts.filter((_, idx) => idx !== i) },
    });
  };

  const addOption = () => {
    const newOpts = [...opts, { label: "New option", value: "New option" }];
    updateOpts(newOpts);
  };

  return (
    <PropertiesCard title="Options" element={element} fields={[]} onChange={onChange}>
      <div className="options-list">
        {opts.map((opt, i) => {
          const checked = isMulti
            ? dv.split(",").includes(opt.value)
            : dv === opt.value;
          return (
            <div key={i} className="option-row">
              <input
                type="text"
                className="field-input option-input"
                value={opt.label}
                onChange={(e) => handleLabelChange(i, e.target.value)}
                placeholder="Option text"
              />
              <input
                type={inputType}
                name={`${element.id}-default`}
                checked={checked}
                onChange={(e) => updateDefault(opt.value, e.target.checked)}
                className="default-selector"
                title="Set as default"
              />
              <button
                type="button"
                className="remove-button"
                onClick={() => removeOption(i)}
                title="Remove option"
              >
                &times;
              </button>
            </div>
          );
        })}
        <button type="button" className="add-option-button" onClick={addOption}>
          + Add option
        </button>
      </div>
    </PropertiesCard>
  );
}
