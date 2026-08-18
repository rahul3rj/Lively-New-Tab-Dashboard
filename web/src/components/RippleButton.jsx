import React, { useRef, useState } from 'react'

/**
 * Reusable Awwwards-style Cursor-Origin Ripple Button
 * 
 * @param {React.ReactNode} children - Button text / icons / content
 * @param {string} [href] - If provided, renders as an <a> link; otherwise as <button>
 * @param {string} [className] - Custom classes (padding, font size, etc.)
 * @param {string} [circleColor='bg-black'] - Tailwind color class for expanding circle
 * @param {function} [onClick] - Click handler
 */
const RippleButton = ({
  children,
  href,
  className = '',
  circleColor = 'bg-black',
  onClick,
  target,
  rel,
  ...props
}) => {
  const buttonRef = useRef(null)
  const [circleCoords, setCircleCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (e) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setCircleCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsHovered(true)
  }

  const handleMouseLeave = (e) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setCircleCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsHovered(false)
  }

  const Component = href ? 'a' : 'button'

  return (
    <Component
      ref={buttonRef}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full overflow-hidden cursor-pointer select-none transition-colors duration-700 ease-out shadow-md font-syne font-bold uppercase text-xs px-7 py-3 ${
        isHovered ? 'bg-black text-white' : 'bg-white text-black'
      } ${className}`}
      {...props}
    >
      {/* Expanding Circle from cursor entry coordinates */}
      <span
        style={{
          left: `${circleCoords.x}px`,
          top: `${circleCoords.y}px`,
        }}
        className={`absolute pointer-events-none rounded-full ${circleColor} -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out ${
          isHovered ? 'w-[520px] h-[520px]' : 'w-0 h-0'
        }`}
      />

      {/* Button Content with smooth text color transition */}
      <span className='relative z-10 inline-flex items-center gap-2 transition-colors duration-500 ease-out group-hover:text-white'>
        {children}
      </span>
    </Component>
  )
}

export default RippleButton
