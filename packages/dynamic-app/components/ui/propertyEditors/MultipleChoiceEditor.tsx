import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";
import OptionListEditor from "./OptionListEditor";

interface Props {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

export default function MultipleChoiceEditor({ element, onChange }: Props) {
  const fields: FieldConfig[] = [
    { type: "text",     name: "label",    label: "Label" },
    { type: "checkbox", name: "required", label: "Required" },
    // defaultValue for multiple could be a comma-separated list of values if desired
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
