'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { formatTime, leagues, type LeagueId } from '@/lib/tv-data'

type TopBarProps = {
  activeLeague: LeagueId
  now: number | null
  onSelectLeague: (id: LeagueId) => void
  onExitDown: () => void
}

export function TopBar({ activeLeague, now, onSelectLeague, onExitDown }: TopBarProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const delta = event.key === 'ArrowRight' ? 1 : -1
      const next = Math.min(leagues.length - 1, Math.max(0, index + delta))
      onSelectLeague(leagues[next].id)
      tabRefs.current[next]?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      onExitDown()
    }
  }

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-10 pt-7 pb-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary">
          <span className="font-display text-2xl font-black leading-none text-primary-foreground">K</span>
        </div>
        <div className="leading-none">
          <p className="font-display text-2xl font-black tracking-wide">KICKOFF</p>
          <p className="text-[11px] font-bold tracking-[0.3em] text-muted-foreground">SPORTS TV</p>
        </div>
      </div>

      <nav aria-label="Leagues">
        <div
          role="tablist"
          data-zone="tabs"
          className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5"
        >
          {leagues.map((league, index) => {
            const selected = league.id === activeLeague
            return (
              <button
                key={league.id}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                role="tab"
                type="button"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelectLeague(league.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  'rounded-xl px-7 py-3 font-display text-xl font-extrabold tracking-wider transition-all outline-none',
                  'focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground focus-visible:text-foreground',
                )}
              >
                {league.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex items-center justify-end gap-4">
        <div className="text-right leading-tight">
          <p className="font-display text-3xl font-extrabold tabular-nums" suppressHydrationWarning>
            {now ? formatTime(now) : '--:--'}
          </p>
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase" suppressHydrationWarning>
            {now
              ? new Date(now).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
              : '\u00a0'}
          </p>
        </div>
      </div>
    </header>
  )
}
