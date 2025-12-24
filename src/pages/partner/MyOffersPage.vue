<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader
      title="Mes opportunités"
      subtitle="Gérez vos offres de stage, alternance et emploi"
      :breadcrumbs="[{ label: 'Accueil', to: '/partner/home' }, { label: 'Mes opportunités' }]"
    >
      <template #actions>
        <router-link to="/partner/offers/create">
          <Button>
            <Icon name="Plus" :size="18" class="mr-2" />
            Nouvelle opportunité
          </Button>
        </router-link>
      </template>
    </PageHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <div class="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            :class="
              activeTab === tab.value
                ? 'bg-gradient-to-r from-theme to-theme-hover text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            "
          >
            {{ tab.label }}
            <span
              v-if="tab.count !== undefined"
              class="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="
                activeTab === tab.value
                  ? 'bg-white/30 text-white'
                  : 'bg-theme-light text-theme'
              "
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <div class="flex-1"></div>

        <div class="relative">
          <Icon
            name="Search"
            :size="18"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Offers List -->
      <div v-if="filteredOffers.length > 0" class="space-y-4">
        <Card
          v-for="offer in filteredOffers"
          :key="offer.id"
          class="hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <div class="flex-1">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-lg font-semibold text-neutral-900">{{ offer.title }}</h3>
                    <Badge :variant="getStatusVariant(offer.status)">
                      {{ getStatusLabel(offer.status) }}
                    </Badge>
                  </div>
                  <p class="text-neutral-600 text-sm line-clamp-2">{{ offer.description }}</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-neutral-500">
                <span class="flex items-center gap-1">
                  <Icon name="Briefcase" :size="16" />
                  {{ offer.type }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="MapPin" :size="16" />
                  {{ offer.location }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="Calendar" :size="16" />
                  {{ formatDate(offer.createdAt) }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="Clock" :size="16" />
                  Expire le {{ formatDate(offer.expiresAt) }}
                </span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-3 lg:border-l lg:border-neutral-100 lg:pl-6">
              <div class="flex items-center gap-6 text-center">
                <div>
                  <p class="text-2xl font-bold text-neutral-900">{{ offer.applications }}</p>
                  <p class="text-xs text-neutral-500">Candidatures</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-neutral-900">{{ offer.views }}</p>
                  <p class="text-xs text-neutral-500">Vues</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <router-link :to="`/partner/offers/${offer.id}/applications`">
                  <Button variant="outline" size="sm">
                    <Icon name="Users" :size="16" class="mr-1" />
                    Voir candidatures
                  </Button>
                </router-link>
                <Button variant="outline" size="sm" @click="editOffer(offer)">
                  <Icon name="Edit" :size="16" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-theme-error hover:bg-red-50"
                  @click="confirmDelete(offer)"
                >
                  <Icon name="Trash" :size="16" />
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
          <Icon name="Briefcase" :size="40" class="text-neutral-400" />
        </div>
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">
          {{ searchQuery ? 'Aucun résultat' : 'Aucune opportunité' }}
        </h3>
        <p class="text-neutral-600 max-w-md mx-auto mb-6">
          {{
            searchQuery
              ? 'Aucune opportunité ne correspond à votre recherche.'
              : "Vous n'avez pas encore publié d'opportunité. Commencez dès maintenant !"
          }}
        </p>
        <router-link v-if="!searchQuery" to="/partner/offers/create">
          <div class="text-center flex justify-center items-center">
          <Button >
            <Icon name="Plus" :size="18" class="mr-2" />
            Créer ma première opportunité
          </Button>
          </div>
        </router-link>
      </Card>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOffersStore } from '@/stores/offersStore.js'
import offersApi from '@/services/offers.js'
import { PageHeader, Card, Button, Badge, Icon, LoadingSpinner } from '@/components/ui'

const router = useRouter()
const { user } = useAuth()
const offersStore = useOffersStore()

const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')
const deletingIds = ref(new Set())

const offers = ref([])

// Load data from API
const loadData = async () => {
  loading.value = true
  try {
    // Charger les offres - On filtre par publisher_id côté frontend ou via un endpoint dédié
    await offersStore.fetch({}, true)

    // Filtrer les offres de l'utilisateur connecté
    const myOffers = (offersStore.list || []).filter(offer =>
      offer.publisher_id === user.value?.id || offer.publisher?.id === user.value?.id
    )

    // Mapper les données
    offers.value = myOffers.map(offer => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      type: offer.type === 'offer' ? 'Appel à projets' : 'Événement',
      location: offer.location || 'Non spécifié',
      status: offer.status || 'active',
      applications: offer.applications_count || offer.applications || 0,
      views: offer.views || 0,
      createdAt: offer.created_at ? new Date(offer.created_at) : new Date(),
      expiresAt: offer.deadline ? new Date(offer.deadline) : null,
    }))
  } catch (error) {
    console.error('Error loading offers:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const tabs = computed(() => [
  { value: 'all', label: 'Toutes', count: offers.value.length },
  {
    value: 'active',
    label: 'Actives',
    count: offers.value.filter((o) => o.status === 'active').length,
  },
  {
    value: 'draft',
    label: 'Brouillons',
    count: offers.value.filter((o) => o.status === 'draft').length,
  },
  {
    value: 'closed',
    label: 'Clôturées',
    count: offers.value.filter((o) => o.status === 'closed').length,
  },
])

const filteredOffers = computed(() => {
  let result = offers.value

  if (activeTab.value !== 'all') {
    result = result.filter((o) => o.status === activeTab.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (o) => o.title.toLowerCase().includes(query) || o.description.toLowerCase().includes(query),
    )
  }

  return result
})

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    draft: 'warning',
    closed: 'neutral',
  }
  return variants[status] || 'neutral'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    draft: 'Brouillon',
    closed: 'Clôturée',
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const editOffer = (offer) => {
  router.push(`/offers/${offer.id}/edit`)
}

const confirmDelete = async (offer) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${offer.title}" ?`)) return

  if (deletingIds.value.has(offer.id)) return
  deletingIds.value.add(offer.id)

  try {
    await offersApi.delete(offer.id)
    offers.value = offers.value.filter((o) => o.id !== offer.id)
    // Invalider le cache
    offersStore.$reset()
  } catch (error) {
    console.error('Error deleting offer:', error)
    alert('Erreur lors de la suppression')
  } finally {
    deletingIds.value.delete(offer.id)
  }
}
</script>
