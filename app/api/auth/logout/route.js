import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request) {
    console.log('Logout POST endpoint called');
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the token cookie using the serialize function
    const cookieString = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
    });
    
    response.headers.set('Set-Cookie', cookieString);
    return response;
}

export async function GET(request) {
    console.log('Logout GET endpoint called');
    
    // Check if we should redirect after logout
    const { searchParams } = new URL(request.url);
    const shouldRedirect = searchParams.get('redirect') === 'true';
    
    // Clear the token cookie
    const cookieString = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
    });
    
    let response;
    if (shouldRedirect) {
        // Redirect to login page
        response = NextResponse.redirect(new URL('/login', request.url));
    } else {
        response = NextResponse.json({ message: 'Logged out successfully' });
    }
    
    response.headers.set('Set-Cookie', cookieString);
    return response;
} 