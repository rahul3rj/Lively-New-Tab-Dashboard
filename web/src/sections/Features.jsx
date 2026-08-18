import React, { useState, useRef, useEffect, useCallback } from "react";

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const FEATURE_CARDS = [
  {
    index: 0,
    number: '#01',
    badge: 'Focus Engine',
    title: 'Pomodoro Focus Timer',
    desc: 'Customizable work and rest cycles with audio alerts, browser notifications, and automatic streak logging.',
    icon: 'ri-timer-flash-line',
    subtag: 'Work / Rest Cycles',
    status: 'Auto-Syncs Streaks',
    isLeft: true,
  },
  {
    index: 1,
    number: '#02',
    badge: 'Habit Engine',
    title: 'Time-Boxing Planner',
    desc: 'Hourly routine blocks with subtask checklists, automatic UTC daily reset, and habit streak counters.',
    icon: 'ri-calendar-check-line',
    subtag: 'Routine Blocks',
    status: 'UTC 00:00 Reset',
    isLeft: false,
  },
  {
    index: 2,
    number: '#03',
    badge: 'Productivity Heatmap',
    title: 'Activity Streak Matrix',
    desc: 'GitHub-style contribution calendar mapping focus intensity and syncing with real GitHub commit history.',
    icon: 'ri-bar-chart-grouped-line',
    subtag: 'Contribution Heatmap',
    status: 'GitHub Sync',
    isLeft: false,
  },
  {
    index: 3,
    number: '#04',
    badge: 'Ambient Audio',
    title: 'Lofi & Media Player',
    desc: '24/7 live lofi radio stations, YouTube audio background streams, and Spotify quick integration.',
    icon: 'ri-music-2-line',
    subtag: '24/7 Lofi Streams',
    status: 'Zero Distraction',
    isLeft: false,
  },
  {
    index: 4,
    number: '#05',
    badge: 'Health & Wellness',
    title: 'Smart Hydration Log',
    desc: 'Visual water intake progress ring with quick +250ml logging and customizable interval sound reminders.',
    icon: 'ri-drop-line',
    subtag: 'Hydration Ring',
    status: 'Interval Alerts',
    isLeft: true,
  },
  {
    index: 5,
    number: '#06',
    badge: 'dnd-kit Grid',
    title: 'Modular Grid Engine',
    desc: 'Drag, drop, and rearrange every widget with dnd-kit or switch to a distraction-free Hero View.',
    icon: 'ri-layout-grid-line',
    subtag: 'Drag & Drop Layout',
    status: 'Dual View Mode',
    isLeft: true,
  },
];

// Sector definitions with angles in Cartesian degrees (0° is Right, 90° is Down, -90° is Top, 180° is Left)
// Top 2 sectors are smaller (approx 45° span), remaining 4 sectors are equal halves/quadrants (~65°-75° span)
// Each sector has its own curated vibrant aesthetic palette
const SECTORS = [
  {
    id: "top-left",
    cardIndex: 0,
    startAngle: -135,
    endAngle: -90,
    isLeft: true,
    name: "Cognitive Matrix",
    colors: ["#c084fc", "#a855f7", "#7e22ce"], // Electric Purple / Violet
    glow: "#c084fc",
    borderColor: "rgba(233, 213, 255, 0.95)",
  },
  {
    id: "top-right",
    cardIndex: 1,
    startAngle: -90,
    endAngle: -45,
    isLeft: false,
    name: "Neural Velocity",
    colors: ["#38bdf8", "#06b6d4", "#0284c7"], // Cyan / Sky Blue
    glow: "#38bdf8",
    borderColor: "rgba(186, 230, 253, 0.95)",
  },
  {
    id: "mid-right",
    cardIndex: 2,
    startAngle: -45,
    endAngle: 20,
    isLeft: false,
    name: "Synaptic Core",
    colors: ["#f87171", "#ef4444", "#dc2626"], // Coral Flame / Crimson (Original screenshot)
    glow: "#f87171",
    borderColor: "rgba(254, 202, 202, 0.95)",
  },
  {
    id: "bottom-right",
    cardIndex: 3,
    startAngle: 20,
    endAngle: 95,
    isLeft: false,
    name: "Quantum Logic",
    colors: ["#34d399", "#10b981", "#059669"], // Neon Emerald / Mint
    glow: "#34d399",
    borderColor: "rgba(167, 243, 208, 0.95)",
  },
  {
    id: "bottom-left",
    cardIndex: 4,
    startAngle: 95,
    endAngle: 165,
    isLeft: true,
    name: "Memory Lattice",
    colors: ["#fbbf24", "#f59e0b", "#d97706"], // Solar Amber / Gold
    glow: "#fbbf24",
    borderColor: "rgba(253, 230, 138, 0.95)",
  },
  {
    id: "mid-left",
    cardIndex: 5,
    startAngle: 165,
    endAngle: 225,
    isLeft: true,
    name: "Adaptive Nexus",
    colors: ["#f472b6", "#ec4899", "#db2777"], // Hot Magenta / Rose
    glow: "#f472b6",
    borderColor: "rgba(251, 207, 232, 0.95)",
  },
];

// Helper to generate SVG pie slice path
const createSectorPath = (cx, cy, r, startAngle, endAngle) => {
  const radStart = (startAngle * Math.PI) / 180;
  const radEnd = (endAngle * Math.PI) / 180;

  const x1 = cx + r * Math.cos(radStart);
  const y1 = cy + r * Math.sin(radStart);
  const x2 = cx + r * Math.cos(radEnd);
  const y2 = cy + r * Math.sin(radEnd);

  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const Features = () => {
  // Default to mid-right sector (index 2), exactly as shown in the reference image
  const [activeSector, setActiveSector] = useState(2);

  const containerRef = useRef(null);
  const brainRef = useRef(null);
  const dotRefs = useRef([]);

  const [geometry, setGeometry] = useState({
    cx: 0,
    cy: 0,
    r: 140,
    dots: [],
  });

  // Calculate live pixel positions of the brain center & 6 card dots
  const updateGeometry = useCallback(() => {
    if (!containerRef.current || !brainRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const brainRect = brainRef.current.getBoundingClientRect();

    // Brain central thalamus anchor point
    const cx = brainRect.left + brainRect.width * 0.499 - containerRect.left;
    const cy = brainRect.top + brainRect.height * 0.38 - containerRect.top;
    // Compact circle radius centered on the brain
    const r = Math.min(brainRect.width * 0.33, brainRect.height * 0.35);

    // Calculate exact positions for the 6 card dots
    const dots = dotRefs.current.map((dotEl) => {
      if (!dotEl) return { x: 0, y: 0 };
      const rect = dotEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
      };
    });

    const brainPos = {
      x: brainRect.left - containerRect.left,
      y: brainRect.top - containerRect.top,
      w: brainRect.width,
      h: brainRect.height,
    };

    setGeometry({ cx, cy, r, dots, brain: brainPos });
  }, []);

  useEffect(() => {
    updateGeometry();
    window.addEventListener("resize", updateGeometry);

    // Observe changes to the container size
    const observer = new ResizeObserver(updateGeometry);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateGeometry);
      observer.disconnect();
    };
  }, [updateGeometry]);

  // Compute the animated connector line for the active sector
  const getConnectorPath = () => {
    const sector = SECTORS[activeSector];
    if (!sector || !geometry.cx || geometry.dots.length < 6) return null;

    const midAngle = (sector.startAngle + sector.endAngle) / 2;
    const radMid = (midAngle * Math.PI) / 180;

    // Start point on the outer arc of the sector
    const x1 = geometry.cx + geometry.r * Math.cos(radMid);
    const y1 = geometry.cy + geometry.r * Math.sin(radMid);

    // Target point at the card dot
    const targetDot = geometry.dots[sector.cardIndex];
    if (!targetDot || (targetDot.x === 0 && targetDot.y === 0)) return null;

    const x3 = targetDot.x;
    const y3 = targetDot.y;

    // Calculate diagonal + horizontal dogleg elbow point (matching reference image)
    let x2 = x1;
    const y2 = y3;

    if (sector.isLeft) {
      // Leftward connector: diagonal up/down-left to y3, then horizontal to x3
      const deltaY = Math.abs(y1 - y3);
      x2 = Math.max(x3 + 40, x1 - Math.max(deltaY, 30));
    } else {
      // Rightward connector: diagonal up/down-right to y3, then horizontal to x3
      const deltaY = Math.abs(y1 - y3);
      x2 = Math.min(x3 - 40, x1 + Math.max(deltaY, 30));
    }

    return {
      d: `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`,
      start: { x: x1, y: y1 },
      target: { x: x3, y: y3 },
      sector,
    };
  };

  const connector = getConnectorPath();
  const activeSectorData = SECTORS[activeSector] || SECTORS[2];

  const activePathData =
    geometry.cx > 0
      ? createSectorPath(
          geometry.cx,
          geometry.cy,
          geometry.r,
          activeSectorData.startAngle,
          activeSectorData.endAngle,
        )
      : "";

  const renderFeatureCard = (cardIdx) => {
    const card = FEATURE_CARDS[cardIdx];
    if (!card) return null;
    const isActive = activeSector === cardIdx;
    const isLeft = card.isLeft;

    return (
      <div
        onMouseEnter={() => setActiveSector(cardIdx)}
        className={`relative w-full h-full border-y border-x p-3 sm:p-3.5 md:p-4 select-none transition-all duration-300 group cursor-pointer flex flex-col justify-between ${
          isActive
            ? "bg-zinc-950/90 backdrop-blur-md border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            : "bg-transparent border-white/15 hover:border-white/30"
        }`}
      >
        {/* Extended Top & Bottom Horizontal Lines stretching to the viewport edge */}
        {isLeft ? (
          <>
            <div className="absolute top-0 right-full w-4 sm:w-6 md:w-8 lg:w-14 border-t border-white/15 pointer-events-none" />
            <div className="absolute bottom-0 right-full w-4 sm:w-6 md:w-8 lg:w-14 border-b border-white/15 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-t border-white/15 pointer-events-none" />
            <div className="absolute bottom-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-b border-white/15 pointer-events-none" />
          </>
        )}

        {/* Background Layer with Overflow-Hidden for Gradients and Noise only */}
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ease-out ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Horizontal Ambient Gradient */}
          <div
            className={`absolute inset-0 ${
              isLeft
                ? "bg-gradient-to-r from-white/[0.12] via-white/[0.035] to-transparent"
                : "bg-gradient-to-l from-white/[0.12] via-white/[0.035] to-transparent"
            }`}
          />

          {/* Horizontal Noise Gradient Mask */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url("${NOISE_BG}")`,
              backgroundSize: "140px 140px",
              maskImage: isLeft
                ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)"
                : "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: isLeft
                ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)"
                : "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>

        {/* 4 Corner Intersection Nodes on Card Borders */}
        <div
          className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border shadow-sm z-30 pointer-events-none transition-all duration-300 ${
            isActive
              ? "bg-white border-white shadow-[0_0_8px_#ffffff]"
              : "bg-zinc-500 border-zinc-400/60"
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full border shadow-sm z-30 pointer-events-none transition-all duration-300 ${
            isActive
              ? "bg-white border-white shadow-[0_0_8px_#ffffff]"
              : "bg-zinc-500 border-zinc-400/60"
          }`}
        />
        <div
          className={`absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border shadow-sm z-30 pointer-events-none transition-all duration-300 ${
            isActive
              ? "bg-white border-white shadow-[0_0_8px_#ffffff]"
              : "bg-zinc-500 border-zinc-400/60"
          }`}
        />
        <div
          className={`absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full border shadow-sm z-30 pointer-events-none transition-all duration-300 ${
            isActive
              ? "bg-white border-white shadow-[0_0_8px_#ffffff]"
              : "bg-zinc-500 border-zinc-400/60"
          }`}
        />

        {/* Connector Target Node for SVG Vector Line */}
        <div
          ref={(el) => (dotRefs.current[cardIdx] = el)}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
          } w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm pointer-events-none z-30 ${
            isActive
              ? "bg-white border border-white ring-4 ring-white/20 shadow-[0_0_12px_#ffffff]"
              : "bg-zinc-500 border border-zinc-400/60 opacity-0"
          }`}
        />

        {/* Card Content with z-10 */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Meta Row */}
          <div className="flex items-center justify-between">
            <span className="font-gilroy text-[11px] sm:text-xs text-zinc-400 font-medium tracking-wide">
              {card.number}
            </span>
            <span className="text-[10px] sm:text-[11px] font-gilroy text-white/90 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {card.badge}
            </span>
          </div>

          {/* Title & Description */}
          <div className="my-auto py-1">
            <h3 className="font-rejoice text-lg sm:text-xl md:text-2xl text-white font-normal tracking-tight mt-0.5 mb-0.5 leading-tight">
              {card.title}
            </h3>
            <p className="font-gilroy text-[11px] sm:text-xs text-zinc-400 font-light leading-relaxed line-clamp-2">
              {card.desc}
            </p>
          </div>

          {/* Bottom Row: Subtag & Status */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
            <span className="flex items-center gap-1 text-zinc-400 text-[10px] sm:text-[11px] font-gilroy">
              <i className={`${card.icon} text-xs text-white/80`} />
              <span>{card.subtag}</span>
            </span>
            <span className="text-zinc-500 text-[10px] sm:text-[11px] font-gilroy font-light">
              {card.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full h-screen min-h-[640px] max-h-screen bg-black text-white pt-8 px-4 sm:px-6 md:px-8 lg:px-14 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Row: Left Title & Right Subtitle */}
      <div className="w-full mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 mb-4 md:mb-6">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none">
          Features
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-200 font-light leading-relaxed max-w-[260px] sm:text-right">
          Turn Every Blank Tab Into Your Ultimate
          <br className="hidden sm:inline" /> Productivity Command Center
        </p>
      </div>

      {/* Main Features Layout Container */}
      <div
        ref={containerRef}
        className="relative w-full mx-auto flex-1 min-h-0 flex flex-col justify-between"
      >
        {/* Central Brain & Skin Illustration */}
        <div
          ref={brainRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[82%] max-h-[520px] pointer-events-none z-10 flex items-end justify-center"
        >
          <div className="relative h-full w-auto flex items-end justify-center">
            <img
              src="/Brain.png"
              alt="Brain Intelligence Architecture"
              onLoad={updateGeometry}
              className="h-full w-auto max-w-full object-contain object-bottom"
            />
            <img
              src="/Skin.png"
              alt="Skin Profile Layer"
              onLoad={updateGeometry}
              className="absolute inset-0 h-full w-full object-contain object-bottom"
            />
          </div>
        </div>

        {/* SVG Layer: 100% Vector-Synchronized Blur + Color Fill + Noise Texture + White Outline */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
          <defs>
            {/* Fine Grain / Noise Filter for tactile organic texture */}
            <filter
              id="grainNoiseFilter"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves="4"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 0.28 0"
                in="noise"
                result="coloredGrain"
              />
              <feComposite
                in="SourceGraphic"
                in2="coloredGrain"
                operator="in"
              />
            </filter>

            {/* Hardware Vector Brain Blur Filter */}
            <filter
              id="brainVectorBlur"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix type="saturate" values="1.6" in="blur" />
            </filter>

            {/* Line Glow Filter */}
            <filter
              id="lineGlowFilter"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Dynamic Radial Gradients for all 6 Sectors */}
            {SECTORS.map((sec) => (
              <radialGradient
                key={`grad-${sec.id}`}
                id={`grad-${sec.id}`}
                cx="50%"
                cy="50%"
                r="70%"
                fx="40%"
                fy="40%"
              >
                <stop offset="0%" stopColor={sec.colors[0]} stopOpacity="0.8" />
                <stop
                  offset="50%"
                  stopColor={sec.colors[1]}
                  stopOpacity="0.55"
                />
                <stop
                  offset="100%"
                  stopColor={sec.colors[2]}
                  stopOpacity="0.35"
                />
              </radialGradient>
            ))}

            {/* Dynamic Morphing ClipPath for Active Sector Noise & Blur Overlay */}
            {geometry.cx > 0 && activePathData && (
              <clipPath id="activeSectorClip">
                <path
                  d={activePathData}
                  className="transition-[d] duration-300 ease-out"
                />
              </clipPath>
            )}
          </defs>

          {/* Unified Active Sector Group: Sector Mask that reveals Brain.png through Skin.png */}
          {geometry.cx > 0 && activePathData && (
            <g
              clipPath="url(#activeSectorClip)"
              className="pointer-events-none"
            >
              {/* 1. Crisp Brain Image revealed directly through the active sector mask */}
              {geometry.brain && (
                <image
                  href="/Brain.png"
                  x={geometry.brain.x}
                  y={geometry.brain.y}
                  width={geometry.brain.w}
                  height={geometry.brain.h}
                  preserveAspectRatio="xMidYMax meet"
                />
              )}

              {/* 2. Subtle Vibrant Sector Color Accent */}
              <path
                d={activePathData}
                fill={`url(#grad-${activeSectorData.id})`}
                opacity="0.25"
                style={{ mixBlendMode: "screen" }}
                className="transition-[d] duration-300 ease-out"
              />

              {/* 3. Subtle Tactile Film Grain Noise Texture */}
              <rect
                x={geometry.cx - geometry.r - 20}
                y={geometry.cy - geometry.r - 20}
                width={geometry.r * 2 + 40}
                height={geometry.r * 2 + 40}
                fill="white"
                filter="url(#grainNoiseFilter)"
                opacity="0.15"
                style={{ mixBlendMode: "overlay" }}
              />
            </g>
          )}

          {/* 4. Single Active Sector Crisp Glowing White Border Outline */}
          {geometry.cx > 0 && activePathData && (
            <path
              d={activePathData}
              fill="none"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="1.5"
              filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))"
              className="pointer-events-none transition-[d] duration-300 ease-out"
            />
          )}

          {/* Invisible Click/Hover Hit Areas for 6 Sectors */}
          {geometry.cx > 0 &&
            SECTORS.map((sector, index) => (
              <path
                key={sector.id}
                d={createSectorPath(
                  geometry.cx,
                  geometry.cy,
                  geometry.r,
                  sector.startAngle,
                  sector.endAngle,
                )}
                className="pointer-events-auto cursor-pointer"
                fill="transparent"
                stroke="transparent"
                strokeWidth="0"
                onMouseEnter={() => setActiveSector(index)}
              />
            ))}

          {/* Animated Pure White Connector Line */}
          {connector && (
            <g key={activeSector}>
              {/* Glowing Outline Track */}
              <path
                d={connector.d}
                fill="none"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="1.5"
                filter="url(#lineGlowFilter)"
                className="transition-all duration-300 animate-[drawLine_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: 0,
                }}
              />

              {/* Start Node at the Brain Arc */}
              <circle
                cx={connector.start.x}
                cy={connector.start.y}
                r="2.5"
                fill="white"
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* 6 Feature Containers: Left 3-Card Column & Right 3-Card Column Framing Brain */}
        <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-6">
          {/* Left Column: 3 Cards (0: Top-Left Widest, 5: Mid-Left Compact, 4: Bottom-Left Medium-Wide) */}
          <div className="flex flex-col items-start justify-between gap-3 md:gap-4 flex-1 h-full">
            <div className="w-full max-w-[520px] lg:max-w-[580px] xl:max-w-[640px] flex-1 min-h-0">
              {renderFeatureCard(0)}
            </div>
            <div className="w-full max-w-[300px] lg:max-w-[330px] xl:max-w-[350px] flex-1 min-h-0">
              {renderFeatureCard(5)}
            </div>
            <div className="w-full max-w-[390px] lg:max-w-[430px] xl:max-w-[470px] flex-1 min-h-0">
              {renderFeatureCard(4)}
            </div>
          </div>

          {/* Center Brain Spacer */}
          <div className="hidden md:block w-[140px] lg:w-[180px] xl:w-[220px] shrink-0 h-full pointer-events-none" />

          {/* Right Column: 3 Cards (1: Top-Right Widest, 2: Mid-Right Compact, 3: Bottom-Right Medium-Wide) */}
          <div className="flex flex-col items-end justify-between gap-3 md:gap-4 flex-1 h-full">
            <div className="w-full max-w-[520px] lg:max-w-[580px] xl:max-w-[640px] flex-1 min-h-0">
              {renderFeatureCard(1)}
            </div>
            <div className="w-full max-w-[300px] lg:max-w-[330px] xl:max-w-[350px] flex-1 min-h-0">
              {renderFeatureCard(2)}
            </div>
            <div className="w-full max-w-[390px] lg:max-w-[430px] xl:max-w-[470px] flex-1 min-h-0">
              {renderFeatureCard(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Horizontal Grid Line */}
      <div className="w-full border-t border-white/10 shrink-0 mt-3 md:mt-0" />
    </section>
  );
};

export default Features;
