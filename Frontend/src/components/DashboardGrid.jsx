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
} from "@dnd-kit/core";
import Timmer from "./Timmer";
import WaterReminder from "./WaterReminder";
import Todo from "./Todo";
import ImportantTabs from "./ImportantTabs";
import StreakGrid from "./StreakGrid";
import SongPlayer from "./SongPlayer";
import TimeBoxing from "./TimeBoxing";
import { storageGet, storageSet } from "../utils/storage.js";
import { DraggableWidget } from "./dashboard/DraggableWidget.jsx";
import {
  getWidgetConfigs,
  getWidgetCols,
  getDeviceTier,
  getDefaultPositions,
  getStorageKeyForTier,
  getDynamicGridSize,
  clampPositionsToGrid,
  canPlace,
  findSwapWidget,
  cellFromTranslatedRect,
} from "./dashboard/gridLayoutSolver.js";

/* ─── Storage Keys ─── */
const STORAGE_KEY = "settings_widget_positions_v7";
const STORAGE_KEY_V5 = "settings_widget_positions_v5";

/* ─── Collision & Pointer Sensor ─── */
class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown",
      handler: ({ nativeEvent }) => {
        if (
          nativeEvent.target &&
          typeof nativeEvent.target.closest === "function" &&
          nativeEvent.target.closest(
            "[data-resize-handle], [data-resize-handle-cols]",
          )
        ) {
          return false;
        }
        return true;
      },
    },
  ];
}

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
    useSensor(CustomPointerSensor, {
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
          setPositions(() => {
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
                  const validCols = cfg.resizable
                    ? Math.max(
                        cfg.minCols ?? cfg.cols,
                        Math.min(
                          cfg.maxCols ?? cfg.cols,
                          typeof pos?.cols === "number"
                            ? pos.cols
                            : cfg.cols,
                        ),
                      )
                    : cfg.cols;

                  merged[id] = {
                    ...merged[id],
                    col: pos.col,
                    row: pos.row,
                    rows: validRows,
                    cols: validCols,
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

  /* ── Vertical Resizing Logic (Rows) ── */
  const handleStartResizeRows = useCallback(
    (widgetId, e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === "function") {
        e.nativeEvent.stopImmediatePropagation();
      }

      const handleEl = e.currentTarget;
      if (handleEl && typeof handleEl.setPointerCapture === "function") {
        try {
          handleEl.setPointerCapture(e.pointerId);
        } catch {
          // fallback
        }
      }

      const widgetEl = handleEl.closest(".grid-widget");
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
            getWidgetCols(cfg, currentPos),
            widgetConfigs,
          )
        ) {
          setPositions((prev) => ({
            ...prev,
            [widgetId]: { ...prev[widgetId], rows: targetRows },
          }));
        }
      };

      const onUp = (upEv) => {
        if (handleEl && typeof handleEl.releasePointerCapture === "function") {
          try {
            handleEl.releasePointerCapture(upEv.pointerId);
          } catch {
            // fallback
          }
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [gridCols, gridRows, widgetConfigs],
  );

  /* ── Horizontal Resizing Logic (Cols) ── */
  const handleStartResizeCols = useCallback(
    (widgetId, e, fromLeft = false) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === "function") {
        e.nativeEvent.stopImmediatePropagation();
      }

      const handleEl = e.currentTarget;
      if (handleEl && typeof handleEl.setPointerCapture === "function") {
        try {
          handleEl.setPointerCapture(e.pointerId);
        } catch {
          // fallback
        }
      }

      const widgetEl = handleEl.closest(".grid-widget");
      if (!widgetEl || !gridRef.current) return;
      const widgetRect = widgetEl.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      const cellWidth = gridRect.width / gridCols;

      const onMove = (moveEv) => {
        const currentX = moveEv.clientX;
        const relX = fromLeft
          ? widgetRect.right - currentX
          : currentX - widgetRect.left;
        const cfg = widgetConfigs[widgetId];
        const minC = cfg.minCols ?? cfg.cols;
        const maxC = cfg.maxCols ?? cfg.cols;
        const targetCols = Math.max(
          minC,
          Math.min(maxC, Math.max(1, Math.round(relX / cellWidth))),
        );

        const currentPos = positionsRef.current[widgetId];
        if (!currentPos) return;
        const currentCols = getWidgetCols(cfg, currentPos);
        const targetCol = fromLeft
          ? currentPos.col + currentCols - targetCols
          : currentPos.col;
        if (
          canPlace(
            widgetId,
            targetCol,
            currentPos.row,
            positionsRef.current,
            activeRef.current,
            gridCols,
            gridRows,
            currentPos.rows,
            targetCols,
            widgetConfigs,
          )
        ) {
          setPositions((prev) => ({
            ...prev,
            [widgetId]: {
              ...prev[widgetId],
              ...(fromLeft ? { col: targetCol } : {}),
              cols: targetCols,
            },
          }));
        }
      };

      const onUp = (upEv) => {
        if (handleEl && typeof handleEl.releasePointerCapture === "function") {
          try {
            handleEl.releasePointerCapture(upEv.pointerId);
          } catch {
            // fallback
          }
        }
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
    const currentCols = getWidgetCols(cfg, positions[active.id]);
    const initialRect = active.rect.current.initial;
    const target = cellFromTranslatedRect(
      initialRect,
      delta,
      active.id,
      gridRef.current,
      gridCols,
      gridRows,
      currentRows,
      currentCols,
      widgetConfigs,
    );
    if (!target) return;

    const canDirectPlace = canPlace(
      active.id,
      target.col,
      target.row,
      positions,
      activeWidgets,
      gridCols,
      gridRows,
      currentRows,
      currentCols,
      widgetConfigs,
    );

    const swapTargetId = !canDirectPlace
      ? findSwapWidget(
          active.id,
          target.col,
          target.row,
          positions,
          activeWidgets,
          gridCols,
          gridRows,
          currentRows,
          currentCols,
          widgetConfigs,
        )
      : null;

    const valid = canDirectPlace || Boolean(swapTargetId);

    setGhostInfo({
      col: target.col,
      row: target.row,
      cols: currentCols,
      rows: currentRows,
      valid,
      isSwap: Boolean(swapTargetId),
    });
  };

  const handleDragMove = (event) => {
    const { active, delta } = event;
    if (!active) return;
    const cfg = widgetConfigs[active.id];
    if (!cfg) return;

    const currentRows = positions[active.id]?.rows || cfg.defaultRows || 2;
    const currentCols = getWidgetCols(cfg, positions[active.id]);
    const initialRect = active.rect.current.initial;
    const target = cellFromTranslatedRect(
      initialRect,
      delta,
      active.id,
      gridRef.current,
      gridCols,
      gridRows,
      currentRows,
      currentCols,
      widgetConfigs,
    );
    if (!target) {
      setGhostInfo(null);
      return;
    }

    const canDirectPlace = canPlace(
      active.id,
      target.col,
      target.row,
      positions,
      activeWidgets,
      gridCols,
      gridRows,
      currentRows,
      currentCols,
      widgetConfigs,
    );

    const swapTargetId = !canDirectPlace
      ? findSwapWidget(
          active.id,
          target.col,
          target.row,
          positions,
          activeWidgets,
          gridCols,
          gridRows,
          currentRows,
          currentCols,
          widgetConfigs,
        )
      : null;

    const valid = canDirectPlace || Boolean(swapTargetId);

    setGhostInfo({
      col: target.col,
      row: target.row,
      cols: currentCols,
      rows: currentRows,
      valid,
      isSwap: Boolean(swapTargetId),
    });
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (active) {
      const cfg = widgetConfigs[active.id];
      const currentRows = positions[active.id]?.rows || cfg?.defaultRows || 2;
      const currentCols = getWidgetCols(cfg, positions[active.id]);
      const initialRect = active.rect.current.initial;
      const target = cellFromTranslatedRect(
        initialRect,
        delta,
        active.id,
        gridRef.current,
        gridCols,
        gridRows,
        currentRows,
        currentCols,
        widgetConfigs,
      );

      if (target) {
        const canDirectPlace = canPlace(
          active.id,
          target.col,
          target.row,
          positions,
          activeWidgets,
          gridCols,
          gridRows,
          currentRows,
          currentCols,
          widgetConfigs,
        );

        if (canDirectPlace) {
          setPositions((p) => ({
            ...p,
            [active.id]: { ...p[active.id], col: target.col, row: target.row },
          }));
        } else {
          const swapId = findSwapWidget(
            active.id,
            target.col,
            target.row,
            positions,
            activeWidgets,
            gridCols,
            gridRows,
            currentRows,
            currentCols,
            widgetConfigs,
          );
          if (swapId && positions[swapId]) {
            const origPosA = positions[active.id];
            setPositions((p) => ({
              ...p,
              [active.id]: { ...p[active.id], col: target.col, row: target.row },
              [swapId]: { ...p[swapId], col: origPosA.col, row: origPosA.row },
            }));
          }
        }
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
              onStartResizeRows={handleStartResizeRows}
              onStartResizeCols={handleStartResizeCols}
              renderWidget={renderWidget}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default DashboardGrid;
