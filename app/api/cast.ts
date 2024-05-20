import _ from "lodash";
import apiPath from "~/constants/apiPath";
import forbiddenCharacterNames from "~/constants/forbiddenCharacterNames";
import type { CastMember } from "~/types/cast";
import type { ID } from "~/types/shared";

export async function getCast(showId: ID): Promise<CastMember[]> {
  return fetch(`${apiPath}/shows/${showId}/cast`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 404) {
        throw new Response("404", { status: 404 });
      }
      return _.uniqBy(
        res as CastMember[],
        ({ character }) => character.name
      ).filter(
        ({ character }) => !forbiddenCharacterNames.includes(character.name)
      );
    });
}
