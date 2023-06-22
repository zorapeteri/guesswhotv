import { getCast } from '~/api/cast'
import { getEpisodes } from '~/api/episodes'
import { getSeasons } from '~/api/seasons'
import type { CastMember } from '~/types/cast'
import type { Episode } from '~/types/episode'
import type { ID } from '~/types/shared'

const minimumEpisodeAppearances = 3

export type FullCast = {
  main: CastMember[]
  seasons: {
    [id: string | number]: CastMember[]
  }
}

function episodesWithCharacter(episodes: Episode[], characterId: ID) {
  return episodes.filter((episode) => {
    return episode._embedded.guestcast.some(
      (member) => member.character.id === characterId
    )
  })
}

export async function getFullCast(showId: ID): Promise<FullCast> {
  const mainCast = await getCast(showId)
  const seasonsRes = await getSeasons(showId)
  const episodesPerSeasons = await Promise.all(
    seasonsRes.map((season) => getEpisodes(season.id))
  )
  const allEpisodes = episodesPerSeasons.flat()
  const handledCast = mainCast.map((member) => member.character.id)
  const seasons: Record<number, CastMember[]> = {}
  allEpisodes.forEach((episode) => {
    const { guestcast } = episode._embedded
    const episodeCounts: Record<number, number> = {}
    const qualifiedGuestCast = guestcast
      .filter((member) => {
        if (handledCast.includes(member.character.id)) return false
        const episodeCount = episodesWithCharacter(
          allEpisodes,
          member.character.id
        ).length
        if (episodeCount >= minimumEpisodeAppearances) {
          episodeCounts[member.character.id] = episodeCount
          return true
        }
        return false
      })
      .sort(
        (a, b) => episodeCounts[b.character.id] - episodeCounts[a.character.id]
      )
    if (qualifiedGuestCast.length) {
      if (!seasons[episode.season]) {
        seasons[episode.season] = []
      }
      seasons[episode.season].push(...qualifiedGuestCast)
      handledCast.push(
        ...qualifiedGuestCast.map((member) => member.character.id)
      )
    }
  })
  return { main: mainCast, seasons }
}

export async function getFullCastTextList(showId: ID) {
  const fullCast = await getFullCast(showId)
  const lines = []
  lines.push('main cast:')
  fullCast.main.forEach((member) => {
    lines.push(`  - ${member.character.name}`)
  })

  Object.keys(fullCast.seasons).forEach((season) => {
    lines.push(`season ${season}:`)
    fullCast.seasons[Number(season)].forEach((member) => {
      lines.push(`  - ${member.character.name}`)
    })
  })
  return lines.join('\n')
}
