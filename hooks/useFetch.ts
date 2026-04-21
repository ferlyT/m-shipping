import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '../services/api';

/**
 * Custom hook for standardizing data fetching 
 */
export function useFetch<T>(endpoint: string, mockData?: T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const result = await apiClient.get<T>(endpoint, mockData);
    
    if (result.error) setError(result.error);
    else setData(result.data);

    setLoading(false);
    setRefreshing(false);
  }, [endpoint]); // Remove mockData from dependencies as it's static

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refreshing, refetch: () => fetchData(true) };
}
