export function classname(...args: any[]) {
  return { className: args.filter(Boolean).join(' ') }
}
