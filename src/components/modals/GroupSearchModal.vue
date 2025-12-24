<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeModal">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-900">Rechercher un groupe</h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-full transition">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Input -->
          <div class="p-6 border-b border-gray-200">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un groupe par nom ou description..."
                class="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                @input="handleSearch"
              />
              <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Minimum 2 caractères
            </p>
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <p class="text-gray-500">Recherche en cours...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="text-center py-12">
              <p class="text-red-600">{{ error }}</p>
            </div>

            <!-- No results -->
            <div v-else-if="searchQuery.length >= 2 && !hasResults && !loading" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-500 text-lg">Aucun groupe trouvé</p>
              <p class="text-gray-400 text-sm mt-2">Essayez avec d'autres termes de recherche</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="searchQuery.length < 2" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-500">Tapez pour rechercher des groupes</p>
            </div>

            <!-- Results List -->
            <div v-else class="space-y-3">
              <div
                v-for="group in results"
                :key="group.id"
                @click="selectGroup(group)"
                class="p-4 bg-gray-50 hover:bg-purple-50 rounded-xl cursor-pointer transition border border-transparent hover:border-purple-200"
              >
                <div class="flex items-start space-x-4">
                  <!-- Group Icon -->
                  <div class="flex-shrink-0">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="getGroupColor(group.type)">
                      <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Group Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                      <h3 class="font-semibold text-gray-900 truncate">{{ group.name }}</h3>
                      <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getTypeBadge(group.type)">
                        {{ getTypeLabel(group.type) }}
                      </span>
                    </div>

                    <p v-if="group.description" class="text-sm text-gray-600 line-clamp-2 mb-2">
                      {{ group.description }}
                    </p>

                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                      <span v-if="group.secteur" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ group.secteur }}
                      </span>
                      <span v-if="group.members_count" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {{ group.members_count }} membre{{ group.members_count > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>

                  <!-- Arrow -->
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGroupSearch } from '@/composables/useGroupSearch'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const { results, loading, error, search, clear, hasResults } = useGroupSearch()
const searchQuery = ref('')
let searchTimeout = null

const handleSearch = () => {
  // Debounce de 300ms
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search(searchQuery.value)
  }, 300)
}

const selectGroup = (group) => {
  emit('select', group)
  closeModal()
}

const closeModal = () => {
  searchQuery.value = ''
  clear()
  emit('close')
}

// Nettoyer quand le modal se ferme
watch(() => props.show, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
    clear()
  }
})

const getGroupColor = (type) => {
  const colors = {
    'sectoral': 'bg-blue-500',
    'startup-only': 'bg-purple-500',
    'mixed': 'bg-green-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getTypeBadge = (type) => {
  const badges = {
    'sectoral': 'bg-blue-100 text-blue-800',
    'startup-only': 'bg-purple-100 text-purple-800',
    'mixed': 'bg-green-100 text-green-800'
  }
  return badges[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const labels = {
    'sectoral': 'Sectoriel',
    'startup-only': 'Startups',
    'mixed': 'Mixte'
  }
  return labels[type] || type
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
