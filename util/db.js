import mongoose from 'mongoose';

let isConnected = false;

export async function connect() {
  if (isConnected) return;
  
  const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MongoDB URI is not defined. Please set the NEXT_PUBLIC_MONGODB_URI environment variable.');
  }
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
}
