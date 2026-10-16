import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import dbConnect from '../../../packages/database/src/db.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB successfully.');

    app.listen(PORT, () => {
      console.log(`Backend server is orchestrating on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();