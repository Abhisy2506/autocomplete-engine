import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load the compiled native binary from node-gyp build directory
const nativeEngine = require(path.join(__dirname, 'build/Release/native_engine.node'));

export const initEngine = (cities) => nativeEngine.initEngine(cities);

export const search = (query, limit = 5) => {
  const parsedLimit = Number(limit) || 5;
  const results = nativeEngine.search(query, parsedLimit);
  return results ? results.slice(0, parsedLimit) : [];
};

export default {
  initEngine,
  search
};