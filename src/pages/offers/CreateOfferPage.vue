<template>
  <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
    <!-- Header -->
    <div class="flex items-center gap-3 sm:gap-4">
      <button @click="router.push('/offers')" class="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition">
        <Icon name="ChevronLeft" :size="20" class="sm:hidden" />
        <Icon name="ChevronLeft" :size="24" class="hidden sm:inline" />
      </button>
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Publier une offre</h1>
        <p class="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base">Créez une nouvelle offre pour les
          startups</p>
      </div>
    </div>

    <!-- Permission check -->
    <Alert v-if="!user || (user.role !== 'partenaire' && user.role !== 'admin')" type="error">
      Vous n'avez pas les permissions nécessaires pour publier une offre.
    </Alert>

    <template v-else>
      <!-- Success Message -->
      <Alert v-if="success" type="success">
        offre créée avec succès ! Redirection en cours...
      </Alert>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
        <!-- Basic Information -->
        <Card>
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-theme" :size="18" />
            Informations de base
          </h2>

          <div class="space-y-3 sm:space-y-4">
            <div class="grid grid-cols-1 gap-3 sm:gap-4">
              <Select label="Secteur cible" v-model="formData.secteur_id" required>
                <option value="">-- Sélectionner --</option>
                <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                  {{ sector.nom }}
                </option>
              </Select>
            </div>

            <Input label="Titre de l'offre" placeholder="Ex: Programme d'accélération Tech 2025"
              v-model="formData.title" :error="errors.title" required />

            <Textarea label="Description détaillée" placeholder="Décrivez l'offre, les objectifs, le contexte..."
              v-model="formData.description" :error="errors.description" :rows="5" required />

            <Textarea label="Critères d'éligibilité" placeholder="Quels sont les critères pour postuler ?"
              v-model="formData.requirements" :rows="3" />

            <Textarea label="Avantages offerts" placeholder="Financement, mentorat, formation, etc."
              v-model="formData.benefits" :rows="3" />
          </div>
        </Card>

        <!-- Details -->
        <Card>
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon name="Calendar" class="text-theme" :size="18" />
            Détails pratiques
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input label="Date limite de candidature" type="date" v-model="formData.deadline" :error="errors.deadline"
              :min="minDate" />

            <Select label="Localisation" v-model="formData.location">
              <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
            </Select>

            <Input label="Budget / Montant (optionnel)" placeholder="Ex: 10 000 000 FCFA" v-model="formData.budget" />

            <Input label="Public cible" placeholder="Ex: Startups en phase seed" v-model="formData.targetAudience" />
          </div>

          <!-- Image upload section -->
          <div class="mt-4 sm:mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Images (optionnel)</label>
            <label :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors border-2 border-dashed',
              previewImages.length >= 5
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200'
                : 'bg-neutral-50 text-neutral-600 hover:bg-theme-100 hover:text-theme-700 hover:border-theme-300 border-neutral-300',
            ]">
              <Icon name="Image" :size="18" />
              <span class="text-sm font-medium">Ajouter des images</span>
              <input type="file" accept="image/*" multiple @change="handleImageSelect" class="hidden"
                :disabled="previewImages.length >= 5" />
            </label>
            <p class="text-xs text-neutral-500 mt-1">{{ previewImages.length }}/5 images</p>

            <div v-if="previewImages.length > 0" class="flex flex-wrap gap-2 mt-3">
              <div v-for="(img, index) in previewImages" :key="index" class="relative group">
                <img :src="img" alt="Preview"
                  class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-neutral-200" />
                <button type="button" @click="removeImage(index)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Icon name="X" :size="14" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <!-- Contact Information -->
        <Card>
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon name="Mail" class="text-theme" :size="18" />
            Informations de contact
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input label="Email de contact" type="email" placeholder="contact@exemple.com"
              v-model="formData.contactEmail" :error="errors.contactEmail" required />

            <Input label="Téléphone (optionnel)" type="tel" placeholder="+229 XX XX XX XX XX"
              v-model="formData.contactPhone" />
          </div>
        </Card>

        <!-- Application Form Configuration -->
        <Card class="border-2 border-purple-200 bg-purple-50/30">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-purple-600" :size="18" />
            Formulaire de candidature
          </h2>

          <div class="space-y-3 sm:space-y-4">
            <Select label="Type de candidature" v-model="formData.applicationType">
              <option value="internal_default">Formulaire par défaut (recommandé)</option>
              <option value="internal_custom">Formulaire personnalisé</option>
              <option value="external">Lien externe</option>
            </Select>

            <!-- Default Form Info -->
            <div v-if="formData.applicationType === 'internal_default'"
              class="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
              <div class="flex items-start gap-2 sm:gap-3">
                <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Formulaire standard</h4>
                  <p class="text-xs sm:text-sm text-gray-600 mb-2">
                    Les candidats rempliront un formulaire avec les champs essentiels : nom, email, téléphone, pitch,
                    expérience, motivation, CV, etc.
                  </p>
                  <button type="button" @click="viewDefaultForm"
                    class="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium">
                    Voir le formulaire →
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Form Selection -->
            <div v-if="formData.applicationType === 'internal_custom'" class="space-y-2 sm:space-y-3">
              <Select label="Choisir un formulaire" v-model="formData.formId"
                :required="formData.applicationType === 'internal_custom'">
                <option value="">-- Sélectionner un formulaire --</option>
                <option v-for="form in availableForms" :key="form.id" :value="form.id">
                  {{ form.name }} ({{ form.fields?.length || 0 }} champs)
                </option>
              </Select>

              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button type="button" @click="goToFormsPage"
                  class="flex-1 px-3 sm:px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm">
                  Créer un nouveau formulaire
                </button>
                <button v-if="formData.formId" type="button" @click="viewSelectedForm"
                  class="px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                  Aperçu
                </button>
              </div>
            </div>

            <!-- External Link -->
            <div v-if="formData.applicationType === 'external'" class="space-y-2 sm:space-y-3">
              <Input label="Lien externe de candidature" type="url" placeholder="https://exemple.com/postuler"
                v-model="formData.externalFormUrl" :required="formData.applicationType === 'external'" />
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
                <p class="flex text-xs sm:text-sm text-amber-800 items-center gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Les candidats seront redirigés vers votre site externe pour postuler
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Error Message -->
        <Alert v-if="errors.submit" type="error">
          {{ errors.submit }}
        </Alert>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pb-4">
          <Button type="button" variant="outline" @click="router.push('/offers')" :disabled="loading"
            class="w-full sm:w-auto">
            Annuler
          </Button>
          <Button type="submit" :disabled="loading" size="lg" class="w-full sm:w-auto">
            {{ loading ? 'Publication...' : "Publier l'offre" }}
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useOffersStore } from '@/stores/offersStore.js'
import offersApi from '@/services/offers.js'
import formApi from '@/services/form.js'
import api from '@/services/api'
import { Card, Button, Input, Select, Textarea, Alert, Icon } from '../../components/ui'

const router = useRouter()
const { user } = useAuth()
const offersStore = useOffersStore()

const selectedImages = ref([])
const previewImages = ref([])
const availableForms = ref([])

const formData = reactive({
  title: '',
  description: '',
  type: 'offer',
  secteur_id: '',
  image: null,
  deadline: '',
  requirements: '',
  benefits: '',
  contactEmail: user.value?.email || '',
  contactPhone: '',
  location: 'Cotonou',
  budget: '',
  targetAudience: '',
  hasCapacityLimit: false,
  maxCapacity: '',
  maxSeatsPerStartup: '',
  applicationType: 'internal_default', // internal_default, internal_custom, external
  formId: '',
  externalFormUrl: '',
})

const errors = reactive({})
const loading = ref(false)
const success = ref(false)

const sectors = ref([])
const locations = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Autre']

onMounted(async () => {
  try {
    const { data } = await api.get('/secteurs')
    sectors.value = data.secteurs || data || []

    // Charger les formulaires disponibles
    const formsResponse = await formApi.list()
    availableForms.value = formsResponse.data.data || formsResponse.data || []
  } catch (e) {
    console.error('Erreur chargement secteurs/formulaires:', e)
  }
})

const viewDefaultForm = () => {
  window.open('/partner/forms/default', '_blank')
}

const goToFormsPage = () => {
  router.push('/partner/forms')
}

const viewSelectedForm = () => {
  if (formData.formId) {
    window.open(`/partner/forms/${formData.formId}`, '_blank')
  }
}

const minDate = computed(() => new Date().toISOString().split('T')[0])

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

  if (formData.deadline && new Date(formData.deadline) < new Date()) {
    errors.deadline = 'La date limite doit être dans le futur'
  }

  if (!formData.contactEmail.trim()) {
    errors.contactEmail = "L'email de contact est requis"
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

  // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
  event.target.value = ''
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.submit = ''

  try {
    // Préparer les données pour l'API
    const offerPayload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      secteur_id: formData.secteur_id,
      deadline: formData.deadline || null,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone || null,
      location: formData.location || null,
      budget: formData.budget || null,
      target_audience: formData.targetAudience || null,
      has_capacity_limit: formData.hasCapacityLimit || false,
      max_capacity: formData.hasCapacityLimit ? formData.maxCapacity : null,
      max_seats_per_startup: formData.hasCapacityLimit ? formData.maxSeatsPerStartup : null,
    }

    // Ajouter les informations de formulaire selon le type
    if (formData.applicationType === 'internal_custom' && formData.formId) {
      offerPayload.form_id = formData.formId
    } else if (formData.applicationType === 'external' && formData.externalFormUrl) {
      offerPayload.external_link = formData.externalFormUrl
    }
    // Si internal_default, ne rien ajouter (le backend utilisera le formulaire par défaut)

    // Si des images sont sélectionnées, utiliser FormData
    if (selectedImages.value.length > 0) {
      const formDataObj = new FormData()

      // Ajouter tous les champs avec conversion appropriée pour FormData
      Object.entries(offerPayload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Convertir les booléens en "0" ou "1" pour Laravel
          if (typeof value === 'boolean') {
            formDataObj.append(key, value ? '1' : '0')
          } else {
            formDataObj.append(key, value)
          }
        }
      })

      // Ajouter les images - Laravel attend images[] pas images[0], images[1]...
      selectedImages.value.forEach((file) => {
        formDataObj.append('images[]', file)
      })

      await offersApi.createWithImages(formDataObj)
    } else {
      await offersStore.create(offerPayload)
    }

    success.value = true

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/offers')
    }, 2000)
  } catch (err) {
    console.error('Error creating offer:', err)

    // Afficher les erreurs de validation
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors
      console.error('Validation errors:', validationErrors)

      // Mapper les erreurs aux champs du formulaire
      Object.keys(validationErrors).forEach((field) => {
        errors[field] = validationErrors[field][0]
      })

      errors.submit = 'Veuillez corriger les erreurs dans le formulaire'
    } else {
      errors.submit =
        err.response?.data?.message || "Une erreur est survenue lors de la création de l'offre"
    }
  } finally {
    loading.value = false
  }
}
</script>
