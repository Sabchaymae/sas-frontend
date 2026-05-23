import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/subscription/',
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    const err = new Error(message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

const buildSubscriptionForm = (data, idField = null) => {
  const form = new FormData();
  if (idField) form.append('_method', 'PUT');

  const fields = {
    client_nom:       data.nom,
    client_prenom:    data.prenom,
    client_cin:       data.cin,
    client_telephone: data.telephone,
    date_naissance:   data.date_naissance,
    adresse:          data.adresse,
    operateur:        data.operator,
    type_objectif:    data.plan,
    sous_type:        data.segment,
    is_draft:         data.is_draft ? '1' : '0',
  };

  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      form.append(key, val);
    }
  });

  if (data.cinRectoFile) form.append('cin_recto', data.cinRectoFile);
  if (data.cinVersoFile) form.append('cin_verso', data.cinVersoFile);

  return form;
};

export const subscriptionService = {
  getAll: async () => {
    return await api.get('/souscriptions');
  },

  create: async (data) => {
    return await api.post('/souscriptions', buildSubscriptionForm(data), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  update: async (id, data) => {
    // Laravel doesn't support PUT with FormData, use POST + _method=PUT
    return await api.post(`/souscriptions/${id}`, buildSubscriptionForm(data, true), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateStatus: async (id, { statut, motifRefus = null, numeroLigneFixe = null, contratFile = null }) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('statut', statut);
    if (motifRefus)       formData.append('motif_refus', motifRefus);
    if (numeroLigneFixe)  formData.append('numero_ligne_fixe', numeroLigneFixe);
    if (contratFile)      formData.append('contrat', contratFile);

    return await api.post(`/souscriptions/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  delete: async (id) => {
    return await api.delete(`/souscriptions/${id}`);
  }
};
