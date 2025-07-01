// import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from "react-icons/ai";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";

interface LongTextEditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}

export default function LongTextEditor({ element, onChange }: LongTextEditorProps) {
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
          { value: "left",   icon: <AlignLeft /> },
          { value: "center", icon: <AlignCenter /> },
          { value: "right",  icon: <AlignRight /> },
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