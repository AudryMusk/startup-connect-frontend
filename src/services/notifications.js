import api from './api';

export default {
  /**
   * @param {Object} params
   */
  list(params = {}) {
    return api.get('/notifications', { params });
  },

  /**
   *  les notifications non lues
   * @param {Object} params - {page, per_page}
   */
  unread(params = {}) {
    return api.get('/notifications/unread', { params });
  },

  /**
   * Marquer une notification comme lue
   * @param {number} id - notification id
   */
  markAsRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  /**
   * toutes les notifications comme lues
   */
  markAllAsRead() {
    return api.patch('/notifications/mark-all-as-read');
  },

  /**
   * Supprimer une notification
   * @param {number} id - Notification ID
   */
  delete(id) {
    return api.delete(`/notifications/${id}`);
  },
};
