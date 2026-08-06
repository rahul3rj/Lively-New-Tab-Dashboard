import React from 'react'

/**
 * FigmaGlassCard Component
 * Implements exact Figma design specs:
 * - Fill: #29292B at 40% opacity (rgba(41, 41, 43, 0.40))
 * - Stroke: Top border 1px #B1B1B1 (100% opacity)
 * - Background Blur: 84.2px
 * - Drop Shadow: 0px 13px 29px rgba(0, 0, 0, 0.20)
 * - Mono Noise: 25% opacity noise overlay
 */
const FigmaGlassCard = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div
      className={`figma-glass-card rounded-2xl ${className}`}
      style={style}
      {...props}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}

export default FigmaGlassCard
