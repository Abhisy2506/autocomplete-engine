import mongoose from "mongoose";

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is missing!');
    }

    await mongoose.connect(process.env.MONGO_URI, {dbName: process.env.DB_NAME});
    console.log('MongoDB Connected Successfully to Autocomplete DB');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default dbConnect;