import { useState, useEffect, useCallback } from 'react';
import { historyApi } from '../services/api';

export const useSearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await historyApi.getAll();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const removeHistoryItem = async (id) => {
    try {
      const data = await historyApi.delete(id);
      if (data.success) {
        setHistory(prev => prev.filter(h => h.id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  return { history, loading, error, fetchHistory, removeHistoryItem };
};
