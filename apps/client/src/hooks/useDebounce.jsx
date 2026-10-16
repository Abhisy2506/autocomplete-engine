import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 200) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // user is still typing so clean up
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}