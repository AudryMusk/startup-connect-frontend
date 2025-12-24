<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <div class="max-w-3xl mx-auto px-3 sm:px-4 py-6 md:py-8">
      <!-- Header -->
      <div class="mb-4 md:mb-6">
        <Button variant="ghost" size="sm" @click="$router.back()" class="mb-3 md:mb-4">
          <Icon name="ArrowLeft" :size="16" class="mr-1.5 md:mr-2" />
          <span class="text-sm">Retour</span>
        </Button>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Modifier mon profil</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
        <!-- Avatar Section -->
        <Card>
          <h2 class="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Photo de profil</h2>
          <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div
              v-if="previewPhoto || form.photo"
              class="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <img
                :src="getImageUrl(previewPhoto || form.photo)"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-theme-400 to-theme-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl md:text-3xl flex-shrink-0"
            >
              {{ form.name?.[0]?.toUpperCase() || '?' }}
            </div>

            <div class="flex-1 text-center sm:text-left">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="hidden"
              />
              <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                <Button type="button" variant="outline" size="sm" @click="$refs.fileInput.click()">
                  <Icon name="Upload" :size="16" class="mr-1.5" />
                  <span class="text-xs md:text-sm">Changer</span>
                </Button>
                <Button
                  v-if="previewPhoto || form.photo"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removePhoto"
                >
                  <Icon name="Trash2" :size="16" />
                </Button>
              </div>
              <p class="text-xs text-gray-500 mt-2">JPG, PNG ou GIF. Max 5MB</p>
            </div>
          </div>
        </Card>

        <!-- Basic Info -->
        <Card>
          <h2 class="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
            Informations personnelles
          </h2>
          <div class="space-y-3 md:space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Nom complet <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Votre nom"
                class="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="votre@email.com"
                class="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                :disabled="authStore.user?.role !== 'admin'"
                :class="{ 'bg-gray-100 cursor-not-allowed': authStore.user?.role !== 'admin' }"
                required
              />
              <p v-if="authStore.user?.role !== 'admin'" class="text-xs text-gray-500 mt-1">
                L'adresse email ne peut pas être modifiée.
              </p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Téléphone
              </label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+229 01 XX XX XX XX"
                class="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              />
            </div>

            <!-- Location -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Localisation
              </label>
              <input
                v-model="form.location"
                type="text"
                placeholder="Ville, Pays"
                class="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              />
            </div>

            <!-- Bio -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Biographie
              </label>
              <textarea
                v-model="form.bio"
                rows="4"
                placeholder="Parlez-nous de vous..."
                class="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent resize-none"
              />
              <p class="text-xs text-gray-500 mt-1">{{ form.bio?.length || 0 }} / 500 caractères</p>
            </div>

            <!-- Compétences -->
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                Compétences
              </label>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-1.5 md:gap-2 mb-2">
                  <span
                    v-for="(skill, index) in form.skills"
                    :key="index"
                    class="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-0.5 md:py-1 bg-theme-100 text-theme-700 rounded-full text-xs md:text-sm"
                  >
                    {{ skill }}
                    <button
                      type="button"
                      @click="removeSkill(index)"
                      class="hover:text-theme-900 transition"
                    >
                      <Icon name="X" :size="12" />
                    </button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newSkill"
                    type="text"
                    placeholder="Ajouter une compétence"
                    class="flex-1 min-w-0 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
                    @keyup.enter="addSkill"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="addSkill"
                    :disabled="!newSkill.trim()"
                  >
                    <Icon name="Plus" :size="18" />
                  </Button>
                </div>
                <p class="text-xs text-gray-500">
                  Appuyez sur Entrée ou cliquez sur + pour ajouter
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Password Section -->
        <Card>
          <h2 class="text-lg font-bold text-gray-900 mb-4">Changer le mot de passe</h2>
          <p class="text-sm text-gray-600 mb-4">
            Laissez vide si vous ne souhaitez pas changer votre mot de passe
          </p>
          <div class="space-y-4">
            <!-- Current Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <input
                v-model="form.current_password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              />
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                v-model="form.new_password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                v-model="form.confirm_password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        <!-- Submit Buttons -->
        <div class="flex justify-end gap-3">
          <Button type="button" variant="outline" @click="$router.back()" :disabled="saving">
            Annuler
          </Button>
          <Button type="submit" :disabled="!isValid || saving">
            <LoadingSpinner v-if="saving" size="sm" class="mr-2" />
            <Icon v-else name="Save" :size="18" class="mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { Card, Button, LoadingSpinner, Icon } from '@/components/ui'
import { getImageUrl } from '@/utils/imageUtils'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const fileInput = ref(null)
const photoFile = ref(null)
const previewPhoto = ref(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  photo: '',
  skills: [],
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const newSkill = ref('')

const isValid = computed(() => {
  // Basic validation
  if (!form.value.name.trim() || !form.value.email.trim()) {
    return false
  }

  // If changing password, validate
  if (form.value.new_password) {
    if (!form.value.current_password) {
      return false
    }
    if (form.value.new_password !== form.value.confirm_password) {
      return false
    }
    if (form.value.new_password.length < 8) {
      return false
    }
  }

  return true
})

async function loadCurrentUser() {
  loading.value = true

  try {
    // S'assurer qu'on a les données complètes depuis le backend
    await authStore.fetchMe()
    const user = authStore.user

    if (user) {
      form.value.name = user.name || ''
      form.value.email = user.email || ''
      form.value.phone = user.phone || ''
      form.value.location = user.location || ''
      form.value.bio = user.bio || ''
      form.value.photo = user.photo || ''

      // Parser les compétences si c'est une string JSON
      if (typeof user.skills === 'string') {
        try {
          form.value.skills = JSON.parse(user.skills)
        } catch (e) {
          form.value.skills = []
          console.log(e)
        }
      } else if (Array.isArray(user.skills)) {
        form.value.skills = [...user.skills]
      } else {
        form.value.skills = []
      }
    }
  } catch (err) {
    console.error('Error loading user data:', err)
    toast.error('Erreur lors du chargement du profil')
  } finally {
    loading.value = false
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('La photo doit faire moins de 5MB')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Le fichier doit être une image')
    return
  }

  photoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewPhoto.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  photoFile.value = null
  previewPhoto.value = null
  form.value.photo = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function addSkill() {
  const skill = newSkill.value.trim()
  if (skill && !form.value.skills.includes(skill)) {
    form.value.skills.push(skill)
    newSkill.value = ''
  }
}

function removeSkill(index) {
  form.value.skills.splice(index, 1)
}

async function handleSubmit() {
  if (!isValid.value || saving.value) return

  // Validate password match
  if (form.value.new_password && form.value.new_password !== form.value.confirm_password) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }

  saving.value = true

  try {
    const formData = new FormData()

    formData.append('name', form.value.name.trim())
    formData.append('email', form.value.email.trim())

    if (form.value.phone) {
      formData.append('phone', form.value.phone.trim())
    }

    if (form.value.location) {
      formData.append('location', form.value.location.trim())
    }

    if (form.value.bio) {
      formData.append('bio', form.value.bio.trim())
    }

    // Add skills as JSON
    if (form.value.skills && form.value.skills.length > 0) {
      formData.append('skills', JSON.stringify(form.value.skills))
    }

    // Add photo if changed
    if (photoFile.value) {
      formData.append('photo', photoFile.value)
    }

    // Add password if changing
    if (form.value.new_password) {
      formData.append('current_password', form.value.current_password)
      formData.append('new_password', form.value.new_password)
      formData.append('confirm_password', form.value.confirm_password)
    }

    const result = await authStore.updateProfile(formData)

    // Vérifier que la photo a bien été uploadée si on en a envoyé une
    if (photoFile.value && result.user && result.user.photo) {
      toast.success('Profil et photo mis à jour avec succès')
    } else if (photoFile.value) {
      toast.warning("Profil mis à jour mais la photo n'a pas pu être uploadée")
    } else {
      toast.success('Profil mis à jour avec succès')
    }

    router.push(`/users/${authStore.user.id}`)
  } catch (err) {
    console.error('Error updating profile:', err)
    toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCurrentUser()
})
</script>
