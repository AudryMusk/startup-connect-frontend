import api from './api';

/**
 * Service Messages 1:1
 * Endpoints: /conversations, /messages
 *
 * Note: Le chiffrement E2E a été désactivé.
 * Les messages sont protégés par HTTPS en transit.
 */

export default {
  /**
   * Lister toutes les conversations de l'utilisateur
   * @param {Object} params - {page, per_page}
   * @returns {Promise} - Retourne liste conversations avec dernier message et unread_count
   */
  conversations(params = {}) {
    return api.get('/conversations', { params });
  },

  /**
   * Récupérer une conversation spécifique avec un utilisateur
   * @param {number} userId - ID de l'utilisateur avec qui on converse
   * @param {Object} params - {page, per_page}
   * @returns {Promise} - Retourne les messages de la conversation
   */
  getConversation(userId, params = {}) {
    return api.get(`/conversations/${userId}`, { params });
  },

  /**
   * Envoyer un message à un utilisateur
   * @param {number} receiverId - ID du destinataire
   * @param {string} content - Contenu du message
   * @returns {Promise} - Retourne le message créé
   */
  send(receiverId, content) {
    return api.post('/messages', {
      receiver_id: receiverId,
      content: content,
    });
  },

  /**
   * Modifier un message existant (15 min max après envoi)
   * @param {number} messageId - ID du message
   * @param {string} content - Nouveau contenu
   * @returns {Promise} - Retourne le message modifié
   */
  update(messageId, content) {
    return api.put(`/messages/${messageId}`, { content });
  },

  /**
   * Supprimer un message (soft delete)
   * @param {number} messageId - ID du message
   * @returns {Promise}
   */
  delete(messageId) {
    return api.delete(`/messages/${messageId}`);
  },

  /**
   * Marquer des messages comme lus
   * @param {Array<number>} messageIds - Array d'IDs de messages
   * @returns {Promise} - Retourne le nombre de messages marqués
   */
  markAsRead(messageIds) {
    return api.patch('/messages/read', { message_ids: messageIds });
  },

  /**
   * Récupérer le nombre de messages non lus
   * @returns {Promise} - Retourne {unread_count}
   */
  unreadCount() {
    return api.get('/messages/unread-count');
  }
};
