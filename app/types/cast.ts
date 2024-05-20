import type { Country, Image, Link } from "./shared"

export type Cast = {
  main: CastMember[]
  seasons: {
    [number: string | number]: CastMember[]
  }
}

export type CastMember = {
  person: Person
  character: Character
  self: boolean
  voice: boolean
}

export type Character = {
  id: number
  url: string
  name: string
  image: Image | null
  _links: Links
}

export type Links = {
  self: Link
}

export type Person = {
  id: number
  url: string
  name: string
  country: Country | null
  birthday: string | null
  deathday: string | null
  image: Image
  updated: number
  _links: Links
}
