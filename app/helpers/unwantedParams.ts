const unwantedParams = ['co']

export function hasUnwantedParams(href: string) {
  const url = new URL(href)
  return unwantedParams.some((param) => url.searchParams.has(param))
}

export function clearUnwantedParams(href: string) {
  const url = new URL(href)
  unwantedParams.forEach((param) => url.searchParams.delete(param))
  return url.pathname
}
