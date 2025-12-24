<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="router.push(`/offers/${route.params.id}`)" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <Icon name="ChevronLeft" :size="24" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Modifier l'offre</h1>
        <p class="text-gray-500 mt-1">Modifiez les informations de votre offre</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="initialLoading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Permission check -->
    <Alert v-else-if="!user || (user.role !== 'partner' && user.role !== 'admin')" type="error">
      Vous n'avez pas les permissions nécessaires pour modifier cette offre.
    </Alert>

    <!-- Offer not found -->
    <Alert v-else-if="!canEdit" type="error">
      Vous n'êtes pas autorisé à modifier cette offre.
    </Alert>

    <template v-else>
      <!-- Success Message -->
      <Alert v-if="success" type="success">
        Offre mise à jour avec succès ! Redirection en cours...
      </Alert>

      <!-- Error Message -->
      <Alert v-if="errors.submit" type="error">
        {{ errors.submit }}
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type d'opportunité"
                v-model="formData.type"
                required
              >
                <option value="offer">Appel à projets</option>
                <option value="event">Événement</option>
              </Select>

              <Select label="Secteur cible" v-model="formData.secteur_id" required>
                <option value="">-- Sélectionner --</option>
                <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                  {{ sector.nom }}
                </option>
              </Select>
            </div>

            <Input
              label="Titre de l'offre"
              placeholder="Ex: Programme d'accélération pour startups tech"
              v-model="formData.title"
              :error="errors.title"
              required
            />

            <Textarea
              label="Description détaillée"
              placeholder="Décrivez votre offre en détail..."
              v-model="formData.description"
              :error="errors.description"
              :rows="6"
              required
            />

            <Input
              label="Date limite de candidature"
              type="date"
              v-model="formData.deadline"
              :min="minDate"
              :error="errors.deadline"
            />
          </div>
        </Card>

        <!-- Additional Details -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="List" class="text-theme" />
            Détails supplémentaires
          </h2>

          <div class="space-y-4">
            <Textarea
              label="Critères d'éligibilité"
              placeholder="Quelles sont les conditions pour postuler ?"
              v-model="formData.requirements"
              :rows="4"
            />

            <Textarea
              label="Avantages offerts"
              placeholder="Qu'offrez-vous aux startups sélectionnées ?"
              v-model="formData.benefits"
              :rows="4"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget / Financement"
                placeholder="Ex: 50 000 € de financement"
                v-model="formData.budget"
              />

              <Input
                label="Public cible"
                placeholder="Ex: Startups tech en phase early-stage"
                v-model="formData.targetAudience"
              />
            </div>

            <Select label="Localisation" v-model="formData.location">
              <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
            </Select>
          </div>
        </Card>

        <!-- Contact Information -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Mail" class="text-theme" />
            Contact
          </h2>

          <div class="space-y-4">
            <Input
              label="Email de contact"
              type="email"
              placeholder="contact@example.com"
              v-model="formData.contactEmail"
              :error="errors.contactEmail"
              required
            />

            <Input
              label="Téléphone de contact (optionnel)"
              type="tel"
              placeholder="+229 XX XX XX XX"
              v-model="formData.contactPhone"
            />
          </div>
        </Card>

        <!-- Event Capacity Management -->
        <Card v-if="formData.type === 'event'" class="border-2 border-blue-200 bg-blue-50/30">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Users" class="text-blue-600" />
            Gestion des places (Événement)
          </h2>

          <div class="space-y-4">
            <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="hasCapacityLimit"
                v-model="formData.hasCapacityLimit"
                class="w-4 h-4 text-theme focus:ring-theme border-gray-300 rounded"
              />
              <label for="hasCapacityLimit" class="flex-1 cursor-pointer">
                <span class="font-semibold text-gray-900">Limiter le nombre de places</span>
                <p class="text-sm text-gray-600">
                  Cochez cette case si l'événement a un nombre de places limité
                </p>
              </label>
            </div>

            <div v-if="formData.hasCapacityLimit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre total de places"
                type="number"
                min="1"
                placeholder="Ex: 100"
                v-model="formData.maxCapacity"
                :required="formData.hasCapacityLimit"
              />

              <Input
                label="Places max par startup"
                type="number"
                min="1"
                placeholder="Ex: 5"
                v-model="formData.maxSeatsPerStartup"
                :required="formData.hasCapacityLimit"
              />
            </div>
          </div>
        </Card>

        <!-- Application Form Configuration -->
        <Card class="border-2 border-indigo-200 bg-indigo-50/30">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-indigo-600" />
            Formulaire de candidature
          </h2>

          <div class="space-y-4">
            <div class="space-y-3">
              <!-- Internal Default Form -->
              <div
                @click="formData.applicationType = 'internal_default'"
                :class="[
                  'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition',
                  formData.applicationType === 'internal_default'
                    ? 'border-theme bg-theme-50'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  type="radio"
                  name="applicationType"
                  value="internal_default"
                  v-model="formData.applicationType"
                  class="mt-1"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">Formulaire par défaut</p>
                  <p class="text-sm text-gray-600">
                    Utiliser le formulaire standard (nom, email, téléphone, CV, lettre de motivation)
                  </p>
                </div>
              </div>

              <!-- Internal Custom Form -->
              <div
                @click="formData.applicationType = 'internal_custom'"
                :class="[
                  'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition',
                  formData.applicationType === 'internal_custom'
                    ? 'border-theme bg-theme-50'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  type="radio"
                  name="applicationType"
                  value="internal_custom"
                  v-model="formData.applicationType"
                  class="mt-1"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">Formulaire personnalisé</p>
                  <p class="text-sm text-gray-600">
                    Créez ou sélectionnez un formulaire sur mesure avec vos propres champs
                  </p>

                  <div
                    v-if="formData.applicationType === 'internal_custom'"
                    class="mt-3 space-y-2"
                  >
                    <Select v-model="formData.formId" @click.stop>
                      <option value="">-- Sélectionner un formulaire --</option>
                      <option v-for="form in availableForms" :key="form.id" :value="form.id">
                        {{ form.name }}
                      </option>
                    </Select>

                    <div class="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        @click.stop="goToFormsPage"
                        class="flex-1"
                      >
                        <Icon name="Plus" :size="16" />
                        Créer un formulaire
                      </Button>
                      <Button
                        v-if="formData.formId"
                        type="button"
                        size="sm"
                        variant="outline"
                        @click.stop="viewSelectedForm"
                      >
                        <Icon name="Eye" :size="16" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- External Form -->
              <div
                @click="formData.applicationType = 'external'"
                :class="[
                  'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition',
                  formData.applicationType === 'external'
                    ? 'border-theme bg-theme-50'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  type="radio"
                  name="applicationType"
                  value="external"
                  v-model="formData.applicationType"
                  class="mt-1"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">Lien externe</p>
                  <p class="text-sm text-gray-600">
                    Rediriger vers un formulaire externe (Google Forms, Typeform, etc.)
                  </p>

                  <div v-if="formData.applicationType === 'external'" class="mt-3">
                    <Input
                      type="url"
                      placeholder="https://forms.google.com/..."
                      v-model="formData.externalFormUrl"
                      @click.stop
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Images -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Image" class="text-theme" />
            Images (optionnel)
          </h2>

          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Les images existantes seront conservées. Vous pouvez en ajouter jusqu'à 5 au total.
            </p>

            <div class="flex flex-wrap gap-3">
              <!-- Existing Images -->
              <div v-for="(image, index) in existingImages" :key="`existing-${index}`" class="relative w-24 h-24">
                <img :src="image" alt="Image existante" class="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  @click="removeExistingImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  <Icon name="X" :size="14" />
                </button>
              </div>

              <!-- New Images Preview -->
              <div v-for="(preview, index) in previewImages" :key="`new-${index}`" class="relative w-24 h-24">
                <img :src="preview" alt="Preview" class="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  @click="removeNewImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  <Icon name="X" :size="14" />
                </button>
              </div>

              <!-- Add Images Button -->
              <label
                v-if="existingImages.length + previewImages.length < 5"
                class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-theme transition"
              >
                <Icon name="Plus" :size="24" class="text-gray-400" />
                <span class="text-xs text-gray-500 mt-1">Ajouter</span>
                <input type="file" accept="image/*" multiple @change="handleImageSelect" class="hidden" />
              </label>
            </div>
          </div>
        </Card>

        <!-- Actions -->
        <div class="flex gap-4">
          <Button type="submit" :disabled="loading" size="lg" class="flex-1">
            <LoadingSpinner v-if="loading" size="sm" />
            <template v-else>
              <Icon name="Save" :size="18" />
              Enregistrer les modifications
            </template>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            @click="router.push(`/offers/${route.params.id}`)"
          >
            <Icon name="X" :size="18" />
            Annuler
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOffersStore } from '@/stores/offersStore'
import offersApi from '@/services/offers'
import formApi from '@/services/form'
import api from '@/services/api'
import { Card, Button, Input, Textarea, Select, Alert, Icon, LoadingSpinner } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const offersStore = useOffersStore()

const initialLoading = ref(true)
const loading = ref(false)
const success = ref(false)
const canEdit = ref(false)

const sectors = ref([])
const availableForms = ref([])
const locations = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Autre']

const existingImages = ref([])
const selectedImages = ref([])
const previewImages = ref([])
const imagesToDelete = ref([])

const formData = reactive({
  title: '',
  description: '',
  type: 'offer',
  secteur_id: '',
  deadline: '',
  requirements: '',
  benefits: '',
  contactEmail: '',
  contactPhone: '',
  location: 'Cotonou',
  budget: '',
  targetAudience: '',
  hasCapacityLimit: false,
  maxCapacity: '',
  maxSeatsPerStartup: '',
  applicationType: 'internal_default',
  formId: '',
  externalFormUrl: '',
})

const errors = reactive({})

const minDate = computed(() => new Date().toISOString().split('T')[0])

onMounted(async () => {
  try {
    // Charger les secteurs
    const { data } = await api.get('/secteurs')
    sectors.value = data.secteurs || data || []

    // Charger les formulaires disponibles
    const formsResponse = await formApi.list()
    availableForms.value = formsResponse.data.data || formsResponse.data || []

    // Charger l'offre existante
    const offerResponse = await offersStore.get(route.params.id)
    const offer = offerResponse.data || offerResponse

    // Vérifier les permissions
    if (user.value?.role === 'admin') {
      canEdit.value = true
    } else if (user.value?.role === 'partner') {
      canEdit.value = offer.created_by === user.value.id || offer.createdBy === user.value.id
    }

    if (!canEdit.value) {
      initialLoading.value = false
      return
    }

    // Remplir le formulaire avec les données existantes
    formData.title = offer.title || ''
    formData.description = offer.description || ''
    formData.type = offer.type || 'offer'
    formData.secteur_id = offer.secteur_id || offer.secteurId || ''
    formData.deadline = offer.deadline ? new Date(offer.deadline).toISOString().split('T')[0] : ''
    formData.requirements = offer.requirements || ''
    formData.benefits = offer.benefits || ''
    formData.contactEmail = offer.contact_email || offer.contactEmail || ''
    formData.contactPhone = offer.contact_phone || offer.contactPhone || ''
    formData.location = offer.location || 'Cotonou'
    formData.budget = offer.budget || ''
    formData.targetAudience = offer.target_audience || offer.targetAudience || ''
    formData.hasCapacityLimit = offer.has_capacity_limit || offer.hasCapacityLimit || false
    formData.maxCapacity = offer.max_capacity || offer.maxCapacity || ''
    formData.maxSeatsPerStartup = offer.max_seats_per_startup || offer.maxSeatsPerStartup || ''

    // Configuration du formulaire
    if (offer.external_form_url || offer.externalFormUrl) {
      formData.applicationType = 'external'
      formData.externalFormUrl = offer.external_form_url || offer.externalFormUrl
    } else if (offer.form_id || offer.formId) {
      formData.applicationType = 'internal_custom'
      formData.formId = offer.form_id || offer.formId
    } else {
      formData.applicationType = 'internal_default'
    }

    // Charger les images existantes
    existingImages.value = offer.images || []
  } catch (err) {
    console.error('Error loading offer:', err)
    errors.submit = "Erreur lors du chargement de l'offre"
  } finally {
    initialLoading.value = false
  }
})

const goToFormsPage = () => {
  router.push('/partner/forms')
}

const viewSelectedForm = () => {
  if (formData.formId) {
    window.open(`/partner/forms/${formData.formId}`, '_blank')
  }
}

const removeExistingImage = (index) => {
  const imageUrl = existingImages.value[index]
  imagesToDelete.value.push(imageUrl)
  existingImages.value.splice(index, 1)
}

const removeNewImage = (index) => {
  selectedImages.value.splice(index, 1)
  previewImages.value.splice(index, 1)
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  const totalImages = existingImages.value.length + previewImages.value.length
  const remainingSlots = 5 - totalImages
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    if (file.type.startsWith('image/')) {
      selectedImages.value.push(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })

  event.target.value = ''
}

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

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.submit = ''

  try {
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

    // Ajouter les informations de formulaire
    if (formData.applicationType === 'internal_custom' && formData.formId) {
      offerPayload.form_id = formData.formId
      offerPayload.external_form_url = null
    } else if (formData.applicationType === 'external' && formData.externalFormUrl) {
      offerPayload.external_form_url = formData.externalFormUrl
      offerPayload.form_id = null
    } else {
      offerPayload.form_id = null
      offerPayload.external_form_url = null
    }

    // Si des changements d'images, utiliser FormData avec _method PUT
    if (selectedImages.value.length > 0 || imagesToDelete.value.length > 0) {
      const formDataObj = new FormData()
      formDataObj.append('_method', 'PUT')

      Object.entries(offerPayload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, value)
        }
      })

      // Ajouter les nouvelles images
      selectedImages.value.forEach((file, index) => {
        formDataObj.append(`images[${index}]`, file)
      })

      // Ajouter les images à supprimer
      imagesToDelete.value.forEach((url, index) => {
        formDataObj.append(`delete_images[${index}]`, url)
      })

      await offersApi.createWithImages(formDataObj)
    } else {
      await offersApi.update(route.params.id, offerPayload)
    }

    success.value = true

    setTimeout(() => {
      router.push(`/offers/${route.params.id}`)
    }, 2000)
  } catch (err) {
    console.error('Error updating offer:', err)

    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors
      Object.keys(validationErrors).forEach((field) => {
        errors[field] = validationErrors[field][0]
      })
      errors.submit = 'Veuillez corriger les erreurs dans le formulaire'
    } else {
      errors.submit =
        err.response?.data?.message || "Une erreur est survenue lors de la mise à jour de l'offre"
    }
  } finally {
    loading.value = false
  }
}
</script>
