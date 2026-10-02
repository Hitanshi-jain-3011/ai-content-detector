import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TextDetectorPage from './pages/TextDetectorPage';
import FileDetectorPage from './pages/FileDetectorPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  // Navigation state: 'home', 'text', 'files', 'history'
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validPages = ['home', 'text', 'files', 'history'];
    return validPages.includes(hash) ? hash : 'home';
  });

  // Sync browser URL hash with state for direct linking/back-forward navigation
  useEffect(() => {
    window.location.hash = activePage;
  }, [activePage]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validPages = ['home', 'text', 'files', 'history'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Render current page content
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'text':
        return <TextDetectorPage />;
      case 'files':
        return <FileDetectorPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Page Body */}
      <main className="flex-1 py-8">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
