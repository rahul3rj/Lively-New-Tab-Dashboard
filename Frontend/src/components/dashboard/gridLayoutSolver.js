/* ─── Grid Configuration & Responsive Helpers ─── */
export const MIN_GRID_ROWS = 6;

export const WIDGET_CONFIGS_LAPTOP = {
  timer: {
    cols: 4,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 1,
    maxRows: 4,
    resizable: true,
    draggable: true,
  },
  waterReminder: {
    cols: 4,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 1,
    maxRows: 4,
    resizable: true,
    draggable: true,
  },
  todo: {
    cols: 3,
    minCols: 2,
    maxCols: 5,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  importantTabs: {
    cols: 3,
    minCols: 2,
    maxCols: 5,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  streakGrid: {
    cols: 11,
    minCols: 6,
    maxCols: 13,
    defaultRows: 2,
    minRows: 1,
    maxRows: 5,
    resizable: true,
    draggable: true,
  },
  songPlayer: {
    cols: 5,
    minCols: 3,
    maxCols: 8,
    defaultRows: 2,
    minRows: 1,
    maxRows: 5,
    resizable: true,
    draggable: true,
  },
  timeBoxing: {
    cols: 4,
    minCols: 3,
    maxCols: 7,
    defaultRows: 4,
    minRows: 2,
    maxRows: 10,
    resizable: true,
    draggable: true,
  },
};

export const WIDGET_CONFIGS_DESKTOP = {
  timer: {
    cols: 4,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 1,
    maxRows: 4,
    resizable: true,
    draggable: true,
  },
  waterReminder: {
    cols: 4,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 1,
    maxRows: 4,
    resizable: true,
    draggable: true,
  },
  todo: {
    cols: 4,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  importantTabs: {
    cols: 3,
    minCols: 2,
    maxCols: 6,
    defaultRows: 2,
    minRows: 2,
    maxRows: 6,
    resizable: true,
    draggable: true,
  },
  streakGrid: {
    cols: 11,
    minCols: 6,
    maxCols: 13,
    defaultRows: 2,
    minRows: 1,
    maxRows: 5,
    resizable: true,
    draggable: true,
  },
  songPlayer: {
    cols: 4,
    minCols: 3,
    maxCols: 8,
    defaultRows: 2,
    minRows: 1,
    maxRows: 5,
    resizable: true,
    draggable: true,
  },
  timeBoxing: {
    cols: 5,
    minCols: 3,
    maxCols: 8,
    defaultRows: 6,
    minRows: 2,
    maxRows: 12,
    resizable: true,
    draggable: true,
  },
};

export const getWidgetConfigs = (tier) =>
  tier === "desktop" ? WIDGET_CONFIGS_DESKTOP : WIDGET_CONFIGS_LAPTOP;

export const getWidgetCols = (cfg, pos) => {
  if (!cfg) return 1;
  const min = cfg.minCols ?? cfg.cols;
  const max = cfg.maxCols ?? cfg.cols;
  return Math.max(min, Math.min(max, pos?.cols || cfg.cols || 1));
};

export const getDeviceTier = (width) => {
  if (typeof window === "undefined") return "laptop";
  const w = width ?? window.innerWidth;
  return w >= 1600 ? "desktop" : "laptop";
};

export const DEFAULT_POSITIONS_LAPTOP = {
  timer: { col: 1, row: 1, rows: 2 },
  waterReminder: { col: 1, row: 3, rows: 2 },
  todo: { col: 5, row: 1, rows: 2 },
  importantTabs: { col: 8, row: 1, rows: 2 },
  songPlayer: { col: 5, row: 3, rows: 2 },
  timeBoxing: { col: 12, row: 1, rows: 4 },
  streakGrid: { col: 5, row: 5, rows: 2 },
};

export const DEFAULT_POSITIONS_DESKTOP = {
  timer: { col: 1, row: 1, rows: 2 },
  waterReminder: { col: 1, row: 3, rows: 2 },
  todo: { col: 5, row: 1, rows: 2 },
  importantTabs: { col: 9, row: 1, rows: 2 },
  songPlayer: { col: 5, row: 3, rows: 2 },
  timeBoxing: { col: 17, row: 1, rows: 4 },
  streakGrid: { col: 5, row: 5, rows: 3 },
};

export const getDefaultPositions = (tier) =>
  tier === "desktop" ? DEFAULT_POSITIONS_DESKTOP : DEFAULT_POSITIONS_LAPTOP;

export const getStorageKeyForTier = (tier) => `settings_widget_positions_v7_${tier}`;

export const getDynamicGridSize = (tier = getDeviceTier()) => {
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

export const clampPositionsToGrid = (
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
    const itemCols = getWidgetCols(cfg, pos);
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
      cols: itemCols,
      rows: itemRows,
    };
  }
  return result;
};

export const rectsOverlap = (aCol, aRow, aCols, aRows, bCol, bRow, bCols, bRows) =>
  !(
    aCol + aCols <= bCol ||
    bCol + bCols <= aCol ||
    aRow + aRows <= bRow ||
    bRow + bRows <= aRow
  );

export const canPlace = (
  widgetId,
  col,
  row,
  positions,
  activeWidgets,
  gridCols,
  _gridRows,
  customRows = null,
  customCols = null,
  widgetConfigs = WIDGET_CONFIGS_LAPTOP,
) => {
  const cfg = widgetConfigs[widgetId];
  if (!cfg) return false;
  const currentPos = positions[widgetId];
  const itemRows = customRows || currentPos?.rows || cfg.defaultRows || 1;
  const itemCols = customCols || getWidgetCols(cfg, currentPos);

  if (col < 1 || row < 1 || col + itemCols - 1 > gridCols) return false;

  for (const [id, pos] of Object.entries(positions)) {
    if (
      id === widgetId ||
      !activeWidgets[id] ||
      !pos ||
      typeof pos?.col !== "number" ||
      typeof pos?.row !== "number"
    )
      continue;
    const oc = widgetConfigs[id];
    const oRows = pos.rows || oc?.defaultRows || 1;
    const oCols = getWidgetCols(oc, pos);
    if (
      rectsOverlap(
        col,
        row,
        itemCols,
        itemRows,
        pos.col,
        pos.row,
        oCols,
        oRows,
      )
    )
      return false;
  }
  return true;
};

export const findSwapWidget = (
  widgetId,
  targetCol,
  targetRow,
  positions,
  activeWidgets,
  gridCols,
  gridRows,
  itemRows,
  itemCols,
  widgetConfigs = WIDGET_CONFIGS_LAPTOP,
) => {
  const currentPos = positions[widgetId];
  if (!currentPos) return null;

  if (
    targetCol < 1 ||
    targetRow < 1 ||
    targetCol + itemCols - 1 > gridCols ||
    targetRow + itemRows - 1 > gridRows
  ) {
    return null;
  }

  const activeIds = Object.keys(activeWidgets).filter(
    (id) => activeWidgets[id] && positions[id],
  );

  const overlapping = activeIds.filter((id) => {
    if (id === widgetId) return false;
    const pos = positions[id];
    const oc = widgetConfigs[id];
    if (!pos || !oc) return false;
    const oCols = getWidgetCols(oc, pos);
    const oRows = pos.rows || oc.defaultRows || 1;

    return rectsOverlap(
      targetCol,
      targetRow,
      itemCols,
      itemRows,
      pos.col,
      pos.row,
      oCols,
      oRows,
    );
  });

  if (overlapping.length !== 1) return null;

  const swapId = overlapping[0];
  const swapPos = positions[swapId];
  const swapCfg = widgetConfigs[swapId];
  if (!swapPos || !swapCfg) return null;

  const swapCols = getWidgetCols(swapCfg, swapPos);
  const swapRows = swapPos.rows || swapCfg.defaultRows || 1;

  if (swapCols !== itemCols || swapRows !== itemRows) return null;
  if (swapPos.col !== targetCol || swapPos.row !== targetRow) return null;

  for (const otherId of activeIds) {
    if (otherId === widgetId || otherId === swapId) continue;
    const pos = positions[otherId];
    const oc = widgetConfigs[otherId];
    if (!pos || !oc) continue;
    const oCols = getWidgetCols(oc, pos);
    const oRows = pos.rows || oc.defaultRows || 1;

    if (
      rectsOverlap(
        currentPos.col,
        currentPos.row,
        swapCols,
        swapRows,
        pos.col,
        pos.row,
        oCols,
        oRows,
      )
    ) {
      return null;
    }
  }

  return swapId;
};

export const cellFromTranslatedRect = (
  initialRect,
  delta,
  widgetId,
  gridEl,
  gridCols,
  gridRows,
  itemRows = null,
  itemCols = null,
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
  const activeItemCols = itemCols || cfg.cols || 1;

  const targetCol = Math.min(
    gridCols - activeItemCols + 1,
    Math.max(1, Math.round(relLeft / cellWidth) + 1),
  );
  const targetRow = Math.min(
    gridRows - activeItemRows + 1,
    Math.max(1, Math.round(relTop / cellHeight) + 1),
  );

  return { col: targetCol, row: targetRow };
};
