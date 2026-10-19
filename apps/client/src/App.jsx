import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AboutModal from './components/modal/AboutModal';
import HowItWorksModal from './components/modal/HowItWorksModal';
import FlowchartModal from './components/modal/FlowchartModal';
import SearchContainer from './components/search/SearchContainer';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <Header 
        onOpenAbout={() => setIsAboutOpen(true)} 
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenFlowchart={() => setIsFlowchartOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<SearchContainer />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>

      <Footer />

      {/* Modals */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
      {isHowItWorksOpen && <HowItWorksModal onClose={() => setIsHowItWorksOpen(false)} />}
      {isFlowchartOpen && <FlowchartModal onClose={() => setIsFlowchartOpen(false)} />}
    </div>
  );
}