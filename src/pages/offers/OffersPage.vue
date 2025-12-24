<template>
  <div class="card-spacing">
    <!-- Page Header -->
    <PageHeader title="Offres" icon="Briefcase"
      :description="`${filteredOffers.length} offre${filteredOffers.length > 1 ? 's' : ''} disponible${filteredOffers.length > 1 ? 's' : ''}`">
      <template #actions>
        <router-link v-if="user?.role === 'partenaire' || user?.role === 'admin'" to="/offers/create">
          <Button size="lg" variant="gradient">
            <Icon name="PlusCircle" :size="20" />
            Publier une offre
          </Button>
        </router-link>
      </template>
    </PageHeader>

    <!-- Filters Card -->
    <Card variant="elevated">
      <div class="space-y-5">
        <!-- Search Bar -->
        <SearchBar v-model="searchQuery" placeholder="Rechercher une offre par titre, description..." />

        <!-- Filter Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Type Filter -->
          <Select v-model="selectedType">
            <option value="all">Tous les types</option>
            <option value="offer">Appels à projets</option>
            <option value="event">Événements</option>
          </Select>

          <!-- Sector Filter -->
          <Select v-model="selectedSector">
            <option value="all">Tous les secteurs</option>
            <option v-for="sector in sectors" :key="sector.id" :value="sector.id">{{ sector.nom }}</option>
          </Select>
        </div>

        <!-- Quick Filters -->
        <div class="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
          <button v-if="user?.role === 'startuper'" @click="showOnlySaved = !showOnlySaved" :class="[
            'px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2',
            showOnlySaved
              ? 'bg-brand-orange text-white shadow-soft'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
          ]">
            <Icon name="Bookmark" :size="16" />
            Sauvegardées ({{ savedOffers.length }})
          </button>

          <button v-if="
            searchQuery || selectedType !== 'offer' || selectedSector !== 'all' || showOnlySaved
          " @click="resetFilters"
            class="px-4 py-2.5 rounded-xl text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-300 flex items-center gap-2">
            <Icon name="X" :size="16" />
            Réinitialiser
          </button>

          <div class="ml-auto flex items-center gap-2 text-sm text-neutral-600 font-medium">
            <Icon name="Filter" :size="16" />
            <span>{{ filteredOffers.length }} résultat{{ filteredOffers.length > 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>
    </Card>

    <!-- Offers Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <OfferCardSkeleton v-for="i in 6" :key="i" />
    </div>
    <template v-else>
      <EmptyState v-if="filteredOffers.length === 0" title="Aucune offre trouvée" :description="searchQuery || selectedType !== 'offer' || selectedSector !== 'all'
          ? 'Essayez de modifier vos filtres de recherche'
          : 'Les nouvelles offres apparaîtront ici'
        ">
        <template #icon>
          <Icon name="Briefcase" :size="48" />
        </template>
        <template v-if="user?.role === 'partenaire' || user?.role === 'admin'" #action>
          <router-link to="/offers/create">
            <Button variant="gradient" size="lg">
              <Icon name="PlusCircle" :size="18" />
              Publier une opportunité
            </Button>
          </router-link>
        </template>
      </EmptyState>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card v-for="offer in filteredOffers" :key="offer.id" hover variant="elevated"
          class="flex flex-col group cursor-pointer overflow-hidden border-2 border-transparent hover:border-theme-200"
          @click="handleViewOffer(offer.id, offer.slug)">
          <!-- Image de l'offre si disponible -->
          <div v-if="offer.images && offer.images.length > 0"
            class="relative -mx-6 -mt-6 mb-4 aspect-video overflow-hidden">
            <img :src="getImageUrl(offer.images[0])" :alt="offer.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="handleImageError" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          <!-- Header avec badges -->
          <div class="flex items-start justify-between mb-3 sm:mb-4">
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Badge :color="offer.type === 'offer' ? 'theme' : 'orange'" size="sm">
                <Icon :name="offer.type === 'offer' ? 'Briefcase' : 'Calendar'" :size="12" class="mr-1" />
                {{ offer.type === 'offer' ? 'Appel' : 'Événement' }}
              </Badge>
              <Badge color="gray" variant="outline" size="sm" class="hidden sm:inline-flex">
                {{ offer.secteur?.nom || offer.sector }}
              </Badge>
            </div>

            <button v-if="user?.role === 'startuper'" @click.stop="handleSaveOffer(offer.id)"
              class="p-1.5 sm:p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <Icon name="Heart" :size="18" :class="savedOffers.includes(offer.id)
                  ? 'text-red-500 fill-current'
                  : 'text-neutral-400 hover:text-red-400'
                " />
            </button>
          </div>

          <!-- Title -->
          <h3
            class="font-black text-base sm:text-lg lg:text-xl text-neutral-900 mb-2 sm:mb-3 group-hover:text-theme-700 transition-colors line-clamp-2">
            {{ offer.title }}
          </h3>

          <!-- Description -->
          <p
            class="text-xs sm:text-sm text-neutral-600 mb-3 sm:mb-4 flex-1 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {{ offer.description }}
          </p>

          <!-- Footer -->
          <div class="pt-3 sm:pt-4 border-t-2 border-neutral-100 space-y-2 sm:space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 text-neutral-600 font-semibold">
                <div class="w-5 h-5 sm:w-6 sm:h-6 bg-theme-100 rounded-lg flex items-center justify-center">
                  <Icon name="User" :size="10" class="sm:hidden text-theme-700" />
                  <Icon name="User" :size="12" class="hidden sm:block text-theme-700" />
                </div>
                <span class="truncate max-w-[100px] sm:max-w-none">{{ offer.creatorName }}</span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 text-neutral-500 font-medium">
                <span class="flex items-center gap-1">
                  <Icon name="Eye" :size="12" />
                  {{ offer.views || 0 }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[10px] sm:text-xs text-neutral-500 font-medium flex items-center gap-1">
                <Icon name="Clock" :size="10" class="sm:hidden" />
                <Icon name="Clock" :size="12" class="hidden sm:block" />
                {{ formatDistanceToNow(offer.createdAt, { addSuffix: true }) }}
              </span>

              <Badge v-if="offer.deadline" :color="offer.is_expired ? 'red' : 'green'" size="sm">
                {{ offer.is_expired ? '✗ Expiré' : '✓ Actif' }}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useOffersStore } from '@/stores/offersStore.js'
import offersApi from '@/services/offers.js'
import api from '@/services/api'
import {
  Card,
  Button,
  Badge,
  EmptyState,

  Select,
  Icon,
  PageHeader,
  SearchBar,
} from '../../components/ui'
import OfferCardSkeleton from '@/components/skeletons/OfferCardSkeleton.vue';
import { formatDistanceToNow } from '../../utils/dateUtils'
import { getImageUrl } from '../../utils/imageUtils'

const router = useRouter()
const { user } = useAuth()
const offersStore = useOffersStore()

const offers = ref([])
const savedOfferIds = ref([])
const loading = ref(true)
const savingOffers = ref(new Set()) // Track offers being saved/unsaved

// Filters
const searchQuery = ref('')
const selectedType = ref('all') // Par défaut, afficher toutes les offres
const selectedSector = ref('all')
const showOnlySaved = ref(false)

const sectors = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/secteurs')
    sectors.value = data.secteurs || data || []
  } catch (e) {
    console.error('Erreur chargement secteurs:', e)
  }
})

const filteredOffers = computed(() => {
  let filtered = [...offers.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (offer) =>
        offer.title?.toLowerCase().includes(query) ||
        offer.description?.toLowerCase().includes(query) ||
        (offer.publisher?.name || offer.creatorName || '').toLowerCase().includes(query),
    )
  }

  // Type filter
  if (selectedType.value !== 'all') {
    filtered = filtered.filter((offer) => offer.type === selectedType.value)
  }

  // Sector filter
  if (selectedSector.value !== 'all') {
    filtered = filtered.filter((offer) =>
      offer.secteur_id == selectedSector.value
    )
  }

  // Saved offers filter
  if (showOnlySaved.value) {
    filtered = filtered.filter((offer) => savedOfferIds.value.includes(offer.id))
  }

  return filtered
})

// Alias for template
const savedOffers = computed(() => savedOfferIds.value)

const loadData = async () => {
  // Afficher le loading seulement si pas de données en cache
  const hasCache = offers.value.length > 0;
  if (!hasCache) loading.value = true;

  try {
    // Charger les offres depuis l'API
    const response = await offersStore.fetch({
      search: searchQuery.value || undefined,
      secteur: selectedSector.value !== 'all' ? selectedSector.value : undefined,
    });
    console.log('Offres chargées:', response);
    // Mapper les données pour le format attendu par le template
    offers.value = (offersStore.list || []).map(offer => ({
      ...offer,
      creatorName: offer.publisher?.name || offer.creatorName || 'Inconnu',
      sector: offer.secteur?.nom || offer.sector,
      createdAt: offer.created_at ? new Date(offer.created_at).getTime() : Date.now(),
      deadline: offer.deadline ? new Date(offer.deadline).getTime() : null,
    }))

    // Charger les offres sauvegardées pour l'utilisateur startuper
    if (user.value?.role === 'startuper') {
      try {
        const savedData = await offersStore.saved();
        savedOfferIds.value = savedData.map((o) => o.id);
      } catch (err) {
        console.warn('Erreur chargement offres sauvegardées:', err);
        savedOfferIds.value = [];
      }
    }
  } catch (error) {
    console.error('Error loading offers:', error)
    // Ne pas vider les données en cas d'erreur si on a du cache
  } finally {
    loading.value = false
  }
}

const handleSaveOffer = async (offerId) => {
  if (savingOffers.value.has(offerId)) return; // Empêcher double-clic

  savingOffers.value.add(offerId)

  try {
    const isSaved = savedOfferIds.value.includes(offerId);
    await offersApi.toggleSave(offerId, isSaved);

    if (isSaved) {
      savedOfferIds.value = savedOfferIds.value.filter((id) => id !== offerId)
    } else {
      savedOfferIds.value = [...savedOfferIds.value, offerId]
    }
  } catch (error) {
    console.error('Error saving offer:', error)
  } finally {
    savingOffers.value.delete(offerId)
  }
}

const handleViewOffer = (offerId, slug) => {
  // Utiliser le slug si disponible, sinon l'id
  const identifier = slug || offerId
  router.push(`/offers/${identifier}`)
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'all' // Réinitialiser sur 'all' pour afficher toutes les offres
  selectedSector.value = 'all'
  showOnlySaved.value = false
}

// Debounced search
let searchTimeout = null
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadData()
  }, 300)
})

// Reload on sector change
watch(selectedSector, () => {
  loadData()
})

onMounted(loadData)
</script>
