import _ from "lodash"
import { getCast } from "~/api/cast"
import { getEpisodes } from "~/api/episodes"
import { getSeasons } from "~/api/seasons"
import type { CastMember } from "~/types/cast"
import type { Episode } from "~/types/episode"
import type { Season } from "~/types/season"
import type { ID } from "~/types/shared"

const minimumEpisodeAppearances = 3

export type FullCast = {
  main: CastMember[]
  seasons: {
    [number: string | number]: CastMember[]
  }
}

const castIncludesMember = (cast: CastMember[], member: CastMember) => {
  return cast.some((m) => m.character.id === member.character.id)
}

function episodesWithMember(episodes: Episode[], member: CastMember) {
  return episodes.filter((episode) =>
    castIncludesMember(episode._embedded.guestcast, member)
  )
}

function firstSeasonWithMember(episodes: Episode[], member: CastMember) {
  return episodesWithMember(episodes, member)[0].season
}

export async function getFullCast(showId: ID): Promise<FullCast> {
  const mainCast = await getCast(showId)
  const episodesPerSeason = await Promise.all(
    (await getSeasons(showId)).map((season) => getEpisodes(season.id))
  )
  const allEpisodes = episodesPerSeason.flat()

  const allQuestCast = allEpisodes
    .flatMap((episode) => episode._embedded.guestcast)
    // sometimes cast are duplicated between main and guest
    .filter((member) => !castIncludesMember(mainCast, member))

  // guest cast can appear in multiple episodes
  const uniqueGuestCast = _.uniqBy(
    allQuestCast,
    (member) => member.character.id
  )

  const qualifiedGuestCast = uniqueGuestCast
    .filter(
      (member) =>
        episodesWithMember(allEpisodes, member).length >=
        minimumEpisodeAppearances
    )
    .sort(
      (a, b) =>
        episodesWithMember(allEpisodes, b).length -
        episodesWithMember(allEpisodes, a).length
    )

  const uniqueSeasons = new Set(allEpisodes.map((episode) => episode.season))
  const guestCastPerSeason: Record<Season["number"], CastMember[]> = {}

  for (const season of uniqueSeasons) {
    const qualifiedGuestCastFromSeason = qualifiedGuestCast.filter(
      (member) => firstSeasonWithMember(allEpisodes, member) === season
    )

    if (qualifiedGuestCastFromSeason.length > 0) {
      guestCastPerSeason[season] = qualifiedGuestCastFromSeason
    }
  }

  return { main: mainCast, seasons: guestCastPerSeason }
}
