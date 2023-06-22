import { type ActionArgs, redirect } from '@remix-run/node'
import maxCharacterCount from '~/constants/maxCharacterCount'
import minCharacterCount from '~/constants/minCharacterCount'

export async function action({ request }: ActionArgs) {
  const body = await request.formData()
  const referrer = request.headers.get('referer')
  if (!referrer) {
    return redirect('/')
  }
  const url = new URL(referrer)
  const characters = Object.keys(Object.fromEntries(body.entries()))
  if (characters.length < minCharacterCount) {
    url.searchParams.set('error', 'toofew')
    return redirect(url.href)
  }
  if (characters.length > maxCharacterCount) {
    url.searchParams.set('error', 'toomany')
    return redirect(url.href)
  }
  url.href = url.href.replace('cast-ssr', 'show').replace('cast', 'show')
  url.searchParams.set('cs', btoa(characters.join(',')))
  return redirect(url.href)
}
