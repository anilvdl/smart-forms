"use client";
import React from "react";
import { FormElement } from "store/formStore";
import { FieldConfig } from "./templates/FieldConfig";
import PropertiesCard from "./templates/PropertiesCard";

interface DefaultEditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}

export default function DefaultEditor({ element, onChange }: DefaultEditorProps) {
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
  ];

  return (
    <PropertiesCard
      title="Default Properties"
      element={element}
      fields={fields}
      onChange={onChange}
    />
  );
}