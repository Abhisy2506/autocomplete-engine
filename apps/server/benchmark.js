// apps/server/benchmark.js
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dbConnect, City } from '@autocomplete/database';
import { initEngine, search } from '@autocomplete/native-engine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SAMPLE_QUERIES = [
  'tok', 'new', 'lon', 'par', 'san', 'ber', 'mum', 'del', 'ban', 'seo',
  'toky', 'new y', 'lond', 'pari', 'san f', 'berl', 'mumb', 'delh', 'bang', 'seou',
  'tokyp', 'londn', 'pariss', 'mumbaii', 'berlinn' // Includes BK-Tree fuzzy queries
];

const NUM_ITERATIONS = 1000;

function calculatePercentiles(latencies) {
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const sum = latencies.reduce((acc, v) => acc + v, 0);
  const avg = sum / latencies.length;
  return { avg, p50, p95, p99 };
}

async function runBenchmark() {
  console.log('🚀 Initializing Benchmark Suite...');
  await dbConnect();

  console.log('📥 Fetching dataset from MongoDB to hydrate C++ Engine...');
  const cities = await City.find({}, 'geonameid name countryCode population').lean();
  console.log(`Loaded ${cities.length} cities. Hydrating native heap...`);
  initEngine(cities);
  console.log('✅ Native Engine hydrated.\n');

  // Generate 1,000 test queries
  const testSet = Array.from({ length: NUM_ITERATIONS }, () => 
    SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)]
  );

  // --------------------------------------------------------------------------
  // Benchmark 1: Native C++ Engine (Radix + BK-Tree)
  // --------------------------------------------------------------------------
  console.log(`⚡ Running ${NUM_ITERATIONS} queries on C++ Native Engine...`);
  const nativeLatencies = [];
  const startNativeTotal = process.hrtime.bigint();

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    const q = testSet[i];
    const t0 = process.hrtime.bigint();
    search(q, 5);
    const t1 = process.hrtime.bigint();
    nativeLatencies.push(Number(t1 - t0) / 1e6); // in ms
  }

  const endNativeTotal = process.hrtime.bigint();
  const totalNativeSec = Number(endNativeTotal - startNativeTotal) / 1e9;
  const nativeOpsSec = (NUM_ITERATIONS / totalNativeSec).toFixed(0);
  const nativeStats = calculatePercentiles(nativeLatencies);

  // --------------------------------------------------------------------------
  // Benchmark 2: MongoDB In-Memory Regex
  // --------------------------------------------------------------------------
  console.log(`🔍 Running ${NUM_ITERATIONS} queries on MongoDB Regex (/^q/i)...`);
  const mongoLatencies = [];
  const startMongoTotal = process.hrtime.bigint();

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    const q = testSet[i];
    const t0 = process.hrtime.bigint();
    await City.find({ name: new RegExp(`^${q}`, 'i') })
      .sort({ population: -1 })
      .limit(5)
      .lean();
    const t1 = process.hrtime.bigint();
    mongoLatencies.push(Number(t1 - t0) / 1e6); // in ms
  }

  const endMongoTotal = process.hrtime.bigint();
  const totalMongoSec = Number(endMongoTotal - startMongoTotal) / 1e9;
  const mongoOpsSec = (NUM_ITERATIONS / totalMongoSec).toFixed(0);
  const mongoStats = calculatePercentiles(mongoLatencies);

  // --------------------------------------------------------------------------
  // Display Results
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('                BENCHMARK RESULTS SUMMARY                      ');
  console.log('===============================================================');
  console.table({
    'C++ Engine (Radix + BK-Tree)': {
      'Avg Latency': `${nativeStats.avg.toFixed(3)} ms`,
      'p50': `${nativeStats.p50.toFixed(3)} ms`,
      'p95': `${nativeStats.p95.toFixed(3)} ms`,
      'p99': `${nativeStats.p99.toFixed(3)} ms`,
      'Throughput (Ops/sec)': `${Number(nativeOpsSec).toLocaleString()} req/s`
    },
    'MongoDB Regex ($regex + sort)': {
      'Avg Latency': `${mongoStats.avg.toFixed(3)} ms`,
      'p50': `${mongoStats.p50.toFixed(3)} ms`,
      'p95': `${mongoStats.p95.toFixed(3)} ms`,
      'p99': `${mongoStats.p99.toFixed(3)} ms`,
      'Throughput (Ops/sec)': `${Number(mongoOpsSec).toLocaleString()} req/s`
    }
  });

  const speedup = (mongoStats.avg / nativeStats.avg).toFixed(1);
  console.log(`🔥 The C++ Native Engine is ~${speedup}x faster on average!`);
  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});