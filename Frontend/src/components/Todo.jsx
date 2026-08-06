import React, { useEffect, useState } from "react";
import { recordActivity } from "../utils/activityStore";

const STORAGE = {
  items: "todo_items_v2",
};

import { storageGet, storageSet } from "../utils/storage.js";

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return String(Date.now() + Math.random());
};

const DEFAULT_DEMO_TASKS = [
  { id: "demo-1", text: "Job Apply On LinkedIn", done: true },
  { id: "demo-2", text: "TCS Form Fill", done: true },
  { id: "demo-3", text: "Command Code Subs Ends", done: true },
  { id: "demo-4", text: "LinkedIn Post", done: false },
];

const Todo = ({ dragHandleProps }) => {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = await storageGet(STORAGE.items);
      if (cancelled) return;

      try {
        const parsed = JSON.parse(String(raw ?? "[]"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        } else {
          setTasks(DEFAULT_DEMO_TASKS);
        }
      } catch {
        setTasks(DEFAULT_DEMO_TASKS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      storageSet(STORAGE.items, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    const text = newText.trim();
    if (!text) return;

    const task = {
      id: makeId(),
      text,
      done: false,
    };

    setTasks((prev) => [...prev, task]);
    setNewText("");
  };

  const toggleDone = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.done) recordActivity(1);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="figma-glass-static rounded-[26px] px-4 py-3 text-white font-gilroy-medium w-full h-full select-none flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between z-10 relative shrink-0 mb-3">
        <div
          className="flex items-center gap-2 text-white/70 text-xs font-gilroy-medium cursor-grab active:cursor-grabbing select-none"
          data-drag-handle
          {...dragHandleProps}
        >
          <i className="ri-draggable text-sm pointer-events-none"></i>
          <span className="pointer-events-none">Notepad</span>
        </div>
      </div>

      {/* Task Items & Inline Add Task Input */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-1.5 z-10 pr-0.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group/task flex items-center gap-2.5 text-xs sm:text-sm py-0.5 transition-colors"
          >
            {/* Checked / Unchecked Circle Icon */}
            <button
              type="button"
              onClick={() => toggleDone(task.id)}
              className="shrink-0 text-white/80 hover:text-white cursor-pointer focus:outline-none"
            >
              {task.done ? (
                <i className="ri-checkbox-circle-fill text-base text-white/70"></i>
              ) : (
                <i className="ri-checkbox-blank-circle-line text-base text-white/60 hover:text-white"></i>
              )}
            </button>

            {/* Task Title */}
            <span
              onClick={() => toggleDone(task.id)}
              className={`flex-1 min-w-0 font-gilroy-medium cursor-pointer truncate ${
                task.done ? "line-through text-white/40" : "text-white/90"
              }`}
            >
              {task.text}
            </span>

            {/* Hover Delete Action */}
            <button
              type="button"
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover/task:opacity-100 text-white/30 hover:text-white/80 transition-opacity p-0.5 cursor-pointer shrink-0"
              title="Delete task"
            >
              <i className="ri-close-line text-xs"></i>
            </button>
          </div>
        ))}

        {/* Inline Add Task Row (matching mockup screenshot) */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm py-0.5">
          <i className="ri-checkbox-blank-circle-line text-base text-white/30 shrink-0"></i>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            className="w-full bg-transparent outline-none font-gilroy-medium text-white placeholder:text-white/30 text-xs sm:text-sm"
            placeholder="TO Do..."
          />
        </div>
      </div>
    </div>
  );
};

export default Todo;
