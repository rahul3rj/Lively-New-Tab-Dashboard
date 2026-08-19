import React, { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './sections/Hero'
import Video from './sections/Video'
import Features from './sections/Features'
import Themes from './sections/Themes'
import Spacer from './sections/Spacer'
import Comparison from './sections/Comparison'
import Setup from './sections/Setup'
import Contributions from './sections/Contributions'
import FAQs from './sections/FAQs'
import Footer from './sections/Footer'
import CursorFollower from './components/CursorFollower'
gsap.registerPlugin(ScrollTrigger)

const App = () => {
  useEffect(() => {
    // Ultra-smooth Awwwards-grade momentum scroll configuration
    const lenis = new Lenis({
      lerp: 0.075, // Buttery smooth linear interpolation
      duration: 1.8, // Extended glide duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.88, // Softened wheel impulse for velvety response
      touchMultiplier: 1.8,
      infinite: false,
    })

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Expose lenis instance globally for smooth navbar scrolling
    window.__lenis = lenis

    const tickerHandler = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerHandler)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerHandler)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return (
    <div className='w-full min-h-screen bg-black text-white selection:bg-white selection:text-black'>
      <CursorFollower />
      <Hero />
      <Video />
      <Features />
      <Spacer />
      <Themes />
      <Comparison/>
      <Setup/>
      <Contributions/>
      <FAQs/>
      <Footer/>
    </div>
  )
}

export default App