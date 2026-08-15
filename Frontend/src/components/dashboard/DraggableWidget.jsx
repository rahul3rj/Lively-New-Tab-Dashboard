import React, { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { getWidgetCols } from "./gridLayoutSolver.js";

/* ─── Draggable Widget Wrapper Component ─── */
export const DraggableWidget = ({
  id,
  config,
  pos,
  onStartResizeRows,
  onStartResizeCols,
  renderWidget,
}) => {
  const currentRows = config.resizable
    ? Math.max(
        config.minRows,
        Math.min(config.maxRows, pos.rows || config.defaultRows),
      )
    : config.defaultRows;
  const currentCols = getWidgetCols(config, pos);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: !config.draggable,
    });

  const style = {
    gridColumn: `${pos.col} / span ${currentCols}`,
    gridRow: `${pos.row} / span ${currentRows}`,
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 100,
        }
      : {}),
  };

  const dragHandleProps = useMemo(
    () => ({ ...attributes, ...listeners }),
    [attributes, listeners],
  );

  return (
    <div
      ref={setNodeRef}
      className={`grid-widget group/widget ${isDragging ? "grid-widget--dragging" : ""}`}
      style={style}
    >
      {renderWidget(id, dragHandleProps)}

      {/* Bottom Resizable Handle (Height / Rows) */}
      {config.resizable && config.minRows !== config.maxRows && (
        <div
          data-resize-handle
          onPointerDown={(e) => onStartResizeRows(id, e)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/30 hover:bg-white/70 active:bg-white/90 opacity-0 pointer-events-none group-hover/widget:opacity-100 group-hover/widget:pointer-events-auto transition-all duration-200 cursor-ns-resize z-30 flex items-center justify-center group/handle"
          title="Drag down to expand height"
        >
          <div className="w-4 h-0.5 rounded-full bg-white/60 group-hover/handle:bg-white" />
        </div>
      )}

      {/* Right Resizable Handle (Width / Cols) */}
      {config.resizable && (config.minCols ?? config.cols) !== (config.maxCols ?? config.cols) && (
        <div
          data-resize-handle-cols
          onPointerDown={(e) => onStartResizeCols(id, e)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-12 rounded-full bg-white/30 hover:bg-white/70 active:bg-white/90 opacity-0 pointer-events-none group-hover/widget:opacity-100 group-hover/widget:pointer-events-auto transition-all duration-200 cursor-ew-resize z-30 flex items-center justify-center group/handle"
          title="Drag right to expand width"
        >
          <div className="h-4 w-0.5 rounded-full bg-white/60 group-hover/handle:bg-white" />
        </div>
      )}

      {/* Left Resizable Handle (Width / Cols) */}
      {config.resizable && (config.minCols ?? config.cols) !== (config.maxCols ?? config.cols) && (
        <div
          data-resize-handle-cols
          onPointerDown={(e) => onStartResizeCols(id, e, true)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-12 rounded-full bg-white/30 hover:bg-white/70 active:bg-white/90 opacity-0 pointer-events-none group-hover/widget:opacity-100 group-hover/widget:pointer-events-auto transition-all duration-200 cursor-ew-resize z-30 flex items-center justify-center group/handle"
          title="Drag left to expand width"
        >
          <div className="h-4 w-0.5 rounded-full bg-white/60 group-hover/handle:bg-white" />
        </div>
      )}
    </div>
  );
};
