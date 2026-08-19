import React from 'react'
import RippleButton from '../components/RippleButton'
import { useLiquidGlass } from '../utils/useLiquidGlass'

const Footer = () => {
  // Real liquid glass refraction for Add to Chrome button matching Hero.jsx
  const chromeGlassRef = useLiquidGlass({
    scale: -90,
    chroma: 4,
    blur: 3,
    saturate: 1.6,
  })

  return (
    <footer
      className="relative w-full h-screen min-h-[640px] z-0"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <div className="fixed bottom-0 left-0 w-full h-screen min-h-[640px] flex flex-col justify-between">
        <section className="relative isolate w-full h-full bg-black text-white px-4 sm:px-10 md:px-14 pt-8 sm:pt-14 md:pt-16 pb-5 sm:pb-7 flex flex-col justify-between select-none overflow-hidden">
          {/* Footer Background Artwork */}
          <img
            src="/footer.png"
            alt="Footer Background"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Top Content Row: Left Headline & Right Subtitle + CTAs */}
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0 mt-3 sm:mt-5">
            {/* Left Headline */}
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-rejoice font-normal text-white leading-[1.1] tracking-tight">
                The OS You Was Always
                <br />
                Missing...
              </h2>
            </div>

            {/* Right Column: Subtitle + Action Buttons */}
            <div className="flex flex-col items-start md:items-end gap-3 sm:gap-5">
              <p className="text-[10px] sm:text-[11px] md:text-xs text-zinc-300 font-light leading-relaxed max-w-[280px] md:text-right">
                Turn Every Blank Tab Into Your Ultimate
                <br className="hidden sm:inline" /> Productivity Command Center
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
                {/* Add to Chrome Button with Real Liquid Glass */}
                <a
                  ref={chromeGlassRef}
                  href="#chrome-store"
                  data-cursor="soon"
                  className="liquid-glass liquid-glass-btn flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-[9.5px] sm:text-[11px] font-syne font-bold uppercase transition-all duration-300 shadow-xl"
                >
                  <span>ADD TO CHROME</span>
                  <i className="ri-chrome-fill text-sm" />
                </a>

                {/* Download Zip Button (RippleButton) */}
                <RippleButton
                  href="https://drive.google.com/uc?export=download&id=1WhLH_-XkolPMaNIcPfXzu5QbRj0MYo0_"
                  className="px-4 sm:px-6 py-2 sm:py-3 text-[9.5px] sm:text-[11px]"
                >
                  <span>DOWNLOAD ZIP</span>
                  <i className="ri-download-line text-sm font-bold" />
                </RippleButton>
              </div>
            </div>
          </div>

          {/* Center Giant Typography: "Project OS" with mix-blend-difference */}
          <div className="relative w-full flex items-center justify-center pointer-events-none select-none my-auto mt-10 sm:mt-20 md:mt-33">
            <h1
              className="font-rejoice text-[15vw] sm:text-[17vw] md:text-[19vw] lg:text-[21vw] font-normal leading-none tracking-tight text-white mix-blend-difference whitespace-nowrap text-center"
              style={{ mixBlendMode: 'difference' }}
            >
              Project OS
            </h1>
          </div>

          {/* Bottom Center Legal / Copyright Line */}
          <div className="relative z-10 w-full flex items-center justify-center shrink-0">
            <p className="text-[10px] sm:text-xs text-white font-light tracking-wide text-center">
              © 2025 Project OS. MIT License. Made with{' '}
              <span className="text-red-500">❤️</span> by Rahul Jha 🇮🇳
            </p>
          </div>
        </section>
      </div>
    </footer>
  )
}

export default Footer
