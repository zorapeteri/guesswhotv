import maxCharacterCount from "~/constants/maxCharacterCount"
import minCharacterCount from "~/constants/minCharacterCount"
import { Cast } from "~/types/cast"

export default function defaultCharacterSet(cast: Cast) {
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
