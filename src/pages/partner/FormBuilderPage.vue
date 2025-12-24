<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div class="max-w-5xl mx-auto px-3 sm:px-4">
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>

        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {{ isEditMode ? 'Modifier le formulaire' : 'Créer un formulaire de candidature' }}
        </h1>
        <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Créez un formulaire personnalisé pour recevoir les candidatures de vos offres
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error Message -->
      <div v-if="error"
        class="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success"
        class="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
        Formulaire {{ isEditMode ? 'modifié' : 'créé' }} avec succès !
      </div>

      <!-- Form Builder -->
      <div v-if="!loading" class="space-y-4 sm:space-y-6">
        <!-- Form Info -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Informations du formulaire</h2>

          <div class="space-y-3 sm:space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Nom du formulaire *
              </label>
              <input v-model="formData.name" type="text"
                class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Formulaire d'appel à projets" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Description
              </label>
              <textarea v-model="formData.description" rows="2"
                class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez l'objectif de ce formulaire..."></textarea>
            </div>
          </div>
        </div>

        <!-- Fields -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 class="text-base sm:text-xl font-semibold">Champs du formulaire</h2>
            <button @click="showFieldTypeModal = true"
              class="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Ajouter un champ</span>
              <span class="sm:hidden">Ajouter</span>
            </button>
          </div>

          <!-- Fields List -->
          <div v-if="formData.fields.length > 0" class="space-y-3 sm:space-y-4">
            <div v-for="(field, index) in formData.fields" :key="field.id"
              class="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
              <div class="flex justify-between items-start mb-2 sm:mb-3">
                <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span class="text-xs sm:text-sm font-medium text-gray-500">#{{ index + 1 }}</span>
                  <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {{ getFieldTypeLabel(field.field_type) }}
                  </span>
                </div>
                <div class="flex gap-1">
                  <button v-if="index > 0" @click="moveFieldUp(index)" class="p-1 text-gray-400 hover:text-gray-600"
                    title="Monter">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button v-if="index < formData.fields.length - 1" @click="moveFieldDown(index)"
                    class="p-1 text-gray-400 hover:text-gray-600" title="Descendre">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button @click="editField(index)" class="p-1 text-blue-500 hover:text-blue-700" title="Modifier">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="removeField(index)" class="p-1 text-red-500 hover:text-red-700" title="Supprimer">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <div class="font-medium text-sm sm:text-base text-gray-900">
                  {{ field.label }}
                  <span v-if="field.is_required" class="text-red-500">*</span>
                </div>
                <div v-if="field.placeholder" class="text-xs sm:text-sm text-gray-500">
                  Placeholder: {{ field.placeholder }}
                </div>
                <div v-if="field.options && field.options.length" class="text-xs sm:text-sm text-gray-500">
                  Options: {{ field.options.join(', ') }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 sm:py-12 text-gray-500">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm sm:text-base">Aucun champ ajouté</p>
            <p class="text-xs sm:text-sm">Cliquez sur "Ajouter un champ" pour commencer</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pb-4">
          <button @click="goBack"
            class="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base">
            Annuler
          </button>
          <button @click="saveForm" :disabled="saving || !formData.name || formData.fields.length === 0"
            class="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
            {{ saving ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }} le formulaire
          </button>
        </div>
      </div>

      <!-- Field Type Selection Modal -->
      <div v-if="showFieldTypeModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
        <div class="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg sm:text-xl font-semibold">Choisir un type de champ</h3>
            <button @click="showFieldTypeModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <button v-for="type in fieldTypes" :key="type.value" @click="addField(type.value)"
              class="p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div class="font-medium text-sm sm:text-base text-gray-900">{{ type.label }}</div>
              <div class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{{ type.description }}</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Field Edit Modal -->
      <div v-if="editingField !== null"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
        <div class="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-3 sm:mb-4">
            <h3 class="text-lg sm:text-xl font-semibold">Configurer le champ</h3>
            <button @click="closeFieldEditor" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3 sm:space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Label du champ *</label>
              <input v-model="currentField.label" type="text"
                class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Nom complet" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Placeholder</label>
              <input v-model="currentField.placeholder" type="text"
                class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Entrez votre nom" />
            </div>

            <div class="flex items-center">
              <input v-model="currentField.is_required" type="checkbox" id="required"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label for="required" class="ml-2 text-sm text-gray-700">
                Champ obligatoire
              </label>
            </div>

            <!-- Options pour select, radio, checkbox -->
            <div v-if="['select', 'radio', 'checkbox'].includes(currentField.field_type)">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Options</label>
              <div class="space-y-2">
                <div v-for="(option, idx) in currentField.options" :key="idx" class="flex items-center gap-2">
                  <input v-model="currentField.options[idx]" type="text"
                    class="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Option" />
                  <button @click="removeOption(idx)" class="p-1.5 sm:p-2 text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button @click="addOption"
                  class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  + Ajouter une option
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button @click="closeFieldEditor"
              class="px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button @click="saveFieldEdit" :disabled="!currentField.label"
              class="px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import formApi from '@/services/form'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.id)
const formId = computed(() => route.params.id)

const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const success = ref(false)

const showFieldTypeModal = ref(false)
const editingField = ref(null)
const currentField = ref({})

const formData = ref({
  name: '',
  description: '',
  fields: []
})

const fieldTypes = [
  { value: 'text', label: 'Texte court', description: 'Une ligne de texte' },
  { value: 'textarea', label: 'Texte long', description: 'Plusieurs lignes' },
  { value: 'email', label: 'Email', description: 'Adresse email' },
  { value: 'phone', label: 'Téléphone', description: 'Numéro de téléphone' },
  { value: 'number', label: 'Nombre', description: 'Valeur numérique' },
  { value: 'date', label: 'Date', description: 'Sélecteur de date' },
  { value: 'file', label: 'Fichier', description: 'Upload de fichier' },
  { value: 'select', label: 'Liste déroulante', description: 'Choix unique' },
  { value: 'radio', label: 'Boutons radio', description: 'Choix unique' },
  { value: 'checkbox', label: 'Cases à cocher', description: 'Choix multiple' },
]

const getFieldTypeLabel = (type) => {
  return fieldTypes.find(t => t.value === type)?.label || type
}

const addField = (type) => {
  const newField = {
    id: Date.now(),
    field_type: type,
    label: '',
    placeholder: '',
    is_required: false,
    options: ['select', 'radio', 'checkbox'].includes(type) ? [''] : null,
    order: formData.value.fields.length + 1
  }
  formData.value.fields.push(newField)
  editingField.value = formData.value.fields.length - 1
  currentField.value = { ...newField }
  showFieldTypeModal.value = false
}

const editField = (index) => {
  editingField.value = index
  currentField.value = { ...formData.value.fields[index] }
  if (!currentField.value.options) {
    currentField.value.options = ['select', 'radio', 'checkbox'].includes(currentField.value.field_type) ? [''] : null
  }
}

const saveFieldEdit = () => {
  if (!currentField.value.label) return

  // Nettoyer les options vides
  if (currentField.value.options) {
    currentField.value.options = currentField.value.options.filter(opt => opt.trim() !== '')
  }

  formData.value.fields[editingField.value] = { ...currentField.value }
  closeFieldEditor()
}

const closeFieldEditor = () => {
  editingField.value = null
  currentField.value = {}
}

const removeField = (index) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
    formData.value.fields.splice(index, 1)
    // Réordonner
    formData.value.fields.forEach((field, idx) => {
      field.order = idx + 1
    })
  }
}

const moveFieldUp = (index) => {
  if (index > 0) {
    const temp = formData.value.fields[index]
    formData.value.fields[index] = formData.value.fields[index - 1]
    formData.value.fields[index - 1] = temp
    // Réordonner
    formData.value.fields.forEach((field, idx) => {
      field.order = idx + 1
    })
  }
}

const moveFieldDown = (index) => {
  if (index < formData.value.fields.length - 1) {
    const temp = formData.value.fields[index]
    formData.value.fields[index] = formData.value.fields[index + 1]
    formData.value.fields[index + 1] = temp
    // Réordonner
    formData.value.fields.forEach((field, idx) => {
      field.order = idx + 1
    })
  }
}

const addOption = () => {
  if (!currentField.value.options) {
    currentField.value.options = []
  }
  currentField.value.options.push('')
}

const removeOption = (index) => {
  currentField.value.options.splice(index, 1)
}

const saveForm = async () => {
  if (!formData.value.name || formData.value.fields.length === 0) {
    error.value = 'Veuillez remplir le nom et ajouter au moins un champ'
    return
  }

  saving.value = true
  error.value = null

  try {
    const payload = {
      name: formData.value.name,
      description: formData.value.description || null
    }

    let savedForm
    if (isEditMode.value) {
      const response = await formApi.update(formId.value, payload)
      savedForm = response.data.form || response.data.data
    } else {
      const response = await formApi.create(payload)
      savedForm = response.data.form || response.data.data
    }

    // Maintenant sauvegarder les champs
    if (savedForm && savedForm.id) {
      // Si en mode édition, supprimer les anciens champs et recréer
      // Pour simplifier, on va juste créer les nouveaux
      for (const field of formData.value.fields) {
        const fieldPayload = {
          label: field.label,
          field_type: field.field_type,
          placeholder: field.placeholder || null,
          is_required: field.is_required || false,
          options: field.options || null,
          order: field.order
        }

        if (field.id && typeof field.id === 'number' && field.id > 1000000) {
          // Nouveau champ
          await formApi.addField(savedForm.id, fieldPayload)
        } else if (field.id) {
          // Champ existant - mise à jour
          await formApi.updateField(savedForm.id, field.id, fieldPayload)
        }
      }
    }

    success.value = true
    setTimeout(() => {
      router.push('/partner/forms')
    }, 2000)
  } catch (err) {
    console.error('Error saving form:', err)
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement du formulaire'
  } finally {
    saving.value = false
  }
}

const loadForm = async () => {
  if (!formId.value) return

  loading.value = true
  try {
    const response = await formApi.get(formId.value)
    const form = response.data.data || response.data

    formData.value = {
      name: form.name,
      description: form.description || '',
      fields: form.fields || []
    }
  } catch (err) {
    console.error('Error loading form:', err)
    error.value = 'Erreur lors du chargement du formulaire'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  if (isEditMode.value) {
    loadForm()
  }
})
</script>
