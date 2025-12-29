<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader title="Gestion des Partenaires" subtitle="Consulter et gérer les partenaires de la plateforme"
      :breadcrumbs="[{ label: 'Administration', to: '/admin/dashboard' }, { label: 'Partenaires' }]" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card class="text-center">
          <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
          <p class="text-sm text-neutral-500">Organisations</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-amber-600">{{ stats.offersThisMonth }}</p>
          <p class="text-sm text-neutral-500">Offres ce mois</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-blue-600">{{ stats.activeOffers }}</p>
          <p class="text-sm text-neutral-500">Offres actives</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-purple-600">{{ stats.upcomingEvents }}</p>
          <p class="text-sm text-neutral-500">Événements à venir</p>
        </Card>
      </div>

      <!-- Filters -->
      <Card class="mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Search -->
          <div class="relative flex-1 min-w-[200px]">
            <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input v-model="filters.search" type="text" placeholder="Rechercher un partenaire..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              @input="debouncedSearch" />
          </div>

          <!-- Type Filter -->
          <select v-model="filters.type"
            class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            @change="loadOrganizations">
            <option value="">Tous les types</option>
            <option v-for="type in organizationTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <!-- Refresh Button -->
          <Button variant="outline" size="sm" @click="loadOrganizations" :disabled="loading">
            <Icon name="RefreshCw" :size="16" class="mr-1" :class="{ 'animate-spin': loading }" />
            Actualiser
          </Button>
        </div>
      </Card>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <Skeleton v-for="i in 5" :key="i" class="h-32 rounded-lg" />
      </div>

      <!-- Organizations List -->
      <div v-else-if="organizations.length > 0" class="space-y-4">
        <Card v-for="org in organizations" :key="org.id" class="hover:shadow-md transition-shadow">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Organization Info -->
            <div class="flex items-start gap-4 flex-1">
              <div v-if="org.logo" class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img :src="org.logo" :alt="org.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {{ org.name?.charAt(0) || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <h3 class="text-lg font-semibold text-neutral-900">{{ org.name }}</h3>
                  <Badge v-if="org.type" variant="info">
                    {{ org.type }}
                  </Badge>
                </div>
                <p class="text-sm text-neutral-600 line-clamp-2 mb-2">
                  {{ org.description || 'Aucune description' }}
                </p>
                <div class="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                  <span v-if="org.city || org.location" class="flex items-center gap-1">
                    <Icon name="MapPin" :size="14" />
                    {{ org.city || org.location }}
                  </span>
                  <span v-if="org.website" class="flex items-center gap-1">
                    <Icon name="Globe" :size="14" />
                    <a :href="org.website" target="_blank" class="text-blue-600 hover:underline truncate max-w-[200px]">
                      {{ org.website }}
                    </a>
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="Calendar" :size="14" />
                    {{ formatDate(org.created_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Stats Info -->
            <div class="lg:border-l lg:border-neutral-200 lg:pl-6 flex-shrink-0">
              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="bg-blue-50 rounded-lg p-3">
                  <p class="text-lg font-bold text-blue-600">{{ org.offers_count || 0 }}</p>
                  <p class="text-xs text-neutral-500">Offres</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                  <p class="text-lg font-bold text-purple-600">{{ org.events_count || 0 }}</p>
                  <p class="text-xs text-neutral-500">Événements</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 flex-shrink-0">
              <router-link :to="`/organizations/${org.id}`">
                <Button variant="outline" size="sm" class="w-full">
                  <Icon name="Eye" :size="14" class="mr-1" />
                  Voir
                </Button>
              </router-link>
              <Button variant="outline" size="sm" class="text-red-600 hover:bg-red-50" @click="openDeleteModal(org)">
                <Icon name="Trash2" :size="14" class="mr-1" />
                Supprimer
              </Button>
            </div>
          </div>

          <!-- Owner Info -->
          <div v-if="org.owner || org.user" class="mt-4 pt-4 border-t border-neutral-100">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-medium text-sm">
                {{ (org.owner?.name || org.user?.name)?.charAt(0) || '?' }}
              </div>
              <div>
                <p class="text-sm font-medium text-neutral-900">{{ org.owner?.name || org.user?.name }}
                </p>
                <p class="text-xs text-neutral-500">Propriétaire • {{ org.owner?.email ||
                  org.user?.email }}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" :disabled="pagination.current_page === 1"
            @click="goToPage(pagination.current_page - 1)">
            <Icon name="ChevronLeft" :size="14" />
          </Button>
          <span class="px-4 py-2 text-sm text-neutral-600">
            Page {{ pagination.current_page }} sur {{ pagination.last_page }}
          </span>
          <Button variant="outline" size="sm" :disabled="pagination.current_page === pagination.last_page"
            @click="goToPage(pagination.current_page + 1)">
            <Icon name="ChevronRight" :size="14" />
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <Card v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <Icon name="Briefcase" :size="40" class="text-neutral-400" />
        </div>
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">Aucun partenaire trouvé</h3>
        <p class="text-neutral-600 max-w-md mx-auto">
          Aucun partenaire ne correspond à vos critères de recherche.
        </p>
      </Card>
    </main>

    <!-- Delete Modal -->
    <Modal :isOpen="showDeleteModal" @close="showDeleteModal = false" title="Supprimer le partenaire">
      <div v-if="selectedOrganization" class="space-y-4">
        <div class="p-4 bg-red-50 rounded-lg">
          <p class="text-red-800">
            <strong>Attention !</strong> Cette action est irréversible. L'organisation
            <strong>{{ selectedOrganization.name }}</strong> et toutes ses données seront supprimées.
          </p>
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDeleteModal = false">Annuler</Button>
          <Button variant="danger" @click="handleDelete" :disabled="actionLoading">
            <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card, Badge, Button, Icon, PageHeader, Skeleton, Modal, LoadingSpinner } from '@/components/ui'
import organizationsApi from '@/services/organizations'
import adminApi from '@/services/admin'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const loading = ref(true)
const organizations = ref([])
const stats = ref({
  total: 0,
  offersThisMonth: 0,
  activeOffers: 0,
  upcomingEvents: 0,
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

// Organization types
const organizationTypes = [
  'Incubateur',
  'Accélérateur',
  'Investisseur',
  'Institution',
  'ONG',
  'Entreprise',
  'Autre'
]

// Filters
const filters = ref({
  search: '',
  type: '',
})

// Modal
const showDeleteModal = ref(false)
const selectedOrganization = ref(null)
const actionLoading = ref(false)

let searchTimeout = null

const loadOrganizations = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
    }

    if (filters.value.search) params.name = filters.value.search
    if (filters.value.type) params.type = filters.value.type

    const { data } = await organizationsApi.getAll(params)
    organizations.value = data.data || data || []

    if (data.meta || data.current_page) {
      pagination.value = {
        current_page: data.meta?.current_page || data.current_page || 1,
        last_page: data.meta?.last_page || data.last_page || 1,
        per_page: data.meta?.per_page || data.per_page || 15,
        total: data.meta?.total || data.total || 0,
      }
    }

    // Update stats from data
    stats.value.total = pagination.value.total || organizations.value.length
  } catch (error) {
    console.error('Error loading organizations:', error)
    toast.error('Erreur lors du chargement des partenaires')
    organizations.value = []
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data } = await adminApi.getPartnersStats()
    stats.value = {
      total: data.total_organizations || stats.value.total,
      offersThisMonth: data.offers_this_month || 0,
      activeOffers: data.active_offers || 0,
      upcomingEvents: data.upcoming_events || 0,
    }
  } catch (error) {
    console.error('Error loading stats:', error)
    // Try to get from dashboard if partners endpoint fails
    try {
      const { data } = await adminApi.getDashboard()
      stats.value = {
        total: data.partners?.total_organizations || stats.value.total,
        offersThisMonth: data.partners?.offers_this_month || 0,
        activeOffers: data.partners?.active_offers || 0,
        upcomingEvents: data.partners?.upcoming_events || 0,
      }
    } catch (e) {
      console.error('Error loading dashboard stats:', e)
    }
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadOrganizations()
  }, 300)
}

const goToPage = (page) => {
  loadOrganizations(page)
}

const openDeleteModal = (org) => {
  selectedOrganization.value = org
  showDeleteModal.value = true
}

const handleDelete = async () => {
  actionLoading.value = true
  try {
    await organizationsApi.delete(selectedOrganization.value.id)
    toast.success('Partenaire supprimé avec succès')
    showDeleteModal.value = false
    await Promise.all([loadOrganizations(pagination.value.current_page), loadStats()])
  } catch (error) {
    console.error('Error deleting organization:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
  } finally {
    actionLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  Promise.all([loadOrganizations(), loadStats()])
})
</script>
