import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";
import { timeZoneOptions } from "constants/timezone";
import FormatEditor from "./FormatEditor";
import DateFormatEditor from "./formatEditors/DateFormatEditor";
import TimeFormatEditor from "./formatEditors/TimeFormatEditor";

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function DateTimeEditor({ element, onChange }: Props) {
  const fields: FieldConfig[] = [
    { type: "text",           name: "label",        label: "Label" },
    { type: "checkbox",       name: "required",     label: "Required" },
    { type: "component", component: DateFormatEditor, name: "format", label: "Date Format" },
    { type: "component", component: TimeFormatEditor, name: "format", label: "Time Format" },
    { type: "divider"},
    { type: "datetime-local", name: "properties.defaultValue", label: "Default Date & Time" },
    { type: "datetime-local", name: "properties.minDate",      label: "Min Date & Time" },
    { type: "datetime-local", name: "properties.maxDate",      label: "Max Date & Time" },
    {
        type: "select",
        name: "properties.timezone",
        label: "Time Zone",
        options: timeZoneOptions,
        placeholder: "(UTC-05:00) America/Chicago", 
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
