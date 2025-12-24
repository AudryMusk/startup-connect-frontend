import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import messagesApi from '@/services/messages.js';
import { useCache } from '@/utils/cache';
import { useAuthStore } from '@/stores/authStore';

/**
 * Store pour gérer les messages 1:1 (conversations privées)
 * Gère: conversations, messages, envoi, édition, suppression, unread count
 */
export const useMessagesStore = defineStore('messages', () => {
  // State
  const conversations = ref([]);
  const currentConversation = ref(null);
  const messages = ref({}); // {userId: [...messages]}
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Cache avec TTL de 5 minutes pour conversations (optimisé pour performance)
  const conversationsCache = useCache('conversations', 5 * 60 * 1000);
  // Cache des messages par utilisateur (TTL 2 minutes)
  const messagesCache = useCache('messages', 2 * 60 * 1000);

  // Getters
  const getMessagesForUser = computed(() => {
    return (userId) => messages.value[userId] || [];
  });

  const totalUnread = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  });

  // Actions
  /**
   * Charger toutes les conversations avec cache intelligent
   */
  async function loadConversations(params = {}, forceRefresh = false) {
    // Vérifier le cache si pas de forceRefresh
    if (!forceRefresh) {
      const cached = conversationsCache.get(params);
      if (cached) {
        conversations.value = cached;
        return conversations.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await messagesApi.conversations(params);
      const convList = data.conversations || data.data || data;
      conversations.value = convList;

      // Mettre en cache
      conversationsCache.set(params, convList);

      return conversations.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des conversations';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Charger les messages d'une conversation avec un utilisateur
   * Utilise le cache pour un affichage instantané, puis refresh en arrière-plan
   * @param {number} userId - ID de l'utilisateur
   * @param {boolean} forceRefresh - Forcer le rechargement depuis le serveur
   */
  async function loadMessages(userId, params = {}, forceRefresh = false) {
    const cacheKey = `user_${userId}`;
    const isLoadMore = !!params.cursor;

    // Vérifier le cache d'abord pour un affichage instantané (seulement si pas loadMore)
    if (!forceRefresh && !isLoadMore) {
      const cached = messagesCache.get(cacheKey);
      if (cached) {
        messages.value[userId] = cached;
        currentConversation.value = userId;

        // Refresh en arrière-plan (ne pas attendre)
        refreshMessagesInBackground(userId, params);

        return { data: cached, meta: null }; // Return structure compatible with pagination
      }
    }

    // Pas de cache, charger avec indicateur
    if (!isLoadMore) loading.value = true;
    error.value = null;
    try {
      const { data } = await messagesApi.getConversation(userId, params);

      // Backend returns { data: [...], meta: {...}, links: {...} } for cursor pagination
      // Or just [...] if not paginated (legacy support)
      let messageList = Array.isArray(data) ? data : (data.data || []);
      const meta = data.meta || null;
      const links = data.links || null;

      // Reverse messages to show oldest first (since backend sends latest first for pagination)
      messageList = [...messageList].reverse();

      if (isLoadMore) {
        // Prepend messages
        if (!messages.value[userId]) messages.value[userId] = [];
        messages.value[userId] = [...messageList, ...messages.value[userId]];
      } else {
        // Replace messages
        messages.value[userId] = messageList;
        currentConversation.value = userId;
        // Mettre en cache seulement la première page
        messagesCache.set(cacheKey, messageList);
      }

      return { data: messageList, meta, links };
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des messages';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Refresh les messages en arrière-plan sans bloquer l'UI
   * @param {number} userId - ID de l'utilisateur
   */
  async function refreshMessagesInBackground(userId, params = {}) {
    try {
      const { data } = await messagesApi.getConversation(userId, params);
      let messageList = Array.isArray(data) ? data : (data.data || []);

      // Reverse messages to show oldest first
      messageList = [...messageList].reverse();

      // Mettre à jour seulement s'il y a des changements (comparaison basique)
      // Note: Avec la pagination, on ne compare que la première page
      // C'est une simplification, idéalement on devrait merger intelligemment
      if (JSON.stringify(messages.value[userId]?.slice(-messageList.length)) !== JSON.stringify(messageList)) {
        // Si c'est différent, on remplace tout ou on merge?
        // Pour simplifier, si on refresh la page 1, on remplace tout le cache local si c'est un refresh initial
        // Mais ici c'est un background refresh.
        // On va supposer que c'est un refresh de la vue initiale.
        messages.value[userId] = messageList;
        messagesCache.set(`user_${userId}`, messageList);
      }
    } catch (err) {
      // Silently fail on background refresh
      console.warn('Background refresh failed:', err.message);
    }
  }

  /**
   * Précharger les messages d'une conversation (pour le hover)
   * @param {number} userId - ID de l'utilisateur
   */
  async function prefetchMessages(userId) {
    const cacheKey = `user_${userId}`;

    // Ne précharger que si pas en cache
    if (messagesCache.get(cacheKey)) {
      return;
    }

    try {
      const { data } = await messagesApi.getConversation(userId, {});
      const messageList = data.data || data;
      messagesCache.set(cacheKey, messageList);
    } catch (err) {
      // Silently fail on prefetch
      console.warn('Prefetch failed:', err.message);
    }
  }

  /**
   * Envoyer un message à un utilisateur
   * @param {number} receiverId - ID du destinataire
   * @param {string} content - Contenu du message
   */
  async function sendMessage(receiverId, content) {
    error.value = null;
    try {
      const { data } = await messagesApi.send(receiverId, content);
      const message = data.data || data;

      // Invalider le cache
      conversationsCache.invalidate();

      return message;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message';
      throw err;
    }
  }

  /**
   * Modifier un message existant
   * @param {number} messageId - ID du message
   * @param {string} content - Nouveau contenu
   */
  async function updateMessage(messageId, content) {
    error.value = null;
    try {
      const { data } = await messagesApi.update(messageId, content);
      const updatedMessage = data.data || data;

      // Mettre à jour le message dans la liste locale
      Object.keys(messages.value).forEach(userId => {
        const index = messages.value[userId].findIndex(m => m.id === messageId);
        if (index !== -1) {
          messages.value[userId][index] = updatedMessage;
        }
      });

      return updatedMessage;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la modification du message';
      throw err;
    }
  }

  /**
   * Supprimer un message
   * @param {number} messageId - ID du message
   */
  async function deleteMessage(messageId) {
    error.value = null;
    try {
      await messagesApi.delete(messageId);

      // Retirer le message de la liste locale
      Object.keys(messages.value).forEach(userId => {
        messages.value[userId] = messages.value[userId].filter(m => m.id !== messageId);
      });

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du message';
      throw err;
    }
  }

  /**
   * Marquer des messages comme lus
   * @param {Array<number>} messageIds - IDs des messages
   */
  async function markAsRead(messageIds) {
    error.value = null;
    try {
      // Appel API en arrière-plan (ne pas attendre)
      messagesApi.markAsRead(messageIds).catch(err => {
        console.error('Error marking as read:', err);
      });

      // Mettre à jour localement immédiatement
      Object.keys(messages.value).forEach(userId => {
        messages.value[userId].forEach(message => {
          if (messageIds.includes(message.id)) {
            message.read_at = new Date().toISOString();
          }
        });
      });

      // Mettre à jour les conversations localement
      conversations.value.forEach(conv => {
        if (conv.unread_count > 0) {
          conv.unread_count = Math.max(0, conv.unread_count - messageIds.length);
        }
      });

      // Mettre à jour le compteur global
      unreadCount.value = Math.max(0, unreadCount.value - messageIds.length);

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du marquage des messages';
      throw err;
    }
  }

  /**
   * Récupérer le nombre de messages non lus
   */
  async function fetchUnreadCount() {
    try {
      const { data } = await messagesApi.unreadCount();
      unreadCount.value = data.unread_count || 0;
      return unreadCount.value;
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de messages non lus:', err);
      return 0;
    }
  }

  /**
   * Ajouter un message en temps réel (depuis Realtime)
   * @param {Object} message - Message reçu de Realtime
   */
  function addRealtimeMessage(message) {
    // Déterminer l'userId de la conversation (le user avec qui on parle)
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;

    if (!currentUserId) return;

    // L'userId de la conversation est celui avec qui on parle
    const conversationUserId = message.sender_id === currentUserId
      ? message.receiver_id
      : message.sender_id;

    // Initialiser le tableau si nécessaire
    if (!messages.value[conversationUserId]) {
      messages.value[conversationUserId] = [];
    }

    // Vérifier si le message existe déjà (éviter les doublons)
    const exists = messages.value[conversationUserId].some(m => m.id === message.id);
    if (!exists) {
      messages.value[conversationUserId].push(message);

      // Invalider le cache pour forcer un refresh
      messagesCache.invalidate(`user_${conversationUserId}`);

      console.log(`[MessagesStore] ✉️ Message temps réel ajouté pour user ${conversationUserId}:`, message);
    }
  }

  /**
   * Mettre à jour un message en temps réel
   * @param {Object} message - Message mis à jour
   */
  function updateRealtimeMessage(message) {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return;

    const conversationUserId = message.sender_id === currentUserId
      ? message.receiver_id
      : message.sender_id;

    if (messages.value[conversationUserId]) {
      const index = messages.value[conversationUserId].findIndex(m => m.id === message.id);
      if (index !== -1) {
        messages.value[conversationUserId][index] = message;
        console.log(`[MessagesStore] ✏️ Message temps réel mis à jour:`, message);
      }
    }
  }

  /**
   * Supprimer un message en temps réel
   * @param {number} messageId - ID du message supprimé
   * @param {number} senderId - ID de l'expéditeur
   * @param {number} receiverId - ID du destinataire
   */
  function deleteRealtimeMessage(messageId, senderId, receiverId) {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return;

    const conversationUserId = senderId === currentUserId ? receiverId : senderId;

    if (messages.value[conversationUserId]) {
      messages.value[conversationUserId] = messages.value[conversationUserId].filter(m => m.id !== messageId);
      console.log(`[MessagesStore] 🗑️ Message temps réel supprimé: ${messageId}`);
    }
  }

  /**
   * Mettre à jour la liste des conversations avec un nouveau message
   * @param {Object} message - Le nouveau message
   */
  function updateConversationWithMessage(message) {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return;

    const otherUserId = message.sender_id === currentUserId
      ? message.receiver_id
      : message.sender_id;

    // Chercher la conversation existante
    const existingConvIndex = conversations.value.findIndex(c => c.user?.id === otherUserId);

    if (existingConvIndex !== -1) {
      // Mettre à jour la conversation existante
      const conv = conversations.value[existingConvIndex];
      conv.last_message = {
        content: message.content,
        created_at: message.created_at,
        is_mine: message.sender_id === currentUserId,
      };

      // Incrémenter le compteur de non-lus si c'est un message reçu
      if (message.sender_id !== currentUserId && !message.read_at) {
        conv.unread_count = (conv.unread_count || 0) + 1;
      }

      // Déplacer la conversation en haut de la liste
      if (existingConvIndex > 0) {
        conversations.value.splice(existingConvIndex, 1);
        conversations.value.unshift(conv);
      }
    } else {
      // Nouvelle conversation - on devrait recharger la liste
      conversationsCache.invalidate();
    }
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    conversations.value = [];
    currentConversation.value = null;
    messages.value = {};
    unreadCount.value = 0;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
    error,

    // Getters
    getMessagesForUser,
    totalUnread,

    // Actions
    loadConversations,
    loadMessages,
    prefetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    fetchUnreadCount,
    addRealtimeMessage,
    $reset,
    updateRealtimeMessage,
    deleteRealtimeMessage,
    updateConversationWithMessage,
  };
});
