import { useState, useEffect } from 'react';
import { highlightsAPI } from '../services/api';

export const useHighlights = (pdfUuid) => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pdfUuid) {
      fetchHighlights();
    }
  }, [pdfUuid]);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await highlightsAPI.get(`/${pdfUuid}`);
      setHighlights(response.data.highlights);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load highlights');
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = async (highlightData) => {
    try {
      const response = await highlightsAPI.post('/', {
        ...highlightData,
        pdfUuid
      });
      
      setHighlights(prev => [...prev, response.data.highlight]);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add highlight' 
      };
    }
  };

  const updateHighlight = async (id, updates) => {
    try {
      const response = await highlightsAPI.put(`/${id}`, updates);
      setHighlights(prev => 
        prev.map(h => h._id === id ? response.data.highlight : h)
      );
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update highlight' 
      };
    }
  };

  const deleteHighlight = async (id) => {
    try {
      await highlightsAPI.delete(`/${id}`);
      setHighlights(prev => prev.filter(h => h._id !== id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete highlight' 
      };
    }
  };

  return {
    highlights,
    loading,
    error,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    refresh: fetchHighlights
  };
};