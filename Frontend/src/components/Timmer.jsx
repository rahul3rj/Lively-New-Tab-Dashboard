import React, { useEffect, useMemo, useRef, useState } from 'react'

const pad2 = (n) => String(n).padStart(2, '0')

const formatMmSs = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${pad2(minutes)}:${pad2(seconds)}`
}

const parseDurationToSeconds = (raw) => {
  const value = String(raw ?? '').trim()
  if (!value) return null

  if (value.includes(':')) {
    const [mStr, sStr] = value.split(':')
    const minutes = Number.parseInt(mStr, 10)
    const seconds = Number.parseInt(sStr, 10)
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
    if (minutes < 0 || seconds < 0 || seconds > 59) return null
    return minutes * 60 + seconds
  }

  const minutes = Number.parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes < 0) return null
  return minutes * 60
}

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

const STORAGE = {
  date: 'pomodoro_today_date_v1',
  totalSec: 'pomodoro_today_total_sec_v1',
  durationSec: 'pomodoro_duration_sec_v1',
}

const chromeApi = typeof globalThis !== 'undefined' ? globalThis.chrome : undefined

const isExtensionPage =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.location?.protocol === 'string' &&
  globalThis.location.protocol === 'chrome-extension:'

const hasChromeStorage =
  isExtensionPage &&
  !!chromeApi?.storage?.local &&
  typeof chromeApi.storage.local.get === 'function' &&
  typeof chromeApi.storage.local.set === 'function'

const storageGet = (key) => {
  if (hasChromeStorage) {
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

  const raw = localStorage.getItem(key)
  return Promise.resolve(raw === null ? undefined : raw)
}

const storageSet = (key, value) => {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chromeApi.storage.local.set({ [key]: value }, () => resolve())
    })
  }

  localStorage.setItem(key, String(value))
  return Promise.resolve()
}

const Timmer = () => {
  const [status, setStatus] = useState('idle')
  const [durationSec, setDurationSec] = useState(25 * 60)
  const [remainingSec, setRemainingSec] = useState(25 * 60)
  const [todayTotalSec, setTodayTotalSec] = useState(0)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const endTimeRef = useRef(null)
  const lastAccountedMsRef = useRef(null)
  const todayTotalSecRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const storedDurationRaw = await storageGet(STORAGE.durationSec)
        const storedDuration = Number(storedDurationRaw)
        if (!cancelled && Number.isFinite(storedDuration) && storedDuration > 0) {
          setDurationSec(storedDuration)
          setRemainingSec(storedDuration)
        }

        const storedDate = String((await storageGet(STORAGE.date)) ?? '')
        const tKey = todayKey()

        if (storedDate === tKey) {
          const storedTotalRaw = await storageGet(STORAGE.totalSec)
          const storedTotal = Number(storedTotalRaw)
          const safeTotal = Number.isFinite(storedTotal) && storedTotal >= 0 ? storedTotal : 0
          if (!cancelled) {
            todayTotalSecRef.current = safeTotal
            setTodayTotalSec(safeTotal)
          }
        } else {
          await storageSet(STORAGE.date, tKey)
          await storageSet(STORAGE.totalSec, 0)
          if (!cancelled) {
            todayTotalSecRef.current = 0
            setTodayTotalSec(0)
          }
        }
      } catch {
        if (!cancelled) {
          todayTotalSecRef.current = 0
          setTodayTotalSec(0)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    storageSet(STORAGE.durationSec, durationSec)
  }, [durationSec])

  const setAndPersistTodayTotal = (nextTotalSec) => {
    const safe = Math.max(0, Math.floor(nextTotalSec))
    todayTotalSecRef.current = safe
    setTodayTotalSec(safe)
    storageSet(STORAGE.date, todayKey())
    storageSet(STORAGE.totalSec, safe)
  }

  const addToTodayTotal = (secondsToAdd) => {
    const add = Math.max(0, Math.floor(secondsToAdd))
    if (add <= 0) return
    setAndPersistTodayTotal(todayTotalSecRef.current + add)
  }

  const flushElapsed = () => {
    if (status !== 'running') {
      lastAccountedMsRef.current = null
      return
    }

    const now = Date.now()
    const last = lastAccountedMsRef.current ?? now
    const deltaSec = Math.max(0, Math.floor((now - last) / 1000))

    if (deltaSec > 0) addToTodayTotal(deltaSec)

    const remainderMs = (now - last) % 1000
    lastAccountedMsRef.current = now - remainderMs
  }

  const tick = () => {
    flushElapsed()

    if (!endTimeRef.current) return
    const msLeft = endTimeRef.current - Date.now()
    const nextRemaining = Math.max(0, Math.ceil(msLeft / 1000))
    setRemainingSec(nextRemaining)

    if (nextRemaining <= 0) {
      endTimeRef.current = null
      lastAccountedMsRef.current = null
      setStatus('idle')
      setRemainingSec(durationSec)
    }
  }

  useEffect(() => {
    if (status !== 'running') return

    const id = window.setInterval(tick, 250)
    tick()

    return () => window.clearInterval(id)
  }, [status, durationSec])

  const remainingRatio = useMemo(() => {
    if (durationSec <= 0) return 0
    return Math.max(0, Math.min(1, remainingSec / durationSec))
  }, [durationSec, remainingSec])

  const canEdit = status !== 'running'

  const beginEdit = () => {
    if (!canEdit) return
    setIsEditing(true)
    setEditValue(formatMmSs(durationSec))
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const commitEdit = () => {
    if (!canEdit) return

    const parsed = parseDurationToSeconds(editValue)
    if (parsed === null || parsed <= 0) {
      cancelEdit()
      return
    }

    setDurationSec(parsed)
    setRemainingSec(parsed)
    endTimeRef.current = null
    lastAccountedMsRef.current = null
    setStatus('idle')
    cancelEdit()
  }

  const handleStop = () => {
    flushElapsed()
    endTimeRef.current = null
    lastAccountedMsRef.current = null
    setStatus('idle')
    setRemainingSec(durationSec)
    cancelEdit()
  }

  const handleTogglePlayPause = () => {
    cancelEdit()

    if (status === 'running') {
      tick()
      flushElapsed()
      endTimeRef.current = null
      lastAccountedMsRef.current = null
      setStatus('paused')
      return
    }

    const startFrom = remainingSec > 0 ? remainingSec : durationSec
    setRemainingSec(startFrom)
    endTimeRef.current = Date.now() + startFrom * 1000
    lastAccountedMsRef.current = Date.now()
    setStatus('running')
  }

  const handleReset = () => {
    cancelEdit()

    flushElapsed()

    endTimeRef.current = null
    lastAccountedMsRef.current = null
    setStatus('idle')
    setRemainingSec(durationSec)
  }

  const todayMins = Math.floor(todayTotalSec / 60)

  return (
    <div className='w-full max-w-[720px] mx-auto rounded-3xl bg-[color:var(--theme)]/36 backdrop-blur-md px-8 py-6 text-white font-poppins'>
      <div className='w-full flex items-center justify-between'>
        <h1 className='text-base font-semibold'>Focus</h1>
        <h2 className='text-sm font-semibold'>Today {todayMins} mins</h2>
      </div>

      <div className='w-full flex flex-col items-center justify-center'>
        <div className='relative w-[420px] max-w-full'>
          <svg viewBox='0 0 200 120' className='w-full h-auto'>
            <path
              d='M 20 100 A 80 80 0 0 1 180 100'
              fill='none'
              stroke='rgba(75,75,75,0.85)'
              strokeWidth='18'
              strokeLinecap='round'
            />
            <path
              d='M 20 100 A 80 80 0 0 1 180 100'
              fill='none'
              stroke='rgba(255,255,255,0.85)'
              strokeWidth='18'
              strokeLinecap='round'
              pathLength='100'
              strokeDasharray={`${remainingRatio * 100} 100`}
            />
          </svg>

          <div className='absolute top-10 inset-0 flex items-center justify-center'>
            {isEditing ? (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') cancelEdit()
                }}
                autoFocus
                inputMode='numeric'
                className='w-[180px] bg-transparent text-center text-5xl font-semibold tracking-wide outline-none'
              />
            ) : (
              <button
                type='button'
                onClick={beginEdit}
                className='select-none text-5xl font-semibold tracking-wide cursor-pointer'
              >
                {formatMmSs(remainingSec)}
              </button>
            )}
          </div>
        </div>

        <div className='flex items-center justify-center gap-10'>
          <button
            type='button'
            onClick={handleStop}
            className='h-14 w-14 rounded-full bg-[#4C4C4C]/30 backdrop-blur-md flex items-center justify-center hover:bg-[#4C4C4C] transition-all duration-200 cursor-pointer'
            aria-label='Stop'
          >
            <i className='ri-close-line text-2xl text-white'></i>
          </button>

          <button
            type='button'
            onClick={handleTogglePlayPause}
            className='h-14 w-14 rounded-full bg-[#4C4C4C]/30 backdrop-blur-md flex items-center justify-center hover:bg-[#4C4C4C] transition-all duration-200 cursor-pointer'
            aria-label={status === 'running' ? 'Pause' : 'Play'}
          >
            <i
              className={`${status === 'running' ? 'ri-pause-fill' : 'ri-play-fill'} text-2xl text-white`}
            ></i>
          </button>

          <button
            type='button'
            onClick={handleReset}
            className='h-14 w-14 rounded-full bg-[#4C4C4C]/30 backdrop-blur-md flex items-center justify-center hover:bg-[#4C4C4C] transition-all duration-200 cursor-pointer'
            aria-label='Reset'
          >
            <i className='ri-refresh-line text-2xl text-white'></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Timmer