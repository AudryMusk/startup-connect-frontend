import { defineStore } from 'pinia';
import { ref } from 'vue';
import applicationsApi from '@/services/applications.js';
import { useCache } from '@/utils/cache';

export const useApplicationsStore = defineStore('applications', () => {
  const myApplications = ref([]);
  const receivedApplications = ref([]);
  const currentApplication = ref(null);
  const loading = ref(false);
  const total = ref(0);

  // Cache avec TTL de 2 minutes pour les candidatures
  const myAppsCache = useCache('myApplications', 2 * 60 * 1000);
  const receivedAppsCache = useCache('receivedApplications', 2 * 60 * 1000);

  /**
   * Charger mes candidatures avec cache
   */
  async function fetchMyApplications(params = {}, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = myAppsCache.get(params);
      if (cached) {
        myApplications.value = cached.list;
        total.value = cached.total;
        return cached;
      }
    }

    loading.value = true;
    try {
      const { data } = await applicationsApi.getMyApplications(params);
      const list = data.data || data;
      myApplications.value = Array.isArray(list) ? list : [];
      total.value = data.count || myApplications.value.length;

      myAppsCache.set(params, { list: myApplications.value, total: total.value });

      return data;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Charger les candidatures reçues (partenaires)
   */
  async function fetchReceivedApplications(params = {}, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = receivedAppsCache.get(params);
      if (cached) {
        receivedApplications.value = cached.list;
        return cached;
      }
    }

    loading.value = true;
    try {
      const { data } = await applicationsApi.getReceivedApplications(params);
      const list = data.data || data;
      receivedApplications.value = Array.isArray(list) ? list : [];

      receivedAppsCache.set(params, { list: receivedApplications.value, total: receivedApplications.value.length });

      return data;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Charger les candidatures pour une offre spécifique
   */
  async function fetchForOffer(offerId, params = {}) {
    loading.value = true;
    try {
      const { data } = await applicationsApi.getForOffer(offerId, params);
      return data.data || data;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtenir les détails d'une candidature
   */
  async function getApplication(id) {
    const { data } = await applicationsApi.get(id);
    currentApplication.value = data.data || data;
    return currentApplication.value;
  }

  /**
   * Obtenir les infos pour postuler à une offre
   */
  async function getApplyInfo(offerId) {
    const { data } = await applicationsApi.getApplyInfo(offerId);
    return data.data || data;
  }

  /**
   * Postuler à une offre
   */
  async function apply(offerId, formData) {
    const { data } = await applicationsApi.apply(offerId, formData);
    // Invalider le cache après candidature
    myAppsCache.invalidate();
    return data;
  }

  /**
   * Accepter une candidature
   */
  async function acceptApplication(id, message = null) {
    const { data } = await applicationsApi.accept(id, message ? { message } : {});
    // Invalider les caches
    receivedAppsCache.invalidate();
    return data;
  }

  /**
   * Rejeter une candidature
   */
  async function rejectApplication(id, reason = null) {
    const { data } = await applicationsApi.reject(id, reason ? { reason } : {});
    // Invalider les caches
    receivedAppsCache.invalidate();
    return data;
  }

  /**
   * Retirer ma candidature
   */
  async function withdrawApplication(id) {
    const { data } = await applicationsApi.withdraw(id);
    // Supprimer du cache local
    myApplications.value = myApplications.value.filter(a => a.id !== id);
    myAppsCache.invalidate();
    return data;
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    myApplications.value = [];
    receivedApplications.value = [];
    currentApplication.value = null;
    loading.value = false;
    total.value = 0;
    myAppsCache.invalidate();
    receivedAppsCache.invalidate();
  }

  return {
    myApplications,
    receivedApplications,
    currentApplication,
    loading,
    total,
    fetchMyApplications,
    fetchReceivedApplications,
    fetchForOffer,
    getApplication,
    getApplyInfo,
    apply,
    acceptApplication,
    rejectApplication,
    withdrawApplication,
    $reset
  };
});
