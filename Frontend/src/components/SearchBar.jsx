import React, { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE = {
  engineId: 'search_engine_id_v1',
  username: 'search_username_v1',
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
    chromeApi.storage.local.set({ [key]: value }, () => resolve())
  })
}

const ENGINES = [
  {
    id: 'google',
    label: 'Google',
    iconType: 'img',
    iconValue: 'https://img.icons8.com/?size=100&id=85834&format=png&color=FFFFFF',
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'bing',
    label: 'Bing',
    iconType: 'img',
    iconValue: 'https://img.icons8.com/?size=100&id=20330&format=png&color=FFFFFF',
    buildUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'duck',
    label: 'Duck',
    iconType: 'img',
    iconValue: 'https://img.icons8.com/?size=100&id=20328&format=png&color=FFFFFF',
    buildUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'brave',
    label: 'Brave',
    iconType: 'img',
    iconValue: 'https://img.icons8.com/?size=100&id=ze7acUqja_dP&format=png&color=FFFFFF',
    buildUrl: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  },
]

const SearchBar = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [engineId, setEngineId] = useState('google')
  const [query, setQuery] = useState('')
  const [username, setUsername] = useState('')

  const dropdownRef = useRef(null)

  const engine = useMemo(() => ENGINES.find((e) => e.id === engineId) || ENGINES[0], [engineId])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const storedEngineId = await storageGet(STORAGE.engineId)
      const storedUsername = await storageGet(STORAGE.username)

      if (cancelled) return

      if (typeof storedEngineId === 'string' && ENGINES.some((e) => e.id === storedEngineId)) {
        setEngineId(storedEngineId)
      }

      if (typeof storedUsername === 'string') setUsername(storedUsername)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    storageSet(STORAGE.engineId, engineId)
  }, [engineId])

  useEffect(() => {
    const id = window.setTimeout(() => {
      storageSet(STORAGE.username, username)
    }, 250)

    return () => window.clearTimeout(id)
  }, [username])

  useEffect(() => {
    if (!showDropdown) return

    const onPointerDown = (e) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target)) setShowDropdown(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [showDropdown])

  const selectEngine = (id) => {
    setEngineId(id)
    setShowDropdown(false)
  }

  const runSearch = () => {
    const q = query.trim()
    if (!q) return

    setShowDropdown(false)
    window.location.assign(engine.buildUrl(q))
  }

  return (
    <div className='h-auto w-full bg-[color:var(--theme)]/36 backdrop-blur-md rounded-2xl flex flex-col items-center justify-start relative py-4 px-4 gap-2 font-poppins'>
      <div className='h-12 w-full rounded-full focus:outline-none bg-[color:var(--theme)]/36 relative'>
        <div ref={dropdownRef} className='absolute top-1/2 left-2 -translate-y-1/2'>
          <button
            type='button'
            className='h-9 w-9 rounded-full bg-[color:var(--theme)] hover:bg-[#4C4C4C] transition-all duration-200 flex items-center justify-center cursor-pointer'
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label='Select search engine'
          >
            {engine.iconType === 'img' ? (
              <img src={engine.iconValue} alt={engine.label} className='h-5 w-5 object-contain' />
            ) : (
              <i className={`${engine.iconValue} text-xl text-white`}></i>
            )}
          </button>

          {showDropdown && (
            <div className='absolute w-[10vw] min-w-[160px] top-full mt-2 left-0 bg-[color:var(--theme)] rounded-lg shadow-lg p-2 z-10'>
              {ENGINES.map((e) => (
                <button
                  key={e.id}
                  type='button'
                  onClick={() => selectEngine(e.id)}
                  className='w-full flex items-center gap-2 text-white px-3 py-2 hover:bg-[#4C4C4C] cursor-pointer text-base rounded text-left'
                >
                  {e.iconType === 'img' ? (
                    <img src={e.iconValue} alt={e.label} className='h-5 w-5 object-contain' />
                  ) : (
                    <i className={e.iconValue}></i>
                  )}
                  <span>{e.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch()
          }}
          className='h-full w-full px-15 rounded-full focus:outline-none text-base text-white bg-transparent'
          placeholder='Type here...'
        />

        <button
          type='button'
          onClick={runSearch}
          className='absolute top-1/2 right-2 h-9 w-30 rounded-full bg-[color:var(--theme)] hover:bg-[#4C4C4C] transition-all duration-200 transform -translate-y-1/2 flex items-center justify-center cursor-pointer'
          aria-label='Search'
        >
          <h1 className='text-white text-base'>Search</h1>
        </button>
      </div>

      <div className='h-12 w-full flex items-center justify-start gap-2 ml-5'>
        <h1 className='text-white text-base'>Welcome</h1>
        <input
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='focus:outline-none text-base text-white bg-transparent'
          placeholder='who?'
        />
      </div>
    </div>
  )
}

export default SearchBar