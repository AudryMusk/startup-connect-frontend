<template>
  <div class="card-spacing">
    <!-- Modal de réservation -->
    <Modal :isOpen="showReservationModal" title="Réserver des places" size="sm" @close="closeReservationModal">
      <div class="space-y-6">
        <!-- Informations sur l'événement -->
        <div class="bg-gradient-to-r from-brand-orange/10 to-brand-purple/10 rounded-xl p-4">
          <h4 class="font-bold text-neutral-900 mb-2">{{ event?.title }}</h4>
          <div class="flex items-center gap-2 text-sm text-neutral-600">
            <Icon name="Calendar" :size="16" />
            <span>{{ formatEventDate(event?.date_event) }}</span>
          </div>
        </div>

          <!-- Places disponibles -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="Info" :size="18" class="text-blue-500" />
              <span class="font-medium text-blue-900">Informations</span>
            </div>
            <ul class="text-sm text-blue-800 space-y-1">
              <li v-if="event?.places_total">
                <span class="font-medium">{{ event?.available_places }}</span> places disponibles sur {{ event?.places_total }}
              </li>
              <li v-else>Places illimitées</li>
              <li>
                Maximum <span class="font-medium">{{ maxSeatsAllowed }}</span> place(s) par personne
              </li>
            </ul>
          </div>

          <!-- Sélection du nombre de places -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              Nombre de places souhaitées *
            </label>
            <div class="flex items-center gap-4">
              <button
                @click="decrementSeats"
                :disabled="reservationSeats <= 1"
                class="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Icon name="Minus" :size="20" />
              </button>
              <div class="flex-1">
                <input
                  v-model.number="reservationSeats"
                  type="number"
                  min="1"
                  :max="maxSeatsAllowed"
                  class="w-full text-center text-2xl font-bold py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <button
                @click="incrementSeats"
                :disabled="reservationSeats >= maxSeatsAllowed"
                class="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Icon name="Plus" :size="20" />
              </button>
            </div>
            <p v-if="reservationSeats > maxSeatsAllowed" class="text-red-500 text-sm mt-2">
              Vous ne pouvez pas réserver plus de {{ maxSeatsAllowed }} place(s).
            </p>
          </div>

          <!-- Erreur -->
          <div v-if="reservationError" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-2">
              <Icon name="AlertCircle" :size="18" class="text-red-500 mt-0.5" />
              <p class="text-red-700 text-sm">{{ reservationError }}</p>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex gap-3 pt-2">
            <Button @click="closeReservationModal" variant="outline" class="flex-1">
              Annuler
            </Button>
            <Button
              @click="confirmReservation"
              variant="gradient"
              class="flex-1"
              :disabled="reserving || reservationSeats < 1 || reservationSeats > maxSeatsAllowed"
            >
              <LoadingSpinner v-if="reserving" size="sm" />
              <template v-else>
                <Icon name="Check" :size="18" />
                Confirmer ({{ reservationSeats }} place{{ reservationSeats > 1 ? 's' : '' }})
              </template>
            </Button>
          </div>
      </div>
    </Modal>

    <!-- Modal des réservations (pour partenaires et admins) -->
    <Modal :isOpen="showReservationsModal" title="Réservations de l'événement" size="lg" @close="showReservationsModal = false">
      <div class="space-y-4">
        <!-- Résumé -->
        <div class="bg-gradient-to-r from-brand-orange/10 to-brand-purple/10 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-neutral-900">{{ event?.title }}</h4>
              <p class="text-sm text-neutral-600">{{ formatEventDate(event?.date_event) }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-brand-orange">{{ totalReservedPlaces }}</p>
              <p class="text-sm text-neutral-600">places réservées</p>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingReservations" class="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Liste des réservations -->
        <div v-else-if="reservations.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="reservation in reservations"
            :key="reservation.id"
            class="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-brand-orange/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-purple rounded-full flex items-center justify-center">
                <Icon v-if="reservation.startup" name="Building2" :size="18" class="text-white" />
                <Icon v-else name="User" :size="18" class="text-white" />
              </div>
              <div>
                <p class="font-bold text-neutral-900">
                  {{ reservation.startup?.nom || reservation.user?.name || 'Utilisateur' }}
                </p>
                <p class="text-sm text-neutral-500">
                  {{ reservation.user?.email }}
                </p>
                <p class="text-xs text-neutral-400">
                  Réservé le {{ formatReservationDate(reservation.reserved_at) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                <Icon name="Users" :size="14" />
                {{ reservation.nombre_places }} place{{ reservation.nombre_places > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Icon name="Calendar" :size="32" class="text-neutral-400" />
          </div>
          <p class="text-neutral-600">Aucune réservation pour cet événement.</p>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-neutral-200">
          <Button @click="showReservationsModal = false" variant="outline" class="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <Card variant="elevated">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-neutral-200 rounded w-3/4"></div>
          <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div class="h-64 bg-neutral-200 rounded"></div>
          <div class="space-y-2">
            <div class="h-4 bg-neutral-200 rounded"></div>
            <div class="h-4 bg-neutral-200 rounded"></div>
            <div class="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else-if="error" variant="elevated" class="text-center py-8">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Icon name="AlertCircle" :size="32" class="text-red-500" />
        </div>
        <div>
          <h3 class="font-bold text-lg text-neutral-900 mb-2">Erreur de chargement</h3>
          <p class="text-neutral-600 mb-4">{{ error }}</p>
          <div class="flex gap-3 justify-center">
            <Button @click="loadEvent" variant="outline">
              <Icon name="RefreshCw" :size="16" />
              Réessayer
            </Button>
            <router-link to="/events">
              <Button variant="ghost">
                <Icon name="ArrowLeft" :size="16" />
                Retour aux événements
              </Button>
            </router-link>
          </div>
        </div>
      </div>
    </Card>

    <!-- Event Content -->
    <template v-else-if="event">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <router-link to="/events">
          <Button variant="ghost" size="md">
            <Icon name="ArrowLeft" :size="18" />
            Retour aux événements
          </Button>
        </router-link>

        <div class="flex gap-3">
          <Button
            v-if="user?.role === 'startuper'"
            @click="handleSaveEvent"
            variant="outline"
            size="md"
          >
            <Icon
              name="Heart"
              :size="18"
              :class="isSaved ? 'text-red-500 fill-current' : ''"
            />
            {{ isSaved ? 'Sauvegardé' : 'Sauvegarder' }}
          </Button>

          <Button
            v-if="canViewReservations"
            @click="openReservationsModal"
            variant="outline"
            size="md"
          >
            <Icon name="Users" :size="18" />
            Voir les réservations
          </Button>

          <Button
            v-if="canEdit"
            @click="handleEdit"
            variant="outline"
            size="md"
          >
            <Icon name="Edit" :size="18" />
            Modifier
          </Button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Event Image -->
          <Card variant="elevated" class="overflow-hidden">
            <div
              class="relative -mx-6 -mt-6 mb-6 h-96 bg-gradient-to-br from-theme-400 to-theme-600"
            >
              <img
                v-if="event.image_url"
                :src="event.image_url"
                :alt="event.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="Calendar" :size="96" class="text-white" />
              </div>

              <!-- Status Badge -->
              <div class="absolute top-4 right-4">
                <Badge
                  :color="getStatusColor(event.status)"
                  size="lg"
                  class="p-2"
                >
                  {{ getStatusLabel(event.status) }}
                </Badge>
              </div>
            </div>

            <!-- Title & Description -->
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Badge color="theme" size="lg" class="p-2">
                  <Icon name="Calendar" :size="16" class="mr-1" />
                  Événement
                </Badge>
              </div>

              <h1 class="font-black text-3xl text-neutral-900">
                {{ event.title }}
              </h1>

              <p class="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {{ event.description }}
              </p>
            </div>
          </Card>

          <!-- Reservations Section (visible uniquement pour les startupers) -->
          <Card v-if="user?.role === 'startuper' && canReserve" variant="elevated">
            <h3 class="font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
              <Icon name="Users" :size="24" class="text-theme" />
              Réservation
            </h3>

            <div v-if="hasReserved" class="bg-green-50 border border-green-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <Icon name="CheckCircle" :size="20" class="text-green-500 mt-0.5" />
                <div>
                  <p class="font-bold text-green-900">Vous avez déjà réservé pour cet événement</p>
                  <p class="text-sm text-green-700 mt-1">Vos places ont été confirmées.</p>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="event.places_total && event.available_places <= 0" class="bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                  <Icon name="XCircle" :size="20" class="text-red-500 mt-0.5" />
                  <div>
                    <p class="font-bold text-red-900">Complet</p>
                    <p class="text-sm text-red-700 mt-1">Il n'y a plus de places disponibles pour cet événement.</p>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-4">
                <p class="text-neutral-600">
                  Réservez votre place pour participer à cet événement.
                </p>

                <div v-if="event.places_total" class="flex items-center gap-2 text-sm text-neutral-600">
                  <Icon name="Users" :size="16" />
                  <span class="font-medium">{{ event.available_places }} / {{ event.places_total }} places disponibles</span>
                </div>

                <Button @click="openReservationModal" size="lg" variant="gradient" :disabled="reserving">
                  <Icon name="Calendar" :size="18" />
                  Réserver ma place
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Event Info Card -->
          <Card variant="elevated">
            <h3 class="font-bold text-lg text-neutral-900 mb-4">Informations</h3>
            <div class="space-y-4">
              <!-- Date -->
              <div class="flex gap-3">
                <div class="w-10 h-10 bg-theme-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Calendar" :size="20" class="text-theme" />
                </div>
                <div>
                  <p class="text-xs text-neutral-500 font-medium uppercase">Date</p>
                  <p class="font-bold text-neutral-900">{{ formatEventDate(event.date_event) }}</p>
                </div>
              </div>

              <!-- Location -->
              <div v-if="event.lieu" class="flex gap-3">
                <div class="w-10 h-10 bg-theme-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" :size="20" class="text-theme" />
                </div>
                <div>
                  <p class="text-xs text-neutral-500 font-medium uppercase">Lieu</p>
                  <p class="font-bold text-neutral-900">{{ event.lieu }}</p>
                </div>
              </div>

              <!-- Places -->
              <div v-if="event.places_total" class="flex gap-3">
                <div class="w-10 h-10 bg-theme-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Users" :size="20" class="text-theme" />
                </div>
                <div>
                  <p class="text-xs text-neutral-500 font-medium uppercase">Capacité</p>
                  <p class="font-bold text-neutral-900">
                    {{ event.reserved_places }} / {{ event.places_total }} places réservées
                  </p>
                  <div class="mt-2 w-full bg-neutral-200 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-brand-orange to-brand-purple h-2 rounded-full transition-all"
                      :style="{ width: `${(event.reserved_places / event.places_total) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- Organizer Card (visible uniquement pour les startupers) -->
          <Card v-if="user?.role === 'startuper' && event.creator" variant="elevated">
            <h3 class="font-bold text-lg text-neutral-900 mb-4">Organisateur</h3>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="event.creator.organization?.logo_url"
                  :src="event.creator.organization.logo_url"
                  :alt="event.creator.organization.name"
                  class="w-full h-full object-cover"
                />
                <Icon v-else name="Building" :size="20" class="text-white" />
              </div>
              <div>
                <p class="font-bold text-neutral-900">
                  {{ event.creator.organization?.name || 'Organisation non définie' }}
                </p>
                <p class="text-sm text-neutral-600">Partenaire</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'
import { useEventsStore } from '../../stores/eventsStore'
import { useStartupStore } from '../../stores/startupStore'
import { Card, Button, Badge, Icon, Modal, LoadingSpinner } from '../../components/ui'
import eventsApi from '../../services/events'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const eventsStore = useEventsStore()
const startupStore = useStartupStore()

const event = ref(null)
const loading = ref(true)
const error = ref(null)
const reserving = ref(false)
const hasReserved = ref(false)

// Modal de réservation
const showReservationModal = ref(false)
const reservationSeats = ref(1)
const reservationError = ref(null)

// Modal des réservations (pour partenaires/admins)
const showReservationsModal = ref(false)
const reservations = ref([])
const loadingReservations = ref(false)

const isSaved = computed(() => eventsStore.savedEvents.includes(event.value?.id))
const canEdit = computed(() => {
  if (!user.value || !event.value) return false
  return user.value.id === event.value.creator?.id || user.value.role === 'admin'
})

// Les partenaires et admins peuvent voir les réservations
const canViewReservations = computed(() => {
  if (!user.value || !event.value) return false
  return user.value.role === 'partenaire' || user.value.role === 'admin' || user.value.id === event.value.creator?.id
})

// Total des places réservées
const totalReservedPlaces = computed(() => {
  return reservations.value.reduce((sum, r) => sum + (r.nombre_places || 0), 0)
})

// Vérifie si l'utilisateur a une startup
const hasStartup = computed(() => startupStore.hasStartup)

// Calcul du nombre maximum de places autorisées
const maxSeatsAllowed = computed(() => {
  if (!event.value) return 1

  const maxPerStartup = event.value.max_seats_per_startup || 10
  const availablePlaces = event.value.available_places ?? Infinity

  // Retourne le minimum entre la limite par startup et les places disponibles
  return Math.min(maxPerStartup, availablePlaces)
})

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

// Vérifier si l'événement est réservable (actif et non expiré)
const canReserve = computed(() => {
  if (!event.value) return false
  return event.value.status === 'active'
})

const loadEvent = async () => {
  loading.value = true
  error.value = null
  try {
    const eventId = route.params.id
    const data = await eventsStore.fetchEvent(eventId)
    event.value = data

    // Charger la startup de l'utilisateur s'il est startuper
    if (user.value?.role === 'startuper') {
      try {
        await startupStore.fetchMyStartup()
      } catch (err) {
        console.warn('User has no startup:', err)
      }
    }

    // Check if user has already reserved
    if (user.value) {
      // This would need to be implemented in the store/API
      // hasReserved.value = await eventsStore.checkReservation(eventId)
    }
  } catch (err) {
    console.error('Error loading event:', err)
    error.value = err.response?.data?.message || 'Impossible de charger l\'événement.'
  } finally {
    loading.value = false
  }
}

const handleSaveEvent = () => {
  if (event.value) {
    eventsStore.toggleSavedEvent(event.value.id)
  }
}

const handleEdit = () => {
  router.push(`/events/${event.value.id}/edit`)
}

// Ouvrir le modal des réservations
const openReservationsModal = async () => {
  showReservationsModal.value = true
  loadingReservations.value = true

  try {
    const response = await eventsApi.getReservations(event.value.id)
    reservations.value = response.data?.data?.reservations || response.data?.reservations || []
  } catch (err) {
    console.error('Error loading reservations:', err)
    toast.error('Erreur lors du chargement des réservations')
    reservations.value = []
  } finally {
    loadingReservations.value = false
  }
}

// Formater la date de réservation
const formatReservationDate = (dateValue) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Ouvrir le modal de réservation
const openReservationModal = () => {
  reservationSeats.value = 1
  reservationError.value = null
  showReservationModal.value = true
}

// Fermer le modal de réservation
const closeReservationModal = () => {
  showReservationModal.value = false
  reservationError.value = null
}

// Incrémenter le nombre de places
const incrementSeats = () => {
  if (reservationSeats.value < maxSeatsAllowed.value) {
    reservationSeats.value++
  }
}

// Décrémenter le nombre de places
const decrementSeats = () => {
  if (reservationSeats.value > 1) {
    reservationSeats.value--
  }
}

// Confirmer la réservation
const confirmReservation = async () => {
  if (!event.value) return

  // Validation
  if (reservationSeats.value < 1) {
    reservationError.value = 'Veuillez sélectionner au moins 1 place.'
    return
  }

  if (reservationSeats.value > maxSeatsAllowed.value) {
    reservationError.value = `Vous ne pouvez pas réserver plus de ${maxSeatsAllowed.value} place(s).`
    return
  }

  reserving.value = true
  reservationError.value = null

  try {
    await eventsStore.reserveEvent(event.value.id, {
      nombre_places: reservationSeats.value
    })

    hasReserved.value = true
    closeReservationModal()

    // Afficher notification de succès
    toast.success(
      `🎉 Réservation confirmée ! ${reservationSeats.value} place${reservationSeats.value > 1 ? 's' : ''} réservée${reservationSeats.value > 1 ? 's' : ''} pour "${event.value.title}"`,
      5000
    )

    // Recharger l'événement pour mettre à jour les places disponibles
    await loadEvent()
  } catch (err) {
    console.error('Error reserving event:', err)
    reservationError.value = err.response?.data?.message || 'Erreur lors de la réservation. Veuillez réessayer.'
    toast.error(reservationError.value, 5000)
  } finally {
    reserving.value = false
  }
}

const handleReserve = async () => {
  if (!event.value) return

  reserving.value = true
  try {
    await eventsStore.reserveEvent(event.value.id, { nombre_places: 1 })
    hasReserved.value = true
    toast.success('🎉 Réservation confirmée !', 5000)
    // Reload event to update available places
    await loadEvent()
  } catch (err) {
    console.error('Error reserving event:', err)
    toast.error(err.response?.data?.message || 'Erreur lors de la réservation', 5000)
  } finally {
    reserving.value = false
  }
}

const formatEventDate = (dateValue) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadEvent)
</script>
