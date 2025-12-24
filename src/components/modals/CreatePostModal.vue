<template>
  <Modal :is-open="isOpen" title="Créer une publication" size="lg" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
      <!-- Header avec avatar -->
      <div class="flex items-center gap-3 md:gap-4">
        <div
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-theme-400 to-theme-600 flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0"
        >
          {{ organizationInitials }}
        </div>
        <div>
          <p class="font-bold text-sm md:text-base text-neutral-900">{{ organizationName }}</p>
          <p class="text-xs md:text-sm text-neutral-500">Publication publique</p>
        </div>
      </div>

      <!-- Contenu du post -->
      <div class="space-y-3 md:space-y-4">
        <input
          v-model="form.title"
          type="text"
          placeholder="Titre de la publication"
          class="w-full px-3 md:px-4 py-2 text-sm md:text-base font-bold text-neutral-900 placeholder-neutral-400 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-theme-200 focus:border-theme-300 outline-none bg-transparent transition-all"
        />
        <textarea
          v-model="form.content"
          placeholder="Partagez une actualité, une annonce, une réflexion..."
          rows="4"
          class="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-neutral-700 placeholder-neutral-400 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-theme-200 focus:border-theme-300 outline-none bg-transparent resize-none transition-all"
          autofocus
        ></textarea>

        <!-- Prévisualisation des images -->
        <div v-if="previewImages.length > 0" class="space-y-2 md:space-y-3">
          <p class="text-xs md:text-sm font-medium text-neutral-700">
            Images ({{ previewImages.length }}/5)
          </p>
          <div class="flex flex-wrap gap-1.5 md:gap-2">
            <div v-for="(img, index) in previewImages" :key="index" class="relative group">
              <img
                :src="img"
                alt="Preview"
                class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg border-2 border-neutral-200"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <Icon name="X" :size="12" />
              </button>
            </div>

            <!-- Indicateur si max atteint -->
            <div
              v-if="previewImages.length >= 5"
              class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-[10px] md:text-xs text-center p-1.5 md:p-2"
            >
              Max 5 images
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-neutral-100"
      >
        <div class="flex items-center gap-2">
          <!-- Bouton ajouter image -->
          <label
            :class="[
              'flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg cursor-pointer transition-colors text-xs md:text-sm',
              previewImages.length >= 5
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-600 hover:bg-theme-100 hover:text-theme-700',
            ]"
          >
            <Icon name="Image" :size="16" />
            <span class="font-medium">Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleImageSelect"
              class="hidden"
              :disabled="previewImages.length >= 5"
            />
          </label>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <Button variant="outline" size="sm" class="flex-1 sm:flex-none" @click="$emit('close')">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="sm"
            class="flex-1 sm:flex-none"
            :disabled="!canSubmit || isSubmitting"
          >
            <Icon v-if="isSubmitting" name="Loader2" :size="14" class="animate-spin" />
            <Icon v-else name="Send" :size="14" />
            <span class="hidden sm:inline">{{ isSubmitting ? 'Publication...' : 'Publier' }}</span>
            <span class="sm:hidden">{{ isSubmitting ? '...' : 'Publier' }}</span>
          </Button>
        </div>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Modal, Button, Icon } from '../ui'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  organizationName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'post-created'])

const form = ref({
  title: '',
  content: '',
})

const selectedImages = ref([])
const previewImages = ref([])
const isSubmitting = ref(false)

const organizationInitials = computed(() => {
  const name = props.organizationName || 'U'
  return name.substring(0, 2).toUpperCase()
})

const canSubmit = computed(() => {
  return form.value.content.trim().length > 0
})

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

  // Reset input
  event.target.value = ''
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
  previewImages.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Créer FormData pour l'envoi au backend
    const formData = new FormData()
    if (form.value.title) {
      formData.append('title', form.value.title)
    }
    formData.append('content', form.value.content)

    // Ajouter les images (fichiers réels, pas base64)
    selectedImages.value.forEach((file) => {
      formData.append('images[]', file)
    })

    emit('post-created', formData)

    // Reset form
    form.value = { content: '' }
    selectedImages.value = []
    previewImages.value = []

    // Fermer la modale
    emit('close')
  } catch (error) {
    console.error('Error creating post:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
