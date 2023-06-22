import type { LinksFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import styles from '~/styles/404.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export default function FourOhFour() {
  return (
    <>
      <img
        src="/images/vincent.gif"
        alt="vincent vega (john travolta) from pulp fiction looking around, confused"
      />
      <h1>404</h1>
      <p>looks like this one is a dead end:/</p>
      <Link to="/">go home</Link>
    </>
  )
}
