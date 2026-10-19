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
      
      {latency !== null && (
        <div className="latency-display">
          ~{latency}ms server processing time
        </div>
      )}
    </div>
  );
}