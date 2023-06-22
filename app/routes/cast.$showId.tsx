import React, { useState, useEffect, useCallback } from 'react'
import {
  type LoaderArgs,
  type V2_MetaFunction,
  type LinksFunction,
  json,
  redirect,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { type FullCast, getFullCast } from '~/helpers/getFullCast'
import title from '~/helpers/title'
import type { Character } from '~/types/cast'
import castCss from '~/styles/cast-pick.css'
import defaultCharacterSet from '~/helpers/defaultCharacterSet'
import { getShow } from '~/api/show'
import type { Show } from '~/types/show'
import { useHasJS } from '~/helpers/useHasJS'
import minCharacterCount from '~/constants/minCharacterCount'
import maxCharacterCount from '~/constants/maxCharacterCount'
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
  return json({ url: request.url, showId })
}

function Checkbox({
  character,
  checked,
  onChange,
}: {
  character: Character
  checked: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <input
        type="checkbox"
        id={character.id.toString()}
        name={character.id.toString()}
        defaultChecked={onChange ? undefined : checked}
        checked={onChange ? checked : undefined}
        onChange={onChange}
      />
      <label htmlFor={character.id.toString()}>{character.name}</label>
    </div>
  )
}

export function CastForm({
  show,
  cast,
  selected,
  onCheckboxChange,
  onDoneClick,
}: {
  show: Show
  cast: FullCast
  selected: number[]
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDoneClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <>
      <div className="show">
        {show.image?.original && (
          <img src={show.image.original} alt={show.name} />
        )}
        <div>
          <span>setting characters for:</span>
          <h1>{show.name}</h1>
        </div>
      </div>
      <Form method="post" action="/setcast" replace>
        <div>
          <fieldset>
            <label>main cast</label>
            <div className="checkboxGroup">
              {cast.main.map((cast) => (
                <Checkbox
                  key={cast.character.id}
                  character={cast.character}
                  checked={selected.includes(cast.character.id)}
                  onChange={onCheckboxChange}
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
                    onChange={onCheckboxChange}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <footer>
          <button type="submit" onClick={onDoneClick}>
            Done
          </button>
          <p>
            Once you press <span>Done</span>, you can copy the link in your
            browser's address bar to share this character set.
          </p>
        </footer>
      </Form>
    </>
  )
}

export default function Cast() {
  const { url: urlFromLoader, showId } = useLoaderData<typeof loader>()
  const hasJS = useHasJS()
  const [show, setShow] = useState<Show | null>(null)
  const [cast, setCast] = useState<FullCast | null>(null)
  const [selected, setSelected] = useState<number[] | null>(null)

  const fetchStuff = useCallback(async () => {
    const url = new URL(urlFromLoader)
    const _show = await getShow(showId)
    const _cast = await getFullCast(showId)
    let _selected =
      url.searchParams.get('cs') &&
      atob(url.searchParams.get('cs')!).split(',').map(Number)
    if (!_selected) {
      _selected = defaultCharacterSet(_cast).map(
        (member) => member.character.id
      )
    }
    setShow(_show)
    setCast(_cast)
    setSelected(_selected)
  }, [showId, urlFromLoader])

  useEffect(() => {
    if (!hasJS) return
    fetchStuff()
  }, [hasJS, fetchStuff])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.name)
    if (selected?.includes(id)) {
      setSelected(selected.filter((x) => x !== id))
    } else if (selected) {
      setSelected([...selected, id])
    }
  }

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selected) return
    if (
      selected.length < minCharacterCount ||
      selected.length > maxCharacterCount
    ) {
      e.preventDefault()
      if (selected.length < minCharacterCount) {
        alert(
          `${errors.toofew} You currently have ${selected.length} ${
            selected.length === 1 ? 'character' : 'characters'
          } selected.`
        )
      } else {
        alert(
          `${errors.toomany} You currently have ${selected.length} characters selected.`
        )
      }
    }
  }

  if (!(show && cast && selected)) return null

  return (
    <CastForm
      show={show}
      cast={cast}
      selected={selected}
      onDoneClick={onClick}
      onCheckboxChange={onChange}
    />
  )
}
