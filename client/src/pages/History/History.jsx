import { Clock, Trash2 } from 'lucide-react';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import './History.css';

const History = () => {
  const { history, loading, removeHistoryItem } = useSearchHistory();

  if (loading) {
    return (
      <div className="history-page fade-in">
        <h1 className="page-title">Search History</h1>
        <div className="table-loading">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="history-page fade-in">
      <h1 className="page-title">Search History</h1>
      <p className="page-subtitle">Review your past queries and generated dorks.</p>

      {history.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="empty-icon text-muted" />
          <h3>No search history</h3>
          <p>Your AI generated queries will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-header">
                <span className="history-query">"{item.raw_query}"</span>
                <button 
                  className="icon-btn text-danger" 
                  onClick={() => removeHistoryItem(item.id)}
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="history-meta">
                <Clock size={14} />
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
