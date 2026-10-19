'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNow } from '@/hooks/use-now'
import {
  channels,
  getFixture,
  getFixtureSchedule,
  getFixturesByLeague,
  getLeague,
  type LeagueId,
} from '@/lib/tv-data'
import { TopBar } from './top-bar'
import { FixtureList } from './fixture-list'
import { ChannelList } from './channel-list'
import { MediaPlayer } from './media-player'
import { EpgGuide } from './epg-guide'
import { TvStage } from './tv-stage'

type Zone = 'tabs' | 'fixtures' | 'channels' | 'player' | 'epg'
type View = 'fixtures' | 'channels'

const zoneSelectors: Record<Zone, string> = {
  tabs: '[data-zone="tabs"] [aria-selected="true"]',
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
  const playerRef = useRef<HTMLDivElement>(null)

  const league = getLeague(leagueId)
  const leagueFixtures = useMemo(() => getFixturesByLeague(leagueId, now), [leagueId, now])
  const openFixture = getFixture(openFixtureId)
  const playingFixture = getFixture(playingFixtureId)
  const playing = channels.find((c) => c.id === playingId) ?? channels[0]
  const playingLeague = getLeague(playing.leagueId)
  const schedule = useMemo(
    () => (now ? getFixtureSchedule(playingFixture, playing, now) : []),
    [playingFixture, playing, now],
  )

  const leftZone: Zone = view === 'fixtures' ? 'fixtures' : 'channels'

  const selectLeague = useCallback((id: LeagueId) => {
    setLeagueId(id)
    setView('fixtures')
  }, [])

  const openFixtureChannels = useCallback((id: string) => {
    const fixture = getFixture(id)
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

  useEffect(() => {
    focusZone('fixtures')
  }, [])

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
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <TopBar
        activeLeague={leagueId}
        now={now}
        onSelectLeague={selectLeague}
        onExitDown={() => focusZone(leftZone)}
      />

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(360px,30%)_1fr] gap-6 px-10 pb-8">
        {view === 'fixtures' ? (
          <FixtureList
            key={leagueId}
            league={league}
            fixtures={leagueFixtures}
            playingFixtureId={playingFixtureId}
            now={now}
            onOpen={openFixtureChannels}
            onExitUp={() => focusZone('tabs')}
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
            onExitUp={() => focusZone('tabs')}
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
            onExitUp={() => focusZone('tabs')}
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
    </TvStage>
  )
}
