import React, { useEffect, useMemo, useRef, useState } from "react";
import { updateTodayCompletedTasksCount } from "../utils/activityStore";
import { IconDropdownPopover } from "./IconPicker.jsx";

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return String(Date.now() + Math.random());
};


const DEFAULT_TASK_GROUPS = [
  {
    id: "brain-stretching",
    title: "Brain Stretching",
    time: "8:00 am",
    streak: 0,
    subtasks: [
      { id: "bs-1", text: "Morning Meditation", done: false },
      { id: "bs-2", text: "Read 10 Pages", done: false },
      { id: "bs-3", text: "Solve A Puzzle", done: false },
      { id: "bs-4", text: "Plan The Day", done: false },
    ],
  },
  {
    id: "exercise",
    title: "Exercise",
    time: "8:45 am",
    streak: 0,
    subtasks: [
      { id: "ex-1", text: "Warm Up & Stretch", done: false },
      { id: "ex-2", text: "Push Ups 3 Sets", done: false },
      { id: "ex-3", text: "30 Min Cardio", done: false },
      { id: "ex-4", text: "Cool Down Yoga", done: false },
    ],
  },
  {
    id: "leetcode",
    title: "LeetCode Problem",
    time: "9:00 am",
    streak: 0,
    subtasks: [
      { id: "lc-1", text: "Leetcode Problem Solve", done: false },
      { id: "lc-2", text: "Push Code To Github", done: false },
      { id: "lc-3", text: "Analyse Most Optimal Solution", done: false },
      { id: "lc-4", text: "Recognise Patterns", done: false },
      { id: "lc-5", text: "Note Down Any Important Findings", done: false },
    ],
  },
  {
    id: "project",
    title: "Project",
    time: "11:00 am",
    streak: 0,
    subtasks: [
      { id: "pj-1", text: "Design New Component", done: false },
      { id: "pj-2", text: "Fix Pending Bugs", done: false },
      { id: "pj-3", text: "Code Review", done: false },
      { id: "pj-4", text: "Deploy Latest Build", done: false },
    ],
  },
  {
    id: "gaming",
    title: "Gaming",
    time: "2:00 pm",
    streak: 0,
    subtasks: [
      { id: "gm-1", text: "Warm Up Aim Trainer", done: false },
      { id: "gm-2", text: "Ranked Matches", done: false },
      { id: "gm-3", text: "Review Gameplay", done: false },
      { id: "gm-4", text: "Claim Daily Rewards", done: false },
    ],
  },
];

const parseTimeToMinutes = (time) => {
  if (!time) return null;
  const match = /^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i.exec(String(time).trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  let minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toLowerCase();

  if (period === "pm" && hours < 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const getNowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const TimeBoxing = ({ dragHandleProps, externalGroups, onGroupsChange }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
  const [draggedSubtask, setDraggedSubtask] = useState(null);
  const [dragOverSubtask, setDragOverSubtask] = useState(null);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editSubtaskText, setEditSubtaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupTitle, setEditGroupTitle] = useState("");
  const [iconPickerGroupId, setIconPickerGroupId] = useState(null);
  const [newMainTaskText, setNewMainTaskText] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const subtaskInputRefs = useRef({});
  const iconTriggerRefs = useRef({});
  const newMainTaskRef = useRef(null);
  const containerRef = useRef(null);
  const activeTaskRef = useRef(null);

  // Use externalGroups when provided (always the case from DashboardGrid),
  // falling back to built-in defaults only for standalone/testing usage.
  const groups = useMemo(() => {
    if (Array.isArray(externalGroups) && externalGroups.length > 0) {
      return externalGroups;
    }
    return DEFAULT_TASK_GROUPS;
  }, [externalGroups]);

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNowMinutes()), 10000);
    return () => clearInterval(id);
  }, []);

  const activeId = useMemo(() => {
    if (!groups || groups.length === 0) return null;

    let bestActiveGroup = null;
    let maxPastStart = -1;
    let earliestGroup = null;
    let minStart = Infinity;

    for (const g of groups) {
      const start = parseTimeToMinutes(g.time);
      if (start !== null) {
        if (start < minStart) {
          minStart = start;
          earliestGroup = g;
        }
        if (start <= nowMinutes && start > maxPastStart) {
          maxPastStart = start;
          bestActiveGroup = g;
        }
      }
    }

    if (bestActiveGroup) {
      return bestActiveGroup.id;
    }
    if (earliestGroup) {
      return earliestGroup.id;
    }
    return groups[0]?.id || null;
  }, [groups, nowMinutes]);

  // Default to expanding the current active task relevant to time
  useEffect(() => {
    if (activeId) {
      setExpandedId(activeId);
    }
  }, [activeId]);

  const updateAtBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 12);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(updateAtBottom);
    return () => cancelAnimationFrame(raf);
  });

  useEffect(() => {
    const onResize = () => updateAtBottom();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auto-scroll active task to center on page load / refresh or activeId change
  useEffect(() => {
    if (!activeId) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      const target = activeTaskRef.current;
      if (container && target) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const targetTopRelativeToContainer =
          targetRect.top - containerRect.top + container.scrollTop;
        const targetCenter = targetTopRelativeToContainer + targetRect.height / 2;
        const containerCenter = container.clientHeight / 2;

        const scrollToTop = targetCenter - containerCenter;
        container.scrollTo({
          top: Math.max(0, scrollToTop),
          behavior: "smooth",
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeId]);

  const toggleSubtask = (groupId, subtaskId) => {
    const nextGroups = groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            subtasks: (g.subtasks || []).map((s) =>
              s.id === subtaskId ? { ...s, done: !s.done } : s,
            ),
          },
    );

    // Lift state up to parent (App.jsx) which persists it — no local shadow needed.
    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }

    const completedMainCount = nextGroups.filter(
      (g) => g.subtasks && g.subtasks.length > 0 && g.subtasks.every((s) => s.done),
    ).length;

    updateTodayCompletedTasksCount(completedMainCount);
  };

  const removeSubtask = (groupId, subtaskId) => {
    const nextGroups = groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            subtasks: (g.subtasks || []).filter((s) => s.id !== subtaskId),
          },
    );

    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }

    const completedMainCount = nextGroups.filter(
      (g) => g.subtasks && g.subtasks.length > 0 && g.subtasks.every((s) => s.done),
    ).length;

    updateTodayCompletedTasksCount(completedMainCount);
  };


  const reorderSubtask = (groupId, fromId, toId) => {
    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      const subtasks = g.subtasks || [];
      const fromIdx = subtasks.findIndex((s) => s.id === fromId);
      const toIdx = subtasks.findIndex((s) => s.id === toId);
      if (fromIdx === -1 || toIdx === -1) return g;
      const next = [...subtasks];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { ...g, subtasks: next };
    });

    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }
  };

  const addSubtask = (groupId) => {
    const text = newSubtaskText.trim();
    if (!text) return;
    const nextGroups = groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            subtasks: [
              ...(g.subtasks || []),
              { id: makeId(), text, done: false },
            ],
          },
    );
    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }
    setNewSubtaskText("");
  };

  const startEditSubtask = (groupId, subtask) => {
    setEditingSubtask({ groupId, subtaskId: subtask.id });
    setEditSubtaskText(subtask.text);
  };

  const saveEditSubtask = (groupId, subtaskId) => {
    const text = editSubtaskText.trim();
    if (text) {
      const nextGroups = groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              subtasks: (g.subtasks || []).map((s) =>
                s.id === subtaskId ? { ...s, text } : s,
              ),
            },
      );
      if (typeof onGroupsChange === "function") {
        onGroupsChange(nextGroups);
      }
    } else {
      removeSubtask(groupId, subtaskId);
    }
    setEditingSubtask(null);
    setEditSubtaskText("");
  };

  const cancelEditSubtask = () => {
    setEditingSubtask(null);
    setEditSubtaskText("");
  };

  const startEditGroup = (group) => {
    setEditingGroup(group.id);
    setEditGroupTitle(group.title || "");
  };

  const removeGroup = (groupId) => {
    const nextGroups = groups.filter((g) => g.id !== groupId);
    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }

    if (expandedId === groupId) setExpandedId(null);
    if (iconPickerGroupId === groupId) setIconPickerGroupId(null);

    const completedMainCount = nextGroups.filter(
      (g) => g.subtasks && g.subtasks.length > 0 && g.subtasks.every((s) => s.done),
    ).length;

    updateTodayCompletedTasksCount(completedMainCount);
  };

  const saveEditGroup = (groupId) => {
    const text = editGroupTitle.trim();
    if (text) {
      const nextGroups = groups.map((g) =>
        g.id === groupId ? { ...g, title: text } : g,
      );
      if (typeof onGroupsChange === "function") {
        onGroupsChange(nextGroups);
      }
    } else {
      removeGroup(groupId);
    }
    setEditingGroup(null);
    setEditGroupTitle("");
  };

  const cancelEditGroup = () => {
    setEditingGroup(null);
    setEditGroupTitle("");
  };

  const updateGroupIcon = (groupId, iconClass) => {
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, iconClass } : g,
    );
    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }
  };

  const addGroup = () => {
    const text = newMainTaskText.trim();
    if (!text) return;
    const g = {
      id: makeId(),
      title: text,
      iconClass: "ri-briefcase-line",
      time: "9:00 am",
      streak: 0,
      subtasks: [],
    };
    if (typeof onGroupsChange === "function") {
      onGroupsChange([...groups, g]);
    }
    setExpandedId(g.id);
    setNewMainTaskText("");
    setTimeout(() => {
      newMainTaskRef.current?.focus();
    }, 0);
  };

  const handleSubtaskDragStart = (e, groupId, subtaskId) => {
    if (
      editingSubtask &&
      editingSubtask.groupId === groupId &&
      editingSubtask.subtaskId === subtaskId
    ) {
      e.preventDefault();
      return;
    }
    setDraggedSubtask({ groupId, subtaskId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubtaskDragOver = (e, groupId, subtaskId) => {
    e.preventDefault();
    if (
      !dragOverSubtask ||
      dragOverSubtask.groupId !== groupId ||
      dragOverSubtask.subtaskId !== subtaskId
    ) {
      setDragOverSubtask({ groupId, subtaskId });
    }
  };

  const handleSubtaskDrop = (e, groupId, subtaskId) => {
    e.preventDefault();
    if (
      draggedSubtask &&
      draggedSubtask.groupId === groupId &&
      draggedSubtask.subtaskId !== subtaskId
    ) {
      reorderSubtask(groupId, draggedSubtask.subtaskId, subtaskId);
    }
    setDraggedSubtask(null);
    setDragOverSubtask(null);
  };

  const handleSubtaskDragEnd = () => {
    setDraggedSubtask(null);
    setDragOverSubtask(null);
  };

  return (
    <div className="group/widget figma-glass-static rounded-[26px] px-4 py-3 text-white font-gilroy-medium w-full h-full select-none flex flex-col shadow-2xl relative overflow-hidden">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between z-10 relative shrink-0 mb-3">
        <div
          className="flex items-center gap-2 text-white/70 text-xs font-gilroy-medium cursor-grab active:cursor-grabbing select-none"
          data-drag-handle
          {...dragHandleProps}
        >
          <i className="ri-draggable text-sm pointer-events-none"></i>
          <span className="pointer-events-none">Time Boxing</span>
        </div>
      </div>

      {/* Task Groups + Timeline */}
      <div
        ref={containerRef}
        onScroll={updateAtBottom}
        className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide z-10 relative pr-0.5"
      >
        <div className="flex flex-col">
          {groups.map((group, index) => {
            const total = group.subtasks.length;
            const done = group.subtasks.filter((s) => s.done).length;
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);
            const expanded = expandedId === group.id;
            const active = activeId === group.id;
            const isFirst = index === 0;
            const isLast = index === groups.length - 1;

            const isCompleted = total > 0 && done === total;
            const baseStreak = group.baseStreak ?? group.streak ?? 0;
            const displayStreak = baseStreak + (isCompleted ? 1 : 0);

            return (
              <div
                key={group.id}
                ref={active ? activeTaskRef : null}
                className="flex items-stretch"
              >
                {/* Task Group Card */}
                <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-5"}`}>
                  <div
                    className={`timebox-task-card relative rounded-[18px] border px-4 pt-3.5 pb-4 ${
                      iconPickerGroupId === group.id ? "overflow-visible" : "overflow-hidden"
                    } shadow-lg transition-all duration-300 ${
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
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : group.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <button
                            ref={(el) => {
                              iconTriggerRefs.current[group.id] = el;
                            }}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIconPickerGroupId(
                                iconPickerGroupId === group.id ? null : group.id,
                              );
                            }}
                            title="Change icon"
                            className="shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0 shadow-none"
                          >
                            {group.iconClass && (group.iconClass.startsWith("img:") || group.iconClass.startsWith("http") || group.iconClass.startsWith("data:")) ? (
                              <img
                                src={group.iconClass.replace(/^img:/, "")}
                                alt=""
                                className="w-[18px] h-[18px] object-contain shrink-0"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <i
                                className={`${group.iconClass || "ri-briefcase-line"} text-[17px] ${
                                  active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white/75"
                                }`}
                              />
                            )}
                          </button>
                          {iconPickerGroupId === group.id && (
                            <IconDropdownPopover
                              triggerRef={{ current: iconTriggerRefs.current[group.id] }}
                              current={group.iconClass || "ri-briefcase-line"}
                              onSelect={(newIcon) => {
                                updateGroupIcon(group.id, newIcon);
                                setIconPickerGroupId(null);
                              }}
                              onClose={() => setIconPickerGroupId(null)}
                            />
                          )}
                        </div>
                        {editingGroup === group.id ? (
                          <input
                            autoFocus
                            value={editGroupTitle}
                            onChange={(e) => setEditGroupTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={() => saveEditGroup(group.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEditGroup(group.id);
                                const nextGroup = groups[index + 1];
                                if (nextGroup) {
                                  startEditGroup(nextGroup);
                                } else {
                                  setTimeout(() => {
                                    newMainTaskRef.current?.focus();
                                  }, 0);
                                }
                              }
                              if (e.key === "Escape") cancelEditGroup();
                            }}
                            onDragStart={(e) => e.preventDefault()}
                            className={`flex-1 min-w-0 bg-transparent outline-none select-text font-gilroy-bold text-[15px] ${
                              active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"
                            }`}
                          />
                        ) : (
                          <h3
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditGroup(group);
                            }}
                            title="Click to edit"
                            className={`font-gilroy-bold text-[15px] truncate cursor-text ${
                              active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"
                            }`}
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
                        ></i>
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
                          <i className={`ri-fire-fill text-sm ${displayStreak > 0 ? "animate-pulse" : ""}`}></i>
                          <span className="text-[11px]">
                            {displayStreak}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Expanded Subtask Tree */}
                    {expanded && (
                      <div className="relative mt-1.5">
                        {group.subtasks.map((subtask, subIndex) => {
                          const isLastSubtask =
                            subIndex === group.subtasks.length - 1;
                          const isDragging =
                            draggedSubtask &&
                            draggedSubtask.groupId === group.id &&
                            draggedSubtask.subtaskId === subtask.id;
                          const isDragOver =
                            dragOverSubtask &&
                            dragOverSubtask.groupId === group.id &&
                            dragOverSubtask.subtaskId === subtask.id;
                          return (
                            <div
                              key={subtask.id}
                              draggable
                              onDragStart={(e) =>
                                handleSubtaskDragStart(
                                  e,
                                  group.id,
                                  subtask.id,
                                )
                              }
                              onDragOver={(e) =>
                                handleSubtaskDragOver(
                                  e,
                                  group.id,
                                  subtask.id,
                                )
                              }
                              onDrop={(e) =>
                                handleSubtaskDrop(e, group.id, subtask.id)
                              }
                              onDragEnd={handleSubtaskDragEnd}
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
                                onClick={() =>
                                  toggleSubtask(group.id, subtask.id)
                                }
                                className="timebox-subtask-check shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0 shadow-none"
                              >
                                {subtask.done ? (
                                  <i
                                    className={`ri-checkbox-circle-fill text-[15px] ${
                                      active
                                        ? "text-[color:var(--theme-4,#0F172A)] opacity-85"
                                        : "text-white/65"
                                    }`}
                                  ></i>
                                ) : (
                                  <i
                                    className={`ri-checkbox-blank-circle-line text-[15px] ${
                                      active
                                        ? "text-[color:var(--theme-4,#0F172A)] opacity-60 hover:opacity-100"
                                        : "text-white/50 hover:text-white"
                                    }`}
                                  ></i>
                                )}
                              </button>
                              {editingSubtask?.groupId === group.id &&
                              editingSubtask?.subtaskId === subtask.id ? (
                                <input
                                  autoFocus
                                  value={editSubtaskText}
                                  onChange={(e) =>
                                    setEditSubtaskText(e.target.value)
                                  }
                                  onBlur={() =>
                                    saveEditSubtask(group.id, subtask.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      saveEditSubtask(group.id, subtask.id);
                                      const nextSubtask = group.subtasks[subIndex + 1];
                                      if (nextSubtask) {
                                        startEditSubtask(group.id, nextSubtask);
                                      } else {
                                        setTimeout(() => {
                                          subtaskInputRefs.current[group.id]?.focus();
                                        }, 0);
                                      }
                                    }
                                    if (e.key === "Escape")
                                      cancelEditSubtask();
                                  }}
                                  onDragStart={(e) => e.preventDefault()}
                                  className={`flex-1 min-w-0 bg-transparent outline-none select-text text-xs font-gilroy-medium ${
                                    active
                                      ? "text-[color:var(--theme-4,#0F172A)]"
                                      : "text-white"
                                  }`}
                                />
                              ) : (
                                <span
                                  onClick={() =>
                                    startEditSubtask(group.id, subtask)
                                  }
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
                                  removeSubtask(group.id, subtask.id);
                                }}
                                className={`opacity-0 group-hover/subtask:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0 ${
                                  active
                                    ? "text-[color:var(--theme-4,#0F172A)]/40 hover:text-[color:var(--theme-4,#0F172A)]"
                                    : "text-white/30 hover:text-white/80"
                                }`}
                                title="Delete subtask"
                              >
                                <i className="ri-close-line text-xs"></i>
                              </button>
                            </div>
                          );
                        })}

                        {/* Add New Subtask Row */}
                        <div className={`relative flex items-center gap-2.5 py-[5px] pl-7 transition-opacity duration-200 ${
                          newSubtaskText ? "opacity-100" : "opacity-0 group-hover/widget:opacity-100 focus-within:opacity-100"
                        }`}>
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
                              active
                                ? "text-[color:var(--theme-4,#0F172A)] opacity-50"
                                : "text-white/30"
                            }`}
                          />
                          <input
                            ref={(el) => {
                              subtaskInputRefs.current[group.id] = el;
                            }}
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSubtask(group.id);
                                setTimeout(() => {
                                  subtaskInputRefs.current[group.id]?.focus();
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
                      isFirst
                        ? "top-[9px] bottom-0"
                        : isLast
                          ? "top-0 h-[9px]"
                          : "top-0 bottom-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[4px] h-[10px] w-[10px] rounded-full transition-all duration-300 ${
                      active
                        ? "scale-125 shadow-[0_0_10px_var(--theme-1,#CBD5E1)]"
                        : "bg-white/60"
                    }`}
                    style={{
                      backgroundColor: active ? "var(--theme-1, #CBD5E1)" : undefined,
                    }}
                  />
                  <span
                    className={`absolute left-[16px] top-[2px] text-[10px] leading-[14px] font-gilroy-medium whitespace-nowrap transition-colors ${
                      active ? "text-white font-gilroy-bold" : "text-white/55"
                    }`}
                  >
                    {group.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add New Main Task Row */}
          <div
            className={`flex items-center gap-2.5 pl-1.5 py-1.5 transition-opacity duration-200 ${
              atBottom
                ? "opacity-0 group-hover/widget:opacity-100 focus-within:opacity-100"
                : "opacity-0"
            }`}
          >
            <i className="ri-add-circle-line text-[15px] shrink-0 text-white/35"></i>
            <input
              ref={newMainTaskRef}
              value={newMainTaskText}
              onChange={(e) => setNewMainTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGroup();
                }
              }}
              placeholder="Add new routine..."
              className="flex-1 min-w-0 bg-transparent outline-none select-text text-xs font-gilroy-medium text-white/90 placeholder:text-white/50 focus:placeholder:text-white/35"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBoxing;
