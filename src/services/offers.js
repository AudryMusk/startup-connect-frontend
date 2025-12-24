import api from './api';

export default {
  /**
   * Obtenir toutes les offres publiques
   * @param {Object} params - {page, per_page, search, secteur}
   */
  list(params = {}) {
    return api.get('/offers', { params });
  },

  /**
   * Obtenir les détails d'une offre
   * @param {number} id - Offer ID
   */
  get(id) {
    return api.get(`/offers/${id}`);
  },

  /**
   * Créer une nouvelle offre
   * @param {Object} payload - Données de l'offre
   */
  create(payload) {
    return api.post('/offers', payload);
  },

  /**
   * Créer une offre avec images (FormData)
   * @param {FormData} formData - Données de l'offre avec images
   */
  createWithImages(formData) {
    return api.post('/offers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Mettre à jour une offre
   * @param {number} id - Offer ID
   * @param {Object} payload - Données à modifier
   */
  update(id, payload) {
    return api.put(`/offers/${id}`, payload);
  },

  /**
   * Supprimer une offre
   * @param {number} id - Offer ID
   */
  delete(id) {
    return api.delete(`/offers/${id}`);
  },

  /**
   * Sauvegarder une offre (favori)
   * @param {number} id - Offer ID
   */
  save(id) {
    return api.post(`/offers/${id}/save`);
  },

  /**
   * Retirer une offre des favoris
   * @param {number} id - Offer ID
   */
  unsave(id) {
    return api.delete(`/offers/${id}/unsave`);
  },

  /**
   * Toggle save/unsave (helper)
   * @param {number} id - Offer ID
   * @param {boolean} isSaved - État actuel
   */
  toggleSave(id, isSaved) {
    return isSaved ? this.unsave(id) : this.save(id);
  },

  /**
   * Obtenir mes offres sauvegardées
   * @param {Object} params - {page, per_page}
   */
  getSaved(params = {}) {
    return api.get('/offers/saved', { params });
  },

  // ============== LEGACY (pour compatibilité) ==============

  /**
   * @deprecated Utiliser save() à la place
   */
  addToFavorites(id) {
    return this.save(id);
  },

  /**
   * @deprecated Utiliser unsave() à la place
   */
  removeFromFavorites(id) {
    return this.unsave(id);
  },

  /**
   * @deprecated Utiliser applicationsApi.apply() à la place
   */
  apply(id, formData) {
    return api.post(`/offers/${id}/apply`, formData);
  },

  /**
   * @deprecated Utiliser applicationsApi.getMyApplications() à la place
   */
  getMyApplications(params = {}) {
    return api.get('/applications', { params });
  },
};
