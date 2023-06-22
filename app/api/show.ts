import apiPath from '~/constants/apiPath'
import type { ID } from '~/types/shared'
import type { Show } from '~/types/show'

export async function getShow(showId: ID): Promise<Show> {
  return fetch(`${apiPath}/shows/${showId}`).then((res) => res.json())
}
