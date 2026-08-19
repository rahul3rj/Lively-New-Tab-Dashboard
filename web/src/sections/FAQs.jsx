import React, { useState } from 'react'

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`

const FAQ_ITEMS = [
  {
    id: 'free',
    question: 'Is Project OS really free?',
    answer: (
      <>
        Yes. 100% free, open-source, and <span className="text-white font-medium">MIT-licensed</span>. No freemium upsells, no premium tiers, no hidden costs. Ever.
      </>
    ),
  },
  {
    id: 'browsers',
    question: 'Does it work on browsers other than Chrome?',
    answer: (
      <>
        It works on any Chromium-based browser — <span className="text-white font-medium">Chrome</span>, <span className="text-white font-medium">Brave</span>, <span className="text-white font-medium">Edge</span>, <span className="text-white font-medium">Arc</span>, <span className="text-white font-medium">Vivaldi</span>, and <span className="text-white font-medium">Opera</span>. Firefox support is on the roadmap.
      </>
    ),
  },
  {
    id: 'performance',
    question: 'Will it slow down my browser?',
    answer: (
      <>
        No. Project OS loads instantly with <span className="text-white font-medium">0ms new-tab latency</span> and a <span className="text-white font-medium">&lt;15MB memory footprint</span> because everything runs locally with zero external API calls on startup.
      </>
    ),
  },
  {
    id: 'storage',
    question: 'Where is my data stored?',
    answer: (
      <>
        Entirely on your device using <span className="text-white font-medium">chrome.storage.local</span>. We have zero access to your data — no remote servers, no databases, no tracking, and no accounts.
      </>
    ),
  },
  {
    id: 'wallpapers',
    question: 'Can I use my own wallpapers?',
    answer: (
      <>
        Absolutely. Upload any high-res image or animated video (<span className="text-white font-medium">.mp4</span>, <span className="text-white font-medium">.webm</span>). You can also adjust blur, dark overlay opacity, and custom sizing.
      </>
    ),
  },
  {
    id: 'sync',
    question: 'Can I sync my data across devices?',
    answer: (
      <>
        Not yet natively, but you can use the <span className="text-white font-medium">JSON Backup & Restore</span> feature to manually export your setup and import it on another machine instantly.
      </>
    ),
  },
  {
    id: 'update',
    question: 'How do I update the extension?',
    answer: (
      <>
        Pull the latest changes from GitHub, run <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">npm run build</code>, and click the reload icon on <span className="text-white font-medium">chrome://extensions</span>. That's it.
      </>
    ),
  },
  {
    id: 'contribute',
    question: 'Can I contribute?',
    answer: (
      <>
        Yes! We welcome PRs, bug reports, feature requests, and theme contributions. Check the <span className="text-white font-medium">GitHub repository</span> for our contribution guidelines.
      </>
    ),
  },
]

const FAQs = () => {
  // First item open by default
  const [openIds, setOpenIds] = useState(['free'])

  const toggleFAQ = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section id="faqs" className="relative z-10 w-full min-h-screen bg-black text-white pt-20 md:pt-10 flex flex-col justify-center select-none overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.95)]">
      {/* Top Header Row: Left Title & Right Subtitle */}
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-0 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 mb-10 md:mb-14">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none mx-4 sm:mx-8 md:mx-14">
          FAQs
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed max-w-[280px] sm:text-right mx-4 sm:mx-8 md:mx-14">
          Got Questions?
          <br className="hidden sm:inline" /> We have answers.
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

          {/* FAQ Accordion Rows */}
          <div className="w-full flex flex-col">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIds.includes(item.id)
              const isLast = idx === FAQ_ITEMS.length - 1

              return (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer transition-colors duration-200 hover:bg-white/[0.02] ${
                    !isLast ? 'border-b border-white/15' : ''
                  }`}
                  onClick={() => toggleFAQ(item.id)}
                >
                  {/* Intersection Circle Nodes at Row Dividers */}
                  {!isLast && (
                    <>
                      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
                      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none z-30" />
                    </>
                  )}

                  {/* Active Open State Background: Horizontal Ambient & Noise Gradient */}
                  <div
                    className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ease-out ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Horizontal Ambient Gradient: 100% on left -> 0% on right */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.07] via-white/[0.02] to-transparent pointer-events-none" />

                    {/* Horizontal Noise Gradient Mask: 100% on left -> 0% on right */}
                    <div
                      className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
                      style={{
                        backgroundImage: `url("${NOISE_BG}")`,
                        backgroundSize: '140px 140px',
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </div>

                  {/* Question and Answer Row */}
                  <div className="relative z-10 py-4 sm:py-5 px-6 sm:px-8">
                    <div className="flex items-start">
                      {/* Indicator Icon */}
                      <span className="font-gilroy text-xs sm:text-sm text-zinc-400 font-mono tracking-wider w-8 sm:w-10 pt-0.5 shrink-0 select-none transition-colors group-hover:text-white">
                        {isOpen ? '[ − ]' : '[ + ]'}
                      </span>

                      {/* Question and Expandable Answer Column */}
                      <div className="flex-1">
                        <h3 className="font-gilroy text-sm sm:text-base md:text-lg text-white font-normal tracking-tight leading-snug group-hover:text-zinc-200 transition-colors">
                          {item.question}
                        </h3>

                        {/* Expandable Answer */}
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            isOpen
                              ? 'grid-rows-[1fr] opacity-100 mt-2.5 sm:mt-3'
                              : 'grid-rows-[0fr] opacity-0 mt-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="font-gilroy text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-3xl">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQs