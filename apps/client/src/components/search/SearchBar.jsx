import './search.css';

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className='main-search-bar-wrapper'>
      <div className="search-bar-wrapper">
        <input
          className="search-input"
          type="text"
          placeholder="Search global cities..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        <button 
          type="button" 
          className="search-submit-btn"
          onClick={() => onSearch && onSearch()}
        >
          <svg 
            className="search-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>
      </div>
      
      <div className="index-counter">
        <span className="index-dot"></span>
          Total 2,34,912 cities indexed in native memory
      </div>
    </div>
  );
}