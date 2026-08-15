import React, { useRef, useState } from "react";
import {
  exportAllStorageData,
  importAllStorageData,
  clearAllStorageData,
} from "../../utils/storage.js";
import { CardContainer } from "./SettingsPrims.jsx";

/* ─── Backup & Data Management Tab Component ─── */
export const BackupTab = ({ uiTheme: _uiTheme }) => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMsg(null);
      const data = await exportAllStorageData();

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lively-dashboard-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: "success",
        text: "Backup file exported & downloaded successfully! Keep this file safe.",
      });
    } catch (err) {
      console.error("Export error:", err);
      setStatusMsg({
        type: "error",
        text: "Failed to export data: " + (err?.message || String(err)),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setStatusMsg(null);

      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Invalid file format. Must be a valid JSON file.");
      }

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid backup payload structure. Expected a JSON object.");
      }

      await importAllStorageData(parsed);

      setStatusMsg({
        type: "success",
        text: "All settings, to-dos, widgets & preferences successfully restored! Dashboard will refresh...",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Import error:", err);
      setStatusMsg({
        type: "error",
        text: "Failed to restore backup: " + (err?.message || String(err)),
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await clearAllStorageData();
      setStatusMsg({
        type: "success",
        text: "Dashboard reset to defaults. Refreshing...",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: "Failed to reset data: " + (err?.message || String(err)),
      });
    } finally {
      setIsResetting(false);
      setShowConfirmReset(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-gilroy-bold flex items-center gap-3 animate-fade-in ${
            statusMsg.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
              : "bg-rose-500/20 border-rose-500/40 text-rose-200"
          }`}
        >
          <i
            className={`text-lg ${
              statusMsg.type === "success"
                ? "ri-checkbox-circle-fill text-emerald-400"
                : "ri-error-warning-fill text-rose-400"
            }`}
          />
          <span className="flex-1">{statusMsg.text}</span>
          {statusMsg.type === "success" && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-xl text-[11px] font-gilroy-bold transition-all cursor-pointer"
            >
              Refresh Now
            </button>
          )}
        </div>
      )}

      {/* Export Section */}
      <CardContainer
        title="Export Settings & Data"
        description="Download a complete backup of everything: basic & advanced settings, preferences, custom wallpapers, taskbar shortcuts, widget placements, time-boxing routines, streak activity, and all to-do lists (including sub-tasks)."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center text-white text-lg shrink-0 shadow-inner">
              <i className="ri-download-cloud-2-line" />
            </div>
            <div>
              <h4 className="text-white text-xs font-gilroy-bold">Backup JSON File</h4>
              <p className="text-white/50 text-[11px] font-gilroy-medium">
                Generates a portable backup file containing 100% of your dashboard data.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-gilroy-bold text-white bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md disabled:opacity-50"
          >
            <i className="ri-download-2-line text-sm" />
            <span>{isExporting ? "Exporting..." : "Export Backup (.json)"}</span>
          </button>
        </div>
      </CardContainer>

      {/* Restore / Import Section */}
      <CardContainer
        title="Restore / Load Settings & Data"
        description="Load a previously exported backup file to instantly restore all your settings, custom layouts, widget positions, habits, to-do lists with sub-tasks, and preferences."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center text-white text-lg shrink-0 shadow-inner">
              <i className="ri-upload-cloud-2-line" />
            </div>
            <div>
              <h4 className="text-white text-xs font-gilroy-bold">Upload Backup File</h4>
              <p className="text-white/50 text-[11px] font-gilroy-medium">
                Select a valid `.json` dashboard backup file from your device.
              </p>
            </div>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-gilroy-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md disabled:opacity-50"
            >
              <i className="ri-upload-2-line text-sm" />
              <span>{isImporting ? "Restoring..." : "Restore Backup (.json)"}</span>
            </button>
          </div>
        </div>
      </CardContainer>

      {/* Factory Reset Section */}
      <CardContainer
        title="Reset All Dashboard Data"
        description="Permanently clear all saved storage and reset the dashboard back to default initial state."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 text-lg shrink-0 shadow-inner">
              <i className="ri-delete-bin-line" />
            </div>
            <div>
              <h4 className="text-white text-xs font-gilroy-bold">Factory Reset</h4>
              <p className="text-white/50 text-[11px] font-gilroy-medium">
                Clears extension & browser storage data.
              </p>
            </div>
          </div>

          {!showConfirmReset ? (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-gilroy-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <i className="ri-refresh-line text-xs" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetData}
                disabled={isResetting}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-gilroy-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer active:scale-95 shadow-md disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-2 rounded-xl text-xs font-gilroy-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </CardContainer>
    </div>
  );
};
