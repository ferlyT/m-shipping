/**
 * MShipping API Service
 * Centralized API handler for all modules.
 * Supports both real endpoints and mock fallbacks.
 */

const BASE_URL = 'https://api.mshipping.com/v1'; // Change this to your actual production/dev API
const MOCK_ENABLED = true; // Set to false when connecting to real backend

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  get: async <T>(endpoint: string, mockData?: T): Promise<ApiResponse<T>> => {
    try {
      if (MOCK_ENABLED && mockData) {
        await sleep(800); // Simulate network latency
        return { data: mockData, error: null, status: 200 };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // Handle token management as needed
        },
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'API Request Failed');
      
      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API GET Error [${endpoint}]:`, err);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  },

  post: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'API Post Failed');
      
      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API POST Error [${endpoint}]:`, err);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  }
};
