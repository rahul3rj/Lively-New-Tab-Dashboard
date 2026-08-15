import React, { useRef, useState } from "react";
import { IconDropdownPopover } from "../IconPicker.jsx";
import { CardContainer, InputField, makeId } from "./SettingsPrims.jsx";

/* ─── TAB 4: Important Tabs ─── */
export const ImportantTabsTab = ({ _showImportantTabs, _onShowImportantTabsChange, importantTabsConfig, onImportantTabsConfigChange, uiTheme = "default" }) => {
  const [iconPickerTabId, setIconPickerTabId] = useState(null);
  const [expandedTabId, setExpandedTabId] = useState(null);
  const buttonRefs = useRef({});

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const anyPickerOpen = iconPickerTabId !== null;

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
    const updated = [...importantTabsConfig];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);
    onImportantTabsConfigChange(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const addTab = () => {
    const newTab = { id: makeId(), title: "New Tab Group", iconClass: "ri-globe-line", links: [] };
    onImportantTabsConfigChange([...importantTabsConfig, newTab]);
    setExpandedTabId(newTab.id);
  };

  const removeTab = (id) => onImportantTabsConfigChange(importantTabsConfig.filter((t) => t.id !== id));

  const updateTab = (id, patch) =>
    onImportantTabsConfigChange(importantTabsConfig.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addLink = (tabId) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, {
      links: [...tab.links, { id: makeId(), label: "Link", url: "https://" }],
    });
  };

  const removeLink = (tabId, linkId) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, { links: tab.links.filter((l) => l.id !== linkId) });
  };

  const updateLink = (tabId, linkId, patch) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, {
      links: tab.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
    });
  };

  return (
    <CardContainer
      overflowVisible={anyPickerOpen}
      title="Important Tabs Bundles"
      description="Organize multiple website links into one-click tab groups. Drag tab cards up or down to reorder them."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col gap-4">
          {(importantTabsConfig || []).map((tab, idx) => {
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-black/25 border rounded-2xl transition-all shadow-sm relative ${
                  iconPickerTabId === tab.id ? "z-30 overflow-visible" : "z-10 overflow-hidden"
                } ${
                  isDragging
                    ? "opacity-40 border-dashed border-white/40 scale-[0.99]"
                    : isDragOver
                    ? "border-[color:var(--theme)] bg-[color:var(--theme)]/15 scale-[1.01]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3">
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
                      ref={(el) => (buttonRefs.current[tab.id] = el)}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerTabId(iconPickerTabId === tab.id ? null : tab.id);
                      }}
                      className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 flex items-center justify-center text-white text-xl transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                      title="Change Icon"
                    >
                      {tab.iconClass && (tab.iconClass.startsWith("img:") || tab.iconClass.startsWith("http") || tab.iconClass.startsWith("data:")) ? (
                        <img src={tab.iconClass.replace(/^img:/, "")} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <i className={`${tab.iconClass || "ri-globe-line"} relative z-10`} />
                      )}
                    </button>

                    {iconPickerTabId === tab.id && (
                      <IconDropdownPopover
                        triggerRef={{ current: buttonRefs.current[tab.id] }}
                        current={tab.iconClass}
                        onSelect={(ic) => updateTab(tab.id, { iconClass: ic })}
                        onClose={() => setIconPickerTabId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <InputField
                      value={tab.title}
                      onChange={(e) => updateTab(tab.id, { title: e.target.value })}
                      placeholder="Tab Group Title"
                      className="w-full font-gilroy-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setExpandedTabId(expandedTabId === tab.id ? null : tab.id)}
                      className="h-10 px-3.5 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 text-xs text-white/80 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <span className="text-xs font-gilroy-medium">{tab.links?.length || 0} links</span>
                      <i className={`ri-arrow-${expandedTabId === tab.id ? "up" : "down"}-s-line text-sm relative z-10`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTab(tab.id)}
                      className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                      title="Remove Tab Group"
                    >
                      <i className="ri-delete-bin-6-line text-sm" />
                    </button>
                  </div>
                </div>

                {expandedTabId === tab.id && (
                  <div className="border-t border-white/10 p-3 bg-black/20 flex flex-col gap-2">
                    {tab.links?.map((link) => (
                      <div key={link.id} className="flex items-center gap-2.5">
                        <i className="ri-corner-down-right-line text-white/40 text-sm shrink-0 ml-1.5" />
                        <div className="w-36 shrink-0">
                          <InputField
                            value={link.label}
                            onChange={(e) => updateLink(tab.id, link.id, { label: e.target.value })}
                            placeholder="Label (e.g. Docs)"
                            className="w-full h-9 rounded-xl text-xs bg-black/30 border-white/10"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <InputField
                            value={link.url}
                            onChange={(e) => updateLink(tab.id, link.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="w-full h-9 rounded-xl text-xs bg-black/30 border-white/10"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(tab.id, link.id)}
                          className="h-9 w-9 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95"
                          title="Remove Link"
                        >
                          <i className="ri-close-line text-base" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLink(tab.id)}
                      className="mt-1.5 self-start px-4 py-1.5 rounded-xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <i className="ri-add-line text-xs relative z-10" />
                      <span className="relative z-10">Add Link</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addTab}
          className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md mt-1"
        >
          <i className="ri-add-line text-base relative z-10" />
          <span className="relative z-10">Add Tab Group</span>
        </button>
      </div>
    </CardContainer>
  );
};
