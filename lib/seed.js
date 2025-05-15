import dbConnect from './db';
import User from './models/User';

const seedUsers = [
    {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
    },
    {
        email: 'user@example.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user'
    }
];

async function seed() {
    try {
        await dbConnect();
        
        // Clear existing users
        await User.deleteMany({});
        
        // Create new users
        for (const user of seedUsers) {
            await User.create(user);
        }
        
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed(); 