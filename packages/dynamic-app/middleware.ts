import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwtDecode from 'jwt-decode';

const LOGIN_PATH   = "/login";
const DASHBOARD    = "/dashboard";
const FORM_BUILDER = "/form-builder";
const API_KEY      = process.env.AUTH_SERVICE_KEY!;
const ON_BOARDING = "/onboarding";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const url = (path: string) => new URL(path, origin);

  console.log("Middleware running for:", pathname, " and url:", url(pathname).toString(), " and method: ", req.method);

  // Grab the JWT session (or null if none)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Clone and augment headers
  const requestHeaders = new Headers(req.headers);
  if (token) {
    const jwtToken = token.jwtToken as string;
    const claims = jwtDecode<Record<string, any>>(jwtToken);
    let { sub: id, email, role, orgs, activeOrgId } = token as any;
    email = claims.email;
    const userPayload = JSON.stringify({ id, email, role, orgs, activeOrgId });
    const encoded = Buffer.from(userPayload).toString("base64");
    requestHeaders.set("x-user-info", encoded);
    requestHeaders.set('x-api-key', API_KEY); // Add API key to headers
    requestHeaders.set('Authorization',  `Bearer ${jwtToken}`); // Add JWT token to headers  
  }
 
  // 1) Protect dashboard & form-builder routes
  if (pathname.startsWith(DASHBOARD) || pathname.startsWith(FORM_BUILDER) || pathname.startsWith(ON_BOARDING)) {
    if (!token) {
      // Not signed in → send to login (preserve returnTo)
      const loginUrl = url(LOGIN_PATH);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 2) Protect all /admin/* pages
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // Not signed in → login
      const loginUrl = url(LOGIN_PATH);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string) || "";
    if (!["OWNER", "ADMIN"].includes(role)) {
      // Signed in but not high enough role → bounce to dashboard with an error flag
      const dashUrl = url(DASHBOARD);
      dashUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(dashUrl);
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 3) Everything else is public
  return NextResponse.next({
      request: { headers: requestHeaders },
    });
}

export const config = {
  matcher: [
    // only invoke middleware on these URL patterns
    "/dashboard/:path*",
    "/form-builder/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/auth/social-callback:path*",
    "/auth/verify-email:path*",
    "/onboarding/:path*",
    "/auth/email-verified:path*",
    "/api/billing/:path*",
    "/api/templates/:path*",
    "/api/forms/:path*",
    "/api/forms/designer/:path*",
  ],
};