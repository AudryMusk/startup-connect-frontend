import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';

// Configuration Pusher pour Reverb
window.Pusher = Pusher;

let echoInstance = null;

/**
 * Initialise ou récupère l'instance Laravel Echo
 * @returns {Echo|null} L'instance Echo connectée ou null si pas de token
 */
export function getEcho() {
  const authStore = useAuthStore();

  if (!authStore.token) {
    console.warn('[Echo] Pas de token d\'authentification, connexion impossible');
    return null;
  }

  if (!echoInstance) {
    const host = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
    const port = import.meta.env.VITE_REVERB_PORT || 8080;
    const key = import.meta.env.VITE_REVERB_APP_KEY || 'ed4eza2mxs93z350tsgy';
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
    
    // Déterminer si on est en production (HTTPS)
    const isProduction = scheme === 'https';
    const wsPort = isProduction ? 443 : parseInt(port);
    const wssPort = isProduction ? 443 : parseInt(port);

    console.log('[Echo] 🔧 Configuration:', {
      host,
      wsPort,
      wssPort,
      scheme,
      isProduction,
      apiUrl: import.meta.env.VITE_API_URL
    });

    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: key,
      wsHost: host,
      wsPort: wsPort,
      wssPort: wssPort,
      httpHost: host,
      httpPort: wsPort,
      cluster: 'mt1',
      encrypted: isProduction,
      disableStats: true,
      enabledTransports: isProduction ? ['ws', 'wss'] : ['ws'],
      forceTLS: isProduction,
      authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json',
        },
      },
    });

    // Log de connexion
    echoInstance.connector.pusher.connection.bind('connected', () => {
      console.log('[Echo] ✅ Connecté au serveur WebSocket Reverb');
    });

    echoInstance.connector.pusher.connection.bind('disconnected', () => {
      console.log('[Echo] ❌ Déconnecté du serveur WebSocket Reverb');
    });

    echoInstance.connector.pusher.connection.bind('error', (error) => {
      console.error('[Echo] Erreur de connexion:', error);
    });
  }

  return echoInstance;
}

/**
 * Déconnecte et réinitialise l'instance Echo
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('[Echo] 🔌 Déconnexion du serveur WebSocket');
  }
}

/**
 * Met à jour le token d'authentification
 * Utile après login ou rafraîchissement de token
 */
export function updateEchoAuth() {
  const authStore = useAuthStore();

  if (echoInstance && authStore.token) {
    echoInstance.connector.pusher.config.auth.headers.Authorization = `Bearer ${authStore.token}`;
    console.log('[Echo] 🔄 Token mis à jour');
  }
}

/**
 * Vérifie si Echo est connecté
 * @returns {boolean}
 */
export function isEchoConnected() {
  if (!echoInstance) return false;
  return echoInstance.connector.pusher.connection.state === 'connected';
}

export default {
  getEcho,
  disconnectEcho,
  updateEchoAuth,
  isEchoConnected,
};
