import { FormElement } from "store/formStore";
import React from "react";

/** Basic field types we’ll handle in `renderField`. */
export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "checkbox"
  | "slider"
  | "alignment"
  | "divider"
  | "radio"
  | "defaultValue"
  | "minDate"
  | "maxDate"
  | "select"
  | "date"
  | "time"
  | "datetime-local"
  | "color"
  | "email"
  | "url"
  | "number"
  | "timezone"
  | "password"
  | "phone"
  | "file"
  | "hidden"
  | "icon"
  | "logo"
  | "image"
  | "signature"
  | "address"
  | "location"
  | "map"
  | "rating"
  | "multipleChoice"
  | "singleChoice"
  | "dropdown"
  | "multiselect"
  | "multiline"
  | "component"; // for truly custom UI

/** 
 * A union of possible field values 
 * (string|number|boolean|undefined).
 */
export type FieldValue = string | number | boolean | undefined;

/** 
 * For advanced fields like alignment with icons, 
 * we define an optional "options" array.
 */
export interface OptionItem {
  value: string;
  label?: string;
  icon?: React.ReactNode; // e.g. <AiOutlineAlignLeft />
}

/** 
 * FieldConfig describes a single “field” in the card.
 */
export interface FieldConfig {
  type: FieldType;
  // name?: keyof FormElement; 
  name? : string; // name of the field in the form element
  label?: string;
  placeholder?: string;
  min?: number; // for slider
  max?: number;
  step?: number;

  // For alignment or radio-like fields
  options?: OptionItem[];

  // For custom styling or help text
  style?: React.CSSProperties;
  helpText?: string;

  // For "component" type
  // you can pass a React component that receives (element, onChange) or custom props
  component?: React.FC<CustomFieldProps>;

  shouldShow?: (element: FormElement) => boolean;
}

/** 
 * For truly custom fields, 
 * we define a generic shape of props we pass to the custom component.
 */
export interface CustomFieldProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}