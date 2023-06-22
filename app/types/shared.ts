export type Country = {
  name: string
  code: string
  timezone: string
}

export type Image = {
  medium: string
  original: string
}

export type Link = {
  href: string
}

export type Network = {
  id: number
  name: string
  country: Country
  officialSite: null | string
}

export type ID = string | number

export type WithStatus = {
  status: number
}
