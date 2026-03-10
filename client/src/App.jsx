import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import logoImg from './assets/logo.png';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Leads from './pages/Leads/Leads';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import Auth from './pages/Auth/Auth';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <header className="mobile-header">
                    <div className="mobile-logo-container">
                      <img src={logoImg} alt="LeadDork Logo" className="mobile-logo-image" />
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
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
