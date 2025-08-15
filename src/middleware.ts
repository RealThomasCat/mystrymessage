import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt"; // Used to get the JWT token

// Middleware function
export async function middleware(request: NextRequest) {
    // Get token and current URL
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // If user has token and is trying to access auth pages, redirect to dashboard
    if (
        token &&
        (url.pathname.startsWith("/sign-in") ||
            url.pathname.startsWith("/sign-up") ||
            url.pathname.startsWith("/verify") ||
            url.pathname.startsWith("/"))
    ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not authenticated and is trying to access dashboard, redirect to sign-in
    if (!token && url.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }
}

// This defines the paths where the middleware will be applied
export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/dashboard/:path*",
        "/verify/:path*",
    ],
};
