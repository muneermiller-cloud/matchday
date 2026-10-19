'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { getFixtureScore, getLeague, teamCode, type Fixture } from '@/lib/tv-data'

type LiveRailProps = {
  fixtures: Fixture[]
  now: number | null
  playingFixtureId: string
  onOpen: (id: string) => void
  onExitUp: () => void
  onExitDown: () => void
}

export function LiveRail({ fixtures, now, playingFixtureId, onOpen, onExitUp, onExitDown }: LiveRailProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      itemRefs.current[Math.min(fixtures.length - 1, index + 1)]?.focus()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      itemRefs.current[Math.max(0, index - 1)]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      onExitUp()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      onExitDown()
    }
  }

  return (
    <section aria-labelledby="live-rail-heading" className="flex items-center gap-6 px-10 pb-4">
      <div className="flex w-28 shrink-0 flex-col leading-none">
        <span className="flex items-center gap-2 font-display text-2xl font-black text-live">
          <span className="size-2.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
          LIVE
        </span>
        <h2 id="live-rail-heading" className="font-display text-2xl font-black tracking-wide">
          NOW
        </h2>
        <span className="mt-1.5 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {fixtures.length} matches
        </span>
      </div>

      <ul data-zone="rail" className="flex min-w-0 flex-1 gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none]">
        {fixtures.map((fixture, index) => {
          const score = now ? getFixtureScore(fixture, now) : null
          const league = getLeague(fixture.leagueId)
          const active = fixture.id === playingFixtureId
          const minute = score?.label === 'PRE' ? 'KO' : score?.label
          return (
            <li key={fixture.id} data-league={fixture.leagueId} className="shrink-0">
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                data-active={active}
                aria-current={active ? 'true' : undefined}
                aria-label={`${league.fullName}: ${fixture.home} ${score?.homeGoals ?? 0}, ${fixture.away} ${score?.awayGoals ?? 0}, ${minute ?? ''}`}
                onClick={() => onOpen(fixture.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
                className={cn(
                  'flex w-[290px] items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-all outline-none',
                  'hover:bg-secondary focus-visible:scale-[1.04] focus-visible:border-primary focus-visible:bg-secondary',
                  'focus-visible:shadow-[0_0_36px_-10px_var(--primary)]',
                  active ? 'border-primary/40 bg-secondary' : 'border-transparent bg-card',
                )}
              >
                <span className="h-12 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-center justify-between gap-2 text-[11px] font-black tracking-[0.2em]">
                    <span className="truncate text-primary">{league.label}</span>
                    <span className="shrink-0 tabular-nums text-live">{minute}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2 font-display text-2xl font-black">
                    <span>{teamCode(fixture.home)}</span>
                    <span className="rounded-md bg-foreground px-2.5 text-xl tabular-nums text-background">
                      {score?.homeGoals ?? 0} - {score?.awayGoals ?? 0}
                    </span>
                    <span>{teamCode(fixture.away)}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
