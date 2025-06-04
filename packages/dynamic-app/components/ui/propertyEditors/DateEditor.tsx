import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";
import { timeZoneOptions } from "constants/timezone";
import DateFormatEditor from "./formatEditors/DateFormatEditor";

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function DateEditor({ element, onChange }: Props) {
  const fields: FieldConfig[] = [
    { type: "text", name: "label",    label: "Label" },
    { type: "checkbox", name: "required", label: "Required" },
    { type: "component", component: DateFormatEditor, name: "format", label: "Date Format" },
    { type: "divider"},
    { type: "text", name: "properties.defaultValue", label: "Default Date", max: 10 },
    // { type: "date", name: "properties.minDate",      label: "Min Date" },
    // { type: "date", name: "properties.maxDate",      label: "Max Date" },
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
