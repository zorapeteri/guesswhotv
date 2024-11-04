import { firstSeasonWithMember } from "./getFullCast"
import { getMainCast } from "~/api/cast"
import { getSeasons } from "~/api/seasons"
import { getEpisodes } from "~/api/episodes"
import type { Cast } from "~/types/cast"
import { Episode } from "~/types/episode"
import _ from "lodash"

export async function getSpecificCast(
  showId: string,
  characterIds: number[]
): Promise<Cast> {
  const mainCast = await getMainCast(showId)
  const requiredMainCast = mainCast.filter((member) =>
    characterIds.includes(member.character.id)
  )

  if (requiredMainCast.length === characterIds.length) {
    return {
      main: requiredMainCast,
      seasons: {},
    }
  }

  const episodes: Episode[] = []

  const requiredGuestCastIds = characterIds.filter(
    (id) => !mainCast.some((member) => member.character.id === id)
  )

  for (const season of await getSeasons(showId)) {
    episodes.push(...(await getEpisodes(season.id)))
    const guestCast = _.uniqBy(
      episodes.flatMap((ep) => ep._embedded.guestcast),
      (member) => member.character.id
    )
    const requiredGuestCast = guestCast.filter((member) =>
      requiredGuestCastIds.includes(member.character.id)
    )
    if (
      requiredGuestCast.length + requiredMainCast.length ===
      characterIds.length
    ) {
      return {
        main: requiredMainCast,
        seasons: _.groupBy(requiredGuestCast, (member) =>
          firstSeasonWithMember(episodes, member)
        ),
      }
    }
  }

  throw new Error("could not find specified characters")
}
