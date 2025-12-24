<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">Créer un groupe</h2>
              <button
                @click="close"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Icon name="X" :size="20" />
              </button>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Group Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom du groupe <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ex: Développeurs Web, Marketing Digital..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                required
              />
            </div>

            <!-- Group Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Type de groupe <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="type in groupTypes"
                  :key="type.value"
                  type="button"
                  @click="form.type = type.value"
                  :class="[
                    'p-4 border-2 rounded-xl transition text-left',
                    form.type === type.value
                      ? 'border-theme bg-theme-light'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <div :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    type.color
                  ]">
                    <Icon :name="type.icon" :size="20" class="text-white" />
                  </div>
                  <h3 class="font-semibold text-sm text-gray-900 mb-1">{{ type.label }}</h3>
                  <p class="text-xs text-gray-500">{{ type.description }}</p>
                </button>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Décrivez l'objectif de ce groupe..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent resize-none"
              />
            </div>

            <!-- Sector (only for sectoral groups) -->
            <div v-if="form.type === 'sectoral'">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <select
                v-model="form.secteur"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              >
                <option value="">Sélectionnez un secteur</option>
                <option v-for="sector in sectors" :key="sector" :value="sector">
                  {{ sector }}
                </option>
              </select>
            </div>

            <!-- Membres -->
            <div v-if="form.type !== 'sectoral'">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Ajouter des membres (optionnel)
              </label>

              <!-- Search Input -->
              <div class="relative mb-3">
                <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="memberSearch"
                  @input="handleMemberSearch"
                  type="text"
                  placeholder="Rechercher des utilisateurs..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent text-sm"
                />
              </div>

              <!-- Search Results -->
              <div v-if="searchLoading" class="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
              <div v-else-if="searchResults.length > 0" class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-3">
                <button
                  v-for="user in searchResults"
                  :key="user.id"
                  type="button"
                  @click="addMember(user)"
                  :disabled="isMemberSelected(user.id)"
                  class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div v-if="user.photo" class="w-8 h-8 rounded-full overflow-hidden">
                    <img :src="user.photo" :alt="user.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-8 h-8 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {{ user.name?.[0]?.toUpperCase() }}
                  </div>
                  <div class="flex-1 text-left text-sm">
                    <p class="font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500">{{ user.startup_name || 'Sans startup' }}</p>
                  </div>
                  <Icon v-if="isMemberSelected(user.id)" name="Check" :size="16" class="text-green-500" />
                </button>
              </div>

              <!-- Membres sélectionnés -->
              <div v-if="form.members.length > 0" class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Membres sélectionnés ({{ form.members.length }})</p>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="member in form.members"
                    :key="member.id"
                    class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    <span class="text-sm text-gray-700">{{ member.name }}</span>
                    <button
                      type="button"
                      @click="removeMember(member.id)"
                      class="text-gray-400 hover:text-red-500 transition"
                    >
                      <Icon name="X" :size="14" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <Button type="button" variant="outline" @click="close" :disabled="creating">
              Annuler
            </Button>
            <Button @click="handleSubmit" :disabled="!isValid || creating">
              <LoadingSpinner v-if="creating" size="sm" class="mr-2" />
              <Icon v-else name="Plus" :size="18" class="mr-2" />
              Créer le groupe
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import { useAuthStore } from '@/stores/authStore'
import { Icon, LoadingSpinner, Button } from '@/components/ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const authUser = computed(() => authStore.user)

const { results: searchResults, loading: searchLoading, search, clear: clearSearch } = useUserSearch()

const form = ref({
  name: '',
  type: 'mixed',
  description: '',
  secteur: '',
  members: []
})

const memberSearch = ref('')
const creating = ref(false)

const allGroupTypes = [
  {
    value: 'sectoral',
    label: 'Sectoriel',
    description: 'Par secteur d\'activité',
    icon: 'Building2',
    color: 'bg-blue-500',
    allowedRoles: ['admin']
  },
  {
    value: 'startup-only',
    label: 'Startup',
    description: 'Membres d\'une startup',
    icon: 'Rocket',
    color: 'bg-purple-500',
    allowedRoles: ['startuper', 'partenaire', 'admin']
  },
  {
    value: 'mixed',
    label: 'Mixte',
    description: 'Startuppers et partners',
    icon: 'Users',
    color: 'bg-green-500',
    allowedRoles: ['partenaire', 'admin']
  }
]

// Filtrer les types de groupes selon le rôle de l'utilisateur
const groupTypes = computed(() => {
  const role = authUser.value?.role
  return allGroupTypes.filter(type => type.allowedRoles.includes(role))
})

// Définir le type par défaut selon le rôle
const defaultType = computed(() => {
  const role = authUser.value?.role
  if (role === 'startuper') return 'startup-only'
  if (role === 'partenaire') return 'startup-only' // Default to startup-only for partner
  if (role === 'admin') return 'mixed'
  return 'mixed'
})

const sectors = [
  'Technologie',
  'Santé',
  'Finance',
  'E-commerce',
  'Éducation',
  'Agriculture',
  'Énergie',
  'Transport',
  'Immobilier',
  'Marketing',
  'Autre'
]

const isValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.type
})

const isMemberSelected = (userId) => {
  return form.value.members.some(m => m.id === userId)
}

function handleMemberSearch() {
  if (memberSearch.value.length >= 2) {
    search(memberSearch.value)
  } else {
    clearSearch()
  }
}

function addMember(user) {
  if (!isMemberSelected(user.id)) {
    form.value.members.push({
      id: user.id,
      name: user.name,
      photo: user.photo
    })
  }
}

function removeMember(userId) {
  form.value.members = form.value.members.filter(m => m.id !== userId)
}

async function handleSubmit() {
  if (!isValid.value || creating.value) return

  creating.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      type: form.value.type,
      description: form.value.description.trim() || null,
      secteur: form.value.type === 'sectoral' ? form.value.secteur : null,
      member_ids: form.value.members.map(m => m.id)
    }

    emit('created', payload)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    creating.value = false
  }
}

function close() {
  emit('close')
}

function resetForm() {
  form.value = {
    name: '',
    type: defaultType.value,
    description: '',
    secteur: '',
    members: []
  }
  memberSearch.value = ''
  clearSearch()
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
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
