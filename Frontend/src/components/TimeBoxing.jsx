import React, { useEffect, useMemo, useRef, useState } from "react";
import { updateTodayCompletedTasksCount } from "../utils/activityStore";
import { TimeBoxingTaskCard } from "./timeboxing/TimeBoxingTaskCard.jsx";

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
  const [draggedGroup, setDraggedGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [newMainTaskText, setNewMainTaskText] = useState("");
  const [atBottom, setAtBottom] = useState(true);

  const newMainTaskRef = useRef(null);
  const containerRef = useRef(null);
  const activeTaskRef = useRef(null);

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

    if (bestActiveGroup) return bestActiveGroup.id;
    if (earliestGroup) return earliestGroup.id;
    return groups[0]?.id || null;
  }, [groups, nowMinutes]);

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

  const notifyTaskCount = (nextGroups) => {
    const completedMainCount = nextGroups.filter(
      (g) => g.subtasks && g.subtasks.length > 0 && g.subtasks.every((s) => s.done),
    ).length;
    updateTodayCompletedTasksCount(completedMainCount);
  };

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
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
    notifyTaskCount(nextGroups);
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
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
    notifyTaskCount(nextGroups);
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
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
  };

  const addSubtask = (groupId, text) => {
    const nextGroups = groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            subtasks: [...(g.subtasks || []), { id: makeId(), text, done: false }],
          },
    );
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
  };

  const saveEditSubtask = (groupId, subtaskId, text) => {
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
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
  };

  const removeGroup = (groupId) => {
    const nextGroups = groups.filter((g) => g.id !== groupId);
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
    if (expandedId === groupId) setExpandedId(null);
    notifyTaskCount(nextGroups);
  };

  const saveEditGroup = (groupId, text) => {
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, title: text } : g,
    );
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
  };

  const updateGroupIcon = (groupId, iconClass) => {
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, iconClass } : g,
    );
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
  };

  const updateGroupTime = (groupId, time) => {
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, time } : g,
    );
    if (typeof onGroupsChange === "function") onGroupsChange(nextGroups);
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
    if (typeof onGroupsChange === "function") onGroupsChange([...groups, g]);
    setExpandedId(g.id);
    setNewMainTaskText("");
    setTimeout(() => {
      newMainTaskRef.current?.focus();
    }, 0);
  };

  const reorderGroups = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const next = [...groups];
    const fromTime = next[fromIndex]?.time;
    const toTime = next[toIndex]?.time;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    if (fromTime !== undefined) next[fromIndex] = { ...next[fromIndex], time: fromTime };
    if (toTime !== undefined) next[toIndex] = { ...next[toIndex], time: toTime };
    if (typeof onGroupsChange === "function") onGroupsChange(next);
  };

  const handleGroupDragStart = (e, index) => {
    setDraggedGroup(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGroupDragOver = (e, index) => {
    e.preventDefault();
    if (draggedGroup === null) return;
    if (dragOverGroup !== index) setDragOverGroup(index);
  };

  const handleGroupDrop = (e, index) => {
    e.preventDefault();
    if (draggedGroup === null) return;
    if (draggedGroup !== index) reorderGroups(draggedGroup, index);
    setDraggedGroup(null);
    setDragOverGroup(null);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroup(null);
    setDragOverGroup(null);
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
          <i className="ri-draggable text-sm pointer-events-none" />
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
          {groups.map((group, index) => (
            <TimeBoxingTaskCard
              key={group.id}
              group={group}
              index={index}
              totalGroups={groups.length}
              active={activeId === group.id}
              expanded={expandedId === group.id}
              onToggleExpand={() => setExpandedId(expandedId === group.id ? null : group.id)}
              onGroupDragStart={handleGroupDragStart}
              onGroupDragOver={handleGroupDragOver}
              onGroupDrop={handleGroupDrop}
              onGroupDragEnd={handleGroupDragEnd}
              isDraggingGroup={draggedGroup === index}
              isDragOverGroup={dragOverGroup === index && draggedGroup !== index}
              onToggleSubtask={toggleSubtask}
              onRemoveSubtask={removeSubtask}
              onReorderSubtask={reorderSubtask}
              onAddSubtask={addSubtask}
              onSaveEditSubtask={saveEditSubtask}
              onSaveEditGroup={saveEditGroup}
              onRemoveGroup={removeGroup}
              onUpdateGroupIcon={updateGroupIcon}
              onUpdateGroupTime={updateGroupTime}
              activeTaskRef={activeTaskRef}
              onFocusNextTask={() => {
                const nextGroup = groups[index + 1];
                if (!nextGroup) {
                  setTimeout(() => newMainTaskRef.current?.focus(), 0);
                }
              }}
            />
          ))}

          {/* Add New Main Task Row */}
          <div
            className={`flex items-center gap-2.5 pl-1.5 py-1.5 transition-opacity duration-200 ${
              atBottom
                ? "opacity-0 group-hover/widget:opacity-100 focus-within:opacity-100"
                : "opacity-0"
            }`}
          >
            <i className="ri-add-circle-line text-[15px] shrink-0 text-white/35" />
            <input
              ref={newMainTaskRef}
              value={newMainTaskText}
              onChange={(e) => setNewMainTaskText(e.target.value)}
              onDragStart={(e) => e.preventDefault()}
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
