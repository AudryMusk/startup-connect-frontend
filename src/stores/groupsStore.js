import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import groupsApi from '@/services/groups.js';
import { useCache } from '@/utils/cache';

/**
 * Store pour gérer les groupes (sectoriels, startup-only, mixtes)
 * Gère: liste groupes, messages de groupe, membres, édition/suppression
 */
export const useGroupsStore = defineStore('groups', () => {
  // State
  const groups = ref([]);
  const currentGroup = ref(null);
  const groupMessages = ref({}); // {groupId: [...messages]}
  const groupMessagesPagination = ref({}); // {groupId: {currentPage, hasMore, loading}}
  const loading = ref(false);
  const error = ref(null);

  // Cache avec TTL de 5 minutes pour groupes (optimisé pour performance)
  const groupsCache = useCache('groups', 5 * 60 * 1000);
  // Cache des messages de groupe (TTL 2 minutes)
  const groupMessagesCache = useCache('groupMessages', 2 * 60 * 1000);

  // Getters
  const getGroupById = computed(() => {
    return (groupId) => groups.value.find(g => g.id === groupId);
  });

  const getMessagesForGroup = computed(() => {
    return (groupId) => groupMessages.value[groupId] || [];
  });

  const sectorialGroups = computed(() => {
    return groups.value.filter(g => g.type === 'sectoral');
  });

  const startupOnlyGroups = computed(() => {
    return groups.value.filter(g => g.type === 'startup-only');
  });

  const mixedGroups = computed(() => {
    return groups.value.filter(g => g.type === 'mixed');
  });

  // Actions
  /**
   * Charger tous les groupes accessibles avec cache intelligent
   */
  async function fetchGroups(params = {}, forceRefresh = false) {
    // Vérifier le cache si pas de forceRefresh
    if (!forceRefresh) {
      const cached = groupsCache.get(params);
      if (cached) {
        groups.value = cached;
        // Retourner immédiatement le cache, loading déjà false
        return groups.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await groupsApi.list(params);
      const groupList = data.groups || data.data || data;
      groups.value = groupList;

      // Mettre en cache
      groupsCache.set(params, groupList);

      return groups.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des groupes';
      throw err;
    } finally {
      // Affichage instantané
      loading.value = false;
    }
  }

  /**
   * Récupérer les détails d'un groupe
   * @param {number} groupId
   */
  async function fetchGroup(groupId) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await groupsApi.get(groupId);
      currentGroup.value = data.group || data.data || data;

      // Mettre à jour dans la liste si présent
      const index = groups.value.findIndex(g => g.id === groupId);
      if (index !== -1) {
        groups.value[index] = currentGroup.value;
      }

      return currentGroup.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du groupe';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Créer un nouveau groupe
   * @param {Object} payload - {name, type, description, secteur}
   */
  async function createGroup(payload) {
    error.value = null;
    try {
      const { data } = await groupsApi.create(payload);
      const newGroup = data.group || data.data || data;
      groups.value.unshift(newGroup);
      return newGroup;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du groupe';
      throw err;
    }
  }

  /**
   * Mettre à jour un groupe
   * @param {number} groupId
   * @param {Object} payload - {name, description}
   */
  async function updateGroup(groupId, payload) {
    error.value = null;
    try {
      const { data } = await groupsApi.update(groupId, payload);
      const updatedGroup = data.group || data.data || data;

      // Mettre à jour dans la liste
      const index = groups.value.findIndex(g => g.id === groupId);
      if (index !== -1) {
        groups.value[index] = updatedGroup;
      }

      if (currentGroup.value?.id === groupId) {
        currentGroup.value = updatedGroup;
      }

      return updatedGroup;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du groupe';
      throw err;
    }
  }

  /**
   * Supprimer un groupe
   * @param {number} groupId
   */
  async function deleteGroup(groupId) {
    error.value = null;
    try {
      await groupsApi.delete(groupId);

      // Retirer de la liste
      groups.value = groups.value.filter(g => g.id !== groupId);

      if (currentGroup.value?.id === groupId) {
        currentGroup.value = null;
      }

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du groupe';
      throw err;
    }
  }

  /**
   * Rejoindre un groupe public/mixte
   * @param {number} groupId
   */
  async function joinGroup(groupId) {
    error.value = null;
    try {
      await groupsApi.join(groupId);
      // Rafraîchir le groupe
      await fetchGroup(groupId);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'adhésion au groupe';
      throw err;
    }
  }

  /**
   * Quitter un groupe
   * @param {number} groupId
   */
  async function leaveGroup(groupId) {
    error.value = null;
    try {
      await groupsApi.leave(groupId);
      // Retirer de la liste locale
      groups.value = groups.value.filter(g => g.id !== groupId);

      if (currentGroup.value?.id === groupId) {
        currentGroup.value = null;
      }

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la sortie du groupe';
      throw err;
    }
  }

  /**
   * Ajouter un membre au groupe
   * @param {number} groupId
   * @param {number} userId
   */
  async function addMember(groupId, userId) {
    error.value = null;
    try {
      await groupsApi.addMember(groupId, userId);
      // Rafraîchir le groupe pour obtenir la liste mise à jour des membres
      await fetchGroup(groupId);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout du membre';
      throw err;
    }
  }

  /**
   * Retirer un membre du groupe
   * @param {number} groupId
   * @param {number} memberId
   */
  async function removeMember(groupId, memberId) {
    error.value = null;
    try {
      await groupsApi.removeMember(groupId, memberId);
      // Rafraîchir le groupe
      await fetchGroup(groupId);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du retrait du membre';
      throw err;
    }
  }

  /**
   * Charger les messages d'un groupe avec lazy loading (pagination)
   * @param {number} groupId
   * @param {number} page - Numéro de page (1 pour les plus récents)
   * @param {number} perPage - Messages par page (défaut 20)
   * @param {boolean} forceRefresh - Forcer le rechargement
   */
  async function fetchMessages(groupId, page = 1, perPage = 20, forceRefresh = false) {
    // Initialiser la pagination si nécessaire
    if (!groupMessagesPagination.value[groupId]) {
      groupMessagesPagination.value[groupId] = {
        currentPage: 0,
        hasMore: true,
        loading: false,
        total: 0
      };
    }

    const cacheKey = `group_${groupId}`;

    // Vérifier le cache uniquement pour la première page et si pas de forceRefresh
    if (page === 1 && !forceRefresh) {
      const cached = groupMessagesCache.get(cacheKey);
      if (cached) {
        groupMessages.value[groupId] = cached;
        // Refresh en arrière-plan pour la première page
        refreshGroupMessagesInBackground(groupId, page, perPage);
        return cached;
      }
    }

    // Éviter les chargements simultanés
    if (groupMessagesPagination.value[groupId].loading) {
      return groupMessages.value[groupId] || [];
    }

    groupMessagesPagination.value[groupId].loading = true;
    if (page === 1) loading.value = true;
    error.value = null;

    try {
      const { data } = await groupsApi.getMessages(groupId, { page, per_page: perPage });
      const messagesList = data.messages || data.data || data;
      const pagination = data.pagination || {};

      // Pour la page 1, remplacer les messages. Pour les autres, ajouter au début
      if (page === 1) {
        // Messages déjà triés du plus récent au plus ancien par l'API
        groupMessages.value[groupId] = messagesList;
      } else {
        // Ajouter les messages plus anciens au début du tableau
        const existingMessages = groupMessages.value[groupId] || [];
        groupMessages.value[groupId] = [...messagesList, ...existingMessages];
      }

      // Mettre à jour la pagination
      groupMessagesPagination.value[groupId] = {
        currentPage: pagination.current_page || page,
        hasMore: pagination.has_more || false,
        loading: false,
        total: pagination.total || 0
      };

      // Mettre en cache seulement la première page
      if (page === 1) {
        groupMessagesCache.set(cacheKey, groupMessages.value[groupId]);
      }

      return groupMessages.value[groupId];
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des messages';
      groupMessagesPagination.value[groupId].loading = false;
      throw err;
    } finally {
      if (page === 1) loading.value = false;
      groupMessagesPagination.value[groupId].loading = false;
    }
  }

  /**
   * Refresh les messages de groupe en arrière-plan
   * @param {number} groupId
   * @param {number} page
   * @param {number} perPage
   */
  async function refreshGroupMessagesInBackground(groupId, page = 1, perPage = 20) {
    try {
      const { data } = await groupsApi.getMessages(groupId, { page, per_page: perPage });
      const messageList = data.messages || data.data || data;

      // Mettre à jour seulement s'il y a des changements
      if (JSON.stringify(groupMessages.value[groupId]) !== JSON.stringify(messageList)) {
        groupMessages.value[groupId] = messageList;
        groupMessagesCache.set(`group_${groupId}`, messageList);
      }
    } catch (err) {
      console.warn('Background refresh group messages failed:', err.message);
    }
  }

  /**
   * Charger plus de messages (page suivante) pour un groupe
   * @param {number} groupId
   */
  async function loadMoreMessages(groupId) {
    const pagination = groupMessagesPagination.value[groupId];
    if (!pagination || !pagination.hasMore || pagination.loading) {
      return;
    }

    const nextPage = pagination.currentPage + 1;
    await fetchMessages(groupId, nextPage, 20, false);
  }

  /**
   * Précharger les messages d'un groupe (pour le hover)
   * @param {number} groupId
   */
  async function prefetchGroupMessages(groupId) {
    const cacheKey = `group_${groupId}`;

    // Ne précharger que si pas en cache
    if (groupMessagesCache.get(cacheKey)) {
      return;
    }

    try {
      const { data } = await groupsApi.getMessages(groupId, {});
      const messageList = data.messages || data.data || data;
      groupMessagesCache.set(cacheKey, messageList);
    } catch (err) {
      console.warn('Prefetch group messages failed:', err.message);
    }
  }

  /**
   * Charger plus de messages (page suivante) pour un groupe
   * @param {number} groupId
   */
  async function loadMoreMessages(groupId) {
    const pagination = groupMessagesPagination.value[groupId];
    if (!pagination || !pagination.hasMore || pagination.loading) {
      return;
    }

    const nextPage = pagination.currentPage + 1;
    await fetchMessages(groupId, nextPage, 20, false);
  }

  /**
   * Ajouter un message optimiste (avant envoi au serveur)
   * @param {number} groupId
   * @param {object} optimisticMessage - Message avec tempId et flag sending: true
   */
  function addOptimisticMessage(groupId, optimisticMessage) {
    if (!groupMessages.value[groupId]) {
      groupMessages.value[groupId] = [];
    }

    // Ajouter le message avec le flag sending
    groupMessages.value[groupId].push(optimisticMessage);
  }

  /**
   * Remplacer un message optimiste par le message réel du serveur
   * @param {number} groupId
   * @param {string} tempId - ID temporaire du message optimiste
   * @param {object} realMessage - Message réel reçu du serveur avec ID permanent
   */
  function replaceOptimisticMessage(groupId, tempId, realMessage) {
    if (!groupMessages.value[groupId]) return;

    const index = groupMessages.value[groupId].findIndex(m => m.tempId === tempId);
    if (index !== -1) {
      // Remplacer le message optimiste par le vrai message avec toutes ses propriétés
      groupMessages.value[groupId][index] = {
        ...realMessage,
        sending: false,
        sendError: false
      };
    }
  }

  /**
   * Marquer un message comme échoué (si erreur d'envoi)
   * @param {number} groupId
   * @param {string} tempId - ID temporaire du message
   */
  function markMessageAsFailed(groupId, tempId) {
    if (!groupMessages.value[groupId]) return;

    const message = groupMessages.value[groupId].find(m => m.tempId === tempId);
    if (message) {
      message.sending = false;
      message.sendError = true;
    }
  }

  /**
   * Envoyer un message dans un groupe
   * @param {number} groupId
   * @param {string} content
   */
  async function sendMessage(groupId, content) {
    error.value = null;
    try {
      const { data } = await groupsApi.sendMessage(groupId, content);
      const message = data.group_message || data.data || data;

      // Ne PAS ajouter le message ici - le Realtime s'en charge
      // Cela évite la duplication chez l'envoyeur

      return message;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message';
      throw err;
    }
  }

  /**
   * Modifier un message de groupe
   * @param {number} groupId
   * @param {number} messageId
   * @param {string} content
   */
  async function updateMessage(groupId, messageId, content) {
    error.value = null;
    try {
      const { data } = await groupsApi.updateMessage(groupId, messageId, content);
      const updatedMessage = data.group_message || data.data || data;

      // Mettre à jour dans la liste locale
      if (groupMessages.value[groupId]) {
        const index = groupMessages.value[groupId].findIndex(m => m.id === messageId);
        if (index !== -1) {
          groupMessages.value[groupId][index] = updatedMessage;
        }
      }

      return updatedMessage;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la modification du message';
      throw err;
    }
  }

  /**
   * Supprimer un message de groupe
   * @param {number} groupId
   * @param {number} messageId
   */
  async function deleteMessage(groupId, messageId) {
    error.value = null;
    try {
      await groupsApi.deleteMessage(groupId, messageId);

      // Retirer de la liste locale
      if (groupMessages.value[groupId]) {
        groupMessages.value[groupId] = groupMessages.value[groupId].filter(m => m.id !== messageId);
      }

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du message';
      throw err;
    }
  }

  /**
   * Ajouter un message en temps réel (depuis WebSocket)
   * @param {number} groupId - ID du groupe
   * @param {Object} message - Message reçu
   */
  function addRealtimeGroupMessage(groupId, message) {
    if (!groupMessages.value[groupId]) {
      groupMessages.value[groupId] = [];
    }

    // Éviter les doublons
    const exists = groupMessages.value[groupId].some(m => m.id === message.id);
    if (!exists) {
      groupMessages.value[groupId].push(message);
      console.log(`[Groups] ✅ Message temps réel ajouté au groupe ${groupId}:`, message);
    }
  }

  /**
   * Mettre à jour un message en temps réel
   * @param {number} groupId - ID du groupe
   * @param {Object} message - Message mis à jour
   */
  function updateRealtimeGroupMessage(groupId, message) {
    if (!groupMessages.value[groupId]) return;

    const index = groupMessages.value[groupId].findIndex(m => m.id === message.id);
    if (index !== -1) {
      groupMessages.value[groupId][index] = message;
      console.log(`[Groups] ✅ Message temps réel mis à jour dans le groupe ${groupId}:`, message);
    }
  }

  /**
   * Supprimer un message en temps réel
   * @param {number} groupId - ID du groupe
   * @param {number} messageId - ID du message
   */
  function deleteRealtimeGroupMessage(groupId, messageId) {
    if (!groupMessages.value[groupId]) return;

    const index = groupMessages.value[groupId].findIndex(m => m.id === messageId);
    if (index !== -1) {
      groupMessages.value[groupId].splice(index, 1);
      console.log(`[Groups] ✅ Message temps réel supprimé du groupe ${groupId}:`, messageId);
    }
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    groups.value = [];
    currentGroup.value = null;
    groupMessages.value = {};
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    groups,
    currentGroup,
    groupMessages,
    groupMessagesPagination,
    loading,
    error,

    // Getters
    getGroupById,
    getMessagesForGroup,
    sectorialGroups,
    startupOnlyGroups,
    mixedGroups,

    // Actions - Groupes
    loadGroups: fetchGroups, // Alias
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    addMember,
    removeMember,

    // Actions - Messages
    loadGroupMessages: fetchMessages, // Alias
    fetchMessages,
    loadMoreMessages,
    prefetchGroupMessages,
    addOptimisticMessage,
    replaceOptimisticMessage,
    markMessageAsFailed,
    sendMessage,
    updateMessage,
    deleteMessage,

    // Actions - Temps réel
    addRealtimeGroupMessage,
    updateRealtimeGroupMessage,
    deleteRealtimeGroupMessage,

    $reset,
  };
});
