import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, V2_MetaFunction } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'
import { BASE_TITLE } from './helpers/title'
import errors from './constants/errors'
import errorCss from '~/styles/error.css'

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [{ rel: 'stylesheet', href: cssBundleHref }]
    : [
        {
          rel: 'stylesheet',
          href: errorCss,
        },
      ]),
]

export const meta: V2_MetaFunction = () => [
  {
    charset: 'utf-8',
    title: BASE_TITLE,
    viewport: 'width=device-width, initial-scale=1',
  },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const routeError = useRouteError() as Error
  const error = errors[routeError.message] || errors.unknown
  const { img, heading, description } = error
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="error">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...img} />
        <h1>{heading}</h1>
        <p>{description}</p>
        <Link to="/">go home</Link>
        <Scripts />
      </body>
    </html>
  )
}
