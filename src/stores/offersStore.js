import { defineStore } from 'pinia';
import { ref } from 'vue';
import offersApi from '@/services/offers.js';
import { useCache } from '@/utils/cache';

export const useOffersStore = defineStore('offers', () => {
  const list = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const currentOffer = ref(null);

  // Cache avec TTL de 3 minutes pour les offres
  const offersCache = useCache('offers', 3 * 60 * 1000);
  // Cache pour les offres individuelles (5 minutes)
  const offerDetailsCache = useCache('offerDetails', 5 * 60 * 1000);
  // Cache pour les offres sauvegardées (2 minutes)
  const savedOffersCache = useCache('savedOffers', 2 * 60 * 1000);

  /**
   * Charger les offres avec cache intelligent
   */
  async function fetch(params = {}, forceRefresh = false) {
    // Vérifier le cache si pas de forceRefresh
    if (!forceRefresh) {
      const cached = offersCache.get(params);
      if (cached) {
        list.value = cached.list;
        total.value = cached.total;
        return cached;
      }
    }

    loading.value = true;
    try {
      const { data } = await offersApi.list(params);
      list.value = data.data || data;
      total.value = data.total || (data.data ? data.data.length : list.value.length);

      // Mettre en cache
      offersCache.set(params, { list: list.value, total: total.value });

      return data;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Récupérer une offre avec cache
   */
  async function get(id, forceRefresh = false) {
    // Vérifier le cache
    if (!forceRefresh) {
      const cached = offerDetailsCache.get({ id });
      if (cached) {
        currentOffer.value = cached;
        return cached;
      }
    }

    const { data } = await offersApi.get(id);
    const offer = data.data || data;
    currentOffer.value = offer;

    // Mettre en cache
    offerDetailsCache.set({ id }, offer);

    return offer;
  }

  /**
   * Précharger une offre au survol
   */
  function prefetchOffer(id) {
    // Ne pas précharger si déjà en cache
    const cached = offerDetailsCache.get({ id });
    if (cached) return;

    // Précharger en arrière-plan
    offersApi.get(id).then(({ data }) => {
      offerDetailsCache.set({ id }, data.data || data);
    }).catch(() => {});
  }

  async function create(payload) {
    const { data } = await offersApi.create(payload);
    // Invalider le cache après création
    offersCache.invalidate();
    return data;
  }

  async function saveOffer(id) {
    const result = await offersApi.favorite(id);
    // Invalider le cache des offres sauvegardées
    savedOffersCache.invalidate();
    return result;
  }

  async function apply(id, form) {
    return offersApi.apply(id, form);
  }

  /**
   * Récupérer les offres sauvegardées avec cache
   */
  async function saved(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = savedOffersCache.get({});
      if (cached) return cached;
    }

    const { data } = await offersApi.getSaved();
    const offers = data.data || data;
    savedOffersCache.set({}, offers);
    return offers;
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    list.value = [];
    total.value = 0;
    currentOffer.value = null;
    loading.value = false;
    offersCache.invalidate();
    offerDetailsCache.invalidate();
    savedOffersCache.invalidate();
  }

  return {
    list,
    total,
    loading,
    currentOffer,
    fetch,
    get,
    create,
    saveOffer,
    apply,
    saved,
    prefetchOffer,
    $reset
  };
});
