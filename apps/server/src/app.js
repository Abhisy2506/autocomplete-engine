import express from 'express';
import cors from 'cors';
import { City } from '@autocomplete/database';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// REST Endpoint: MongoDB-based prefix search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const limit = parseInt(req.query.limit, 10) || 5;

  const startHrTime = process.hrtime.bigint();

  try {
    // Escape special regex characters in query string
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // MongoDB prefix regex search sorted by descending population
    const results = await City.find(
      { name: { $regex: `^${escapedQuery}`, $options: 'i' } },
      'geonameid name countryCode population'
    )
      .sort({ population: -1 })
      .limit(limit)
      .lean();

    const endHrTime = process.hrtime.bigint();
    const latencyMicros = Number(endHrTime - startHrTime) / 1000;
    const latencyMs = (latencyMicros / 1000).toFixed(3);

    // Diagnostic header showing the database lookup latency
    res.setHeader('X-Server-Latency-Ms', latencyMs);

    return res.json(results);
  } catch (error) {
    console.error('Database search failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// REST Endpoint: City Detail by geonameid
app.get('/api/city/:geonameid', async (req, res) => {
  try {
    const geonameid = parseInt(req.params.geonameid, 10);
    if (isNaN(geonameid)) {
      return res.status(400).json({ error: 'Invalid geonameid' });
    }

    // Atomically increment search frequency
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