import React, { useEffect, useMemo, useState } from 'react'

const Clock = () => {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    []
  )

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())

    tick()
    const id = setInterval(tick, 1000)

    return () => clearInterval(id)
  }, [])

  return (
    <div className='h-[30vh] w-full flex flex-col items-center justify-center bg-[color:var(--theme)]/36 backdrop-blur-md rounded-2xl relative select-none'>
      <h1 className='text-[15vh] font-koulen bg-gradient-to-r from-[#999999] via-white to-[#999999] bg-clip-text text-transparent select-none mb-5'>
        {formatter.format(now)}
      </h1>
      <h1 className='absolute bottom-8 text-white text-base select-none font-poppins'>{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(now)}</h1>
    </div>
  )
}

export default Clock