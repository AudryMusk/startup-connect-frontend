<template>
  <div class="min-h-screen pb-12 bg-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="max-w-3xl mx-auto px-4 py-8">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-600 hover:text-theme transition mb-6"
      >
        <Icon name="ArrowLeft" :size="18" />
        <span class="font-medium">Retour</span>
      </button>

      <Card class="!p-8">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="Building2" :size="24" class="text-blue-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Modifier l'organisation</h1>
            <p class="text-gray-500 text-sm">Mettez à jour les informations de votre organisation</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 gap-6">
            <Input
              label="Nom de l'organisation"
              v-model="form.name"
              placeholder="Ex: Bénin Business Angels"
              required
            />

            <Textarea
              label="Description"
              v-model="form.description"
              placeholder="Décrivez votre organisation, votre mission..."
              rows="4"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Site web"
              v-model="form.website"
              placeholder="https://www.exemple.com"
              type="url"
            />

            <Input
              label="Email de contact"
              v-model="form.email"
              placeholder="contact@organisation.com"
              type="email"
            />

            <Input
              label="Téléphone"
              v-model="form.phone"
              placeholder="+229 XX XX XX XX"
            />

            <Input
              label="Adresse"
              v-model="form.address"
              placeholder="Rue, Quartier..."
            />

            <Input
              label="Ville"
              v-model="form.city"
              placeholder="Cotonou"
            />

            <Input
              label="Pays"
              v-model="form.country"
              placeholder="Bénin"
            />
          </div>

          <!-- Logo Upload -->
          <div class="pt-4 border-t border-gray-100">
            <label class="block text-sm font-bold text-gray-700 mb-2">Logo de l'organisation</label>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-cover" />
                <Icon v-else name="Image" :size="24" class="text-gray-400" />
              </div>
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleLogoChange"
                  class="hidden"
                  ref="logoInput"
                />
                <Button type="button" variant="outline" size="sm" @click="$refs.logoInput.click()">
                  Choisir un logo
                </Button>
                <p class="text-xs text-gray-500 mt-2">JPG, PNG ou SVG. Max 2MB.</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Button type="button" variant="outline" @click="router.back()" :disabled="submitting">
              Annuler
            </Button>
            <Button type="submit" variant="gradient" :disabled="submitting">
              <LoadingSpinner v-if="submitting" size="sm" class="mr-2" />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import organizationsApi from '@/services/organizations'
import { getImageUrl } from '@/utils/imageUtils'
import {
  Card,
  Button,
  Input,
  Textarea,
  LoadingSpinner,
  Icon,
} from '@/components/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const logoPreview = ref(null)
const logoFile = ref(null)

const form = ref({
  name: '',
  description: '',
  website: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
})

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await organizationsApi.getById(route.params.id)
    const org = data.data || data

    if (!org) {
      toast.error('Organisation non trouvée')
      router.push('/')
      return
    }

    // Authorization check: Must be owner or admin
    const membersRes = await organizationsApi.getMembers(route.params.id)
    const members = membersRes.data?.members || []
    const isOwner = members.some(m => m.id === authStore.user?.id && m.role === 'owner')
    
    if (!isOwner && !authStore.isAdmin) {
      toast.error('Accès refusé')
      router.push(`/organizations/${route.params.id}`)
      return
    }

    // Populate form
    form.value = {
      name: org.name || '',
      description: org.description || '',
      website: org.website || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      city: org.city || '',
      country: org.country || '',
    }

    if (org.logo_url) {
      logoPreview.value = getImageUrl(org.logo_url)
    }

  } catch (error) {
    console.error('Error loading organization:', error)
    toast.error('Erreur lors du chargement des données')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const handleLogoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le logo est trop volumineux (max 2MB)')
      return
    }
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      logoPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    Object.keys(form.value).forEach(key => {
      if (form.value[key]) {
        formData.append(key, form.value[key])
      }
    })

    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }

    // Note: OrganizationController.update might expect PUT or POST with _method=PUT for FormData
    // Since it's an update with file, we use POST with _method=PUT
    formData.append('_method', 'PUT')
    
    await organizationsApi.update(route.params.id, formData)
    
    toast.success('Organisation mise à jour avec succès')
    router.push(`/organizations/${route.params.id}`)
  } catch (error) {
    console.error('Error updating organization:', error)
    const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>
