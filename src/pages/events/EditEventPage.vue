<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="router.push(`/events/${route.params.id}`)" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <Icon name="ChevronLeft" :size="24" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Modifier l'événement</h1>
        <p class="text-gray-500 mt-1">Modifiez les informations de votre événement</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="initialLoading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Permission check -->
    <Alert v-else-if="!canEdit" type="error">
      Vous n'avez pas les permissions nécessaires pour modifier cet événement.
    </Alert>

    <template v-else>
      <!-- Success Message -->
      <Alert v-if="success" type="success">
        Événement mis à jour avec succès ! Redirection en cours...
      </Alert>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-theme" />
            Informations de base
          </h2>

          <div class="space-y-4">
            <Input
              label="Titre de l'événement"
              placeholder="Ex: Programme d'accélération Tech 2025"
              v-model="formData.title"
              :error="errors.title"
              required
            />

            <Textarea
              label="Description détaillée"
              placeholder="Décrivez l'événement, les objectifs, le contexte..."
              v-model="formData.description"
              :error="errors.description"
              :rows="6"
              required
            />
          </div>
        </Card>

        <!-- Details -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Calendar" class="text-theme" />
            Détails pratiques
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date de l'événement"
              type="datetime-local"
              v-model="formData.date_event"
              :error="errors.date_event"
              required
            />

            <Input
              label="Lieu"
              placeholder="Ex: Cotonou, Palais des Congrès"
              v-model="formData.lieu"
            />
          </div>

          <!-- Image actuelle -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Image de l'événement</label>
            
            <!-- Image existante -->
            <div v-if="existingImage && !removeExistingImage" class="relative inline-block mb-4">
              <img
                :src="existingImage"
                alt="Image actuelle"
                class="w-48 h-32 object-cover rounded-lg border-2 border-neutral-200"
              />
              <button
                type="button"
                @click="removeExistingImage = true"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition"
              >
                <Icon name="X" :size="14" />
              </button>
              <span class="block text-xs text-gray-500 mt-1">Image actuelle</span>
            </div>

            <!-- Nouvelle image -->
            <div class="flex items-center gap-4">
              <label
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors',
                  'bg-neutral-100 text-neutral-600 hover:bg-theme-100 hover:text-theme-700',
                ]"
              >
                <Icon name="Image" :size="18" />
                <span class="text-sm font-medium">{{ previewImage ? 'Changer l\'image' : 'Ajouter une image' }}</span>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="hidden"
                />
              </label>

              <div v-if="previewImage" class="relative group">
                <img
                  :src="previewImage"
                  alt="Preview"
                  class="w-24 h-24 object-cover rounded-lg border-2 border-neutral-200"
                />
                <button
                  type="button"
                  @click="removeNewImage"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Icon name="X" :size="14" />
                </button>
                <span class="block text-xs text-green-600 mt-1">Nouvelle image</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Event Capacity Management -->
        <Card class="border-2 border-blue-200 bg-blue-50/30">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Users" class="text-blue-600" />
            Gestion des places
          </h2>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre total de places"
                type="number"
                min="1"
                placeholder="Ex: 100 (laisser vide si illimité)"
                v-model="formData.places_total"
              />

              <Input
                label="Places max par startup"
                type="number"
                min="1"
                placeholder="Ex: 5"
                v-model="formData.max_seats_per_startup"
              />
            </div>

            <div class="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p class="flex text-sm text-blue-800 items-center gap-2">
                <Icon name="Info" :size="18" />
                Laissez vide pour un nombre de places illimité
              </p>
            </div>

            <!-- Réservations existantes -->
            <div v-if="event?.reserved_places > 0" class="bg-orange-100 border border-orange-300 rounded-lg p-3">
              <p class="flex text-sm text-orange-800 items-center gap-2">
                <Icon name="AlertTriangle" :size="18" />
                {{ event.reserved_places }} place(s) déjà réservée(s). Le nombre total ne peut pas être inférieur.
              </p>
            </div>
          </div>
        </Card>

        <!-- Featured Event Option (Admin Only) -->
        <Card v-if="user?.role === 'admin'" class="border-2 border-purple-200 bg-purple-50/30">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Star" class="text-purple-600" />
            Événement à la une
          </h2>

          <div class="space-y-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="formData.is_featured"
                class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <span class="font-medium text-gray-900">Afficher sur la bannière d'accueil</span>
                <p class="text-sm text-gray-500">
                  Cet événement sera affiché en bannière sur toutes les pages d'accueil avec un compte à rebours.
                </p>
              </div>
            </label>

            <div v-if="formData.is_featured" class="bg-purple-100 border border-purple-300 rounded-lg p-3">
              <p class="flex text-sm text-purple-800 items-center gap-2">
                <Icon name="AlertCircle" :size="18" />
                Un seul événement peut être à la une. Si un autre événement est déjà à la une, il sera remplacé.
              </p>
            </div>
          </div>
        </Card>

        <!-- Status Management -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Settings" class="text-theme" />
            Statut de l'événement
          </h2>

          <div class="space-y-4">
            <Select label="Statut" v-model="formData.status">
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="completed">Terminé</option>
            </Select>

            <div v-if="formData.status === 'cancelled'" class="bg-red-100 border border-red-300 rounded-lg p-3">
              <p class="flex text-sm text-red-800 items-center gap-2">
                <Icon name="AlertCircle" :size="18" />
                Attention : Annuler un événement notifiera tous les participants ayant réservé.
              </p>
            </div>
          </div>
        </Card>

        <!-- Error Message -->
        <Alert v-if="errors.submit" type="error">
          {{ errors.submit }}
        </Alert>

        <!-- Actions -->
        <div class="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            @click="router.push(`/events/${route.params.id}`)"
            :disabled="loading"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="loading" size="lg">
            <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
            {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useEventsStore } from '../../stores/eventsStore'
import eventsApi from '../../services/events'
import { Card, Button, Input, Select, Textarea, Alert, Icon, LoadingSpinner } from '../../components/ui'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const eventsStore = useEventsStore()

const event = ref(null)
const initialLoading = ref(true)
const loading = ref(false)
const success = ref(false)

const selectedImage = ref(null)
const previewImage = ref(null)
const existingImage = ref(null)
const removeExistingImage = ref(false)

const formData = reactive({
  title: '',
  description: '',
  date_event: '',
  lieu: '',
  places_total: '',
  max_seats_per_startup: '',
  is_featured: false,
  status: 'active',
})

const errors = reactive({})

const canEdit = computed(() => {
  if (!user.value || !event.value) return false
  // Le créateur ou un admin peut modifier
  return event.value.creator?.id === user.value.id || user.value.role === 'admin'
})

// Charger les données de l'événement
onMounted(async () => {
  try {
    const response = await eventsApi.get(route.params.id)
    event.value = response.data?.data || response.data

    if (event.value) {
      // Pré-remplir le formulaire
      formData.title = event.value.title || ''
      formData.description = event.value.description || ''
      formData.lieu = event.value.lieu || ''
      formData.places_total = event.value.places_total || ''
      formData.max_seats_per_startup = event.value.max_seats_per_startup || ''
      formData.is_featured = event.value.is_featured || false
      formData.status = event.value.status || 'active'
      
      // Convertir la date au format datetime-local
      if (event.value.date_event) {
        const date = new Date(event.value.date_event)
        formData.date_event = date.toISOString().slice(0, 16)
      }

      // Image existante
      existingImage.value = event.value.image_url || null
    }
  } catch (err) {
    console.error('Error loading event:', err)
    errors.submit = "Impossible de charger les données de l'événement"
  } finally {
    initialLoading.value = false
  }
})

const validateForm = () => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!formData.title.trim()) {
    errors.title = 'Le titre est requis'
  } else if (formData.title.length < 10) {
    errors.title = 'Le titre doit contenir au moins 10 caractères'
  }

  if (!formData.description.trim()) {
    errors.description = 'La description est requise'
  } else if (formData.description.length < 50) {
    errors.description = 'La description doit contenir au moins 50 caractères'
  }

  if (!formData.date_event) {
    errors.date_event = "La date de l'événement est requise"
  }

  // Vérifier que places_total >= reserved_places
  if (formData.places_total && event.value?.reserved_places) {
    if (parseInt(formData.places_total) < event.value.reserved_places) {
      errors.places_total = `Le nombre de places ne peut pas être inférieur aux réservations existantes (${event.value.reserved_places})`
    }
  }

  return Object.keys(errors).length === 0
}

const handleImageSelect = (e) => {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
    
    // Si on ajoute une nouvelle image, on garde l'existante jusqu'à sauvegarde
  }
}

const removeNewImage = () => {
  selectedImage.value = null
  previewImage.value = null
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const eventData = {
      title: formData.title,
      description: formData.description,
      date_event: formData.date_event || null,
      lieu: formData.lieu || null,
      places_total: formData.places_total ? parseInt(formData.places_total) : null,
      max_seats_per_startup: formData.max_seats_per_startup ? parseInt(formData.max_seats_per_startup) : null,
      is_featured: formData.is_featured,
      status: formData.status,
    }

    // Préparer les images à envoyer
    const images = selectedImage.value ? [selectedImage.value] : []

    await eventsStore.updateEvent(route.params.id, eventData, images)

    success.value = true

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push(`/events/${route.params.id}`)
    }, 2000)
  } catch (error) {
    console.error('Error updating event:', error)
    errors.submit = error.response?.data?.message || "Une erreur est survenue lors de la modification de l'événement"
  } finally {
    loading.value = false
  }
}
</script>
