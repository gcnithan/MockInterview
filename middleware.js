import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/api/auth/login', '/api/auth/logout', '/api/seed'];

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for API routes that don't need token verification
    if (pathname.startsWith('/api/') && publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('token');

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        const url = new URL('/', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    try {
        // Verify token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        await jwtVerify(token.value, secret);
        
        return NextResponse.next();
    } catch (error) {
        // If token is invalid, redirect to login
        const url = new URL('/', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};