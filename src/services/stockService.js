import operationsApi from './operationsApi';

const mapProductFromApi = (p) => ({
  id: p.id,
  designation: p.designation,
  sku: p.sku,
  categorie: p.categorie,
  fournisseur: p.fournisseur,
  quantite: Number(p.quantite),
  seuil: Number(p.seuil),
  prixUnitaire: Number(p.prix_unitaire),
});

const mapProductToApi = (p) => ({
  designation: p.designation,
  sku: p.sku,
  categorie: p.categorie,
  fournisseur: p.fournisseur,
  quantite: Number(p.quantite),
  seuil: Number(p.seuil),
  prix_unitaire: Number(p.prixUnitaire),
});

export const stockService = {
  getProducts: async (params = {}) => {
    const response = await operationsApi.get('api/v1/products', { params });
    const list = Array.isArray(response.products) ? response.products : [];
    return list.map(mapProductFromApi);
  },

  getProduct: async (id) => {
    const response = await operationsApi.get(`api/v1/products/${id}`);
    return mapProductFromApi(response.product);
  },

  createProduct: async (productData) => {
    const response = await operationsApi.post('api/v1/products', mapProductToApi(productData));
    return mapProductFromApi(response.product);
  },

  updateProduct: async (id, productData) => {
    const response = await operationsApi.put(`api/v1/products/${id}`, mapProductToApi(productData));
    return mapProductFromApi(response.product);
  },

  deleteProduct: async (id) => {
    const response = await operationsApi.delete(`api/v1/products/${id}`);
    return response;
  }
};
