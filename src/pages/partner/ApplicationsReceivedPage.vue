<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader
      title="Candidatures reçues"
      subtitle="Gérez les candidatures pour vos opportunités"
      :breadcrumbs="[{ label: 'Accueil', to: '/partner/home' }, { label: 'Candidatures reçues' }]"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card class="text-center">
          <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
          <p class="text-sm text-neutral-500">Total</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-theme-warning">{{ stats.pending }}</p>
          <p class="text-sm text-neutral-500">En attente</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-theme-success">{{ stats.accepted }}</p>
          <p class="text-sm text-neutral-500">Acceptées</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-theme-error">{{ stats.rejected }}</p>
          <p class="text-sm text-neutral-500">Refusées</p>
        </Card>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <div class="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="
              activeTab === tab.value
                ? 'bg-gradient-to-r from-theme to-theme-hover text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex-1"></div>

        <select
          v-model="selectedOffer"
          class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
        >
          <option value="">Toutes les offres</option>
          <option v-for="offer in offers" :key="offer.id" :value="offer.id">
            {{ offer.title }}
          </option>
        </select>

        <div class="relative">
          <Icon
            name="Search"
            :size="18"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une startup..."
            class="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Applications List -->
      <div v-if="filteredApplications.length > 0" class="space-y-4">
        <Card
          v-for="application in filteredApplications"
          :key="application.id"
          class="hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Startup Info -->
            <div class="flex items-start gap-4 flex-1">
              <div
                class="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              >
                {{ application.startup.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-lg font-semibold text-neutral-900">
                    {{ application.startup.name }}
                  </h3>
                  <Badge v-if="application.startup.verified" variant="success" size="sm">
                    Vérifié
                  </Badge>
                </div>
                <p class="text-sm text-neutral-600 mb-2">{{ application.startup.sector }}</p>

                <div class="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  <span class="flex items-center gap-1">
                    <Icon name="Briefcase" :size="14" />
                    {{ application.offer.title }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="Calendar" :size="14" />
                    {{ formatDate(application.appliedAt) }}
                  </span>
                </div>

                <p
                  v-if="application.message"
                  class="mt-3 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg"
                >
                  "{{ application.message }}"
                </p>
              </div>
            </div>

            <!-- Status & Actions -->
            <div
              class="flex flex-col items-end justify-between gap-4 lg:border-l lg:border-neutral-100 lg:pl-6"
            >
              <Badge :variant="getStatusVariant(application.status)" size="lg">
                {{ getStatusLabel(application.status) }}
              </Badge>

              <div v-if="application.status === 'pending'" class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="viewStartup(application.startup.id)">
                  <Icon name="Eye" :size="16" class="mr-1" />
                  Voir profil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-theme-success hover:bg-green-50"
                  @click="updateStatus(application.id, 'accepted')"
                >
                  <Icon name="Check" :size="16" class="mr-1" />
                  Accepter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-theme-error hover:bg-red-50"
                  @click="updateStatus(application.id, 'rejected')"
                >
                  <Icon name="X" :size="16" class="mr-1" />
                  Refuser
                </Button>
              </div>

              <div v-else class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="viewStartup(application.startup.id)">
                  <Icon name="Eye" :size="16" class="mr-1" />
                  Voir profil
                </Button>
                <Button
                  v-if="application.status === 'accepted'"
                  variant="outline"
                  size="sm"
                  @click="contactStartup(application.startup.id)"
                >
                  <Icon name="MessageSquare" :size="16" class="mr-1" />
                  Contacter
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Empty State -->
      <Card v-else class="text-center py-16">
        <div
          class="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center"
        >
          <Icon name="Users" :size="40" class="text-neutral-400" />
        </div>
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">
          {{ searchQuery || selectedOffer ? 'Aucun résultat' : 'Aucune candidature' }}
        </h3>
        <p class="text-neutral-600 max-w-md mx-auto">
          {{
            searchQuery || selectedOffer
              ? 'Aucune candidature ne correspond à vos critères de recherche.'
              : "Vous n'avez pas encore reçu de candidatures. Publiez une opportunité pour attirer des startups !"
          }}
        </p>
      </Card>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useReverb } from '@/composables/useReverb'
import { useApplicationsStore } from '@/stores/applicationsStore.js'
import { PageHeader, Card, Button, Badge, Icon } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const { subscribeToApplicationEvents, leaveChannel } = useReverb()
const applicationsStore = useApplicationsStore()

// Récupérer l'ID de l'offre depuis les props/params
const offerId = computed(() => route.params.id)

const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedOffer = ref('')
const processingIds = ref(new Set()) // Track applications being processed

const offers = ref([])
const applications = ref([])

// Setup real-time subscription for new applications
const setupRealtimeSubscription = () => {
  if (!user.value?.id) return

  subscribeToApplicationEvents(user.value.id, {
    onApplicationSubmitted: (event) => {
      console.log('[Applications] Nouvelle candidature reçue en temps réel:', event)

      // Ajouter la nouvelle candidature à la liste
      const newApp = {
        id: event.application_id,
        startup: {
          id: null,
          name: event.applicant_name || 'Startup',
          sector: 'Non spécifié',
          verified: false,
        },
        offer: {
          id: event.offer_id,
          title: event.offer_title || 'Offre',
        },
        status: event.status || 'pending',
        message: null,
        appliedAt: event.submitted_at ? new Date(event.submitted_at) : new Date(),
      }

      // Ajouter en tête de liste
      applications.value = [newApp, ...applications.value]

      // Afficher une notification toast (si disponible)
      if (window.toast) {
        window.toast.success(`Nouvelle candidature de ${event.applicant_name}`)
      }
    },
    onApplicationStatusChanged: () => {
      // Les partenaires n'ont pas besoin de ça
    }
  })
}

// Load data from API
const loadData = async () => {
  loading.value = true
  try {
    // Charger les candidatures reçues
    await applicationsStore.fetchReceivedApplications()

    // Mapper les données pour le format attendu
    applications.value = (applicationsStore.receivedApplications || []).map(app => ({
      id: app.id,
      startup: {
        id: app.startup?.id || app.user?.startup_id,
        name: app.startup?.name || app.user?.startup?.name || app.user?.name || 'Startup',
        sector: app.startup?.secteur || app.startup?.sector || 'Non spécifié',
        verified: app.startup?.verified || false,
      },
      offer: {
        id: app.offer?.id || app.offer_id,
        title: app.offer?.title || 'Offre',
      },
      status: app.status,
      message: app.pitch || app.motivation || null,
      appliedAt: app.created_at ? new Date(app.created_at) : new Date(),
    }))

    // Extraire les offres uniques pour le filtre
    const uniqueOffers = new Map()
    applications.value.forEach(app => {
      if (app.offer?.id && !uniqueOffers.has(app.offer.id)) {
        uniqueOffers.set(app.offer.id, { id: app.offer.id, title: app.offer.title })
      }
    })
    offers.value = Array.from(uniqueOffers.values())

    // Setup realtime after initial load
    setupRealtimeSubscription()

  } catch (error) {
    console.error('Error loading applications:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// Cleanup on unmount
onUnmounted(() => {
  if (user.value?.id) {
    leaveChannel(`user.${user.value.id}`)
  }
})// Computed
const tabs = computed(() => [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'rejected', label: 'Refusées' },
])

const stats = computed(() => ({
  total: applications.value.length,
  pending: applications.value.filter((a) => a.status === 'pending').length,
  accepted: applications.value.filter((a) => a.status === 'accepted').length,
  rejected: applications.value.filter((a) => a.status === 'rejected').length,
}))

const filteredApplications = computed(() => {
  let result = applications.value

  // Filtrer par ID d'offre si fourni dans l'URL
  if (offerId.value) {
    result = result.filter((a) => a.offer.id === parseInt(offerId.value))
  }

  if (activeTab.value !== 'all') {
    result = result.filter((a) => a.status === activeTab.value)
  }

  if (selectedOffer.value) {
    result = result.filter((a) => a.offer.id === selectedOffer.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (a) =>
        a.startup.name.toLowerCase().includes(query) ||
        a.startup.sector.toLowerCase().includes(query),
    )
  }

  return result.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
})

const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
  }
  return variants[status] || 'neutral'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const viewStartup = (startupId) => {
  router.push(`/startups/${startupId}`)
}

const contactStartup = (startupId) => {
  router.push(`/messages?startup=${startupId}`)
}

const updateStatus = async (applicationId, newStatus) => {
  if (processingIds.value.has(applicationId)) return

  processingIds.value.add(applicationId)

  try {
    if (newStatus === 'accepted') {
      await applicationsStore.acceptApplication(applicationId)
    } else if (newStatus === 'rejected') {
      const reason = prompt('Raison du refus (optionnel):')
      await applicationsStore.rejectApplication(applicationId, reason)
    }

    // Mettre à jour localement
    const index = applications.value.findIndex((a) => a.id === applicationId)
    if (index !== -1) {
      applications.value[index].status = newStatus
    }
  } catch (error) {
    console.error('Error updating application status:', error)
    alert('Erreur lors de la mise à jour du statut')
  } finally {
    processingIds.value.delete(applicationId)
  }
}
</script>
