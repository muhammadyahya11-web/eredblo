import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clearDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ered-bloo';
    console.log(`Connecting to ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    
    console.log('Connected. Dropping database...');
    await mongoose.connection.db.dropDatabase();
    
    console.log('Database successfully cleared.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

clearDB();
