import React from 'react'

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`

const COMPARISON_DATA = [
  {
    feature: 'Free & Open Source',
    projectOS: true,
    momentum: false,
    tabliss: true,
    newTabStudio: false,
  },
  {
    feature: '100% Local / No Account',
    projectOS: true,
    momentum: false,
    tabliss: true,
    newTabStudio: false,
  },
  {
    feature: 'Drag & Drop Widgets',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: true,
  },
  {
    feature: 'Pomodoro Timer',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'Time-Boxing Planner',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'Activity Streak Grid',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'Lofi Radio / Music Player',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'Hydration Tracker',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'Multiple Visual Themes',
    projectOS: true,
    momentum: false,
    tabliss: true,
    newTabStudio: false,
  },
  {
    feature: 'Video Backgrounds',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'JSON Backup / Restore',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
  {
    feature: 'GitHub Streak Integration',
    projectOS: true,
    momentum: false,
    tabliss: false,
    newTabStudio: false,
  },
]

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-white mx-auto inline-block"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
  </svg>
)

const CrossIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-zinc-500 mx-auto inline-block"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4L12 12M12 4L4 12" />
  </svg>
)

const Comparison = () => {
  return (
    <section className="relative w-full min-h-screen bg-black text-white pt-20 md:pt-10 flex flex-col justify-center select-none overflow-hidden">
      {/* Top Header Row: Left Title & Right Subtitle */}
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-0 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 mb-10 md:mb-14">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none mx-14">
          Comparison
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed max-w-[280px] sm:text-right mx-14">
          We built what the existing new tab
          <br className="hidden sm:inline" /> extensions were too afraid to ship.
        </p>
      </div>

      {/* Full-width strip with horizontal lines stretching edge to edge */}
      <div className="relative w-full border-y border-white/15">
        {/* Inner bounded container with vertical borders and corner node circles */}
        <div className="relative max-w-[960px] mx-auto border-x border-white/15">
          {/* 4 Corner Intersection Circle Nodes */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />

          {/* Extended Full-Width Line Below Features Header with Intersection Nodes */}
          <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 w-screen border-b border-white/15 pointer-events-none z-10" />
          <div className="absolute top-14 sm:top-16 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
          <div className="absolute top-14 sm:top-16 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />

          {/* Comparison Table Scroll Container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[640px] w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] h-14 sm:h-16 border-b border-white/15 items-center text-center">
                <div className="px-6 text-left font-rejoice font-bold text-xs sm:text-sm text-white">
                  Features
                </div>
                <div className="relative h-full px-4 font-rejoice font-bold text-xs sm:text-sm text-white border-x border-white/10 bg-white/[0.035] overflow-hidden flex items-center justify-center">
                  {/* Noise Background Overlay on Project OS header */}
                  <div
                    className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none"
                    style={{
                      backgroundImage: `url("${NOISE_BG}")`,
                      backgroundSize: '150px 150px',
                    }}
                  />
                  <span className="relative z-10">Project OS</span>
                </div>
                <div className="px-4 font-rejoice font-bold text-xs sm:text-sm text-white border-r border-white/10">
                  Momentum
                </div>
                <div className="px-4 font-rejoice font-bold text-xs sm:text-sm text-white border-r border-white/10">
                  Tabliss
                </div>
                <div className="px-4 font-rejoice font-bold text-xs sm:text-sm text-white">
                  New Tab Studio
                </div>
              </div>

            {/* Table Rows */}
            {COMPARISON_DATA.map((row, idx) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center text-center ${
                  idx !== COMPARISON_DATA.length - 1 ? 'border-b border-white/15' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                {/* Feature Name */}
                <div className="py-2 sm:py-2.5 px-6 text-left text-[11px] sm:text-xs md:text-[11px] font-gilroy font-light text-zinc-300">
                  {row.feature}
                </div>

                {/* Project OS Column with Noise Texture Highlight */}
                <div className="relative py-2 sm:py-2.5 px-4 border-x border-white/10 bg-white/[0.035] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none"
                    style={{
                      backgroundImage: `url("${NOISE_BG}")`,
                      backgroundSize: '150px 150px',
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center">
                    {row.projectOS ? <CheckIcon /> : <CrossIcon />}
                  </div>
                </div>

                {/* Momentum */}
                <div className="py-2 sm:py-2.5 px-4 border-r border-white/10 flex items-center justify-center">
                  {row.momentum ? <CheckIcon /> : <CrossIcon />}
                </div>

                {/* Tabliss */}
                <div className="py-2 sm:py-2.5 px-4 border-r border-white/10 flex items-center justify-center">
                  {row.tabliss ? <CheckIcon /> : <CrossIcon />}
                </div>

                {/* New Tab Studio */}
                <div className="py-2 sm:py-2.5 px-4 flex items-center justify-center">
                  {row.newTabStudio ? <CheckIcon /> : <CrossIcon />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)
}

export default Comparison