import React, { useEffect, useState } from "react";
import { NAV_TABS } from "./settings/SettingsPrims.jsx";
import { AppearanceTab } from "./settings/AppearanceTab.jsx";
import { FocusTab } from "./settings/FocusTab.jsx";
import { SongPlayerTab } from "./settings/SongPlayerTab.jsx";
import { TaskbarTab } from "./settings/TaskbarTab.jsx";
import { ImportantTabsTab } from "./settings/ImportantTabsTab.jsx";
import { TimeBoxingTab } from "./settings/TimeBoxingTab.jsx";
import { WidgetsTab } from "./settings/WidgetsTab.jsx";
import { BackupTab } from "./settings/BackupTab.jsx";

/* ─── Main Full-Fledged Settings Screen ─── */
const SettingsPage = (props) => {
  const [activeTab, setActiveTab] = useState("appearance");

  useEffect(() => {
    if (!props.open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && typeof props.onClose === "function") {
        props.onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/60 backdrop-blur-md text-white font-gilroy-medium overflow-hidden pointer-events-auto animate-fade-in"
      onClick={props.onClose}
    >
      {/* Settings Full-Screen SaaS Pop-Up Container with Figma Glass background */}
      <div
        className="figma-glass-static w-full h-full max-w-[1360px] max-h-[90vh] rounded-[28px] sm:rounded-[32px] border-0 shadow-2xl flex flex-col overflow-hidden text-white font-gilroy-medium relative z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching App header close controls */}
        <div className="w-full flex items-center justify-between px-6 sm:px-8 py-4 border-b border-white/15 shrink-0 z-30 relative bg-black/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <i className="ri-settings-3-fill text-lg relative z-10" />
            </div>
            <h1 className="text-white text-lg font-gilroy-bold tracking-tight">Settings</h1>
          </div>

          {/* Top-right controls: Close button matching Dashboard close button */}
          <button
            type="button"
            onClick={props.onClose}
            className="figma-glass-card h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 hover:bg-white/20"
            aria-label="Close Settings"
          >
            <i className="ri-close-line text-xl relative z-10" />
          </button>
        </div>

        {/* Main Full-Fledged Screen Split */}
        <div className="w-full flex-1 flex min-h-0 overflow-hidden z-20 relative">
          {/* Left Sidebar Navigation */}
          <aside className="w-64 sm:w-72 border-r border-white/15 p-6 flex flex-col justify-between shrink-0 select-none bg-black/10">
            <div className="flex flex-col gap-6">
              <nav className="flex flex-col gap-2">
                {NAV_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs transition-all duration-300 ease-out cursor-pointer relative overflow-hidden select-none active:scale-[0.98] ${
                        isActive
                          ? "text-white font-gilroy-bold"
                          : "text-white/60 hover:text-white hover:bg-white/5 font-gilroy-medium"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-md animate-fade-in" />
                      )}
                      <i className={`${tab.icon} text-base transition-colors duration-300 ${isActive ? "text-white" : "text-white/50"}`} />
                      <span className="relative z-10 transition-colors duration-300">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer Social & Credit Links */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open("https://github.com/rahul3rj/Lively-New-Tab-Dashboard", "_blank")}
                  className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-gilroy-medium bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/15 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ri-github-fill relative z-10" />
                  <span className="relative z-10">GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open("https://forms.gle/teCwi4Nmm39Lq1i37", "_blank")}
                  className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-gilroy-medium bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/15 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ri-chrome-line relative z-10" />
                  <span className="relative z-10">Feedback</span>
                </button>
              </div>
              <a
                href="https://www.linkedin.com/in/rahul-jha-049945257/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 text-[11px] text-center font-gilroy-medium hover:text-white transition-colors duration-300"
              >
                Developed by Rahul Jha 👌🏼
              </a>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hide p-8 sm:p-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className="text-white text-xl font-gilroy-bold">
                  {NAV_TABS.find((t) => t.id === activeTab)?.label}
                </h2>
              </div>

              {activeTab === "appearance" && (
                <AppearanceTab
                  wallpaper={props.wallpaper}
                  onWallpaperPick={props.onWallpaperPick}
                  onWallpaperReset={props.onWallpaperReset}
                  themeColor={props.themeColor}
                  themeColorsMap={props.themeColorsMap}
                  onThemeChange={props.onThemeChange}
                  themeTextColorIndex={props.themeTextColorIndex}
                  onThemeTextColorChange={props.onThemeTextColorChange}
                  uiTheme={props.uiTheme}
                  onUiThemeChange={props.onUiThemeChange}
                  baseFont={props.baseFont}
                  onBaseFontChange={props.onBaseFontChange}
                  baseFontSize={props.baseFontSize}
                  onBaseFontSizeChange={props.onBaseFontSizeChange}
                />
              )}

              {activeTab === "focus" && (
                <FocusTab
                  focusNotifEnabled={props.focusNotifEnabled}
                  onFocusNotifChange={props.onFocusNotifChange}
                  focusEndRingtone={props.focusEndRingtone}
                  onFocusEndRingtoneChange={props.onFocusEndRingtoneChange}
                  restEndRingtone={props.restEndRingtone}
                  onRestEndRingtoneChange={props.onRestEndRingtoneChange}
                  waterGoalMl={props.waterGoalMl}
                  onWaterGoalChange={props.onWaterGoalChange}
                  waterNotifEnabled={props.waterNotifEnabled}
                  onWaterNotifChange={props.onWaterNotifChange}
                  waterRingtone={props.waterRingtone}
                  onWaterRingtoneChange={props.onWaterRingtoneChange}
                />
              )}

              {activeTab === "songPlayer" && (
                <SongPlayerTab
                  songPlaylistUrl={props.songPlaylistUrl}
                  onSongPlaylistUrlChange={props.onSongPlaylistUrlChange}
                  songAutoPlay={props.songAutoPlay}
                  onSongAutoPlayChange={props.onSongAutoPlayChange}
                  songCustomVideo={props.songCustomVideo}
                  onSongCustomVideoChange={props.onSongCustomVideoChange}
                  lofiStations={props.lofiStations}
                  onLofiStationsChange={props.onLofiStationsChange}
                />
              )}

              {activeTab === "taskbar" && (
                <TaskbarTab
                  shortcuts={props.shortcuts}
                  onShortcutsReorder={props.onShortcutsChange}
                  onShortcutUpdate={props.onShortcutUpdate}
                  onShortcutRemove={props.onShortcutRemove}
                  onShortcutAdd={props.onShortcutAdd}
                  onShortcutIconPick={props.onShortcutIconPick}
                  uiTheme={props.uiTheme}
                />
              )}

              {activeTab === "tabs" && (
                <ImportantTabsTab
                  importantTabsConfig={props.importantTabsConfig}
                  onImportantTabsConfigChange={props.onImportantTabsConfigChange}
                  uiTheme={props.uiTheme}
                />
              )}

              {activeTab === "timebox" && (
                <TimeBoxingTab
                  timeBoxingGroups={props.timeBoxingGroups}
                  onTimeBoxingGroupsChange={props.onTimeBoxingGroupsChange}
                  uiTheme={props.uiTheme}
                />
              )}

              {activeTab === "widgets" && (
                <WidgetsTab
                  uiTheme={props.uiTheme}
                  showTimer={props.showTimer}
                  onShowTimerChange={props.onShowTimerChange}
                  showWaterReminder={props.showWaterReminder}
                  onShowWaterReminderChange={props.onShowWaterReminderChange}
                  showSongPlayer={props.showSongPlayer}
                  onShowSongPlayerChange={props.onShowSongPlayerChange}
                  showTodo={props.showTodo}
                  onShowTodoChange={props.onShowTodoChange}
                  showImportantTabs={props.showImportantTabs}
                  onShowImportantTabsChange={props.onShowImportantTabsChange}
                  showTimeBoxing={props.showTimeBoxing}
                  onShowTimeBoxingChange={props.onShowTimeBoxingChange}
                  showStreakGrid={props.showStreakGrid}
                  onShowStreakGridChange={props.onShowStreakGridChange}
                  streakDataSource={props.streakDataSource}
                  onStreakDataSourceChange={props.onStreakDataSourceChange}
                  githubUsername={props.githubUsername}
                  onGithubUsernameChange={props.onGithubUsernameChange}
                />
              )}

              {activeTab === "backup" && (
                <BackupTab uiTheme={props.uiTheme} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
