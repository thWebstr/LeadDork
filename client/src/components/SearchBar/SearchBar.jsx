import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={24} />
          <input
            type="text"
            className="search-input"
            placeholder="e.g., Software engineers in London with Python experience..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="search-button"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="spinner" size={18} />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate Dorks</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
