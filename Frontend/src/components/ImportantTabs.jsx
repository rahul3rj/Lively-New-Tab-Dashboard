import React from "react";

const DEFAULT_TABS = [
  {
    id: "tab-1",
    title: "Daily Work & Productivity",
    iconClass: "ri-briefcase-line",
    links: [
      { id: "link-1-1", label: "Gmail", url: "https://mail.google.com" },
      { id: "link-1-2", label: "Google Calendar", url: "https://calendar.google.com" },
      { id: "link-1-3", label: "Notion", url: "https://www.notion.so" },
    ],
  },
  {
    id: "tab-2",
    title: "Developer Tools",
    iconClass: "ri-code-s-slash-line",
    links: [
      { id: "link-2-1", label: "GitHub", url: "https://github.com" },
      { id: "link-2-2", label: "Stack Overflow", url: "https://stackoverflow.com" },
      { id: "link-2-3", label: "MDN Web Docs", url: "https://developer.mozilla.org" },
    ],
  },
  {
    id: "tab-3",
    title: "Design & Inspiration",
    iconClass: "ri-palette-line",
    links: [
      { id: "link-3-1", label: "Figma", url: "https://www.figma.com" },
      { id: "link-3-2", label: "Dribbble", url: "https://dribbble.com" },
      { id: "link-3-3", label: "Unsplash", url: "https://unsplash.com" },
    ],
  },
  {
    id: "tab-4",
    title: "News & Tech Reads",
    iconClass: "ri-newspaper-line",
    links: [
      { id: "link-4-1", label: "Hacker News", url: "https://news.ycombinator.com" },
      { id: "link-4-2", label: "TechCrunch", url: "https://techcrunch.com" },
      { id: "link-4-3", label: "Medium", url: "https://medium.com" },
    ],
  },
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
                {tab.iconClass && (tab.iconClass.startsWith("img:") || tab.iconClass.startsWith("http") || tab.iconClass.startsWith("data:")) ? (
                  <img
                    src={tab.iconClass.replace(/^img:/, "")}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <i className={`${tab.iconClass || "ri-globe-line"} text-white/80 text-base shrink-0`} />
                )}
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
