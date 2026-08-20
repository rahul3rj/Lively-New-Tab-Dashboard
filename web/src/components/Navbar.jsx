import React, { useEffect, useState } from 'react'
import RippleButton from './RippleButton'
import { useLiquidGlass } from '../utils/useLiquidGlass'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Attach Liquid Glass physics ONLY when scrolled into the pill state
  const glassRef = useLiquidGlass({
    enabled: isScrolled,
    scale: -112,
    chroma: 6,
    blur: 3,
    saturate: 1.8
  })

  // Attach Liquid Glass refraction to the mobile menu dropdown
  const menuGlassRef = useLiquidGlass({
    enabled: isMobileMenuOpen,
    scale: -90,
    chroma: 5,
    blur: 4,
    saturate: 1.8
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    const handleClickOutside = (e) => {
      if (!e.target.closest('header')) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const navLinks = [
    { name: 'FEATURES', href: '#features' },
    { name: 'THEMES', href: '#themes' },
    { name: 'COMPARISON', href: '#comparison' },
    { name: 'CONTRIBUTORS', href: '#contributors' },
    { name: 'FAQS', href: '#faqs' },
  ]

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    if (href === '#' || href === '#top') {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.5 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    const target = document.querySelector(href)
    if (!target) return

    if (window.__lenis) {
      window.__lenis.scrollTo(target, {
        offset: 0,
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed inset-x-0 z-50 flex flex-col items-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isScrolled ? 'top-3 sm:top-5 px-3 sm:px-4' : 'top-0 px-4 sm:px-8 md:px-14 py-4 md:py-6'
      }`}
    >
      {/* Rubber-band Shrinking Island Container */}
      <div
        ref={glassRef}
        className={`pointer-events-auto relative flex items-center justify-between font-syne transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isScrolled
            ? 'w-[96%] sm:w-[94%] max-w-5xl liquid-glass rounded-full px-4 sm:px-6 md:pr-2 md:pl-8 py-1.5 shadow-2xl'
            : 'w-full max-w-full bg-transparent px-0 py-0 rounded-none border-0 shadow-none'
        }`}
      >
        {/* Brand Logo */}
        <a
          href='#'
          onClick={(e) => handleNavClick(e, '#')}
          className='flex items-center gap-2 group cursor-pointer z-10'
        >
          <img
            src='/logo.png'
            alt='OS Logo'
            loading='eager'
            decoding='async'
            className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 h-8 sm:h-10`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </a>

        {/* Dead Center Nav Links with Shine On Hover (Desktop Only) */}
        <nav className='hidden md:flex items-center gap-7 lg:gap-10 absolute left-1/2 -translate-x-1/2'>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className='nav-link-shine text-[10px] font-syne font-bold uppercase tracking-wider cursor-pointer select-none'
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Group: Star on GitHub Button on Desktop, Minimal Hamburger on Mobile */}
        <div className='flex items-center gap-2 z-10'>
          {/* Desktop Star on GitHub Button (Hidden on Mobile) */}
          <div className='hidden md:flex items-center'>
            <RippleButton
              href='https://github.com/rahul3rj/Project-OS'
              target='_blank'
              rel='noopener noreferrer'
              className={`transition-all duration-500 ${
                isScrolled ? 'px-5 py-2 text-[11px]' : 'px-7 py-3 text-xs'
              }`}
            >
              <span>STAR ON GITHUB</span>
              <i className='ri-github-fill text-sm h-4 w-4 flex items-center justify-center' />
            </RippleButton>
          </div>

          {/* Mobile Clean Hamburger Button (No background, larger Remix Icon) */}
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              setIsMobileMenuOpen((prev) => !prev)
            }}
            aria-label='Toggle Navigation Menu'
            className='md:hidden flex items-center justify-center p-1.5 text-white hover:text-zinc-300 transition-transform duration-200 active:scale-90 cursor-pointer bg-transparent border-0 shadow-none outline-none'
          >
            <i className={`transition-transform duration-300 ${isMobileMenuOpen ? 'ri-close-line rotate-90 text-[26px]' : 'ri-menu-4-line text-[24px]'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Links Dropdown Panel (Real Liquid Glass) */}
      <div
        className={`md:hidden w-[96%] max-w-sm mt-3 pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto max-h-[500px]'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none max-h-0 overflow-hidden'
        }`}
      >
        <div
          ref={menuGlassRef}
          className='relative w-full liquid-glass !rounded-[24px] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] select-none overflow-hidden'
        >
          {/* Subtle top ambient glow */}
          <div className='absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none' />

          <div className='relative z-10 flex flex-col space-y-1.5'>
            {navLinks.map((link, idx) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className='flex items-center justify-between py-2.5 px-3.5 rounded-xl font-syne font-bold text-xs uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all'
              >
                <span>{link.name}</span>
                <span className='font-mono text-[10px] text-zinc-400/80 font-normal'>0{idx + 1}</span>
              </a>
            ))}

            {/* Star on GitHub CTA button inside the liquid glass menu */}
            <div className='pt-3 mt-2 border-t border-white/10 flex flex-col items-center'>
              <RippleButton
                href='https://github.com/rahul3rj/Project-OS'
                target='_blank'
                rel='noopener noreferrer'
                className='w-full py-2.5 text-[11px] justify-center shadow-lg'
              >
                <span>STAR ON GITHUB</span>
                <i className='ri-github-fill text-sm h-4 w-4 flex items-center justify-center' />
              </RippleButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
