import api from './api';

const STATUS_MAP_FROM_API = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  suspended: 'Inactif',
  rejected: 'Inactif',
};

const STATUS_MAP_TO_API = {
  'Actif': 'active',
  'Inactif': 'inactive',
  'En attente': 'pending',
};

const mapUserFromApi = (user) => ({
  ...user,
  statut: STATUS_MAP_FROM_API[user.statut] || user.statut || 'Actif',
  dateCreation: user.date_creation,
  dateNaissance: user.date_naissance,
});

const mapUserToApi = (userData) => {
  if (userData instanceof FormData) {
    if (userData.has('dateNaissance')) {
      userData.append('date_naissance', userData.get('dateNaissance'));
      userData.delete('dateNaissance');
    }
    if (userData.has('statut')) {
      const mappedStatus = STATUS_MAP_TO_API[userData.get('statut')] || userData.get('statut');
      userData.append('statut', mappedStatus);
      userData.delete('statut');
    }
    return userData;
  }
  
  return {
    ...userData,
    statut: STATUS_MAP_TO_API[userData.statut] || userData.statut,
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
    // api.js interceptor unwraps response.data → we receive either:
    // - All users: [user1, user2, ...] (from response()->json(UserResource::collection($users)))
    // - Paginated: { data: [user1, ...], meta: { total: X } }
    const response = await api.get('api/v1/users', { params });
    const isPaginated = response && response.data && Array.isArray(response.data);
    const list = isPaginated ? response.data : (Array.isArray(response) ? response : []);
    const total = isPaginated ? (response.meta?.total ?? list.length) : list.length;
    
    return {
      data: list.map(mapUserFromApi),
      total: total,
    };
  },

  getUser: async (id) => {
    const response = await api.get(`api/v1/users/${id}`);
    return mapUserFromApi(response.data ?? response);
  },

  createUser: async (userData) => {
    const mappedData = mapUserToApi(userData);
    const config = mappedData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
      
    const response = await api.post('api/v1/users', mappedData, config);
    return {
      user: mapUserFromApi(response.data ?? response),
      credentials: response.credentials
    };
  },

  updateUser: async (id, userData) => {
    const mappedData = mapUserToApi(userData);
    const config = mappedData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
      
    if (mappedData instanceof FormData) {
      mappedData.append('_method', 'PUT');
      const response = await api.post(`api/v1/users/${id}`, mappedData, config);
      return mapUserFromApi(response.data ?? response);
    }

    const response = await api.put(`api/v1/users/${id}`, mappedData);
    return mapUserFromApi(response.data ?? response);
  },

  deleteUser: async (id) => {
    const response = await api.delete(`api/v1/users/${id}`);
    return response;
  }
};
