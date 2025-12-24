<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="!offer" class="max-w-4xl mx-auto mt-20 px-4">
    <Alert type="error">Opportunité non trouvée</Alert>
  </div>

  <div v-else class="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
    <!-- Back Button -->
    <button
      @click="router.push('/offers')"
      class="flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-theme transition text-sm md:text-base"
    >
      <Icon name="ChevronLeft" :size="18" />
      <span class="font-medium">Retour</span>
    </button>

    <!-- Success Alert -->
    <Alert v-if="success" type="success"> Votre candidature a été envoyée avec succès ! </Alert>

    <!-- Header Card -->
    <Card>
      <div class="space-y-3 md:space-y-4">
        <!-- Title & Type -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 md:gap-3 mb-2">
              <Badge :color="offer.type === 'event' ? 'purple' : 'theme'" size="sm">
                {{ offer.type === 'event' ? 'Événement' : 'Appel à projets' }}
              </Badge>
              <Badge color="gray" size="sm">{{ offer.secteur?.nom || offer.sector }}</Badge>
              <Badge v-if="isExpired" color="red" size="sm">Expiré</Badge>
            </div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {{ offer.title }}
            </h1>
            <div
              class="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500"
            >
              <span class="flex items-center gap-1">
                <Icon name="User" :size="12" />
                {{ offer.creatorName }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="Calendar" :size="12" />
                {{ formatDistanceToNow(offer.createdAt, { addSuffix: true }) }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="Eye" :size="12" />
                {{ offer.views || 0 }} vues
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <Button
              v-if="user?.role === 'startuper'"
              variant="outline"
              size="sm"
              @click="handleSaveToggle"
            >
              <Icon
                :name="isSaved ? 'Heart' : 'Bookmark'"
                :size="14"
                :class="isSaved ? 'fill-current text-red-500' : ''"
              />
              <span class="hidden sm:inline">{{ isSaved ? 'Sauvegardé' : 'Sauvegarder' }}</span>
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Share" :size="14" />
              <span class="hidden sm:inline">Partager</span>
            </Button>
          </div>
        </div>

        <!-- Deadline -->
        <div
          v-if="offer.deadline"
          :class="[
            'flex items-center gap-2 p-2 md:p-3 rounded-lg text-sm md:text-base',
            isExpired ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700',
          ]"
        >
          <Icon name="Calendar" :size="16" />
          <span class="font-medium">
            {{ isExpired ? 'Expiré le' : 'Date limite :' }} {{ formatDate(offer.deadline) }}
          </span>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-4 md:space-y-6">
        <!-- Images -->
        <Card v-if="offer.images && offer.images.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(image, index) in offer.images"
              :key="index"
              class="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                :src="image"
                :alt="`Image ${index + 1} de l'offre`"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
          </div>
        </Card>

        <!-- Description -->
        <Card>
          <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-theme" :size="18" />
            Description
          </h2>
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {{ offer.description }}
          </p>
        </Card>

        <!-- Additional Details -->
        <Card v-if="offer.requirements || offer.benefits">
          <h2 class="text-xl font-bold mb-4">Détails supplémentaires</h2>

          <div v-if="offer.requirements" class="mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Critères d'éligibilité</h3>
            <p class="text-gray-700">{{ offer.requirements }}</p>
          </div>

          <div v-if="offer.benefits">
            <h3 class="font-semibold text-gray-900 mb-2">Avantages</h3>
            <p class="text-gray-700">{{ offer.benefits }}</p>
          </div>
        </Card>

        <!-- Application Form -->
        <Card v-if="canApply && !showApplicationForm" class="bg-theme-light border-2 border-theme">
          <div class="text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Postuler à cette opportunité</h3>
            <p class="text-gray-600 mb-4">
              Soumettez votre candidature et mettez en avant votre projet
            </p>
            <Button @click="showApplicationForm = true" size="lg">
              <Icon name="Send" :size="18" />
              Commencer ma candidature
            </Button>
          </div>
        </Card>

        <Card v-if="hasApplied" class="bg-green-50 border-2 border-green-200">
          <div class="flex items-start gap-3">
            <Icon name="CheckCircle" :size="24" class="text-green-600 flex-shrink-0" />
            <div>
              <h3 class="font-bold text-green-900 mb-1">Candidature envoyée</h3>
              <p class="text-green-700 text-sm">
                Vous avez déjà postulé à cette opportunité. Vous serez notifié de la réponse.
              </p>
            </div>
          </div>
        </Card>

        <!-- Application Form -->
        <Card v-if="showApplicationForm">
          <h2 class="text-xl font-bold mb-4">Formulaire de candidature</h2>
          <form @submit.prevent="handleSubmitApplication" class="space-y-4">
            <Textarea
              label="Pitch de votre projet *"
              placeholder="Présentez votre startup et votre projet en quelques lignes..."
              v-model="applicationForm.pitch"
              :rows="4"
              required
            />

            <Textarea
              label="Expérience et réalisations"
              placeholder="Parlez de votre parcours et de vos réalisations..."
              v-model="applicationForm.experience"
              :rows="3"
            />

            <Textarea
              label="Motivation *"
              placeholder="Pourquoi cette opportunité vous intéresse-t-elle ?"
              v-model="applicationForm.motivation"
              :rows="3"
              required
            />

            <Input
              label="Email de contact *"
              type="email"
              v-model="applicationForm.contactEmail"
              required
            />

            <Input label="Téléphone de contact" type="tel" v-model="applicationForm.contactPhone" />

            <!-- Seat Selection for Events -->
            <div
              v-if="offer.type === 'event' && offer.hasCapacityLimit"
              class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Nombre de places souhaitées *
              </label>
              <select
                v-model="applicationForm.requestedSeats"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                required
              >
                <option v-for="num in maxSeats" :key="num" :value="num">
                  {{ num }} place{{ num > 1 ? 's' : '' }}
                </option>
              </select>
              <p class="text-xs text-gray-600 mt-2">
                Maximum {{ offer.maxSeatsPerStartup }} place{{
                  offer.maxSeatsPerStartup > 1 ? 's' : ''
                }}
                par startup
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <Button
                type="submit"
                :disabled="submitting || !applicationForm.pitch || !applicationForm.motivation"
                class="flex-1"
              >
                <LoadingSpinner v-if="submitting" size="sm" />
                <template v-else>
                  <Icon name="Send" :size="16" />
                  Envoyer ma candidature
                </template>
              </Button>
              <Button type="button" variant="outline" @click="showApplicationForm = false">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Info -->
        <Card>
          <h3 class="font-bold mb-4">Informations</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-2">
              <Icon name="Building2" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Organisateur</p>
                <p class="font-semibold">{{ offer.creatorName }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <Icon name="Briefcase" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Secteur</p>
                <p class="font-semibold">{{ offer.secteur?.nom || offer.sector }}</p>
              </div>
            </div>

            <div v-if="offer.location" class="flex items-start gap-2">
              <Icon name="MapPin" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Localisation</p>
                <p class="font-semibold">{{ offer.location }}</p>
              </div>
            </div>

            <div v-if="offer.budget" class="flex items-start gap-2">
              <Icon name="TrendingUp" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Budget</p>
                <p class="font-semibold">{{ offer.budget }}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Stats -->
        <Card class="bg-gray-50">
          <h3 class="font-bold mb-4">Statistiques</h3>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-theme">{{ offer.views || 0 }}</p>
              <p class="text-xs text-gray-500">Vues</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ offer.applications || 0 }}</p>
              <p class="text-xs text-gray-500">Candidatures</p>
            </div>
          </div>
        </Card>

        <!-- Event Capacity Info -->
        <Card
          v-if="offer.type === 'event' && offer.hasCapacityLimit"
          class="bg-blue-50 border-2 border-blue-200"
        >
          <h3 class="font-bold mb-3 flex items-center gap-2">
            <Icon name="Users" :size="18" class="text-blue-600" />
            Places disponibles
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Capacité totale</span>
              <span class="font-bold text-gray-900">{{ offer.maxCapacity }} places</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Max par startup</span>
              <span class="font-bold text-gray-900">{{ offer.maxSeatsPerStartup }} places</span>
            </div>
            <div class="pt-2 border-t border-blue-300">
              <p class="text-xs text-blue-700 flex items-center gap-1">
                <Icon name="CheckCircle" :size="14" />
                Places encore disponibles
              </p>
            </div>
          </div>
        </Card>

        <!-- Contact -->
        <Card v-if="offer.contactEmail">
          <h3 class="font-bold mb-4">Contact</h3>
          <div class="space-y-2 text-sm">
            <a
              v-if="offer.contactEmail"
              :href="`mailto:${offer.contactEmail}`"
              class="flex items-center gap-2 text-theme hover:underline"
            >
              <Icon name="Mail" :size="16" />
              {{ offer.contactEmail }}
            </a>
            <a
              v-if="offer.contactPhone"
              :href="`tel:${offer.contactPhone}`"
              class="flex items-center gap-2 text-theme hover:underline"
            >
              <Icon name="Phone" :size="16" />
              {{ offer.contactPhone }}
            </a>
          </div>
        </Card>

        <!-- External Link -->
        <Card v-if="offer.externalFormUrl" class="bg-blue-50">
          <h3 class="font-bold mb-2">Candidature externe</h3>
          <p class="text-sm text-gray-600 mb-3">
            Cette opportunité nécessite une candidature via un formulaire externe.
          </p>
          <Button variant="outline" class="w-full" @click="openExternal(offer.externalFormUrl)">
            <Icon name="Globe" :size="16" />
            Accéder au formulaire
          </Button>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useOffersStore } from '@/stores/offersStore.js'
import { useApplicationsStore } from '@/stores/applicationsStore.js'
import offersApi from '@/services/offers.js'
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  Input,
  Textarea,
  Icon,
} from '../../components/ui'
import { formatDate, formatDistanceToNow } from '../../utils/dateUtils'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const offersStore = useOffersStore()
const applicationsStore = useApplicationsStore()

const offer = ref(null)
const loading = ref(true)
const isSaved = ref(false)
const hasApplied = ref(false)
const existingApplicationId = ref(null)
const existingApplicationStatus = ref(null)
const showApplicationForm = ref(false)
const submitting = ref(false)
const success = ref(false)
const error = ref(null)
const applyInfo = ref(null)

const applicationForm = reactive({
  pitch: '',
  experience: '',
  motivation: '',
  contactEmail: user.value?.email || '',
  contactPhone: '',
  requestedSeats: 1,
})

const isExpired = computed(() => {
  if (!offer.value) return false
  // Utiliser le champ is_expired de l'API si disponible
  if (offer.value.is_expired !== undefined) {
    return offer.value.is_expired
  }
  // Sinon calculer localement
  return offer.value.deadline && offer.value.deadline < Date.now()
})
const canApply = computed(
  () =>
    user.value?.role === 'startuper' &&
    user.value?.startupId &&
    !hasApplied.value &&
    !isExpired.value,
)
const maxSeats = computed(() => parseInt(offer.value?.maxSeatsPerStartup) || 1)

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const offerId = route.params.id

    // Charger l'offre depuis l'API
    const offerData = await offersStore.get(offerId)
    if (!offerData) {
      router.push('/offers')
      return
    }

    // Mapper les données pour le format attendu
    offer.value = {
      ...offerData,
      creatorName: offerData.publisher?.name || offerData.creatorName || 'Inconnu',
      sector: offerData.secteur?.nom || offerData.sector,
      createdAt: offerData.created_at ? new Date(offerData.created_at).getTime() : Date.now(),
      deadline: offerData.deadline ? new Date(offerData.deadline).getTime() : null,
      type: offerData.type || 'offer',
      is_expired: offerData.is_expired,
      images: offerData.images || [],
      hasCapacityLimit: offerData.has_capacity_limit || offerData.hasCapacityLimit,
      maxCapacity: offerData.max_capacity || offerData.maxCapacity,
      maxSeatsPerStartup: offerData.max_seats_per_startup || offerData.maxSeatsPerStartup,
      externalFormUrl: offerData.external_form_url || offerData.externalFormUrl,
      contactEmail: offerData.contact_email || offerData.contactEmail,
      contactPhone: offerData.contact_phone || offerData.contactPhone,
    }

    // Charger les informations de candidature si utilisateur connecté
    if (user.value?.role === 'startuper') {
      try {
        // Vérifier si l'offre est sauvegardée
        const savedResponse = await offersApi.getSaved()
        const savedData = savedResponse.data?.data || savedResponse.data || []
        isSaved.value = savedData.some((o) => o.id === parseInt(offerId))

        // Vérifier le statut de candidature
        const applyInfoData = await applicationsStore.getApplyInfo(offerId)
        applyInfo.value = applyInfoData
        hasApplied.value = applyInfoData.already_applied || false
        existingApplicationId.value = applyInfoData.existing_application_id || null
        existingApplicationStatus.value = applyInfoData.existing_application_status || null
      } catch (err) {
        console.warn('Erreur chargement statut:', err)
      }
    }
  } catch (err) {
    console.error('Error loading offer:', err)
    error.value = "Erreur lors du chargement de l'offre"
  } finally {
    loading.value = false
  }
}

const handleSaveToggle = async () => {
  try {
    await offersApi.toggleSave(route.params.id, isSaved.value)
    isSaved.value = !isSaved.value
  } catch (err) {
    console.error('Error toggling save:', err)
  }
}

const handleImageError = (event) => {
  // Masquer l'image en cas d'erreur
  event.target.style.display = 'none'
}

const handleSubmitApplication = async () => {
  submitting.value = true
  error.value = null

  try {
    const formPayload = {
      pitch: applicationForm.pitch,
      experience: applicationForm.experience,
      motivation: applicationForm.motivation,
      contact_email: applicationForm.contactEmail,
      contact_phone: applicationForm.contactPhone,
    }

    // Ajouter les places pour les événements
    if (offer.value.type === 'event' && offer.value.hasCapacityLimit) {
      formPayload.requested_seats = applicationForm.requestedSeats
    }

    await applicationsStore.apply(route.params.id, formPayload)

    success.value = true
    hasApplied.value = true
    showApplicationForm.value = false

    // Recharger les données après un court délai
    setTimeout(() => {
      loadData()
    }, 1000)
  } catch (err) {
    console.error('Error submitting application:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la soumission de la candidature'
  } finally {
    submitting.value = false
  }
}

const openExternal = (url) => {
  window.open(url, '_blank')
}

onMounted(loadData)
</script>
