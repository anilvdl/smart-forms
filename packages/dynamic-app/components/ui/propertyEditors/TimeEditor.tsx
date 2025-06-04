import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";
import { timeZoneOptions } from "constants/timezone";
import FormatEditor from "./FormatEditor";
import TimeFormatEditor from "./formatEditors/TimeFormatEditor";

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function TimeEditor({ element, onChange }: Props) {
  const fields: FieldConfig[] = [
    { type: "text", name: "label",     label: "Label" },
    { type: "checkbox", name: "required", label: "Required" },
    { type: "component", component: TimeFormatEditor, name: "format", label: "Time Format" },
    { type: "divider"},
    { type: "text", name: "properties.defaultValue", label: "Default Time (HH:MM)" },
    { type: "text", name: "properties.minTime",      label: "Min Time (HH:MM)" },
    { type: "text", name: "properties.maxTime",      label: "Max Time (HH:MM)" },
    {
        type: "select",
        name: "properties.timezone",
        label: "Time Zone",
        options: timeZoneOptions,
        placeholder: "(UTC-06:00) America/Chicago",
      },
  ];

  return (
    <PropertiesCard
      element={element}
      fields={fields}
      onChange={onChange}
    />
  );
}
