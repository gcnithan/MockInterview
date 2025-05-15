import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log('Attempting to connect to MongoDB Atlas for seeding...');
        await dbConnect();
        console.log('MongoDB Atlas connected successfully for seeding');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create users
        const users = [
            {
                email: 'admin@example.com',
                password: await bcrypt.hash('Admin@123', 10),
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'user@example.com',
                password: await bcrypt.hash('User@123', 10),
                firstName: 'Regular',
                lastName: 'User',
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Insert users
        const createdUsers = await User.insertMany(users);
        console.log('Created users:', createdUsers.map(u => u.email));

        return NextResponse.json({
            message: 'Database seeded successfully',
            users: createdUsers.map(u => ({
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role
            }))
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to seed database',
                details: error.message
            },
            { status: 500 }
        );
    }
} 