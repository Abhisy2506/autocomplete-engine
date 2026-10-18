import React, { useState, useEffect } from 'react';
import './modal.css';
import './cityModal.css';

export default function CityDetailModal({ city, loading, onClose }) {
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (city) {
      setIsMapLoading(true);
    }
  }, [city?.geonameid]);

  if (!city && !loading) return null;

  // MongoDB GeoJSON coordinates: [longitude, latitude]
  const [lng, lat] = city?.location?.coordinates || [0, 0];
  const searchQuery = city ? encodeURIComponent(`${city.name}, ${city.countryCode}`) : '';

  // Google Maps Full Boundary search link
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  // Google Map Satellite Aerial View
  const embedMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=11&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content city-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="loading-state" style={{ padding: '40px 20px' }}>
            <div className="spinner"></div>
            <span>Hydrating record from MongoDB...</span>
          </div>
        ) : (
          <>
            {/* Top Aerial / Satellite View Banner */}
            <div className="city-hero-image-wrapper">
              {isMapLoading && (
                <div 
                  className="loading-state" 
                  style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'var(--card-bg, #1e1f22)' }}
                >
                  <div className="spinner"></div>
                  <span style={{ fontSize: '12px' }}>Loading satellite view...</span>
                </div>
              )}

              <iframe
                title={`Satellite view of ${city.name}`}
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'contrast(1.05) brightness(0.95)',
                  display: 'block'
                }}
                loading="lazy"
                onLoad={() => setIsMapLoading(false)}
              />

              <div className="city-hero-gradient" style={{ pointerEvents: 'none' }}></div>
              <span className="city-hero-tag" style={{ zIndex: 2, pointerEvents: 'none' }}>
                🛰️ {city.countryCode} • Satellite
              </span>
            </div>

            <div className="city-modal-body">
              {/* Header: Name, Country, and MongoDB tag */}
              <div className="city-header-row">
                <div className="city-title-section">
                  <h2 className="city-name">{city.name}</h2>
                  <div className="city-subtext">
                    Country: <strong>{city.countryCode}</strong> • ID: <code>{city.geonameid}</code>
                  </div>
                </div>
                <span className="city-badge">MongoDB Record</span>
              </div>

              {/* Metrics Grid */}
              <div className="city-details-grid">
                <div className="detail-row-card">
                  <span className="detail-label">Population</span>
                  <span className="detail-value">
                    {city.population ? Number(city.population).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="detail-row-card">
                  <span className="detail-label">Coordinates</span>
                  <span className="detail-value mono">
                    {typeof lat === 'number' ? lat.toFixed(4) : lat}° N,{' '}
                    {typeof lng === 'number' ? lng.toFixed(4) : lng}° E
                  </span>
                </div>

                {city.searchFrequency !== undefined && (
                  <div className="detail-row-card">
                    <span className="detail-label">Search Queries Logged</span>
                    <span className="detail-value">{city.searchFrequency}</span>
                  </div>
                )}
              </div>

              {/* Actions: View Map & Close */}
              <div className="city-modal-actions">
                <a 
                  href={mapsExternalUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="maps-link-btn"
                >
                  📍 Highlight on Google Maps ↗
                </a>
                <button className="close-button" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}