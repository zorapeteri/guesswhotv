import type { CastMember, Cast } from "~/types/cast"

export function flattenCast(cast: Cast): CastMember[] {
  return [...cast.main, ...Object.values(cast.seasons).flat()]
}
