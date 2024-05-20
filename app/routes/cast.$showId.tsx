import React, { useEffect, useState } from "react"
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type LinksFunction,
  json,
} from "@remix-run/node"
import { ClientLoaderFunction, Form, useLoaderData } from "@remix-run/react"
import { getFullCast } from "~/helpers/getFullCast"
import title from "~/helpers/title"
import type { Cast, Character } from "~/types/cast"
import castCss from "~/styles/cast-pick.scss?url"
import defaultCharacterSet from "~/helpers/defaultCharacterSet"
import { getShow } from "~/api/show"
import type { Show } from "~/types/show"
import minCharacterCount from "~/constants/minCharacterCount"
import maxCharacterCount from "~/constants/maxCharacterCount"
import errors from "~/constants/castErrors"
import canUseJS from "~/helpers/canUseJS"
import { ExtractLoaderResponse } from "~/types/extractLoaderResponse"

export const links: LinksFunction = () => [{ rel: "stylesheet", href: castCss }]

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: title("change characters") }]
}

async function loadShowAndCast(showId: string) {
  const show = await getShow(showId)
  const cast = await getFullCast(showId)

  return { show, cast }
}

export const clientLoader: ClientLoaderFunction = async ({ serverLoader }) => {
  const serverData = (await serverLoader()) as ExtractLoaderResponse<
    typeof loader
  >
  const { showId, selected } = serverData
  const { show, cast } = await loadShowAndCast(showId)
  return {
    ...serverData,
    cast,
    show,
    selected:
      selected === null
        ? defaultCharacterSet(cast).map((member) => member.character.id)
        : selected,
  }
}

clientLoader.hydrate = true

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)

  const showId = url.pathname.split("-").at(-1)
  if (!showId || isNaN(Number(showId))) {
    throw new Response("404", { status: 404 })
  }

  let selected =
    (url.searchParams.get("cs") &&
      atob(url.searchParams.get("cs")!).split(",").map(Number)) ||
    null

  const { show, cast } = canUseJS(url)
    ? { show: null, cast: null }
    : await loadShowAndCast(showId)

  if (!selected && cast !== null) {
    selected = defaultCharacterSet(cast).map((member) => member.character.id)
  }

  if (selected !== null && selected.length < minCharacterCount) {
    throw new Response("too-few-characters", { status: 417 })
  }

  const error = url.searchParams.get("error")

  return json({ url: request.url, showId, error, selected, show, cast })
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
  loading,
}: {
  show: Show
  cast: Cast
  selected: number[]
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDoneClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  loading?: boolean
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
            <legend>main cast</legend>
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
              <legend>season {season}</legend>
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
          <button
            type="submit"
            onClick={onDoneClick}
            disabled={loading}
            title={loading ? "Loading" : undefined}
          >
            {loading ? <span className="loader"></span> : "Done"}
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
  const {
    error,
    selected: selectedFromLoader,
    show,
    cast,
  } = useLoaderData<typeof loader>()
  const [selected, setSelected] = useState<number[] | null>(selectedFromLoader)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSelected(selectedFromLoader)
  }, [selectedFromLoader])

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
            selected.length === 1 ? "character" : "characters"
          } selected.`
        )
      } else {
        alert(
          `${errors.toomany} You currently have ${selected.length} characters selected.`
        )
      }
      return
    }
    setLoading(true)
    ;(e.target as HTMLButtonElement).form?.submit()
  }

  if (!(show && cast && selected)) return null

  return (
    <>
      {error && (errors as Record<string, string>)[error] && (
        <div className="error">{(errors as Record<string, string>)[error]}</div>
      )}{" "}
      <CastForm
        show={show}
        cast={cast}
        selected={selected}
        onDoneClick={onClick}
        onCheckboxChange={onChange}
        loading={loading}
      />
    </>
  )
}
