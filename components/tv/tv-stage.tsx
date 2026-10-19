'use client'

import { useEffect, useState, type ReactNode } from 'react'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

export function TvStage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function fit() {
      setScale(Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        className="flex-none"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
