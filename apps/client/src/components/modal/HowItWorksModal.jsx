import './modal.css';
import { useEffect } from 'react';

export default function HowItWorksModal({ onClose }) {

  useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
  
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content wide" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">How the Autocomplete Engine Works</h2>
        <div className="modal-body">
          <p>
            Every keystroke travels through a high-throughput, low-latency pipeline designed to bypass traditional database bottlenecks:
          </p>

          <div className="pipeline-steps">
            <div className="step-card blue">
              <span className="step-title">1. Client-Side Cache (React LRU)</span>
              <p className="step-desc">
                Instant 0ms retrieval on backspaces and repeated prefixes using an in-memory Map, paired with 150–200ms input debouncing.
              </p>
            </div>

            <div className="step-card green">
              <span className="step-title">2. Node-API Memory Bridge</span>
              <p className="step-desc">
                Express routes requests directly to our compiled native C++ binary (<code>.node</code>), keeping data in native C++ heap memory and bypassing V8 Garbage Collection stalls.
              </p>
            </div>

            <div className="step-card yellow">
              <span className="step-title">3. O(L) Compressed Radix Tree</span>
              <p className="step-desc">
                Traverses compressed edges where <em>L</em> is query length. Nodes store precomputed bounded Top-5 Min-Heaps by population, enabling instant <em>O(1)</em> extraction without scanning subtrees.
              </p>
            </div>

            <div className="step-card red">
              <span className="step-title">4. BK-Tree Fuzzy Typo Fallback</span>
              <p className="step-desc">
                If prefix search returns 0 matches (typo), the Burkhard-Keller metric tree triggers Levenshtein distance pruning (&le; 2 edit distance) to correct spelling errors.
              </p>
            </div>

            <div className="step-card purple">
              <span className="step-title">5. Startup Hydration (MongoDB)</span>
              <p className="step-desc">
                254,000+ GeoNames records are persisted in MongoDB and hydrated into native C++ memory once during server boot.
              </p>
            </div>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}