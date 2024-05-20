import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getFullCast } from '~/helpers/getFullCast'
import defaultCharacterSet from '~/helpers/defaultCharacterSet'
import { getShow } from '~/api/show'
import { CastForm } from './cast.$showId'
import errors from '~/constants/castErrors'
import minCharacterCount from '~/constants/minCharacterCount'

export { links, meta } from './cast.$showId'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const showId = url.pathname.split('-').at(-1)
  if (!showId || isNaN(Number(showId))) {
    throw new Response('404', { status: 404 })
  }
  const show = await getShow(showId)
  const cast = await getFullCast(showId)
  let selected =
    url.searchParams.get('cs') &&
    atob(url.searchParams.get('cs')!).split(',').map(Number)

  if (!selected) {
    selected = defaultCharacterSet(cast).map((member) => member.character.id)
  }

  if (selected.length < minCharacterCount) {
    throw new Response('too-few-characters', { status: 417 })
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
