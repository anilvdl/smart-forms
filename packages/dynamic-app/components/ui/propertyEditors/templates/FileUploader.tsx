"use client";
import React, { useRef } from "react";
import { CustomFieldProps } from "./FieldConfig";
import Image from "next/image";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import { FormElement } from "store/formStore";

export default function ImageFileUploader({ element, onChange }: CustomFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if we have an image already
  const hasImage = !!element.placeholder;

  // Helper to update the element
  const updateElement = (updates: Partial<FormElement>) => {
    onChange({ ...element, ...updates });
  };

  // When a file is selected, convert to blob URL and update placeholder
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    updateElement({ placeholder: fileUrl });
    // Reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  // Open the file dialog
  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  // Remove the image and reset style
  const handleRemoveImage = () => {
    const newStyle = { ...(element.style || {}) };
    newStyle.width = 100;
    newStyle.display = "block";
    newStyle.marginLeft = "auto";
    newStyle.marginRight = "auto";
    updateElement({ placeholder: "", style: newStyle });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {element.label && <label className="field-label">{element.label}</label>}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {hasImage && (
          <Image
            key={element.placeholder} // force re-render when URL changes
            src={element.placeholder as string}
            alt="Preview"
            unoptimized
            width={50}
            height={50}
            style={{ border: "1px solid #ccc" }}
          />
        )}
        {!hasImage ? (
          <button style={styles.uploadButton} onClick={handleChangeImage}>
            <AiOutlineCloudUpload style={{ fontSize: "24px", marginRight: "6px" }} />
            Upload
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={styles.uploadButton} onClick={handleChangeImage}>
              <AiOutlineCloudUpload style={{ fontSize: "24px", marginRight: "6px" }} />
              Change
            </button>
            <button style={styles.removeButton} onClick={handleRemoveImage}>
              <AiOutlineDelete style={{ fontSize: "24px", marginRight: "6px" }} />
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageFileChange}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  uploadButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "3px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "3px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
  },
};