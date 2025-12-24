import api from './api';

export default {
  /**
   * @param {Object} payload - {name, email, password, password_confirmation, type}
   */
  register(payload) {
    return api.post('/register', payload);
  },

  /**
   * Se connecter
   * @param {Object} payload - {email, password}
   * @returns {Promise} - Retourne {access_token, user}
   */
  login(payload) {
    return api.post('/login', payload);
  },

  /**
   * Se déconnecter (appareil actuel uniquement)
   */
  logout() {
    return api.post('/logout');
  },

  /**
   * Se déconnecter de tous les appareils
   */
  logoutAll() {
    return api.post('/logout/all');
  },

  /**
   * Récupérer l'utilisateur actuellement connecté
   */
  getCurrentUser() {
    return api.get('/me');
  },

  /**
   * @param {FormData|Object} payload - FormData avec photo ou objet {name, email, bio, avatar, phone, etc.}
   */
  updateProfile(payload) {
    if (payload instanceof FormData) {
      // Laravel nécessite _method=PUT pour les FormData
      payload.append('_method', 'PUT');
      return api.post('/me', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put('/me', payload);
  },

  /**
   * Demander réinitialisation de mot de passe
   * @param {Object} payload - {email}
   */
  async forgotPassword(payload) {
    return await api.post('/password/forgot', payload);
  },

  /**
   * Réinitialiser le mot de passe
   * @param {Object} payload - {email, password, password_confirmation, token}
   */
  resetPassword(payload) {
    return api.post('/password/reset', payload);
  },

  /**
   * Changer le mot de passe
   * @param {Object} payload - {current_password, password, password_confirmation}
   */
  changePassword(payload) {
    return api.post('/password/change', payload);
  },

  /**
   * Renvoyer email de vérification
   */
  resendVerificationEmail() {
    return api.post('/email/verification-notification');
  },

  /**
   * Vérifier l'email avec token
   * @param {string} verificationUrl - URL de vérification complète
   */
  verifyEmail(verificationUrl) {
    return api.get(verificationUrl);
  },

  /**
   * Activer l'authentification à deux facteurs
   */
  enableTwoFactor() {
    return api.post('/two-factor/enable');
  },

  /**
   * Désactiver l'authentification à deux facteurs
   */
  disableTwoFactor() {
    return api.post('/two-factor/disable');
  },

  /**
   * Vérifier le code 2FA
   * @param {Object} payload
   */
  verifyTwoFactor(payload) {
    return api.post('/two-factor/verify', payload);
  },
};
