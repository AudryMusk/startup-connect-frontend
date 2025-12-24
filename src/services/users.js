import api from './api';

export default {
  /**
   * Rechercher des utilisateurs
   * @param {Object} params - {q: searchQuery, role: 'startuper'|'partner', page, per_page}
   */
  search(params = {}) {
    return api.get('/users/search', { params });
  },

  /**
   * Récupérer un utilisateur par ID
   * @param {number} id
   */
  getById(id) {
    return api.get(`/users/${id}`);
  },

  /**
   * Récupérer le profil utilisateur
   * @param {number} id
   */
  getProfile(id) {
    return api.get(`/users/${id}/profile`);
  },

  /**
   * Liste des utilisateurs (pour admin)
   * @param {Object} params - {page, per_page, role, status}
   */
  list(params = {}) {
    return api.get('/users', { params });
  },

  /**
   * Récupérer les startups d'un utilisateur (startuper)
   * @param {number} userId
   */
  getUserStartups(userId) {
    return api.get(`/users/${userId}/startups`);
  },
};
