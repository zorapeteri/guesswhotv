// ridiculous but no better solution

import { TypedResponse } from "@remix-run/node"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractLoaderResponse<T extends (args: any) => any> = Awaited<
  ReturnType<T>
> extends TypedResponse<infer U>
  ? U
  : never
