import type { Image, Link, Network } from './shared'

export type Season = {
  id: number
  url: string
  number: number
  name: string
  episodeOrder: number
  premiereDate: string
  endDate: string
  network: Network
  webChannel: null
  image: Image
  summary: string
  _links: {
    self: Link
  }
}
