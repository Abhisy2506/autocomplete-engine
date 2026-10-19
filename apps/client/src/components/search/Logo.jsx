import './search.css';

export default function Logo() {
  return (
    <div className="brand-logo-container">
      {/* Dynamic Pin + Fast-forward Icon */}
      <svg
        className="brand-icon"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" fill="#fff0f3" />
        
        <path
          d="M24 8C17.3726 8 12 13.3726 12 20C12 28.5 24 38 24 38C24 38 36 28.5 36 20C36 13.3726 30.6274 8 24 8Z"
          fill="url(#brand-gradient)"
        />
        
        <path
          d="M24.5 14L20 21H24L23.5 26L28 19H24L24.5 14Z"
          fill="#ffffff"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient
            id="brand-gradient"
            x1="12"
            y1="8"
            x2="36"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ff385c" />
            <stop offset="1" stopColor="#d70466" />
          </linearGradient>
        </defs>
      </svg>

      <h1 className="brand-title">
        Radix<span className="brand-title-accent">City</span>
      </h1>
      
      <span className="brand-badge">C++ Native Engine</span>
    </div>
  );
}