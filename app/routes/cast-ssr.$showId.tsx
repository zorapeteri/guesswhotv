import {
  type LoaderArgs,
  type V2_MetaFunction,
  type LinksFunction,
  json,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { getFullCast } from '~/helpers/getFullCast'
import title from '~/helpers/title'
import castCss from '~/styles/cast-pick.css'
import defaultCharacterSet from '~/helpers/defaultCharacterSet'
import { getShow } from '~/api/show'
import { Checkbox, Footer } from './cast.$showId'
import errors from '~/constants/castErrors'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: castCss }]

export const meta: V2_MetaFunction<typeof loader> = () => {
  return [{ title: title('change characters') }]
}

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
      <div className="show">
        {show.image?.original && (
          <img src={show.image.original} alt={show.name} />
        )}
        <div>
          <span>setting characters for:</span>
          <h1>{show.name}</h1>
        </div>
      </div>
      <Form method="post" action="/setcast">
        <div>
          <fieldset>
            <label>main cast</label>
            <div className="checkboxGroup">
              {cast.main.map((cast) => (
                <Checkbox
                  key={cast.character.id}
                  character={cast.character}
                  checked={selected.includes(cast.character.id)}
                />
              ))}
            </div>
          </fieldset>
          {Object.keys(cast.seasons).map((season) => (
            <fieldset key={season}>
              <label>season {season}</label>
              <div className="checkboxGroup">
                {cast.seasons[Number(season)].map((cast) => (
                  <Checkbox
                    key={cast.character.id}
                    character={cast.character}
                    checked={selected.includes(cast.character.id)}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Footer />
      </Form>
    </>
  )
}
