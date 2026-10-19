'use client'

import { useRef } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fixtureStatus,
  formatTime,
  getFixtureScore,
  kickoffOf,
  teamCode,
  type Fixture,
  type League,
} from '@/lib/tv-data'

type FixtureListProps = {
  league: League
  fixtures: Fixture[]
  playingFixtureId: string
  now: number | null
  onOpen: (id: string) => void
  onExitUp: () => void
  onExitRight: () => void
}

export function FixtureList({
  league,
  fixtures,
  playingFixtureId,
  now,
  onOpen,
  onExitUp,
  onExitRight,
}: FixtureListProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const liveCount = now ? fixtures.filter((f) => fixtureStatus(f, now) === 'LIVE').length : 0

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      itemRefs.current[Math.min(fixtures.length - 1, index + 1)]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (index === 0) onExitUp()
      else itemRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onExitRight()
    }
  }

  return (
    <section
      aria-labelledby="fixtures-heading"
      className="flex min-h-0 flex-col rounded-3xl border border-border bg-card animate-in fade-in slide-in-from-left-4 duration-300"
    >
      <div className="flex items-end justify-between px-6 pt-5 pb-4">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            {league.fullName} · {fixtures[0]?.round}
          </p>
          <h2 id="fixtures-heading" className="font-display text-3xl font-black tracking-wide">
            FIXTURES
          </h2>
        </div>
        {liveCount > 0 && (
          <p className="flex items-center gap-1.5 rounded-lg bg-live/15 px-2.5 py-1 text-xs font-black tracking-wider text-live">
            <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
            {liveCount} LIVE
          </p>
        )}
      </div>

      <ul
        data-zone="fixtures"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 [scrollbar-width:none]"
      >
        {fixtures.map((fixture, index) => {
          const active = fixture.id === playingFixtureId
          const status = now ? fixtureStatus(fixture, now) : null
          const score = now ? getFixtureScore(fixture, now) : null
          return (
            <li key={fixture.id}>
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                data-active={active}
                aria-current={active ? 'true' : undefined}
                aria-label={`${fixture.home} versus ${fixture.away}, ${status ?? ''}, ${fixture.broadcasts.length} channels`}
                onClick={() => onOpen(fixture.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest' })}
                className={cn(
                  'group flex w-full flex-col gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all outline-none',
                  'hover:bg-secondary focus-visible:scale-[1.02] focus-visible:border-primary focus-visible:bg-secondary',
                  active ? 'border-transparent bg-secondary' : 'border-transparent bg-background/40',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={status} label={score?.label} kickoff={now ? kickoffOf(fixture, now) : null} />
                  <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {fixture.broadcasts.length} channels
                    <ChevronRight
                      className="size-4 transition-transform group-focus-visible:translate-x-0.5 group-focus-visible:text-primary"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <TeamRow team={fixture.home} goals={score?.homeGoals} highlight={active} />
                  <TeamRow team={fixture.away} goals={score?.awayGoals} highlight={active} />
                </div>

                <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  {fixture.venue}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function StatusPill({
  status,
  label,
  kickoff,
}: {
  status: ReturnType<typeof fixtureStatus> | null
  label?: string
  kickoff: number | null
}) {
  if (status === 'LIVE') {
    return (
      <span className="flex items-center gap-1.5 rounded-md bg-live px-2 py-0.5 text-xs font-black tracking-wider text-white">
        <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
        LIVE {label && label !== 'PRE' ? label : ''}
      </span>
    )
  }
  if (status === 'FT') {
    return (
      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-black tracking-wider text-muted-foreground">
        FULL TIME
      </span>
    )
  }
  return (
    <span className="rounded-md border border-border px-2 py-0.5 font-display text-sm font-bold tabular-nums text-foreground">
      {kickoff ? formatTime(kickoff) : '--:--'}
    </span>
  )
}

function TeamRow({ team, goals, highlight }: { team: string; goals?: number; highlight: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-black tracking-wide',
          highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}
        aria-hidden="true"
      >
        {teamCode(team)}
      </span>
      <span className="flex-1 truncate font-display text-xl font-extrabold">{team}</span>
      <span className="w-6 text-right font-display text-2xl font-black tabular-nums">{goals ?? ''}</span>
    </div>
  )
}
