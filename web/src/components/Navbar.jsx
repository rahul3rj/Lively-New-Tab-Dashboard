import React, { useEffect, useState } from 'react'
import RippleButton from './RippleButton'
import { useLiquidGlass } from '../utils/useLiquidGlass'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  // Attach Liquid Glass physics ONLY when scrolled into the pill state
  const glassRef = useLiquidGlass({
    enabled: isScrolled,
    scale: -112,
    chroma: 6,
    blur: 3,
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

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'FEATURES', href: '#features' },
    { name: 'THEMES', href: '#themes' },
    { name: 'COMPARISON', href: '#comparison' },
    { name: 'FAQS', href: '#faqs' },
    { name: 'CONTRIBUTORS', href: '#contributors' },
  ]

  return (
    <header
      className={`fixed inset-x-0 z-50 flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isScrolled ? 'top-3 sm:top-5 px-4' : 'top-0 px-8 md:px-14 py-5 md:py-6'
      }`}
    >
      {/* Rubber-band Shrinking Island Container */}
      <div
        ref={glassRef}
        className={`pointer-events-auto relative flex items-center justify-between font-syne transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isScrolled
            ? 'w-[94%] max-w-5xl liquid-glass rounded-full px-6 md:pr-2 md:pl-8 py-1.5 shadow-2xl'
            : 'w-full max-w-full bg-transparent px-0 py-0 rounded-none border-0 shadow-none'
        }`}
      >
        {/* Brand Logo */}
        <a href='#' className='flex items-center gap-2 group cursor-pointer z-10'>
          <img
            src='/logo.png'
            alt='OS Logo'
            className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 h-10`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </a>

        {/* Dead Center Nav Links */}
        <nav className='hidden md:flex items-center gap-7 lg:gap-10 absolute left-1/2 -translate-x-1/2'>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className='text-[10px] font-syne font-bold text-zinc-300 hover:text-white transition-colors duration-200 uppercase tracking-wider'
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Button: Reusable RippleButton */}
        <div className='flex items-center z-10'>
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
      </div>
    </header>
  )
}

export default Navbar
