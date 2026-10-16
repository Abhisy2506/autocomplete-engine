import { useRef } from 'react';

export default function useLRUCache(capacity = 100) {
  const cacheRef = useRef(new Map());

  const get = (key) => {
    const cache = cacheRef.current;
    if (!cache.has(key)) return null;
    
    const value = cache.get(key);
    cache.delete(key);
    cache.set(key, value);
    
    return value;
  };

  const put = (key, value) => {
    const cache = cacheRef.current;
    
    if (cache.has(key)) {
      cache.delete(key);
    } 

    else if (cache.size >= capacity) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    cache.set(key, value);
  };

  const has = (key) => {
    return cacheRef.current.has(key);
  };

  const dump = () => {
    return Array.from(cacheRef.current.entries()).map(([prefix, cities]) => ({
      prefix,
      itemCount: cities.length,
      topCity: cities[0]?.name,
      results: cities
    }));
  };

  return { get, put, has, dump, raw: cacheRef.current };
}