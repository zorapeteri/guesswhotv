import apiPath from '~/constants/apiPath'
import type { Season } from '~/types/season'
import type { ID } from '~/types/shared'

export async function getSeasons(showId: ID): Promise<Season[]> {
  return fetch(`${apiPath}/shows/${showId}/seasons`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 404) {
        throw new Response('404', { status: 404 })
      }
      return res
    })
}
