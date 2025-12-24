import { defineStore } from 'pinia';
import { ref } from 'vue';
import startupService from '@/services/startup';
import { useCache } from '@/utils/cache';

export const useSearchStore = defineStore('search', () => {
  const suggestions = ref([]);
  const loading = ref(false);

  // Cache pour l'autocomplete avec TTL de 2 minutes
  const autocompleteCache = useCache('autocomplete', 2 * 60 * 1000);

  /**
   * Autocomplete des startups avec cache intelligent
   * @param {string} q - Le terme de recherche
   */
  async function autocompleteStartups(q) {
    // Ne pas chercher si terme trop court
    if (!q || q.length < 2) {
      suggestions.value = [];
      return [];
    }

    // Vérifier le cache
    const cached = autocompleteCache.get({ q });
    if (cached) {
      suggestions.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await startupService.search({ q });
      const results = response.data?.data || response.data || [];

      suggestions.value = results;

      // Mettre en cache
      autocompleteCache.set({ q }, results);

      return results;
    } catch (error) {
      console.error("Erreur d'autocomplete:", error);
      suggestions.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Effacer les suggestions
   */
  function clearSuggestions() {
    suggestions.value = [];
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    suggestions.value = [];
    loading.value = false;
    autocompleteCache.invalidate();
  }

  return {
    suggestions,
    loading,
    autocompleteStartups,
    clearSuggestions,
    $reset
  };
});
