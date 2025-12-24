<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-theme-500 to-purple-600 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
                  getGroupColor(group?.type)
                ]">
                  <Icon :name="getGroupIcon(group?.type)" :size="24" class="text-white" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-white">{{ group?.name }}</h2>
                  <p class="text-sm text-white/80">
                    {{ getGroupTypeLabel(group?.type) }}
                  </p>
                </div>
              </div>
              <button
                @click="close"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
              >
                <Icon name="X" :size="20" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Description -->
            <div v-if="group?.description">
              <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="FileText" :size="16" class="text-gray-400" />
                Description
              </h3>
              <p class="text-gray-600 text-sm leading-relaxed">{{ group.description }}</p>
            </div>

            <!-- Sector (for sectoral groups) -->
            <div v-if="group?.secteur">
              <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="Building2" :size="16" class="text-gray-400" />
                Secteur
              </h3>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {{ typeof group.secteur === 'object' ? group.secteur.nom : group.secteur }}
              </span>
            </div>

            <!-- Creator -->
            <div v-if="group?.creator">
              <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="Crown" :size="16" class="text-gray-400" />
                Créateur
              </h3>
              <button
                @click="goToProfile(group.creator)"
                class="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <div v-if="group.creator.photo" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img :src="group.creator.photo" :alt="group.creator.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {{ group.creator.name?.[0]?.toUpperCase() }}
                </div>
                <span class="font-medium text-gray-900">{{ group.creator.name }}</span>
                <Icon name="ChevronRight" :size="16" class="ml-auto text-gray-400" />
              </button>
            </div>

            <!-- Members -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="Users" :size="16" class="text-gray-400" />
                Membres ({{ members.length }})
              </h3>

              <div v-if="members.length === 0" class="text-center py-6 text-gray-500">
                <Icon name="Users" :size="32" class="mx-auto mb-2 opacity-50" />
                <p class="text-sm">Aucun membre</p>
              </div>

              <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                <button
                  v-for="member in members"
                  :key="member.id"
                  @click="goToProfile(member)"
                  class="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <div v-if="member.photo" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img :src="member.photo" :alt="member.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {{ member.name?.[0]?.toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate text-left">{{ member.name }}</p>
                    <p class="text-xs text-gray-500 capitalize text-left">{{ member.role || 'Membre' }}</p>
                  </div>
                  <span v-if="member.id === group?.created_by" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex-shrink-0">
                    Créateur
                  </span>
                  <Icon name="ChevronRight" :size="16" class="text-gray-400 flex-shrink-0" />
                </button>
              </div>
            </div>

            <!-- Add Member (only for creator/admin) -->
            <div v-if="canManageMembers" class="pt-4 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="UserPlus" :size="16" class="text-gray-400" />
                Ajouter un membre
              </h3>

              <!-- Search Input -->
              <div class="relative">
                <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="memberSearch"
                  @input="handleMemberSearch"
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent text-sm"
                />
              </div>

              <!-- Search Results -->
              <div v-if="searchLoading" class="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
              <div v-else-if="searchResults.length > 0" class="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                <button
                  v-for="user in searchResults"
                  :key="user.id"
                  type="button"
                  @click="addMember(user)"
                  :disabled="isMember(user.id)"
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
                  </div>
                  <Icon v-if="isMember(user.id)" name="Check" :size="16" class="text-green-500" />
                  <Icon v-else name="Plus" :size="16" class="text-theme-500" />
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 flex justify-end">
            <Button variant="outline" @click="close">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupsStore } from '@/stores/groupsStore'
import { useAuthStore } from '@/stores/authStore'
import { useUserSearch } from '@/composables/useUserSearch'
import { useToast } from '@/composables/useToast'
import { Icon, LoadingSpinner, Button } from '@/components/ui'

const router = useRouter()
const props = defineProps({
  show: { type: Boolean, default: false },
  group: { type: Object, default: null }
})

const emit = defineEmits(['close', 'memberAdded'])

const groupsStore = useGroupsStore()
const authStore = useAuthStore()
const toast = useToast()
const { results: searchResults, loading: searchLoading, search, clear: clearSearch } = useUserSearch()

const memberSearch = ref('')

const members = computed(() => {
  return props.group?.members || []
})

const canManageMembers = computed(() => {
  const user = authStore.user
  if (!user || !props.group) return false
  return props.group.created_by === user.id || user.role === 'admin'
})

function isMember(userId) {
  return members.value.some(m => m.id === userId)
}

function handleMemberSearch() {
  if (memberSearch.value.length >= 2) {
    search(memberSearch.value)
  } else {
    clearSearch()
  }
}

async function addMember(user) {
  if (!props.group || isMember(user.id)) return

  try {
    await groupsStore.addMember(props.group.id, user.id)
    toast.success(`${user.name} a été ajouté au groupe`)
    memberSearch.value = ''
    clearSearch()
    emit('memberAdded', user)
  } catch (error) {
    console.error('Error adding member:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du membre')
  }
}

function getGroupColor(type) {
  switch (type) {
    case 'sectoral': return 'bg-blue-500'
    case 'startup-only': return 'bg-purple-500'
    case 'mixed': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

function getGroupIcon(type) {
  switch (type) {
    case 'sectoral': return 'Building2'
    case 'startup-only': return 'Rocket'
    case 'mixed': return 'Users'
    default: return 'Users'
  }
}

function getGroupTypeLabel(type) {
  switch (type) {
    case 'sectoral': return 'Groupe Sectoriel'
    case 'startup-only': return 'Groupe Startup'
    case 'mixed': return 'Groupe Mixte'
    default: return 'Groupe'
  }
}

function close() {
  memberSearch.value = ''
  clearSearch()
  emit('close')
}

function goToProfile(user) {
  if (!user?.id) return

  // Fermer le modal
  close()

  // Déterminer le type de profil selon le rôle
  if (user.role === 'startuper' && user.startup_id) {
    router.push(`/startups/${user.startup_id}`)
  } else if (user.id === authStore.user?.id) {
    router.push('/profile')
  } else {
    // Pour les autres utilisateurs, rediriger vers leur page publique si disponible
    router.push(`/profile/${user.id}`)
  }
}

watch(() => props.show, (newValue) => {
  if (!newValue) {
    memberSearch.value = ''
    clearSearch()
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
