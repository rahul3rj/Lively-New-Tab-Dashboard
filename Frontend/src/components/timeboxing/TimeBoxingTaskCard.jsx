import React, { useRef, useState } from "react";
import { IconDropdownPopover } from "../IconPicker.jsx";
import { TimeDropdownPopover } from "../TimePicker.jsx";

export const TimeBoxingTaskCard = ({
  group,
  index,
  totalGroups,
  active,
  expanded,
  onToggleExpand,
  onGroupDragStart,
  onGroupDragOver,
  onGroupDrop,
  onGroupDragEnd,
  isDraggingGroup,
  isDragOverGroup,
  onToggleSubtask,
  onRemoveSubtask,
  onReorderSubtask,
  onAddSubtask,
  onSaveEditSubtask,
  onSaveEditGroup,
  onRemoveGroup,
  onUpdateGroupIcon,
  onUpdateGroupTime,
  activeTaskRef,
  onFocusNextTask,
}) => {
  const isFirst = index === 0;
  const isLast = index === totalGroups - 1;

  const total = group.subtasks?.length || 0;
  const done = group.subtasks?.filter((s) => s.done).length || 0;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const isCompleted = total > 0 && done === total;
  const baseStreak = group.baseStreak ?? group.streak ?? 0;
  const displayStreak = baseStreak + (isCompleted ? 1 : 0);

  const [editingGroup, setEditingGroup] = useState(false);
  const [editGroupTitle, setEditGroupTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editSubtaskText, setEditSubtaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const iconTriggerRef = useRef(null);
  const timeTriggerRef = useRef(null);
  const subtaskInputRef = useRef(null);

  const [draggedSubtaskId, setDraggedSubtaskId] = useState(null);
  const [dragOverSubtaskId, setDragOverSubtaskId] = useState(null);

  const startEditGroup = () => {
    setEditingGroup(true);
    setEditGroupTitle(group.title || "");
  };

  const handleSaveEditGroup = () => {
    const text = editGroupTitle.trim();
    if (text) {
      onSaveEditGroup(group.id, text);
    } else {
      onRemoveGroup(group.id);
    }
    setEditingGroup(false);
    setEditGroupTitle("");
  };

  const startEditSubtask = (st) => {
    setEditingSubtaskId(st.id);
    setEditSubtaskText(st.text || "");
  };

  const handleSaveEditSubtask = (stId) => {
    const text = editSubtaskText.trim();
    if (text) {
      onSaveEditSubtask(group.id, stId, text);
    } else {
      onRemoveSubtask(group.id, stId);
    }
    setEditingSubtaskId(null);
    setEditSubtaskText("");
  };

  const handleAddSubtask = () => {
    const text = newSubtaskText.trim();
    if (!text) return;
    onAddSubtask(group.id, text);
    setNewSubtaskText("");
  };

  return (
    <div
      ref={active ? activeTaskRef : null}
      draggable
      onDragStart={(e) => onGroupDragStart(e, index)}
      onDragOver={(e) => onGroupDragOver(e, index)}
      onDrop={(e) => onGroupDrop(e, index)}
      onDragEnd={onGroupDragEnd}
      className="flex items-stretch"
    >
      {/* Task Group Card */}
      <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-5"}`}>
        <div
          className={`timebox-task-card relative rounded-[18px] border px-4 pt-3.5 pb-4 ${
            iconPickerOpen || timePickerOpen ? "overflow-visible" : "overflow-hidden"
          } shadow-lg transition-all duration-300 ${
            isDraggingGroup
              ? "opacity-40"
              : isDragOverGroup
              ? "ring-2 ring-white/50 border-white/40"
              : ""
          } ${
            active
              ? "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              : "border-white/10 hover:border-white/20"
          }`}
          style={{
            backgroundColor: active
              ? "var(--theme-1, #CBD5E1)"
              : "color-mix(in srgb, var(--theme-4, #0F172A) 80%, #101015)",
            color: active ? "var(--theme-4, #0F172A)" : "#FFFFFF",
          }}
        >
          {/* Card Header (click to expand / collapse) */}
          <div className="cursor-pointer" onClick={onToggleExpand}>
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <button
                  ref={iconTriggerRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIconPickerOpen((prev) => !prev);
                  }}
                  title="Change icon"
                  className="shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0 shadow-none"
                >
                  {group.iconClass &&
                  (group.iconClass.startsWith("img:") ||
                    group.iconClass.startsWith("http") ||
                    group.iconClass.startsWith("data:")) ? (
                    <img
                      src={group.iconClass.replace(/^img:/, "")}
                      alt=""
                      className="w-[18px] h-[18px] object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <i
                      className={`${group.iconClass || "ri-briefcase-line"} text-[17px] ${
                        active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white/75"
                      }`}
                    />
                  )}
                </button>
                {iconPickerOpen && (
                  <IconDropdownPopover
                    triggerRef={iconTriggerRef}
                    current={group.iconClass || "ri-briefcase-line"}
                    onSelect={(newIcon) => {
                      onUpdateGroupIcon(group.id, newIcon);
                      setIconPickerOpen(false);
                    }}
                    onClose={() => setIconPickerOpen(false)}
                  />
                )}
              </div>

              {editingGroup ? (
                <input
                  autoFocus
                  value={editGroupTitle}
                  onChange={(e) => setEditGroupTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={handleSaveEditGroup}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveEditGroup();
                      onFocusNextTask(index);
                    }
                    if (e.key === "Escape") {
                      setEditingGroup(false);
                      setEditGroupTitle("");
                    }
                  }}
                  onDragStart={(e) => e.preventDefault()}
                  className={`flex-1 min-w-0 bg-transparent outline-none select-text font-gilroy-bold text-[15px] ${
                    active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"
                  }`}
                />
              ) : (
                <h3
                  onClick={(e) => {
                    if (expanded) {
                      e.stopPropagation();
                      startEditGroup();
                    }
                  }}
                  title={expanded ? "Click to edit" : undefined}
                  className={`font-gilroy-bold text-[15px] truncate ${
                    expanded ? "cursor-text" : "cursor-pointer"
                  } ${active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"}`}
                >
                  {group.title}
                </h3>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <i
                className={`text-sm shrink-0 ${
                  percent === 100
                    ? active
                      ? "ri-checkbox-circle-fill text-[color:var(--theme-4,#0F172A)] opacity-90"
                      : "ri-checkbox-circle-fill text-white/75"
                    : active
                    ? "ri-checkbox-blank-circle-line text-[color:var(--theme-4,#0F172A)] opacity-60"
                    : "ri-checkbox-blank-circle-line text-white/45"
                }`}
              />
              <span
                className={`text-[11px] font-gilroy-medium whitespace-nowrap ${
                  active ? "text-[color:var(--theme-4,#0F172A)] opacity-75" : "text-white/55"
                }`}
              >
                {done} of {total}
              </span>
              <div
                className={`flex-1 h-[5px] rounded-full overflow-hidden ${
                  active ? "bg-black/15" : "bg-white/10"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    active ? "bg-[color:var(--theme-4,#0F172A)]" : "bg-white/85"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-gilroy-medium w-[30px] text-right whitespace-nowrap ${
                  active ? "text-[color:var(--theme-4,#0F172A)] opacity-75" : "text-white/55"
                }`}
              >
                {percent}%
              </span>
              <span
                className={`flex items-center gap-1 shrink-0 transition-all duration-300 ${
                  displayStreak > 0
                    ? active
                      ? "text-amber-800 font-gilroy-bold"
                      : "text-orange-400 font-gilroy-bold"
                    : active
                    ? "text-[color:var(--theme-4,#0F172A)] opacity-40"
                    : "text-white/25"
                }`}
                title={`Current Task Streak: ${displayStreak} days`}
              >
                <i className={`ri-fire-fill text-sm ${displayStreak > 0 ? "animate-pulse" : ""}`} />
                <span className="text-[11px]">{displayStreak}</span>
              </span>
            </div>
          </div>

          {/* Expanded Subtask Tree */}
          {expanded && (
            <div className="relative mt-1.5">
              {(group.subtasks || []).map((subtask, subIndex) => {
                const isLastSubtask = subIndex === group.subtasks.length - 1;
                const isDragging = draggedSubtaskId === subtask.id;
                const isDragOver = dragOverSubtaskId === subtask.id;

                return (
                  <div
                    key={subtask.id}
                    draggable
                    onDragStart={(e) => {
                      if (editingSubtaskId === subtask.id) {
                        e.preventDefault();
                        return;
                      }
                      setDraggedSubtaskId(subtask.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.stopPropagation();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverSubtaskId !== subtask.id) {
                        setDragOverSubtaskId(subtask.id);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedSubtaskId && draggedSubtaskId !== subtask.id) {
                        onReorderSubtask(group.id, draggedSubtaskId, subtask.id);
                      }
                      setDraggedSubtaskId(null);
                      setDragOverSubtaskId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedSubtaskId(null);
                      setDragOverSubtaskId(null);
                    }}
                    className={`group/subtask relative flex items-center gap-2.5 py-[5px] pl-7 rounded-lg transition-all ${
                      isDragging
                        ? "opacity-40"
                        : isDragOver
                        ? active
                          ? "ring-1 ring-black/40 bg-black/10"
                          : "ring-1 ring-white/40 bg-white/5"
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute left-[9px] top-0 w-px ${
                        active ? "bg-black/25" : "bg-white/20"
                      } ${isLastSubtask ? "h-1/2" : "bottom-0"}`}
                    />
                    <span
                      className={`absolute left-[9px] top-1/2 w-[13px] h-px ${
                        active ? "bg-black/25" : "bg-white/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(group.id, subtask.id)}
                      className="timebox-subtask-check shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0 shadow-none"
                    >
                      {subtask.done ? (
                        <i
                          className={`ri-checkbox-circle-fill text-[15px] ${
                            active
                              ? "text-[color:var(--theme-4,#0F172A)] opacity-85"
                              : "text-white/65"
                          }`}
                        />
                      ) : (
                        <i
                          className={`ri-checkbox-blank-circle-line text-[15px] ${
                            active
                              ? "text-[color:var(--theme-4,#0F172A)] opacity-60 hover:opacity-100"
                              : "text-white/50 hover:text-white"
                          }`}
                        />
                      )}
                    </button>

                    {editingSubtaskId === subtask.id ? (
                      <input
                        autoFocus
                        value={editSubtaskText}
                        onChange={(e) => setEditSubtaskText(e.target.value)}
                        onBlur={() => handleSaveEditSubtask(subtask.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEditSubtask(subtask.id);
                            const nextSubtask = group.subtasks[subIndex + 1];
                            if (nextSubtask) {
                              startEditSubtask(nextSubtask);
                            } else {
                              setTimeout(() => {
                                subtaskInputRef.current?.focus();
                              }, 0);
                            }
                          }
                          if (e.key === "Escape") {
                            setEditingSubtaskId(null);
                            setEditSubtaskText("");
                          }
                        }}
                        onDragStart={(e) => e.preventDefault()}
                        className={`flex-1 min-w-0 bg-transparent outline-none select-text text-xs font-gilroy-medium ${
                          active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => startEditSubtask(subtask)}
                        title="Click to edit"
                        className={`flex-1 min-w-0 truncate text-xs font-gilroy-medium cursor-text ${
                          subtask.done
                            ? active
                              ? "line-through opacity-50 text-[color:var(--theme-4,#0F172A)]"
                              : "line-through text-white/35"
                            : active
                            ? "text-[color:var(--theme-4,#0F172A)] font-gilroy-bold"
                            : "text-white/85"
                        }`}
                      >
                        {subtask.text}
                      </span>
                    )}

                    {/* Delete Subtask Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSubtask(group.id, subtask.id);
                      }}
                      className={`opacity-0 group-hover/subtask:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0 ${
                        active
                          ? "text-[color:var(--theme-4,#0F172A)]/40 hover:text-[color:var(--theme-4,#0F172A)]"
                          : "text-white/30 hover:text-white/80"
                      }`}
                      title="Delete subtask"
                    >
                      <i className="ri-close-line text-xs" />
                    </button>
                  </div>
                );
              })}

              {/* Add New Subtask Row */}
              <div
                className={`relative flex items-center gap-2.5 py-[5px] pl-7 transition-opacity duration-200 ${
                  newSubtaskText
                    ? "opacity-100"
                    : "opacity-0 group-hover/widget:opacity-100 focus-within:opacity-100"
                }`}
              >
                <span
                  className={`absolute left-[9px] top-0 bottom-0 w-px ${
                    active ? "bg-black/25" : "bg-white/20"
                  }`}
                />
                <span
                  className={`absolute left-[9px] top-1/2 w-[13px] h-px ${
                    active ? "bg-black/25" : "bg-white/20"
                  }`}
                />
                <i
                  className={`ri-checkbox-blank-circle-line text-[15px] shrink-0 ${
                    active ? "text-[color:var(--theme-4,#0F172A)] opacity-50" : "text-white/30"
                  }`}
                />
                <input
                  ref={subtaskInputRef}
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onDragStart={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                      setTimeout(() => {
                        subtaskInputRef.current?.focus();
                      }, 0);
                    }
                  }}
                  placeholder="Add new task..."
                  className={`flex-1 min-w-0 bg-transparent outline-none select-text text-xs font-gilroy-medium transition-colors ${
                    active
                      ? "text-[color:var(--theme-4,#0F172A)] placeholder:text-black/65 focus:placeholder:text-black/40"
                      : "text-white/90 placeholder:text-white/70 focus:placeholder:text-white/45"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Marker */}
      <div className="relative w-[70px] shrink-0 ml-3.5">
        <div
          className={`absolute left-[5px] w-px bg-white/15 ${
            isFirst ? "top-[9px] bottom-0" : isLast ? "top-0 h-[9px]" : "top-0 bottom-0"
          }`}
        />
        <span
          className={`absolute left-0 top-[4px] h-[10px] w-[10px] rounded-full transition-all duration-300 ${
            active ? "scale-125 shadow-[0_0_10px_var(--theme-1,#CBD5E1)]" : "bg-white/60"
          }`}
          style={{
            backgroundColor: active ? "var(--theme-1, #CBD5E1)" : "rgba(255,255,255,0.6)",
          }}
        />

        {/* Time Selector Dropdown */}
        <div className="absolute left-4 -top-[3px]">
          <button
            ref={timeTriggerRef}
            type="button"
            onClick={() => setTimePickerOpen((prev) => !prev)}
            className={`text-xs font-gilroy-bold leading-none cursor-pointer focus:outline-none transition-all flex items-center gap-0.5 whitespace-nowrap ${
              active
                ? "text-[color:var(--theme-1,#CBD5E1)] scale-105 origin-left"
                : "text-white/50 hover:text-white"
            }`}
          >
            <span>{group.time || "9:00 am"}</span>
          </button>
          {timePickerOpen && (
            <TimeDropdownPopover
              triggerRef={timeTriggerRef}
              current={group.time || "9:00 am"}
              onSelect={(newTime) => {
                onUpdateGroupTime(group.id, newTime);
                setTimePickerOpen(false);
              }}
              onClose={() => setTimePickerOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
