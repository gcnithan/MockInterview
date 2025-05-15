import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        mongoose.set('strictQuery', true);
        
        try {
            cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            });
        } catch (error) {
            cached.promise = null;
            if (error.code === 'ECONNREFUSED') {
                console.error('❌ Unable to connect to database. Please check your database connection and ensure MongoDB is running. Also verify your MONGODB_URI and that your IP is whitelisted in MongoDB Atlas.');
            } else if (error.code === 'querySrv' || (error.message && error.message.includes('getaddrinfo ENOTFOUND'))) {
                console.error('❌ Database DNS resolution failed. Please check your MongoDB URI, internet connection, and DNS settings.');
                console.error('Try running: nslookup <your-atlas-cluster-host> in your terminal to test DNS resolution.');
            } else if (error.name === 'MongoNetworkError') {
                console.error('❌ Database network error. Please check your internet connection and firewall settings.');
            } else if (error.name === 'MongoServerError') {
                console.error('❌ Database server error. Please try again later or check your MongoDB Atlas cluster status.');
            } else {
                console.error('❌ MongoDB connection error:', error);
            }
            throw error;
        }
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default dbConnect;