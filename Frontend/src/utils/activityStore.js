import { storageGet, storageSet } from "./storage.js";

const STORAGE_KEY = "streak_activity_v2";

export const ACTIVITY_UPDATED_EVENT = "streak-activity-updated";

const pad2 = (n) => String(n).padStart(2, "0");

export const dateKeyOf = (d) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getUTCFullYear();
  const month = pad2(dateObj.getUTCMonth() + 1);
  const day = pad2(dateObj.getUTCDate());
  return `${year}-${month}-${day}`;
};

export const todayUtcKey = () => dateKeyOf(new Date());

export const getActivityMap = async () => {
  try {
    const raw = await storageGet(STORAGE_KEY);
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Corrupted payload falls through to empty map
  }
  return {};
};

const saveActivityMap = (map) =>
  storageSet(STORAGE_KEY, JSON.stringify(map));

const notifyUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACTIVITY_UPDATED_EVENT));
  }
};

/** Directly updates today's completed main tasks count */
export const updateTodayCompletedTasksCount = async (completedCount) => {
  const map = await getActivityMap();
  const key = todayUtcKey();
  map[key] = Math.max(0, Math.floor(completedCount));
  await saveActivityMap(map);
  notifyUpdated();
};

/** Adds `points` to today's activity count and persists the whole map. */
export const recordActivity = async (points = 1) => {
  const add = Math.max(0, Math.floor(points));
  if (add <= 0) return;

  const map = await getActivityMap();
  const key = todayUtcKey();
  const current = Number(map[key]);
  map[key] = (Number.isFinite(current) && current > 0 ? current : 0) + add;
  await saveActivityMap(map);
  notifyUpdated();
};

/** Returns the current activity map, initializing to an empty object if not yet set. */
export const getOrInitActivityMap = async () => {
  return getActivityMap();
};

/** @deprecated Use getOrInitActivityMap instead. */
export const seedDemoActivityIfEmpty = getOrInitActivityMap;
