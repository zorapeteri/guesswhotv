import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix"
import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react"
import { BASE_TITLE } from "./helpers/title"
import errors from "./constants/errors"
import errorCss from "~/styles/error.scss?url"

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: errorCss,
  },
]

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
    title: BASE_TITLE,
    viewport: "width=device-width, initial-scale=1",
  },
]

function App() {
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
        <script
          async
          defer
          src="https://scripts.simpleanalyticscdn.com/latest.js"
        ></script>
        <noscript>
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>
      </body>
    </html>
  )
}

export default withSentry(App)

export function ErrorBoundary() {
  const routeError = useRouteError() as Error
  const isRouteError = isRouteErrorResponse(routeError)
  const error = isRouteError
    ? errors[routeError.data as keyof typeof errors] || errors.unknown
    : errors.unknown
  const { img, heading, description } = error
  captureRemixErrorBoundaryError(error)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="error">
        <Link to="/">
          <img
            className="logo"
            src="/images/logo.png"
            alt="Guess Who TV logo"
          />
        </Link>
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
