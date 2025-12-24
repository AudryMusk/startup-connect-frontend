<template>
  <div class="card-spacing">
    <PageHeader
      title="Mes candidatures"
      icon="FileText"
      description="Suivez l'état de toutes vos candidatures aux opportunités"
      :breadcrumbs="[
        { label: 'Accueil', path: '/' },
        { label: 'Mes candidatures', path: '/my-candidacies' },
      ]"
    />

    <!-- Filtres -->
    <Card variant="elevated" class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-neutral-600">Statut :</span>
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-theme-200 focus:border-theme-300"
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-neutral-600">Trier par :</span>
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-theme-200 focus:border-theme-300"
          >
            <option value="date-desc">Plus récentes</option>
            <option value="date-asc">Plus anciennes</option>
          </select>
        </div>

        <div class="ml-auto text-sm text-neutral-500">
          {{ filteredCandidacies.length }} candidature{{
            filteredCandidacies.length > 1 ? 's' : ''
          }}
        </div>
      </div>
    </Card>

    <!-- Liste des candidatures -->
    <div v-if="loading" class="space-y-4">
      <CandidacySkeleton v-for="i in 5" :key="i" />
    </div>
    <template v-else>
      <EmptyState
        v-if="filteredCandidacies.length === 0"
        title="Aucune candidature"
        description="Vous n'avez pas encore postulé à une opportunité. Explorez les offres disponibles !"
      >
        <template #icon>
          <Icon name="FileText" :size="48" />
        </template>
        <template #action>
          <router-link to="/offers">
            <Button variant="gradient">
              <Icon name="Search" :size="16" />
              Explorer les opportunités
            </Button>
          </router-link>
        </template>
      </EmptyState>
      <div v-else class="space-y-4">
      <Card
        v-for="candidacy in filteredCandidacies"
        :key="candidacy.id"
        variant="elevated"
        hover
        class="group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <Badge :color="getStatusColor(candidacy.status)" size="md">
                <Icon :name="getStatusIcon(candidacy.status)" :size="14" class="mr-1" />
                {{ getStatusLabel(candidacy.status) }}
              </Badge>
              <span class="text-xs text-neutral-400">
                {{ formatDistanceToNow(candidacy.submittedAt, { addSuffix: true }) }}
              </span>
            </div>

            <h3
              class="text-lg font-bold text-neutral-900 mb-1 group-hover:text-theme-600 transition-colors"
            >
              {{ candidacy.offerTitle }}
            </h3>

            <p class="text-sm text-neutral-600 mb-3">
              {{ candidacy.organizationName || 'Organisation' }}
            </p>

            <div
              v-if="candidacy.message"
              class="p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600 mb-3"
            >
              <p class="font-medium text-neutral-700 mb-1">Votre message :</p>
              <p class="line-clamp-2">{{ candidacy.message }}</p>
            </div>

            <!-- Feedback si accepté ou rejeté -->
            <div
              v-if="candidacy.feedback"
              class="p-3 rounded-lg text-sm mb-3"
              :class="
                candidacy.status === 'accepted'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              "
            >
              <p class="font-medium mb-1">Retour du partenaire :</p>
              <p>{{ candidacy.feedback }}</p>
            </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <router-link :to="`/offers/${candidacy.offerId}`">
              <Button variant="outline" size="sm">
                <Icon name="Eye" :size="14" />
                Voir l'offre
              </Button>
            </router-link>

            <Button
              v-if="candidacy.status === 'pending'"
              variant="ghost"
              size="sm"
              class="text-red-500 hover:text-red-600 hover:bg-red-50"
              @click="handleWithdraw(candidacy.id)"
            >
              <Icon name="X" :size="14" />
              Retirer
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useReverb } from '@/composables/useReverb'
import { useApplicationsStore } from '@/stores/applicationsStore.js'
import {
  Card,
  Button,
  Badge,
  EmptyState,
  LoadingSpinner,
  Icon,
  PageHeader,
} from '../../components/ui'
import CandidacySkeleton from '@/components/skeletons/CandidacySkeleton.vue';
import { formatDistanceToNow } from '../../utils/dateUtils'

const { user } = useAuth()
const { subscribeToApplicationEvents, leaveChannel } = useReverb()
const applicationsStore = useApplicationsStore()
const candidacies = ref([])
const loading = ref(true)
const filterStatus = ref('')
const sortBy = ref('date-desc')

// Setup real-time subscription for status changes
const setupRealtimeSubscription = () => {
  if (!user.value?.id) return

  subscribeToApplicationEvents(user.value.id, {
    onApplicationSubmitted: () => {
      // Les candidats n'ont pas besoin de ça
    },
    onApplicationStatusChanged: (event) => {
      console.log('[MyCandidacies] Changement de statut en temps réel:', event)

      // Mettre à jour le statut dans la liste
      const index = candidacies.value.findIndex(c => c.id === event.application_id)
      if (index !== -1) {
        candidacies.value[index].status = event.new_status
        if (event.feedback) {
          candidacies.value[index].feedback = event.feedback
        }
      }

      // Afficher une notification toast (si disponible)
      if (window.toast) {
        const statusLabels = {
          accepted: 'Félicitations ! Votre candidature a été acceptée !',
          rejected: 'Votre candidature a été refusée.'
        }
        const message = statusLabels[event.new_status] || `Statut mis à jour: ${event.new_status}`
        if (event.new_status === 'accepted') {
          window.toast.success(message)
        } else {
          window.toast.info(message)
        }
      }
    }
  })
}

// Cleanup on unmount
onUnmounted(() => {
  if (user.value?.id) {
    leaveChannel(`user.${user.value.id}`)
  }
})

const filteredCandidacies = computed(() => {
  let result = [...candidacies.value]

  // Filter by status
  if (filterStatus.value) {
    result = result.filter((c) => c.status === filterStatus.value)
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'date-desc') {
      return b.submittedAt - a.submittedAt
    }
    return a.submittedAt - b.submittedAt
  })

  return result
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    accepted: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'Clock',
    accepted: 'CheckCircle',
    rejected: 'XCircle',
  }
  return icons[status] || 'FileText'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
  }
  return labels[status] || status
}

const handleWithdraw = async (candidacyId) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) return

  try {
    await applicationsStore.withdrawApplication(candidacyId)
    candidacies.value = candidacies.value.filter((c) => c.id !== candidacyId)
  } catch (error) {
    console.error('Error withdrawing candidacy:', error)
  }
}

const loadData = async () => {
  try {
    await applicationsStore.fetchMyApplications()

    // Mapper les données pour le format attendu par le template
    candidacies.value = (applicationsStore.myApplications || []).map(app => ({
      id: app.id,
      offerId: app.offer_id || app.offer?.id,
      offerTitle: app.offer?.title || app.offerTitle || 'Offre',
      organizationName: app.offer?.publisher?.name || app.organizationName || 'Partenaire',
      status: app.status,
      submittedAt: app.created_at ? new Date(app.created_at).getTime() : Date.now(),
      message: app.pitch || app.message,
      feedback: app.feedback || app.rejection_reason,
    }))

    // Setup realtime after initial load
    setupRealtimeSubscription()
  } catch (error) {
    console.error('Error loading candidacies:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
