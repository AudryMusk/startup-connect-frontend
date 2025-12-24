import api from './api';

/**
 * Service Groupes (sectoriels, startup-only, mixtes)
 * Endpoints: /groups
 *
 * Note: Le chiffrement E2E a été désactivé.
 * Les messages sont protégés par HTTPS en transit.
 */
export const groupsApi = {
  /**
   * Lister uniquement les groupes où l'utilisateur est membre ou créateur
   * @param {Object} params - {page, per_page}
   * @returns {Promise} - Retourne liste des groupes
   */
  list(params = {}) {
    return api.get('/groups', { params });
  },

  /**
   * Rechercher des groupes disponibles (non-membre)
   * @param {string} query - Terme de recherche
   * @returns {Promise} - Retourne liste des groupes disponibles
   */
  search(query) {
    return api.get('/groups/search', { params: { q: query } });
  },

  /**
   * Récupérer les détails d'un groupe
   * @param {number} groupId - Group ID
   * @returns {Promise} - Retourne l'objet groupe avec membres
   */
  get(groupId) {
    return api.get(`/groups/${groupId}`);
  },

  /**
   * Créer un nouveau groupe (startup-only ou mixte)
   * @param {Object} payload - {name, type, description, secteur}
   * @returns {Promise} - Retourne le groupe créé
   */
  create(payload) {
    return api.post('/groups', payload);
  },

  /**
   * Mettre à jour un groupe (créateur/admin uniquement)
   * @param {number} groupId - Group ID
   * @param {Object} payload - {name, description}
   * @returns {Promise} - Retourne le groupe mis à jour
   */
  update(groupId, payload) {
    return api.put(`/groups/${groupId}`, payload);
  },

  /**
   * Supprimer un groupe (créateur/admin uniquement, sauf sectoriels)
   * @param {number} groupId - Group ID
   * @returns {Promise}
   */
  delete(groupId) {
    return api.delete(`/groups/${groupId}`);
  },

  /**
   * Rejoindre un groupe public/mixte
   * @param {number} groupId - Group ID
   * @returns {Promise}
   */
  join(groupId) {
    return api.post(`/groups/${groupId}/join`);
  },

  /**
   * Quitter un groupe (sauf groupes sectoriels et si créateur)
   * @param {number} groupId - Group ID
   * @returns {Promise}
   */
  leave(groupId) {
    return api.post(`/groups/${groupId}/leave`);
  },

  /**
   * Ajouter un membre au groupe (membres peuvent inviter)
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID à ajouter
   * @returns {Promise}
   */
  addMember(groupId, userId) {
    return api.post(`/groups/${groupId}/members`, { user_id: userId });
  },

  /**
   * Retirer un membre du groupe (créateur/admin ou l'utilisateur lui-même)
   * @param {number} groupId - Group ID
   * @param {number} memberId - Member ID
   * @returns {Promise}
   */
  removeMember(groupId, memberId) {
    return api.delete(`/groups/${groupId}/members/${memberId}`);
  },

  /**
   * Récupérer les messages d'un groupe
   * @param {number} groupId - Group ID
   * @param {Object} params - {page, per_page}
   * @returns {Promise} - Retourne les messages du groupe
   */
  getMessages(groupId, params = {}) {
    return api.get(`/groups/${groupId}/messages`, { params });
  },

  /**
   * Envoyer un message dans un groupe
   * @param {number} groupId - Group ID
   * @param {string} content - Contenu du message
   * @returns {Promise} - Retourne le message créé
   */
  sendMessage(groupId, content) {
    return api.post(`/groups/${groupId}/messages`, { content });
  },

  /**
   * Modifier un message de groupe (auteur uniquement, 15 min max)
   * @param {number} groupId - Group ID
   * @param {number} messageId - Message ID
   * @param {string} content - Nouveau contenu
   * @returns {Promise} - Retourne le message modifié
   */
  updateMessage(groupId, messageId, content) {
    return api.put(`/groups/${groupId}/messages/${messageId}`, { content });
  },

  /**
   * Supprimer un message de groupe (auteur/créateur/admin)
   * @param {number} groupId - Group ID
   * @param {number} messageId - Message ID
   * @returns {Promise}
   */
  deleteMessage(groupId, messageId) {
    return api.delete(`/groups/${groupId}/messages/${messageId}`);
  },
};

// Export par défaut pour compatibilité
export default groupsApi;
