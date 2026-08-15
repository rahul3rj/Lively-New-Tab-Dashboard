import React from "react";
import { CardContainer, Toggle, RingtoneRow, Pill, WATER_GOALS } from "./SettingsPrims.jsx";

/* ─── TAB 2: Focus & Reminders ─── */
export const FocusTab = ({
  focusNotifEnabled, onFocusNotifChange,
  focusEndRingtone, onFocusEndRingtoneChange,
  restEndRingtone, onRestEndRingtoneChange,
  waterGoalMl, onWaterGoalChange,
  waterNotifEnabled, onWaterNotifChange,
  waterRingtone, onWaterRingtoneChange,
}) => (
  <div className="flex flex-col gap-6">
    {/* Focus Timer */}
    <CardContainer
      title="Focus Timer Settings"
      description="Configure audio alerts and completion ringtones for Focus and Rest pomodoro sessions."
    >
      <div className="flex flex-col gap-3.5 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Audio Sound Alerts</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Play ringtone when timer session completes</p>
          </div>
          <Toggle checked={focusNotifEnabled} onChange={onFocusNotifChange} />
        </div>

        {focusNotifEnabled && (
          <div className="flex flex-col gap-3.5 pl-3.5 border-l-2 border-white/20 my-1 pt-1">
            <RingtoneRow label="Focus Session Completion Ringtone" value={focusEndRingtone} onChange={onFocusEndRingtoneChange} />
            <RingtoneRow label="Rest Session Completion Ringtone" value={restEndRingtone} onChange={onRestEndRingtoneChange} />
          </div>
        )}
      </div>
    </CardContainer>

    {/* Water Reminder */}
    <CardContainer
      title="Water Reminder Settings"
      description="Customize your daily target hydration goal and sound alert preferences."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Daily Target Hydration Goal</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Select your target daily water intake</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {WATER_GOALS.map((g) => (
              <Pill key={g.value} active={waterGoalMl === g.value} onClick={() => onWaterGoalChange(g.value)}>
                {g.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Reminder Sound Notifications</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Chime alert when it's time to drink water</p>
          </div>
          <Toggle checked={waterNotifEnabled} onChange={onWaterNotifChange} />
        </div>

        {waterNotifEnabled && (
          <div className="pl-3.5 border-l-2 border-white/20 my-1 pt-1">
            <RingtoneRow label="Hydration Reminder Alert Ringtone" value={waterRingtone} onChange={onWaterRingtoneChange} />
          </div>
        )}
      </div>
    </CardContainer>
  </div>
);
