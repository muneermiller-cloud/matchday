'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { getSchedule, progressOf, type Channel, type League } from '@/lib/tv-data'

type ChannelListProps = {
  league: League
  channels: Channel[]
  playingId: string
  now: number | null
  onSelect: (id: string) => void
  onExitUp: () => void
  onExitRight: () => void
}

export function ChannelList({
  league,
  channels,
  playingId,
  now,
  onSelect,
  onExitUp,
  onExitRight,
}: ChannelListProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      itemRefs.current[Math.min(channels.length - 1, index + 1)]?.focus()
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
    <section aria-labelledby="channels-heading" className="flex min-h-0 flex-col rounded-3xl border border-border bg-card">
      <div className="flex items-end justify-between px-6 pt-5 pb-4">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">{league.fullName}</p>
          <h2 id="channels-heading" className="font-display text-3xl font-black tracking-wide">
            CHANNELS
          </h2>
        </div>
        <p className="font-display text-lg font-bold text-muted-foreground">{channels.length}</p>
      </div>

      <ul data-zone="channels" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 [scrollbar-width:none]">
        {channels.map((channel, index) => {
          const playing = channel.id === playingId
          const current = now ? getSchedule(channel, now, 1)[0] : null
          const isLive = current?.kind === 'LIVE'
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
                    {isLive && (
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-black tracking-wider text-live">
                        <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
                        LIVE
                      </span>
                    )}
                    <span className="truncate">{current?.title ?? '\u00a0'}</span>
                  </span>
                  <span className="h-1 w-full overflow-hidden rounded-full bg-background" aria-hidden="true">
                    <span
                      className={cn('block h-full rounded-full', playing ? 'bg-primary' : 'bg-muted-foreground/60')}
                      style={{ width: `${current && now ? progressOf(current, now) : 0}%` }}
                    />
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
