"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { AiOutlineAlignLeft, AiOutlineAlignCenter, AiOutlineAlignRight, AiOutlineCloudUpload, AiOutlineDelete  } from "react-icons/ai";
import { FormElement } from "store/formStore";
import { EditorProps } from "./types";
import ReactQuill from "react-quill";

const LogoEditor: React.FC<EditorProps> = ({ element, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to update the entire element in the store
  const updateElement = (updates: Partial<FormElement>) => {
    onChange({ ...element, ...updates });
  };

  // Handle local file => blob URL => store in placeholder
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    updateElement({ placeholder: fileUrl });
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  // We have a logo if placeholder is set
  const hasLogo = !!element.placeholder;
  //const buttonLabel = hasLogo ? "🗑" : "Upload Logo";

  // If user clicks "Change" => open file dialog
  const handleChangeLogo = () => {
    fileInputRef.current?.click();
  };

  // If user clicks "Remove" => clear placeholder, reset style to default
  const handleRemoveLogo = () => {
    // Create or clone the existing style object
    const newStyle = { ...(element.style || {}) };

    // Reset size to 100
    newStyle.width = 100;

    // Reset alignment to center
    newStyle.display = "block";
    newStyle.marginLeft = "auto";
    newStyle.marginRight = "auto";

    // Update the element: remove placeholder, reset style
    updateElement({ placeholder: "", style: newStyle });

    // Also reset the file input so user can re-upload the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // For size, we store numeric width in element.style.width
  const numericWidth =
    (element.style && typeof element.style.width === "number")
      ? element.style.width
      : 100;

  // Range bounds for slider
  const minSize = 50;
  const maxSize = 200;
  const fraction = (numericWidth - minSize) / (maxSize - minSize);

  // Update size in element.style
  const handleSizeChange = (val: number) => {
    const newStyle = { ...(element.style || {}) };
    newStyle.width = val;
    updateElement({ style: newStyle });
  };

  // Determine alignment from style
  const guessAlignment = (): "left" | "center" | "right" => {
    if (!element.style) return "center";
    if (element.style.marginLeft === "0" && element.style.marginRight === "auto") return "left";
    if (element.style.marginLeft === "auto" && element.style.marginRight === "0") return "right";
    return "center";
  };
  const currentAlignment = guessAlignment();

  // Apply new alignment => marginLeft/marginRight in style
  const applyAlignment = (align: "left" | "center" | "right") => {
    const newStyle = { ...(element.style || {}) };
    newStyle.display = "block"; // needed for margin auto
    newStyle.width = numericWidth;

    if (align === "left") {
      newStyle.marginLeft = "0";
      newStyle.marginRight = "auto";
    } else if (align === "right") {
      newStyle.marginLeft = "auto";
      newStyle.marginRight = "0";
    } else {
      newStyle.marginLeft = "auto";
      newStyle.marginRight = "auto";
    }
    updateElement({ style: newStyle });
  };

  const quillRef = useRef<ReactQuill>(null);
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "bullet" }, { list: "ordered" }],
      ["link"], [{ color: [] }],
    ],
  };
  const formats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "color",
  ];

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

  const handleTitleChange = (
    content: string,
    _delta: any,
    _source: string,
    editor: any
  ) => {
    // Quill’s getText() returns all text plus a trailing "\n"
    const raw = editor.getText();
    // Split on newlines, then drop the last empty entry
    const lines = raw.split("\n").slice(0, -1);
    if (lines.length <= 3) {
      updateElement({
        properties: {
          ...(element.properties || {}),
          title: content,
        },
      });
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header row: Title & hidden file input */}
      <div style={styles.headerRow}>
        <h3 style={styles.cardTitle}>Logo Image</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Row with logo preview + upload/remove button */}
      <div style={styles.logoRow}>
        {hasLogo && (
          <Image
            src={element.placeholder as string}
            alt="Logo Preview"
            unoptimized
            width={50}
            height={50}
            style={styles.logoPreview}
          />
        )}
          {/* If no logo => show Upload button, if logo => show "Change" & "Remove" */}
          {!hasLogo ? (
            <button style={styles.uploadButton} onClick={handleChangeLogo}>
              <AiOutlineCloudUpload style={{ fontSize: "24px", marginRight: "6px" }} />
              Upload
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px"}}>
              <button style={styles.uploadButton} onClick={handleChangeLogo}>
                <AiOutlineCloudUpload style={{ fontSize: "24px", marginRight: "6px" }} />
                Change
              </button>
              <button style={styles.removeButton} onClick={handleRemoveLogo}>
                <AiOutlineDelete style={{ fontSize: "24px", marginRight: "6px" }} />
                Remove
              </button>
            </div>
          )}
      </div>
      <hr style={styles.divider} />
      {/* ─── Title Rich‐Text Editor */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Title</label>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={(element.properties?.title as string) || ""}
          onChange={handleTitleChange}
          modules={modules}
          formats={formats}
          style={{ minHeight: 80, marginTop: 4 }}
        />
        <small
          style={{
            fontStyle: "italic",
            color: "#999",
            marginTop: 4,
            display: "block",
          }}
        >
          Max 3 lines
        </small>
      </div>
      {/* Divider */}
      <hr style={styles.divider} />

      {/* Size Section */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Size</label>
        <div style={{ position: "relative", marginTop: "20px" }}>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            value={numericWidth}
            onChange={(e) => handleSizeChange(parseInt(e.target.value))}
            style={styles.slider}
          />
          <span
            style={{
              ...styles.sliderValue,
              left: `${fraction * 100}%`,
            }}
          >
            {numericWidth}px
          </span>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* Alignment Section with icons */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Alignment</label>
        <div style={styles.alignmentIcons}>
          <IconToggle 
            icon={<AiOutlineAlignLeft />}
            active={currentAlignment === "left"}
            onClick={() => applyAlignment("left")}
          />
          <IconToggle
            icon={<AiOutlineAlignCenter />}
            active={currentAlignment === "center"}
            onClick={() => applyAlignment("center")}
          />
          <IconToggle
            icon={<AiOutlineAlignRight />}
            active={currentAlignment === "right"}
            onClick={() => applyAlignment("right")}
          />
        </div>
      </div>
       {/* Divider */}
       <hr style={styles.divider} />
       {/* <PropertiesCard
          element={element}
          fields={fields}
          onChange={onChange}
        /> */}
    </div>
  );
};

/**
 * A small toggle button for alignment icons
 */
function IconToggle({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#007bff" : "#f0f0f0",
        color: active ? "#fff" : "#333",
        border: "none",
        borderRadius: 4,
        padding: "6px 10px",
        marginRight: 8,
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}

/**
 * Centralized style definitions
 */
const styles: Record<string, React.CSSProperties> = {
  cardContainer: {
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "16px",
    marginBottom: "16px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    margin: 0,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  logoPreview: {
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  uploadButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "3px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  removeButton: {
    background: "#dc3545", // red
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "3px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "12px 0",
  },
  section: {
    marginBottom: "12px",
  },
  sectionLabel: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  slider: {
    width: "100%",
    cursor: "ew-resize",
    WebkitAppearance: "none",
    height: "6px",
    borderRadius: "6px",
    background: "#ddd",
    outline: "none",
  },
  sliderValue: {
    position: "absolute",
    transform: "translateX(-50%)",
    top: "-20px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
  },
  alignmentIcons: {
    display: "flex",
    alignItems: "center",
  },
};

export default LogoEditor;