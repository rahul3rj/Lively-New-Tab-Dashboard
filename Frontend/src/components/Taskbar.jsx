import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_SHORTCUTS = [
  { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', iconClass: 'ri-gemini-fill' },
  { id: 'claude', title: 'Claude', url: 'https://claude.ai', iconClass: 'ri-claude-fill' },
  { id: 'copilot', title: 'Copilot', url: 'https://copilot.microsoft.com', iconClass: 'ri-copilot-fill' },
  { id: 'openai', title: 'OpenAI', url: 'https://chat.openai.com', iconClass: 'ri-openai-fill' },
  { id: 'perplexity', title: 'Perplexity', url: 'https://perplexity.ai', iconClass: 'ri-perplexity-fill' },
  { id: 'deepseek', title: 'DeepSeek', url: 'https://chat.deepseek.com/', iconClass: 'ri-deepseek-fill' },
  {
    id: 'higgsfield',
    title: 'Higgsfield AI',
    url: 'https://higgsfield.ai',
    iconUrl: 'https://higgsfield.ai/favicon.ico',
  },
]

const PRESET_ICONS = [
  { id: 'gemini', label: 'Gemini', class: 'ri-gemini-fill' },
  { id: 'claude', label: 'Claude', class: 'ri-claude-fill' },
  { id: 'copilot', label: 'Copilot', class: 'ri-copilot-fill' },
  { id: 'openai', label: 'OpenAI', class: 'ri-openai-fill' },
  { id: 'perplexity', label: 'Perplexity', class: 'ri-perplexity-fill' },
  { id: 'deepseek', label: 'DeepSeek', class: 'ri-deepseek-fill' },
  { id: 'github', label: 'GitHub', class: 'ri-github-fill' },
  { id: 'youtube', label: 'YouTube', class: 'ri-youtube-fill' },
  { id: 'google', label: 'Google', class: 'ri-google-fill' },
  { id: 'code', label: 'Code', class: 'ri-code-s-slash-line' },
  { id: 'terminal', label: 'Terminal', class: 'ri-terminal-box-fill' },
  { id: 'global', label: 'Web', class: 'ri-global-line' },
  { id: 'book', label: 'Study', class: 'ri-book-open-line' },
  { id: 'music', label: 'Music', class: 'ri-music-fill' },
  { id: 'mail', label: 'Mail', class: 'ri-mail-fill' },
  { id: 'twitter', label: 'X / Twitter', class: 'ri-twitter-x-fill' },
  { id: 'discord', label: 'Discord', class: 'ri-discord-fill' },
  { id: 'reddit', label: 'Reddit', class: 'ri-reddit-fill' },
  { id: 'search', label: 'Search', class: 'ri-search-line' },
  { id: 'briefcase', label: 'Work', class: 'ri-briefcase-line' },
]

const makeId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now() + Math.random())

const getFaviconUrl = (urlStr) => {
  if (!urlStr) return ''
  try {
    let formatted = urlStr.trim()
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted
    }
    const parsed = new URL(formatted)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
  } catch {
    return ''
  }
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read_error'))
    reader.readAsDataURL(file)
  })

const Taskbar = ({
  shortcuts = DEFAULT_SHORTCUTS,
  onAddShortcut,
  onRemoveShortcut,
  onUpdateShortcut,
  onReorderShortcuts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  // Form state
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [iconClass, setIconClass] = useState('ri-global-line')
  const [iconUrl, setIconUrl] = useState('')
  const [iconDataUrl, setIconDataUrl] = useState('')
  const [iconType, setIconType] = useState('preset') // 'preset' | 'favicon' | 'upload' | 'url'
  const [errorMsg, setErrorMsg] = useState('')

  // Context Menu state
  const [contextMenu, setContextMenu] = useState(null)

  const openAddModal = () => {
    setEditingShortcut(null)
    setTitle('')
    setUrl('https://')
    setIconClass('ri-global-line')
    setIconUrl('')
    setIconDataUrl('')
    setIconType('preset')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (shortcut) => {
    setEditingShortcut(shortcut)
    setTitle(shortcut.title || '')
    setUrl(shortcut.url || 'https://')
    setIconClass(shortcut.iconClass || 'ri-global-line')
    setIconUrl(shortcut.iconUrl || '')
    setIconDataUrl(shortcut.iconDataUrl || '')
    if (shortcut.iconDataUrl) setIconType('upload')
    else if (shortcut.iconUrl) setIconType('url')
    else setIconType('preset')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingShortcut(null)
    setErrorMsg('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) {
      setErrorMsg('Image size should be under 512KB')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setIconDataUrl(dataUrl)
      setIconType('upload')
      setErrorMsg('')
    } catch {
      setErrorMsg('Failed to read image file')
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    let trimmedUrl = url.trim()

    if (!trimmedTitle) {
      setErrorMsg('Please enter a launcher title')
      return
    }

    if (!trimmedUrl || trimmedUrl === 'https://') {
      setErrorMsg('Please enter a valid URL')
      return
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl
    }

    let finalIconClass = iconClass
    let finalIconUrl = iconUrl
    let finalIconDataUrl = iconDataUrl

    if (iconType === 'preset') {
      finalIconUrl = ''
      finalIconDataUrl = ''
    } else if (iconType === 'favicon') {
      finalIconClass = ''
      finalIconUrl = getFaviconUrl(trimmedUrl)
      finalIconDataUrl = ''
    } else if (iconType === 'url') {
      finalIconClass = ''
      finalIconDataUrl = ''
    } else if (iconType === 'upload') {
      finalIconClass = ''
      finalIconUrl = ''
    }

    const payload = {
      id: editingShortcut ? editingShortcut.id : makeId(),
      title: trimmedTitle,
      url: trimmedUrl,
      iconClass: finalIconClass,
      iconUrl: finalIconUrl,
      iconDataUrl: finalIconDataUrl,
    }

    if (editingShortcut) {
      if (typeof onUpdateShortcut === 'function') {
        onUpdateShortcut(editingShortcut.id, payload)
      }
    } else {
      if (typeof onAddShortcut === 'function') {
        onAddShortcut(payload)
      }
    }

    handleCloseModal()
  }

  const handleContextMenu = (e, shortcut) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      shortcut,
    })
  }

  // Close context menu on window click
  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null)
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

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
            onContextMenu={(e) => handleContextMenu(e, s)}
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

      {/* Add Launcher Button (revealed when hovering over taskbar section) */}
      <button
        type='button'
        onClick={openAddModal}
        className='figma-glass-card h-[6.5vh] w-[6.5vh] min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 ease-out opacity-0 scale-75 pointer-events-none group-hover/taskbar:opacity-100 group-hover/taskbar:scale-100 group-hover/taskbar:pointer-events-auto shrink-0 hover:scale-105 active:scale-95'
        title='Add Quick Launcher'
      >
        <i className='ri-add-line text-[2.8vh] text-white relative z-10 transition-transform duration-300 hover:rotate-90' />
      </button>

      {/* Context Menu for Edit / Delete */}
      {contextMenu &&
        createPortal(
          <div
            className='fixed z-[9999] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 shadow-2xl text-white font-gilroy-medium text-xs flex flex-col gap-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-150'
            style={{ top: contextMenu.y + 4, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='px-3 py-1.5 font-gilroy-bold text-white/60 text-[10px] uppercase tracking-wider border-b border-white/10 truncate'>
              {contextMenu.shortcut.title}
            </div>
            <button
              type='button'
              onClick={() => {
                openEditModal(contextMenu.shortcut)
                setContextMenu(null)
              }}
              className='flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/15 text-left text-white/90 hover:text-white transition-all cursor-pointer'
            >
              <i className='ri-pencil-line text-sm text-[color:var(--theme)]' />
              <span>Edit Launcher</span>
            </button>
            <button
              type='button'
              onClick={() => {
                window.open(contextMenu.shortcut.url, '_blank', 'noopener,noreferrer')
                setContextMenu(null)
              }}
              className='flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/15 text-left text-white/90 hover:text-white transition-all cursor-pointer'
            >
              <i className='ri-external-link-line text-sm text-cyan-400' />
              <span>Open in New Tab</span>
            </button>
            {typeof onRemoveShortcut === 'function' && (
              <button
                type='button'
                onClick={() => {
                  onRemoveShortcut(contextMenu.shortcut.id)
                  setContextMenu(null)
                }}
                className='flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition-all cursor-pointer border-t border-white/10 mt-0.5'
              >
                <i className='ri-delete-bin-line text-sm' />
                <span>Remove Launcher</span>
              </button>
            )}
          </div>,
          document.body
        )}

      {/* Add / Edit Quick Launcher Modal */}
      {isModalOpen &&
        createPortal(
          <div className='fixed inset-0 z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200'>
            <div
              className='figma-glass-static rounded-3xl max-w-md w-full p-6 text-white border border-white/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className='flex items-center justify-between border-b border-white/10 pb-3.5'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-9 h-9 rounded-2xl bg-[color:var(--theme)]/20 border border-white/20 flex items-center justify-center text-[color:var(--theme)]'>
                    <i
                      className={`${
                        editingShortcut ? 'ri-pencil-fill' : 'ri-add-circle-fill'
                      } text-xl`}
                    />
                  </div>
                  <div>
                    <h3 className='font-gilroy-bold text-base text-white leading-tight'>
                      {editingShortcut ? 'Edit Quick Launcher' : 'Add Quick Launcher'}
                    </h3>
                    <p className='text-xs text-white/60 font-gilroy-medium'>
                      Add custom tools & bookmarks to top taskbar
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer'
                >
                  <i className='ri-close-line text-lg' />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className='flex flex-col gap-4'>
                {errorMsg && (
                  <div className='px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-gilroy-medium flex items-center gap-2'>
                    <i className='ri-error-warning-line text-sm shrink-0' />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Title */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-gilroy-medium text-white/80 flex items-center justify-between'>
                    <span>Title / Name</span>
                    <span className='text-[10px] text-white/40'>Required</span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. YouTube, GitHub, Notion'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[color:var(--theme)] transition-all font-gilroy-medium'
                    autoFocus
                  />
                </div>

                {/* URL */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-gilroy-medium text-white/80 flex items-center justify-between'>
                    <span>Web URL</span>
                    <span className='text-[10px] text-white/40'>Required</span>
                  </label>
                  <div className='relative flex items-center'>
                    <input
                      type='text'
                      placeholder='https://example.com'
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className='w-full bg-black/40 border border-white/15 rounded-xl pl-3.5 pr-20 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[color:var(--theme)] transition-all font-gilroy-medium'
                    />
                    {url && url !== 'https://' && (
                      <button
                        type='button'
                        onClick={() => {
                          const autoFavicon = getFaviconUrl(url)
                          if (autoFavicon) {
                            setIconUrl(autoFavicon)
                            setIconType('favicon')
                          }
                        }}
                        className='absolute right-2 text-[10px] bg-white/10 hover:bg-white/20 text-white/80 px-2 py-1 rounded-lg transition-all border border-white/10'
                        title='Auto fetch domain favicon'
                      >
                        Favicon
                      </button>
                    )}
                  </div>
                </div>

                {/* Icon Selection */}
                <div className='flex flex-col gap-2'>
                  <label className='text-xs font-gilroy-medium text-white/80'>Choose Icon</label>

                  {/* Icon Type Tabs */}
                  <div className='flex items-center gap-1.5 p-1 bg-black/30 rounded-xl border border-white/10 text-xs font-gilroy-medium'>
                    <button
                      type='button'
                      onClick={() => setIconType('preset')}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        iconType === 'preset'
                          ? 'bg-[color:var(--theme)] text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        const auto = getFaviconUrl(url)
                        if (auto) setIconUrl(auto)
                        setIconType('favicon')
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        iconType === 'favicon'
                          ? 'bg-[color:var(--theme)] text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Favicon
                    </button>
                    <button
                      type='button'
                      onClick={() => setIconType('upload')}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        iconType === 'upload'
                          ? 'bg-[color:var(--theme)] text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Upload Image
                    </button>
                  </div>

                  {/* Preset Grid */}
                  {iconType === 'preset' && (
                    <div className='grid grid-cols-5 gap-2 max-h-36 overflow-y-auto scrollbar-hide p-1 bg-black/20 rounded-xl border border-white/10'>
                      {PRESET_ICONS.map((ic) => (
                        <button
                          key={ic.id}
                          type='button'
                          onClick={() => setIconClass(ic.class)}
                          className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            iconClass === ic.class
                              ? 'bg-[color:var(--theme)]/30 border-[color:var(--theme)] text-white scale-105 shadow-md'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                          title={ic.label}
                        >
                          <i className={`${ic.class} text-lg`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Favicon Mode */}
                  {iconType === 'favicon' && (
                    <div className='flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/10'>
                      {getFaviconUrl(url) ? (
                        <>
                          <img
                            src={getFaviconUrl(url)}
                            alt='Favicon'
                            className='w-8 h-8 object-contain rounded-lg bg-white/10 p-1 border border-white/15'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span className='text-xs text-white/80 font-gilroy-medium truncate'>
                            Using favicon from {url || 'website'}
                          </span>
                        </>
                      ) : (
                        <span className='text-xs text-white/50 italic'>
                          Enter a valid URL above to auto-detect favicon
                        </span>
                      )}
                    </div>
                  )}

                  {/* Upload Image Mode */}
                  {iconType === 'upload' && (
                    <div className='flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/10'>
                      {iconDataUrl ? (
                        <div className='relative group'>
                          <img
                            src={iconDataUrl}
                            alt='Uploaded'
                            className='w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-white/20'
                          />
                          <button
                            type='button'
                            onClick={() => setIconDataUrl('')}
                            className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center'
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white cursor-pointer transition-all'>
                          <i className='ri-upload-cloud-line text-base' />
                          <span>Choose File (Max 512KB)</span>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileUpload}
                            className='hidden'
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-white/10'>
                  <button
                    type='button'
                    onClick={handleCloseModal}
                    className='px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-gilroy-medium text-xs transition-all cursor-pointer'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-5 py-2.5 rounded-xl bg-[color:var(--theme)] hover:brightness-110 text-white font-gilroy-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5'
                  >
                    <i className='ri-check-line text-sm' />
                    <span>{editingShortcut ? 'Save Changes' : 'Add Launcher'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default Taskbar