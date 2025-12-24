import api from './api';

export default {
  /**
   * Obtenir tous les événements
   * @param {Object} params - {page, per_page, search, sector, date_filter}
   */
  list(params = {}) {
    return api.get('/events', { params });
  },

  /**
   * Obtenir l'événement à la une (pour la bannière)
   * @returns {Promise} Featured event data
   */
  getFeatured() {
    return api.get('/events/featured');
  },

  /**
   * Définir un événement comme à la une (admin only)
   * @param {number} eventId - Event ID
   */
  setFeatured(eventId) {
    return api.post(`/events/${eventId}/featured`);
  },

  /**
   * Retirer un événement de la une (admin only)
   * @param {number} eventId - Event ID
   */
  removeFeatured(eventId) {
    return api.delete(`/events/${eventId}/featured`);
  },

  /**
   * Obtenir les détails d'un événement
   * @param {number} id - Event ID
   */
  get(id) {
    return api.get(`/events/${id}`);
  },

  /**
   * Créer un nouvel événement
   * @param {Object} payload - Données de l'événement
   */
  create(payload) {
    return api.post('/events', payload);
  },

  /**
   * Créer un événement avec images (FormData)
   * @param {FormData} formData - Données de l'événement avec images
   */
  createWithImages(formData) {
    return api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Mettre à jour un événement
   * @param {number} id - Event ID
   * @param {Object} payload - Données à modifier
   */
  update(id, payload) {
    return api.put(`/events/${id}`, payload);
  },

  /**
   * Mettre à jour un événement avec images
   * @param {number} id - Event ID
   * @param {FormData} formData - Données avec images
   */
  updateWithImages(id, formData) {
    // Pour PUT avec FormData, utiliser _method
    formData.append('_method', 'PUT');
    return api.post(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Supprimer un événement
   * @param {number} id - Event ID
   */
  delete(id) {
    return api.delete(`/events/${id}`);
  },

  /**
   * Obtenir les réservations d'un événement
   * @param {number} eventId - Event ID
   */
  getReservations(eventId) {
    return api.get(`/events/${eventId}/reservations`);
  },

  /**
   * Réserver des places pour un événement
   * @param {number} eventId - Event ID
   * @param {Object} payload - {seats, message}
   */
  reserve(eventId, payload = {}) {
    return api.post(`/events/${eventId}/reserve`, payload);
  },

  /**
   * Annuler une réservation
   * @param {number} eventId - Event ID
   * @param {number} reservationId - Reservation ID
   */
  cancelReservation(eventId, reservationId) {
    return api.delete(`/events/${eventId}/reservations/${reservationId}`);
  },

  /**
   * Obtenir mes événements (créateur)
   * @param {Object} params - {page, per_page}
   */
  myEvents(params = {}) {
    return api.get('/events/my', { params });
  },

  /**
   * Obtenir mes réservations d'événements
   * @param {Object} params - {page, per_page}
   */
  myReservations(params = {}) {
    return api.get('/events/reservations/my', { params });
  },
};
