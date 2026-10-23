import test from 'node:test';
import assert from 'node:assert/strict';
import { initEngine, search } from './index.js';

const mockCities = [
  { geonameid: 1, name: 'Tokyo', countryCode: 'JP', population: 37400068 },
  { geonameid: 2, name: 'Delhi', countryCode: 'IN', population: 29399141 },
  { geonameid: 3, name: 'Paris', countryCode: 'FR', population: 2161000 },
  { geonameid: 4, name: 'London', countryCode: 'GB', population: 8982000 },
  { geonameid: 5, name: 'San Francisco', countryCode: 'US', population: 873965 },
  { geonameid: 6, name: 'San Jose', countryCode: 'US', population: 1013240 },
  { geonameid: 7, name: 'San Diego', countryCode: 'US', population: 1386932 },
  { geonameid: 8, name: 'Santiago', countryCode: 'CL', population: 6857000 },
  { geonameid: 9, name: 'Sandakan', countryCode: 'MY', population: 396290 }
];

test('Engine Ingestion & Initialization', () => {
  const result = initEngine(mockCities);
  assert.equal(result.success, true);
  assert.equal(result.indexedCities, mockCities.length);
});

test('Prefix Search: Returns matches sorted by descending population (Top-K)', () => {
  const results = search('san', 5);
  assert.ok(results.length > 0);
  
  // Verify order: Santiago (6.8M) > San Diego (1.38M) > San Jose (1.01M) > San Francisco (873k)
  assert.equal(results[0].name, 'Santiago');
  assert.equal(results[1].name, 'San Diego');
  assert.equal(results[2].name, 'San Jose');

  // Verify bounded limit
  const limited = search('san', 2);
  assert.equal(limited.length, 2);
});

test('Radix Tree Edge Splitting: Handles deep branching and shared prefixes', () => {
  const tokyoMatch = search('tok', 5);
  assert.equal(tokyoMatch.length, 1);
  assert.equal(tokyoMatch[0].name, 'Tokyo');

  const londonMatch = search('lon', 5);
  assert.equal(londonMatch.length, 1);
  assert.equal(londonMatch[0].name, 'London');
});

test('Case Insensitivity: Matches both uppercase and lowercase queries', () => {
  const lower = search('paris', 5);
  const upper = search('PARIS', 5);
  const mixed = search('PaRiS', 5);

  assert.equal(lower[0].name, 'Paris');
  assert.equal(upper[0].name, 'Paris');
  assert.equal(mixed[0].name, 'Paris');
});

test('BK-Tree Fuzzy Fallback: Corrects typos with edit distance <= 2', () => {
  // "londn" (missing 'o') -> London
  const fuzzyLondon = search('londn', 5);
  assert.ok(fuzzyLondon.length > 0);
  assert.equal(fuzzyLondon[0].name, 'London');

  // "pariss" (extra 's') -> Paris
  const fuzzyParis = search('pariss', 5);
  assert.ok(fuzzyParis.length > 0);
  assert.equal(fuzzyParis[0].name, 'Paris');
});

test('Edge Cases: Random string and empty queries do not crash engine', () => {
  const noMatch = search('zzzzzzzzzzzzz_nonexistent', 5);
  assert.deepEqual(noMatch, []);

  const empty = search('', 5);
  assert.deepEqual(empty, []);
});