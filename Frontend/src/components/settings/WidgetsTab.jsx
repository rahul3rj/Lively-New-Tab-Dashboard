import React from "react";
import { CardContainer, Toggle } from "./SettingsPrims.jsx";

/* ─── TAB 6: Widget Visibility ─── */
export const WidgetsTab = ({
  uiTheme,
  showTimer, onShowTimerChange,
  showWaterReminder, onShowWaterReminderChange,
  showSongPlayer, onShowSongPlayerChange,
  showTodo, onShowTodoChange,
  showImportantTabs, onShowImportantTabsChange,
  showTimeBoxing, onShowTimeBoxingChange,
  showStreakGrid, onShowStreakGridChange,
  streakDataSource, onStreakDataSourceChange,
  githubUsername, onGithubUsernameChange,
}) => {
  const isManga = uiTheme === "manga";
  const accentStyle = {
    backgroundColor: isManga ? "#000000" : "var(--theme)",
    borderColor: isManga ? "#000000" : "var(--theme)",
  };
  const idleStyle = {
    borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
  };

  return (
    <>
      <CardContainer
        title="Dashboard Widgets Visibility"
        description="Control which widgets and tools are displayed on your main dashboard grid."
      >
        <div className="flex flex-col gap-1 pt-3 border-t border-white/10">
          {[
            { title: "Focus Timer Widget", desc: "Pomodoro & rest countdown timer card", state: showTimer, set: onShowTimerChange, icon: "ri-timer-line" },
            { title: "Water Reminder Widget", desc: "Liquid animation hydration goal & counter", state: showWaterReminder, set: onShowWaterReminderChange, icon: "ri-drop-line" },
            { title: "24/7 Song Player Widget", desc: "24/7 Lofi live stream music player", state: showSongPlayer, set: onShowSongPlayerChange, icon: "ri-music-2-line" },
            { title: "Notepad / To Do Checklist", desc: "Quick notes and task checklist card", state: showTodo, set: onShowTodoChange, icon: "ri-file-text-line" },
            { title: "Important Tabs Widget", desc: "Categorized quick bookmarks and links", state: showImportantTabs, set: onShowImportantTabsChange, icon: "ri-bookmark-3-line" },
            { title: "Time Boxing Routines", desc: "Daily time blocking and scheduled task cards", state: showTimeBoxing, set: onShowTimeBoxingChange, icon: "ri-time-line" },
            { title: "Streak Activity Grid", desc: "GitHub-style daily contribution grid", state: showStreakGrid, set: onShowStreakGridChange, icon: "ri-calendar-check-line" },
          ].map((w, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center text-white text-base shrink-0 shadow-inner">
                  <i className={`${w.icon} relative z-10`} />
                </div>
                <div>
                  <h4 className="text-white text-xs font-gilroy-bold">{w.title}</h4>
                  <p className="text-white/50 text-[11px] font-gilroy-medium">{w.desc}</p>
                </div>
              </div>
              <Toggle checked={w.state} onChange={w.set} />
            </div>
          ))}
        </div>
      </CardContainer>

      <CardContainer
        title="Streak Grid Data Source"
        description="Choose which contribution graph the Streak Activity Grid widget displays."
      >
        <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10">
            {[
              { id: "local", label: "Focus Activity", desc: "Tasks, timers & water goals logged on this device", icon: "ri-fire-line" },
              { id: "github", label: "GitHub Contributions", desc: "Public commits, PRs & issues from your GitHub profile", icon: "ri-github-line" },
            ].map((option) => {
              const active = streakDataSource === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onStreakDataSourceChange(option.id)}
                  style={active ? accentStyle : undefined}
                  className={`flex-1 flex flex-col items-start gap-0.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-gilroy-bold">
                    <i className={`${option.icon} text-sm`}></i>
                    <span className="relative z-10">{option.label}</span>
                  </span>
                  <span className={`text-[10px] font-gilroy-medium ${active ? "text-white/70" : "text-white/40"}`}>
                    {option.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {streakDataSource === "github" && (
            <div className="flex flex-col gap-1.5">
              <label
                style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
                className="text-[9px] uppercase tracking-wider block font-gilroy-bold opacity-90"
              >
                GitHub Username
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-white/50 text-[11px] font-gilroy-bold">@</span>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => onGithubUsernameChange(e.target.value)}
                  placeholder="octocat"
                  style={idleStyle}
                  className="flex-1 h-8 px-2.5 rounded-xl bg-black/60 border text-[11px] text-white placeholder:text-white/40 focus:outline-none transition-all font-gilroy-medium"
                />
              </div>
              <p className="text-white/40 text-[10px] font-gilroy-medium leading-relaxed">
                Paste your GitHub username or profile link (e.g. github.com/octocat). Shows
                contributions from your public activity and reflects roughly the last 90 days.
              </p>
            </div>
          )}
        </div>
      </CardContainer>
    </>
  );
};
