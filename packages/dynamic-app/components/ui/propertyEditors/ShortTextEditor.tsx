"use client";
import PropertiesCard from "./templates/PropertiesCard";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from "react-icons/ai";

interface ShortTextEditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}

export default function ShortTextEditor({ element, onChange }: ShortTextEditorProps) {
  const fields: FieldConfig[] = [
    {
      type: "text",
      name: "label",
      label: "Label",
      placeholder: "Start typing..",
    },
    {
      type: "text",
      name: "placeholder",
      label: "Placeholder",
      placeholder: "Enter short text",
    },
    {
      type: "checkbox",
      name: "required",
      label: "Required",
    },
    { type: "divider" },
    {
      type: "checkbox",
      name: "charLimitEnabled",
      label: "Character Limit",
      helpText: "Toggle min/max character constraints",
    },
    // The next two fields appear conditionally if charLimitEnabled is true
    {
      type: "text",
      name: "minChars",
      label: "Minimum",
      placeholder: "0",
      // We'll add a small custom function in the "renderField" or "PropertiesCard"
      // to hide this field if !charLimitEnabled. Or we can do it in the FieldConfig logic.
      // For now, we define a "shouldShow" property:
      shouldShow: (element: FormElement) => !!element.charLimitEnabled,
      helpText: "Minimum allowed characters",
    },
    {
      type: "text",
      name: "maxChars",
      label: "Maximum",
      placeholder: "0",
      shouldShow: (element: FormElement) => !!element.charLimitEnabled,
      helpText: "Maximum allowed characters",
    },
    { type: "divider" },
    {
      type: "alignment",
      name: "alignment",
      label: "Alignment",
      options: [
        { value: "left", icon: <AiOutlineAlignLeft /> },
        { value: "center", icon: <AiOutlineAlignCenter /> },
        { value: "right", icon: <AiOutlineAlignRight /> },
      ],
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