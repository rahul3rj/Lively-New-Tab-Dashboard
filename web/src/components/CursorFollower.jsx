import React, { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

const CURSOR_STATES = {
  scroll: {
    label: 'Scroll',
    icon: '/Up Left.png',
  },
  hover: {
    label: 'Hover',
    icon: '/Hand Cursor.png',
  },
  drag: {
    label: 'Dragg',
    icon: '/Drag.png',
  },
  wait: {
    label: 'Wait...',
    icon: '/Wait.png',
  },
  soon: {
    label: 'Soon...',
    icon: '/Wait.png',
  },
}

/**
 * Custom Pill Cursor Follower
 * Renders the sleek cursor pointer arrow + dynamic pill badge with 4 states:
 * 1. Scroll (Default browsing state)
 * 2. Hover (Interactive links, buttons, cards)
 * 3. Dragg (Draggable modals, planetary physics, mousedown)
 * 4. Wait... (Action trigger, async simulation, loading)
 */
const CursorFollower = () => {
  const containerRef = useRef(null)
  const [cursorState, setCursorState] = useState('scroll')
  const [isVisible, setIsVisible] = useState(false)
  const isMouseDownRef = useRef(false)
  const waitTimeoutRef = useRef(null)

  useEffect(() => {
    // Disable custom cursor on touchscreens
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const container = containerRef.current
    if (!container) return

    // GSAP quickTo for ultra-smooth crisp 120fps fluid cursor movement with integer pixel rounding
    const xTo = gsap.quickTo(container, 'x', { duration: 0.12, ease: 'power2.out', autoRound: true })
    const yTo = gsap.quickTo(container, 'y', { duration: 0.12, ease: 'power2.out', autoRound: true })

    const updatePosition = (clientX, clientY) => {
      if (clientX === undefined || clientY === undefined) return

      // If cursor is at or beyond the window boundaries, fade out
      if (
        clientY <= 0 ||
        clientX <= 0 ||
        clientX >= window.innerWidth ||
        clientY >= window.innerHeight
      ) {
        setIsVisible(false)
        return
      }

      if (!isVisible) setIsVisible(true)
      xTo(clientX)
      yTo(clientY)
    }

    const lastMousePosRef = { x: 0, y: 0 }

    const evaluateCursorState = (target) => {
      if (!target) return 'scroll'

      // 1. Explicit data-cursor override
      const explicitCursor = target.closest('[data-cursor]')
      if (explicitCursor) {
        const type = explicitCursor.getAttribute('data-cursor')
        if (CURSOR_STATES[type]) {
          return type
        }
      }

      // Check if hovering liquid glass Chrome store button
      const isChromeBtn = target.closest('a[href="#chrome-store"], .liquid-glass-btn')
      if (isChromeBtn) {
        return 'soon'
      }

      // 2. Drag areas (Setup draggable frame, planetary interactive physics canvas)
      const isDraggable = target.closest(
        '.draggable-handle, .cursor-grab, .cursor-grabbing, [data-draggable="true"], #contributors canvas, #contributors svg'
      )
      if (isDraggable) {
        return 'drag'
      }

      // 3. Interactive clickable elements -> Hover state
      const isInteractive = target.closest(
        'a, button, input, textarea, select, [role="button"], .cursor-pointer, .liquid-glass, .nav-link-shine'
      )
      if (isInteractive) {
        return 'hover'
      }

      // 4. Default -> Scroll state
      return 'scroll'
    }

    const handlePointerMove = (e) => {
      lastMousePosRef.x = e.clientX
      lastMousePosRef.y = e.clientY
      updatePosition(e.clientX, e.clientY)

      // If not in temporary wait state, evaluate hover under cursor on move
      if (!waitTimeoutRef.current) {
        setCursorState(evaluateCursorState(e.target))
      }
    }

    const handleMouseEnter = () => setIsVisible(true)

    const handleMouseLeave = (e) => {
      // Fade out smoothly if leaving the document / browser window
      if (!e.relatedTarget && !e.toElement) {
        setIsVisible(false)
      }
    }

    const handleBlur = () => {
      setIsVisible(false)
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current)
        waitTimeoutRef.current = null
      }
    }

    const handleFocus = () => {
      setIsVisible(true)
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current)
        waitTimeoutRef.current = null
      }
      const el = document.elementFromPoint(lastMousePosRef.x, lastMousePosRef.y)
      setCursorState(evaluateCursorState(el))
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (waitTimeoutRef.current) {
          clearTimeout(waitTimeoutRef.current)
          waitTimeoutRef.current = null
        }
        const el = document.elementFromPoint(lastMousePosRef.x, lastMousePosRef.y)
        setCursorState(evaluateCursorState(el))
      }
    }

    const handleMouseDown = (e) => {
      isMouseDownRef.current = true
      const target = e.target

      // Check if clicking inside draggable areas
      const isDraggableArea = target.closest(
        '[data-cursor="drag"], .draggable-handle, .cursor-grab, .cursor-grabbing, #setup, #contributors'
      )
      if (isDraggableArea) {
        setCursorState('drag')
        return
      }

      // Check if clicking an action button or link to trigger "Wait..."
      const isAction = target.closest('a, button, [role="button"], .liquid-glass')
      if (isAction) {
        if (waitTimeoutRef.current) {
          clearTimeout(waitTimeoutRef.current)
          waitTimeoutRef.current = null
        }
        setCursorState('wait')
        waitTimeoutRef.current = setTimeout(() => {
          waitTimeoutRef.current = null
          // Re-evaluate what element is currently under the cursor
          const currentElement = document.elementFromPoint(lastMousePosRef.x, lastMousePosRef.y)
          setCursorState(evaluateCursorState(currentElement))
        }, 600)
        return
      }
    }

    const handleMouseUp = () => {
      isMouseDownRef.current = false
    }

    // Dynamic state detection based on hovered elements
    const handleMouseOver = (e) => {
      if (waitTimeoutRef.current) return
      setCursorState(evaluateCursorState(e.target))
    }

    const handleCustomPos = (e) => {
      if (e.detail) {
        updatePosition(e.detail.x, e.detail.y)
      }
    }

    const handleCustomState = (e) => {
      if (e.detail && CURSOR_STATES[e.detail]) {
        setCursorState(e.detail)
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true })
    window.addEventListener('mousemove', handlePointerMove, { passive: true, capture: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true, capture: true })
    window.addEventListener('cursor-pos', handleCustomPos)
    window.addEventListener('cursor-state', handleCustomState)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('mousedown', handleMouseDown, { capture: true })
    window.addEventListener('mouseup', handleMouseUp, { capture: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove, { capture: true })
      window.removeEventListener('mousemove', handlePointerMove, { capture: true })
      window.removeEventListener('touchmove', handlePointerMove, { capture: true })
      window.removeEventListener('cursor-pos', handleCustomPos)
      window.removeEventListener('cursor-state', handleCustomState)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('mousedown', handleMouseDown, { capture: true })
      window.removeEventListener('mouseup', handleMouseUp, { capture: true })
      document.removeEventListener('mouseover', handleMouseOver)
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current)
        waitTimeoutRef.current = null
      }
    }
  }, [])

  const activeConfig = CURSOR_STATES[cursorState] || CURSOR_STATES.scroll

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] select-none cursor-crisp transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Side Pill Badge Container (Floating with comfortable breathing space from native cursor) */}
      <div className='flex items-center bg-white text-black rounded-full pl-4 pr-0.5 py-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.45)] border border-white/30 translate-x-6 translate-y-5'>
        {/* State Text Label */}
        <span className='font-rejoice text-[17px] sm:text-[18px] font-normal text-black leading-none tracking-normal mr-2.5 whitespace-nowrap min-w-[36px] pt-0.5 select-none antialiased'>
          {activeConfig.label}
        </span>

        {/* Black Circle with State Icon (Bigger circle + larger icon) */}
        <div className='w-8 h-9 sm:w-8.5 sm:h-8.5 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm'>
          <img
            key={cursorState}
            src={activeConfig.icon}
            alt={activeConfig.label}
            className={`w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain pointer-events-none transition-transform duration-200 ${
              cursorState === 'wait' || cursorState === 'soon' ? 'animate-spin' : ''
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default CursorFollower
