import { FormElement } from "store/formStore";

// Draggable "templates" for the Left Panel
export const formElements: FormElement[] = [
    // --- UI/Structural Elements ---
    {
      id: "header",
      type: "header",
      label: "Header",
      placeholder: "Enter your header",
      icon: "header",
      category: "UI / Structural",
    },
    {
      id: "divider",
      type: "divider",
      label: "Divider",
      placeholder: "",
      icon: "divider",
      category: "UI / Structural",
    },
    {
      id: "pageBreak",
      type: "pageBreak",
      label: "Page Break",
      placeholder: "",
      icon: "page-break",
      category: "UI / Structural",
    },

    // --- Basic Text Inputs ---
    {
      id: "shortText",
      type: "text",
      label: "Short Text",
      placeholder: "Enter short text",
      icon: "text",
      category: "Basic Text",
    },
    {
      id: "longText",
      type: "textarea",
      label: "Long Text",
      placeholder: "Enter long text",
      icon: "long-text",
      category: "Basic Text",
    },

    // --- Specialized Text Inputs ---
    {
      id: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      icon: "email",
      category: "Specialized Text",
    },
    {
      id: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter password",
      icon: "password",
      category: "Specialized Text",
    },
    {
      id: "tel",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter phone",
      icon: "tel",
      category: "Specialized Text",
    },
    {
      id: "url",
      type: "url",
      label: "URL",
      placeholder: "Enter URL",
      icon: "url",
      category: "Specialized Text",
    },
    {
      id: "search",
      type: "search",
      label: "Search",
      placeholder: "Search...",
      icon: "search",
      category: "Specialized Text",
    },

    // --- Date & Time Inputs ---
    {
      id: "date",
      type: "date",
      label: "Date",
      placeholder: "",
      icon: "date",
      category: "Date / Time",
    },
    {
      id: "time",
      type: "time",
      label: "Time",
      placeholder: "",
      icon: "time",
      category: "Date / Time",
    },
    {
      id: "dateTime",
      type: "datetime-local",
      label: "Date & Time",
      placeholder: "",
      icon: "date-time",
      category: "Date / Time",
    },

    // --- Numeric & Range ---
    {
      id: "number",
      type: "number",
      label: "Number",
      placeholder: "Enter number",
      icon: "number",
      category: "Numeric / Range",
    },
    {
      id: "range",
      type: "range",
      label: "Range",
      placeholder: "",
      icon: "range",
      category: "Numeric / Range",
    },

    // --- Choice Inputs ---
    {
      id: "singleChoice",
      type: "radio",
      label: "Single Choice",
      placeholder: "",
      icon: "choice",
      category: "Choice Inputs",
    },
    {
      id: "multiChoice",
      type: "checkbox",
      label: "Multi Choice",
      placeholder: "",
      icon: "multi-choice",
      category: "Choice Inputs",
    },
    {
      id: "dropdown",
      type: "select",
      label: "Dropdown",
      placeholder: "",
      icon: "dropdown",
      category: "Choice Inputs",
    },

    // --- File & Media ---
    {
      id: "fileUpload",
      type: "file",
      label: "File Upload",
      placeholder: "",
      icon: "file-upload",
      category: "File / Media",
    },
    {
      id: "colorPicker",
      type: "color",
      label: "Color Picker",
      placeholder: "",
      icon: "color-picker",
      category: "File / Media",
    },
    {
      id: "image",
      type: "img",
      label: "Image",
      placeholder: "",
      icon: "image",
      category: "File / Media",
    },
    {
      id: "video",
      type: "video",
      label: "Video",
      placeholder: "Enter video URL",
      icon: "video",
      category: "File / Media",
    },

    // --- Table & Complex Fields ---
    {
      id: "inputTable",
      type: "table",
      label: "Input Table",
      placeholder: "",
      icon: "table",
      category: "Complex Fields",
    },

    // --- Hidden & Misc ---
    {
      id: "hidden",
      type: "hidden",
      label: "Hidden",
      placeholder: "",
      icon: "hidden",
      category: "Misc",
    },

    // --- Buttons ---
    {
      id: "submit",
      type: "submit",
      label: "Submit",
      placeholder: "",
      icon: "submit",
      category: "Buttons",
    },
    {
      id: "reset",
      type: "reset",
      label: "Reset",
      placeholder: "",
      icon: "reset",
      category: "Buttons",
    },
];

  export const inputTypeMapping: Record<string, string> = {
    // Basic text inputs
    textInput: "text",
    shortText: "text",
    longText: "textarea", // or handle in logic if type is "textarea"
  
    // Specialized text inputs
    email: "email",
    password: "password",
    tel: "tel",
    url: "url",
    search: "search",
  
    // Date & time
    date: "date",
    time: "time",
    dateTime: "datetime-local",
  
    // Numeric & range
    number: "number",
    range: "range",
  
    // Choices
    singleChoice: "radio",
    multiChoice: "checkbox",
    dropdown: "select", // handle "select" logic separately
  
    // File & color
    fileUpload: "file",
    colorPicker: "color",
  
    // Misc
    hidden: "hidden",
    submit: "submit",
    reset: "reset",
    imageInput: "image",
  };