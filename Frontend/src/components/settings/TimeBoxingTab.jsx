import React, { useEffect, useRef, useState } from "react";
import { IconDropdownPopover } from "../IconPicker.jsx";
import { TimeDropdownPopover } from "../TimePicker.jsx";
import { CardContainer, InputField, makeId } from "./SettingsPrims.jsx";

/* ─── TAB 5: Time Boxing ─── */
export const TimeBoxingTab = ({ timeBoxingGroups, onTimeBoxingGroupsChange, uiTheme = "default" }) => {
  const [iconPickerGroupId, setIconPickerGroupId] = useState(null);
  const [timePickerGroupId, setTimePickerGroupId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const iconButtonRefs = useRef({});
  const timeButtonRefs = useRef({});

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [draggedSubtask, setDraggedSubtask] = useState(null);
  const [dragOverSubtask, setDragOverSubtask] = useState(null);
  const subtaskInputRefs = useRef({});
  const lastAddedSubtaskRef = useRef(null);

  useEffect(() => {
    if (lastAddedSubtaskRef.current) {
      const { id } = lastAddedSubtaskRef.current;
      if (subtaskInputRefs.current[id]) {
        subtaskInputRefs.current[id].focus();
        lastAddedSubtaskRef.current = null;
      }
    }
  }, [timeBoxingGroups]);

  const anyPickerOpen = timePickerGroupId !== null || iconPickerGroupId !== null;

  const addGroup = () => {
    const g = { id: makeId(), title: "New Routine", iconClass: "ri-briefcase-line", time: "9:00 am", streak: 0, subtasks: [] };
    onTimeBoxingGroupsChange([...timeBoxingGroups, g]);
    setExpandedGroupId(g.id);
  };

  const removeGroup = (id) => onTimeBoxingGroupsChange(timeBoxingGroups.filter((g) => g.id !== id));

  const updateGroup = (id, patch) =>
    onTimeBoxingGroupsChange(timeBoxingGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      const reordered = [...timeBoxingGroups];
      const [movedItem] = reordered.splice(draggedIdx, 1);
      reordered.splice(targetIdx, 0, movedItem);
      onTimeBoxingGroupsChange(reordered);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const addSubtask = (groupId) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    const id = makeId();
    lastAddedSubtaskRef.current = { groupId, id };
    updateGroup(groupId, { subtasks: [...g.subtasks, { id, text: "", done: false }] });
  };

  const removeSubtask = (groupId, stId) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, { subtasks: g.subtasks.filter((s) => s.id !== stId) });
  };

  const updateSubtask = (groupId, stId, text) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, { subtasks: g.subtasks.map((s) => (s.id === stId ? { ...s, text } : s)) });
  };

  const handleSubtaskDragStart = (e, groupId, idx) => {
    e.stopPropagation();
    setDraggedSubtask({ groupId, idx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubtaskDragOver = (e, groupId, idx) => {
    e.preventDefault();
    e.stopPropagation();
    const key = `${groupId}:${idx}`;
    const cur = dragOverSubtask
      ? `${dragOverSubtask.groupId}:${dragOverSubtask.idx}`
      : null;
    if (cur !== key) setDragOverSubtask({ groupId, idx });
  };

  const handleSubtaskDrop = (e, groupId, targetIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      draggedSubtask &&
      draggedSubtask.groupId === groupId &&
      draggedSubtask.idx !== targetIdx
    ) {
      const g = timeBoxingGroups.find((g) => g.id === groupId);
      if (g) {
        const reordered = [...(g.subtasks || [])];
        const [moved] = reordered.splice(draggedSubtask.idx, 1);
        reordered.splice(targetIdx, 0, moved);
        updateGroup(groupId, { subtasks: reordered });
      }
    }
    setDraggedSubtask(null);
    setDragOverSubtask(null);
  };

  const handleSubtaskDragEnd = () => {
    setDraggedSubtask(null);
    setDragOverSubtask(null);
  };

  return (
    <CardContainer
      overflowVisible={anyPickerOpen}
      title="Time Boxing Routine Editor"
      description="Structure your daily routines into scheduled task blocks with subtask checklists. Drag task cards up or down to reorder them."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col gap-4">
          {(timeBoxingGroups || []).map((group, idx) => {
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <div
                key={group.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-black/25 border rounded-2xl transition-all shadow-sm relative ${
                  (timePickerGroupId === group.id || iconPickerGroupId === group.id) ? "z-30 overflow-visible" : "z-10 overflow-hidden"
                } ${
                  isDragging
                    ? "opacity-40 border-dashed border-white/40 scale-[0.99]"
                    : isDragOver
                    ? "border-[color:var(--theme)] shadow-lg ring-2 ring-[color:var(--theme)]/30 scale-[1.01]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3">
                  {/* Drag Handle */}
                  <div className="flex items-center shrink-0">
                    <div
                      className="h-10 w-7 flex items-center justify-center text-white/40 hover:text-white cursor-grab active:cursor-grabbing transition-colors"
                      title="Drag to reorder routine tasks"
                    >
                      <i className="ri-drag-move-fill text-lg" />
                    </div>
                  </div>

                  {/* Icon Picker Dropdown */}
                  <div className="relative shrink-0 z-50">
                    <button
                      ref={(el) => (iconButtonRefs.current[group.id] = el)}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerGroupId(iconPickerGroupId === group.id ? null : group.id);
                      }}
                      className="h-10 w-10 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-white/30 flex items-center justify-center text-white text-xl transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                      title="Change Icon"
                    >
                      <i className={`${group.iconClass || "ri-briefcase-line"} relative z-10`} />
                    </button>

                    {iconPickerGroupId === group.id && (
                      <IconDropdownPopover
                        triggerRef={{ current: iconButtonRefs.current[group.id] }}
                        current={group.iconClass || "ri-briefcase-line"}
                        onSelect={(newIcon) => {
                          updateGroup(group.id, { iconClass: newIcon });
                          setIconPickerGroupId(null);
                        }}
                        onClose={() => setIconPickerGroupId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  {/* Task Group Title */}
                  <div className="flex-1 min-w-0">
                    <InputField
                      value={group.title}
                      onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                      placeholder="Task Group Name"
                      className="w-full font-gilroy-bold"
                    />
                  </div>

                  {/* Time Selector Dropdown */}
                  <div className="relative shrink-0 z-50">
                    <button
                      ref={(el) => (timeButtonRefs.current[group.id] = el)}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimePickerGroupId(timePickerGroupId === group.id ? null : group.id);
                      }}
                      className="h-10 px-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-white/30 text-xs text-white font-gilroy-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm min-w-[105px]"
                      title="Select Routine Scheduled Time"
                    >
                      <i className="ri-time-line text-sm text-[color:var(--theme)]" />
                      <span>{group.time || "9:00 am"}</span>
                      <i className={`ri-arrow-${timePickerGroupId === group.id ? "up" : "down"}-s-line text-xs opacity-60 transition-transform`} />
                    </button>

                    {timePickerGroupId === group.id && (
                      <TimeDropdownPopover
                        triggerRef={{ current: timeButtonRefs.current[group.id] }}
                        current={group.time || "9:00 am"}
                        onSelect={(newTime) => {
                          updateGroup(group.id, { time: newTime });
                          setTimePickerGroupId(null);
                        }}
                        onClose={() => setTimePickerGroupId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  {/* Subtask Toggle & Delete Button */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
                      className="h-10 px-3.5 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 text-xs text-white/80 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <span className="text-xs font-gilroy-medium">{group.subtasks?.length || 0} subtasks</span>
                      <i className={`ri-arrow-${expandedGroupId === group.id ? "up" : "down"}-s-line text-sm relative z-10`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                      title="Remove Group"
                    >
                      <i className="ri-delete-bin-6-line text-sm" />
                    </button>
                  </div>
                </div>

                {expandedGroupId === group.id && (
                  <div className="border-t border-white/10 p-3 bg-black/20 flex flex-col gap-2">
                    {group.subtasks?.map((st, stIdx) => {
                      const stDragging =
                        draggedSubtask &&
                        draggedSubtask.groupId === group.id &&
                        draggedSubtask.idx === stIdx;
                      const stDragOver =
                        dragOverSubtask &&
                        dragOverSubtask.groupId === group.id &&
                        dragOverSubtask.idx === stIdx;
                      return (
                        <div
                          key={st.id}
                          draggable
                          onDragStart={(e) =>
                            handleSubtaskDragStart(e, group.id, stIdx)
                          }
                          onDragOver={(e) =>
                            handleSubtaskDragOver(e, group.id, stIdx)
                          }
                          onDrop={(e) =>
                            handleSubtaskDrop(e, group.id, stIdx)
                          }
                          onDragEnd={handleSubtaskDragEnd}
                          className={`flex items-center gap-2.5 rounded-xl transition-all ${
                            stDragging
                              ? "opacity-40"
                              : stDragOver
                                ? "ring-2 ring-[color:var(--theme)]/40 bg-black/30"
                                : ""
                          }`}
                        >
                          <i
                            className="ri-drag-move-fill text-white/25 hover:text-white cursor-grab active:cursor-grabbing text-sm shrink-0"
                            title="Drag to reorder subtasks"
                          />
                          <div className="flex-1 min-w-0">
                            <input
                              ref={(el) => {
                                subtaskInputRefs.current[st.id] = el;
                              }}
                              type="text"
                              value={st.text}
                              onChange={(e) =>
                                updateSubtask(group.id, st.id, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addSubtask(group.id);
                                }
                              }}
                              placeholder="Subtask description"
                              className="w-full h-9 rounded-xl bg-black/30 border border-white/10 focus:border-white/40 px-3 text-xs text-white placeholder:text-white/65 focus:placeholder:text-white/40 outline-none transition-all font-gilroy-medium"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSubtask(group.id, st.id)}
                            className="h-9 w-9 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95"
                            title="Remove Subtask"
                          >
                            <i className="ri-close-line text-base" />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => addSubtask(group.id)}
                      className="mt-1.5 self-start px-4 py-1.5 rounded-xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <i className="ri-add-line text-xs relative z-10" />
                      <span className="relative z-10">Add Subtask</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addGroup}
          className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md mt-1"
        >
          <i className="ri-add-line text-base relative z-10" />
          <span className="relative z-10">Add Time Boxing Group</span>
        </button>
      </div>
    </CardContainer>
  );
};
