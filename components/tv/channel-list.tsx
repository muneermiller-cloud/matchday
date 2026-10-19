'use client'

import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  channels as allChannels,
  fixtureStatus,
  getFixtureScore,
  teamCode,
  type Fixture,
} from '@/lib/tv-data'

type ChannelListProps = {
  fixture: Fixture
  playingId: string
  now: number | null
  onSelect: (id: string) => void
  onBack: () => void
  onExitUp: () => void
  onExitRight: () => void
}

const backKeys = new Set(['ArrowLeft', 'Escape', 'Backspace', 'GoBack', 'BrowserBack'])

export function ChannelList({ fixture, playingId, now, onSelect, onBack, onExitUp, onExitRight }: ChannelListProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const backRef = useRef<HTMLButtonElement>(null)
  const status = now ? fixtureStatus(fixture, now) : null
  const score = now ? getFixtureScore(fixture, now) : null
  const broadcasts = fixture.broadcasts.map((b) => ({
    ...b,
    channel: allChannels.find((c) => c.id === b.channelId)!,
  }))

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      itemRefs.current[Math.min(broadcasts.length - 1, index + 1)]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (index === 0) backRef.current?.focus()
      else itemRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onExitRight()
    } else if (backKeys.has(event.key)) {
      event.preventDefault()
      onBack()
    }
  }

  function handleBackKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      itemRefs.current[0]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      onExitUp()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onExitRight()
    } else if (backKeys.has(event.key)) {
      event.preventDefault()
      onBack()
    }
  }

  return (
    <section
      aria-labelledby="channels-heading"
      className="flex min-h-0 flex-col rounded-3xl border border-border bg-card animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="flex flex-col gap-4 px-6 pt-5 pb-4">
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          onKeyDown={handleBackKeyDown}
          className="flex w-fit items-center gap-2 rounded-lg px-2 py-1 -ml-2 text-xs font-black tracking-[0.2em] text-muted-foreground uppercase outline-none transition-colors hover:text-foreground focus-visible:bg-primary focus-visible:text-primary-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Fixtures
        </button>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/60 px-4 py-3">
          <TeamBadge team={fixture.home} />
          <div className="flex flex-col items-center">
            <span className="font-display text-3xl font-black tabular-nums">
              {score ? `${score.homeGoals} - ${score.awayGoals}` : 'VS'}
            </span>
            <span
              className={cn(
                'text-[11px] font-black tracking-wider',
                status === 'LIVE' ? 'text-live' : 'text-muted-foreground',
              )}
            >
              {status === 'LIVE' ? `LIVE ${score?.label !== 'PRE' ? score?.label : ''}` : status === 'FT' ? 'FULL TIME' : 'UPCOMING'}
            </span>
          </div>
          <TeamBadge team={fixture.away} />
        </div>

        <div className="flex items-end justify-between">
          <h2 id="channels-heading" className="font-display text-3xl font-black tracking-wide">
            CHANNELS
          </h2>
          <p className="font-display text-lg font-bold text-muted-foreground">{broadcasts.length}</p>
        </div>
      </div>

      <ul data-zone="channels" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 [scrollbar-width:none]">
        {broadcasts.map(({ channel, feed }, index) => {
          const playing = channel.id === playingId
          return (
            <li key={channel.id}>
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                data-playing={playing}
                aria-current={playing ? 'true' : undefined}
                onClick={() => onSelect(channel.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest' })}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-2xl border-2 px-3 py-3 text-left transition-all outline-none',
                  'focus-visible:scale-[1.02] focus-visible:border-primary focus-visible:bg-secondary',
                  'hover:bg-secondary',
                  playing ? 'border-transparent bg-secondary' : 'border-transparent',
                )}
              >
                <span className="w-9 shrink-0 text-center font-display text-lg font-bold tabular-nums text-muted-foreground">
                  {channel.number}
                </span>
                <span
                  className={cn(
                    'flex size-14 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black tracking-wide',
                    playing ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground',
                  )}
                >
                  {channel.short}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-xl font-extrabold">{channel.name}</span>
                    <span className="shrink-0 rounded border border-border px-1.5 text-[10px] font-black tracking-wider text-muted-foreground">
                      {channel.quality}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {status === 'LIVE' && (
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-black tracking-wider text-live">
                        <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
                        LIVE
                      </span>
                    )}
                    <span className="truncate">{feed}</span>
                  </span>
                </span>
                {playing && (
                  <span className="flex h-5 shrink-0 items-end gap-0.5" aria-label="Now playing">
                    <span className="eq-bar w-1 rounded-sm bg-primary" />
                    <span className="eq-bar w-1 rounded-sm bg-primary [animation-delay:-0.3s]" />
                    <span className="eq-bar w-1 rounded-sm bg-primary [animation-delay:-0.6s]" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function TeamBadge({ team }: { team: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted font-display text-sm font-black tracking-wide">
        {teamCode(team)}
      </span>
      <span className="w-full truncate text-center text-sm font-extrabold">{team}</span>
    </div>
  )
}
