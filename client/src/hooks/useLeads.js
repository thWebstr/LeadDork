import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../services/api';

export const useLeads = (tagFilter = '') => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAll(tagFilter);
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [tagFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (leadData) => {
    try {
      const data = await leadsApi.create(leadData);
      if (data.success) {
        setLeads(prev => [data.lead, ...prev]);
        return { success: true, lead: data.lead };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const updateLead = async (id, updateData) => {
    try {
      const data = await leadsApi.update(id, updateData);
      if (data.success) {
        setLeads(prev => prev.map(l => l.id === id ? data.lead : l));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const removeLead = async (id) => {
    try {
      const data = await leadsApi.delete(id);
      if (data.success) {
        setLeads(prev => prev.filter(l => l.id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  return { leads, loading, error, fetchLeads, addLead, updateLead, removeLead };
};
