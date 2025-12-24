import api from './api'

export default {
  // =========================================
  // DASHBOARD & KPIs
  // =========================================

  /**
   * Récupérer toutes les statistiques du dashboard admin
   */
  getDashboard() {
    return api.get('/admin/dashboard')
  },

  /**
   * Récupérer les statistiques des utilisateurs
   */
  getUsersStats() {
    return api.get('/admin/dashboard/users')
  },

  /**
   * Récupérer les statistiques des startups
   */
  getStartupsStats() {
    return api.get('/admin/dashboard/startups')
  },

  /**
   * Récupérer les statistiques des partenaires
   */
  getPartnersStats() {
    return api.get('/admin/dashboard/partners')
  },

  /**
   * Récupérer la cartographie des startups par localisation
   */
  getStartupsMap() {
    return api.get('/admin/dashboard/startups-map')
  },

  /**
   * Legacy: les KPIs du tableau de bord (alias vers getDashboard)
   */
  getKpis() {
    return this.getDashboard()
  },

  // =========================================
  // GESTION DES UTILISATEURS
  // =========================================

  /**
   * Lister tous les utilisateurs avec filtres et pagination
   * @param {Object} params - { role, suspended, search, sort_by, sort_order, per_page, page }
   */
  getUsers(params = {}) {
    return api.get('/admin/users', { params })
  },

  /**
   * Lister les utilisateurs suspendus
   * @param {Object} params - { per_page, page }
   */
  getSuspendedUsers(params = {}) {
    return api.get('/admin/users/suspended', { params })
  },

  /**
   * Récupérer les détails d'un utilisateur
   * @param {number} id
   */
  getUser(id) {
    return api.get(`/admin/users/${id}`)
  },

  /**
   * Suspendre un utilisateur
   * @param {number} userId - User ID
   * @param {Object} payload - { reason }
   */
  suspendUser(userId, payload = {}) {
    return api.post(`/admin/users/${userId}/suspend`, payload)
  },

  /**
   * Réactiver un utilisateur suspendu
   * @param {number} userId
   */
  unsuspendUser(userId) {
    return api.post(`/admin/users/${userId}/unsuspend`)
  },

  /**
   * Changer le rôle d'un utilisateur
   * @param {number} userId
   * @param {string} role - 'startuper', 'partenaire', 'admin'
   */
  changeUserRole(userId, role) {
    return api.patch(`/admin/users/${userId}/role`, { role })
  },

  /**
   * Supprimer un utilisateur
   * @param {number} userId
   */
  deleteUser(userId) {
    return api.delete(`/admin/users/${userId}`)
  },

  // =========================================
  // MODÉRATION - SIGNALEMENTS
  // =========================================

  /**
   * Lister les signalements avec filtres et pagination
   * @param {Object} params - { status, type, sort_by, sort_order, per_page, page }
   */
  getReports(params = {}) {
    return api.get('/admin/reports', { params })
  },

  /**
   * Récupérer les statistiques de modération
   */
  getReportsStats() {
    return api.get('/admin/reports/stats')
  },

  /**
   * Récupérer les détails d'un signalement
   * @param {number} reportId
   */
  getReport(reportId) {
    return api.get(`/admin/reports/${reportId}`)
  },

  /**
   * Marquer un signalement comme examiné (reviewed)
   * @param {number} reportId
   */
  reviewReport(reportId) {
    return api.post(`/admin/reports/${reportId}/review`)
  },

  /**
   * Résoudre un signalement
   * @param {number} reportId
   * @param {Object} payload - { action_taken }
   */
  resolveReport(reportId, payload = {}) {
    return api.post(`/admin/reports/${reportId}/resolve`, payload)
  },

  /**
   * Rejeter un signalement
   * @param {number} reportId
   * @param {Object} payload - { reason }
   */
  dismissReport(reportId, payload = {}) {
    return api.post(`/admin/reports/${reportId}/dismiss`, payload)
  },

  // =========================================
  // MODÉRATION - SUPPRESSION DE CONTENU
  // =========================================

  /**
   * Supprimer un post (admin)
   * @param {number} postId
   */
  deletePost(postId) {
    return api.delete(`/admin/posts/${postId}`)
  },

  /**
   * Supprimer un commentaire (admin)
   * @param {number} commentId
   */
  deleteComment(commentId) {
    return api.delete(`/admin/comments/${commentId}`)
  },

  /**
   * Supprimer une startup (admin)
   * @param {number} startupId
   */
  deleteStartup(startupId) {
    return api.delete(`/admin/startups/${startupId}`)
  },

  // =========================================
  // LOGS ADMIN
  // =========================================

  /**
   * Lister les logs admin avec filtres et pagination
   * @param {Object} params - { action, admin_id, target_type, sort_by, sort_order, per_page, page }
   */
  getLogs(params = {}) {
    return api.get('/admin/logs', { params })
  },

  // =========================================
  // REGISTRE COMMERCE (ADPME)
  // =========================================

  /**
   * Télécharger le PDF du registre de commerce d'une startup
   * @param {number} startupId
   */
  downloadRegistreCommerce(startupId) {
    return api.get(`/admin/startups/${startupId}/registre-commerce`, {
      responseType: 'blob',
    })
  },

  // =========================================
  // LEGACY & HELPER METHODS
  // =========================================

  /**
   * Lister toutes les startups (avec pagination)
   * @param {Object} params
   */
  getStartups(params = {}) {
    return api.get('/startups', { params })
  },

  /**
   * Mettre à jour une startup (admin)
   * @param {number} startupId
   * @param {Object} payload - Données à modifier
   */
  updateStartup(startupId, payload) {
    return api.put(`/admin/startups/${startupId}`, payload)
  },

  /**
   * Valider une startup (mettre is_validated à true)
   * @param {number} startupId
   */
  validateStartup(startupId) {
    // Essayer d'abord l'endpoint admin, sinon utiliser l'endpoint standard
    return this.updateStartup(startupId, { is_validated: true }).catch(() =>
      api.patch(`/startups/${startupId}`, { is_validated: true }),
    )
  },

  /**
   * Rejeter une startup (mettre is_validated à false avec raison)
   * @param {number} startupId
   * @param {Object} payload - { reason, rejection_reason }
   */
  rejectStartup(startupId, payload = {}) {
    const data = {
      is_validated: false,
      rejection_reason: payload.reason || payload.rejection_reason,
    }
    // Essayer d'abord l'endpoint admin, sinon utiliser l'endpoint standard
    return this.updateStartup(startupId, data).catch(() =>
      api.patch(`/startups/${startupId}`, data),
    )
  },

  /**
   * Lister les statistiques globales (alias)
   */
  getStats() {
    return this.getDashboard()
  },
}
