import apiPath from '~/constants/apiPath'
import type { Episode } from '~/types/episode'
import type { ID } from '~/types/shared'

export async function getEpisodes(seasonId: ID): Promise<Episode[]> {
  return fetch(`${apiPath}/seasons/${seasonId}/episodes?embed=guestcast`).then(
    (res) => res.json()
  )
}
