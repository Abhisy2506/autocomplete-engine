import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from './models/City.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Cloud...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is undefined. Check your root .env file path!');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {dbName: process.env.DB_NAME});
    console.log('Connected successfully!');

    console.log('Clearing old data...');
    await City.deleteMany({});
    
    const filePath = path.join(__dirname, '../raw-data/cities500.txt');
    const fileStream = fs.createReadStream(filePath);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let batch = [];
    let count = 0;
    const BATCH_SIZE = 1000; // I am uploading in chunks to reduce sudden server load

    console.log('Parsing cities15000.txt and uploading in batches...');

    for await (const line of rl) {
      const columns = line.split('\t');
      
      const cityData = {
        geonameid: parseInt(columns[0], 10),
        name: columns[1], // ASCII Nme
        countryCode: columns[8], // Country Code
        population: parseInt(columns[14], 10) || 0, // Popultion column
        location: {
          type: 'Point',
          coordinates: [parseFloat(columns[5]), parseFloat(columns[4])] // [longitude, latitude]
        }
      };

      batch.push(cityData);

      if (batch.length >= BATCH_SIZE) {
        await City.insertMany(batch);
        count += batch.length;
        console.log(`Uploaded ${count} cities...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await City.insertMany(batch);
      count += batch.length;
    }

    console.log(`\nSuccess! Total cities uploaded: ${count}`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();