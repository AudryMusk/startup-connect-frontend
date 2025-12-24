<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div class="max-w-7xl mx-auto px-3 sm:px-4">
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Mes formulaires</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Gérez vos formulaires de candidature
              personnalisés</p>
          </div>
          <button @click="createNewForm"
            class="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Nouveau formulaire</span>
            <span class="sm:hidden">Nouveau</span>
          </button>
        </div>
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

      <!-- Forms List -->
      <div v-if="!loading" class="space-y-4 sm:space-y-6">
        <!-- Default Form -->
        <div v-if="defaultForm"
          class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 sm:p-6 border-2 border-blue-200">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-base sm:text-xl font-semibold text-gray-900">{{ defaultForm.name }}</h3>
                <span class="px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-500 text-white rounded">Par défaut</span>
              </div>
              <p class="text-sm text-gray-600 mb-2 sm:mb-3">{{ defaultForm.description }}</p>
              <div class="text-xs sm:text-sm text-gray-500">
                {{ defaultForm.fields?.length || 0 }} champs
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="viewForm(defaultForm.id)"
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm">
                Voir
              </button>
              <button @click="duplicateForm(defaultForm.id)"
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                Dupliquer
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Forms -->
        <div v-if="customForms.length > 0" class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="form in customForms" :key="form.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6">
            <div class="flex justify-between items-start mb-3 sm:mb-4">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{{ form.name }}</h3>
              <div class="relative">
                <button @click="toggleMenu(form.id)" class="p-1.5 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <!-- Dropdown Menu -->
                <div v-if="activeMenu === form.id"
                  class="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button @click="editForm(form.id)"
                    class="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 flex items-center text-sm">
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  <button @click="duplicateForm(form.id)"
                    class="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 flex items-center text-sm">
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Dupliquer
                  </button>
                  <button @click="deleteForm(form.id)"
                    class="w-full text-left px-3 sm:px-4 py-2 hover:bg-red-50 text-red-600 flex items-center text-sm">
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              {{ form.description || 'Aucune description' }}
            </p>

            <div class="flex items-center justify-between text-xs sm:text-sm text-gray-500">
              <div class="flex items-center">
                <span>{{ form.fields?.length || 0 }} champs</span>
              </div>
              <button @click="viewForm(form.id)" class="text-blue-600 hover:text-blue-800 font-medium">
                Voir →
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!defaultForm && customForms.length === 0" class="text-center py-12 sm:py-20">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg sm:text-xl font-medium text-gray-900 mb-2">Aucun formulaire</h3>
          <p class="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Créez votre premier formulaire de candidature
            personnalisé</p>
          <button @click="createNewForm"
            class="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base">
            Créer un formulaire
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import formApi from '@/services/form'

const router = useRouter()

const loading = ref(false)
const error = ref(null)
const forms = ref([])
const activeMenu = ref(null)

const defaultForm = computed(() => {
  return forms.value.find(f => f.name === 'Formulaire de candidature standard')
})

const customForms = computed(() => {
  return forms.value.filter(f => f.name !== 'Formulaire de candidature standard')
})

const loadForms = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await formApi.list()
    forms.value = response.data.data || response.data || []
  } catch (err) {
    console.error('Error loading forms:', err)
    error.value = 'Erreur lors du chargement des formulaires'
  } finally {
    loading.value = false
  }
}

const createNewForm = () => {
  router.push('/partner/forms/create')
}

const editForm = (id) => {
  activeMenu.value = null
  router.push(`/partner/forms/${id}/edit`)
}

const viewForm = (id) => {
  activeMenu.value = null
  router.push(`/partner/forms/${id}`)
}

const duplicateForm = async (id) => {
  activeMenu.value = null

  const name = prompt('Nom du nouveau formulaire :')
  if (!name) return

  try {
    await formApi.duplicate(id, { name })
    await loadForms()
  } catch (err) {
    console.error('Error duplicating form:', err)
    alert('Erreur lors de la duplication du formulaire')
  }
}

const deleteForm = async (id) => {
  activeMenu.value = null

  if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return

  try {
    await formApi.delete(id)
    await loadForms()
  } catch (err) {
    console.error('Error deleting form:', err)
    alert('Erreur lors de la suppression du formulaire')
  }
}

const toggleMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

// Close menu when clicking outside
onMounted(() => {
  loadForms()

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeMenu.value = null
    }
  })
})
</script>
