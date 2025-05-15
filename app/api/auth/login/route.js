import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        console.log('🔄 Starting login process...');
        
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            console.log('❌ Missing email or password');
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log('🔍 Attempting to connect to database...');
        await dbConnect();
        console.log('✅ Database connection established');

        console.log('🔍 Searching for user with email:', email);
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ User not found');
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('🔑 Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('✅ Password verified successfully');

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ Login successful for user:', email);
        
        const response = NextResponse.json(
            { message: 'Login successful', token },
            { status: 200 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;
    } catch (error) {
        console.error('❌ Login error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { error: 'Unable to connect to database. Please check your database connection.' },
                { status: 503 }
            );
        }

        // Handle DNS resolution errors
        if (error.code === 'querySrv') {
            return NextResponse.json(
                { error: 'Database DNS resolution failed. Please check your MongoDB URI.' },
                { status: 503 }
            );
        }

        if (error.name === 'MongoNetworkError') {
            return NextResponse.json(
                { error: 'Database connection error. Please try again later.' },
                { status: 503 }
            );
        }
        
        if (error.name === 'MongoServerError') {
            return NextResponse.json(
                { error: 'Database server error. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { 
                error: 'An error occurred during login',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}