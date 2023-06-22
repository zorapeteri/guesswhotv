import minCharacterCount from '~/constants/minCharacterCount'
import type { FullCast } from './getFullCast'
import maxCharacterCount from '~/constants/maxCharacterCount'

export default function defaultCharacterSet(cast: FullCast) {
  const characterSet = cast.main.slice(0, maxCharacterCount)
  if (characterSet.length < minCharacterCount) {
    Object.keys(cast.seasons).forEach((season) => {
      if (characterSet.length >= minCharacterCount) return
      characterSet.push(
        ...cast.seasons[season].slice(
          0,
          minCharacterCount - characterSet.length
        )
      )
    })
  }
  return characterSet
}
