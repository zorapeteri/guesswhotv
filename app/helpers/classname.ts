export function classname(
  ...args: (string | number | undefined | null | false)[]
) {
  return { className: args.filter(Boolean).join(" ") };
}
