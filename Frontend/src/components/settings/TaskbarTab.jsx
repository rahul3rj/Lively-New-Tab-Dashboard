import React, { useRef, useState } from "react";
import { IconDropdownPopover } from "../IconPicker.jsx";
import { CardContainer, InputField } from "./SettingsPrims.jsx";

/* ─── TAB 4: Taskbar Shortcuts ─── */
export const TaskbarTab = ({
  shortcuts, onShortcutUpdate, onShortcutRemove, onShortcutAdd, onShortcutIconPick, onShortcutsReorder, uiTheme = "default",
}) => {
  const [iconPickerShortcutId, setIconPickerShortcutId] = useState(null);
  const buttonRefs = useRef({});

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const anyPickerOpen = iconPickerShortcutId !== null;

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...shortcuts];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);
    if (typeof onShortcutsReorder === "function") {
      onShortcutsReorder(updated);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Taskbar Shortcuts */}
      <CardContainer
        overflowVisible={anyPickerOpen}
        title="Taskbar Quick Launchers"
        description="Customize AI tools, developer bookmarks, and custom web links in your top taskbar. Drag shortcut cards up or down to reorder them."
        action={
          <button
            type="button"
            onClick={onShortcutAdd}
            className="px-3.5 py-2 rounded-2xl bg-[color:var(--theme)] hover:brightness-110 text-white font-gilroy-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md whitespace-nowrap shrink-0"
          >
            <i className="ri-add-line text-sm relative z-10" />
            <span className="relative z-10">Add Shortcut</span>
          </button>
        }
      >
        <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
          {(shortcuts || []).map((s, idx) => {
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-black/25 border rounded-2xl transition-all shadow-sm relative ${
                  iconPickerShortcutId === s.id ? "z-30 overflow-visible" : "z-10 overflow-hidden"
                } ${
                  isDragging
                    ? "opacity-40 border-dashed border-white/40 scale-[0.99]"
                    : isDragOver
                    ? "border-[color:var(--theme)] bg-[color:var(--theme)]/15 scale-[1.01]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3">
                  {/* Drag Handle */}
                  <div
                    className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 transition-colors p-1 shrink-0 flex items-center justify-center"
                    title="Drag to reorder"
                  >
                    <i className="ri-drag-move-fill text-base" />
                  </div>

                  {/* Icon Button with Inline Dropdown */}
                  <div className="relative shrink-0">
                    <button
                      ref={(el) => (buttonRefs.current[s.id] = el)}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerShortcutId(iconPickerShortcutId === s.id ? null : s.id);
                      }}
                      className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0 group/ic active:scale-95 shadow-inner"
                      title="Change Icon"
                    >
                      {s.iconDataUrl || s.iconUrl ? (
                        <img src={s.iconDataUrl || s.iconUrl} alt="" className="h-5 w-5 object-contain" />
                      ) : s.iconClass && (s.iconClass.startsWith("img:") || s.iconClass.startsWith("http") || s.iconClass.startsWith("data:")) ? (
                        <img src={s.iconClass.replace(/^img:/, "")} alt="" className="h-5 w-5 object-contain" />
                      ) : s.iconClass ? (
                        <i className={`${s.iconClass} text-white text-xl group-hover/ic:scale-110 transition-transform`} />
                      ) : (
                        <i className="ri-link text-white text-xl" />
                      )}
                    </button>

                    {iconPickerShortcutId === s.id && (
                      <IconDropdownPopover
                        triggerRef={{ current: buttonRefs.current[s.id] }}
                        current={s.iconClass}
                        onSelect={(ic) => onShortcutUpdate(s.id, { iconClass: ic, iconDataUrl: null, iconUrl: null })}
                        onClose={() => setIconPickerShortcutId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <InputField
                      value={s.title ?? ""}
                      onChange={(e) => onShortcutUpdate(s.id, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full"
                    />
                    <InputField
                      value={s.url ?? ""}
                      onChange={(e) => onShortcutUpdate(s.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`sc-icon-${s.id}`}
                      onChange={(e) => onShortcutIconPick(s.id, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`sc-icon-${s.id}`)?.click()}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                      title="Upload image favicon"
                    >
                      <i className="ri-image-line text-xs" />
                      <span className="hidden sm:inline">Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onShortcutRemove(s.id)}
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                      title="Remove Shortcut"
                    >
                      <i className="ri-delete-bin-6-line text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContainer>
    </div>
  );
};
