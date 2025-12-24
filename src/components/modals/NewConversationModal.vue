<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900">Nouvelle conversation</h2>
              <button
                @click="close"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Icon name="X" :size="20" />
              </button>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Rechercher un utilisateur..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                autofocus
              />
            </div>
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>

            <!-- Empty State -->
            <div v-else-if="!searchQuery" class="text-center py-8">
              <Icon name="Users" :size="48" class="mx-auto text-gray-300 mb-4" />
              <p class="text-gray-500">Recherchez un utilisateur pour démarrer une conversation</p>
            </div>

            <!-- No Results -->
            <div v-else-if="!hasResults && !loading" class="text-center py-8">
              <Icon name="SearchX" :size="48" class="mx-auto text-gray-300 mb-4" />
              <p class="text-gray-500">Aucun utilisateur trouvé</p>
              <p class="text-sm text-gray-400 mt-2">Essayez avec un autre nom</p>
            </div>

            <!-- Results List -->
            <div v-else class="space-y-2">
              <button
                v-for="user in results"
                :key="user.id"
                @click="selectUser(user)"
                class="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition group"
              >
                <!-- Avatar -->
                <div v-if="user.photo" class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img :src="user.photo" :alt="user.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {{ user.name?.[0]?.toUpperCase() }}
                </div>

                <!-- User Info -->
                <div class="flex-1 text-left min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate group-hover:text-theme transition">
                    {{ user.name }}
                  </h3>
                  <p class="text-sm text-gray-500 truncate">
                    {{ getRoleLabel(user.role) }}
                    <span v-if="user.startup_name" class="ml-2">• {{ user.startup_name }}</span>
                  </p>
                </div>

                <!-- Action -->
                <Icon name="MessageCircle" :size="20" class="text-gray-400 group-hover:text-theme transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import { Icon, LoadingSpinner } from '@/components/ui'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'select'])

const { results, loading, search, clear, hasResults } = useUserSearch()
const searchQuery = ref('')
let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length >= 2) {
      search(searchQuery.value.trim())
    } else {
      clear()
    }
  }, 300)
}

const selectUser = (user) => {
  emit('select', user)
  close()
}

const close = () => {
  searchQuery.value = ''
  clear()
  emit('close')
}

const getRoleLabel = (role) => {
  const labels = {
    startuper: 'Startuper',
    partner: 'Partenaire',
    admin: 'Admin'
  }
  return labels[role] || role
}

// Clear search when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    searchQuery.value = ''
    clear()
  }
})
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
