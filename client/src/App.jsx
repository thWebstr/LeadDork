import { Routes, Route } from 'react-router-dom';
import { Binoculars } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Leads from './pages/Leads/Leads';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';

import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="mobile-header">
        <div className="mobile-logo-container">
          <Binoculars className="logo-icon" size={24} />
          <h1 className="logo-text">Lead<span>Dork</span></h1>
        </div>
      </header>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
