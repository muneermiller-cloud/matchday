'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  channels as allChannels,
  fixtureStatus,
  formatTime,
  getFixtureScore,
  getMatchStats,
  progressOf,
  teamCode,
  type Channel,
  type Fixture,
  type League,
  type Program,
} from '@/lib/tv-data'

type FullscreenPlayerProps = {
  fixture: Fixture
  channel: Channel
  league: League
  program: Program | null
  now: number | null
  onSwitch: (channelId: string) => void
  onClose: () => void
}

type Panel = 'none' | 'channels' | 'stats'

const HIDE_MS = 4000
const backKeys = new Set(['Escape', 'Backspace', 'GoBack', 'BrowserBack'])

export function FullscreenPlayer({ fixture, channel, league, program, now, onSwitch, onClose }: FullscreenPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [activity, setActivity] = useState(0)
  const [panel, setPanel] = useState<Panel>('none')
  const [cursor, setCursor] = useState(0)
  const [paused, setPaused] = useState(false)

  const broadcasts = fixture.broadcasts.map((b) => ({
    ...b,
    channel: allChannels.find((c) => c.id === b.channelId)!,
  }))
  const currentIndex = Math.max(0, broadcasts.findIndex((b) => b.channel.id === channel.id))
  const currentFeed = broadcasts[currentIndex]?.feed

  const status = now ? fixtureStatus(fixture, now) : null
  const score = now ? getFixtureScore(fixture, now) : null
  const minute = score ? (score.label === 'FT' ? 90 : Number.parseInt(score.label) || 0) : 0
  const stats = getMatchStats(fixture, minute)
  const progress = program && now ? progressOf(program, now) : 0

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  useEffect(() => {
    if (panel !== 'none' || paused) return
    const timer = setTimeout(() => setChromeVisible(false), HIDE_MS)
    return () => clearTimeout(timer)
  }, [activity, panel, paused])

  function wake() {
    setChromeVisible(true)
    setActivity((n) => n + 1)
  }

  function switchTo(index: number) {
    onSwitch(broadcasts[index].channel.id)
    setPanel('none')
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    wake()
    const { key } = event

    if (panel === 'channels') {
      if (key === 'ArrowUp') setCursor((c) => Math.max(0, c - 1))
      else if (key === 'ArrowDown') setCursor((c) => Math.min(broadcasts.length - 1, c + 1))
      else if (key === 'Enter') switchTo(cursor)
      else if (key === 'ArrowLeft' || key === 'ArrowRight' || backKeys.has(key)) setPanel('none')
      else return
      event.preventDefault()
      return
    }

    if (panel === 'stats') {
      if (key === 'ArrowLeft' || key === 'ArrowRight' || backKeys.has(key)) {
        event.preventDefault()
        setPanel('none')
      }
      return
    }

    if (key === 'ArrowLeft') {
      setCursor(currentIndex)
      setPanel('channels')
    } else if (key === 'ArrowRight') {
      setPanel('stats')
    } else if (key === 'Enter' || key === ' ' || key === 'MediaPlayPause') {
      setPaused((p) => !p)
    } else if (backKeys.has(key)) {
      onClose()
    } else if (key !== 'ArrowUp' && key !== 'ArrowDown') {
      return
    }
    event.preventDefault()
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Full screen: ${channel.name}`}
      tabIndex={-1}
      data-league={league.id}
      onKeyDown={handleKeyDown}
      onPointerMove={wake}
      className={cn(
        'absolute inset-0 z-40 overflow-hidden bg-black outline-none animate-in fade-in zoom-in-[1.02] duration-300',
        !chromeVisible && 'cursor-none',
      )}
    >
      <Image
        key={channel.id}
        src={league.feedImage || '/placeholder.svg'}
        alt={`Live feed of ${program?.title ?? channel.name}`}
        fill
        priority
        sizes="100vw"
        className={cn('object-cover animate-in fade-in duration-500', paused && 'brightness-50 grayscale-[60%]')}
        style={{ objectPosition: `${30 + channel.seed * 8}% center` }}
      />

      {paused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-32 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-14 fill-current" aria-hidden="true" />
            <span className="sr-only">Paused</span>
          </span>
        </div>
      )}

      <div
        className={cn(
          'absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/85 to-transparent px-24 pt-14 pb-28 transition-all duration-500',
          chromeVisible ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0',
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-black text-primary-foreground">
            {channel.short}
          </span>
          <div className="leading-tight">
            <p className="font-display text-4xl font-black text-white">{channel.name}</p>
            <p className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
              CH {channel.number} · {currentFeed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === 'LIVE' && (
            <span className="flex items-center gap-2 rounded-lg bg-live px-4 py-2 font-black tracking-wider text-white">
              <span className="size-2.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
              LIVE
            </span>
          )}
          <span className="rounded-lg bg-black/60 px-4 py-2 font-black tracking-wider text-white backdrop-blur">
            {channel.quality}
          </span>
          <span className="ml-3 font-display text-4xl font-extrabold tabular-nums text-white">
            {now ? formatTime(now) : '--:--'}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-6 bg-gradient-to-t from-black via-black/80 to-transparent px-24 pt-40 pb-16 transition-all duration-500',
          chromeVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        <div className="flex items-end justify-between gap-12">
          <div className="min-w-0">
            <p className="text-base font-black tracking-[0.3em] text-primary">{program?.kind}</p>
            <p className="font-display text-7xl leading-none font-black text-balance text-white">{program?.title}</p>
            <p className="mt-2 text-2xl font-semibold text-white/75">{program?.subtitle}</p>
          </div>

          <div className="flex shrink-0 items-stretch overflow-hidden rounded-2xl font-display text-4xl font-black text-white shadow-2xl">
            <span className="bg-black/80 px-6 py-3 backdrop-blur">{teamCode(fixture.home)}</span>
            <span className="bg-white px-6 py-3 tabular-nums text-black">
              {score ? `${score.homeGoals} - ${score.awayGoals}` : 'VS'}
            </span>
            <span className="bg-black/80 px-6 py-3 backdrop-blur">{teamCode(fixture.away)}</span>
            <span className="bg-primary px-5 py-3 tabular-nums text-primary-foreground">
              {score ? (score.label === 'PRE' ? 'KO' : score.label) : now ? formatTime(now) : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="font-display text-2xl font-bold tabular-nums text-white">
            {program ? formatTime(program.start) : '--:--'}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-white">
            {program ? formatTime(program.end) : '--:--'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Hint keyLabel="◀">Channels ({broadcasts.length})</Hint>
          <Hint keyLabel="▶">Match stats</Hint>
          <Hint keyLabel="OK">{paused ? 'Play' : 'Pause'}</Hint>
          <Hint keyLabel="CH ±">Zap</Hint>
          <Hint keyLabel="BACK">Exit full screen</Hint>
        </div>
      </div>

      <aside
        aria-label="Channels showing this match"
        aria-hidden={panel !== 'channels'}
        className={cn(
          'absolute inset-y-0 left-0 z-10 flex w-[560px] flex-col gap-6 border-r border-white/10 bg-black/85 px-14 py-16 backdrop-blur-xl transition-transform duration-300 ease-out',
          panel === 'channels' ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div>
          <p className="text-sm font-black tracking-[0.3em] text-primary">SWITCH CHANNEL</p>
          <p className="font-display text-4xl font-black text-white">
            {fixture.home} <span className="text-white/40">vs</span> {fixture.away}
          </p>
        </div>
        <ul role="listbox" aria-label="Channels" className="flex flex-col gap-3">
          {broadcasts.map(({ channel: c, feed }, index) => {
            const focused = index === cursor
            const playing = c.id === channel.id
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={focused}
                onClick={() => switchTo(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-5 rounded-2xl border-2 px-5 py-4 transition-all',
                  focused ? 'scale-[1.03] border-primary bg-white/10' : 'border-transparent bg-white/5',
                )}
              >
                <span
                  className={cn(
                    'flex size-16 shrink-0 items-center justify-center rounded-xl font-display text-xl font-black',
                    playing ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white',
                  )}
                >
                  {c.short}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-2xl font-extrabold text-white">{c.name}</span>
                  <span className="truncate text-base font-semibold text-white/60">
                    CH {c.number} · {feed} · {c.quality}
                  </span>
                </span>
                {playing && <span className="text-xs font-black tracking-[0.2em] text-primary">PLAYING</span>}
              </li>
            )
          })}
        </ul>
        <p className="mt-auto text-sm font-black tracking-[0.2em] text-white/40">{'▲▼ BROWSE · OK SWITCH · ◀ CLOSE'}</p>
      </aside>

      <aside
        aria-label="Match stats"
        aria-hidden={panel !== 'stats'}
        className={cn(
          'absolute inset-y-0 right-0 z-10 flex w-[560px] flex-col gap-8 border-l border-white/10 bg-black/85 px-14 py-16 backdrop-blur-xl transition-transform duration-300 ease-out',
          panel === 'stats' ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div>
          <p className="text-sm font-black tracking-[0.3em] text-primary">MATCH STATS</p>
          <div className="mt-3 flex items-center justify-between font-display text-4xl font-black text-white">
            <span>{teamCode(fixture.home)}</span>
            <span className="tabular-nums">{score ? `${score.homeGoals} - ${score.awayGoals}` : 'VS'}</span>
            <span>{teamCode(fixture.away)}</span>
          </div>
          <p className="mt-1 text-center text-sm font-bold tracking-[0.2em] text-white/50 uppercase">
            {status === 'LIVE' ? `${minute}' played` : status === 'FT' ? 'Full time' : 'Not started'} · {fixture.venue}
          </p>
        </div>

        <ul className="flex flex-col gap-7">
          {stats.map((row) => {
            const total = row.home + row.away || 1
            const homeLeads = row.home >= row.away
            return (
              <li key={row.label} className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between font-display text-white">
                  <span className={cn('text-3xl font-black tabular-nums', !homeLeads && 'text-white/60')}>
                    {row.home}
                    {row.unit}
                  </span>
                  <span className="text-sm font-black tracking-[0.2em] text-white/60 uppercase">{row.label}</span>
                  <span className={cn('text-3xl font-black tabular-nums', homeLeads && 'text-white/60')}>
                    {row.away}
                    {row.unit}
                  </span>
                </div>
                <div className="flex h-2.5 gap-1.5" aria-hidden="true">
                  <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn('h-full rounded-full', homeLeads ? 'bg-primary' : 'bg-white/50')}
                      style={{ width: `${(row.home / total) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn('h-full rounded-full', homeLeads ? 'bg-white/50' : 'bg-primary')}
                      style={{ width: `${(row.away / total) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-auto text-sm font-black tracking-[0.2em] text-white/40">{'▶ CLOSE'}</p>
      </aside>
    </div>
  )
}

function Hint({ keyLabel, children }: { keyLabel: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2.5 rounded-xl bg-white/10 py-1.5 pr-4 pl-1.5 text-base font-bold text-white/85 backdrop-blur">
      <span className="rounded-lg bg-white px-2.5 py-0.5 font-display text-sm font-black text-black">{keyLabel}</span>
      {children}
    </span>
  )
}
