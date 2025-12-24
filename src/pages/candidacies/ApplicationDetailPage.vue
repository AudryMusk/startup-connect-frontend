<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Application Details -->
      <div v-if="!loading && application" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow p-6">
          <button
            @click="goBack"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>

          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Candidature de {{ application.user?.name || 'Candidat' }}
              </h1>
              <p class="text-gray-600 mb-4">
                Pour l'offre : <span class="font-semibold">{{ application.offer?.title }}</span>
              </p>

              <div class="flex items-center space-x-4">
                <span
                  :class="[
                    'px-4 py-2 text-sm font-medium rounded-lg',
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{
                    application.status === 'pending' ? '⏳ En attente' :
                    application.status === 'accepted' ? '✓ Acceptée' : '✗ Rejetée'
                  }}
                </span>
                <span class="text-sm text-gray-500">
                  Soumise le {{ formatDate(application.submitted_at || application.created_at) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="canManage" class="flex space-x-3 ml-4">
              <button
                v-if="application.status === 'pending'"
                @click="acceptApplication"
                :disabled="processing"
                class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
              >
                ✓ Accepter
              </button>
              <button
                v-if="application.status === 'pending'"
                @click="rejectApplication"
                :disabled="processing"
                class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                ✗ Rejeter
              </button>
            </div>
          </div>
        </div>

        <!-- Candidat Info -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations du candidat
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Nom</label>
              <p class="text-gray-900 font-semibold">{{ application.user?.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Email</label>
              <p class="text-gray-900">{{ application.user?.email }}</p>
            </div>
            <div v-if="application.startup">
              <label class="text-sm font-medium text-gray-600">Startup</label>
              <p class="text-gray-900 font-semibold">{{ application.startup.nom }}</p>
            </div>
          </div>
        </div>

        <!-- Réponses au formulaire -->
        <div v-if="application.responses && application.responses.length > 0" class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Réponses au formulaire
          </h2>

          <div class="space-y-6">
            <div
              v-for="response in application.responses"
              :key="response.id"
              class="border-b border-gray-200 pb-6 last:border-0"
            >
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ response.field?.label || response.form_field?.label }}
              </label>

              <!-- Fichier -->
              <div v-if="response.file_path" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Fichier téléchargé</p>
                  <p class="text-sm text-gray-500">{{ extractFileName(response.file_path) }}</p>
                </div>
                <a
                  :href="response.file_path"
                  target="_blank"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Télécharger
                </a>
              </div>

              <!-- Texte -->
              <div v-else class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-gray-900 whitespace-pre-wrap">{{ response.response_value || 'Aucune réponse' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Offer Details -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Détails de l'offre
          </h2>

          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-600">Titre</label>
              <p class="text-gray-900 font-semibold">{{ application.offer?.title }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Type</label>
              <p class="text-gray-900">
                {{ application.offer?.type === 'offer' ? 'Appel à projets' : 'Événement' }}
              </p>
            </div>
            <div v-if="application.offer?.description">
              <label class="text-sm font-medium text-gray-600">Description</label>
              <p class="text-gray-700 text-sm">{{ truncate(application.offer.description, 200) }}</p>
            </div>
            <div>
              <button
                @click="viewOffer"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Voir l'offre complète →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import applicationsApi from '@/services/applications'
import { useApplicationsStore } from '@/stores/applicationsStore'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const applicationsStore = useApplicationsStore()

const loading = ref(false)
const processing = ref(false)
const error = ref(null)
const application = ref(null)

const canManage = computed(() => {
  if (!application.value || !user.value) return false
  return application.value.offer?.publisher_id === user.value.id || user.value.role === 'admin'
})

const loadApplication = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await applicationsApi.get(route.params.id)
    application.value = response.data.data || response.data
  } catch (err) {
    console.error('Error loading application:', err)
    error.value = 'Erreur lors du chargement de la candidature'
  } finally {
    loading.value = false
  }
}

const acceptApplication = async () => {
  if (!confirm('Êtes-vous sûr de vouloir accepter cette candidature ?')) return

  processing.value = true
  try {
    await applicationsStore.acceptApplication(application.value.id)
    await loadApplication() // Recharger les données
  } catch (err) {
    console.error('Error accepting application:', err)
    alert('Erreur lors de l\'acceptation de la candidature')
  } finally {
    processing.value = false
  }
}

const rejectApplication = async () => {
  const reason = prompt('Raison du rejet (optionnel) :')
  if (reason === null) return // Annulé

  processing.value = true
  try {
    await applicationsStore.rejectApplication(application.value.id, reason)
    await loadApplication() // Recharger les données
  } catch (err) {
    console.error('Error rejecting application:', err)
    alert('Erreur lors du rejet de la candidature')
  } finally {
    processing.value = false
  }
}

const viewOffer = () => {
  if (application.value?.offer?.id) {
    router.push(`/offers/${application.value.offer.id}`)
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncate = (text, length) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const extractFileName = (path) => {
  if (!path) return 'fichier'
  return path.split('/').pop()
}

onMounted(() => {
  loadApplication()
})
</script>
