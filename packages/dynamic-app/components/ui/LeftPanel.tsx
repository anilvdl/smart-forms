import { useDrag } from "react-dnd";
import { FormElement, useFormStore, usePanelStore } from "store/formStore";
import Image from "next/image";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { Icons } from "@smartforms/shared/icons";

/** 
 * Group elements by category.
 */
function groupByCategory(elements: FormElement[]): Record<string, FormElement[]> {
  const map: Record<string, FormElement[]> = {};
  for (const el of elements) {
    const cat = el.category || "Others";
    if (!map[cat]) map[cat] = [];
    map[cat].push(el);
  }
  return map;
}

/** Draggable element for each item. */
function DraggableElement  ({ item }: { item: FormElement }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FORM_ELEMENT",
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  return (
    <div
      ref={(node) => {drag(node);}}
      className={`draggable-item ${isDragging ? "dragging" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Image
        src={Icons[item.icon]}
        alt={item.label || "form element"}
        width={50}
        height={50}
      />
      <span style={{fontSize: "15px"}}>{item.label}</span>
    </div>
  );
};

const LeftPanel: React.FC = () => {
  const { isLeftPanelCollapsed, toggleLeftPanel } = usePanelStore();

  const [searchTerm, setSearchTerm] = useState("");
  const { elements: formElements } = useFormStore.getState();

  // Filter by search
  const filtered = formElements.filter(
    (el) =>
      !(el.notInPanel === undefined ? false : el.notInPanel) &&  
      (el.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by category
  const grouped = groupByCategory(filtered);
  const categories = Object.keys(grouped).sort();

  // Collapsible state per category
  const [collapsedCats, ] = useState<Record<string, boolean>>({});

  // const toggleCategory = (cat: string) => {
  //   setCollapsedCats((prev) => ({
  //     ...prev,
  //     [cat]: !prev[cat],
  //   }));
  // };

  return (
    <div className={`left-panel ${isLeftPanelCollapsed ? "collapsed" : ""}`}>
      <div className="panel-header">
        <span>Form Elements</span>
        {isLeftPanelCollapsed ? (
          <button
            className="expand-btn"
            onClick={toggleLeftPanel}
            title="Open"
          >
            ＋
          </button>
        ) : (
          <button
            className="collapse-btn"
            onClick={toggleLeftPanel}
            title="Close"
          >
            X
          </button>
        )}
      </div>

      {/* Only show panel content if not collapsed */}
      {!isLeftPanelCollapsed && (
        <div className="panel-content">
          {/* Search box */}
          <div className="search-box">
            {searchTerm ? (
              <span className="search-icon" onClick={() => setSearchTerm("")}>
                <AiOutlineClose  style={{fontSize:"14px"}}/>
              </span>
            ) : (
              <span className="search-icon">
                <AiOutlineSearch />
              </span>
            )}
            <input
              type="text"
              placeholder="search elements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* For each category => a "card" container */}
          {categories.map((cat) => {
            const isCollapsed = collapsedCats[cat] || false;
            return (
              <div key={cat} className="category-card">
                <div
                  className="category-card-header"
                  // onClick={() => toggleCategory(cat)}
                >
                  <span style={{cursor:"default"}}>{cat}</span>
                  {/* Show arrow or plus/minus icon */}
                  {/* <span className="category-toggle-icon">
                    {isCollapsed ? "▶" : "▼"}
                  </span> */}
                </div>
                {!isCollapsed && (
                  <div className="category-card-content">
                    {grouped[cat].map((item) => (
                      <DraggableElement key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeftPanel;