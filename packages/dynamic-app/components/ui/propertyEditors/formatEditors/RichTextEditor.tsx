import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}

export default function RichTextEditor({ value, onChange, readOnly }: Props) {

  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    const root = quillRef.current?.getEditor().root?.parentNode; 
    if (!root) return;
    const map = {
      "ql-bold":      "Bold",
      "ql-italic":    "Italic",
      "ql-underline": "Underline",
      "ql-list[value=bullet]":  "Bullet List",
      "ql-list[value=ordered]": "Numbered List",
      "ql-link":      "Insert Link",
      "ql-color":     "Text Color",
    };
    Object.entries(map).forEach(([selector, title]) => {
      const btn = root.querySelector(selector);
      if (btn) btn.setAttribute("title", title);
    });
  }, []);
    
  return (
    <ReactQuill
      theme="snow"
      ref={quillRef}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      modules={{
        toolbar: readOnly
          ? false
          : [
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"], [{ color: [] }]
            ],
      }}
      formats={[
        "bold",
        "italic",
        "underline",
        "list",
        "bullet",
        "link",
        "color",
      ]}
      style={{ height: readOnly ? "auto" : 200 }}
    />
  );
}
