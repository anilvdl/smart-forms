"use client";
import CustomDatePicker from "components/custom/CustomDatePicker";
import CustomDateTimePicker from "components/custom/CustomDateTimePicker";
import CustomInput from "components/custom/CustomInput";
import CustomTimePicker from "components/custom/CustomTimePicker";
import React from "react";
import { FormElement } from "store/formStore";

export type RenderMode = "design" | "preview";

interface Props {
  element: FormElement;
  mode: RenderMode;
}

export default function FieldRenderer({ element, mode }: Props) {
  const disabled = mode === "design";
  const dv = mode === "preview" ? element.properties?.defaultValue || "" : "";

  // shared label
  const label = (
    <label htmlFor={element.id} style={{ fontWeight: "bold", marginBottom: 4 }}>
      {element.label}
      {element.required && <span style={{ color: "red" }}> *</span>}
    </label>
  );

  switch (element.type) {
    case "label": {
      const p = element.properties || {};

      // build the common style object
      const style: React.CSSProperties = {
        color:          p.color,
        fontSize:       `${p.size}px`,
        textAlign:      ["left", "center", "right", "justify"].includes(p.alignment ?? "")
                          ? (p.alignment as "left" | "center" | "right" | "justify")
                          : undefined,
        fontWeight:     p.bold      ? "bold"      : "normal",
        fontStyle:      p.italic    ? "italic"    : "normal",
        textDecoration: p.underline ? "underline" : "none",
        width:          "100%",
        margin:         p.multiLine ? "8px 0"     : undefined,
      };

      // If multiLine is checked, render the HTML stored in p.text
      if (p.multiLine) {
        return (
          <div
            id={element.id}
            style={style}
            className={`rich-text-content align-${p.alignment}`}
            dangerouslySetInnerHTML={{ __html: p.text || "" }}
          />
        );
      }

      // Single-line fallback
      return (
        <div id={element.id} style={style}>
          {p.text}
        </div>
      );
    }

    case "text":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label}
          <input
            id={element.id}
            name={element.id}
            type="text"
            disabled={disabled}
            placeholder={element.placeholder}
            defaultValue={dv}
            required={element.required}
            style={{ width: 200,  marginTop: 4, padding: 4 }}
          />
          {element.charLimitEnabled && (
            <small style={{ fontStyle: "italic", color: "#999"}}>
              {`Allowed chars: min ${element.minChars ?? 0}, max ${element.maxChars ?? ""}`}
            </small>
          )}
        </div>
      );

    case "textarea":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label}
          <textarea
            id={element.id}
            name={element.id}
            disabled={disabled}
            placeholder={element.placeholder}
            defaultValue={dv}
            required={element.required}
            rows={4}
            style={{ width: 250, height: disabled ? 80 : 100, marginTop: 4, resize: disabled ? "none" : "both", padding: 4}}
          />
          {element.charLimitEnabled && (
            <small style={{ fontStyle: "italic", color: "#999"}}>
              {`Allowed chars: min ${element.minChars ?? 0}, max ${element.maxChars ?? ""}`}
            </small>
          )}
        </div>
      );

    case "select":
      return (
        <div style={{ display: "flex", flexDirection: "column", width: 200 }}>
          {label}
          <select
            id={element.id}
            name={element.id}
            disabled={disabled}
            required={element.required}
            defaultValue={dv}
            style={{ width: 200,  marginTop: 4, padding: 4 }}
          >
            <option value="" disabled>
              {element.placeholder || "Select…"}
            </option>
            {element.properties?.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div style={{ display: "flex", flexDirection: "column", width: 200 }}>
          {label}
          {element.properties?.options?.map((o) => (
            <label key={o.value} style={{ marginTop: 4 }}>
              <input
                type="radio"
                name={element.id}
                disabled={disabled}
                value={o.value}
                defaultChecked={mode === "preview" && dv === o.value}
              />{" "}
              {o.label}
            </label>
          ))}
        </div>
      );

    case "checkbox":
      const vals = dv.split(",");
      return (
        <div style={{ display: "flex", flexDirection: "column", width: 200 }}>
          {label}
          {element.properties?.options?.map((o) => (
            <label key={o.value} style={{ marginTop: 4 }}>
              <input
                type="checkbox"
                name={element.id}
                disabled={disabled}
                value={o.value}
                defaultChecked={mode === "preview" && vals.includes(o.value)}
              />{" "}
              {o.label}
            </label>
          ))}
        </div>
      );

    case "date":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label}
          {mode === "design" ? (
            <CustomInput
              value={element.properties?.defaultValue || ""}
              placeholder={element.properties?.format || "yyyy-MM-dd"}
              icon={<span />}
            />
          ) : (
            <CustomDatePicker
              formatString={element.properties?.format!}
              defaultValue={dv}
              onChange={() => {}}
            />
          )}
        </div>
      );

    case "time":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label}
          {mode === "design" ? (
            <CustomInput
              value={element.properties?.defaultValue || ""}
              placeholder={element.properties?.format || "HH:mm"}
              icon={<span />}
            />
          ) : (
            <CustomTimePicker
              formatString={element.properties?.format!}
              defaultValue={dv}
              onChange={() => {}}
            />
          )}
        </div>
      );

    case "datetime-local":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label}
          {mode === "design" ? (
            <CustomInput
              value={element.properties?.defaultValue || ""}
              placeholder={element.properties?.format!}
              icon={<span />}
            />
          ) : (
            <CustomDateTimePicker
              formatString={element.properties?.format!}
              defaultValue={dv}
              onChange={() => {}}
            />
          )}
        </div>
      );

    case "submit":
      return (
        <button
          type={mode === "preview" ? "submit" : undefined}
          disabled={mode === "design"}
          style={{  marginTop: 4, padding: 4, width: 100 }}
        >
          {element.label}
        </button>
      );

    case "reset":
      return (
        <button
          type={mode === "preview" ? "reset" : undefined}
          disabled={mode === "design"}
          style={{  marginTop: 4, padding: 4, width: 100 }}
        >
          {element.label}
        </button>
      );

    default:
      return <span>{element.label}</span>;
  }
}
