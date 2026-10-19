'use client'

import { useRef, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime, progressOf, type Channel, type Program } from '@/lib/tv-data'

type EpgGuideProps = {
  channel: Channel
  programs: Program[]
  now: number | null
  onExitLeft: () => void
  onExitUp: () => void
}

export function EpgGuide({ channel, programs, now, onExitLeft, onExitUp }: EpgGuideProps) {
  const [reminders, setReminders] = useState<Set<string>>(() => new Set())
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  function toggleReminder(id: string) {
    setReminders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      itemRefs.current[Math.min(programs.length - 1, index + 1)]?.focus()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (index === 0) onExitLeft()
      else itemRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      onExitUp()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  return (
    <section aria-labelledby="epg-heading" className="flex shrink-0 flex-col gap-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="epg-heading" className="font-display text-2xl font-black tracking-wide">
          TV GUIDE <span className="text-muted-foreground">· {channel.name.toUpperCase()}</span>
        </h2>
        <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground">
          {'◀ ▶ BROWSE · OK SET REMINDER'}
        </p>
      </div>

      <ul data-zone="epg" className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {programs.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-36 w-72 shrink-0 animate-pulse rounded-2xl bg-card" />
          ))}
        {programs.map((program, index) => {
          const isNow = index === 0
          const isNext = index === 1
          const reminded = reminders.has(program.id)
          return (
            <li key={program.id} className="shrink-0">
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                data-now={isNow}
                aria-label={`${program.title}, ${formatTime(program.start)} to ${formatTime(program.end)}${isNow ? ', on now' : reminded ? ', reminder set' : ''}`}
                onClick={() => !isNow && toggleReminder(program.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
                className={cn(
                  'flex h-36 w-72 flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all outline-none',
                  'focus-visible:scale-[1.03] focus-visible:border-primary',
                  isNow ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-card hover:bg-secondary',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold tabular-nums">
                    {formatTime(program.start)} – {formatTime(program.end)}
                  </span>
                  {isNow ? (
                    <span className="rounded-md bg-primary-foreground px-2 py-0.5 text-[11px] font-black tracking-wider text-primary">
                      ON NOW
                    </span>
                  ) : isNext ? (
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-black tracking-wider">
                      NEXT
                    </span>
                  ) : reminded ? (
                    <BellRing className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-[11px] font-black tracking-[0.2em]',
                      isNow ? 'text-primary-foreground/70' : program.kind === 'LIVE' ? 'text-live' : 'text-muted-foreground',
                    )}
                  >
                    {program.kind}
                  </p>
                  <p className="truncate font-display text-xl leading-tight font-black">{program.title}</p>
                  <p className={cn('truncate text-sm font-semibold', isNow ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {program.subtitle}
                  </p>
                </div>

                {isNow && now && (
                  <div className="h-1 overflow-hidden rounded-full bg-primary-foreground/20" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${progressOf(program, now)}%` }} />
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
