import './search.css';

export default function Dropdown({ query, results, latency, isLoading, onSelectCity }) {
  if (!query) return null;

  if (isLoading && results.length === 0) {
    return (
      <div className="dropdown-container">
        <div className="dropdown-message">Searching...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="dropdown-container">
        <div className="dropdown-message">No cities found for "{query}".</div>
      </div>
    );
  }

  // Highlights the prefix that matches the user's keystrokes
  const renderHighlightedText = (text, matchStr) => {
    if (!matchStr) return text;
    const regex = new RegExp(`^(${matchStr})`, 'i');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // Helper to format C++ engine time:
  // - If < 1ms: Float with 2 decimal places (e.g. 0.04ms)
  // - If >= 1ms: Round to nearest integer (e.g. 2ms)
  const formatEngineTime = (engineVal) => {
    if (engineVal === null || engineVal === undefined) return '<0.01ms';
    const num = parseFloat(engineVal);
    if (isNaN(num)) return '<0.01ms';

    if (num <= 0) {
      return '<0.01ms';
    } else if (num < 1) {
      return `${num.toFixed(2)}ms`;
    } else {
      return `${Math.round(num)}ms`;
    }
  };

  return (
    <div className="dropdown-container">
      {results.map((city) => (
        <div 
          key={city.geonameid} 
          className="dropdown-item"
          onClick={() => onSelectCity && onSelectCity(city.geonameid)}
        >
          {renderHighlightedText(city.name, query)}
          <span className="city-metadata">
            {city.countryCode} • {city.population.toLocaleString()} pop
          </span>
        </div>
      ))}
      
      {latency && (
        <div className="latency-display">
          {typeof latency === 'object' ? (
            latency.isCacheHit ? (
              <span>⚡ <strong>0ms</strong> (In-Memory LRU Cache)</span>
            ) : (
              <span>
                ⚡ C++ Engine: <strong>{formatEngineTime(latency.engine)}</strong> • Network RTT: <strong>~{latency.roundtrip}ms</strong>
              </span>
            )
          ) : (
            <span>
              ~{parseFloat(latency) < 1 ? `${parseFloat(latency).toFixed(2)}ms` : `${Math.round(parseFloat(latency))}ms`} processing time
            </span>
          )}
        </div>
      )}
    </div>
  );
}