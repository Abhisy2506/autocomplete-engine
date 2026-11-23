import './layout.css';

export default function Header({ 
  onOpenAbout, 
  onOpenHowItWorks, 
  onOpenFlowchart,
  theme,
  onToggleTheme 
}) {
  return (
    <header className="app-header">
      {/* Top Left Navigation Buttons */}
      <div className="header-left">
        <button className="about-button liquid-glass" onClick={onOpenAbout}>
          About
        </button>
        <button className="about-button liquid-glass" onClick={onOpenHowItWorks}>
          How It Works
        </button>
      </div>

      {/* Top Right Controls (Architecture + Theme Switcher) */}
      <div className="header-right">
        <button className="about-button liquid-glass" onClick={onOpenFlowchart}>
          Architecture Flow ↗
        </button>

        <button 
          className="about-button theme-toggle-btn liquid-glass" 
          onClick={onToggleTheme}
          aria-label="Toggle light and dark theme"
        >
          {theme === 'dark' ? '☀️️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}