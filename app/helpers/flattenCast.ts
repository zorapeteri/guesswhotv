import type { CastMember } from '~/types/cast'
import type { FullCast } from './getFullCast'

export function flattenCast(cast: FullCast): CastMember[] {
  return [...cast.main, ...Object.values(cast.seasons).flat()]
}
