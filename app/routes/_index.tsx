import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import stylesUrl from '~/styles/index.css'
import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, Form, Link, useNavigation } from '@remix-run/react'
import { searchShows } from '~/api/search'
import slug from 'slug'
import { debounce } from '~/helpers/debounce'
import { classname } from '~/helpers/classname'
import type { Show } from '~/types/show'
import title from '~/helpers/title'
import gameplayAlt from '~/constants/gameplayAlt'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
]

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: title(data?.query && `"${data?.query}"`) }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const origin = url.origin
  const query = url.searchParams.get('q')
  return json({
    shows: query ? await searchShows(query) : null,
    query,
    origin,
  })
}

const getHref = (show: Show) => {
  return `/show/${[slug(show.name), show.id].join('-')}`
}

export default function Index() {
  const {
    shows: showsFromLoader,
    query: queryFromLoader,
    origin,
  } = useLoaderData<typeof loader>()
  const formRef = useRef<HTMLFormElement>(null)
  const [query, setQuery] = useState(queryFromLoader || '')
  const [shows, setShows] = useState(showsFromLoader || [])
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()

  const searchShowsForQuery = useCallback((_query: string) => {
    searchShows(_query).then((res) => {
      setShows(res)
      setLoading(false)
    })
  }, [])

  const debouncedSearchShowsForQuery = useMemo(
    () => debounce(searchShowsForQuery, 300),
    [searchShowsForQuery]
  )

  useEffect(() => {
    if (!query) {
      setShows([])
    } else {
      if (!loading) setLoading(true)
      debouncedSearchShowsForQuery(query)
      window.history.replaceState(query, '', `${origin}?q=${query}`)
      document.title = title(`"${query}"`)
    }
  }, [query, origin, debouncedSearchShowsForQuery, loading])

  if (navigation.state === 'loading') {
    return <span className="navigationLoading">Loading...</span>
  }

  return (
    <div {...classname('wrapper', query && 'query')}>
      <div className="searchInputContainer">
        <Form method="get" ref={formRef}>
          <input
            type="text"
            name="q"
            value={query}
            autoFocus
            spellCheck="false"
            placeholder="search TV shows"
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>
      </div>
      {shows?.length ? (
        <div className="resultsContainer">
          {shows
            .sort(
              (a, b) =>
                Number(Boolean(b.show.image)) - Number(Boolean(a.show.image))
            )
            .map(({ show }) => {
              const img = show.image?.original
              const name = img
                ? show.name
                : show.premiered
                ? `${show.name} (${show.premiered!.slice(0, 4)})`
                : show.name
              return (
                <Link
                  key={show.id}
                  {...classname(
                    'resultCard',
                    !img && 'noImage',
                    show.name.length > 24 && 'longName'
                  )}
                  to={getHref(show)}
                  style={{
                    backgroundImage: img && `url(${img})`,
                  }}
                  data-name={name}
                >
                  {name}
                </Link>
              )
            })}
        </div>
      ) : (
        <>
          {!query && (
            <div className="hi">
              <img id="logo" src="/images/logo.png" alt="Guess Who TV logo" />
              <ol>
                <li>Find a friend (or enemy) to play with</li>
                <li>Pick a TV show</li>
                <li>Play Guess Who!</li>
              </ol>
              <img src="/images/gameplay.png" alt={gameplayAlt} />
            </div>
          )}
          {query && !loading && <span className="noResults">No results:/</span>}
        </>
      )}
      {!loading && (
        <footer>
          made with ♡ by{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/zorapeteri"
          >
            zora
          </a>
        </footer>
      )}
    </div>
  )
}
