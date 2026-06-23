import api from './api';

const mapUserFromApi = (user) => ({
  ...user,
  dateCreation: user.date_creation,
  dateNaissance: user.date_naissance,
});

const mapUserToApi = (userData) => {
  if (userData instanceof FormData) {
    if (userData.has('dateNaissance')) {
      userData.append('date_naissance', userData.get('dateNaissance'));
      userData.delete('dateNaissance');
    }
    return userData;
  }
  
  return {
    ...userData,
    date_naissance: userData.dateNaissance,
  };
};

/**
 * Service for managing users via the API Gateway.
 * baseURL = http://localhost:8080/api/identity
 * Nginx strips /api/identity/ → Laravel receives /v1/users
 * So all paths here must start with 'v1/...'
 */
export const userService = {
  getUsers: async (params = {}) => {
    // api.js interceptor unwraps response.data → we receive { data: [...] }
    // So response.data is the actual array of users
    const response = await api.get('v1/users', { params });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    return {
      data: list.map(mapUserFromApi),
      total: response.meta?.total ?? response.data?.meta?.total ?? list.length,
    };
  },

  getUser: async (id) => {
    const response = await api.get(`v1/users/${id}`);
    return mapUserFromApi(response.data ?? response);
  },

  createUser: async (userData) => {
    const mappedData = mapUserToApi(userData);
    const config = mappedData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
      
    const response = await api.post('v1/users', mappedData, config);
    return mapUserFromApi(response.data ?? response);
  },

  updateUser: async (id, userData) => {
    const mappedData = mapUserToApi(userData);
    const config = mappedData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
      
    if (mappedData instanceof FormData) {
      mappedData.append('_method', 'PUT');
      const response = await api.post(`v1/users/${id}`, mappedData, config);
      return mapUserFromApi(response.data ?? response);
    }

    const response = await api.put(`v1/users/${id}`, mappedData);
    return mapUserFromApi(response.data ?? response);
  },

  deleteUser: async (id) => {
    const response = await api.delete(`v1/users/${id}`);
    return response;
  }
};
