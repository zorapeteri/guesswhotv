export default (url: URL) =>
  !(url.hostname.startsWith("nojs.") || url.hostname.startsWith("noscript."))
