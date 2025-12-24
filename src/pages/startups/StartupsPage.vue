<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Annuaire des Startups</h1>
        <p class="text-gray-500 mt-1 text-xs sm:text-sm md:text-base">
          {{ filteredStartups.length }} startup{{ filteredStartups.length > 1 ? 's' : '' }} dans
          l'écosystème
        </p>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex items-center gap-0.5 sm:gap-1 bg-gray-100 p-0.5 sm:p-1 rounded-lg">
        <button @click="viewMode = 'grid'" :class="[
          'px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1',
          viewMode === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
        ]">
          <Icon name="LayoutGrid" :size="14" class="sm:hidden" />
          <Icon name="LayoutGrid" :size="16" class="hidden sm:inline" />
          <span class="hidden xs:inline">Grille</span>
        </button>
        <button @click="viewMode = 'list'" :class="[
          'px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1',
          viewMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
        ]">
          <Icon name="List" :size="14" class="sm:hidden" />
          <Icon name="List" :size="16" class="hidden sm:inline" />
          <span class="hidden xs:inline">Liste</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <!-- Search -->
        <div class="sm:col-span-2">
          <div class="relative">
            <Icon name="Search" :size="16" class="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher une startup..." v-model="searchQuery"
              class="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent" />
          </div>
        </div>

        <!-- Sector Filter -->
        <Select v-model="selectedSector" class="text-sm sm:text-base">
          <option value="all">Tous les secteurs</option>
          <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
        </Select>

        <!-- Location Filter -->
        <Select v-model="selectedLocation" class="text-sm sm:text-base">
          <option value="all">Toutes les villes</option>
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </Select>
      </div>

      <!-- Additional Filters & Stats -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <button @click="showOnlyVerified = !showOnlyVerified" :class="[
            'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-1.5',
            showOnlyVerified
              ? 'bg-theme text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]">
            <Icon name="CheckCircle" :size="12" class="sm:hidden" />
            <Icon name="CheckCircle" :size="14" class="hidden sm:inline" />
            <span class="hidden xs:inline">Vérifiées uniquement</span>
            <span class="xs:hidden">Vérifiées</span>
          </button>

          <button v-if="
            searchQuery ||
            selectedSector !== 'all' ||
            selectedLocation !== 'all' ||
            showOnlyVerified
          " @click="resetFilters"
            class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-1 sm:gap-1.5">
            <Icon name="X" :size="12" class="sm:hidden" />
            <Icon name="X" :size="14" class="hidden sm:inline" />
            <span class="hidden xs:inline">Réinitialiser</span>
            <span class="xs:hidden">Reset</span>
          </button>
        </div>

        <!-- Stats Inline -->
        <div v-if="filteredStartups.length > 0"
          class="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm">
          <div class="flex items-center gap-1 sm:gap-1.5">
            <span class="font-bold text-theme">{{ filteredStartups.length }}</span>
            <span class="text-gray-500 hidden xs:inline">Résultat{{ filteredStartups.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="hidden xs:block w-px h-3 sm:h-4 bg-gray-300"></div>
          <div class="flex items-center gap-1 sm:gap-1.5">
            <Icon name="CheckCircle" :size="12" class="text-green-600 sm:hidden" />
            <Icon name="CheckCircle" :size="14" class="text-green-600 hidden sm:inline" />
            <span class="font-bold text-green-600">{{
              filteredStartups.filter((s) => s.verified).length
              }}</span>
            <span class="hidden sm:inline text-gray-500">Vérifiées</span>
          </div>
          <div class="hidden md:block w-px h-4 bg-gray-300"></div>
          <div class="hidden md:flex items-center gap-1.5">
            <Icon name="Briefcase" :size="14" class="text-blue-600" />
            <span class="font-bold text-blue-600">{{
              [...new Set(filteredStartups.map((s) => s.sector))].length
              }}</span>
            <span class="text-gray-500">Secteurs</span>
          </div>
          <div class="hidden lg:block w-px h-4 bg-gray-300"></div>
          <div class="hidden lg:flex items-center gap-1.5">
            <Icon name="Users" :size="14" class="text-purple-600" />
            <span class="font-bold text-purple-600">{{
              filteredStartups.reduce((sum, s) => sum + (s.members?.length || 0), 0)
              }}</span>
            <span class="text-gray-500">Membres</span>
          </div>
        </div>
      </div>
    </Card>

    <!-- Startups Display -->
    <!-- Grid View -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <StartupCardSkeleton v-for="i in 8" :key="i" />
    </div>
    <template v-else>
      <EmptyState v-if="filteredStartups.length === 0" title="Aucune startup trouvée" :description="searchQuery || selectedSector !== 'all' || selectedLocation !== 'all'
          ? 'Essayez de modifier vos filtres'
          : 'Les startups apparaîtront ici'
        ">
        <template #icon>
          <Icon name="Building2" :size="48" />
        </template>
      </EmptyState>
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card v-for="startup in filteredStartups" :key="startup.id"
          class="flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
          @click="handleViewStartup(startup.id)">
          <!-- Cover Image -->
          <div class="h-32 bg-gradient-to-br from-theme to-theme-hover relative">
            <div
              class="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
              <span class="text-2xl font-bold text-theme">
                {{ startup.name[0] }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="pt-10 px-4 pb-4 flex-1 flex flex-col">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-lg text-gray-900 group-hover:text-theme transition line-clamp-1">
                {{ startup.name }}
              </h3>
              <Icon v-if="startup.verified" name="CheckCircle" :size="18" class="text-blue-500 flex-shrink-0" />
            </div>

            <div class="flex items-center gap-2 mb-3">
              <Badge color="theme">{{ startup.sector }}</Badge>
              <span class="text-xs text-gray-500 flex items-center gap-1">
                <Icon name="MapPin" :size="12" />
                {{ startup.location }}
              </span>
            </div>

            <p class="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
              {{ startup.description || 'Aucune description disponible' }}
            </p>

            <!-- Footer -->
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <Icon name="Users" :size="12" />
                {{ startup.members?.length || 0 }} membre{{
                  (startup.members?.length || 0) > 1 ? 's' : ''
                }}
              </span>
              <span v-if="user?.role === 'admin' && startup.rccm" class="font-mono text-[10px]">
                {{ startup.rccm }}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <Card v-for="startup in filteredStartups" :key="startup.id"
          class="hover:shadow-md transition-all duration-200 cursor-pointer" @click="handleViewStartup(startup.id)">
          <div class="flex items-start gap-4">
            <!-- Logo -->
            <div class="w-16 h-16 bg-theme-light rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-xl font-bold text-theme">
                {{ startup.name[0] }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-lg text-gray-900 hover:text-theme transition">
                    {{ startup.name }}
                  </h3>
                  <Icon v-if="startup.verified" name="CheckCircle" :size="18" class="text-blue-500" />
                </div>
                <Button variant="outline" size="sm" @click.stop="handleViewStartup(startup.id)">
                  Voir le profil
                </Button>
              </div>

              <div class="flex items-center gap-3 mb-2">
                <Badge color="theme">{{ startup.sector }}</Badge>
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  <Icon name="MapPin" :size="14" />
                  {{ startup.location }}
                </span>
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  <Icon name="Users" :size="14" />
                  {{ startup.members?.length || 0 }} membre{{
                    (startup.members?.length || 0) > 1 ? 's' : ''
                  }}
                </span>
                <span v-if="user?.role === 'admin' && startup.rccm" class="text-xs text-gray-400 font-mono">
                  RCCM: {{ startup.rccm }}
                </span>
              </div>

              <p class="text-sm text-gray-600 line-clamp-2">
                {{ startup.description || 'Aucune description disponible' }}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import startupApi from '../../services/startup'
import { Card, Button, Badge, EmptyState, LoadingSpinner, Select, Icon } from '../../components/ui'
import StartupCardSkeleton from '@/components/skeletons/StartupCardSkeleton.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { user } = useAuth()
const toast = useToast()

const startups = ref([])
const loading = ref(true)
const viewMode = ref('grid')

// Filters
const searchQuery = ref('')
const selectedSector = ref('all')
const selectedLocation = ref('all')
const showOnlyVerified = ref(false)

const sectors = ref([])
const locations = ref([])

const filteredStartups = computed(() => {
  let filtered = [...startups.value]

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(
      (startup) =>
        startup.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (startup.description &&
          startup.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        startup.sector.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // Sector filter
  if (selectedSector.value !== 'all') {
    filtered = filtered.filter((startup) => startup.sector === selectedSector.value)
  }

  // Location filter
  if (selectedLocation.value !== 'all') {
    filtered = filtered.filter((startup) => startup.location === selectedLocation.value)
  }

  // Verified filter
  if (showOnlyVerified.value) {
    filtered = filtered.filter((startup) => startup.verified)
  }

  return filtered
})

const loadData = async () => {
  // Afficher le loading seulement si pas de données en cache
  const hasCache = startups.value.length > 0
  loading.value = !hasCache

  try {
    // Charger les startups depuis l'API backend
    const { data } = await startupApi.list({
      search: searchQuery.value || undefined,
      secteur: selectedSector.value !== 'all' ? selectedSector.value : undefined,
      emplacement: selectedLocation.value !== 'all' ? selectedLocation.value : undefined,
    })

    // Adapter le format des données backend
    const startupsList = data.data || data
    startups.value = Array.isArray(startupsList)
      ? startupsList.map((s) => ({
        id: s.id,
        name: s.nom,
        sector: s.secteur?.nom || s.secteur_id || 'Non spécifié',
        location: s.emplacement || 'Non spécifié',
        description: s.description,
        verified: !!s.registre_commerce_pdf_path,
        logo: s.logo,
        members: s.members || [],
        rccm: s.registre_commerce_number,
        website: s.site_web,
        createdAt: new Date(s.created_at).getTime(),
      }))
      : []

    // Extraire les secteurs et villes uniques pour les filtres
    sectors.value = [...new Set(startups.value.map((s) => s.sector).filter(Boolean))]
    locations.value = [...new Set(startups.value.map((s) => s.location).filter(Boolean))]
  } catch (error) {
    console.error('Error loading startups:', error)
    toast.error('Erreur lors du chargement des startups')
    // Ne pas vider les données en cas d'erreur si on a du cache
    if (!hasCache) startups.value = []
  } finally {
    loading.value = false
  }
}

const handleViewStartup = (startupId) => {
  router.push(`/startups/${startupId}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedSector.value = 'all'
  selectedLocation.value = 'all'
  showOnlyVerified.value = false
}

onMounted(loadData)
</script>
