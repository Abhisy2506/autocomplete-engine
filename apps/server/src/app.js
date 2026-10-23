import express from 'express';
import cors from 'cors';
import { search } from '@autocomplete/native-engine';
import {City} from "@autocomplete/database"

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS policy blocked access from: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'OPTIONS'],
    exposedHeaders: ['X-Server-Latency-Ms']
  })
);

app.use(express.json());

// REST Endpoint
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const limit = parseInt(req.query.limit, 10) || 5;

  const startHrTime = process.hrtime.bigint();

  // Call C++ Native Engine (Radix Tree prefix search + BK-Tree fuzzy fallback)
  const results = search(query.trim(), limit);

  const endHrTime = process.hrtime.bigint();
  const latencyMicros = Number(endHrTime - startHrTime) / 1000;
  const latencyMs = (latencyMicros / 1000).toFixed(3);

  // Set diagnostic header for frontend UI latency badge
  res.setHeader('X-Server-Latency-Ms', latencyMs);

  return res.json(results);

});


app.get('/api/city/:geonameid', async (req, res) => {
  try {
    const geonameid = parseInt(req.params.geonameid, 10);
    if (isNaN(geonameid)) {
      return res.status(400).json({ error: 'Invalid geonameid' });
    }

    // Optional: atomically increment searchFrequency
    const city = await City.findOneAndUpdate(
      { geonameid },
      { $inc: { searchFrequency: 1 } },
      { new: true }
    ).lean();

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.json(city);
  } catch (error) {
    console.error('Error fetching city details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;