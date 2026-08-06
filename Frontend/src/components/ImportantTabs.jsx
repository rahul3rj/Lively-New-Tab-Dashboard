import React, { useState } from "react";

const DEFAULT_TABS = [
  { id: "tab-1", title: "Study", iconClass: "ri-book-open-line", links: [] },
  { id: "tab-2", title: "AI Engineering", iconClass: "ri-gemini-fill", links: [] },
  { id: "tab-3", title: "DSA (LeetCode & CP)", iconClass: "ri-code-s-slash-line", links: [] },
  { id: "tab-4", title: "News", iconClass: "ri-newspaper-line", links: [] },
];

const ImportantTabs = ({ dragHandleProps, tabsConfig }) => {
  const tabs = tabsConfig && tabsConfig.length > 0 ? tabsConfig : DEFAULT_TABS;

  const openTab = (tab) => {
    const links = Array.isArray(tab.links) ? tab.links : [];
    if (links.length === 0) return;
    // open all links in new tabs
    links.forEach((link) => {
      if (link.url && link.url !== "https://") {
        window.open(link.url, "_blank", "noopener,noreferrer");
      }
    });
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
          <span className="pointer-events-none">Important Tabs</span>
        </div>
      </div>

      {/* Tabs List */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col justify-start gap-1.5 z-10 pr-0.5">
        {tabs.map((tab) => {
          const hasLinks = Array.isArray(tab.links) && tab.links.length > 0;
          return (
            <div
              key={tab.id}
              className="flex items-center justify-between gap-2.5 text-xs sm:text-sm py-0.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className={`${tab.iconClass || "ri-globe-line"} text-white/80 text-base shrink-0`}></i>
                <span className="font-gilroy-medium text-xs sm:text-sm text-white/90 truncate">
                  {tab.title}
                </span>
                {hasLinks && (
                  <span className="text-[10px] text-white/35 font-gilroy-medium shrink-0">
                    {tab.links.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openTab(tab)}
                className={`h-6 w-6 rounded-full bg-white/10 active:scale-95 transition-all flex items-center justify-center text-white/80 group-hover:border border-white/20 shrink-0 cursor-pointer ${
                  !hasLinks ? "opacity-40 cursor-not-allowed" : ""
                }`}
                title={hasLinks ? `Open ${tab.links.length} link${tab.links.length > 1 ? "s" : ""}` : "No links added yet"}
              >
                <i className="ri-arrow-right-s-line text-base"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportantTabs;
