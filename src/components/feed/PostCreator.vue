<template>
  <Card variant="elevated" class="mb-6">
    <form @submit.prevent="handleSubmit">
      <!-- Header avec avatar -->
      <div class="flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-xl bg-gradient-to-br from-theme-400 to-theme-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        >
          {{ organizationInitials }}
        </div>

        <div class="flex-1 space-y-4">
          <!-- Titre du post -->
          <input
            v-model="form.title"
            type="text"
            placeholder="Titre de votre publication..."
            class="w-full px-0 py-2 text-lg font-semibold text-neutral-900 placeholder-neutral-400 border-0 border-b-2 border-transparent focus:border-theme-300 focus:ring-0 focus:outline-none bg-transparent transition-colors"
          />

          <!-- Contenu du post -->
          <textarea
            v-model="form.content"
            placeholder="Partagez une actualité, une annonce..."
            rows="3"
            class="w-full px-0 py-2 text-neutral-700 placeholder-neutral-400 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none"
          ></textarea>

          <!-- Prévisualisation des images -->
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
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div class="flex items-center gap-2">
          <!-- Bouton ajouter image -->
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

          <span class="text-xs text-neutral-400"> {{ previewImages.length }}/5 images </span>
        </div>

        <Button type="submit" :disabled="!canSubmit || isSubmitting" variant="gradient">
          <Icon name="Send" :size="16" />
          Publier
        </Button>
      </div>
    </form>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { Card, Button, Icon } from '../ui'

const props = defineProps({
  organizationName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['post-created'])

const { user } = useAuth()

const form = ref({
  title: '',
  content: '',
})

const selectedImages = ref([])
const previewImages = ref([])
const isSubmitting = ref(false)

const organizationInitials = computed(() => {
  const name = props.organizationName || user.value?.displayName || 'U'
  return name.substring(0, 2).toUpperCase()
})

const canSubmit = computed(() => {
  return form.value.title.trim() && form.value.content.trim()
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
    const formData = new FormData()
    if (form.value.title) {
      formData.append('title', form.value.title)
    }
    formData.append('content', form.value.content)

    selectedImages.value.forEach((file) => {
      formData.append('images[]', file)
    })

    emit('post-created', formData)

    // Reset form
    form.value = { title: '', content: '' }
    selectedImages.value = []
    previewImages.value = []
  } catch (error) {
    console.error('Error creating post:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
