import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { includes, last, split } from 'lodash'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/', '/invite(.*)'])

export default clerkMiddleware((auth, req) => {
  console.log('Redirecting to sign-in page', req.url)
  if (!auth().userId && isProtectedRoute(req)) {
    console.log('Redirecting to sign-in page', req.url)
    // Add custom logic to run before redirecting
    let query = ''

    if (includes(req.url, 'invite')) {
      const roomId = last(split(req.url, '/') || '')
      query = `?prev=invite&roomId=${roomId}`
    }
    // Redirect to sign-in page
    return NextResponse.redirect(new URL(`/sign-in${query}`, req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
