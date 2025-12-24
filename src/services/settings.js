import api from './api'

export default {
  /**
   * Get banner settings (public)
   * @returns {Promise} Banner settings data
   */
  getBanner() {
    return api.get('/settings/banner')
  },

  /**
   * Update banner settings (admin only)
   * @param {Object} data - { event_date, event_name, event_location, enabled }
   * @returns {Promise}
   */
  updateBanner(data) {
    return api.put('/admin/settings/banner', data)
  },

  /**
   * Clear banner event date (admin only)
   * @returns {Promise}
   */
  clearBanner() {
    return api.delete('/admin/settings/banner')
  },
}
