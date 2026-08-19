import { useEffect, useRef } from 'react'
import { liquidGlass } from './liquid-glass'

/**
 * React hook to attach the Liquid Glass refraction effect to any component.
 * 
 * @param {Object|null} [options]
 * @param {boolean} [options.enabled=true] Enable or disable the effect
 * @param {number} [options.scale=-112] Refraction strength (-60 subtle to -180 dramatic)
 * @param {number} [options.chroma=6] Chromatic prism fringe
 * @param {number} [options.border=0.07] Inset border rim fraction
 * @param {number} [options.mapBlur=12] Curvature smoothness of rim bulge
 * @param {number} [options.blur=3] Backdrop blur inside glass
 * @param {number} [options.saturate=1.5] Backdrop saturation boost
 * @param {number} [options.fallbackBlur=20] Fallback blur for Firefox/Safari
 */
export function useLiquidGlass(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !options || options.enabled === false) {
      if (ref.current) {
        ref.current.style.backdropFilter = ''
        ref.current.style.webkitBackdropFilter = ''
      }
      return
    }
    const glass = liquidGlass(ref.current, options)
    return () => {
      glass.destroy()
    }
  }, [
    options?.enabled,
    options?.scale,
    options?.chroma,
    options?.border,
    options?.mapBlur,
    options?.blur,
    options?.saturate
  ])

  return ref
}

export default useLiquidGlass
