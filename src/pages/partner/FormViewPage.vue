<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Form Display -->
      <div v-if="!loading && form" class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <button
              @click="goBack"
              class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>

            <h1 class="text-3xl font-bold text-gray-900">{{ form.name }}</h1>
            <p v-if="form.description" class="mt-2 text-gray-600">{{ form.description }}</p>

            <div class="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>{{ form.fields?.length || 0 }} champs</span>
              <span v-if="form.creator">Créé par {{ form.creator.name }}</span>
              <span v-if="route.params.id === 'default'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                Formulaire par défaut
              </span>
            </div>
          </div>

          <button
            v-if="route.params.id !== 'default'"
            @click="editForm"
            class="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Modifier
          </button>
        </div>

        <!-- Form Preview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Aperçu du formulaire</h2>

          <div class="space-y-6">
            <div
              v-for="(field, index) in form.fields"
              :key="field.id"
              class="border-b border-gray-200 pb-6 last:border-0"
            >
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ index + 1 }}. {{ field.label }}
                <span v-if="field.is_required" class="text-red-500">*</span>
              </label>

              <!-- Text Input -->
              <input
                v-if="field.field_type === 'text'"
                type="text"
                :placeholder="field.placeholder"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <!-- Email Input -->
              <input
                v-else-if="field.field_type === 'email'"
                type="email"
                :placeholder="field.placeholder"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <!-- Phone Input -->
              <input
                v-else-if="field.field_type === 'phone'"
                type="tel"
                :placeholder="field.placeholder"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <!-- Number Input -->
              <input
                v-else-if="field.field_type === 'number'"
                type="number"
                :placeholder="field.placeholder"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <!-- Date Input -->
              <input
                v-else-if="field.field_type === 'date'"
                type="date"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="field.field_type === 'textarea'"
                :placeholder="field.placeholder"
                rows="4"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              ></textarea>

              <!-- File Upload -->
              <div v-else-if="field.field_type === 'file'" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm text-gray-500">{{ field.placeholder || 'Téléchargez un fichier' }}</p>
              </div>

              <!-- Select -->
              <select
                v-else-if="field.field_type === 'select'"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              >
                <option value="">{{ field.placeholder || 'Sélectionnez une option' }}</option>
                <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                  {{ option }}
                </option>
              </select>

              <!-- Radio -->
              <div v-else-if="field.field_type === 'radio'" class="space-y-2">
                <div v-for="(option, idx) in field.options" :key="idx" class="flex items-center">
                  <input
                    type="radio"
                    :name="`field_${field.id}`"
                    :value="option"
                    disabled
                    class="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <label class="ml-2 text-sm text-gray-700">{{ option }}</label>
                </div>
              </div>

              <!-- Checkbox -->
              <div v-else-if="field.field_type === 'checkbox'" class="space-y-2">
                <div v-for="(option, idx) in field.options" :key="idx" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="option"
                    disabled
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label class="ml-2 text-sm text-gray-700">{{ option }}</label>
                </div>
              </div>

              <!-- Field Info -->
              <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span class="px-2 py-1 bg-gray-100 rounded">{{ getFieldTypeLabel(field.field_type) }}</span>
                <span v-if="field.is_required" class="text-red-500">Obligatoire</span>
                <span v-else class="text-gray-400">Optionnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import formApi from '@/services/form'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(null)
const form = ref(null)

const fieldTypes = {
  text: 'Texte court',
  textarea: 'Texte long',
  email: 'Email',
  phone: 'Téléphone',
  number: 'Nombre',
  date: 'Date',
  file: 'Fichier',
  select: 'Liste déroulante',
  radio: 'Boutons radio',
  checkbox: 'Cases à cocher',
}

const getFieldTypeLabel = (type) => {
  return fieldTypes[type] || type
}

const loadForm = async () => {
  loading.value = true
  error.value = null

  try {
    const formId = route.params.id
    let response

    // Si c'est "default", utiliser l'endpoint getDefault
    if (formId === 'default') {
      response = await formApi.getDefault()
    } else {
      response = await formApi.get(formId)
    }

    form.value = response.data.data || response.data
  } catch (err) {
    console.error('Error loading form:', err)
    error.value = 'Erreur lors du chargement du formulaire'
  } finally {
    loading.value = false
  }
}

const editForm = () => {
  // Ne pas permettre l'édition du formulaire par défaut
  if (route.params.id === 'default') {
    alert('Le formulaire par défaut ne peut pas être modifié. Créez un formulaire personnalisé.')
    return
  }
  router.push(`/partner/forms/${route.params.id}/edit`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadForm()
})
</script>
