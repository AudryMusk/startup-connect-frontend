import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor : Ajout du token d'authentification à chaque requête
 */
api.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }

    // Si c'est un FormData, supprimer le Content-Type pour laisser le navigateur le définir
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
  } catch (e) {
    console.error('Error adding token to request:', e);
  }
  return config;
});

/**
 * Response interceptor : Gestion des erreurs globales
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (error.response?.status === 401) {
      // Éviter de se déconnecter si c'est déjà une requête de logout ou login
      const isAuthRequest = error.config.url?.includes('/logout') ||
                           error.config.url?.includes('/login') ||
                           error.config.url?.includes('/register');

      if (!isAuthRequest) {
        try {
          const auth = useAuthStore();

          // Déconnexion silencieuse sans appeler l'API
          if (auth?.token) {
            await auth.clearAuth();
          }

          // Redirection FORCÉE vers login (pas de router.push, window.location direct)
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            console.log('[API Interceptor] 401 détecté - Redirection forcée vers login');
            window.location.href = '/login?expired=true';
          }
        } catch (e) {
          console.error('Error during auto-logout:', e);
          // En cas d'erreur, forcer quand même la redirection
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
      }
    }

    // Ne pas spammer la console pour les requêtes abortées (ex: navigation/timeout)
    const isAborted = error.code === 'ECONNABORTED' || error.message === 'Request aborted' || error.name === 'CanceledError';

    if (import.meta.env.DEV) {
      if (isAborted) {
        // debug-level log pour faciliter le triage sans polluer la console d'erreur
        console.debug('API request aborted:', error.message);
      } else if (error.response?.status !== 401) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
