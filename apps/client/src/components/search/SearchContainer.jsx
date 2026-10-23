import { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import useLRUCache from '../../hooks/useLRUCache';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';
import Logo from './Logo';
import './search.css';
import CityDetailModal from '../modal/CityDetailModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function SearchContainer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [latency, setLatency] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const debouncedQuery = useDebounce(query, 200); 
  const cache = useLRUCache(100);

  useEffect(() => {
    window.__LRU_CACHE__ = cache;
  }, [cache]);

  useEffect(() => {
    // Clear results if input is empty
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLatency(null);
      setIsLoading(false);
      return;
    }

    // 1. Check LRU Cache first (Zero-latency hit)
    if (cache.has(debouncedQuery)) {
      setResults(cache.get(debouncedQuery));
      setLatency(0);
      setIsLoading(false);
      return;
    }

    // 2. Fetch from backend if not in cache
    const fetchResults = async () => {
      setIsLoading(true);
      const startTime = performance.now();

      try {
        const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Round latency to nearest integer
        const serverLatency = response.headers.get('X-Server-Latency-Ms');
        const processingTime = serverLatency 
          ? Math.round(parseFloat(serverLatency)) 
          : Math.round(performance.now() - startTime);

        // Update state
        setResults(data);
        setLatency(processingTime);

        // Save to Cache
        cache.put(debouncedQuery, data);

      } catch (error) {
        console.error("Failed to fetch cities:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

  }, [debouncedQuery]);

  useEffect(() => {
    if (query !== debouncedQuery && query.trim()) {
      setIsLoading(true);
    }
  }, [query, debouncedQuery]);

  const handleSelectCity = async (geonameid) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE}/api/city/${geonameid}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch city details: ${res.status}`);
      }
      const data = await res.json();
      setSelectedCity(data);
    } catch (err) {
      console.error('Failed to load city details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="search-container">
      <Logo />
      <SearchBar value={query} onChange={setQuery} />
      <Dropdown 
        query={query} 
        results={results} 
        latency={latency} 
        isLoading={isLoading} 
        onSelectCity={handleSelectCity}
      />
      <CityDetailModal 
        city={selectedCity} 
        loading={isLoadingDetails} 
        onClose={() => setSelectedCity(null)} 
      />
    </div>
  );
}