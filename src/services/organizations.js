import apiClient from './api'

/**
 * API Service for Organizations (Partners)
 * Endpoints:
 * - GET /organizations - List all organizations
 * - GET /organizations/:id - Get organization details
 * - GET /organizations/:id/members - Get organization members
 * - POST /organizations - Create organization (authenticated)
 * - PUT /organizations/:id - Update organization (owner/admin)
 * - DELETE /organizations/:id - Delete organization (owner)
 * - POST /organizations/:id/members - Add member (owner/admin)
 * - DELETE /organizations/:id/members/:userId - Remove member (owner/admin)
 */

const organizationsApi = {
  /**
   * Get list of all organizations
   * @param {Object} params - Query parameters (name, city, country, per_page)
   * @returns {Promise} - Paginated list of organizations
   */
  getAll(params = {}) {
    return apiClient.get('/organizations', { params })
  },

  /**
   * Get organization details by ID
   * @param {number|string} id - Organization ID
   * @returns {Promise} - Organization data
   */
  getById(id) {
    return apiClient.get(`/organizations/${id}`)
  },

  /**
   * Get organization members
   * @param {number|string} id - Organization ID
   * @returns {Promise} - List of members with roles
   */
  getMembers(id) {
    return apiClient.get(`/organizations/${id}/members`)
  },

  /**
   * Create a new organization
   * @param {FormData|Object} data - Organization data (name, description, logo, website, etc.)
   * @returns {Promise} - Created organization
   */
  create(data) {
    const isFormData = data instanceof FormData
    return apiClient.post('/organizations', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },

  /**
   * Update an organization
   * @param {number|string} id - Organization ID
   * @param {FormData|Object} data - Updated organization data
   * @returns {Promise} - Updated organization
   */
  update(id, data) {
    const isFormData = data instanceof FormData
    // Use POST with _method for FormData (Laravel's form method spoofing)
    if (isFormData) {
      data.append('_method', 'PUT')
      return apiClient.post(`/organizations/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return apiClient.put(`/organizations/${id}`, data)
  },

  /**
   * Delete an organization
   * @param {number|string} id - Organization ID
   * @returns {Promise}
   */
  delete(id) {
    return apiClient.delete(`/organizations/${id}`)
  },

  /**
   * Add a member to the organization
   * @param {number|string} organizationId - Organization ID
   * @param {number|string} userId - User ID to add
   * @param {string} role - Role: 'admin' or 'member'
   * @returns {Promise}
   */
  addMember(organizationId, userId, role = 'member') {
    return apiClient.post(`/organizations/${organizationId}/members`, {
      user_id: userId,
      role,
    })
  },

  /**
   * Remove a member from the organization
   * @param {number|string} organizationId - Organization ID
   * @param {number|string} userId - User ID to remove
   * @returns {Promise}
   */
  removeMember(organizationId, userId) {
    return apiClient.delete(`/organizations/${organizationId}/members/${userId}`)
  },

  /**
   * Search organizations by name
   * @param {string} name - Search term
   * @returns {Promise}
   */
  search(name) {
    return this.getAll({ name })
  },

  /**
   * Get organizations by city
   * @param {string} city - City name
   * @returns {Promise}
   */
  getByCity(city) {
    return this.getAll({ city })
  },

  /**
   * Get organizations by country
   * @param {string} country - Country name
   * @returns {Promise}
   */
  getByCountry(country) {
    return this.getAll({ country })
  },
}

export default organizationsApi
