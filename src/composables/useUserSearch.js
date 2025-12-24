import { ref, computed } from 'vue'
import usersApi from '@/services/users'
import { useCache } from '@/utils/cache'

export function useUserSearch() {
  const results = ref([])
  const loading = ref(false)
  const query = ref('')
  const error = ref(null)

  // Cache avec TTL de 3 minutes (les utilisateurs ne changent pas souvent)
  const cache = useCache('user-search', 3 * 60 * 1000)

  /**
   * Rechercher des utilisateurs avec cache intelligent
   * @param {string} searchQuery - Requête de recherche
   * @param {Object} filters - Filtres additionnels (role, etc.)
   */
  const search = async (searchQuery, filters = {}) => {
    if (!searchQuery || searchQuery.length < 2) {
      results.value = []
      return
    }

    // Vérifier le cache d'abord
    const params = { q: searchQuery, ...filters }
    const cachedResults = cache.get(params)

    if (cachedResults) {
      results.value = cachedResults
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data } = await usersApi.search({
        ...params,
        per_page: 10
      })
      const searchResults = data.data || data

      // Stocker dans le cache
      cache.set(params, searchResults)
      results.value = searchResults
    } catch (e) {
      error.value = e.message
      results.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Effacer les résultats et le cache
   */
  const clear = () => {
    results.value = []
    query.value = ''
    error.value = null
  }

  /**
   * Invalider le cache de recherche utilisateur
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
