import { redirect } from 'next/navigation'

// Spotlight is now the default fit detail at /fits/[id].
// This route is kept only to redirect any old links/bookmarks.
export default function SpotlightRedirect({ params }: { params: { id: string } }) {
  redirect(`/fits/${params.id}`)
}
