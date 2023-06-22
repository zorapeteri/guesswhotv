import _ from 'lodash'
import apiPath from '~/constants/apiPath'
import forbiddenCharacterNames from '~/constants/forbiddenCharacterNames'
import type { CastMember } from '~/types/cast'
import type { ID } from '~/types/shared'

export async function getCast(showId: ID): Promise<CastMember[]> {
  return fetch(`${apiPath}/shows/${showId}/cast`)
    .then((res) => res.json())
    .then((res: CastMember[]) => {
      if ((res as any).status === 404) {
        throw new Error('404')
      }
      return _.uniqBy(res, ({ character }) => character.name).filter(
        ({ character }) => !forbiddenCharacterNames.includes(character.name)
      )
    })
}
