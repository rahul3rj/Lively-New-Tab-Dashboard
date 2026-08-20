import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { useLiquidGlass } from '../utils/useLiquidGlass'

gsap.registerPlugin(ScrollTrigger, Draggable)

const STEPS = [
  {
    number: '[ Step 01 ]',
    icon: 'ri-file-line',
    text: 'Extract the file in a folder.',
    img: '/step1.mp4',
  },
  {
    number: '[ Step 02 ]',
    icon: 'ri-settings-3-line',
    text: 'Open Browser and open Manage\nextensions.',
    img: '/step2.mp4',
  },
  {
    number: '[ Step 03 ]',
    icon: 'ri-code-line',
    text: 'Enable developer mode.',
    img: '/step3.mp4',
  },
  {
    number: '[ Step 04 ]',
    icon: 'ri-folder-line',
    text: 'Locate the Extension folder you\ndownloaded from here.',
    img: '/step4.mp4',
  },
  {
    number: '[ Step 05 ]',
    icon: 'ri-sparkling-fill',
    text: "Let's go You have done with setup.",
    img: '/step5.mp4',
  },
]

const Setup = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const handleRef = useRef(null)

  const frameGlassRef = useLiquidGlass({
    scale: -50,
    chroma: 6,
    blur: 3,
    saturate: 1.8,
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Scroll-triggered freeze / pinning matching Themes.jsx
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=800',
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const nextIndex = Math.min(
            STEPS.length - 1,
            Math.floor(self.progress * STEPS.length)
          )
          setActiveIndex((prev) => (prev !== nextIndex ? nextIndex : prev))
        },
      })

      // 2. Floating draggable glass showcase window
      if (frameGlassRef.current && handleRef.current) {
        Draggable.create(frameGlassRef.current, {
          trigger: handleRef.current,
          bounds: sectionRef.current,
          edgeResistance: 0.65,
          type: 'x,y',
          cursor: 'grab',
          activeCursor: 'grabbing',
          zIndexBoost: true,
          onPress: function (e) {
            window.dispatchEvent(new CustomEvent('cursor-state', { detail: 'drag' }))
            const clientX = e?.clientX ?? e?.pointerEvent?.clientX ?? (e?.touches && e.touches[0]?.clientX)
            const clientY = e?.clientY ?? e?.pointerEvent?.clientY ?? (e?.touches && e.touches[0]?.clientY)
            if (clientX !== undefined && clientY !== undefined) {
              window.dispatchEvent(new CustomEvent('cursor-pos', { detail: { x: clientX, y: clientY } }))
            }
          },
          onDrag: function (e) {
            const clientX = e?.clientX ?? e?.pointerEvent?.clientX ?? (e?.touches && e.touches[0]?.clientX)
            const clientY = e?.clientY ?? e?.pointerEvent?.clientY ?? (e?.touches && e.touches[0]?.clientY)
            if (clientX !== undefined && clientY !== undefined) {
              window.dispatchEvent(new CustomEvent('cursor-pos', { detail: { x: clientX, y: clientY } }))
            }
          },
          onRelease: function () {
            window.dispatchEvent(new CustomEvent('cursor-state', { detail: 'scroll' }))
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="setup"
      ref={sectionRef}
      className="relative w-full min-h-screen lg:h-screen lg:min-h-[640px] lg:max-h-screen bg-black text-white pt-16 sm:pt-20 md:pt-24 pb-12 lg:pb-0 px-4 sm:px-6 md:px-8 lg:px-14 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Setup Background Artwork */}
      <img
        src="/Setup-bg.png"
        alt="Setup Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* Top Header Row: Left Title & Right Subtitle */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 mb-4 sm:mb-6">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none">
          Setup
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed max-w-[280px] sm:text-right">
          Up and Running in 60 Seconds
        </p>
      </div>

      {/* Main 2-Column Area: Left Stepper & Right Draggable Window */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 lg:gap-12">
        {/* Left Column: Timeline Stepper */}
        <div className="w-full max-w-xl flex flex-col space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 shrink-0 mb-6 sm:mb-8 lg:mb-12 ml-0 sm:ml-4 md:ml-8 lg:ml-13">
          {STEPS.map((step, idx) => {
            const isFirst = idx === 0
            const isLast = idx === STEPS.length - 1
            const isPassed = idx <= activeIndex
            const isCurrent = idx === activeIndex

            return (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="relative flex items-center gap-3 sm:gap-6 md:gap-8 group cursor-pointer"
              >
                {/* Step Index Badge */}
                <span
                  className={`w-12 sm:w-16 md:w-18 text-right font-gilroy text-[10px] sm:text-sm select-none transition-colors duration-300 ${
                    isPassed ? 'text-white font-medium' : 'text-zinc-500'
                  }`}
                >
                  {step.number}
                </span>

                {/* Central Node Circle Column with Connecting Line */}
                <div className="relative flex items-center justify-center shrink-0">
                  {/* Top Line Segment */}
                  {!isFirst && (
                    <div
                      className={`absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-[1.5px] pointer-events-none -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-10 transition-colors duration-300 ${
                        idx <= activeIndex
                          ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : 'bg-zinc-800'
                      }`}
                    />
                  )}

                  {/* Bottom Line Segment */}
                  {!isLast && (
                    <div
                      className={`absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] pointer-events-none -mb-4 sm:-mb-6 md:-mb-8 lg:-mb-10 transition-colors duration-300 ${
                        idx < activeIndex
                          ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : 'bg-zinc-800'
                      }`}
                    />
                  )}

                  {/* Node Icon Circle */}
                  <div
                    className={`relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent
                        ? 'bg-white text-black ring-4 ring-white/30 shadow-[0_0_18px_rgba(255,255,255,0.85)] scale-110'
                        : isPassed
                        ? 'bg-white text-black shadow-md scale-100'
                        : 'bg-[#18181b] border border-zinc-700 text-zinc-400 scale-95'
                    }`}
                  >
                    <i className={`${step.icon} text-xs sm:text-base`} />
                  </div>
                </div>

                {/* Step Description */}
                <div className="flex-1">
                  <p
                    className={`font-gilroy text-xs sm:text-base md:text-lg lg:text-xl font-normal leading-snug tracking-tight whitespace-pre-line transition-colors duration-300 ${
                      isCurrent
                        ? 'text-white font-medium drop-shadow-sm'
                        : isPassed
                        ? 'text-zinc-200'
                        : 'text-zinc-500'
                    }`}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Draggable Showcase Frame at Bottom-0 */}
        <div className="w-full sm:w-[460px] md:w-[520px] lg:w-[580px] xl:w-[660px] shrink-0 flex items-end justify-center lg:justify-end self-end pb-0">
          <div
            ref={frameGlassRef}
            className="w-full liquid-glass !rounded-[15px] p-3 sm:p-4 shadow-[0_25px_70px_rgba(0,0,0,0.9)] select-none z-30 mb-0"
          >
            {/* Mac Window Controls (Draggable Trigger Handle matching Video.jsx) */}
            <div
              ref={handleRef}
              data-cursor="drag"
              title="Drag window anywhere on page"
              className="flex items-center gap-2 mb-3 px-1 py-1 cursor-grab active:cursor-grabbing w-fit rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-sm" />
            </div>

            {/* Inner Window Display Container with reactive crossfading images */}
            <div className="relative w-full aspect-video rounded-[10px] overflow-hidden bg-zinc-950 border border-white/10 shadow-inner group pointer-events-none">
              {STEPS.map((step, i) => {
                const isCurrent = activeIndex === i
                const isPrevious = activeIndex > i

                return (
                  <div
                    key={step.number}
                    className="absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: isCurrent ? 1 : 0,
                      transform: isCurrent
                        ? 'scale(1) translateY(0px)'
                        : isPrevious
                        ? 'scale(0.96) translateY(-6px)'
                        : 'scale(1.04) translateY(6px)',
                      filter: isCurrent ? 'blur(0px)' : 'blur(6px)',
                      pointerEvents: 'none',
                      zIndex: isCurrent ? 10 : 0,
                    }}
                  >
                    <video
                      src={step.img}
                      className="w-full h-full object-cover object-center select-none"
                      autoPlay
                      muted
                      loop
                      playsInline
                      draggable={false}
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] pointer-events-none" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Setup