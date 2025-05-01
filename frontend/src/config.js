const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://af-61317241-bqpe.vercel.app';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`
  },
  FAVORITES: {
    LIST: `${API_BASE_URL}/api/favorites`,
    ADD: `${API_BASE_URL}/api/favorites/add`,
    REMOVE: (code) => `${API_BASE_URL}/api/favorites/remove/${code}`
  }
}; 