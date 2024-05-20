import type { Link, Image, Network } from './shared'

export type ShowResult = {
  score: number
  show: Show
}

export type Show = {
  id: number
  url: string
  name: string
  type: string
  language: string
  genres: string[]
  status: string
  runtime: number | null
  averageRuntime: number | null
  premiered: string | null
  ended: string | null
  officialSite: null | string
  schedule: Schedule
  rating: Rating
  weight: number
  network: Network
  webChannel: null
  dvdCountry: null
  externals: Externals
  image: Image | null
  summary: null | string
  updated: number
  _links: Links
}

export type Links = {
  self: Link
  previousepisode?: Link
}

export type Externals = {
  tvrage: null
  thetvdb: number | null
  imdb: null | string
}

export type Rating = {
  average: number | null
}

export type Schedule = {
  time: string
  days: string[]
}
