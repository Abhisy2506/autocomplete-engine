import './modal.css';
import { useEffect } from 'react';

export default function AboutModal({ onClose }) {

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
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">High-Performance Autocomplete Engine</h2>
        <div className="modal-body">
          <p>
            A production-ready, low-latency search engine that provides real-time global city recommendations and typo corrections. 
          </p>
          <p style={{ marginTop: '12px' }}>
            This system utilizes a hybrid architecture:
          </p>
          <ul>
            <li>
              <strong>Core Engine (C++ Binary):</strong> Handles the algorithmic heavy lifting. It uses a Compressed Radix Tree and Precomputed Top-K Min-Heaps for microsecond prefix lookups, alongside a BK-Tree for fuzzy matching.
            </li>
            <li>
              <strong>Native Bridge (Node-API):</strong> Connects the high-level JavaScript runtime directly to the low-level C++ memory space, bypassing the V8 garbage collector for heavy computations.
            </li>
            <li>
              <strong>API & Persistence (MERN Stack):</strong> Node.js and Express handle orchestration, while MongoDB stores the dataset of 30,000+ global cities.
            </li>
          </ul>
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}