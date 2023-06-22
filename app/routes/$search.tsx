import { type LoaderArgs, redirect } from '@remix-run/node'
import slug from 'slug'
import { searchShows } from '~/api/search'

export const loader = async ({ request }: LoaderArgs) => {
  const search = new URL(request.url).pathname.replace('/', '')
  const shows = await searchShows(search)
  if (shows?.length) {
    return redirect(
      `/show/${[slug(shows[0].show.name), shows[0].show.id].join('-')}`
    )
  }
  return redirect('/404')
}
