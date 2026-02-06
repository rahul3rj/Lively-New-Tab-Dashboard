import React, { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE = {
  items: 'todo_items_v1',
}

const chromeApi = typeof globalThis !== 'undefined' ? globalThis.chrome : undefined

const hasChromeStorage =
  !!chromeApi?.runtime?.id &&
  !!chromeApi?.storage?.local &&
  typeof chromeApi.storage.local.get === 'function' &&
  typeof chromeApi.storage.local.set === 'function'

const storageGet = (key) => {
  if (!hasChromeStorage) return Promise.resolve(undefined)

  return new Promise((resolve) => {
    chromeApi.storage.local.get([key], (result) => {
      if (chromeApi.runtime?.lastError) {
        resolve(undefined)
        return
      }
      resolve(result?.[key])
    })
  })
}

const storageSet = (key, value) => {
  if (!hasChromeStorage) return Promise.resolve()

  return new Promise((resolve) => {
    chromeApi.storage.local.set({ [key]: value }, () => {
      resolve()
    })
  })
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return String(Date.now() + Math.random())
}

const Todo = () => {
  const [tasks, setTasks] = useState([])
  const [newText, setNewText] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  const editInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const raw = await storageGet(STORAGE.items)
      if (cancelled) return

      try {
        const parsed = JSON.parse(String(raw ?? '[]'))
        setTasks(Array.isArray(parsed) ? parsed : [])
      } catch {
        setTasks([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    storageSet(STORAGE.items, JSON.stringify(tasks))
  }, [tasks])

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const ap = a?.pinned ? 1 : 0
      const bp = b?.pinned ? 1 : 0
      if (bp !== ap) return bp - ap
      return (a?.createdAt ?? 0) - (b?.createdAt ?? 0)
    })
  }, [tasks])

  const addTask = () => {
    const text = newText.trim()
    if (!text) return

    const task = {
      id: makeId(),
      text,
      done: false,
      pinned: false,
      createdAt: Date.now(),
    }

    setTasks((prev) => [task, ...prev])
    setNewText('')
  }

  const toggleDone = (id) => {
    if (editingId) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const togglePinned = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)))
  }

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditingText('')
    }
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditingText(task.text)
    queueMicrotask(() => editInputRef.current?.focus())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const commitEdit = () => {
    const next = editingText.trim()
    if (!editingId) return

    if (!next) {
      removeTask(editingId)
      return
    }

    setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, text: next } : t)))
    cancelEdit()
  }

  return (
    <div className='w-full max-w-[520px] mx-auto rounded-3xl bg-[color:var(--theme)]/36 backdrop-blur-md  shadow-2xl px-6 py-5 text-white font-poppins'>
      <h1 className='text-start text-base font-semibold text-white'>To Do List</h1>

      <div className='mt-4 w-full h-9 rounded-full bg-[color:var(--theme)]/36 flex items-center overflow-hidden border border-black/30'>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask()
          }}
          className='h-full w-full px-5 text-white/70 placeholder:text-white/40 outline-none bg-transparent'
          placeholder='Add task...'
        />
        <button
          type='button'
          onClick={addTask}
          className='h-9 w-10 rounded-full bg-black/55 hover:bg-black/65 transition-all duration-200 flex items-center justify-center cursor-pointer'
          aria-label='Add task'
        >
          <i className='ri-add-line text-2xl text-white'></i>
        </button>
      </div>

      <div className='mt-4 flex flex-col gap-3 h-[calc(50vh-250px)] overflow-auto scrollbar-hide '>
        {sortedTasks.map((task) => {
          const isEditing = editingId === task.id

          return (
            <div
              key={task.id}
              className='w-full rounded-2xl bg-black/45 backdrop-blur-md px-4 py-3 flex items-center gap-4'
            >
              <button
                type='button'
                onClick={() => toggleDone(task.id)}
                className='h-4 w-4 rounded-full border-2 border-white/90 flex items-center justify-center shrink-0 cursor-pointer'
                aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
              >
                <span
                  className={task.done ? 'h-4 w-4 rounded-full bg-white/95' : 'h-4 w-4 rounded-full'}
                  aria-hidden='true'
                />
              </button>

              <div className='flex-1 min-w-0'>
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className={`w-full bg-transparent outline-none text-sm font-semibold ${
                      task.done ? 'text-zinc-500 line-through' : 'text-white'
                    }`}
                  />
                ) : (
                  <button
                    type='button'
                    onClick={() => toggleDone(task.id)}
                    className={`w-full text-left text-sm font-semibold truncate ${
                      task.done ? 'text-zinc-500 line-through' : 'text-white'
                    }`}
                    title={task.text}
                  >
                    {task.text}
                  </button>
                )}
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => startEdit(task)}
                  className='h-6 w-6 rounded-full bg-white/10 hover:bg-white/15 transition-all duration-200 flex items-center justify-center cursor-pointer'
                  aria-label='Edit task'
                >
                  <i className='ri-pencil-line text-md text-white'></i>
                </button>

                <button
                  type='button'
                  onClick={() => togglePinned(task.id)}
                  className='h-6 w-6 rounded-full bg-white/10 hover:bg-white/15 transition-all duration-200 flex items-center justify-center cursor-pointer'
                  aria-label={task.pinned ? 'Unpin task' : 'Pin task'}
                >
                  <i className={`${task.pinned ? 'ri-pushpin-2-fill' : 'ri-pushpin-2-line'} text-md text-white`}></i>
                </button>

                <button
                  type='button'
                  onClick={() => removeTask(task.id)}
                  className='h-6 w-6 rounded-full bg-white/10 hover:bg-white/15 transition-all duration-200 flex items-center justify-center cursor-pointer'
                  aria-label='Delete task'
                >
                  <i className='ri-close-line text-md text-white'></i>
                </button>
              </div>
            </div>
          )
        })}

        {sortedTasks.length === 0 && (
          <div className='w-full text-center text-sm text-white/80 py-6'>No tasks yet</div>
        )}
      </div>
    </div>
  )
}

export default Todo