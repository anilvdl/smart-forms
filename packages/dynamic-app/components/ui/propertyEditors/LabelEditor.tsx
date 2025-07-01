"use client";
import React from "react";
import PropertiesCard from "./templates/PropertiesCard";
import { FieldConfig } from "./templates/FieldConfig";
// import { AiOutlineAlignLeft, AiOutlineAlignCenter, AiOutlineAlignRight } from "react-icons/ai";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { FormElement } from "store/formStore";
import RichTextEditor from "./formatEditors/RichTextEditor";

interface LabelEditorProps {
  element: FormElement;
  onChange: (el: FormElement) => void;
}

const ALIGN_OPTIONS = [
  { value: "left",   icon: <AlignLeft /> },
  { value: "center", icon: <AlignCenter /> },
  { value: "right",  icon: <AlignRight /> },
];

function RichTextField({ element, onChange }: LabelEditorProps) {
    const p = element.properties!;
    return (
      <RichTextEditor
        value={p.text || ""}
        onChange={(html) =>
          onChange({
            ...element,
            properties: { ...p, text: html },
          })
        }
        readOnly={false}
      />
    );
  }

export default function LabelEditor({ element, onChange }: LabelEditorProps) {
  const p = element.properties || {};

  // Build your fields array dynamically:
  const fields: FieldConfig[] = [
    // If multiLine is unchecked, show a plain text input:
    !p.multiLine && {
      type: "text",
      name: "properties.text",
      label: "Text",
      placeholder: "Enter label text",
    },
    // Show the Multi Line checkbox:
    {
      type: "checkbox",
      name: "properties.multiLine",
      label: "Multi Line",
    },
    // If multiLine is checked, show a rich-text editor component instead:
    p.multiLine && {
      type: "component",
      name:  "properties.text",
      label: "Text",
      component: RichTextField,
    },
    // Common styling fields:
    { type: "divider" },
    {
      type: "number",
      name: "properties.size",
      label: "Font Size (px)",
      placeholder: "16",
      min: 8,
      max: 72,
    },
    !p.multiLine && { type: "checkbox", name: "properties.bold",      label: "Bold"      },
    !p.multiLine && { type: "checkbox", name: "properties.italic",    label: "Italic"    },
    !p.multiLine && { type: "checkbox", name: "properties.underline", label: "Underline" },
    { type: "divider" },
    { type: "color", name: "properties.color", label: "Color" },
    { type: "divider" },
    {
      type: "alignment",
      name: "properties.alignment",
      label: "Alignment",
      options: ALIGN_OPTIONS,
    },
    
  ].filter(Boolean) as FieldConfig[];

  return (
    <PropertiesCard
      title="Label Properties"
      element={element}
      fields={fields}
      onChange={onChange}
    />
  );
}
