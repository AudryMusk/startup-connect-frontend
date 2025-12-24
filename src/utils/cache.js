/**
 * Système de cache intelligent avec TTL, invalidation et persistance localStorage
 */

const STORAGE_PREFIX = 'sc_cache_';
const PERSISTENT_KEYS = ['conversations', 'groups', 'notifications']; // Clés à persister

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    // Restaurer le cache depuis localStorage au démarrage
    this.restoreFromStorage()
  }

  /**
   * Restaure le cache depuis localStorage
   */
  restoreFromStorage() {
    try {
      PERSISTENT_KEYS.forEach(prefix => {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${prefix}`);
        if (stored) {
          const { data, timestamp } = JSON.parse(stored);
          // Vérifier que les données ne sont pas trop vieilles (max 30 min)
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            this.cache.set(prefix, data);
            this.timestamps.set(prefix, timestamp);
          } else {
            localStorage.removeItem(`${STORAGE_PREFIX}${prefix}`);
          }
        }
      });
    } catch (e) {
      console.warn('Failed to restore cache from storage:', e);
    }
  }

  /**
   * Persiste une clé dans localStorage si elle est dans la liste persistante
   */
  persistToStorage(key, value) {
    try {
      // Vérifier si la clé doit être persistée
      const shouldPersist = PERSISTENT_KEYS.some(prefix => key.startsWith(prefix));
      if (shouldPersist) {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify({
          data: value,
          timestamp: Date.now()
        }));
      }
    } catch (e) {
      // Storage plein ou indisponible
      console.warn('Failed to persist cache to storage:', e);
    }
  }

  /**
   * Génère une clé de cache à partir de params
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}${sortedParams ? `::${sortedParams}` : ''}`
  }

  /**
   * Récupère une valeur du cache si valide
   * @param {string} key - Clé du cache
   * @param {number} ttl - Time to live en millisecondes (défaut: 5 minutes)
   * @returns {any|null} Valeur du cache ou null si expiré/inexistant
   */
  get(key, ttl = 5 * 60 * 1000) {
    if (!this.cache.has(key)) return null

    const timestamp = this.timestamps.get(key)
    const now = Date.now()

    // Vérifier si le cache est expiré
    if (now - timestamp > ttl) {
      this.cache.delete(key)
      this.timestamps.delete(key)
      // Nettoyer aussi le localStorage
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé du cache
   * @param {any} value - Valeur à stocker
   */
  set(key, value) {
    this.cache.set(key, value)
    this.timestamps.set(key, Date.now())
    // Persister si nécessaire
    this.persistToStorage(key, value)
  }

  /**
   * Invalide les entrées du cache correspondant à un préfixe
   * @param {string} prefix - Préfixe des clés à invalider
   */
  invalidate(prefix) {
    const keysToDelete = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.timestamps.delete(key)
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    })
  }

  /**
   * Vide tout le cache
   */
  clear() {
    this.cache.clear()
    this.timestamps.clear()
    // Nettoyer le localStorage
    PERSISTENT_KEYS.forEach(prefix => {
      localStorage.removeItem(`${STORAGE_PREFIX}${prefix}`)
    })
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instance singleton
export const cacheManager = new CacheManager()

/**
 * Hook pour utiliser le cache dans les composables
 * @param {string} prefix - Préfixe pour identifier le type de cache
 * @param {number} ttl - Time to live en millisecondes
 */
export function useCache(prefix, ttl = 5 * 60 * 1000) {
  return {
    get: (params = {}) => {
      const key = cacheManager.generateKey(prefix, params)
      return cacheManager.get(key, ttl)
    },

    set: (params = {}, value) => {
      const key = cacheManager.generateKey(prefix, params)
      cacheManager.set(key, value)
    },

    invalidate: () => {
      cacheManager.invalidate(prefix)
    },

    clear: () => {
      cacheManager.clear()
    }
  }
}
