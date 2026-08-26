import React, { useState } from 'react'

const DEFAULT_SHORTCUTS = [
  { id: 'google', title: 'Google', url: 'https://www.google.com', iconClass: 'ri-google-fill' },
  { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com', iconClass: 'ri-youtube-fill' },
  { id: 'github', title: 'GitHub', url: 'https://github.com', iconClass: 'ri-github-fill' },
  { id: 'chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com', iconClass: 'ri-openai-fill' },
  { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', iconClass: 'ri-gemini-fill' },
  { id: 'notion', title: 'Notion', url: 'https://www.notion.so', iconClass: 'ri-book-open-line' },
  { id: 'reddit', title: 'Reddit', url: 'https://www.reddit.com', iconClass: 'ri-reddit-fill' },
]

const Taskbar = ({
  shortcuts = DEFAULT_SHORTCUTS,
  onReorderShortcuts,
}) => {
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const validShortcuts = shortcuts.filter((s) => s && typeof s.url === 'string' && s.url.trim())

  const shortcutKey = (s) => s.id || s.url

  const handleShortcutDragStart = (e, s) => {
    setDraggedId(shortcutKey(s))
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', '')
    }
  }

  const handleShortcutDragOver = (e, s) => {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    const key = shortcutKey(s)
    if (dragOverId !== key) setDragOverId(key)
  }

  const handleShortcutDrop = (e, s) => {
    e.preventDefault()
    const fromId = draggedId
    const toId = shortcutKey(s)
    setDraggedId(null)
    setDragOverId(null)
    if (!fromId || fromId === toId) return
    if (typeof onReorderShortcuts === 'function') {
      onReorderShortcuts(fromId, toId)
    }
  }

  const handleShortcutDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleContainerDrop = (e) => {
    e.preventDefault()
    handleShortcutDragEnd()
  }

  return (
    <div
      className='group/taskbar flex items-center justify-center gap-2.5 pointer-events-auto z-20'
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleContainerDrop}
    >
      {validShortcuts.map((s) => {
        const key = shortcutKey(s)
        const isDragging = draggedId === key
        const isDragOver = dragOverId === key && !isDragging
        return (
          <a
            key={key}
            href={s.url}
            draggable
            onDragStart={(e) => handleShortcutDragStart(e, s)}
            onDragOver={(e) => handleShortcutDragOver(e, s)}
            onDrop={(e) => handleShortcutDrop(e, s)}
            onDragEnd={handleShortcutDragEnd}
            className={`figma-glass-card h-[6.5vh] w-[6.5vh] min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'opacity-40 scale-95'
                : isDragOver
                  ? 'ring-2 ring-white/70 border-white/60 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'hover:scale-105'
            }`}
            title={s.title || s.url}
          >
            {s.iconDataUrl ||
            s.iconUrl ||
            (s.iconClass &&
              (s.iconClass.startsWith('img:') ||
                s.iconClass.startsWith('http://') ||
                s.iconClass.startsWith('https://') ||
                s.iconClass.startsWith('data:'))) ? (
              <img
                src={(s.iconDataUrl || s.iconUrl || s.iconClass).replace(/^img:/, '')}
                alt={s.title || ''}
                className='h-[3.2vh] w-[3.2vh] min-h-[22px] min-w-[22px] object-contain relative z-10'
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : s.iconClass ? (
              <i className={`${s.iconClass} text-[2.8vh] text-white relative z-10`}></i>
            ) : (
              <i className='ri-link text-[2.8vh] text-white relative z-10'></i>
            )}
          </a>
        )
      })}
    </div>
  )
}

export default Taskbar