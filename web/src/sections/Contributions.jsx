import React, { useState, useEffect, useRef } from 'react'
import contributorsData from '../data/contributors.json'

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`

// Main Center Planet Radius Reference (Exact pixel precision)
const R_MAIN = 145 // 290px diameter main planet

// Randomizer Constraints: Size can never exceed 50% of R_MAIN
const MIN_SAT_RADIUS = 34 // 68px diameter minimum
const MAX_SAT_RADIUS = Math.floor(R_MAIN * 0.48) // 69px maximum (~48% of R_MAIN, strictly <= 50%)

// Generate a random radius within [MIN_SAT_RADIUS, MAX_SAT_RADIUS]
const getRandomRadius = () => {
  return Math.floor(
    MIN_SAT_RADIUS + Math.random() * (MAX_SAT_RADIUS - MIN_SAT_RADIUS + 1)
  )
}

// Normalize angle between -PI and +PI
const normalizeAngle = (ang) => {
  while (ang > Math.PI) ang -= 2 * Math.PI
  while (ang < -Math.PI) ang += 2 * Math.PI
  return ang
}

// Generate evenly distributed angles with organic jitter for N contributors
const getInitialAngle = (idx, total) => {
  const step = (2 * Math.PI) / Math.max(total, 1)
  const jitter = (Math.random() - 0.5) * (step * 0.35)
  return normalizeAngle(idx * step - Math.PI * 0.75 + jitter)
}

// Helper to build satellites list with fresh random sizes and angles from contributors.json
const buildSatellitesList = () => {
  const rawList = contributorsData.contributors || []
  const total = rawList.length
  return rawList.map((contributor, idx) => ({
    ...contributor,
    rank: idx + 2,
    radius: getRandomRadius(),
    baseAngle: getInitialAngle(idx, total),
  }))
}

const Contributions = () => {
  const ownerData = {
    ...contributorsData.owner,
    rank: 1,
    isLead: true,
  }

  const [owner, setOwner] = useState(ownerData)
  const [activeContributor, setActiveContributor] = useState(ownerData)
  const [satellites, setSatellites] = useState(buildSatellitesList)

  // Planetary physics state
  const centerPosRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, vx: 0, vy: 0 })
  const targetCenterRef = useRef({ x: 0, y: 0 })

  // Angular state on the planet's surface for each satellite
  const satAngularStateRef = useRef(
    satellites.map((s) => ({
      angle: s.baseAngle,
      angVel: 0,
    }))
  )
  const satellitesConfigRef = useRef(satellites)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const centerElRef = useRef(null)
  const satElsRef = useRef([])

  // Keep references in sync with satellites state
  useEffect(() => {
    satellitesConfigRef.current = satellites
    satAngularStateRef.current = satellites.map((s) => ({
      angle: s.baseAngle,
      angVel: 0,
    }))
  }, [satellites])

  // Planetary Surface Inertia & Gravity Physics Engine
  useEffect(() => {
    let animId
    let time = 0

    const updatePhysics = () => {
      time += 1

      // 1. Calculate Planet Motion & Acceleration
      const prevX = centerPosRef.current.x
      const prevY = centerPosRef.current.y

      // Lerp center towards drag target (or spring back to 0,0)
      centerPosRef.current.x +=
        (targetCenterRef.current.x - centerPosRef.current.x) * 0.2
      centerPosRef.current.y +=
        (targetCenterRef.current.y - centerPosRef.current.y) * 0.2

      // Velocity of the planet
      const planetVelX = centerPosRef.current.x - prevX
      const planetVelY = centerPosRef.current.y - prevY

      // Acceleration of the planet (rate of change of velocity)
      const planetAccX = planetVelX - (centerPosRef.current.vx || 0)
      const planetAccY = planetVelY - (centerPosRef.current.vy || 0)

      centerPosRef.current.vx = planetVelX
      centerPosRef.current.vy = planetVelY

      if (centerElRef.current) {
        centerElRef.current.style.transform = `translate3d(${centerPosRef.current.x}px, ${centerPosRef.current.y}px, 0)`
      }

      const count = satAngularStateRef.current.length

      // 2. Compute Inertial Force along the Planet's Surface for each object (Free Dynamic Rolling)
      for (let i = 0; i < count; i++) {
        const state = satAngularStateRef.current[i]
        const config = satellitesConfigRef.current[i]
        if (!state || !config) continue

        // Tangential component of the inertial force: -m * a_planet
        // Unit tangent vector at angle theta is (-sin(theta), cos(theta))
        // F_tangent = (-planetAccX)*(-sin(theta)) + (-planetAccY)*(cos(theta))
        const inertiaForce =
          planetAccX * Math.sin(state.angle) - planetAccY * Math.cos(state.angle)

        // Rolling friction and free inertial movement along the planet perimeter
        state.angVel = state.angVel * 0.92 + inertiaForce * 0.0075
        state.angle = normalizeAngle(state.angle + state.angVel)
      }

      // 3. Multi-pass Angular Elastic Collision Resolver (Objects bump, bounce & swap places)
      for (let pass = 0; pass < 4; pass++) {
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            const stateA = satAngularStateRef.current[i]
            const stateB = satAngularStateRef.current[j]
            const cfgA = satellitesConfigRef.current[i]
            const cfgB = satellitesConfigRef.current[j]
            if (!stateA || !stateB || !cfgA || !cfgB) continue

            const surfaceR = R_MAIN + (cfgA.radius + cfgB.radius) * 0.5 + 4
            const minAngularDist = (cfgA.radius + cfgB.radius + 6) / surfaceR

            const angleDiff = normalizeAngle(stateB.angle - stateA.angle)
            const absDiff = Math.abs(angleDiff)

            if (absDiff < minAngularDist && absDiff > 0.0001) {
              const overlap = minAngularDist - absDiff
              const pushSign = Math.sign(angleDiff)

              // Push apart along the circumference
              stateA.angle = normalizeAngle(stateA.angle - pushSign * overlap * 0.5)
              stateB.angle = normalizeAngle(stateB.angle + pushSign * overlap * 0.5)

              // Elastic momentum transfer on collision
              const tempVelA = stateA.angVel
              const tempVelB = stateB.angVel
              stateA.angVel = tempVelB * 0.7 - pushSign * 0.002
              stateB.angVel = tempVelA * 0.7 + pushSign * 0.002
            }
          }
        }
      }

      // 4. Update DOM transforms using exact Spherical Surface Coordinates
      for (let i = 0; i < count; i++) {
        const state = satAngularStateRef.current[i]
        const config = satellitesConfigRef.current[i]
        const el = satElsRef.current[i]
        if (!state || !config || !el) continue

        // Exact tangent surface distance: mathematically impossible to go under or on top
        const surfaceDist = R_MAIN + config.radius + 3

        const worldX = centerPosRef.current.x + Math.cos(state.angle) * surfaceDist
        const worldY = centerPosRef.current.y + Math.sin(state.angle) * surfaceDist

        el.style.transform = `translate3d(${worldX}px, ${worldY}px, 0)`
      }

      animId = requestAnimationFrame(updatePhysics)
    }

    animId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Drag interaction handlers on center avatar
  const handlePointerDown = (e) => {
    isDraggingRef.current = true
    setActiveContributor(owner) // Focus HUD card on main image immediately
    dragStartRef.current = {
      x: e.clientX - targetCenterRef.current.x,
      y: e.clientY - targetCenterRef.current.y,
    }

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return
      const rawX = moveEvent.clientX - dragStartRef.current.x
      const rawY = moveEvent.clientY - dragStartRef.current.y

      const maxDistance = 220
      const dist = Math.hypot(rawX, rawY)
      if (dist > maxDistance) {
        const factor = maxDistance / dist
        targetCenterRef.current = { x: rawX * factor, y: rawY * factor }
      } else {
        targetCenterRef.current = { x: rawX, y: rawY }
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
      targetCenterRef.current = { x: 0, y: 0 }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <section id="contributors" className="relative w-full h-screen min-h-[640px] max-h-screen bg-black text-white select-none overflow-hidden">
      {/* Top Header Row: Left Title & Right Subtitle (Absolute Overlay) */}
      <div className="absolute top-16 sm:top-20 md:top-24 inset-x-4 sm:inset-x-6 md:inset-x-8 lg:inset-x-14 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pointer-events-none">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-rejoice font-normal tracking-tight text-white leading-none pointer-events-auto">
          Contributions
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed max-w-[280px] sm:text-right pointer-events-auto">
          Project OS is crafted with ❤️ by developers who believe your browser deserves better.
        </p>
      </div>

      {/* Center Dynamic Ball Cluster Canvas */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Central Exact Zero-Size Origin Point — Shifted Left for clearance from HUD Card */}
        <div className="relative w-0 h-0 flex items-center justify-center -translate-x-0 sm:-translate-x-16 md:-translate-x-24 lg:-translate-x-32">
          {/* Main Big Center Planet (Owner rahul3rj / Lead) — Positioned at (0, 0) */}
          <div
            ref={centerElRef}
            className="absolute z-10 will-change-transform pointer-events-auto -translate-x-1/2 -translate-y-1/2"
            style={{
              top: 0,
              left: 0,
              width: `${R_MAIN * 2}px`,
              height: `${R_MAIN * 2}px`,
            }}
          >
            {/* Main Ball Frame */}
            <div
              onPointerDown={handlePointerDown}
              onClick={() => setActiveContributor(owner)}
              onMouseEnter={() => {
                if (!isDraggingRef.current) setActiveContributor(owner)
              }}
              title="Drag me! Orbiting balls hold tight with gravity & inertial drift"
              className="relative w-full h-full rounded-full cursor-grab active:cursor-grabbing select-none"
            >
              {/* Subtle ambient backglow */}
              <div className="absolute -inset-3 rounded-full bg-white/10 blur-xl opacity-40 pointer-events-none" />

              {/* Main Planet Image Frame */}
              <div
                className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-colors duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.95)] ${
                  activeContributor.id === owner.id
                    ? 'border-white/80 shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                    : 'border-white/30'
                }`}
              >
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center select-none"
                  onError={(e) => {
                    e.currentTarget.src = 'https://github.com/rahul3rj.png'
                  }}
                />

                {/* Top Glass Specular Arc */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/25 via-transparent to-white/20 opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Surrounding REAL Satellite Objects Tangent to Planet Surface */}
          {satellites.map((contributor, idx) => {
            const isSelected = activeContributor.id === contributor.id
            const diameter = contributor.radius * 2

            return (
              <div
                key={contributor.id}
                ref={(el) => (satElsRef.current[idx] = el)}
                className="absolute z-10 will-change-transform pointer-events-auto -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: 0,
                  left: 0,
                  width: `${diameter}px`,
                  height: `${diameter}px`,
                }}
              >
                {/* Object Ball Frame */}
                <div
                  onClick={() => {
                    if (!isDraggingRef.current) setActiveContributor(contributor)
                  }}
                  onMouseEnter={() => {
                    if (!isDraggingRef.current) setActiveContributor(contributor)
                  }}
                  className={`relative w-full h-full rounded-full overflow-hidden border shadow-xl cursor-pointer select-none transition-colors duration-300 ${
                    isSelected
                      ? 'border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.3)]'
                      : 'border-white/25 hover:border-white/60'
                  }`}
                >
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center select-none"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${contributor.handle}`
                    }}
                  />

                  {/* Glass Sheen Specular Highlight */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-40 pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom-Right HUD Contributor Detail Card (Absolute on Section with lines extending to extreme right) */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 right-0 z-30 flex items-end justify-end pointer-events-none">
        {/* Card Framing Container */}
        <div className="relative border-y border-x border-white/15 bg-zinc-950/85 backdrop-blur-md p-4 sm:p-6 pr-6 sm:pr-9 mr-4 sm:mr-6 md:mr-8 lg:mr-14 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-none sm:w-[390px] md:w-[420px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] select-none pointer-events-auto">
          {/* Extended Top & Bottom Horizontal Lines stretching to the extreme right edge of viewport */}
          <div className="absolute top-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-t border-white/15 pointer-events-none" />
          <div className="absolute bottom-0 left-full w-4 sm:w-6 md:w-8 lg:w-14 border-b border-white/15 pointer-events-none" />

          {/* Background Layer with Overflow-Hidden for Gradients and Noise only */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Horizontal Ambient Gradient: 100% visible on left -> 0% on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.08] via-white/[0.025] to-transparent pointer-events-none" />

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

          {/* 4 Corner & Intersection Nodes on the Card Borders */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/60 shadow-sm z-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/60 shadow-sm z-30 pointer-events-none" />
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/60 shadow-sm z-30 pointer-events-none" />
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/60 shadow-sm z-30 pointer-events-none" />

          {/* Card Content with z-10 */}
          <div className="relative z-10">
            {/* Rank / Index Badge */}
            <div className="flex items-center justify-between">
              <span className="font-gilroy text-xs sm:text-sm text-zinc-400 font-medium tracking-wide">
                #{activeContributor.rank}
              </span>
              {activeContributor.contributionsCount && (
                <span className="text-[11px] font-gilroy text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {activeContributor.contributionsCount}
                </span>
              )}
            </div>

            {/* Contributor Full Name */}
            <h3 className="font-rejoice text-3xl sm:text-4xl md:text-[2.4rem] text-white font-normal tracking-tight mt-1.5 mb-1 transition-all duration-300 leading-tight">
              {activeContributor.name}
            </h3>

            {/* Contributor Tagline / Bio from GitHub */}
            <p className="font-gilroy text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mt-0.5">
              {activeContributor.tagline}
            </p>

            {/* Bottom Row: GitHub Handle & Role */}
            <div className="flex items-center justify-between mt-5 sm:mt-7 pt-2 border-t border-white/5">
              <a
                href={activeContributor.githubUrl || `https://github.com/${activeContributor.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-[13px] font-gilroy transition-colors pointer-events-auto"
              >
                <i className="ri-github-fill text-base" />
                <span>@{activeContributor.handle}</span>
              </a>

              <span className="text-zinc-500 text-xs sm:text-[13px] font-gilroy font-light">
                {activeContributor.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contributions