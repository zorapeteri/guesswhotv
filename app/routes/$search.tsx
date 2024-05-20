import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import slug from 'slug'
import { searchShows } from '~/api/search'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const search = new URL(request.url).pathname.replace('/', '')
  const shows = await searchShows(search)
  if (shows?.length) {
    return redirect(
      `/show/${[slug(shows[0].show.name), shows[0].show.id].join('-')}`
    )
  }
  throw new Response('404', { status: 404 })
}

export default function Search() {
  return null
}
