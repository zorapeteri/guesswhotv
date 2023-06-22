export const BASE_TITLE = 'guesswhotv'
const title = (s?: string | null) =>
  s ? `${s.toLowerCase()} | ${BASE_TITLE}` : BASE_TITLE
export default title
