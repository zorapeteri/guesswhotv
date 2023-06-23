export function logErrorOnTelegram(request: Request) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
  if (!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)) return
  const errorMessage = [
    request.url,
    request.headers.get('User-Agent') || 'no user agent',
  ].join('%0A%0A')
  fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${errorMessage}`
  )
}
