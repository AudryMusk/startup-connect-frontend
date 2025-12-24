import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

/**
 * Composable wrapper pour l'authentification
 * Assure la compatibilité avec le code existant tout en utilisant le store Pinia
 * Migration progressive vers useAuthStore possible
 */
export function useAuth() {
  const authStore = useAuthStore()

  // Initialize auth on first use (check for stored user)
  if (!authStore.user && authStore.loading === false) {
    // Check localStorage for authenticated user
    const storedUser = localStorage.getItem('user') || localStorage.getItem('sc_current_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        authStore.setUser(parsedUser)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('sc_current_user')
      }
    }
  }

  const login = async (email, password) => {
    // Utiliser le store qui appelle l'API réelle
    const data = await authStore.login({ email, password })
    return data.user || authStore.user
  }

  const register = async (profile) => {
    // Utiliser le store qui appelle l'API réelle
    const data = await authStore.register(profile)
    return data.user || data
  }

  const verifyEmail = async (userId) => {
    // TODO: Implémenter via l'API quand disponible
    console.log('Email verification requested for:', userId)
    return authStore.user
  }

  const logout = () => {
    authStore.logout()
    localStorage.removeItem('sc_current_user')
    localStorage.removeItem('user')
  }

  const updateUser = (updates) => {
    if (authStore.user) {
      const updatedUser = { ...authStore.user, ...updates }
      authStore.setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return {
    user: computed(() => authStore.user),
    loading: computed(() => authStore.loading),
    isAuthenticated: computed(() => !!authStore.user),
    login,
    register,
    verifyEmail,
    logout,
    updateUser,
  }
}
