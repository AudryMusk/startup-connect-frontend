<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="!organization" class="max-w-4xl mx-auto px-4 py-12">
    <Alert type="error">Organisation non trouvée</Alert>
    <Button @click="router.push('/')" class="mt-4">Retour à l'accueil</Button>
  </div>

  <div v-else class="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0 py-8">
    <!-- Back Button -->
    <button @click="router.back()"
      class="flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-theme transition text-sm md:text-base">
      <Icon name="ChevronLeft" :size="18" />
      <span class="font-medium">Retour</span>
    </button>

    <!-- Header Card -->
    <Card class="relative overflow-hidden">
      <!-- Cover -->
      <div class="h-32 md:h-48 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

      <!-- Content -->
      <div class="px-4 md:px-8 pb-4 md:pb-8">
        <!-- Logo -->
        <div
          class="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 md:-mt-16 mb-4 md:mb-6 gap-3 sm:gap-0">
          <div
            class="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
            <img v-if="organization.logo_url" :src="getImageUrl(organization.logo_url)" :alt="organization.name"
              class="w-full h-full object-cover" />
            <span v-else class="text-3xl md:text-4xl font-bold text-blue-600">
              {{ organization.name[0] }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:gap-3">
            <Button v-if="isOwner" variant="outline" size="sm" @click="editOrganization">
              <Icon name="Edit" :size="14" />
              <span class="hidden sm:inline">Modifier</span>
            </Button>
            <Button v-if="organization.website" variant="gradient" size="sm" @click="openWebsite">
              <Icon name="ExternalLink" :size="14" />
              <span class="hidden sm:inline">Site web</span>
            </Button>
          </div>
        </div>

        <!-- Title & Info -->
        <div class="space-y-3 md:space-y-4">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 md:gap-3 mb-2">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {{ organization.name }}
                </h1>
                <Badge color="blue" variant="outline">Organisation</Badge>
              </div>
              <div class="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                <span v-if="organization.city" class="flex items-center gap-1">
                  <Icon name="MapPin" :size="14" />
                  {{ organization.city }}, {{ organization.country }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="Users" :size="14" />
                  {{ members.length }} membre{{ members.length > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>

          <p v-if="organization.description" class="text-gray-700 text-sm md:text-lg leading-relaxed">
            {{ organization.description }}
          </p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-4 md:space-y-6">
        <!-- About -->
        <Card>
          <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <Icon name="Info" class="text-blue-600" :size="18" />
            À propos
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>{{ organization.description || 'Aucune description disponible pour le moment.' }}</p>
          </div>
        </Card>

        <!-- Team Members -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Users" class="text-blue-600" />
            Équipe ({{ members.length }})
          </h2>

          <p v-if="members.length === 0" class="text-gray-500 text-sm">
            Aucun membre pour le moment
          </p>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="member in members" :key="member.id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              @click="router.push(`/users/${member.id}`)">
              <div v-if="member.photo" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="getImageUrl(member.photo)" :alt="member.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {{ member.name?.[0] || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ member.name }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Contact Info -->
        <Card>
          <h3 class="font-bold mb-4">Contact & Infos</h3>
          <div class="space-y-3 text-sm">
            <div v-if="organization.email" class="flex items-start gap-2">
              <Icon name="Mail" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Email</p>
                <p class="font-semibold">{{ organization.email }}</p>
              </div>
            </div>

            <div v-if="organization.phone" class="flex items-start gap-2">
              <Icon name="Phone" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Téléphone</p>
                <p class="font-semibold">{{ organization.phone }}</p>
              </div>
            </div>

            <div v-if="organization.address" class="flex items-start gap-2">
              <Icon name="MapPin" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Adresse</p>
                <p class="font-semibold">{{ organization.address }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <Icon name="Calendar" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Inscrit depuis le</p>
                <p class="font-semibold">{{ formatDate(organization.created_at) }}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Actions -->
        <Card>
          <h3 class="font-bold mb-4">Actions</h3>
          <div class="space-y-2">
            <Button variant="outline" class="w-full justify-start" @click="sendMessageToOwner"
              :disabled="!organizationOwner || organizationOwner.id === authStore.user?.id">
              <Icon name="Mail" :size="16" />
              Envoyer un message
            </Button>
            <Button variant="outline" class="w-full justify-start" @click="shareProfile">
              <Icon name="Share" :size="16" />
              Partager le profil
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import organizationsApi from '@/services/organizations'
import { getImageUrl } from '@/utils/imageUtils'
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  Icon,
} from '@/components/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const organization = ref(null)
const members = ref([])
const loading = ref(true)

const isOwner = computed(() => {
  if (!organization.value || !authStore.user) return false
  // Check if current user is owner of this organization
  return members.value.some(m => m.id === authStore.user.id && m.role === 'owner')
})

// Trouver l'owner de l'organisation
const organizationOwner = computed(() => {
  const owner = members.value.find(m => m.role === 'owner')
  return owner || members.value[0] || null
})

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await organizationsApi.getById(route.params.id)
    organization.value = data.data || data

    if (!organization.value) {
      toast.error('Organisation non trouvée')
      router.push('/')
      return
    }

    // Load members
    const membersRes = await organizationsApi.getMembers(route.params.id)
    members.value = membersRes.data?.members || []

  } catch (error) {
    console.error('Error loading organization:', error)
    toast.error('Erreur lors du chargement de l\'organisation')
  } finally {
    loading.value = false
  }
}

const openWebsite = () => {
  if (organization.value?.website) {
    window.open(organization.value.website, '_blank')
  }
}

const editOrganization = () => {
  toast.info('Fonctionnalité de modification bientôt disponible')
}

const shareProfile = () => {
  navigator.clipboard.writeText(window.location.href)
  toast.success('Lien copié dans le presse-papier')
}

// Envoyer un message au propriétaire de l'organisation
const sendMessageToOwner = () => {
  if (!organizationOwner.value) {
    toast.error('Impossible de trouver le propriétaire de cette organisation')
    return
  }

  if (!authStore.user) {
    toast.error('Vous devez être connecté pour envoyer un message')
    router.push('/login')
    return
  }

  // Rediriger vers la messagerie avec l'ID du propriétaire
  router.push(`/messages?user=${organizationOwner.value.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(loadData)
</script>
