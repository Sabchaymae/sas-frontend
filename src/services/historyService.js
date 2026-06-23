import api from './api';

/**
 * Service for activity history (REAL API)
 */
const historyService = {
  getHistory: async (params = {}) => {
<<<<<<< HEAD
    const response = await api.get('api/v1/history', { params });
=======
    const response = await api.get('v1/history', { params });
>>>>>>> import/master
    // Return the whole response object so the page can handle data, meta, and links
    return response;
  },

  getStats: async () => {
<<<<<<< HEAD
    const response = await api.get('api/v1/history/stats');
=======
    const response = await api.get('v1/history/stats');
>>>>>>> import/master
    return response.data ?? response;
  },

  getFilters: async () => {
<<<<<<< HEAD
    const response = await api.get('api/v1/history/filters');
=======
    const response = await api.get('v1/history/filters');
>>>>>>> import/master
    return response.data ?? response;
  },

  getDetail: async (id) => {
<<<<<<< HEAD
    const response = await api.get(`api/v1/history/${id}`);
=======
    const response = await api.get(`v1/history/${id}`);
>>>>>>> import/master
    const data = response.data ?? response;
    return data.data ?? data;
  }
};

export default historyService;
