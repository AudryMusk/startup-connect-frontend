import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '@/services/auth'
import { getImageUrl } from '@/utils/imageUtils'

/**
 * Store pour gérer l'authentification et le profil utilisateur
 * Gère: login, register, logout, profil, password, tokens
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStartuper = computed(() => user.value?.role === 'startuper')
  const isPartner = computed(() => user.value?.role === 'partenaire')
  const userFullName = computed(() => user.value?.name || 'Utilisateur')
  const userAvatar = computed(() => getImageUrl(user.value?.photo || user.value?.avatar || null))

  // Actions
  /**
   * Récupérer le profil utilisateur authentifié
   */
  async function fetchMe() {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.getCurrentUser()
      user.value = data.user || data.data || data
      localStorage.setItem('user', JSON.stringify(user.value))
      return user.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération du profil'
      if (err.response?.status === 401) {
        await logout()
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Connexion
   */
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)

      token.value = data.access_token || data.token
      user.value = data.user || null

      localStorage.setItem('auth_token', token.value)
      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      // Toujours appeler fetchMe pour obtenir toutes les données (secteur, startup_id, etc.)
      await fetchMe()

      return data
    } catch (err) {
      // Gérer les différents types d'erreurs
      if (err.response?.status === 401) {
        error.value = 'Email ou mot de passe incorrect'
      } else if (err.response?.status === 403) {
        error.value =
          err.response?.data?.message || 'Veuillez vérifier votre email avant de vous connecter'
      } else if (err.response?.status === 422) {
        const errors = err.response?.data?.errors || {}
        const firstError = Object.values(errors)[0]
        error.value = Array.isArray(firstError)
          ? firstError[0]
          : err.response?.data?.message || 'Données invalides'
      } else {
        error.value = err.response?.data?.message || 'Une erreur est survenue lors de la connexion'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription
   */
  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.register(payload)
      if (data.access_token || data.token) {
        token.value = data.access_token || data.token
        user.value = data.user || null
        localStorage.setItem('auth_token', token.value)
        if (user.value) {
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      }
      return data
    } catch (err) {
      // Gérer les erreurs de validation (422)
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors || {}
        const firstKey = Object.keys(errors)[0]
        const firstError = errors[firstKey]
        error.value = Array.isArray(firstError)
          ? firstError[0]
          : err.response?.data?.message || 'Données invalides'
      } else if (err.response?.status === 409) {
        error.value = 'Cet email est déjà utilisé'
      } else {
        error.value = err.response?.data?.message || "Une erreur est survenue lors de l'inscription"
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion sécurisée avec nettoyage complet
   * @param {boolean} silent - Si true, ne pas afficher d'erreur
   */
  async function logout(silent = false) {
    loading.value = true
    try {
      // Appeler l'API pour invalider le token côté serveur
      if (token.value) {
        await authApi.logout()
      }
    } catch (err) {
      // Ne pas bloquer la déconnexion si l'API échoue
      if (!silent) {
        console.error('Erreur lors de la déconnexion:', err)
      }
    } finally {
      // Toujours nettoyer localement même si l'API échoue
      await clearAuth()
      loading.value = false
    }
  }

  /**
   * Déconnexion de tous les appareils
   */
  async function logoutAll() {
    loading.value = true
    try {
      if (token.value) {
        await authApi.logoutAll()
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion globale:', err)
      throw err
    } finally {
      await clearAuth()
      loading.value = false

      // Redirection immédiate vers login avec rechargement forcé
      window.location.href = '/login'
    }
  }

  /**
   * Nettoyage complet de l'authentification (sans appel API)
   * Nettoie tous les stores et le localStorage
   */
  async function clearAuth() {
    user.value = null
    token.value = null
    error.value = null

    // Nettoyer le localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_token')

    // Nettoyer tous les caches et stores connexes
    try {
      // Importer dynamiquement les stores pour éviter les dépendances circulaires
      const { useMessagesStore } = await import('@/stores/messagesStore')
      const { useGroupsStore } = await import('@/stores/groupsStore')
      const { usePostsStore } = await import('@/stores/postsStore')
      const { useNotificationsStore } = await import('@/stores/notificationsStore')

      // Réinitialiser tous les stores (tous ont maintenant $reset())
      const stores = [
        useMessagesStore(),
        useGroupsStore(),
        usePostsStore(),
        useNotificationsStore(),
      ]

      stores.forEach((store) => {
        if (store && typeof store.$reset === 'function') {
          store.$reset()
        }
      })
    } catch (e) {
      // En cas d'erreur, continuer le nettoyage
      console.debug('Nettoyage des stores:', e.message)
    }

    // Nettoyer le sessionStorage aussi
    sessionStorage.clear()
  }

  /**
   * Mettre à jour le profil
   */
  async function updateProfile(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.updateProfile(payload)
      user.value = data.user || data.data || data
      localStorage.setItem('user', JSON.stringify(user.value))

      // Rafraîchir les données complètes depuis /me pour avoir startup_id, etc.
      await fetchMe()

      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour profil'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mot de passe oublié
   */
  async function forgotPassword(email) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.forgotPassword({ email })
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur envoi email'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialiser mot de passe
   */
  async function resetPassword(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.resetPassword(payload)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur réinitialisation'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Changer mot de passe (connecté)
   */
  async function changePassword(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.changePassword(payload)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur changement mot de passe'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Renvoyer email vérification
   */
  async function resendVerificationEmail() {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.resendVerificationEmail()
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur envoi email'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialiser store au chargement app
   * Vérifie si le token est valide et récupère les données utilisateur
   */
  async function initialize() {
    // Si on a un token mais pas de user, essayer de récupérer les données
    if (token.value && !user.value) {
      try {
        await fetchMe()
      } catch {
        // Token invalide ou expiré, déconnexion silencieuse
        await clearAuth()
        console.warn('Session expirée ou invalide, nettoyage effectué')
      }
    }
    // Si pas de token, s'assurer que tout est nettoyé
    else if (!token.value) {
      await clearAuth()
    }
  }

  function $reset() {
    user.value = null
    token.value = null
    loading.value = false
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_token')
  }

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    isStartuper,
    isPartner,
    userFullName,
    userAvatar,

    // Aliases pour compatibilité
    isLoading: loading,
    authError: error,

    // Actions
    fetchMe,
    login,
    register,
    logout,
    logoutAll,
    clearAuth,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    resendVerificationEmail,
    initialize,
    $reset,
  }
})
