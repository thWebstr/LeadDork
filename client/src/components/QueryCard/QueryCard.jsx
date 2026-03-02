import { useState } from 'react';
import { Download, Copy, Check, Loader2 } from 'lucide-react';
import { searchApi } from '../../services/api';
import { generateCsv } from '../../utils/exportCSV';
import './QueryCard.css';

const QueryCard = ({ label, dork }) => {
  const [copied, setCopied] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(dork);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrape = async () => {
    try {
      setIsScraping(true);
      setError(null);
      // Passing both the specific dork to execute AND the user's original natural language 
      // query so the server knows what custom fields to ask the AI to extract.
      const payload = await searchApi.scrapeDork({ dork, original_query: label });
      
      if (payload.success && payload.leads.length > 0) {
        generateCsv(payload.leads, `leaddork_${label.replace(/\\s+/g, '_').toLowerCase()}.csv`);
      } else {
        setError("No results found for this dork.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to scrape Google.");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="query-card">
      <div className="query-card-header">
        <h3 className="query-label">{label}</h3>
        <div className="query-actions">
          <button 
            className="action-btn" 
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      
      <div className="dork-container">
        <code>{dork}</code>
      </div>

      {error && <p className="text-danger" style={{fontSize: '0.875rem', marginTop: '-0.5rem'}}>{error}</p>}

      <div className="query-card-footer">
        <button 
          className="btn btn-primary w-full" 
          onClick={handleScrape}
          disabled={isScraping}
        >
          {isScraping ? (
            <><Loader2 size={16} className="spinner"/> Extracting Leads...</>
          ) : (
            <><Download size={16} /> Scrape to CSV Spreadsheet</>
          )}
        </button>
      </div>
    </div>
  );
};

export default QueryCard;
