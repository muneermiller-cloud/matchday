'use client'

import { forwardRef, useState } from 'react'
import Image from 'next/image'
import { Pause, Play, Volume2, VolumeX, Maximize, Captions } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatTime,
  getLiveScore,
  progressOf,
  teamCode,
  type Channel,
  type League,
  type Program,
} from '@/lib/tv-data'

type MediaPlayerProps = {
  channel: Channel
  league: League
  program: Program | null
  now: number | null
  onExitLeft: () => void
  onExitDown: () => void
  onExitUp: () => void
}

export const MediaPlayer = forwardRef<HTMLDivElement, MediaPlayerProps>(function MediaPlayer(
  { channel, league, program, now, onExitLeft, onExitDown, onExitUp },
  ref,
) {
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [captions, setCaptions] = useState(false)

  const isLive = program?.kind === 'LIVE'
  const score = isLive && program && now ? getLiveScore(program, now) : null
  const progress = program && now ? progressOf(program, now) : 0

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        onExitLeft()
        break
      case 'ArrowDown':
        event.preventDefault()
        onExitDown()
        break
      case 'ArrowUp':
        event.preventDefault()
        onExitUp()
        break
      case 'Enter':
      case ' ':
      case 'MediaPlayPause':
        event.preventDefault()
        setPaused((p) => !p)
        break
      case 'm':
        setMuted((m) => !m)
        break
    }
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={`Player: ${channel.name}`}
      tabIndex={0}
      data-zone="player"
      onKeyDown={handleKeyDown}
      className="group relative min-h-0 flex-1 overflow-hidden rounded-3xl border-2 border-border bg-black outline-none transition-colors focus-visible:border-primary"
    >
      <Image
        key={channel.id}
        src={league.feedImage || '/placeholder.svg'}
        alt={`Live feed of ${program?.title ?? channel.name}`}
        fill
        priority
        sizes="(min-width: 1280px) 70vw, 100vw"
        className={cn(
          'animate-in fade-in object-cover duration-500',
          paused && 'grayscale-[60%] brightness-50',
        )}
        style={{ objectPosition: `${30 + channel.seed * 8}% center` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/50" aria-hidden="true" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
            {channel.short}
          </span>
          <div className="leading-tight">
            <p className="font-display text-2xl font-black text-white">{channel.name}</p>
            <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
              CH {channel.number} · {league.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-lg bg-live px-3 py-1.5 text-sm font-black tracking-wider text-white">
              <span className="size-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
              LIVE
            </span>
          )}
          <span className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-black tracking-wider text-white backdrop-blur">
            {channel.quality}
          </span>
        </div>
      </div>

      {score && program?.home && program.away && (
        <div className="absolute top-24 left-6 flex items-stretch overflow-hidden rounded-lg font-display text-xl font-black text-white shadow-lg">
          <span className="bg-black/80 px-3 py-1.5 backdrop-blur">{teamCode(program.home)}</span>
          <span className="bg-white px-3 py-1.5 tabular-nums text-black">
            {score.homeGoals} - {score.awayGoals}
          </span>
          <span className="bg-black/80 px-3 py-1.5 backdrop-blur">{teamCode(program.away)}</span>
          <span className="bg-primary px-3 py-1.5 tabular-nums text-primary-foreground">{score.label}</span>
        </div>
      )}

      {paused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-10 fill-current" aria-hidden="true" />
            <span className="sr-only">Paused</span>
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6">
        <div>
          <p className="text-sm font-black tracking-[0.25em] text-primary">{program?.kind ?? ''}</p>
          <p className="font-display text-5xl leading-none font-black text-balance text-white">
            {program?.title ?? '\u00a0'}
          </p>
          <p className="mt-1 text-lg font-semibold text-white/75">{program?.subtitle ?? '\u00a0'}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-display text-lg font-bold tabular-nums text-white">
            {program ? formatTime(program.start) : '--:--'}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-display text-lg font-bold tabular-nums text-white">
            {program ? formatTime(program.end) : '--:--'}
          </span>

          <div className="ml-2 flex items-center gap-1">
            <ControlButton label={paused ? 'Play' : 'Pause'} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
            </ControlButton>
            <ControlButton label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </ControlButton>
            <ControlButton label="Subtitles" active={captions} onClick={() => setCaptions((c) => !c)}>
              <Captions className="size-5" />
            </ControlButton>
            <ControlButton
              label="Fullscreen"
              onClick={(e) => e.currentTarget.closest<HTMLElement>('[data-zone="player"]')?.requestFullscreen?.()}
            >
              <Maximize className="size-5" />
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  )
})

function ControlButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20',
        active && 'bg-white/20 text-primary',
      )}
    >
      {children}
    </button>
  )
}
