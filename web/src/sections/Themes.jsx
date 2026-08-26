import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   Theme data — swap images to your real assets
   ───────────────────────────────────────────── */
const THEMES = [
  {
    index: "01",
    name: "Glassmorphism",
    desc: "Frosted glass panels, soft glow halos,\nand luminous depth layers.",
    img: "/Theme_glassmorphism.png",
  },
  {
    index: "02",
    name: "Cyberpunk",
    desc: "Neon glow accents, HUD bracket\nframes, and dark grid styling.",
    img: "/Theme_cyberpunk.png",
  },
  {
    index: "03",
    name: "Manga",
    desc: "High-contrast ink strokes, halftone\ndots, and manga panel overlays.",
    img: "/Theme_manga.png",
  },
  {
    index: "04",
    name: "Terminal",
    desc: "Monospace CLI aesthetics, phosphor\nglow text, and scanline textures.",
    img: "/Theme_cli.png",
  },
];

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const Themes = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=700",
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          // Map scroll progress [0, 1] across the 4 themes
          const nextIndex = Math.min(
            THEMES.length - 1,
            Math.floor(self.progress * THEMES.length),
          );
          setActiveIndex((prev) => (prev !== nextIndex ? nextIndex : prev));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="themes"
      ref={sectionRef}
      className="relative w-full h-screen min-h-[580px] sm:min-h-[640px] max-h-screen bg-black text-white pt-16 sm:pt-20 md:pt-4 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Row: Left Title & Right Subtitle */}
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-14 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 mb-4 md:mb-6">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none">
          Themes
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-200 font-light leading-relaxed max-w-[260px] sm:text-right">
          Turn Every Blank Tab Into Your Ultimate
          <br className="hidden sm:inline" /> Visual & Aesthetic Workspace
        </p>
      </div>

      {/* Main Content: 4 Full-Width Equal Size Theme Rows (Touching Edge-to-Edge) */}
      <div className="relative w-full flex-1 min-h-0 flex flex-col justify-center">
        {/* Dead-Center Theme Showcase Card (Matching Reference Image) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-[62%] sm:w-[58%] md:w-[55%] max-w-[960px] min-w-0 sm:min-w-[300px] md:min-w-[360px] aspect-[14.5/7] select-none">
          {/* Clean Rounded Image Frame Container (No Backglow, No Border) */}
          <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-950 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            {THEMES.map((theme, i) => {
              const isCurrent = activeIndex === i;
              const isPrevious = activeIndex > i;

              return (
                <div
                  key={theme.index}
                  className="absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    transform: isCurrent
                      ? "scale(1) translateY(0px)"
                      : isPrevious
                        ? "scale(0.96) translateY(-6px)"
                        : "scale(1.04) translateY(6px)",
                    filter: isCurrent ? "blur(0px)" : "blur(6px)",
                    pointerEvents: "none",
                    zIndex: isCurrent ? 10 : 0,
                  }}
                >
                  <img
                    src={theme.img}
                    alt={theme.name}
                    className="w-full h-full object-cover object-center"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {/* Subtle Inner Edge Vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>

        {THEMES.map((theme, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={theme.index}
              className="group relative w-full flex-1 min-h-[85px] sm:min-h-[100px] md:min-h-[135px] py-3 sm:py-4 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-14 select-none overflow-hidden"
            >
              {/* Highlight Noise Gradient Layer (initially '01', changes on hover) */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* White Noise Texture Layer Masked to fade in center */}
                <div
                  className="absolute inset-0 opacity-35 mix-blend-screen"
                  style={{
                    backgroundImage: `url("${NOISE_BG}")`,
                    backgroundSize: "150px 150px",
                    WebkitMaskImage:
                      "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.85) 82%, #000 100%)",
                    maskImage:
                      "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.85) 82%, #000 100%)",
                  }}
                />

                {/* Left & Right Subtle Soft Edge Vignettes */}
                <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white/10 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white/10 to-transparent" />
              </div>

              {/* Left Side: [ 01 ], [ 02 ], etc. */}
              <div
                className={`relative z-10 font-rejoice text-sm sm:text-base md:text-lg tracking-wider transition-colors duration-300 text-white`}
              >
                [ {theme.index} ]
              </div>

              {/* Right Side: Theme Name & Description */}
              <div className="relative z-10 flex flex-col items-end text-right">
                <h3
                  className={`text-2xl sm:text-3xl md:text-3xl font-rejoice font-normal tracking-tight transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-300"
                  }`}
                >
                  {theme.name}
                </h3>
                <p
                  className={`text-[10px] sm:text-xs font-gilroy mt-1 max-w-[280px] sm:max-w-[340px] whitespace-pre-line transition-colors duration-300 ${
                    isActive ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {theme.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Themes;
