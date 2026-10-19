'use client'

import { useSyncExternalStore } from 'react'

const TICK_MS = 15_000

function subscribe(callback: () => void) {
  const id = setInterval(callback, TICK_MS)
  return () => clearInterval(id)
}

function getSnapshot() {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS
}

function getServerSnapshot() {
  return null
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
