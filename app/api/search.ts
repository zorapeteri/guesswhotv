import apiPath from '~/constants/apiPath'
import type { ShowResult } from '~/types/show'

export async function searchShows(query: string): Promise<ShowResult[]> {
  return fetch(`${apiPath}/search/shows?q=${query}`).then((res) => res.json())
}
