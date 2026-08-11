import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
} from "@dnd-kit/core";
import Timmer from "./Timmer";
import WaterReminder from "./WaterReminder";
import Todo from "./Todo";
import Clock from "./Clock";
import ImportantTabs from "./ImportantTabs";
import StreakGrid from "./StreakGrid";
import SongPlayer from "./SongPlayer";
import TimeBoxing from "./TimeBoxing";
import { storageGet, storageSet } from "../utils/storage.js";

/* ─── Grid Configuration & Responsive Helpers ─── */
/* ─── Grid Configuration & Responsive Helpers ─── */
const MIN_GRID_ROWS = 6;

const WIDGET_CONFIGS_LAPTOP = {
  timer: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  waterReminder: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  todo: {
    cols: 3,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  importantTabs: {
    cols: 3,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  streakGrid: {
    cols: 11,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  songPlayer: {
    cols: 5,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  timeBoxing: {
    cols: 4,
    defaultRows: 4,
    minRows: 4,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  // clock: {
  //   cols: 3,
  //   defaultRows: 2,
  //   minRows: 2,
  //   maxRows: 2,
  //   resizable: false,
  //   draggable: false,
  // },
};

const WIDGET_CONFIGS_DESKTOP = {
  timer: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  waterReminder: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  todo: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  importantTabs: {
    cols: 3,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  streakGrid: {
    cols: 11,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  songPlayer: {
    cols: 4,
    defaultRows: 2,
    minRows: 2,
    maxRows: 2,
    resizable: false,
    draggable: true,
  },
  timeBoxing: {
    cols: 5,
    defaultRows: 6,
    minRows: 6,
    maxRows: 8,
    resizable: true,
    draggable: true,
  },
  // clock: {
  //   cols: 4,
  //   defaultRows: 2,
  //   minRows: 2,
  //   maxRows: 2,
  //   resizable: false,
  //   draggable: false,
  // },
};

const getWidgetConfigs = (tier) =>
  tier === "desktop" ? WIDGET_CONFIGS_DESKTOP : WIDGET_CONFIGS_LAPTOP;

/* ─── Device Tier Breakpoints & Default Positions ─── */
const getDeviceTier = (width) => {
  if (typeof window === "undefined") return "laptop";
  const w = width ?? window.innerWidth;
  return w >= 1600 ? "desktop" : "laptop";
};

const DEFAULT_POSITIONS_LAPTOP = {
  timer: { col: 1, row: 1, rows: 2 },
  waterReminder: { col: 1, row: 3, rows: 2 },
  // clock: { col: 1, row: 5, rows: 2 },
  todo: { col: 5, row: 1, rows: 2 },
  importantTabs: { col: 8, row: 1, rows: 2 },
  songPlayer: { col: 5, row: 3, rows: 2 },
  timeBoxing: { col: 12, row: 1, rows: 4 },
  streakGrid: { col: 5, row: 5, rows: 2 },
};

const DEFAULT_POSITIONS_DESKTOP = {
  timer: { col: 1, row: 1, rows: 2 },
  waterReminder: { col: 1, row: 3, rows: 2 },
  // clock: { col: 1, row: 5, rows: 2 },
  todo: { col: 5, row: 1, rows: 2 },
  importantTabs: { col: 9, row: 1, rows: 2 },
  songPlayer: { col: 5, row: 3, rows: 2 },
  timeBoxing: { col: 17, row: 1, rows: 4 },
  streakGrid: { col: 5, row: 5, rows: 3 },
};

const getDefaultPositions = (tier) =>
  tier === "desktop" ? DEFAULT_POSITIONS_DESKTOP : DEFAULT_POSITIONS_LAPTOP;

const getStorageKeyForTier = (tier) => `settings_widget_positions_v7_${tier}`;

/* Calculate columns & rows dynamically based on window size */
const getDynamicGridSize = (tier = getDeviceTier()) => {
  if (typeof window === "undefined") {
    const minCols = tier === "desktop" ? 16 : 15;
    return { cols: minCols, rows: MIN_GRID_ROWS };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const minCols = tier === "desktop" ? 16 : 15;
  const cols = Math.max(minCols, Math.floor((width - 32) / 80));
  return {
    cols,
    rows: Math.max(MIN_GRID_ROWS, Math.floor((height - 96) / 100)),
  };
};

const clampPositionsToGrid = (
  posMap,
  gridCols,
  gridRows,
  widgetConfigs = WIDGET_CONFIGS_LAPTOP,
) => {
  const result = { ...posMap };
  for (const [id, pos] of Object.entries(result)) {
    const cfg = widgetConfigs[id];
    if (!cfg || typeof pos?.col !== "number" || typeof pos?.row !== "number")
      continue;
    const itemCols = cfg.cols;
    const itemRows = cfg.resizable
      ? Math.max(
          cfg.minRows,
          Math.min(cfg.maxRows, pos.rows || cfg.defaultRows),
        )
      : cfg.defaultRows;

    const clampedCol = Math.max(1, Math.min(gridCols - itemCols + 1, pos.col));
    const clampedRow = Math.max(1, Math.min(gridRows - itemRows + 1, pos.row));

    result[id] = {
      ...pos,
      col: clampedCol,
      row: clampedRow,
      rows: itemRows,
    };
  }
  return result;
};

/* ─── Storage Keys ─── */
const STORAGE_KEY = "settings_widget_positions_v7";
const STORAGE_KEY_V5 = "settings_widget_positions_v5";

/* ─── Collision Helpers ─── */

/** True when two axis-aligned grid rectangles share at least one cell */
const rectsOverlap = (aCol, aRow, aCols, aRows, bCol, bRow, bCols, bRows) =>
  !(
    aCol + aCols <= bCol ||
    bCol + bCols <= aCol ||
    aRow + aRows <= bRow ||
    bRow + bRows <= aRow
  );

/** Can `widgetId` be placed at (col, row) with (cols, rows) without going OOB or colliding? */
const canPlace = (
  widgetId,
  col,
  row,
  positions,
  activeWidgets,
  gridCols,
  gridRows,
  customRows = null,
  widgetConfigs = WIDGET_CONFIGS_LAPTOP,
) => {
  const cfg = widgetConfigs[widgetId];
  if (!cfg) return false;
  const currentPos = positions[widgetId];
  const itemRows = customRows || currentPos?.rows || cfg.defaultRows || 1;

  if (
    col < 1 ||
    row < 1 ||
    col + cfg.cols - 1 > gridCols ||
    row + itemRows - 1 > gridRows
  )
    return false;

  for (const [id, pos] of Object.entries(positions)) {
    if (id === widgetId || !activeWidgets[id] || !pos || typeof pos?.col !== "number" || typeof pos?.row !== "number") continue;
    const oc = widgetConfigs[id];
    const oRows = pos.rows || oc?.defaultRows || 1;
    if (
      oc &&
      rectsOverlap(
        col,
        row,
        cfg.cols,
        itemRows,
        pos.col,
        pos.row,
        oc.cols,
        oRows,
      )
    )
      return false;
  }
  return true;
};

/** Convert initial bounding rect + delta → 1-indexed grid cell */
const cellFromTranslatedRect = (
  initialRect,
  delta,
  widgetId,
  gridEl,
  gridCols,
  gridRows,
  itemRows = null,
  widgetConfigs = WIDGET_CONFIGS_LAPTOP,
) => {
  if (!gridEl || !initialRect || !delta) return null;
  const cfg = widgetConfigs[widgetId];
  if (!cfg) return null;
  const gridRect = gridEl.getBoundingClientRect();
  if (gridRect.width <= 0 || gridRect.height <= 0) return null;

  const currentLeft = initialRect.left + delta.x;
  const currentTop = initialRect.top + delta.y;

  const relLeft = currentLeft - gridRect.left;
  const relTop = currentTop - gridRect.top;
  const cellWidth = gridRect.width / gridCols;
  const cellHeight = gridRect.height / gridRows;

  const activeItemRows = itemRows || cfg.defaultRows || 2;

  const targetCol = Math.min(
    gridCols - cfg.cols + 1,
    Math.max(1, Math.round(relLeft / cellWidth) + 1),
  );
  const targetRow = Math.min(
    gridRows - activeItemRows + 1,
    Math.max(1, Math.round(relTop / cellHeight) + 1),
  );

  return { col: targetCol, row: targetRow };
};

/* ─── Draggable Widget Wrapper Component ─── */
const DraggableWidget = ({ id, config, pos, onStartResize, renderWidget }) => {
  const currentRows = config.resizable
    ? Math.max(
        config.minRows,
        Math.min(config.maxRows, pos.rows || config.defaultRows),
      )
    : config.defaultRows;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: !config.draggable,
    });

  const style = {
    gridColumn: `${pos.col} / span ${config.cols}`,
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
      className={`grid-widget ${isDragging ? "grid-widget--dragging" : ""}`}
      style={style}
    >
      {renderWidget(id, dragHandleProps)}

      {/* Bottom Resizable Handle */}
      {config.resizable && (
        <div
          data-resize-handle
          onPointerDown={(e) => onStartResize(id, e)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/20 hover:bg-white/60 active:bg-white/90 transition-all cursor-ns-resize z-30 flex items-center justify-center group"
          title="Drag down to expand height"
        >
          <div className="w-4 h-0.5 rounded-full bg-white/50 group-hover:bg-white" />
        </div>
      )}
    </div>
  );
};

/* ─── DashboardGrid Component ─── */

const DashboardGrid = ({
  showTimer = true,
  showTodo = true,
  showStreakGrid = true,
  showSongPlayer = true,
  showWaterReminder = true,
  showImportantTabs = true,
  showTimeBoxing = true,
  importantTabsConfig,
  timeBoxingGroups,
  onTimeBoxingGroupsChange,
  songPlaylistUrl,
  songAutoPlay,
  songCustomVideo,
  lofiStations,
  waterGoalMl,
  streakDataSource = "local",
  githubUsername = "",
}) => {
  const gridRef = useRef(null);
  const [deviceTier, setDeviceTier] = useState(() => getDeviceTier());
  const widgetConfigs = useMemo(
    () => getWidgetConfigs(deviceTier),
    [deviceTier],
  );

  const [positions, setPositions] = useState(() =>
    clampPositionsToGrid(
      getDefaultPositions(getDeviceTier()),
      getDynamicGridSize(getDeviceTier()).cols,
      getDynamicGridSize(getDeviceTier()).rows,
      getWidgetConfigs(getDeviceTier()),
    ),
  );
  const [ghostInfo, setGhostInfo] = useState(null);
  const [{ cols: gridCols, rows: gridRows }, setGridSize] = useState(() =>
    getDynamicGridSize(getDeviceTier()),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  /* Window resize listener: updates grid size & device tier (Laptop vs Desktop) */
  useEffect(() => {
    const handleResize = () => {
      const newTier = getDeviceTier();
      const newGrid = getDynamicGridSize(newTier);
      setGridSize(newGrid);
      setDeviceTier((prevTier) => (prevTier !== newTier ? newTier : prevTier));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hydratedRef = useRef(false);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const activeWidgets = useMemo(() => {
    const w = {};
    if (showTimer) w.timer = true;
    if (showTodo) w.todo = true;
    if (showStreakGrid) w.streakGrid = true;
    if (showSongPlayer) w.songPlayer = true;
    if (showWaterReminder) w.waterReminder = true;
    if (showImportantTabs) w.importantTabs = true;
    if (showTimeBoxing) w.timeBoxing = true;
    return w;
  }, [showTimer, showTodo, showStreakGrid, showSongPlayer, showWaterReminder, showImportantTabs, showTimeBoxing]);

  const activeRef = useRef(activeWidgets);
  activeRef.current = activeWidgets;

  /* ── Hydrate from storage per Device Tier (Laptop vs Desktop) ── */
  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;
    (async () => {
      try {
        const tierKey = getStorageKeyForTier(deviceTier);
        let stored = await storageGet(tierKey);
        let isV5 = false;

        if (!stored || typeof stored !== "object") {
          const universalV6 = await storageGet(STORAGE_KEY);
          if (universalV6 && typeof universalV6 === "object") {
            stored = universalV6;
          } else {
            const v5stored = await storageGet(STORAGE_KEY_V5);
            if (v5stored && typeof v5stored === "object") {
              stored = v5stored;
              isV5 = true;
            }
          }
        }

        if (cancelled) return;
        const defaults = getDefaultPositions(deviceTier);
        const currentConfigs = getWidgetConfigs(deviceTier);

        if (stored && typeof stored === "object") {
          setPositions((prev) => {
            const merged = { ...defaults };
            for (const [id, pos] of Object.entries(stored)) {
              if (
                currentConfigs[id] &&
                typeof pos?.col === "number" &&
                typeof pos?.row === "number"
              ) {
                if (isV5) {
                  merged[id] = {
                    ...merged[id],
                    col: (pos.col - 1) * 2 + 1,
                    row: (pos.row - 1) * 2 + 1,
                    rows: (typeof pos?.rows === "number" ? pos.rows : 1) * 2,
                  };
                } else {
                  const cfg = currentConfigs[id];
                  const validRows = cfg.resizable
                    ? Math.max(
                        cfg.minRows,
                        Math.min(
                          cfg.maxRows,
                          typeof pos?.rows === "number"
                            ? pos.rows
                            : cfg.defaultRows,
                        ),
                      )
                    : cfg.defaultRows;

                  merged[id] = {
                    ...merged[id],
                    col: pos.col,
                    row: pos.row,
                    rows: validRows,
                  };
                }
              }
            }
            return clampPositionsToGrid(
              merged,
              gridCols,
              gridRows,
              currentConfigs,
            );
          });
        } else {
          setPositions(
            clampPositionsToGrid(defaults, gridCols, gridRows, currentConfigs),
          );
        }
      } catch (err) {
        console.error("DashboardGrid hydration error:", err);
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deviceTier, gridCols, gridRows]);

  /* ── Persist on change per Device Tier ── */
  useEffect(() => {
    if (!hydratedRef.current) return;
    const tierKey = getStorageKeyForTier(deviceTier);
    storageSet(tierKey, positions);
  }, [positions, deviceTier]);

  /* ── Vertical Resizing Logic ── */
  const handleStartResize = useCallback(
    (widgetId, e) => {
      e.preventDefault();
      e.stopPropagation();

      const widgetEl = e.currentTarget.closest(".grid-widget");
      if (!widgetEl || !gridRef.current) return;
      const widgetRect = widgetEl.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      const cellHeight = gridRect.height / gridRows;

      const onMove = (moveEv) => {
        const currentY = moveEv.clientY;
        const relY = currentY - widgetRect.top;
        const cfg = widgetConfigs[widgetId];
        const targetRows = Math.max(
          cfg.minRows,
          Math.min(cfg.maxRows, Math.max(1, Math.round(relY / cellHeight))),
        );

        const currentPos = positionsRef.current[widgetId];
        if (
          currentPos &&
          canPlace(
            widgetId,
            currentPos.col,
            currentPos.row,
            positionsRef.current,
            activeRef.current,
            gridCols,
            gridRows,
            targetRows,
            widgetConfigs,
          )
        ) {
          setPositions((prev) => ({
            ...prev,
            [widgetId]: { ...prev[widgetId], rows: targetRows },
          }));
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [gridCols, gridRows, widgetConfigs],
  );

  /* ── Drag Event Handlers ── */
  const handleDragStart = (event) => {
    const { active, delta } = event;
    if (!active) return;
    const cfg = widgetConfigs[active.id];
    if (!cfg) return;

    const currentRows = positions[active.id]?.rows || cfg.defaultRows || 2;
    const initialRect = active.rect.current.initial;
    const target = cellFromTranslatedRect(
      initialRect,
      delta,
      active.id,
      gridRef.current,
      gridCols,
      gridRows,
      currentRows,
      widgetConfigs,
    );
    if (!target) return;

    const valid = canPlace(
      active.id,
      target.col,
      target.row,
      positions,
      activeWidgets,
      gridCols,
      gridRows,
      currentRows,
      widgetConfigs,
    );

    setGhostInfo({
      col: target.col,
      row: target.row,
      cols: cfg.cols,
      rows: currentRows,
      valid,
    });
  };

  const handleDragMove = (event) => {
    const { active, delta } = event;
    if (!active) return;
    const cfg = widgetConfigs[active.id];
    if (!cfg) return;

    const currentRows = positions[active.id]?.rows || cfg.defaultRows || 2;
    const initialRect = active.rect.current.initial;
    const target = cellFromTranslatedRect(
      initialRect,
      delta,
      active.id,
      gridRef.current,
      gridCols,
      gridRows,
      currentRows,
      widgetConfigs,
    );
    if (!target) {
      setGhostInfo(null);
      return;
    }

    const valid = canPlace(
      active.id,
      target.col,
      target.row,
      positions,
      activeWidgets,
      gridCols,
      gridRows,
      currentRows,
      widgetConfigs,
    );

    setGhostInfo({
      col: target.col,
      row: target.row,
      cols: cfg.cols,
      rows: currentRows,
      valid,
    });
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (active) {
      const cfg = widgetConfigs[active.id];
      const currentRows = positions[active.id]?.rows || cfg?.defaultRows || 2;
      const initialRect = active.rect.current.initial;
      const target = cellFromTranslatedRect(
        initialRect,
        delta,
        active.id,
        gridRef.current,
        gridCols,
        gridRows,
        currentRows,
        widgetConfigs,
      );

      if (
        target &&
        canPlace(
          active.id,
          target.col,
          target.row,
          positions,
          activeWidgets,
          gridCols,
          gridRows,
          currentRows,
          widgetConfigs,
        )
      ) {
        setPositions((p) => ({
          ...p,
          [active.id]: { ...p[active.id], col: target.col, row: target.row },
        }));
      }
    }
    setGhostInfo(null);
  };

  const handleDragCancel = () => {
    setGhostInfo(null);
  };

  /* ── Render widget by ID ── */
  const renderWidget = (id, dragHandleProps) => {
    switch (id) {
      case "timer":
        return <Timmer dragHandleProps={dragHandleProps} />;
      case "waterReminder":
        return <WaterReminder dragHandleProps={dragHandleProps} goalMl={waterGoalMl} />;
      case "todo":
        return <Todo dragHandleProps={dragHandleProps} />;
      case "importantTabs":
        return <ImportantTabs dragHandleProps={dragHandleProps} tabsConfig={importantTabsConfig} />;
      case "streakGrid":
        return <StreakGrid dragHandleProps={dragHandleProps} dataSource={streakDataSource} githubUsername={githubUsername} />;
      case "songPlayer":
        return <SongPlayer dragHandleProps={dragHandleProps} playlistUrl={songPlaylistUrl} autoPlay={songAutoPlay} customVideo={songCustomVideo} stations={lofiStations} />;
      case "timeBoxing":
        return (
          <TimeBoxing
            dragHandleProps={dragHandleProps}
            externalGroups={timeBoxingGroups}
            onGroupsChange={onTimeBoxingGroupsChange}
          />
        );
      // case "clock":
      //   return null;
      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={gridRef}
        className="dashboard-grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        }}
      >
        {/* Ghost drop-target indicator */}
        {ghostInfo && (
          <div
            className={`grid-ghost ${ghostInfo.valid ? "" : "grid-ghost--invalid"}`}
            style={{
              gridColumn: `${ghostInfo.col} / span ${ghostInfo.cols}`,
              gridRow: `${ghostInfo.row} / span ${ghostInfo.rows}`,
            }}
          />
        )}

        {/* Place each active widget in its grid cell */}
        {Object.entries(widgetConfigs).map(([id, config]) => {
          if (!activeWidgets[id]) return null;
          const pos = positions[id] || getDefaultPositions(deviceTier)[id] || { col: 1, row: 1, rows: 2 };
          if (!pos) return null;

          return (
            <DraggableWidget
              key={id}
              id={id}
              config={config}
              pos={pos}
              onStartResize={handleStartResize}
              renderWidget={renderWidget}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default DashboardGrid;
