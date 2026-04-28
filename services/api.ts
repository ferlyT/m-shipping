/**
 * MShipping API Service
 * Centralized API handler for all modules.
 * Supports both real endpoints and mock fallbacks.
 */
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; // Fallback to localhost if env not set
const MOCK_ENABLED = false;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHeaders = async () => {
  const token = await SecureStore.getItemAsync('user_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiClient = {
  get: async <T>(endpoint: string, mockData?: T): Promise<ApiResponse<T>> => {
    try {
      if (MOCK_ENABLED && mockData) {
        await sleep(800);
        return { data: mockData, error: null, status: 200 };
      }

      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      let json;
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 50)}`);
      }

      if (!response.ok) throw new Error(json.message || json.error || 'API Request Failed');

      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API GET Error [${endpoint}]:`, err);
      // Alert.alert('Kesalahan Koneksi', `Gagal mengambil data dari ${endpoint}. ${err.message || ''}`);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  },

  post: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      let json;
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 50)}`);
      }

      if (!response.ok || json.error) {
        throw new Error(json.message || json.error || 'API Post Failed');
      }

      return { data: json, error: null, status: response.status };

    } catch (err: any) {
      console.error(`API POST Error [${endpoint}]:`, err);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  },
  patch: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      let json;
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 50)}`);
      }

      if (!response.ok) throw new Error(json.message || json.error || 'API Patch Failed');

      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API PATCH Error [${endpoint}]:`, err);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  },
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      let json;
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 50)}`);
      }

      if (!response.ok) throw new Error(json.message || json.error || 'API Delete Failed');

      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API DELETE Error [${endpoint}]:`, err);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  },
  upload: async <T>(endpoint: string, fileUri: string, fieldName: string = 'file'): Promise<ApiResponse<T>> => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const formData = new FormData();

      const fileData = {
        uri: fileUri,
        name: `photo.jpg`,
        type: 'image/jpeg',
      } as any;

      formData.append(fieldName, fileData);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH', // Matches our backend .patch
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          // Note: Don't set 'Content-Type': 'multipart/form-data' manually, 
          // fetch will do it with the correct boundary.
        },
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Upload Failed');

      return { data: json, error: null, status: response.status };
    } catch (err: any) {
      console.error(`API UPLOAD Error [${endpoint}]:`, err);
      Alert.alert('Kesalahan Unggah', `Gagal mengunggah berkas ke ${endpoint}. ${err.message || ''}`);
      return { data: null, error: err.message || 'Unknown Error', status: 500 };
    }
  }
};
