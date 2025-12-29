<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="router.push('/offers')" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <Icon name="ChevronLeft" :size="24" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Publier un évenement</h1>
        <p class="text-gray-500 mt-1">Créez une nouvel évenement pour les startups</p>
      </div>
    </div>

    <!-- Permission check -->
    <Alert v-if="!user || (user.role !== 'partenaire' && user.role !== 'admin')" type="error">
      Vous n'avez pas les permissions nécessaires pour publier un évenement.
    </Alert>

    <template v-else>
      <!-- Success Message -->
      <Alert v-if="success" type="success">
        évenement créée avec succès ! Redirection en cours...
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
              label="Titre de l'évenement"
              placeholder="Ex: Programme d'accélération Tech 2025"
              v-model="formData.title"
              :error="errors.title"
              required
            />

            <Textarea
              label="Description détaillée"
              placeholder="Décrivez l'évenement, les objectifs, le contexte..."
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
              :min="minDateTime"
              required
            />

            <Input
              label="Lieu"
              placeholder="Ex: Cotonou, Palais des Congrès"
              v-model="formData.lieu"
            />

            <label
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors',
                previewImages.length >= 5
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-theme-100 hover:text-theme-700',
              ]"
            >
              <Icon name="Image" :size="18" />
              <span class="text-sm font-medium">Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageSelect"
                class="hidden"
                :disabled="previewImages.length >= 5"
              />
            </label>

            <div v-if="previewImages.length > 0" class="flex flex-wrap gap-2">
              <div v-for="(img, index) in previewImages" :key="index" class="relative group">
                <img
                  :src="img"
                  alt="Preview"
                  class="w-24 h-24 object-cover rounded-lg border-2 border-neutral-200"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Icon name="X" :size="14" />
                </button>
              </div>

              <!-- Indicateur si max atteint -->
              <div
                v-if="previewImages.length >= 5"
                class="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs text-center p-2"
              >
                Max 5 images
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                Laissez vide pour un nombre de places illimité
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

        <!-- Error Message -->
        <Alert v-if="errors.submit" type="error">
          {{ errors.submit }}
        </Alert>

        <!-- Actions -->
        <div class="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            @click="router.push('/offers')"
            :disabled="loading"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="loading" size="lg">
            {{ loading ? 'Publication...' : "Publier l'évenement" }}
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useEventsStore } from '../../stores/eventsStore'
import { Card, Button, Input, Select, Textarea, Alert, Icon } from '../../components/ui'

const router = useRouter()
const { user } = useAuth()
const eventsStore = useEventsStore()

const selectedImages = ref([])
const previewImages = ref([])

const formData = reactive({
  title: '',
  description: '',
  date_event: '',
  lieu: '',
  places_total: '',
  max_seats_per_startup: '',
  is_featured: false,
})

const errors = reactive({})
const loading = ref(false)
const success = ref(false)

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
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
  } else if (new Date(formData.date_event) < new Date()) {
    errors.date_event = 'La date doit être dans le futur'
  }

  return Object.keys(errors).length === 0
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
  previewImages.value.splice(index, 1)
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  const remainingSlots = 5 - previewImages.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    if (file.type.startsWith('image/')) {
      selectedImages.value.push(file)

      // Créer une preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Préparer les données pour l'API (format backend)
    const eventData = {
      title: formData.title,
      description: formData.description,
      date_event: formData.date_event || null, // Format datetime-local: YYYY-MM-DDTHH:mm
      lieu: formData.lieu || null,
      places_total: formData.places_total ? parseInt(formData.places_total) : null,
      max_seats_per_startup: formData.max_seats_per_startup ? parseInt(formData.max_seats_per_startup) : 1,
      is_featured: formData.is_featured,
    }

    await eventsStore.createEvent(eventData, selectedImages.value)

    success.value = true

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/events')
    }, 2000)
  } catch (error) {
    console.error('Error creating event:', error)
    errors.submit = error.response?.data?.message || "Une erreur est survenue lors de la création de l'événement"
  } finally {
    loading.value = false
  }
}
</script>
