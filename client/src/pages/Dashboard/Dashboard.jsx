import { useState } from 'react';
import { searchApi } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import QueryCard from '../../components/QueryCard/QueryCard';
import './Dashboard.css';

const Dashboard = () => {
  const [dorks, setDorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchApi.generateDorks(query);
      if (data.success) {
        setDorks(data.variants);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header text-center">
        <h1 className="page-title text-gradient text-glow">Find your next customer.</h1>
        <p className="page-subtitle text-lg">
          Describe the ideal lead in plain English. AI handles the Google Dorks.
        </p>
      </header>
      
      <SearchBar onSearch={handleSearch} isLoading={loading} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {dorks.length > 0 && (
        <div className="results-section slide-up">
          <h2 className="section-title">Use these optimized queries:</h2>
          <div className="dorks-grid">
            {dorks.map((item, i) => (
              <QueryCard key={i} label={item.label} dork={item.dork} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
