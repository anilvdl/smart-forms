"use client";
import React, { useRef } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { useFormStore, FormElement } from "store/formStore";
// import { AiFillDelete } from "react-icons/ai";
import { Trash } from "lucide-react"
import FieldRenderer from "components/core/FieldRenderer";

interface CanvasRowProps {
  element: FormElement;
  index: number;
}
interface DragItem { id: string; index: number; }

export default function CanvasRow({ element, index }: CanvasRowProps) {
  const moveEl             = useFormStore(s => s.moveCanvasElement);
  const removeEl           = useFormStore(s => s.removeCanvasElement);
  const setSelectedElement = useFormStore(s => s.setSelectedElementId);
  const selectedId         = useFormStore(s => s.selectedElementId);
  const isSelected         = selectedId === element.id;
  const ref                = useRef<HTMLLIElement>(null);

  // determine if this is a button-type element
  const isButton = element.type === "submit" || element.type === "reset";

  // 1) Drag source
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: "CANVAS_ITEM",
    item: { id: element.id, index },
    collect: m => ({ isDragging: m.isDragging() }),
  });

  // 2) Drop target for reorder
  const [, drop] = useDrop<DragItem, void, {}>({
    accept: "CANVAS_ITEM",
    hover(item, monitor: DropTargetMonitor<DragItem>) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const { top, bottom } = ref.current.getBoundingClientRect();
      const hoverMiddleY = (bottom - top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveEl(item.id, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <li 
      ref={ref}
      className={`form-field${isButton ? " button-item" : ""}${isSelected ? " selected" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => {setSelectedElement(element.id);}}
    >
      {/* {renderDesignElement(element)} */}
      <FieldRenderer element={element} mode="design" />
 
      {isSelected && (
        <button
          className="row-delete-btn"
          onClick={e => {
            e.stopPropagation();
            removeEl(element.id);
          }}
          title="Delete this field"
        >
          <Trash style={{alignItems: "center"}} size={25} />
        </button>
      )}
    </li>
  );
}