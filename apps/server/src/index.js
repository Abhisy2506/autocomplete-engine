import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import dbConnect  from  '../../../packages/database/src/db.js' ;
import {initEngine} from '@autocomplete/native-engine'
import City from "../../../packages/database/src/models/City.js"
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnect();

    console.log('Fetching cities from MongoDB to hydrate C++ Engine...');
    const startTime = Date.now();
    
    const cities = await City.find({}, 'geonameid name countryCode population').lean();
    console.log(`Fetched ${cities.length} cities in ${Date.now() - startTime}ms.`);

    console.log('Ingesting records into C++ Radix Tree & BK-Tree...');
    const engineStart = Date.now();
    const result = initEngine(cities);
    console.log(`C++ Engine Initialized successfully in ${Date.now() - engineStart}ms:`, result);
    
    app.listen(PORT, () => {
      console.log(`Backend server is orchestrating on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();