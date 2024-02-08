import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Define the segments to protect
  const protectedSegments = ['/dashboard', '/projects', '/company-affiliation'];

  // Check if the current path includes any of the protected segments
  const isProtectedPath = protectedSegments.some(segment => path.includes(segment));
  
  if (isProtectedPath) {
    const { supabase } = createClient(request);

    try {
      // Check the user's authentication status
      const { data: { session } } = await supabase.auth.getSession();

      // If the user is not authenticated, redirect to the login page
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Proceed with the request if the user is authenticated
      return NextResponse.next();

    } catch (e) {
      // Handle error
      return NextResponse.next();
    }
  }

  // Proceed with the request if the path is not protected
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match any route that includes the specified segments
    '/dashboard/:path*',
    '/projects/:path*',
    '/company-affiliation/:path*',
  ],
};
