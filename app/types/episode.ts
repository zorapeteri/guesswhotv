import type { CastMember } from './cast'
import type { Image } from './shared'

export type Episode = {
  id: number
  url: string
  name: string
  season: number
  number: number
  type: string
  airdate: Date
  airtime: string
  airstamp: Date
  runtime: number
  rating: Rating
  image: Image
  summary: string
  _embedded: {
    guestcast: CastMember[]
  }
}

export type Rating = {
  average: number
}
