<template>
  <div class="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-theme-light to-white">
    <div class="w-full max-w-2xl">
      <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        <!-- Logo -->
        <div class="text-center mb-6 sm:mb-8">
          <div
            class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-theme rounded-full mb-3 sm:mb-4">
            <span class="text-xl sm:text-2xl font-bold text-white">SC</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Créer un compte</h1>
          <p class="text-gray-500 text-xs sm:text-sm mt-1.5 sm:mt-2">Étape {{ step }} sur 2</p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6 sm:mb-8">
          <div class="flex items-center justify-between mb-2">
            <span :class="[
              'text-[10px] sm:text-xs font-semibold',
              step >= 1 ? 'text-theme' : 'text-gray-400',
            ]">
              Infos de base
            </span>
            <span :class="[
              'text-[10px] sm:text-xs font-semibold',
              step >= 2 ? 'text-theme' : 'text-gray-400',
            ]">
              Profil pro
            </span>
          </div>
          <div class="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-theme transition-all duration-300" :style="{ width: `${(step / 2) * 100}%` }" />
          </div>
        </div>

        <!-- Error Alert -->
        <Alert v-if="error" type="error" class="mb-3 sm:mb-4">
          {{ error }}
        </Alert>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
          <!-- Step 1 -->
          <template v-if="step === 1">
            <Input label="Nom complet" placeholder="Jean Dupont" v-model="form.displayName" required />

            <Input label="Email" type="email" placeholder="votre@email.com" v-model="form.email" required />

            <Input label="Mot de passe" type="password" placeholder="Minimum 8 caractères" v-model="form.password"
              required />

            <Input label="Confirmer le mot de passe" type="password" placeholder="Retapez votre mot de passe"
              v-model="form.confirmPassword" required />

            <!-- Photo upload with preview -->
            <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div class="flex-shrink-0">
                <div v-if="photoPreview"
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <img :src="photoPreview" alt="Preview" class="w-full h-full object-cover" />
                </div>
                <div v-else
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z" />
                  </svg>
                </div>
              </div>

              <div class="flex-1 text-center sm:text-left">
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Photo de profil
                  (optionnel)</label>
                <div class="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                  <input ref="photoInput" type="file" accept="image/*" @change="onPhotoSelected"
                    class="text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-theme file:text-white hover:file:bg-theme-hover w-full sm:w-auto" />
                  <button v-if="photoPreview" type="button" @click="removePhoto"
                    class="text-xs sm:text-sm text-red-600 hover:underline">
                    Supprimer
                  </button>
                </div>
                <p class="text-[10px] sm:text-xs text-gray-400 mt-1">JPG, PNG. Max 2MB.</p>
              </div>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Je suis...
              </label>
              <div class="grid grid-cols-2 gap-2 sm:gap-3">
                <button v-for="role in roles" :key="role.value" type="button" @click="form.role = role.value" :class="[
                  'py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase rounded-lg border-2 transition',
                  form.role === role.value
                    ? 'bg-theme text-white border-theme'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-theme',
                ]">
                  {{ role.label }}
                </button>
              </div>
            </div>
          </template>

          <!-- Step 2 - Startuper -->
          <template v-if="step === 2 && form.role === 'startuper'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Ma startup... </label>
              <div class="grid grid-cols-2 gap-3 mb-4">
                <button type="button" @click="form.startupChoice = 'new'" :class="[
                  'py-3 px-4 text-sm font-semibold rounded-lg border-2 transition',
                  form.startupChoice === 'new'
                    ? 'bg-theme text-white border-theme'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-theme',
                ]">
                  Créer une nouvelle startup
                </button>
                <button type="button" @click="form.startupChoice = 'existing'" :class="[
                  'py-3 px-4 text-sm font-semibold rounded-lg border-2 transition',
                  form.startupChoice === 'existing'
                    ? 'bg-theme text-white border-theme'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-theme',
                ]">
                  Rejoindre une startup existante
                </button>
              </div>
            </div>

            <!-- New Startup Fields -->
            <div v-if="form.startupChoice === 'new'" class="bg-gray-50 p-4 rounded-lg space-y-4">
              <Input label="Nom de la startup" placeholder="MaTech" v-model="form.startupName" required />

              <div class="grid grid-cols-2 gap-4">
                <Select label="Secteur" v-model="form.sector" required>
                  <option value="">-- Sélectionner --</option>
                  <option v-for="s in sectors" :key="s.id" :value="s.id">{{ s.nom }}</option>
                </Select>

                <Select label="Localisation" v-model="form.location" required>
                  <option value="">-- Sélectionner une ville --</option>
                  <option v-for="city in beninCities" :key="city" :value="city">
                    {{ city }}
                  </option>
                </Select>
              </div>

              <Input label="Numéro RCCM" placeholder="RB/COT/21 A 33139" v-model="form.rccm"
                @input="form.rccm = form.rccm.toUpperCase()" required />


              <div class="grid grid-cols-2 gap-4">
                <Select label="Votre poste" v-model="form.position_id" :required="!form.title_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.nom }}</option>
                </Select>

                <Select label="Votre titre" v-model="form.title_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="t in titles" :key="t.id" :value="t.id">{{ t.nom }}</option>
                </Select>
              </div>

              <Alert v-if="!form.position_id && !form.title_id" type="warning" class="text-xs">
                Veuillez sélectionner au moins un poste ou un titre
              </Alert>

              <!-- <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Document RCCM (PDF)
                </label>
                <input type="file" accept=".pdf" @change="onRccmSelected"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-theme file:text-white hover:file:bg-theme-hover" />
              </div> -->
            </div>

            <!-- Search Existing Startup -->
            <div v-else class="bg-gray-50 p-4 rounded-lg space-y-4">
              <Input label="Rechercher une startup" placeholder="Tapez le nom de la startup..." v-model="searchQuery"
                @input="onSearchInput" />

              <!-- Résultats recherche -->
              <div v-if="searchQuery && searchQuery.length >= 3" class="mt-3">
                <div v-if="searchingStartups" class="text-center py-4">
                  <p class="text-sm text-gray-500">Recherche en cours...</p>
                </div>

                <div v-else-if="startupResults.length > 0"
                  class="space-y-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg p-2">
                  <button v-for="startup in startupResults" :key="startup.id" type="button"
                    @click="selectStartup(startup)" :class="[
                      'w-full text-left p-3 rounded-lg border-2 transition',
                      form.existingStartupId === startup.id
                        ? 'border-theme bg-theme-light text-gray-900'
                        : 'border-gray-200 hover:border-theme bg-white hover:bg-gray-50 text-gray-900',
                    ]">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="font-semibold text-gray-900">{{ startup.name }}</p>
                        <p class="text-xs text-gray-600 mt-1">
                          <span v-if="startup.sector">{{ startup.sector.nom }}</span>
                          <span v-if="startup.sector && startup.location"> • </span>
                          <span v-if="startup.location">{{ startup.location }}</span>
                        </p>
                      </div>
                      <div v-if="form.existingStartupId === startup.id" class="flex-shrink-0">
                        <svg class="w-5 h-5 text-theme" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Aucun résultat -->
                <div v-else-if="!searchingStartups && !form.existingStartupId" class="text-center py-4 text-sm text-gray-500">
                  Aucune startup trouvée pour "{{ searchQuery }}"
                </div>
              </div>

              <!-- Message seuil minimum -->
              <div v-else-if="searchQuery && searchQuery.length < 3"
                class="mt-3 text-center py-2 text-xs text-gray-400">
                Tapez au moins 3 caractères pour rechercher
              </div>

              <!-- Message sélection -->
              <Alert v-if="form.existingStartupId" type="info" class="mt-3">
                ✓ Startup sélectionnée : <strong>{{ selectedStartupName }}</strong><br />
                Une demande d'adhésion sera envoyée aux membres actuels après votre connexion.
              </Alert>

              <!-- Position et Title pour join request -->
              <!-- <div v-if="form.existingStartupId" class="grid grid-cols-2 gap-4 mt-4">
                <Select label="Votre poste (optionnel)" v-model="form.position_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.nom }}</option>
                </Select>

                <Select label="Votre titre (optionnel)" v-model="form.title_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="t in titles" :key="t.id" :value="t.id">{{ t.nom }}</option>
                </Select>
              </div> -->
            </div>
          </template>

          <!-- Step 2 - Partner -->
          <template v-if="step === 2 && form.role === 'partenaire'">
            <Alert type="info" class="mb-4">
              <div class="flex items-start gap-2">
                <Icon name="Info" :size="18" class="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-semibold text-blue-900">Validation requise</p>
                  <p class="text-sm text-blue-800">Votre compte partenaire devra être validé par un administrateur avant
                    que vous puissiez accéder à toutes les fonctionnalités de la plateforme.</p>
                </div>
              </div>
            </Alert>
            <div class="bg-gray-50 p-4 rounded-lg space-y-4">
              <Input label="Nom de l'organisation" placeholder="Bénin Business Angels" v-model="form.companyName"
                required />

              <Select label="Type d'organisation" v-model="form.companyType" required>
                <option v-for="t in partnerTypes" :key="t" :value="t">{{ t }}</option>
              </Select>
            </div>
          </template>

          <!-- Navigation Buttons -->
          <div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button v-if="step > 1" type="button" variant="outline" size="md" @click="step--" class="flex-1">
              Retour
            </Button>

            <Button
              type="submit"
              size="md"
              class="flex-1"
              :disabled="
                submitting ||
                (step === 2 && form.role === 'startuper' && form.startupChoice === 'existing' && !form.existingStartupId)
              "
            >
              <span class="text-sm sm:text-base">{{
                submitting ? 'Création...' : step === 2 ? 'Créer mon compte' : 'Continuer'
              }}</span>
            </Button>
          </div>
        </form>

        <!-- Login Link -->
        <div class="mt-4 sm:mt-6 text-center">
          <p class="text-xs sm:text-sm text-gray-600">
            Déjà un compte ?
            <router-link to="/login" class="text-theme hover:text-theme-hover font-semibold">
              Se connecter
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input, Select, Alert, Icon } from '@/components/ui'
import { getAllCityNames } from '@/utils/beninCities'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const step = ref(1)
const submitting = ref(false)
const searchQuery = ref('')
const startupResults = ref([])
const searchingStartups = ref(false)
const selectedStartupName = ref('')

const sectors = ref([])
const titles = ref([])
const positions = ref([])

const beninCities = ref(getAllCityNames())

const partnerTypes = ref(['incubateur', 'investisseur', 'bailleur', 'accelerateur'])

const error = computed(() => authStore.authError)

const roles = [
  { value: 'startuper', label: 'Startuper' },
  { value: 'partenaire', label: 'Partenaire' },
]

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'startuper',
  startupChoice: 'new',
  startupName: '',
  sector: '',
  location: '',
  rccm: '',
  rccmFile: null,
  existingStartupId: '',
  position_id: '',
  title_id: '',
  photoFile: null,
  companyName: '',
  companyType: 'incubateur',
})

const photoPreview = ref(null)
// const rccmFileName = ref(null)

onMounted(async () => {
  try {
    const [sectRes, titlesRes, posRes] = await Promise.all([
      api.get('/secteurs'),
      api.get('/titles'),
      api.get('/positions'),
    ])

    sectors.value = Array.isArray(sectRes.data.secteurs) ? sectRes.data.secteurs : sectRes.data
    titles.value = Array.isArray(titlesRes.data.titles) ? titlesRes.data.titles : titlesRes.data
    positions.value = Array.isArray(posRes.data.positions) ? posRes.data.positions : posRes.data
  } catch (e) {
    console.warn('Erreur chargement listes backend:', e)
  }
})

function onPhotoSelected(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  if (f.size > 5 * 1024 * 1024) {
    authStore.authError = 'La photo est trop volumineuse (max 5MB).'
    return
  }
  form.photoFile = f
  const reader = new FileReader()
  reader.onload = (ev) => {
    photoPreview.value = ev.target.result
  }
  reader.readAsDataURL(f)
}

function removePhoto() {
  form.photoFile = null
  photoPreview.value = null
  const input = document.querySelector('input[type="file"][accept^="image"]')
  if (input) input.value = ''
}

// function onRccmSelected(e) {
//   const f = e.target.files && e.target.files[0]
//   if (!f) return
//   if (f.size > 6 * 1024 * 1024) {
//     authStore.authError = 'Le PDF RCCM est trop volumineux (max 6MB).'
//     return
//   }
//   form.rccmFile = f
//   rccmFileName.value = f.name
// }

let searchTimer = null
async function onSearchInput() {
  const q = searchQuery.value?.trim()
  clearTimeout(searchTimer)

  if (!q || q.length < 3) {
    startupResults.value = []
    searchingStartups.value = false
    return
  }

  searchingStartups.value = true

  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get('/startups', {
        params: { search: q, per_page: 10 },
      })

      const items = data.data || []

      startupResults.value =
        items.map((s) => ({
          id: s.id,
          name: s.nom,
          sector: s.secteur,
          location: s.emplacement,
          logo: s.logo,
          description: s.description,
        })) || []
    } catch (e) {
      console.error('Erreur autocomplete startups', e)
      startupResults.value = []
    } finally {
      searchingStartups.value = false
    }
  }, 400)
}

function selectStartup(s) {
  form.existingStartupId = s.id
  selectedStartupName.value = s.name
  searchQuery.value = s.name
  startupResults.value = []
}

function savePendingOnboarding() {
  const pending = {
    role: form.role,
    startupChoice: form.startupChoice,
    existingStartupId: form.existingStartupId || null,
    startupName: form.startupName || null,
    sector: form.sector || null,
    location: form.location || null,
    rccm: form.rccm || null,
    position_id: form.position_id || null,
    title_id: form.title_id || null,
    companyName: form.companyName || null,
    companyType: form.companyType || null,
  }
  localStorage.setItem('pendingOnboarding', JSON.stringify(pending))
}

async function handleSubmit() {
  authStore.authError = null

  if (step.value === 1) {
    if (!form.displayName || !form.email || !form.password) {
      authStore.authError = 'Veuillez remplir tous les champs obligatoires.'
      return
    }
    if (form.password.length < 8) {
      authStore.authError = 'Le mot de passe doit contenir au moins 8 caractères.'
      return
    }
    if (form.password !== form.confirmPassword) {
      authStore.authError = 'Les mots de passe ne correspondent pas.'
      return
    }
    step.value = 2
    return
  }

  if (form.role === 'startuper' && form.startupChoice === 'new') {
    if (!form.startupName || !form.rccm) {
      authStore.authError = 'Veuillez fournir le nom de la startup et le numéro RCCM.'
      return
    }
  }

  const fd = new FormData()
  fd.append('name', form.displayName)
  fd.append('email', form.email)
  fd.append('password', form.password)
  fd.append('password_confirmation', form.confirmPassword)
  fd.append('role', form.role || 'startuper')

  if (form.photoFile) fd.append('photo', form.photoFile)

  submitting.value = true
  try {
    await api.post('/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

    savePendingOnboarding()

    toast.success('Inscription réussie !', 4000)
    toast.info(
      'Un email de vérification a été envoyé. Vérifiez votre boîte puis connectez-vous.',
      8000,
    )

    setTimeout(() => {
      router.push({ name: 'Login', query: { registered: '1' } })
    }, 2000)
  } catch (err) {
    console.error('Register error:', err)

    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {}
      const firstKey = Object.keys(errors)[0]
      const firstError = errors[firstKey]

      if (firstKey === 'email') {
        authStore.authError = 'Cet email est déjà utilisé ou invalide'
      } else if (firstKey === 'password') {
        authStore.authError = Array.isArray(firstError)
          ? firstError[0]
          : 'Le mot de passe doit contenir au moins 8 caractères'
      } else if (firstKey === 'photo') {
        authStore.authError = 'La photo est trop volumineuse (max 2MB)'
      } else {
        authStore.authError = Array.isArray(firstError)
          ? firstError[0]
          : 'Veuillez vérifier les informations saisies'
      }
    } else if (err.response?.status === 409) {
      authStore.authError = 'Cet email est déjà utilisé'
    } else if (err.response?.status === 413) {
      authStore.authError = 'Fichier trop volumineux'
    } else {
      authStore.authError =
        err.response?.data?.message || "Une erreur est survenue lors de l'inscription"
    }

    toast.error(authStore.authError, 6000)
  } finally {
    submitting.value = false
  }
}
</script>
