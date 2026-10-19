'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getFixture, getLeague, teamCode } from '@/lib/tv-data'

export type GoalAlert = {
  id: string
  fixtureId: string
  homeGoals: number
  awayGoals: number
  minute: string
  side: 'home' | 'away'
}

const TOAST_MS = 7000

export function GoalToasts({ alerts, onDismiss }: { alerts: GoalAlert[]; onDismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute top-[118px] right-10 z-50 flex w-[460px] flex-col gap-3"
    >
      {alerts.map((alert) => (
        <GoalToast key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function GoalToast({ alert, onDismiss }: { alert: GoalAlert; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), TOAST_MS)
    return () => clearTimeout(timer)
  }, [alert.id, onDismiss])

  const fixture = getFixture(alert.fixtureId)
  const league = getLeague(fixture.leagueId)
  const scorer = alert.side === 'home' ? fixture.home : fixture.away

  return (
    <div
      data-league={fixture.leagueId}
      className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-right-8 duration-500"
    >
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-0.5 bg-primary text-primary-foreground">
        <span className="font-display text-3xl font-black italic">GOAL</span>
        <span className="text-xs font-black tabular-nums">{alert.minute}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-5 py-4">
        <p className="text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">{league.fullName}</p>
        <p className="truncate font-display text-2xl leading-tight font-black">{scorer} score!</p>
        <p className="flex items-center gap-3 font-display text-xl font-black tabular-nums">
          <span className={cn(alert.side === 'home' && 'text-primary')}>{teamCode(fixture.home)}</span>
          <span>
            {alert.homeGoals} - {alert.awayGoals}
          </span>
          <span className={cn(alert.side === 'away' && 'text-primary')}>{teamCode(fixture.away)}</span>
        </p>
      </div>
    </div>
  )
}
