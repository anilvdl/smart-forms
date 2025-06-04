"use client";

import React, { useRef, useCallback } from "react";
import { useDrop } from "react-dnd";
import { FormElement, useFormStore } from "store/formStore";
import CanvasRow from "./CanvasRow";
import Image from "next/image";

export default function Canvas() {
  const {
    canvasElements,
    selectedElementId,
    setSelectedElementId,
    isPreview,
  } = useFormStore();

  // Logo handling (unchanged)
  const logoElement = useFormStore
    .getState()
    .elements.find((el) => el.type === "logo");

  function handleLogoClick() {
    if (logoElement) setSelectedElementId(logoElement.id);
  }

  // Our new insert‐at‐index action
  const insertAt = useFormStore((s) => s.insertCanvasElementAt);

  // Ref to the <ul> of rows
  const listRef = useRef<HTMLUListElement>(null);

  // Attach drop to the wrapper
  const [, drop] = useDrop<FormElement, void, unknown>({
    accept: "FORM_ELEMENT",
    drop: (template, monitor) => {
      if (!listRef.current) return;
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const listRect = listRef.current.getBoundingClientRect();
      // Y relative to the top of the UL
      const y = offset.y - listRect.top;

      // collect all rows
      const rows = Array.from(listRef.current.children) as HTMLElement[];

      // default to appending at end
      let index = rows.length;

      // walk rows, find first midpoint below your cursor
      for (let i = 0; i < rows.length; i++) {
        const { top, height } = rows[i].getBoundingClientRect();
        const mid = (top + height / 2) - listRect.top;
        if (y < mid) {
          index = i;
          break;
        }
      }

      insertAt(template, index);
    },
  });

  // 2) Combine the drop ref and our listRef
  const setListRef = useCallback(
    (el: HTMLUListElement | null) => {
      listRef.current = el;
      drop(el as any);
    },
    [drop]
  );

 // Wrap `drop` in a React.RefCallback so TS is happy
//  const dropRef = useCallback((node: HTMLDivElement | null) => {
//     drop(node);
//   }, [drop]);

  // ── Group consecutive buttons into runs ───────────────────────────────
  const runs: FormElement[][] = [];
  let buf: FormElement[] = [];
  canvasElements.forEach((el) => {
    const isBtn = el.type === "submit" || el.type === "reset";
    if (isBtn) {
      buf.push(el);
    } else {
      if (buf.length) {
        runs.push(buf);
        buf = [];
      }
      runs.push([el]);
    }
  });
  if (buf.length) runs.push(buf);

  return (
    <div className="canvas-container">
      <div className="form-page">
        {/* Logo area */}
        <div
          className={`logo-placeholder ${
            logoElement?.placeholder ? "has-logo" : ""
          }`}
          onClick={handleLogoClick}
          style={{
            border: logoElement?.placeholder ? "none" : "1px dashed #ccc",
          }}
        >
          {logoElement?.placeholder ? (
            <>
              <CanvasLogo
                logoElement={logoElement}
                setSelectedElementId={setSelectedElementId}
              />
            </>
          ) : (
            <button onClick={() => setSelectedElementId(logoElement?.id || null)}>
              + LOGO or IMAGE +
            </button>
          )}
          {logoElement?.properties?.title && (
            <div
              className="logo-title"
              dangerouslySetInnerHTML={{
                __html: logoElement.properties.title as string,
              }}
            />
          )}
        </div>

        {/* DROP TARGET + grouped rendering */}
        <div className="canvas-wrapper">
          <ul ref={setListRef} className="form-section">
            {canvasElements.length === 0 ? (
              <li className="canvas-placeholder">
                <strong>+ Drag & drop elements here from the left panel</strong>
              </li>
            ) : (
              runs.map((run, runIdx) => {
                const allButtons = run.every(
                  (el) => el.type === "submit" || el.type === "reset"
                );

                if (allButtons) {
                  // wrap all buttons in one row
                  return (
                    <li key={`btn-row-${runIdx}`} className="button-row">
                      {run.map((el) => {
                        // find original index for drag/drop
                        const idx = canvasElements.findIndex((x) => x.id === el.id);
                        return (
                          <CanvasRow key={el.id} element={el} index={idx} />
                        );
                      })}
                    </li>
                  );
                }

                // non-button items: one per row
                return run.map((el) => {
                  const idx = canvasElements.findIndex((x) => x.id === el.id);
                  return (
                    <CanvasRow key={el.id} element={el} index={idx} />
                  );
                });
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// CanvasLogo stays the same
function CanvasLogo({
  logoElement,
  setSelectedElementId,
}: {
  logoElement: FormElement;
  setSelectedElementId: (id: string | null) => void;
}) {
  let numericWidth = 100;
  if (
    logoElement.style &&
    typeof logoElement.style.width === "number"
  ) {
    numericWidth = logoElement.style.width;
  }
  const numericHeight = numericWidth;
  return (
    <Image
      src={logoElement.placeholder || ""}
      alt="Logo"
      unoptimized
      width={numericWidth}
      height={numericHeight}
      style={logoElement.style || {}}
      onClick={() => setSelectedElementId(logoElement.id)}
    />
  );
}