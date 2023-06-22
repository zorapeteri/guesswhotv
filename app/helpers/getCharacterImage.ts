import type { CastMember } from '~/types/cast'

export function getCharacterImage(castMember: CastMember) {
  if (castMember.voice) {
    return castMember.character.image?.original
  }
  return (
    castMember.character.image?.original || castMember.person.image?.original
  )
}
