import { ref, computed } from 'vue'
import { groupsApi } from '@/services/groups'
import { useCache } from '@/utils/cache'

export function useGroupSearch() {
  const results = ref([])
  const loading = ref(false)
  const query = ref('')
  const error = ref(null)

  // Cache avec TTL de 2 minutes (les groupes changent peu)
  const cache = useCache('group-search', 2 * 60 * 1000)

  /**
   * Rechercher des groupes disponibles avec cache intelligent
   * @param {string} searchQuery - Requête de recherche
   */
  const search = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      results.value = []
      return
    }

    // Vérifier le cache d'abord
    const cachedResults = cache.get({ q: searchQuery })

    if (cachedResults) {
      results.value = cachedResults
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data } = await groupsApi.search(searchQuery)
      const searchResults = data.data || data

      // Stocker dans le cache
      cache.set({ q: searchQuery }, searchResults)
      results.value = searchResults
    } catch (e) {
      error.value = e.message
      results.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Effacer les résultats
   */
  const clear = () => {
    results.value = []
    query.value = ''
    error.value = null
  }

  /**
   * Invalider le cache de recherche de groupes
   */
  const invalidateCache = () => {
    cache.invalidate()
  }

  const hasResults = computed(() => results.value.length > 0)

  return {
    results,
    loading,
    query,
    error,
    search,
    clear,
    invalidateCache,
    hasResults
  }
}
