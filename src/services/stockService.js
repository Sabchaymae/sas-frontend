import operationsApi from './operationsApi';

const mapProductFromApi = (p) => {
  if (!p || !p.id) {
    console.warn('Invalid product data received from API:', p);
    return null;
  }
  return {
    id: p.id,
    designation: p.designation || '',
    sku: p.sku || '',
    categorie: p.categorie || '',
    fournisseur: p.fournisseur || '',
    quantite: Number(p.quantite || 0),
    seuil: Number(p.seuil || 0),
    prixUnitaire: Number(p.prix_unitaire || 0),
  };
};

const mapProductToApi = (p) => ({
  designation: p.designation,
  sku: p.sku || `SKU-${Math.floor(Math.random() * 1000000)}`, // SKU court pour Laravel
  categorie: p.categorie,
  fournisseur: p.fournisseur,
  quantite: parseInt(p.quantite) || 0,
  seuil: parseInt(p.seuil) || 0,
  prix_unitaire: parseFloat(p.prixUnitaire) || 0,
});

export const stockService = {
  getProducts: async (params = {}) => {
    const response = await operationsApi.get('v1/products', { params });
    // Handle both { products: [] } and { data: { products: [] } }
    const list = response.products || response.data?.products || (Array.isArray(response) ? response : []);
    return list.map(mapProductFromApi).filter(Boolean);
  },

  getProduct: async (id) => {
    const response = await operationsApi.get(`v1/products/${id}`);
    return mapProductFromApi(response.product || response.data?.product || response);
  },

  createProduct: async (productData) => {
    console.log('Sending product data:', mapProductToApi(productData));
    const response = await operationsApi.post('v1/products', mapProductToApi(productData));
    console.log('Server response (create):', response);
    const product = response.product || response.data?.product || response;
    return mapProductFromApi(product);
  },

  updateProduct: async (id, productData) => {
    console.log('Updating product data:', mapProductToApi(productData));
    const response = await operationsApi.put(`v1/products/${id}`, mapProductToApi(productData));
    console.log('Server response (update):', response);
    const product = response.product || response.data?.product || response;
    return mapProductFromApi(product);
  },

  deleteProduct: async (id) => {
    const response = await operationsApi.delete(`v1/products/${id}`);
    return response;
  },

  handleMovement: async (id, movementData) => {
    // movementData: { type: 'entrée'|'sortie', quantite: number, motif: string }
    const response = await operationsApi.post(`v1/products/${id}/movement`, movementData);
    return {
      product: mapProductFromApi(response.product || response.data?.product || response),
      triggerAlert: response.trigger_alert || false,
      message: response.message
    };
  },

  getMovements: async () => {
    const response = await operationsApi.get('v1/stock/movements');
    return response.movements || [];
  },

  getNotifications: async () => {
    const response = await operationsApi.get('v1/notifications');
    return response;
  },

  markNotificationRead: async (id) => {
    const response = await operationsApi.post(`v1/notifications/${id}/read`);
    return response;
  },

  // Task Optimization
  getOptimizationSuggestions: async () => {
    const response = await operationsApi.get('v1/tasks/optimization/suggestions');
    console.log('API response from getOptimizationSuggestions:', response);
    return response;
  },

  applyOptimizations: async (suggestions) => {
    const response = await operationsApi.post('v1/tasks/optimization/apply', suggestions);
    return response;
  },

  // ─── Task Management API ─────────────────────────────────────
  getTasks: async () => {
    const response = await operationsApi.get('v1/tasks');
    return response.data || [];
  },

  createTask: async (taskData) => {
    const response = await operationsApi.post('v1/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await operationsApi.put(`v1/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await operationsApi.delete(`v1/tasks/${id}`);
    return response;
  },

  // ─── Incident Management API ─────────────────────────────────
  getIncidents: async () => {
    const response = await operationsApi.get('v1/incidents');
    return response.data || response || [];
  },

  createIncident: async (incidentData) => {
    const response = await operationsApi.post('v1/incidents', incidentData);
    return response.data || response;
  },

  getIncidentDetails: async (id) => {
    const response = await operationsApi.get(`v1/incidents/${id}`);
    return response;
  },

  updateIncident: async (id, incidentData) => {
    const response = await operationsApi.put(`v1/incidents/${id}`, incidentData);
    return response.data || response;
  },

  deleteIncident: async (id) => {
    const response = await operationsApi.delete(`v1/incidents/${id}`);
    return response;
  },

  addTaskComment: async (taskId, commentData) => {
    // commentData: { content: string, type: 'comment'|'issue' }
    const response = await operationsApi.post(`v1/tasks/${taskId}/comments`, commentData);
    return response;
  }
};
