import React, { useState, useRef, useEffect, useCallback } from "react";

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const FEATURE_CARDS = [
  {
    index: 0,
    number: '01 // FLOW',
    title: 'Deep Focus Protocol',
    desc: 'Customizable Pomodoro flow cycles with audio alerts.',
    icon: 'ri-timer-flash-line',
    subtag: 'Dual Interval Engine',
    status: 'LOCKED IN',
    isLeft: true,
  },
  {
    index: 1,
    number: '02 // TIME',
    title: 'Chrono Time-Boxing',
    desc: 'Hourly routine blocks with UTC midnight reset.',
    icon: 'ri-calendar-check-line',
    subtag: 'Hourly Task Sprint',
    status: 'UTC 00:00 SYNC',
    isLeft: false,
  },
  {
    index: 2,
    number: '03 // SYNC',
    title: 'GitHub Matrix HUD',
    desc: 'Live GitHub commit momentum heatmap on new tab.',
    icon: 'ri-github-fill',
    subtag: 'Contribution Graph',
    status: 'LIVE SYNC',
    isLeft: false,
  },
  {
    index: 3,
    number: '04 // AUDIO',
    title: 'Ambient Audio Space',
    desc: '24/7 curated lofi radio and ambient soundscapes.',
    icon: 'ri-music-2-line',
    subtag: 'Audio Command Center',
    status: 'STREAMING',
    isLeft: false,
  },
  {
    index: 4,
    number: '05 // HYDRO',
    title: 'Bio-Hydration Metric',
    desc: 'Smart water tracker with timed audio prompts.',
    icon: 'ri-drop-line',
    subtag: 'Cognitive Wellness',
    status: 'OPTIMAL LEVEL',
    isLeft: true,
  },
  {
    index: 5,
    number: '06 // DOCK',
    title: 'Freeform Grid Engine',
    desc: 'Physics-based drag & drop with instant HUD mode.',
    icon: 'ri-layout-masonry-line',
    subtag: 'Modular Workspace',
    status: 'DRAGGABLE',
    isLeft: true,
  },
];

// Geometric wireframe illustrations — each shape meaningfully represents its card's feature
const ILLUS_CLASS = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 shrink-0 text-white/50 group-hover:text-white/90 group-hover:scale-105 transition-all duration-500";

const CARD_ILLUSTRATIONS = [
  // 0: FLOW — Modern Focus Timer / Pomodoro Stopwatch
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Outer track ring — subtle background */}
      <circle cx="40" cy="40" r="34" strokeWidth="1" opacity="0.15" />
      {/* Progress arc — ~270° sweep showing focus session progress */}
      <path d="M 40 6 A 34 34 0 1 1 6.06 40" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* 4 cardinal tick marks only — minimal */}
      {[0, 90, 180, 270].map((deg) => {
        const r1 = 30, r2 = 34;
        const rad = (deg - 90) * Math.PI / 180;
        return <line key={deg} x1={40+r1*Math.cos(rad)} y1={40+r1*Math.sin(rad)} x2={40+r2*Math.cos(rad)} y2={40+r2*Math.sin(rad)} strokeWidth="0.8" opacity="0.35" />;
      })}
      {/* Inner dashed ring */}
      <circle cx="40" cy="40" r="24" strokeDasharray="1.5 3.5" opacity="0.15" />
      {/* Timer needle — points to ~10 o'clock position (current progress head) */}
      <line x1="40" y1="40" x2="12" y2="40" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Needle tip dot */}
      <circle cx="12" cy="40" r="2" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      {/* Center hub */}
      <circle cx="40" cy="40" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
      {/* Pause icon in center — indicates active timer */}
      <rect x="37" y="37" width="2" height="6" rx="0.5" fill="currentColor" fillOpacity="0.35" stroke="none" />
      <rect x="41" y="37" width="2" height="6" rx="0.5" fill="currentColor" fillOpacity="0.35" stroke="none" />
      {/* Small arc accent at the start position (12 o'clock) */}
      <circle cx="40" cy="6" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    </svg>
  ),

  // 1: TIME — Hourly Timeline / Schedule Blocks
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Timeline vertical backbone */}
      <line x1="18" y1="6" x2="18" y2="74" strokeWidth="0.6" opacity="0.25" />
      {/* Hour tick marks + faint labels */}
      {[12, 24, 36, 48, 60, 72].map((y, i) => (
        <g key={y}>
          <line x1="14" y1={y} x2="18" y2={y} strokeWidth="0.6" opacity="0.3" />
          <rect x="6" y={y - 2} width="6" height="4" rx="0.5" fill="currentColor" fillOpacity="0.08" stroke="none" />
        </g>
      ))}
      {/* Time blocks — fill only, no stroke, varying widths for visual hierarchy */}
      <rect x="22" y="10" width="32" height="9" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="22" y="22" width="48" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="none" />
      <rect x="22" y="34" width="22" height="9" rx="1.5" fill="currentColor" fillOpacity="0.1" stroke="none" />
      <rect x="22" y="46" width="40" height="9" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="none" />
      <rect x="22" y="58" width="28" height="9" rx="1.5" fill="currentColor" fillOpacity="0.12" stroke="none" />
      {/* Active block highlight accent */}
      <rect x="22" y="46" width="40" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      {/* Current time indicator — horizontal line across */}
      <line x1="14" y1="50" x2="76" y2="50" strokeWidth="0.8" opacity="0.45" strokeDasharray="2 2" />
      <circle cx="14" cy="50" r="2" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      {/* Small progress fill inside active block */}
      <rect x="22" y="46" width="24" height="9" rx="1.5" fill="currentColor" fillOpacity="0.08" stroke="none" />
      {/* Checkmark hints on completed blocks */}
      <path d="M 50 13.5 L 52 15.5 L 56 11.5" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path d="M 66 25.5 L 68 27.5 L 72 23.5" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  ),

  // 2: SYNC — GitHub Contribution Grid (7x5 heatmap matrix)
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Contribution grid — smaller cells, proper gaps */}
      {[0,1,2,3,4,5,6,7,8].map((col) =>
        [0,1,2,3,4].map((row) => {
          const x = 6 + col * 7;
          const y = 10 + row * 7;
          const intensities = [
            0.06,0.2,0.45,0.1,0.35,
            0.25,0.06,0.5,0.15,0.1,
            0.4,0.08,0.3,0.5,0.06,
            0.15,0.35,0.06,0.25,0.45,
            0.06,0.55,0.12,0.35,0.2,
            0.3,0.06,0.4,0.1,0.5,
            0.45,0.15,0.25,0.06,0.35,
            0.1,0.4,0.55,0.2,0.06,
            0.3,0.06,0.15,0.45,0.25,
          ];
          const opacity = intensities[col * 5 + row] || 0.06;
          return <rect key={`${col}-${row}`} x={x} y={y} width="4.5" height="4.5" rx="0.8" fill="currentColor" fillOpacity={opacity} stroke="none" />;
        })
      )}
      {/* Streak line chart underneath */}
      <polyline points="6,56 14,52 22,54 30,48 38,50 46,44 54,46 62,41 70,43" strokeWidth="0.8" opacity="0.4" strokeLinejoin="round" strokeLinecap="round" />
      {/* Endpoint pulse dot */}
      <circle cx="70" cy="43" r="1.5" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      {/* Commit count hint text line */}
      <line x1="6" y1="64" x2="22" y2="64" strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
      <line x1="6" y1="68" x2="16" y2="68" strokeWidth="0.8" opacity="0.1" strokeLinecap="round" />
      {/* Branch icon — bottom right */}
      <circle cx="68" cy="60" r="2" strokeWidth="0.6" opacity="0.25" />
      <circle cx="68" cy="72" r="2" strokeWidth="0.6" opacity="0.25" />
      <line x1="68" y1="62" x2="68" y2="70" strokeWidth="0.6" opacity="0.2" />
      <circle cx="76" cy="56" r="2" strokeWidth="0.6" opacity="0.25" />
      <path d="M 68 60 Q 72 58 76 56" strokeWidth="0.6" opacity="0.2" fill="none" />
    </svg>
  ),

  // 3: AUDIO — Ambient Waveform / Lofi Radio Visualization
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Vinyl disc accent — top left */}
      <circle cx="18" cy="22" r="12" strokeWidth="0.6" opacity="0.2" />
      <circle cx="18" cy="22" r="7" strokeDasharray="1.5 2" opacity="0.15" />
      <circle cx="18" cy="22" r="2" fill="currentColor" fillOpacity="0.25" stroke="none" />
      {/* Play triangle on disc */}
      <polygon points="16,19 16,25 21,22" fill="currentColor" fillOpacity="0.2" stroke="none" />
      {/* Audio waveform — smooth ambient oscillation across the card */}
      <polyline
        points="4,48 10,44 16,50 22,38 28,52 34,36 40,54 46,34 52,50 58,38 64,48 70,42 76,46"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Mirrored lower waveform — reflection */}
      <polyline
        points="4,52 10,56 16,50 22,62 28,48 34,64 40,46 46,66 52,50 58,62 64,52 70,58 76,54"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
      />
      {/* Center baseline */}
      <line x1="4" y1="50" x2="76" y2="50" strokeDasharray="1 3" opacity="0.1" />
      {/* Frequency dots — subtle rhythm markers */}
      {[12, 28, 44, 60].map((x) => (
        <circle key={x} cx={x} cy="70" r="1" fill="currentColor" fillOpacity="0.2" stroke="none" />
      ))}
      {/* Active frequency dot */}
      <circle cx="44" cy="70" r="1.5" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
    </svg>
  ),

  // 4: HYDRO — Water Droplet with Level Gauge
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Droplet outline */}
      <path d="M 40 8 Q 40 8 56 36 A 18 18 0 1 1 24 36 Q 40 8 40 8 Z" opacity="0.5" strokeWidth="1" />
      {/* Water fill level — ~70% filled, clipped to droplet */}
      <clipPath id="dropClip">
        <path d="M 40 8 Q 40 8 56 36 A 18 18 0 1 1 24 36 Q 40 8 40 8 Z" />
      </clipPath>
      <rect x="20" y="34" width="40" height="40" fill="currentColor" fillOpacity="0.15" clipPath="url(#dropClip)" stroke="none" />
      {/* Water surface wave */}
      <path d="M 24 38 Q 30 34 36 38 Q 42 42 48 38 Q 54 34 58 38" strokeWidth="0.7" opacity="0.4" clipPath="url(#dropClip)" />
      {/* Level gauge marks on the right */}
      <line x1="62" y1="28" x2="66" y2="28" opacity="0.3" />
      <line x1="62" y1="36" x2="68" y2="36" opacity="0.4" />
      <line x1="62" y1="44" x2="66" y2="44" opacity="0.3" />
      <line x1="62" y1="52" x2="68" y2="52" opacity="0.4" />
      <line x1="62" y1="60" x2="66" y2="60" opacity="0.3" />
      {/* Gauge indicator arrow */}
      <polygon points="69,36 73,34 73,38" fill="currentColor" fillOpacity="0.5" stroke="none" />
      {/* Small bubbles */}
      <circle cx="35" cy="48" r="1.5" opacity="0.25" />
      <circle cx="44" cy="52" r="1" opacity="0.2" />
      <circle cx="38" cy="56" r="1.8" opacity="0.2" />
    </svg>
  ),

  // 5: DOCK — Modular Workspace with draggable widgets
  () => (
    <svg viewBox="0 0 80 80" className={ILLUS_CLASS} fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* Subtle dot grid backdrop */}
      {[0,1,2,3,4,5,6,7,8,9].map((col) =>
        [0,1,2,3,4,5,6,7,8,9].map((row) => (
          <circle key={`${col}-${row}`} cx={6 + col * 8} cy={6 + row * 8} r="0.4" fill="currentColor" fillOpacity="0.1" stroke="none" />
        ))
      )}
      {/* Widget tiles — fill only, clean */}
      <rect x="6" y="6" width="30" height="18" rx="2" fill="currentColor" fillOpacity="0.18" stroke="none" />
      <rect x="40" y="6" width="34" height="12" rx="2" fill="currentColor" fillOpacity="0.1" stroke="none" />
      <rect x="6" y="28" width="18" height="24" rx="2" fill="currentColor" fillOpacity="0.12" stroke="none" />
      <rect x="40" y="22" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.08" stroke="none" />
      <rect x="6" y="56" width="26" height="18" rx="2" fill="currentColor" fillOpacity="0.1" stroke="none" />
      <rect x="36" y="56" width="38" height="18" rx="2" fill="currentColor" fillOpacity="0.06" stroke="none" />
      {/* Active / dragging widget — slightly elevated with outline */}
      <rect x="28" y="38" width="28" height="14" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      {/* Drag handle grip dots on active widget */}
      {[0,1,2].map((r) =>
        [0,1].map((c) => (
          <circle key={`grip-${r}-${c}`} cx={36 + c * 4} cy={42 + r * 3} r="0.7" fill="currentColor" fillOpacity="0.3" stroke="none" />
        ))
      )}
      {/* Ghost outline — showing where widget came from */}
      <rect x="62" y="22" width="14" height="14" rx="2" strokeDasharray="2 2" strokeWidth="0.5" opacity="0.15" />
      {/* Drag motion arrow */}
      <path d="M 69 29 L 56 38" strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity="0.2" />
      <path d="M 58 36 L 56 38 L 58.5 39" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
    </svg>
  ),
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
        className={`relative w-full h-full border-y border-x border-white/10 p-3 sm:p-3.5 md:p-4 select-none transition-all duration-300 group cursor-pointer flex flex-col justify-between ${
          isActive
            ? "bg-zinc-950/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            : "bg-transparent"
        }`}
      >
        {/* Extended Top & Bottom Horizontal Lines stretching to the viewport edge */}
        {isLeft ? (
          <>
            <div className="hidden md:block absolute top-0 right-full w-4 sm:w-6 md:w-8 lg:w-14 border-t border-white/10 pointer-events-none" />
            <div className="hidden md:block absolute bottom-0 right-full w-4 sm:w-6 md:w-8 lg:w-14 border-b border-white/10 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="hidden md:block absolute top-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-t border-white/10 pointer-events-none" />
            <div className="hidden md:block absolute bottom-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-b border-white/10 pointer-events-none" />
          </>
        )}

        {/* Background & Illustration Layer with Overflow-Hidden */}
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ease-out z-0`}
        >
          {/* Horizontal Ambient Gradient */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-0"
            } ${
              isLeft
                ? "bg-gradient-to-r from-white/[0.12] via-white/[0.035] to-transparent"
                : "bg-gradient-to-l from-white/[0.12] via-white/[0.035] to-transparent"
            }`}
          />

          {/* Horizontal Noise Gradient Mask */}
          <div
            className={`absolute inset-0 mix-blend-screen pointer-events-none transition-opacity duration-300 ${
              isActive ? "opacity-30" : "opacity-0"
            }`}
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

          {/* Absolute Geometric UI Illustration — positioned on the OUTER edge of the card (away from brain center) */}
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none ${
            isLeft ? "right-3 sm:right-5 md:right-6" : "left-3 sm:left-5 md:left-6"
          }`}>
            {CARD_ILLUSTRATIONS[cardIdx] && CARD_ILLUSTRATIONS[cardIdx]()}
          </div>
        </div>

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

        {/* Card Content with z-10 — text on the INNER edge (near brain), illustration on OUTER edge */}
        <div className={`relative z-10 flex flex-col justify-between h-full pointer-events-auto ${
          isLeft ? "items-start" : "items-end"
        }`}>
          {/* Top Meta Row */}
          <div className={`w-full ${isLeft ? "text-left" : "text-right"}`}>
            <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 font-semibold tracking-wider">
              {card.number}
            </span>
          </div>

          {/* Title & Shortened Description */}
          <div className={`my-auto py-1 max-w-[65%] sm:max-w-[58%] md:max-w-[52%] ${isLeft ? "" : "text-right"}`}>
            <h3 className="font-rejoice text-lg sm:text-xl md:text-[22px] text-white font-normal tracking-tight leading-tight mb-1">
              {card.title}
            </h3>
            <p className="font-gilroy text-[11px] sm:text-xs text-zinc-400 font-light leading-relaxed">
              {card.desc}
            </p>
          </div>

          {/* Bottom Row: Subtag & Status */}
          <div className="w-full flex items-center justify-between pt-1.5 border-t border-white/10 mt-auto">
            <span className="flex items-center gap-1.5 text-zinc-400 text-[10px] sm:text-[11px] font-gilroy">
              <i className={`${card.icon} text-xs text-white/80`} />
              <span>{card.subtag}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-white shadow-[0_0_6px_#ffffff] animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-zinc-400 text-[9.5px] sm:text-[10px] font-mono font-medium tracking-tight">
                {card.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="features" className="relative w-full min-h-screen md:h-screen md:min-h-[640px] md:max-h-screen bg-black text-white pt-8 pb-10 md:pb-0 px-4 sm:px-6 md:px-8 lg:px-14 flex flex-col justify-between overflow-x-hidden md:overflow-hidden select-none">
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
        {/* Central Brain & Skin Illustration (Hidden on mobile, perfectly animated on laptop/desktop) */}
        <div
          ref={brainRef}
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-0 h-[82%] max-h-[520px] pointer-events-none z-10 items-end justify-center"
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

        {/* SVG Layer: 100% Vector-Synchronized Blur + Color Fill + Noise Texture + White Outline (Desktop only) */}
        <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
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
        <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Left Column: 3 Cards (0: Top-Left Widest, 5: Mid-Left Compact, 4: Bottom-Left Medium-Wide) */}
          <div className="flex flex-col items-stretch md:items-start justify-between gap-3 md:gap-4 flex-1 h-full w-full">
            <div className="w-full md:max-w-[520px] lg:max-w-[580px] xl:max-w-[640px] flex-1 min-h-[140px] md:min-h-0">
              {renderFeatureCard(0)}
            </div>
            <div className="w-full md:max-w-[340px] lg:max-w-[380px] xl:max-w-[410px] flex-1 min-h-[140px] md:min-h-0">
              {renderFeatureCard(5)}
            </div>
            <div className="w-full md:max-w-[390px] lg:max-w-[430px] xl:max-w-[470px] flex-1 min-h-[140px] md:min-h-0">
              {renderFeatureCard(4)}
            </div>
          </div>

          {/* Center Brain Spacer */}
          <div className="hidden md:block w-[140px] lg:w-[180px] xl:w-[220px] shrink-0 h-full pointer-events-none" />

          {/* Right Column: 3 Cards (1: Top-Right Widest, 2: Mid-Right Compact, 3: Bottom-Right Medium-Wide) */}
          <div className="flex flex-col items-stretch md:items-end justify-between gap-3 md:gap-4 flex-1 h-full w-full">
            <div className="w-full md:max-w-[520px] lg:max-w-[580px] xl:max-w-[640px] flex-1 min-h-[140px] md:min-h-0">
              {renderFeatureCard(1)}
            </div>
            <div className="w-full md:max-w-[340px] lg:max-w-[380px] xl:max-w-[410px] flex-1 min-h-[140px] md:min-h-0">
              {renderFeatureCard(2)}
            </div>
            <div className="w-full md:max-w-[390px] lg:max-w-[430px] xl:max-w-[470px] flex-1 min-h-[140px] md:min-h-0">
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
