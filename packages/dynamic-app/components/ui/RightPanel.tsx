import React from "react";
import { FormElement, useFormStore, usePanelStore } from "store/formStore";
import allPropertiesEditorsMap from "./propertyEditors/propertyEditorsMap";

const RightPanel: React.FC = () => {
  const { canvasElements, selectedElementId, updateCanvasElement } = useFormStore();

  let selectedElement = canvasElements.find((el) => el.id === selectedElementId ) || null;

  // logic for logo click as this element is not in the canvasElements
  if (selectedElement === null) {
    selectedElement = useFormStore.getState().elements.find((el) => el.id === selectedElementId) || null;
  }

  const { isRightPanelCollapsed, toggleRightPanel, } = usePanelStore();
  // A map of type => Editor component
  const  editorMap = allPropertiesEditorsMap;
  const EditorComponent = selectedElement ? (editorMap[selectedElement.type] || editorMap.default) : editorMap.default;
  
  const onChange = (updated: FormElement) => {
    console.log("RightPanel->onChange->updated: ", updated);
    if(updated.type === "logo") {
      useFormStore.getState().updateElement(updated);
    } else {
      updateCanvasElement(updated);
    }
  };

  function capitalizeWords(str: string) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div className={`right-panel ${isRightPanelCollapsed ? "collapsed" : ""}`}>
      <div className="panel-header">
        <span>
            {capitalizeWords(selectedElement?.label || selectedElement?.type || "").concat(" Properties Editor").trim()}
        </span>
        {isRightPanelCollapsed ? (
          <button
            className="expand-btn"
            onClick={toggleRightPanel}
            title="Open"
          >
            ＋
          </button>
        ) : (
          <button
            className="collapse-btn"
            onClick={toggleRightPanel}
            title="Close"
          >
            X
          </button>
        )}
      </div>
      <div className="panel-content">
        {!selectedElement ? (
            <p className="panel-empty-state">Select an element to edit its properties.</p>
          ) : (
            <EditorComponent element={selectedElement} onChange={onChange} />
          )}
      </div>
    </div>
  );
};

export default RightPanel;