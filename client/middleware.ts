import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - static (static files)
     * - public files (e.g., .png, .css)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
};
