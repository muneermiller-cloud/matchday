export type LeagueId = 'pl' | 'laliga' | 'ucl'

export type League = {
  id: LeagueId
  label: string
  fullName: string
  feedImage: string
}

export type Channel = {
  id: string
  number: number
  name: string
  short: string
  leagueId: LeagueId
  quality: '4K' | 'FHD' | 'HD'
  seed: number
}

export type ProgramKind = 'LIVE' | 'REPLAY' | 'ANALYSIS' | 'HIGHLIGHTS'

export type Program = {
  id: string
  kind: ProgramKind
  title: string
  subtitle: string
  start: number
  end: number
  home?: string
  away?: string
}

export const leagues: League[] = [
  { id: 'pl', label: 'PL', fullName: 'Premier League', feedImage: '/images/feed-pl.png' },
  { id: 'laliga', label: 'LA LIGA', fullName: 'La Liga', feedImage: '/images/feed-laliga.png' },
  {
    id: 'ucl',
    label: 'CHAMPIONS LEAGUE',
    fullName: 'Champions League',
    feedImage: '/images/feed-ucl.png',
  },
]

export const channels: Channel[] = [
  { id: 'pl-1', number: 101, name: 'PL Main Event', short: 'PL1', leagueId: 'pl', quality: '4K', seed: 0 },
  { id: 'pl-2', number: 102, name: 'PL Matchday', short: 'PL2', leagueId: 'pl', quality: 'FHD', seed: 3 },
  { id: 'pl-3', number: 103, name: 'PL Arena', short: 'PL3', leagueId: 'pl', quality: 'FHD', seed: 5 },
  { id: 'pl-4', number: 104, name: 'PL Ultra 4K', short: 'UHD', leagueId: 'pl', quality: '4K', seed: 2 },
  { id: 'pl-5', number: 105, name: 'PL Highlights', short: 'PLH', leagueId: 'pl', quality: 'HD', seed: 6 },
  { id: 'pl-6', number: 106, name: 'PL Classics', short: 'PLC', leagueId: 'pl', quality: 'HD', seed: 1 },
  { id: 'pl-7', number: 107, name: 'PL Studio', short: 'PLS', leagueId: 'pl', quality: 'FHD', seed: 7 },
  { id: 'll-1', number: 201, name: 'LaLiga Uno', short: 'LL1', leagueId: 'laliga', quality: '4K', seed: 1 },
  { id: 'll-2', number: 202, name: 'LaLiga Dos', short: 'LL2', leagueId: 'laliga', quality: 'FHD', seed: 4 },
  { id: 'll-3', number: 203, name: 'LaLiga Clásico', short: 'CLS', leagueId: 'laliga', quality: 'FHD', seed: 6 },
  { id: 'll-4', number: 204, name: 'LaLiga Ultra 4K', short: 'UHD', leagueId: 'laliga', quality: '4K', seed: 0 },
  { id: 'll-5', number: 205, name: 'LaLiga Goles', short: 'GOL', leagueId: 'laliga', quality: 'HD', seed: 3 },
  { id: 'll-6', number: 206, name: 'LaLiga Hypermotion', short: 'HYP', leagueId: 'laliga', quality: 'HD', seed: 7 },
  { id: 'ucl-1', number: 301, name: 'UCL Main', short: 'UCL', leagueId: 'ucl', quality: '4K', seed: 2 },
  { id: 'ucl-2', number: 302, name: 'UCL Arena 1', short: 'AR1', leagueId: 'ucl', quality: 'FHD', seed: 5 },
  { id: 'ucl-3', number: 303, name: 'UCL Arena 2', short: 'AR2', leagueId: 'ucl', quality: 'FHD', seed: 0 },
  { id: 'ucl-4', number: 304, name: 'UCL Arena 3', short: 'AR3', leagueId: 'ucl', quality: 'FHD', seed: 4 },
  { id: 'ucl-5', number: 305, name: 'UCL Goal Zone', short: 'GZN', leagueId: 'ucl', quality: 'HD', seed: 6 },
  { id: 'ucl-6', number: 306, name: 'UCL Ultra 4K', short: 'UHD', leagueId: 'ucl', quality: '4K', seed: 1 },
]

const fixtures: Record<LeagueId, [string, string, string][]> = {
  pl: [
    ['Arsenal', 'Chelsea', 'Emirates Stadium'],
    ['Liverpool', 'Man City', 'Anfield'],
    ['Man United', 'Tottenham', 'Old Trafford'],
    ['Newcastle', 'Aston Villa', "St James' Park"],
    ['Brighton', 'West Ham', 'Amex Stadium'],
    ['Everton', 'Fulham', 'Hill Dickinson Stadium'],
  ],
  laliga: [
    ['Real Madrid', 'Barcelona', 'Santiago Bernabéu'],
    ['Atlético', 'Sevilla', 'Metropolitano'],
    ['Athletic', 'Real Sociedad', 'San Mamés'],
    ['Valencia', 'Villarreal', 'Mestalla'],
    ['Real Betis', 'Girona', 'Benito Villamarín'],
    ['Osasuna', 'Celta Vigo', 'El Sadar'],
  ],
  ucl: [
    ['Bayern', 'PSG', 'Allianz Arena'],
    ['Real Madrid', 'Man City', 'Santiago Bernabéu'],
    ['Inter', 'Arsenal', 'San Siro'],
    ['Barcelona', 'Dortmund', 'Camp Nou'],
    ['Liverpool', 'Juventus', 'Anfield'],
    ['Benfica', 'Atlético', 'Estádio da Luz'],
  ],
}

const shows: Record<LeagueId, { analysis: string[]; highlights: string[] }> = {
  pl: {
    analysis: ['Monday Night Breakdown', 'The Tactics Board', 'Pre-Match Live', 'Title Race Weekly'],
    highlights: ['Goals of the Round', 'Matchday Rewind', 'Fan Zone', 'PL Countdown'],
  },
  laliga: {
    analysis: ['El Análisis', 'Noche de LaLiga', 'Previa en Directo', 'La Pizarra'],
    highlights: ['Todos los Goles', 'Resumen Jornada', 'Top 10 Golazos', 'LaLiga World'],
  },
  ucl: {
    analysis: ['UCL Matchnight Live', 'Road to the Final', 'Kick-Off Show', 'European Nights'],
    highlights: ['Goal Rush', 'Best Saves', 'UCL Magazine', 'Full-Time Report'],
  },
}

const durations = [60, 120, 30, 90, 120, 60, 30, 120]

function kindForDuration(minutes: number): ProgramKind {
  if (minutes === 120) return 'LIVE'
  if (minutes === 90) return 'REPLAY'
  if (minutes === 60) return 'ANALYSIS'
  return 'HIGHLIGHTS'
}

export function getChannelsByLeague(leagueId: LeagueId) {
  return channels.filter((c) => c.leagueId === leagueId)
}

export function getLeague(leagueId: LeagueId) {
  return leagues.find((l) => l.id === leagueId) ?? leagues[0]
}

export function getSchedule(channel: Channel, now: number, count = 7): Program[] {
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const all: Program[] = []
  let t = dayStart.getTime() - 2 * 60 * 60 * 1000 + (channel.number % 4) * 15 * 60 * 1000
  let i = channel.seed + channel.number

  while (t < now + 12 * 60 * 60 * 1000) {
    const minutes = durations[i % durations.length]
    const kind = kindForDuration(minutes)
    const leagueFixtures = fixtures[channel.leagueId]
    const [home, away, venue] = leagueFixtures[(i + channel.number * 7) % leagueFixtures.length]
    const showSet = shows[channel.leagueId]
    const start = t
    const end = t + minutes * 60 * 1000

    let program: Program
    if (kind === 'LIVE' || kind === 'REPLAY') {
      program = {
        id: `${channel.id}-${start}`,
        kind,
        title: `${home} vs ${away}`,
        subtitle: kind === 'LIVE' ? `Live from ${venue}` : `Full match replay · ${venue}`,
        start,
        end,
        home,
        away,
      }
    } else {
      const list = kind === 'ANALYSIS' ? showSet.analysis : showSet.highlights
      program = {
        id: `${channel.id}-${start}`,
        kind,
        title: list[(i + channel.seed) % list.length],
        subtitle: kind === 'ANALYSIS' ? 'Studio analysis & expert panel' : 'Every goal, save and big moment',
        start,
        end,
      }
    }

    all.push(program)
    t = end
    i++
  }

  const currentIndex = all.findIndex((p) => p.start <= now && p.end > now)
  return all.slice(currentIndex, currentIndex + count)
}

const MIN = 60 * 1000

export type FixtureStatus = 'LIVE' | 'UPCOMING' | 'FT'

export type Broadcast = {
  channelId: string
  feed: string
}

export type Fixture = {
  id: string
  leagueId: LeagueId
  home: string
  away: string
  venue: string
  round: string
  kickoffOffset: number
  broadcasts: Broadcast[]
}

const kickoffOffsets = [-50, 25, -20, 120, -170, 240]

const rounds: Record<LeagueId, string> = {
  pl: 'Matchweek 9',
  laliga: 'Jornada 10',
  ucl: 'League Phase · MD3',
}

const feedLabels = [
  'Main Feed · English',
  'Spanish Commentary',
  'Arabic Commentary',
  'Tactical Cam',
]

const fixtureList: Fixture[] = (Object.keys(fixtures) as LeagueId[]).flatMap((leagueId) => {
  const leagueChannels = channels.filter((c) => c.leagueId === leagueId)
  return fixtures[leagueId].map(([home, away, venue], i) => {
    const count = Math.min(leagueChannels.length, 2 + (i % 3))
    return {
      id: `${leagueId}-fx-${i}`,
      leagueId,
      home,
      away,
      venue,
      round: rounds[leagueId],
      kickoffOffset: kickoffOffsets[i % kickoffOffsets.length] * MIN,
      broadcasts: Array.from({ length: count }, (_, k) => ({
        channelId: leagueChannels[(i * 2 + k) % leagueChannels.length].id,
        feed: feedLabels[k % feedLabels.length],
      })),
    }
  })
})

// Kick-off times are anchored once per session so live minutes don't jump while browsing.
let sessionAnchor: number | null = null
function anchorOf(now: number) {
  if (sessionAnchor === null) sessionAnchor = Math.floor(now / (15 * MIN)) * 15 * MIN
  return sessionAnchor
}

export function kickoffOf(fixture: Fixture, now: number) {
  return anchorOf(now) + fixture.kickoffOffset
}

export function getFixturesByLeague(leagueId: LeagueId, now: number | null) {
  const list = fixtureList.filter((f) => f.leagueId === leagueId)
  if (!now) return list
  const rank: Record<FixtureStatus, number> = { LIVE: 0, UPCOMING: 1, FT: 2 }
  return [...list].sort((a, b) => {
    const diff = rank[fixtureStatus(a, now)] - rank[fixtureStatus(b, now)]
    return diff !== 0 ? diff : a.kickoffOffset - b.kickoffOffset
  })
}

export const allFixtures = fixtureList

export function getLiveFixtures(now: number | null) {
  if (!now) return []
  return fixtureList.filter((f) => fixtureStatus(f, now) === 'LIVE')
}

function seedOf(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}

export function getMatchStats(fixture: Fixture, minute: number) {
  const s = seedOf(fixture.id)
  const p = Math.min(1, minute / 90)
  const possession = 38 + (s % 25)
  return [
    { label: 'Possession', home: possession, away: 100 - possession, unit: '%' },
    { label: 'Shots', home: Math.round((6 + (s % 9)) * p), away: Math.round((4 + ((s >> 2) % 8)) * p) },
    { label: 'On target', home: Math.round((2 + (s % 5)) * p), away: Math.round((1 + ((s >> 3) % 5)) * p) },
    { label: 'Corners', home: Math.round((2 + ((s >> 1) % 6)) * p), away: Math.round((1 + ((s >> 4) % 6)) * p) },
    { label: 'Fouls', home: Math.round((5 + ((s >> 2) % 7)) * p), away: Math.round((6 + ((s >> 5) % 6)) * p) },
  ]
}

export function getFixture(id: string) {
  return fixtureList.find((f) => f.id === id) ?? fixtureList[0]
}

export function fixtureStatus(fixture: Fixture, now: number): FixtureStatus {
  const kickoff = kickoffOf(fixture, now)
  if (now < kickoff) return 'UPCOMING'
  if (now < kickoff + 105 * MIN) return 'LIVE'
  return 'FT'
}

function matchProgram(fixture: Fixture, now: number): Program {
  const kickoff = kickoffOf(fixture, now)
  return {
    id: `${fixture.id}-match`,
    kind: 'LIVE',
    title: `${fixture.home} vs ${fixture.away}`,
    subtitle: `Live from ${fixture.venue}`,
    start: kickoff - 15 * MIN,
    end: kickoff + 105 * MIN,
    home: fixture.home,
    away: fixture.away,
  }
}

export function getFixtureScore(fixture: Fixture, now: number) {
  const status = fixtureStatus(fixture, now)
  if (status === 'UPCOMING') return null
  const match = matchProgram(fixture, now)
  return getLiveScore(match, status === 'FT' ? match.end : now)
}

export function getFixtureSchedule(fixture: Fixture, channel: Channel, now: number, count = 7): Program[] {
  const showSet = shows[fixture.leagueId]
  const match = matchProgram(fixture, now)
  const status = fixtureStatus(fixture, now)
  const pick = (list: string[], n: number) => list[(n + channel.seed) % list.length]

  const items: Program[] = [
    {
      id: `${fixture.id}-${channel.id}-pre`,
      kind: 'ANALYSIS',
      title: pick(showSet.analysis, 0),
      subtitle: `Build-up to ${fixture.home} vs ${fixture.away}`,
      start: match.start - 60 * MIN,
      end: match.start,
    },
    { ...match, id: `${match.id}-${channel.id}` },
    {
      id: `${fixture.id}-${channel.id}-post`,
      kind: 'HIGHLIGHTS',
      title: 'Full-Time Reaction',
      subtitle: `Every goal from ${fixture.home} vs ${fixture.away}`,
      start: match.end,
      end: match.end + 30 * MIN,
    },
  ]

  if (status === 'FT') {
    const last = items[items.length - 1]
    items.push({
      id: `${fixture.id}-${channel.id}-replay`,
      kind: 'REPLAY',
      title: match.title,
      subtitle: `Full match replay · ${fixture.venue}`,
      start: last.end,
      end: last.end + 120 * MIN,
      home: fixture.home,
      away: fixture.away,
    })
  }

  for (let n = 1; n <= count; n++) {
    const last = items[items.length - 1]
    const analysis = n % 2 === 1
    items.push({
      id: `${fixture.id}-${channel.id}-after-${n}`,
      kind: analysis ? 'ANALYSIS' : 'HIGHLIGHTS',
      title: pick(analysis ? showSet.analysis : showSet.highlights, n),
      subtitle: analysis ? 'Studio analysis & expert panel' : 'Every goal, save and big moment',
      start: last.end,
      end: last.end + (analysis ? 60 : 30) * MIN,
    })
  }

  let n = 0
  while (items[0].start > now) {
    const first = items[0]
    n++
    items.unshift({
      id: `${fixture.id}-${channel.id}-before-${n}`,
      kind: 'HIGHLIGHTS',
      title: pick(showSet.highlights, n),
      subtitle: 'Every goal, save and big moment',
      start: first.start - 60 * MIN,
      end: first.start,
    })
  }

  return items.filter((p) => p.end > now).slice(0, count)
}

export function teamCode(team: string) {
  return team.replace(/[^A-Za-zÀ-ÿ ]/g, '').replace(/\s+/g, '').slice(0, 3).toUpperCase()
}

export function getLiveScore(program: Program, now: number) {
  const elapsed = Math.floor((now - program.start) / 60000)
  const matchMinute = Math.max(0, Math.min(90, elapsed - 15))
  const seed = program.start / 60000 + (program.home?.length ?? 0)
  const homeGoals = Math.floor(((seed % 7) / 7) * 3 * (matchMinute / 90))
  const awayGoals = Math.floor((((seed * 3) % 5) / 5) * 2 * (matchMinute / 90))
  const label = elapsed < 15 ? 'PRE' : elapsed > 105 ? 'FT' : `${matchMinute}'`
  return { homeGoals, awayGoals, label }
}

export function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function progressOf(program: Program, now: number) {
  return Math.min(100, Math.max(0, ((now - program.start) / (program.end - program.start)) * 100))
}
