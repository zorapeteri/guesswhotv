import type { CastResult } from '~/types/cast'
import type { FullCast } from './getFullCast'

export function flattenCast(cast: FullCast): CastResult[] {
  return [...cast.main, ...Object.values(cast.seasons).flat()]
}
