import { ref, onUnmounted, watch } from 'vue';
import { getEcho, disconnectEcho, isEchoConnected } from '@/services/echo';
import { useAuthStore } from '@/stores/authStore';
// Note: Encryption désactivée
// import { decryptMessage, isEncrypted } from '@/utils/encryption';

/**
 * Retourne le message tel quel (encryption désactivée)
 */
function decryptMessageContent(message) {
  return message;
}

/**
 * Composable pour gérer les connexions temps réel via Laravel Reverb/Echo
 * Remplace l'ancien système Supabase pour une communication instantanée
 */
export function useReverb() {
  const authStore = useAuthStore();
  const channels = ref(new Map());
  const isConnected = ref(false);
  const connectionError = ref(null);

  /**
   * Initialise la connexion Echo et met à jour l'état
   */
  function initConnection() {
    const echo = getEcho();
    if (echo) {
      // Suivre l'état de connexion
      echo.connector.pusher.connection.bind('connected', () => {
        isConnected.value = true;
        connectionError.value = null;
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        isConnected.value = false;
      });

      echo.connector.pusher.connection.bind('error', (error) => {
        connectionError.value = error;
        isConnected.value = false;
      });

      isConnected.value = isEchoConnected();
    }
    return echo;
  }

  /**
   * S'abonner aux messages privés d'un utilisateur
   * @param {number} userId - ID de l'utilisateur courant
   * @param {Object} callbacks - Callbacks pour les différents événements
   * @param {Function} callbacks.onMessageSent - Nouveau message reçu
   * @param {Function} callbacks.onMessageUpdated - Message modifié
   * @param {Function} callbacks.onMessageDeleted - Message supprimé
   */
  function subscribeToPrivateMessages(userId, { onMessageSent, onMessageUpdated, onMessageDeleted, onMessageRead }) {
    const echo = initConnection();
    if (!echo) return null;

    const channelName = `messages.${userId}`;

    // Éviter les doublons
    if (channels.value.has(channelName)) {
      console.log(`[Reverb] Déjà abonné au canal ${channelName}`);
      return channels.value.get(channelName);
    }

    console.log(`[Reverb] 📩 Abonnement au canal privé: ${channelName}`);

    const channel = echo.private(channelName)
      .listen('MessageSent', (event) => {
        console.log('[Reverb] 📬 Nouveau message reçu:', event);
        const message = decryptMessageContent(event.message);
        if (onMessageSent) onMessageSent(message);
      })
      .listen('MessageUpdated', (event) => {
        console.log('[Reverb] ✏️ Message modifié:', event);
        const message = decryptMessageContent(event.message);
        if (onMessageUpdated) onMessageUpdated(message);
      })
      .listen('MessageDeleted', (event) => {
        console.log('[Reverb] 🗑️ Message supprimé:', event);
        if (onMessageDeleted) onMessageDeleted(event);
      })
      .listen('.message.read', (event) => {
        console.log('[Reverb] 👀 Message lu:', event);
        if (onMessageRead) onMessageRead(event);
      });

    channels.value.set(channelName, channel);
    return channel;
  }

  /**
   * S'abonner aux messages d'un groupe
   * @param {number} groupId - ID du groupe
   * @param {Object} callbacks - Callbacks pour les différents événements
   * @param {Function} callbacks.onMessageSent - Nouveau message reçu
   * @param {Function} callbacks.onMessageUpdated - Message modifié
   * @param {Function} callbacks.onMessageDeleted - Message supprimé
   */
  function subscribeToGroupMessages(groupId, { onMessageSent, onMessageUpdated, onMessageDeleted }) {
    const echo = initConnection();
    if (!echo) return null;

    const channelName = `groups.${groupId}`;

    // Éviter les doublons
    if (channels.value.has(channelName)) {
      console.log(`[Reverb] Déjà abonné au canal ${channelName}`);
      return channels.value.get(channelName);
    }

    console.log(`[Reverb] 👥 Abonnement au canal groupe: ${channelName}`);

    const channel = echo.private(channelName)
      .listen('GroupMessageSent', (event) => {
        console.log('[Reverb] 📬 Nouveau message groupe:', event);
        const message = decryptMessageContent(event.message);
        if (onMessageSent) onMessageSent(message);
      })
      .listen('GroupMessageUpdated', (event) => {
        console.log('[Reverb] ✏️ Message groupe modifié:', event);
        const message = decryptMessageContent(event.message);
        if (onMessageUpdated) onMessageUpdated(message);
      })
      .listen('GroupMessageDeleted', (event) => {
        console.log('[Reverb] 🗑️ Message groupe supprimé:', event);
        if (onMessageDeleted) onMessageDeleted(event);
      });

    channels.value.set(channelName, channel);
    return channel;
  }

  /**
   * S'abonner aux notifications d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Function} onNotification - Callback quand une notification arrive
   */
  function subscribeToNotifications(userId, onNotification) {
    const echo = initConnection();
    if (!echo) return null;

    const channelName = `App.Models.User.${userId}`;

    // Éviter les doublons
    if (channels.value.has(channelName)) {
      console.log(`[Reverb] Déjà abonné au canal ${channelName}`);
      return channels.value.get(channelName);
    }

    console.log(`[Reverb] 🔔 Abonnement aux notifications: ${channelName}`);

    // Laravel diffuse les notifications sur le canal privé de l'utilisateur
    const channel = echo.private(channelName)
      .notification((notification) => {
        console.log('[Reverb] 🔔 Nouvelle notification:', notification);
        if (onNotification) onNotification(notification);
      });

    channels.value.set(channelName, channel);
    return channel;
  }

  /**
   * S'abonner aux événements de candidature d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} callbacks - Callbacks pour les différents événements
   * @param {Function} callbacks.onApplicationSubmitted - Candidature soumise (pour partenaires)
   * @param {Function} callbacks.onApplicationStatusChanged - Statut de candidature changé (pour candidats)
   */
  function subscribeToApplicationEvents(userId, { onApplicationSubmitted, onApplicationStatusChanged }) {
    const echo = initConnection();
    if (!echo) return null;

    const channelName = `user.${userId}`;

    // Éviter les doublons
    if (channels.value.has(channelName)) {
      console.log(`[Reverb] Déjà abonné au canal ${channelName}`);
      return channels.value.get(channelName);
    }

    console.log(`[Reverb] 📋 Abonnement aux événements candidatures: ${channelName}`);

    const channel = echo.private(channelName)
      .listen('.application.submitted', (event) => {
        console.log('[Reverb] 📥 Nouvelle candidature reçue:', event);
        if (onApplicationSubmitted) onApplicationSubmitted(event);
      })
      .listen('.application.status.changed', (event) => {
        console.log('[Reverb] 📊 Statut candidature changé:', event);
        if (onApplicationStatusChanged) onApplicationStatusChanged(event);
      });

    channels.value.set(channelName, channel);
    return channel;
  }

  /**
   * S'abonner au canal de présence pour voir qui est en ligne
   * @param {Function} onHere - Callback avec la liste des utilisateurs présents
   * @param {Function} onJoining - Callback quand un utilisateur rejoint
   * @param {Function} onLeaving - Callback quand un utilisateur quitte
   */
  function subscribeToPresence({ onHere, onJoining, onLeaving }) {
    const echo = initConnection();
    if (!echo) return null;

    const channelName = 'presence-online';

    if (channels.value.has(channelName)) {
      return channels.value.get(channelName);
    }

    console.log(`[Reverb] 👁️ Abonnement au canal présence: ${channelName}`);

    const channel = echo.join('online')
      .here((users) => {
        console.log('[Reverb] Utilisateurs en ligne:', users);
        if (onHere) onHere(users);
      })
      .joining((user) => {
        console.log('[Reverb] Utilisateur connecté:', user);
        if (onJoining) onJoining(user);
      })
      .leaving((user) => {
        console.log('[Reverb] Utilisateur déconnecté:', user);
        if (onLeaving) onLeaving(user);
      });

    channels.value.set(channelName, channel);
    return channel;
  }

  /**
   * Se désabonner d'un canal spécifique
   * @param {string} channelName - Nom du canal
   */
  function leaveChannel(channelName) {
    const echo = getEcho();
    if (echo && channels.value.has(channelName)) {
      echo.leave(channelName);
      channels.value.delete(channelName);
      console.log(`[Reverb] 👋 Désabonné du canal: ${channelName}`);
    }
  }

  /**
   * Se désabonner de tous les canaux
   */
  function leaveAllChannels() {
    const echo = getEcho();
    if (echo) {
      channels.value.forEach((_, channelName) => {
        echo.leave(channelName);
      });
      channels.value.clear();
      console.log('[Reverb] 👋 Désabonné de tous les canaux');
    }
  }

  /**
   * Déconnecte complètement du serveur WebSocket
   */
  function disconnect() {
    leaveAllChannels();
    disconnectEcho();
    isConnected.value = false;
  }

  // Nettoyer automatiquement à la destruction du composant
  onUnmounted(() => {
    leaveAllChannels();
  });

  // Déconnecter si l'utilisateur se déconnecte
  watch(() => authStore.token, (newToken) => {
    if (!newToken) {
      disconnect();
    }
  });

  return {
    // État
    isConnected,
    connectionError,
    channels,

    // Méthodes d'abonnement
    subscribeToPrivateMessages,
    subscribeToGroupMessages,
    subscribeToNotifications,
    subscribeToApplicationEvents,
    subscribeToPresence,

    // Méthodes de désabonnement
    leaveChannel,
    leaveAllChannels,
    disconnect,

    // Utilitaires
    initConnection,
  };
}
