import apiPath from "~/constants/apiPath"
import forbiddenGenres from "~/constants/forbiddenGenres"
import type { ShowResult } from "~/types/show"

export async function searchShows(query: string): Promise<ShowResult[]> {
  return fetch(`${apiPath}/search/shows?q=${query}`)
    .then((res) => res.json())
    .then((res) =>
      res.filter(
        (showResult: ShowResult) =>
          !showResult.show.genres?.some((genre) =>
            forbiddenGenres.includes(genre)
          )
      )
    )
}
