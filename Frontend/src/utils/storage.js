/**
 * Safe, robust, error-tolerant storage helper supporting Chrome Extension (chrome.storage.local)
 * and Web / Local Dev (localStorage) environments.
 */

export const checkHasChromeStorage = () => {
  try {
    const chromeApi =
      typeof globalThis !== "undefined" ? globalThis.chrome : undefined;
    return (
      !!chromeApi?.storage?.local &&
      typeof chromeApi.storage.local.get === "function" &&
      typeof chromeApi.storage.local.set === "function"
    );
  } catch {
    return false;
  }
};

export const hasChromeStorage = checkHasChromeStorage();

const parseIfJsonString = (val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      trimmed === "true" ||
      trimmed === "false" ||
      trimmed === "null"
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return val;
      }
    }
  }
  return val;
};

const getFromLocalStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return undefined;
    return parseIfJsonString(raw);
  } catch {
    return undefined;
  }
};

const setToLocalStorage = (key, value) => {
  try {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    }
  } catch (err) {
    console.warn("localStorage setItem fallback error:", key, err);
  }
};

/**
 * Reads value for key from storage. Always resolves gracefully without throwing.
 */
export const storageGet = (key) => {
  if (checkHasChromeStorage()) {
    const chromeApi = globalThis.chrome;
    return new Promise((resolve) => {
      try {
        chromeApi.storage.local.get([key], (result) => {
          try {
            if (chromeApi.runtime?.lastError) {
              resolve(getFromLocalStorage(key));
              return;
            }
            const val = result?.[key];
            if (val === undefined) {
              resolve(getFromLocalStorage(key));
            } else {
              resolve(parseIfJsonString(val));
            }
          } catch {
            resolve(getFromLocalStorage(key));
          }
        });
      } catch {
        resolve(getFromLocalStorage(key));
      }
    });
  }
  return Promise.resolve(getFromLocalStorage(key));
};

/**
 * Reads multiple keys from storage at once. Always resolves object mapping key -> value.
 */
export const storageGetMultiple = (keys) => {
  if (checkHasChromeStorage()) {
    const chromeApi = globalThis.chrome;
    return new Promise((resolve) => {
      try {
        chromeApi.storage.local.get(keys, (result) => {
          try {
            const out = {};
            for (const key of keys) {
              const val = result?.[key];
              out[key] =
                val !== undefined
                  ? parseIfJsonString(val)
                  : getFromLocalStorage(key);
            }
            resolve(out);
          } catch {
            const out = {};
            for (const key of keys) out[key] = getFromLocalStorage(key);
            resolve(out);
          }
        });
      } catch {
        const out = {};
        for (const key of keys) out[key] = getFromLocalStorage(key);
        resolve(out);
      }
    });
  }

  const out = {};
  for (const key of keys) out[key] = getFromLocalStorage(key);
  return Promise.resolve(out);
};

/**
 * Writes value for key to storage. Always resolves gracefully without throwing.
 */
export const storageSet = (key, value) => {
  if (checkHasChromeStorage()) {
    const chromeApi = globalThis.chrome;
    return new Promise((resolve) => {
      try {
        chromeApi.storage.local.set({ [key]: value }, () => {
          try {
            if (chromeApi.runtime?.lastError) {
              setToLocalStorage(key, value);
            }
          } catch {
            setToLocalStorage(key, value);
          }
          resolve();
        });
      } catch {
        setToLocalStorage(key, value);
        resolve();
      }
    });
  }
  setToLocalStorage(key, value);
  return Promise.resolve();
};

/**
 * Export all app data into a JS object.
 * Reads everything from chrome.storage.local (if available) and localStorage.
 */
export const exportAllStorageData = async () => {
  const result = {};

  if (checkHasChromeStorage()) {
    await new Promise((resolve) => {
      try {
        globalThis.chrome.storage.local.get(null, (items) => {
          if (items && typeof items === "object") {
            for (const [k, v] of Object.entries(items)) {
              result[k] = parseIfJsonString(v);
            }
          }
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  try {
    if (typeof localStorage !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && result[key] === undefined) {
          const raw = localStorage.getItem(key);
          if (raw !== null && raw !== undefined) {
            result[key] = parseIfJsonString(raw);
          }
        }
      }
    }
  } catch (err) {
    console.warn("localStorage export error:", err);
  }

  return result;
};

/**
 * Import and restore all data into storage.
 * Writes to chrome.storage.local and localStorage.
 */
export const importAllStorageData = async (dataObj) => {
  if (!dataObj || typeof dataObj !== "object" || Array.isArray(dataObj)) {
    throw new Error("Invalid backup payload. Expected a valid JSON object.");
  }

  if (checkHasChromeStorage()) {
    await new Promise((resolve) => {
      try {
        globalThis.chrome.storage.local.set(dataObj, () => {
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  try {
    if (typeof localStorage !== "undefined") {
      for (const [key, val] of Object.entries(dataObj)) {
        if (val === undefined || val === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(
            key,
            typeof val === "string" ? val : JSON.stringify(val)
          );
        }
      }
    }
  } catch (err) {
    console.warn("localStorage import error:", err);
  }
};

/**
 * Clears all dashboard data from storage.
 */
export const clearAllStorageData = async () => {
  if (checkHasChromeStorage()) {
    await new Promise((resolve) => {
      try {
        globalThis.chrome.storage.local.clear(() => {
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  } catch (err) {
    console.warn("localStorage clear error:", err);
  }
};

