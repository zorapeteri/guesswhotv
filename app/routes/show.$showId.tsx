import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, Link, ClientLoaderFunction } from "@remix-run/react"
import { classname } from "~/helpers/classname"
import castGrid from "~/styles/cast-grid.scss?url"
import characterCard from "~/styles/character-card.scss?url"
import showCss from "~/styles/show.scss?url"
import React, { useEffect, useState } from "react"
import title from "~/helpers/title"
import {
  clearUnwantedParams,
  hasUnwantedParams,
} from "~/helpers/unwantedParams"
import { flattenCast } from "~/helpers/flattenCast"
import { getShow } from "~/api/show"
import { getCharacterImage } from "~/helpers/getCharacterImage"
import { getDefaultCast } from "~/helpers/getDefaultCast"
import { getSpecificCast } from "~/helpers/getSpecificCast"
import canUseJS from "~/helpers/canUseJS"
import { CastMember } from "~/types/cast"
import { ExtractLoaderResponse } from "~/types/extractLoaderResponse"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: showCss },
  { rel: "stylesheet", href: castGrid },
  { rel: "stylesheet", href: characterCard },
]

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: title(data?.show?.name) }]
}

type ChoosingCharacterStep = "hi" | "choosing" | "confirming" | null

async function loadShowAndCharacters({
  showId,
  characterIds,
}: {
  showId: string
  characterIds: number[] | null
}) {
  const show = await getShow(showId)
  const cast =
    characterIds !== null
      ? await getSpecificCast(showId, characterIds)
      : await getDefaultCast(showId)
  const characters = flattenCast(cast)

  return { show, characters }
}

export const clientLoader: ClientLoaderFunction = async ({ serverLoader }) => {
  const serverData = (await serverLoader()) as ExtractLoaderResponse<
    typeof loader
  >
  const { showId, characterIds } = serverData
  return {
    ...serverData,
    ...(await loadShowAndCharacters({ showId, characterIds })),
  }
}

clientLoader.hydrate = true

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const showId = url.pathname.split("/").at(-1)?.split("-").at(-1)
  if (!showId || isNaN(Number(showId))) {
    throw new Response("404", { status: 404 })
  }

  const crossedOut = url.searchParams.get("co")?.split(",").map(Number) || []
  const csParam = url.searchParams.get("cs")
  const characterIds = csParam ? atob(csParam).split(",").map(Number) : null

  const { show, characters } = canUseJS(url)
    ? { show: null, characters: [] as CastMember[] }
    : await loadShowAndCharacters({ showId, characterIds })
  const sParam = url.searchParams.get("s")
  const ccsParam = url.searchParams.get("ccs")
  const choosingCharacterStep: ChoosingCharacterStep =
    (ccsParam as ChoosingCharacterStep) || (sParam ? null : "hi")
  return json({
    crossedOut,
    showId,
    characterIds,
    characters,
    show,
    choosingCharacterStep,
    href: url.href,
    selected:
      sParam && Number(sParam) <= characters.length ? Number(sParam) : null,
  })
}

export default function Show() {
  const {
    characters,
    crossedOut: crossedOutFromLoader,
    choosingCharacterStep: choosingCharacterStepFromLoader,
    selected: selectedFromLoader,
    showId,
    show,
    href,
  } = useLoaderData<typeof loader>()

  const [crossedOut, setCrossedOut] = useState(crossedOutFromLoader)
  const hasJS = canUseJS(new URL(href))
  const [selected, setSelected] = useState<number | null>(selectedFromLoader)
  const [choosingCharacterStep, setChoosingCharacterStep] =
    useState<ChoosingCharacterStep>(choosingCharacterStepFromLoader)
  const [wiggleHi, setWiggleHi] = useState(false)

  const castPath = href.replace(
    "show",
    canUseJS(new URL(href)) ? "cast" : "cast-ssr"
  )

  const toggleCross = (index: number) => {
    if (crossedOut.includes(index)) {
      setCrossedOut(crossedOut.filter((x) => x !== index))
    } else {
      setCrossedOut([...crossedOut, index])
    }
  }

  const onClick = (index: number) => {
    if (choosingCharacterStep === "hi") {
      setWiggleHi(true)
      setTimeout(() => setWiggleHi(false), 2000)
      return
    }

    if (choosingCharacterStep === "choosing") {
      setSelected(index)
      setChoosingCharacterStep("confirming")
      return
    }

    if (choosingCharacterStep === "confirming") {
      if (index === selected) {
        setChoosingCharacterStep(null)
        return
      }
      setSelected(index)
      setChoosingCharacterStep("confirming")
      return
    }
    toggleCross(index)
  }

  const getHref = (index: number) => {
    const url = new URL(href)
    if (choosingCharacterStep === "choosing") {
      url.searchParams.set("s", index.toString())
      url.searchParams.set("ccs", "confirming")
      return url.href
    }

    if (choosingCharacterStep === "confirming") {
      if (index === selected) {
        url.searchParams.delete("ccs")
        return url.href
      } else {
        url.searchParams.set("s", index.toString())
        return url.href
      }
    }

    if (crossedOut.includes(index)) {
      const filtered = crossedOut.filter((x) => x !== index)
      if (!filtered.length) return url.href
      url.searchParams.set("co", filtered.join(","))
      return url.href
    }
    url.searchParams.set(
      "co",
      new Int8Array([...crossedOut, index]).sort().join(",")
    )
    return url.href
  }

  const getStartHref = () => {
    const url = new URL(href)
    url.searchParams.set("ccs", "choosing")
    return url.href
  }

  useEffect(() => {
    if (!hasJS) return
    if (hasUnwantedParams(location.href)) {
      window.history.replaceState(
        showId,
        "",
        clearUnwantedParams(location.href)
      )
      return
    }
    document.title = title(show?.name)
  }, [hasJS, crossedOutFromLoader, showId, show])

  const CardElement = hasJS ? "button" : "a"

  return (
    <>
      <div aria-live="assertive">
        {choosingCharacterStep === "hi" && (
          <div {...classname("hi", wiggleHi && "wiggle")}>
            <Link to={castPath} className="change" replace>
              change characters
            </Link>
            <span className="or">or</span>
            <CardElement
              className="start"
              onClick={() => setChoosingCharacterStep("choosing")}
              href={hasJS ? undefined : getStartHref()}
            >
              start playing
            </CardElement>
          </div>
        )}
        {choosingCharacterStep === "choosing" && (
          <p className="instruction">choose your character</p>
        )}

        {choosingCharacterStep === "confirming" && (
          <p className="instruction">click again to confirm</p>
        )}

        {choosingCharacterStep === null && (
          <p className="instruction">have fun</p>
        )}
      </div>
      <div
        {...classname(
          "castResult",
          `items-${characters.length}`,
          choosingCharacterStep && "showInstruction",
          !hasJS && choosingCharacterStep === "hi" && "noJsHi"
        )}
        style={
          {
            "--items": characters.length,
          } as React.CSSProperties
        }
      >
        {characters.map((castMember, index) => {
          const { character } = castMember
          const img = getCharacterImage(castMember)
          const isCrossedOut = crossedOut.includes(index)
          const poster = show?.image?.original
          return (
            <CardElement
              key={character.id}
              {...classname(
                "characterCard",
                !img && "noImage",
                character.name.length > 24 && "longName",
                index === selected && "selected",
                index === selected &&
                  choosingCharacterStep === "confirming" &&
                  "confirming"
              )}
              style={{
                backgroundImage: img || poster ? `url(${img || poster})` : "",
              }}
              data-name={character.name}
              title={
                choosingCharacterStep
                  ? character.name
                  : isCrossedOut
                  ? `Uncross ${character.name}`
                  : `Cross ${character.name} out`
              }
              onClick={(e) => {
                e.preventDefault()
                onClick(index)
              }}
              href={!hasJS ? getHref(index) : undefined}
            >
              {isCrossedOut && <div className="cross"></div>}
              {!img && <img src="/images/avatar.svg" alt={character.name} />}
            </CardElement>
          )
        })}
      </div>
    </>
  )
}
