'use client'

import { cn } from '@/lib/utils'
import { formatTime, getFixtureScore, getLeague, teamCode, type Fixture } from '@/lib/tv-data'

// The content block hops between corners every minute so nothing stays lit in one spot on OLED panels.
const corners = ['items-start justify-start', 'items-start justify-end', 'items-end justify-end', 'items-end justify-start']

export function Screensaver({ now, fixtures }: { now: number | null; fixtures: Fixture[] }) {
  const slot = now ? Math.floor(now / 60_000) % corners.length : 0

  return (
    <div
      role="status"
      aria-label="Screensaver. Press any button to continue."
      className={cn('absolute inset-0 z-[60] flex bg-black p-32 animate-in fade-in duration-1000', corners[slot])}
    >
      <div key={slot} className="flex flex-col gap-8 animate-in fade-in duration-1000">
        <div>
          <p className="font-display text-[150px] leading-none font-black tabular-nums text-white/85">
            {now ? formatTime(now) : '--:--'}
          </p>
          <p className="mt-2 text-lg font-bold tracking-[0.3em] text-white/45 uppercase">
            {now ? new Date(now).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
          </p>
        </div>

        {fixtures.length > 0 && (
          <ul className="flex flex-col gap-3">
            {fixtures.slice(0, 4).map((fixture) => {
              const score = now ? getFixtureScore(fixture, now) : null
              return (
                <li
                  key={fixture.id}
                  data-league={fixture.leagueId}
                  className="flex items-center gap-4 font-display text-3xl font-black text-white/75"
                >
                  <span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />
                  <span className="w-36 text-sm font-black tracking-[0.2em] text-primary/80">
                    {getLeague(fixture.leagueId).label}
                  </span>
                  <span className="w-16">{teamCode(fixture.home)}</span>
                  <span className="tabular-nums">
                    {score?.homeGoals ?? 0} - {score?.awayGoals ?? 0}
                  </span>
                  <span className="w-16">{teamCode(fixture.away)}</span>
                  <span className="text-xl tabular-nums text-white/40">{score?.label === 'PRE' ? 'KO' : score?.label}</span>
                </li>
              )
            })}
          </ul>
        )}

        <p className="text-sm font-black tracking-[0.3em] text-white/30">PRESS ANY BUTTON TO CONTINUE</p>
      </div>
    </div>
  )
}
