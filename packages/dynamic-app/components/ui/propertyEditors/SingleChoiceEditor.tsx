import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";
import OptionListEditor from "./OptionListEditor";

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function SingleChoiceEditor({ element, onChange }: Props) {
  const fields: FieldConfig[] = [
    { type: "text", name: "label",       label: "Label" },
    { type: "checkbox", name: "required", label: "Required" },
    // { type: "text", name: "defaultValue", label: "Default Selected (value)" },
  ];

  return (
    <>
      <PropertiesCard
        element={element}
        fields={fields}
        onChange={onChange}
      />
       <OptionListEditor element={element} onChange={onChange} />
    </>
  );
}
