import { type LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getFullCast } from '~/helpers/getFullCast'
import defaultCharacterSet from '~/helpers/defaultCharacterSet'
import { getShow } from '~/api/show'
import { CastForm } from './cast.$showId'
import errors from '~/constants/castErrors'

export { links, meta } from './cast.$showId'

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const showId = url.pathname.split('-').at(-1)
  if (!showId || isNaN(Number(showId))) {
    throw new Error('404')
  }
  const show = await getShow(showId)
  const cast = await getFullCast(showId)
  let selected =
    url.searchParams.get('cs') &&
    atob(url.searchParams.get('cs')!).split(',').map(Number)

  if (!selected) {
    selected = defaultCharacterSet(cast).map((member) => member.character.id)
  }

  const error = url.searchParams.get('error')

  return json({ cast, selected, show, error })
}

export default function Cast() {
  const { cast, selected, show, error } = useLoaderData<typeof loader>()
  return (
    <>
      {error && (errors as Record<string, string>)[error] && (
        <div className="error">{(errors as Record<string, string>)[error]}</div>
      )}
      <CastForm cast={cast} selected={selected} show={show} />
    </>
  )
}
