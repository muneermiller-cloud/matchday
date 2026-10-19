'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNow } from '@/hooks/use-now'
import { channels, getChannelsByLeague, getLeague, getSchedule, type LeagueId } from '@/lib/tv-data'
import { TopBar } from './top-bar'
import { ChannelList } from './channel-list'
import { MediaPlayer } from './media-player'
import { EpgGuide } from './epg-guide'

type Zone = 'tabs' | 'channels' | 'player' | 'epg'

const zoneSelectors: Record<Zone, string> = {
  tabs: '[data-zone="tabs"] [aria-selected="true"]',
  channels: '[data-zone="channels"] [data-playing="true"]',
  player: '[data-zone="player"]',
  epg: '[data-zone="epg"] [data-now="true"]',
}

function focusZone(zone: Zone) {
  document.querySelector<HTMLElement>(zoneSelectors[zone])?.focus()
}

export function TvApp() {
  const now = useNow()
  const [leagueId, setLeagueId] = useState<LeagueId>('pl')
  const [playingId, setPlayingId] = useState(() => getChannelsByLeague('pl')[0].id)
  const playerRef = useRef<HTMLDivElement>(null)

  const league = getLeague(leagueId)
  const leagueChannels = useMemo(() => getChannelsByLeague(leagueId), [leagueId])
  const playing = channels.find((c) => c.id === playingId) ?? leagueChannels[0]
  const schedule = useMemo(() => (now ? getSchedule(playing, now) : []), [playing, now])

  const selectLeague = useCallback((id: LeagueId) => {
    setLeagueId(id)
    setPlayingId(getChannelsByLeague(id)[0].id)
  }, [])

  const zapChannel = useCallback(
    (delta: number) => {
      const index = leagueChannels.findIndex((c) => c.id === playingId)
      const next = (index + delta + leagueChannels.length) % leagueChannels.length
      setPlayingId(leagueChannels[next].id)
    },
    [leagueChannels, playingId],
  )

  useEffect(() => {
    focusZone('channels')
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
    <div className="flex h-dvh min-h-[600px] flex-col overflow-hidden bg-background">
      <TopBar
        activeLeague={leagueId}
        now={now}
        onSelectLeague={selectLeague}
        onExitDown={() => focusZone('channels')}
      />

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(340px,30%)_1fr] gap-6 px-10 pb-8">
        <ChannelList
          league={league}
          channels={leagueChannels}
          playingId={playing.id}
          now={now}
          onSelect={setPlayingId}
          onExitUp={() => focusZone('tabs')}
          onExitRight={() => playerRef.current?.focus()}
        />

        <div className="flex min-h-0 min-w-0 flex-col gap-5">
          <MediaPlayer
            ref={playerRef}
            channel={playing}
            league={league}
            program={schedule[0] ?? null}
            now={now}
            onExitLeft={() => focusZone('channels')}
            onExitDown={() => focusZone('epg')}
            onExitUp={() => focusZone('tabs')}
          />
          <EpgGuide
            key={playing.id}
            channel={playing}
            programs={schedule}
            now={now}
            onExitLeft={() => focusZone('channels')}
            onExitUp={() => playerRef.current?.focus()}
          />
        </div>
      </main>
    </div>
  )
}
