import minCharacterCount from "~/constants/minCharacterCount"
import {
  firstSeasonWithMember,
  getQualifiedGuestCastFromEpisodes,
} from "./getFullCast"
import { getMainCast } from "~/api/cast"
import { getSeasons } from "~/api/seasons"
import { getEpisodes } from "~/api/episodes"
import type { Cast } from "~/types/cast"
import { Episode } from "~/types/episode"
import _ from "lodash"
import maxCharacterCount from "~/constants/maxCharacterCount"

export async function getDefaultCast(showId: string): Promise<Cast> {
  const mainCast = await getMainCast(showId)
  if (mainCast.length >= minCharacterCount) {
    return {
      main: mainCast.slice(0, maxCharacterCount),
      seasons: {},
    }
  }

  const episodes: Episode[] = []

  for (const season of await getSeasons(showId)) {
    episodes.push(...(await getEpisodes(season.id)))
    const stillMissingCastCount = minCharacterCount - mainCast.length
    const qualifiedGuestCast = getQualifiedGuestCastFromEpisodes(
      episodes,
      mainCast
    )
    if (qualifiedGuestCast.length >= stillMissingCastCount) {
      return {
        main: mainCast,
        seasons: _.groupBy(
          qualifiedGuestCast.slice(0, stillMissingCastCount),
          (member) => firstSeasonWithMember(episodes, member)
        ),
      }
    }
  }

  throw new Response("too-few-characters", { status: 417 })
}
