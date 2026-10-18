import './modal.css';
import { useEffect } from 'react';

export default function FlowchartModal({ onClose }) {

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
        className="modal-content flowchart-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">System Architecture & Execution Flow</h2>
        <p className="modal-body" style={{ marginBottom: '8px', fontSize: '15px'}}>
          Interactive visual diagram showing the hybrid React, Node-API, and C++ Core execution path:
        </p>

        <div className="flowchart-container">
          <svg className="flowchart-svg" viewBox="0 0 760 520" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#5f6368" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#137333" />
              </marker>
            </defs>

            {/* 1. Client Layer */}
            <rect x="30" y="20" width="700" height="90" rx="8" fill="#e8f0fe" stroke="#1a73e8" strokeWidth="1.5" />
            <text x="45" y="42" fill="#1a73e8" fontWeight="bold" fontSize="14">1. CLIENT LAYER (React + Vite)</text>
            
            <rect x="50" y="55" width="180" height="42" rx="5" fill="#ffffff" stroke="#aecbfa" />
            <text x="140" y="76" textAnchor="middle" fontSize="12" fontWeight="600" fill="#202124">Keystroke Input</text>
            <text x="140" y="90" textAnchor="middle" fontSize="11" fill="#5f6368">Instant search bar trigger</text>

            <rect x="290" y="55" width="180" height="42" rx="5" fill="#ffffff" stroke="#aecbfa" />
            <text x="380" y="76" textAnchor="middle" fontSize="12" fontWeight="600" fill="#202124">In-Memory LRU Cache</text>
            <text x="380" y="90" textAnchor="middle" fontSize="11" fill="#137333">0ms on backspaces</text>

            <rect x="530" y="55" width="180" height="42" rx="5" fill="#ffffff" stroke="#aecbfa" />
            <text x="620" y="76" textAnchor="middle" fontSize="12" fontWeight="600" fill="#202124">Debouncer (150ms)</text>
            <text x="620" y="90" textAnchor="middle" fontSize="11" fill="#5f6368">Prevents request spam</text>

            <line x1="230" y1="76" x2="284" y2="76" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="470" y1="76" x2="524" y2="76" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Arrow down to Backend */}
            <line x1="620" y1="110" x2="620" y2="144" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="630" y="132" fontSize="11" fill="#5f6368">HTTP GET /api/search</text>

            {/* 2. Backend Orchestration */}
            <rect x="30" y="150" width="700" height="70" rx="8" fill="#e6f4ea" stroke="#34a853" strokeWidth="1.5" />
            <text x="45" y="172" fill="#137333" fontWeight="bold" fontSize="14">2. BACKEND LAYER (Node.js + Express)</text>
            <rect x="50" y="180" width="660" height="30" rx="4" fill="#ffffff" stroke="#ceead6" />
            <text x="380" y="200" textAnchor="middle" fontSize="12" fill="#202124">
              Express REST Controller receives query &amp; delegates execution to compiled native addon
            </text>

            {/* Arrow down to Bridge */}
            <line x1="380" y1="220" x2="380" y2="244" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* 3. Node-API Memory Bridge */}
            <rect x="180" y="250" width="400" height="45" rx="6" fill="#fef7e0" stroke="#fbbc04" strokeWidth="1.5" />
            <text x="380" y="270" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#b06000">3. Node-API (N-API) Bridge</text>
            <text x="380" y="285" textAnchor="middle" fontSize="12" fill="#5f6368">Zero V8 Garbage Collection pressure • C++ Pointer Safety</text>

            {/* Arrows down to C++ Trees */}
            <line x1="280" y1="295" x2="230" y2="324" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="480" y1="295" x2="530" y2="324" stroke="#5f6368" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* 4. Native C++ Core Engine */}
            <rect x="30" y="330" width="700" height="100" rx="8" fill="#fce8e6" stroke="#ea4335" strokeWidth="1.5" />
            <text x="45" y="352" fill="#c5221f" fontWeight="bold" fontSize="14">4. NATIVE CORE ENGINE (C++ Machine Code)</text>

            <rect x="60" y="360" width="310" height="58" rx="5" fill="#ffffff" stroke="#fad2cf" />
            <text x="215" y="380" textAnchor="middle" fontSize="13" fontWeight="600" fill="#202124">Compressed Radix Tree</text>
            <text x="215" y="394" textAnchor="middle" fontSize="12" fill="#137333">O(L) Prefix Traversal</text>
            <text x="215" y="408" textAnchor="middle" fontSize="11" fill="#5f6368">Precomputed Top-5 Min-Heaps by Population</text>

            <rect x="390" y="360" width="320" height="58" rx="5" fill="#ffffff" stroke="#fad2cf" />
            <text x="550" y="380" textAnchor="middle" fontSize="13" fontWeight="600" fill="#202124">BK-Tree (Burkhard-Keller)</text>
            <text x="550" y="394" textAnchor="middle" fontSize="12" fill="#c5221f">Fuzzy Typo Fallback (Edit Dist &le; 2)</text>
            <text x="550" y="408" textAnchor="middle" fontSize="11" fill="#5f6368">Levenshtein Metric Triangle Inequality Pruning</text>

            {/* 5. Persistence Layer */}
            <rect x="30" y="450" width="700" height="55" rx="8" fill="#f3e8fd" stroke="#9334e8" strokeWidth="1.5" />
            <text x="45" y="472" fill="#7627bb" fontWeight="bold" fontSize="14">5. PERSISTENCE LAYER (MongoDB Database)</text>
            <text x="45" y="492" fontSize="12" fill="#5f6368">
              Stores 234,912 global city records • Hydrates C++ in-memory tree nodes once during server boot
            </text>

            <line x1="215" y1="450" x2="215" y2="424" stroke="#137333" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-green)" />
            <text x="225" y="440" fontSize="9" fill="#137333" fontWeight="bold">One-time Boot Hydration</text>
          </svg>
        </div>

        <button className="close-button" style={{ marginTop: '16px' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}