import api from './api';

export default {
  /**
   * Obtenir mes candidatures
   * @param {Object} params - {page, per_page, status}
   */
  getMyApplications(params = {}) {
    return api.get('/applications', { params });
  },

  /**
   * Obtenir les candidatures reçues (pour partenaires)
   * @param {Object} params - {page, per_page, status}
   */
  getReceivedApplications(params = {}) {
    return api.get('/applications/received', { params });
  },

  /**
   * Obtenir les candidatures pour une offre spécifique
   * @param {number} offerId - ID de l'offre
   * @param {Object} params - paramètres de pagination
   */
  getForOffer(offerId, params = {}) {
    return api.get(`/offers/${offerId}/applications`, { params });
  },

  /**
   * Obtenir les détails d'une candidature
   * @param {number} id - ID de la candidature
   */
  get(id) {
    return api.get(`/applications/${id}`);
  },

  /**
   * Obtenir les infos pour postuler à une offre
   * @param {number} offerId - ID de l'offre
   */
  getApplyInfo(offerId) {
    return api.get(`/offers/${offerId}/apply-info`);
  },

  /**
   * Postuler à une offre
   * @param {number} offerId - ID de l'offre
   * @param {Object} formData - Données du formulaire de candidature
   */
  apply(offerId, formData) {
    return api.post(`/offers/${offerId}/apply`, formData);
  },

  /**
   * Accepter une candidature (pour partenaires)
   * @param {number} id - ID de la candidature
   * @param {Object} data - Données optionnelles (message, etc.)
   */
  accept(id, data = {}) {
    return api.patch(`/applications/${id}/accept`, data);
  },

  /**
   * Rejeter une candidature (pour partenaires)
   * @param {number} id - ID de la candidature
   * @param {Object} data - {reason: string}
   */
  reject(id, data = {}) {
    return api.patch(`/applications/${id}/reject`, data);
  },

  /**
   * Retirer/Annuler ma candidature
   * @param {number} id - ID de la candidature
   */
  withdraw(id) {
    return api.delete(`/applications/${id}`);
  },
};
