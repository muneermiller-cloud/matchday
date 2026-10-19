'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNow } from '@/hooks/use-now'
import { useIdle } from '@/hooks/use-idle'
import {
  allFixtures,
  channels,
  getFixture,
  getFixtureSchedule,
  getFixtureScore,
  getFixturesByLeague,
  getLeague,
  getLiveFixtures,
  type LeagueId,
} from '@/lib/tv-data'
import { TopBar } from './top-bar'
import { LiveRail } from './live-rail'
import { FixtureList } from './fixture-list'
import { ChannelList } from './channel-list'
import { MediaPlayer } from './media-player'
import { EpgGuide } from './epg-guide'
import { FullscreenPlayer } from './fullscreen-player'
import { GoalToasts, type GoalAlert } from './goal-toasts'
import { Screensaver } from './screensaver'
import { TvStage } from './tv-stage'

type Zone = 'tabs' | 'rail' | 'fixtures' | 'channels' | 'player' | 'epg'
type View = 'fixtures' | 'channels'

const IDLE_MS = 3 * 60 * 1000

const zoneSelectors: Record<Zone, string> = {
  tabs: '[data-zone="tabs"] [aria-selected="true"]',
  rail: '[data-zone="rail"] [data-active="true"], [data-zone="rail"] li:first-child button',
  fixtures: '[data-zone="fixtures"] [data-active="true"], [data-zone="fixtures"] li:first-child button',
  channels: '[data-zone="channels"] [data-playing="true"], [data-zone="channels"] li:first-child button',
  player: '[data-zone="player"]',
  epg: '[data-zone="epg"] [data-now="true"]',
}

function focusZone(zone: Zone) {
  requestAnimationFrame(() => document.querySelector<HTMLElement>(zoneSelectors[zone])?.focus())
}

const initialFixture = getFixture('pl-fx-0')

export function TvApp() {
  const now = useNow()
  const [leagueId, setLeagueId] = useState<LeagueId>('pl')
  const [view, setView] = useState<View>('fixtures')
  const [openFixtureId, setOpenFixtureId] = useState(initialFixture.id)
  const [playingFixtureId, setPlayingFixtureId] = useState(initialFixture.id)
  const [playingId, setPlayingId] = useState(initialFixture.broadcasts[0].channelId)
  const [fullscreen, setFullscreen] = useState(false)
  const [alerts, setAlerts] = useState<GoalAlert[]>([])
  const playerRef = useRef<HTMLDivElement>(null)
  const lastScores = useRef<Map<string, { homeGoals: number; awayGoals: number }> | null>(null)
  const idle = useIdle(IDLE_MS, !fullscreen)

  const league = getLeague(leagueId)
  const leagueFixtures = useMemo(() => getFixturesByLeague(leagueId, now), [leagueId, now])
  const liveFixtures = useMemo(() => getLiveFixtures(now), [now])
  const openFixture = getFixture(openFixtureId)
  const playingFixture = getFixture(playingFixtureId)
  const playing = channels.find((c) => c.id === playingId) ?? channels[0]
  const playingLeague = getLeague(playing.leagueId)
  const schedule = useMemo(
    () => (now ? getFixtureSchedule(playingFixture, playing, now) : []),
    [playingFixture, playing, now],
  )

  const leftZone: Zone = view === 'fixtures' ? 'fixtures' : 'channels'
  const hasRail = liveFixtures.length > 0
  const aboveLeft: Zone = hasRail ? 'rail' : 'tabs'

  const selectLeague = useCallback((id: LeagueId) => {
    setLeagueId(id)
    setView('fixtures')
  }, [])

  const openFixtureChannels = useCallback((id: string) => {
    const fixture = getFixture(id)
    setLeagueId(fixture.leagueId)
    setOpenFixtureId(id)
    setPlayingFixtureId(id)
    setPlayingId(fixture.broadcasts[0].channelId)
    setView('channels')
    focusZone('channels')
  }, [])

  const backToFixtures = useCallback(() => {
    setView('fixtures')
    focusZone('fixtures')
  }, [])

  const playChannel = useCallback(
    (id: string) => {
      setPlayingFixtureId(openFixtureId)
      setPlayingId(id)
    },
    [openFixtureId],
  )

  const zapChannel = useCallback(
    (delta: number) => {
      const list = playingFixture.broadcasts
      const index = list.findIndex((b) => b.channelId === playingId)
      const next = (index + delta + list.length) % list.length
      setPlayingId(list[next].channelId)
    },
    [playingFixture, playingId],
  )

  const closeFullscreen = useCallback(() => {
    setFullscreen(false)
    requestAnimationFrame(() => playerRef.current?.focus())
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((list) => list.filter((a) => a.id !== id))
  }, [])

  useEffect(() => {
    focusZone('fixtures')
  }, [])

  useEffect(() => {
    if (!now) return
    const next = new Map<string, { homeGoals: number; awayGoals: number }>()
    const fresh: GoalAlert[] = []
    for (const fixture of allFixtures) {
      const score = getFixtureScore(fixture, now)
      if (!score) continue
      next.set(fixture.id, score)
      const prev = lastScores.current?.get(fixture.id)
      if (prev && (score.homeGoals > prev.homeGoals || score.awayGoals > prev.awayGoals)) {
        fresh.push({
          id: `${fixture.id}-${score.homeGoals}-${score.awayGoals}`,
          fixtureId: fixture.id,
          homeGoals: score.homeGoals,
          awayGoals: score.awayGoals,
          minute: score.label,
          side: score.homeGoals > prev.homeGoals ? 'home' : 'away',
        })
      }
    }
    lastScores.current = next
    if (fresh.length > 0) setAlerts((list) => [...list, ...fresh].slice(-3))
  }, [now])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'PageUp' || event.key === 'ChannelUp') {
        event.preventDefault()
        zapChannel(-1)
      } else if (event.key === 'PageDown' || event.key === 'ChannelDown') {
        event.preventDefault()
        zapChannel(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zapChannel])

  return (
    <TvStage>
      <div data-league={leagueId} className="league-glow relative flex h-full flex-col overflow-hidden bg-background">
        <div inert={fullscreen} className="flex min-h-0 flex-1 flex-col">
          <TopBar
            activeLeague={leagueId}
            now={now}
            onSelectLeague={selectLeague}
            onExitDown={() => focusZone(hasRail ? 'rail' : leftZone)}
          />

          {hasRail && (
            <LiveRail
              fixtures={liveFixtures}
              now={now}
              playingFixtureId={playingFixtureId}
              onOpen={openFixtureChannels}
              onExitUp={() => focusZone('tabs')}
              onExitDown={() => focusZone(leftZone)}
            />
          )}

          <main className="grid min-h-0 flex-1 grid-cols-[minmax(360px,30%)_1fr] gap-6 px-10 pb-8">
            {view === 'fixtures' ? (
              <FixtureList
                key={leagueId}
                league={league}
                fixtures={leagueFixtures}
                playingFixtureId={playingFixtureId}
                now={now}
                onOpen={openFixtureChannels}
                onExitUp={() => focusZone(aboveLeft)}
                onExitRight={() => playerRef.current?.focus()}
              />
            ) : (
              <ChannelList
                key={openFixture.id}
                fixture={openFixture}
                playingId={playingFixtureId === openFixture.id ? playing.id : ''}
                now={now}
                onSelect={playChannel}
                onBack={backToFixtures}
                onExitUp={() => focusZone(aboveLeft)}
                onExitRight={() => playerRef.current?.focus()}
              />
            )}

            <div className="flex min-h-0 min-w-0 flex-col gap-5">
              <MediaPlayer
                ref={playerRef}
                channel={playing}
                league={playingLeague}
                program={schedule[0] ?? null}
                now={now}
                onExitLeft={() => focusZone(leftZone)}
                onExitDown={() => focusZone('epg')}
                onExitUp={() => focusZone(aboveLeft)}
                onEnterFullscreen={() => setFullscreen(true)}
              />
              <EpgGuide
                key={playing.id}
                channel={playing}
                programs={schedule}
                now={now}
                onExitLeft={() => focusZone(leftZone)}
                onExitUp={() => playerRef.current?.focus()}
              />
            </div>
          </main>
        </div>

        {fullscreen && (
          <FullscreenPlayer
            fixture={playingFixture}
            channel={playing}
            league={playingLeague}
            program={schedule[0] ?? null}
            now={now}
            onSwitch={setPlayingId}
            onClose={closeFullscreen}
          />
        )}

        <GoalToasts alerts={alerts} onDismiss={dismissAlert} />

        {idle && <Screensaver now={now} fixtures={liveFixtures} />}
      </div>
    </TvStage>
  )
}
