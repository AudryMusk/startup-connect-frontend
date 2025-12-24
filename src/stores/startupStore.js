import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import startupApi from '@/services/startup';
import { useCache } from '@/utils/cache';

export const useStartupStore = defineStore('startup', () => {
  // ===== STATE =====
  const myStartup = ref(null);
  const startups = ref([]);
  const currentStartup = ref(null);
  const members = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ===== CACHE SYSTEM avec useCache =====
  // Cache pour la recherche (5 minutes)
  const searchCache = useCache('startupSearch', 5 * 60 * 1000);
  // Cache pour les détails des startups (5 minutes)
  const startupDetailsCache = useCache('startupDetails', 5 * 60 * 1000);
  // Cache pour les membres (3 minutes)
  const membersCache = useCache('startupMembers', 3 * 60 * 1000);
  // Cache pour la liste des startups (3 minutes)
  const startupsListCache = useCache('startupsList', 3 * 60 * 1000);

  // ===== GETTERS =====
  const hasStartup = computed(() => !!myStartup.value);

  const startupById = computed(() => {
    return (id) => startups.value.find(s => s.id === id);
  });

  const isMyStartup = computed(() => {
    return (id) => myStartup.value?.id === id;
  });

  const totalStartups = computed(() => startups.value.length);

  // ===== ACTIONS =====

  /**
   * Récupère la startup de l'utilisateur connecté
   */
  async function fetchMyStartup(forceRefresh = false) {
    // Vérifier le cache
    if (!forceRefresh) {
      const cached = startupDetailsCache.get({ myStartup: true });
      if (cached) {
        myStartup.value = cached;
        return myStartup.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.getMyStartup();
      myStartup.value = data.data || data;

      // Mettre en cache
      startupDetailsCache.set({ myStartup: true }, myStartup.value);

      return myStartup.value;
    } catch (err) {
      // Si 404, l'utilisateur n'a pas de startup - ce n'est pas une erreur
      if (err.response?.status === 404) {
        myStartup.value = null;
        return null;
      }
      error.value = err.response?.data?.message || 'Erreur lors du chargement de votre startup';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Recherche des startups avec système de cache
   * @param {string} query - Terme de recherche
   * @param {object} params - Paramètres additionnels (sector, status, etc.)
   * @param {boolean} forceRefresh - Forcer le rafraîchissement du cache
   */
  async function search(query, params = {}, forceRefresh = false) {
    const cacheParams = { q: query || '', ...params };

    // Vérifier le cache si pas de forceRefresh
    if (!forceRefresh) {
      const cached = searchCache.get(cacheParams);
      if (cached) {
        startups.value = cached;
        return startups.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.search({ q: query, ...params });
      const results = data.data || data;
      startups.value = results;

      // Mettre en cache
      searchCache.set(cacheParams, results);

      return startups.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la recherche';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Vide tous les caches
   */
  function clearCache() {
    searchCache.invalidate();
    startupDetailsCache.invalidate();
    membersCache.invalidate();
    startupsListCache.invalidate();
  }

  /**
   * Récupère toutes les startups
   * @param {object} params - Filtres (page, per_page, sector, etc.)
   * @param {boolean} forceRefresh - Forcer le rafraîchissement
   */
  async function fetchStartups(params = {}, forceRefresh = false) {
    // Vérifier le cache
    if (!forceRefresh) {
      const cached = startupsListCache.get(params);
      if (cached) {
        startups.value = cached;
        return startups.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.list(params);
      startups.value = data.data || data;

      // Mettre en cache
      startupsListCache.set(params, startups.value);

      return startups.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des startups';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Récupère les détails d'une startup avec cache
   * @param {number} id - ID de la startup
   * @param {boolean} forceRefresh - Forcer le rafraîchissement
   */
  async function fetchStartup(id, forceRefresh = false) {
    // Vérifier le cache
    if (!forceRefresh) {
      const cached = startupDetailsCache.get({ id });
      if (cached) {
        currentStartup.value = cached;
        return currentStartup.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.get(id);
      currentStartup.value = data.data || data;

      // Mettre en cache
      startupDetailsCache.set({ id }, currentStartup.value);

      // Mettre à jour dans la liste si présent
      const index = startups.value.findIndex(s => s.id === id);
      if (index !== -1) {
        startups.value[index] = currentStartup.value;
      }

      return currentStartup.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de la startup';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Précharge une startup au survol pour affichage instantané
   */
  function prefetchStartup(id) {
    // Ne pas précharger si déjà en cache
    const cached = startupDetailsCache.get({ id });
    if (cached) return;

    // Précharger en arrière-plan
    startupApi.get(id).then(({ data }) => {
      startupDetailsCache.set({ id }, data.data || data);
    }).catch(() => {});
  }

  /**
   * Récupère les membres d'une startup avec cache
   * @param {number} startupId - ID de la startup
   * @param {boolean} forceRefresh - Forcer le rafraîchissement
   */
  async function fetchMembers(startupId, forceRefresh = false) {
    // Vérifier le cache
    if (!forceRefresh) {
      const cached = membersCache.get({ startupId });
      if (cached) {
        members.value = cached;
        return members.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.getMembers(startupId);
      members.value = data.data || data;

      // Mettre en cache
      membersCache.set({ startupId }, members.value);

      return members.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des membres';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Créer une nouvelle startup
   * @param {object} payload - Données de la startup (name, description, sector, etc.)
   */
  async function createStartup(payload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.create(payload);
      myStartup.value = data.data || data;

      // Ajouter en tête de liste
      startups.value.unshift(myStartup.value);

      // Invalider les caches après création
      searchCache.invalidate();
      startupsListCache.invalidate();
      startupDetailsCache.set({ myStartup: true }, myStartup.value);

      return myStartup.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de la startup';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Mettre à jour une startup
   * @param {number} id - ID de la startup
   * @param {object} payload - Données à mettre à jour
   */
  async function updateStartup(id, payload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.update(id, payload);
      const updated = data.data || data;

      // Mettre à jour ma startup si c'est la mienne
      if (myStartup.value?.id === id) {
        myStartup.value = updated;
      }

      // Mettre à jour currentStartup
      if (currentStartup.value?.id === id) {
        currentStartup.value = updated;
      }

      // Mettre à jour dans la liste
      const index = startups.value.findIndex(s => s.id === id);
      if (index !== -1) {
        startups.value[index] = updated;
      }

      // Invalider les caches après modification
      startupDetailsCache.set({ id }, updated);
      if (myStartup.value?.id === id) {
        startupDetailsCache.set({ myStartup: true }, updated);
      }
      searchCache.invalidate();

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Supprimer une startup
   * @param {number} id - ID de la startup
   */
  async function deleteStartup(id) {
    loading.value = true;
    error.value = null;
    try {
      await startupApi.delete(id);

      // Supprimer ma startup si c'est la mienne
      if (myStartup.value?.id === id) {
        myStartup.value = null;
      }

      // Supprimer currentStartup
      if (currentStartup.value?.id === id) {
        currentStartup.value = null;
      }

      // Supprimer de la liste
      startups.value = startups.value.filter(s => s.id !== id);

      // Invalider tous les caches après suppression
      clearCache();

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Envoyer une demande d'adhésion à une startup
   * @param {number} startupId - ID de la startup
   * @param {object} payload - Message de motivation, etc.
   */
  async function sendJoinRequest(startupId, payload = {}) {
    error.value = null;
    try {
      const { data } = await startupApi.sendJoinRequest(startupId, payload);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur lors de l'envoi de la demande";
      throw err;
    }
  }

  /**
   * Uploader le PDF d'inscription (Kbis, etc.)
   * @param {number} startupId - ID de la startup
   * @param {File} file - Fichier PDF
   */
  async function uploadRegisterPdf(startupId, file) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await startupApi.uploadRegisterPdf(startupId, file);

      // Mettre à jour startup avec nouveau document
      if (myStartup.value?.id === startupId) {
        myStartup.value = { ...myStartup.value, register_document: data.register_document };
      }

      if (currentStartup.value?.id === startupId) {
        currentStartup.value = { ...currentStartup.value, register_document: data.register_document };
      }

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur lors de l'upload du document";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Autocomplete de startups pour recherche rapide
   * @param {string} query - Terme de recherche
   * @returns {Array} Liste de startups correspondantes
   */
  async function autocomplete(query) {
    if (!query || query.length < 2) {
      return [];
    }

    error.value = null;
    try {
      const { data } = await startupApi.autocomplete(query);
      return data.data || data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur autocomplete';
      throw err;
    }
  }

  /**
   * Réinitialise le store
   */
  function $reset() {
    myStartup.value = null;
    startups.value = [];
    currentStartup.value = null;
    members.value = [];
    loading.value = false;
    error.value = null;
    // Invalider tous les caches
    clearCache();
  }

  // ===== RETURN =====
  return {
    // State
    myStartup,
    startups,
    currentStartup,
    members,
    loading,
    error,

    // Getters
    hasStartup,
    startupById,
    isMyStartup,
    totalStartups,

    // Actions
    fetchMyStartup,
    search,
    clearCache,
    fetchStartups,
    fetchStartup,
    prefetchStartup,
    fetchMembers,
    createStartup,
    updateStartup,
    deleteStartup,
    sendJoinRequest,
    uploadRegisterPdf,
    autocomplete,
    $reset,
  };
});
