import { FormElement } from "store/formStore";

export interface EditorProps {
  element: FormElement;
  onChange: (updated: FormElement) => void;
}