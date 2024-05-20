import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { ClientLoaderFunction } from "@remix-run/react"
import slug from "slug"
import { searchShows } from "~/api/search"
import canUseJS from "~/helpers/canUseJS"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  if (canUseJS(url)) {
    return null
  }

  const search = url.pathname.replace("/", "")

  const shows = await searchShows(search)
  if (shows?.length) {
    return redirect(
      `/show/${[slug(shows[0].show.name), shows[0].show.id].join("-")}`
    )
  }
  throw new Response("404", { status: 404 })
}

export const clientLoader: ClientLoaderFunction = async ({ request }) => {
  const search = new URL(request.url).pathname.replace("/", "")

  const shows = await searchShows(search)

  if (shows?.length) {
    location.href =
      location.origin +
      `/show/${[slug(shows[0].show.name), shows[0].show.id].join("-")}`

    return null
  }

  throw new Response("404", { status: 404 })
}

clientLoader.hydrate = true

export default function Search() {
  return null
}
