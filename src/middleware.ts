import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { last } from 'lodash'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/', '/invite(.*)'])

export default clerkMiddleware((auth, req) => {
  if (!auth().userId && isProtectedRoute(req)) {
    // Add custom logic to run before redirecting
    let query = ''

    if (req.url.includes('invite')) {
      const roomId = last(req.url.split('/') || '')
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
