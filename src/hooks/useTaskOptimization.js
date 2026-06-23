import { useState, useCallback, useEffect } from 'react';
import { stockService } from '../services/stockService';

/**
 * Hook to fetch task optimizations from the backend.
 * Now logic is centralized in the service-operations (Laravel).
 */
const useTaskOptimization = (tasks = []) => {
  const [suggestions, setSuggestions] = useState({
    reassignments: [],
    deadlines: [],
    summary: { atRiskCount: 0, criticalCount: 0, overloadedDays: [] }
  });
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockService.getOptimizationSuggestions();
      console.log('Optimization data received:', data);
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch optimization suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh suggestions when tasks change
  useEffect(() => {
    fetchSuggestions();
  }, [tasks.length]); // Re-fetch only when count changes to avoid infinite loops

  return {
    reassignmentSuggestions: suggestions.reassignments,
    deadlineSuggestions: suggestions.deadlines,
    summary: suggestions.summary,
    optimizeWorkload: suggestions,
    refreshSuggestions: fetchSuggestions,
    loading
  };
};

export default useTaskOptimization;
