import api from './api';

export default {
  /**
   * Récupérer ma startup (utilisateur connecté)
   */
  getMyStartup() {
    return api.get('/startups/me');
  },

  /**
   *  toutes les startups (public)
   * @param {Object} params - {page, per_page, secteur_id, ville, ...}
   */
  list(params = {}) {
    return api.get('/startups', { params });
  },

  /**
   *  des startups (public)
   * @param {Object} params - {q, secteur_id, ville, page, per_page}
   */
  search(params = {}) {
    return api.get('/startups', { params });
  },

  /**
   * les détails d'une startup (public)
   * @param {number|string} id - Startup ID ou 'me' pour la startup de l'utilisateur
   */
  get(id) {
    return api.get(`/startups/${id}`);
  },

  /**
   *  une nouvelle startup
   * @param {Object} payload - Données de la startup
   */
  create(payload) {
    return api.post('/startups', payload);
  },

  /**
   * Mettre à jour une startup
   * @param {number} id - Startup ID
   * @param {Object} payload - Données à modifier
   */
  update(id, payload) {
    return api.put(`/startups/${id}`, payload);
  },

  /**
   * Supprimer une startup
   * @param {number} id - Startup ID
   */
  delete(id) {
    return api.delete(`/startups/${id}`);
  },

  /**
   * Envoyer une demande de rejoindre une startup
   * @param {number} startupId
   */
  sendJoinRequest(startupId) {
    return api.post(`/startups/${startupId}/join-request`);
  },

  /**
   * Récupérer les demandes de connexion en attente pour mes startups
   * @param {number} startupId - Startup ID
   * @param {Object} params
   */
  getJoinRequests(startupId, params = {}) {
    return api.get(`/startups/${startupId}/join-requests`, { params });
  },

  /**
   * Approuver une demande de connexion
   * @param {number} requestId - Join Request ID
   */
  approveJoinRequest(requestId) {
    return api.patch(`/join-requests/${requestId}/approve`);
  },

  /**
   * Rejeter une demande de connexion
   * @param {number} requestId - Join Request ID
   */
  rejectJoinRequest(requestId) {
    return api.patch(`/join-requests/${requestId}/reject`);
  },

  /**
   * Lister toutes mes demandes envoyées
   * @param {Object} params
   */
  getMyJoinRequests(params = {}) {
    return api.get('/join-requests', { params });
  },

  /**
   *  les demandes reçues pour mes startups
   * @param {Object} params
   */
  getReceivedJoinRequests(params = {}) {
    return api.get('/join-requests/received', { params });
  },

  /**
   *  le registre PDF d'une startup
   * @param {number} startupId - Startup ID
   * @param {File} file
   */
  uploadRegisterPdf(startupId, file) {
    const fd = new FormData();
    fd.append('register_pdf', file);
    return api.post(`/startups/${startupId}/register-pdf`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Valider un membre en attente
   * @param {number} memberId - Startup Member ID
   */
  validateMember(memberId) {
    return api.post(`/startup-members/${memberId}/validate`);
  },

  /**
   * Rejeter un membre en attente
   * @param {number} memberId - Startup Member ID
   */
  rejectMember(memberId) {
    return api.delete(`/startup-members/${memberId}`);
  },
};
