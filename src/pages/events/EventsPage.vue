<template>
  <div class="card-spacing">
    <!-- Page Header -->
    <PageHeader
      title="Événements"
      icon="Calendar"
      :description="`${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''} disponible${filteredEvents.length > 1 ? 's' : ''}`"
    >
      <template #actions>
        <router-link v-if="user?.role === 'partenaire' || user?.role === 'admin'" to="/events/create">
          <Button size="lg" variant="gradient">
            <Icon name="PlusCircle" :size="20" />
            Créer un événement
          </Button>
        </router-link>
      </template>
    </PageHeader>

    <!-- Filters Card -->
    <Card variant="elevated">
      <div class="space-y-5">
        <!-- Search Bar -->
        <SearchBar
          v-model="searchQuery"
          placeholder="Rechercher un événement par titre, description..."
        />

        <!-- Filter Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Date Filter -->
          <Select v-model="selectedDateFilter">
            <option value="all">Toutes les dates</option>
            <option value="upcoming">À venir</option>
            <option value="this-week">Cette semaine</option>
            <option value="this-month">Ce mois</option>
            <option value="past">Passés</option>
          </Select>

          <!-- Status Filter -->
          <Select v-model="selectedSector">
            <option value="all">Tous les événements</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
            <option value="cancelled">Annulés</option>
          </Select>
        </div>

        <!-- Quick Filters -->
        <div class="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
          <button
            v-if="user?.role === 'startuper'"
            @click="showOnlySaved = !showOnlySaved"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2',
              showOnlySaved
                ? 'bg-brand-orange text-white shadow-soft'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
            ]"
          >
            <Icon name="Bookmark" :size="16" />
            Sauvegardés ({{ savedEvents.length }})
          </button>

          <button
            v-if="
              searchQuery ||
              selectedDateFilter !== 'all' ||
              selectedSector !== 'all' ||
              showOnlySaved
            "
            @click="resetFilters"
            class="px-4 py-2.5 rounded-xl text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-300 flex items-center gap-2"
          >
            <Icon name="X" :size="16" />
            Réinitialiser
          </button>

          <div class="ml-auto flex items-center gap-2 text-sm text-neutral-600 font-medium">
            <Icon name="Filter" :size="16" />
            <span
              >{{ filteredEvents.length }} résultat{{ filteredEvents.length > 1 ? 's' : '' }}</span
            >
          </div>
        </div>
      </div>
    </Card>

    <!-- Events Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCardSkeleton v-for="i in 6" :key="i" />
    </div>
    <template v-else>
      <!-- Error State -->
      <Card v-if="error" variant="elevated" class="text-center py-8">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="AlertCircle" :size="32" class="text-red-500" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-neutral-900 mb-2">Erreur de chargement</h3>
            <p class="text-neutral-600 mb-4">{{ error }}</p>
            <Button @click="loadData" variant="outline">
              <Icon name="RefreshCw" :size="16" />
              Réessayer
            </Button>
          </div>
        </div>
      </Card>
      <EmptyState
        v-else-if="filteredEvents.length === 0"
        title="Aucun événement trouvé"
        :description="
          searchQuery || selectedDateFilter !== 'all' || selectedSector !== 'all'
            ? 'Essayez de modifier vos filtres de recherche'
            : 'Les nouveaux événements apparaîtront ici'
        "
      >
        <template #icon>
          <Icon name="CalendarX" :size="48" />
        </template>
        <template v-if="user?.role === 'partenaire' || user?.role === 'admin'" #action>
          <router-link to="/events/create">
            <Button variant="gradient" size="lg">
              <Icon name="PlusCircle" :size="18" />
              Créer un événement
            </Button>
          </router-link>
        </template>
      </EmptyState>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="event in filteredEvents"
        :key="event.id"
        hover
        variant="elevated"
        class="flex flex-col group cursor-pointer overflow-hidden border-2 border-transparent hover:border-brand-orange/30"
        @click="handleViewEvent(event.id)"
      >
        <!-- Event Image/Cover -->
        <div
          class="relative -mx-6 -mt-6 mb-4 h-40 bg-gradient-to-br from-theme-400 to-theme-600 overflow-hidden"
        >
          <img
            v-if="event.image_url"
            :src="event.image_url"
            :alt="event.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="Calendar" :size="48" class="text-white" />
          </div>

          <!-- Date Badge -->
          <div
            class="absolute top-3 left-3 bg-white rounded-xl shadow-soft p-2 text-center min-w-[60px]"
          >
            <p class="text-xs font-bold text-black uppercase">
              {{ getMonthShort(event.date_event) }}
            </p>
            <p class="text-2xl font-black text-neutral-900">
              {{ getDay(event.date_event) }}
            </p>
          </div>
        </div>

        <!-- Header avec badges -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <Badge color="theme" size="md">
              <Icon name="Calendar" :size="12" class="mr-1" />
              Événement
            </Badge>
            <Badge v-if="event.status" :color="getStatusColor(event.status)" variant="outline" size="sm">
              {{ getStatusLabel(event.status) }}
            </Badge>
          </div>

          <button
            v-if="user?.role === 'startuper'"
            @click.stop="handleSaveEvent(event.id)"
            class="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <Icon
              name="Heart"
              :size="20"
              :class="
                savedEvents.includes(event.id)
                  ? 'text-red-500 fill-current'
                  : 'text-neutral-400 hover:text-red-400'
              "
            />
          </button>
        </div>

        <!-- Title -->
        <h3
          class="font-black text-lg text-neutral-900 mb-2 group-hover:text-theme transition-colors line-clamp-2"
        >
          {{ event.title }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-neutral-600 mb-4 flex-1 line-clamp-2 leading-relaxed">
          {{ event.description }}
        </p>

        <!-- Event Info -->
        <div class="space-y-2 mb-4">
          <div v-if="event.lieu" class="flex items-center gap-2 text-sm text-neutral-600">
            <Icon name="MapPin" :size="16" class="text-neutral-400" />
            <span class="truncate">{{ event.lieu }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-neutral-600">
            <Icon name="Clock" :size="16" class="text-neutral-400" />
            <span>{{ formatEventDate(event.date_event) }}</span>
          </div>
          <div v-if="event.places_total" class="flex items-center gap-2 text-sm text-neutral-600">
            <Icon name="Users" :size="16" class="text-neutral-400" />
            <span>{{ event.available_places }} / {{ event.places_total }} places disponibles</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-neutral-600">
            <div class="w-6 h-6 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <Icon name="User" :size="12" class="text-brand-orange" />
            </div>
            <span class="truncate font-medium">{{ event.creator?.name || 'Organisateur' }}</span>
          </div>

          <div class="flex items-center gap-3 text-neutral-500 text-sm">
            <span class="flex items-center gap-1">
              <Icon name="Users" :size="14" />
              {{ event.reserved_places || 0 }}
            </span>
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
import { useEventsStore } from '../../stores/eventsStore'
import {
  Card,
  Button,
  Badge,
  EmptyState,
  LoadingSpinner,
  Select,
  Icon,
  PageHeader,
  SearchBar,
} from '../../components/ui'
import EventCardSkeleton from '@/components/skeletons/EventCardSkeleton.vue';

const router = useRouter()
const { user } = useAuth()
const eventsStore = useEventsStore()

const events = ref([])
const loading = ref(true)
const error = ref(null)

// Accéder aux événements sauvegardés via le store
const savedEvents = computed(() => eventsStore.savedEvents)

// Filters
const searchQuery = ref('')
const selectedDateFilter = ref('all')
const selectedSector = ref('all')
const showOnlySaved = ref(false)

// Helper pour obtenir la date de l'événement
const getEventTimestamp = (event) => {
  if (event.date_event) return new Date(event.date_event).getTime()
  if (event.created_at) return new Date(event.created_at).getTime()
  return 0
}

// Helper pour obtenir la couleur du statut
const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    expired: 'red',
    cancelled: 'gray',
    draft: 'yellow',
    published: 'green'
  }
  return colors[status] || 'gray'
}

// Helper pour obtenir le libellé du statut
const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif',
    expired: 'Expiré',
    cancelled: 'Annulé',
    draft: 'Brouillon',
    published: 'Publié'
  }
  return labels[status] || status
}

const filteredEvents = computed(() => {
  let filtered = [...events.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.creator?.name?.toLowerCase().includes(query) ||
        event.lieu?.toLowerCase().includes(query),
    )
  }

  // Date filter
  const now = Date.now()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const oneMonth = 30 * 24 * 60 * 60 * 1000

  if (selectedDateFilter.value === 'upcoming') {
    filtered = filtered.filter((event) => getEventTimestamp(event) > now)
  } else if (selectedDateFilter.value === 'this-week') {
    filtered = filtered.filter(
      (event) =>
        getEventTimestamp(event) > now &&
        getEventTimestamp(event) < now + oneWeek,
    )
  } else if (selectedDateFilter.value === 'this-month') {
    filtered = filtered.filter(
      (event) =>
        getEventTimestamp(event) > now &&
        getEventTimestamp(event) < now + oneMonth,
    )
  } else if (selectedDateFilter.value === 'past') {
    filtered = filtered.filter((event) => getEventTimestamp(event) < now)
  }

  // Status filter (remplacement de secteur par status)
  if (selectedSector.value !== 'all') {
    filtered = filtered.filter((event) => event.status === selectedSector.value)
  }

  // Saved events filter
  if (showOnlySaved.value) {
    filtered = filtered.filter((event) => savedEvents.value.includes(event.id))
  }

  return filtered
})

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    // Charger les événements depuis l'API via le store
    const data = await eventsStore.fetchEvents()
    events.value = data
  } catch (err) {
    console.error('Error loading events:', err)
    error.value = err.response?.data?.message || 'Impossible de charger les événements. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

const handleSaveEvent = (eventId) => {
  eventsStore.toggleSavedEvent(eventId)
}

const handleViewEvent = (eventId) => {
  router.push(`/events/${eventId}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedDateFilter.value = 'all'
  selectedSector.value = 'all'
  showOnlySaved.value = false
}

const getMonthShort = (dateValue) => {
  if (!dateValue) return ''
  const months = [
    'JAN',
    'FÉV',
    'MAR',
    'AVR',
    'MAI',
    'JUI',
    'JUL',
    'AOÛ',
    'SEP',
    'OCT',
    'NOV',
    'DÉC',
  ]
  const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue)
  return months[date.getMonth()]
}

const getDay = (dateValue) => {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue)
  return date.getDate()
}

const formatEventDate = (dateValue) => {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadData)
</script>
