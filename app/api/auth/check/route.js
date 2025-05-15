import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
        
        // Connect to database
        await dbConnect();
        
        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
} 