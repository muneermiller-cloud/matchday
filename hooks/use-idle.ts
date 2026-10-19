'use client'

import { useEffect, useRef, useState } from 'react'

const activityEvents = ['keydown', 'pointerdown', 'pointermove', 'wheel'] as const

export function useIdle(timeoutMs: number, enabled: boolean) {
  const [idle, setIdle] = useState(false)
  const idleRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    function goIdle() {
      idleRef.current = true
      setIdle(true)
    }

    let timer = setTimeout(goIdle, timeoutMs)

    function onActivity(event: Event) {
      if (idleRef.current) {
        idleRef.current = false
        setIdle(false)
        // The key that wakes the screen shouldn't also navigate the UI behind it.
        if (event.type === 'keydown') {
          event.preventDefault()
          event.stopPropagation()
        }
      }
      clearTimeout(timer)
      timer = setTimeout(goIdle, timeoutMs)
    }

    activityEvents.forEach((type) => window.addEventListener(type, onActivity, true))
    return () => {
      clearTimeout(timer)
      activityEvents.forEach((type) => window.removeEventListener(type, onActivity, true))
      idleRef.current = false
      setIdle(false)
    }
  }, [timeoutMs, enabled])

  return idle && enabled
}
