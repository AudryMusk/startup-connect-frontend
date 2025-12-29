<template>
  <Card variant="elevated" class="overflow-hidden">
    <!-- Header du post -->
    <div class="flex items-start justify-between mb-3 md:mb-4 gap-2">
      <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <div v-if="authorPhoto"
          class="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
          <img :src="authorPhoto" :alt="postAuthorName" class="w-full h-full object-cover" />
        </div>
        <div v-else
          class="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-lg flex-shrink-0"
          :class="avatarGradient">
          {{ organizationInitials }}
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-neutral-900 text-xs sm:text-sm md:text-base truncate">
            {{ postAuthorName }}
          </h4>
          <p class="text-[10px] sm:text-[11px] md:text-xs text-neutral-500 flex items-center gap-1">
            <Icon name="Clock" :size="10" class="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
            {{ formatDistanceToNow(postCreatedAt, { addSuffix: true }) }}
          </p>
        </div>
      </div>

      <!-- Menu actions -->
      <div class="relative flex-shrink-0">
        <button @click="showMenu = !showMenu"
          class="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
          <Icon name="MoreVertical" :size="16" class="sm:hidden" />
          <Icon name="MoreVertical" :size="18" class="hidden sm:inline" />
        </button>

        <!-- Dropdown menu -->
        <div v-if="showMenu"
          class="absolute right-0 top-full mt-1 w-44 sm:w-48 bg-white rounded-lg sm:rounded-xl shadow-soft-lg border border-neutral-100 py-1 z-20">
          <!-- Actions pour l'auteur -->
          <template v-if="isAuthor">
            <button @click="handleEdit"
              class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
              <Icon name="Edit" :size="14" class="sm:hidden" />
              <Icon name="Edit" :size="16" class="hidden sm:inline" />
              Modifier
            </button>
            <button @click="handleDelete"
              class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Icon name="Trash" :size="14" class="sm:hidden" />
              <Icon name="Trash" :size="16" class="hidden sm:inline" />
              Supprimer
            </button>
          </template>

          <!-- Actions pour tous (sauf auteur) -->
          <template v-if="!isAuthor">
            <button @click="handleReport"
              class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
              <Icon name="Flag" :size="14" class="sm:hidden" />
              <Icon name="Flag" :size="16" class="hidden sm:inline" />
              Signaler
            </button>
          </template>

          <!-- Admin peut aussi supprimer -->
          <template v-if="isAdmin && !isAuthor">
            <button @click="handleDelete"
              class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Icon name="Trash" :size="14" class="sm:hidden" />
              <Icon name="Trash" :size="16" class="hidden sm:inline" />
              Supprimer (Admin)
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Contenu du post -->
    <div class="mb-3 md:mb-4">
      <h3 v-if="post.title" class="text-base sm:text-lg md:text-xl font-bold text-neutral-900 mb-1.5 sm:mb-2">{{
        post.title
        }}</h3>
      <p class="text-xs sm:text-sm md:text-base text-neutral-700 whitespace-pre-wrap leading-relaxed">{{ post.content }}
      </p>
    </div>

    <!-- Images du post - Carrousel si plusieurs images -->
    <div v-if="postImages.length > 0" class="mb-3 md:mb-4 relative -mx-6 md:mx-0">
      <!-- Image unique ou carrousel -->
      <div class="relative aspect-video md:rounded-lg overflow-hidden">
        <img :src="postImages[currentImageIndex]" :alt="`Image ${currentImageIndex + 1}`"
          class="w-full h-full object-cover cursor-pointer" @click="openImageViewer(currentImageIndex)"
          @error="handleImageError" />

        <!-- Navigation carrousel si plusieurs images -->
        <template v-if="postImages.length > 1">
          <!-- Bouton précédent -->
          <button @click.stop="prevImage"
            class="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
            <Icon name="ChevronLeft" :size="18" class="sm:hidden" />
            <Icon name="ChevronLeft" :size="20" class="hidden sm:block md:hidden" />
            <Icon name="ChevronLeft" :size="24" class="hidden md:block" />
          </button>

          <!-- Bouton suivant -->
          <button @click.stop="nextImage"
            class="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
            <Icon name="ChevronRight" :size="18" class="sm:hidden" />
            <Icon name="ChevronRight" :size="20" class="hidden sm:block md:hidden" />
            <Icon name="ChevronRight" :size="24" class="hidden md:block" />
          </button>

          <!-- Indicateurs de position -->
          <div class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
            <button v-for="(_, index) in postImages" :key="index" @click.stop="currentImageIndex = index" :class="[
              'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
              index === currentImageIndex ? 'bg-white w-3 sm:w-4' : 'bg-white/50 hover:bg-white/75',
            ]"></button>
          </div>

          <!-- Compteur -->
          <div
            class="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/50 text-white text-[10px] sm:text-xs md:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
            {{ currentImageIndex + 1 }} / {{ postImages.length }}
          </div>
        </template>
      </div>
    </div>

    <!-- Statistiques et actions -->
    <div class="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-100">
      <button @click="toggleComments"
        class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-theme-600 transition-colors">
        <Icon name="MessageCircle" :size="16" class="sm:hidden" />
        <Icon name="MessageCircle" :size="18" class="hidden sm:inline" />
        <span class="text-xs sm:text-sm font-medium">
          {{ post.comments?.length || 0 }}
          <span class="hidden xs:inline">commentaire{{ (post.comments?.length || 0) > 1 ? 's' : '' }}</span>
        </span>
      </button>
    </div>

    <!-- Section commentaires -->
    <CommentSection v-if="showComments" :comments="post.comments || []" :postId="post.id"
      @comment-added="handleCommentAdded" @comment-deleted="handleCommentDeleted"
      class="mt-4 pt-4 border-t border-neutral-100" />

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      @click.self="showEditModal = false">
      <Card class="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-base sm:text-lg font-bold mb-3 sm:mb-4">Modifier la publication</h3>
        <form @submit.prevent="submitEdit">
          <input v-model="editForm.title" type="text" placeholder="Titre"
            class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-neutral-200 rounded-lg mb-2 sm:mb-3 focus:ring-2 focus:ring-theme-300 focus:border-theme-300" />
          <textarea v-model="editForm.content" rows="4" placeholder="Contenu"
            class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-neutral-200 rounded-lg mb-3 sm:mb-4 focus:ring-2 focus:ring-theme-300 focus:border-theme-300 resize-none"></textarea>

          <!-- Section images existantes -->
          <div v-if="editForm.existingImages.length > 0" class="mb-3">
            <p class="text-xs sm:text-sm font-medium text-neutral-700 mb-2">Images actuelles</p>
            <div class="flex flex-wrap gap-2">
              <div v-for="(img, index) in editForm.existingImages" :key="img.id || index" class="relative group">
                <img :src="getImageUrl(img.url || img.path || img)" alt="Image"
                  class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-200" />
                <button type="button" @click="removeExistingImage(index)"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                  <Icon name="X" :size="12" />
                </button>
              </div>
            </div>
          </div>

          <!-- Ajouter de nouvelles images -->
          <div class="mb-3">
            <p class="text-xs sm:text-sm font-medium text-neutral-700 mb-2">Ajouter des images</p>
            <div v-if="editForm.newImages.length > 0" class="flex flex-wrap gap-2 mb-2">
              <div v-for="(img, index) in editForm.newImagePreviews" :key="index" class="relative group">
                <img :src="img" alt="Nouvelle image"
                  class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-200" />
                <button type="button" @click="removeNewImage(index)"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                  <Icon name="X" :size="12" />
                </button>
              </div>
            </div>
            <label :class="[
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm',
              editForm.existingImages.length + editForm.newImages.length >= 5
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-600 hover:bg-theme-100 hover:text-theme-700'
            ]">
              <Icon name="Image" :size="16" />
              <span>Ajouter des images</span>
              <input type="file" accept="image/*" multiple @change="handleEditImageSelect" class="hidden"
                :disabled="editForm.existingImages.length + editForm.newImages.length >= 5" />
            </label>
            <p class="text-[10px] text-neutral-500 mt-1">{{ editForm.existingImages.length + editForm.newImages.length
            }}/5
              images</p>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" class="text-xs sm:text-sm" type="button"
              @click="showEditModal = false">Annuler</Button>
            <Button type="submit" size="sm" class="text-xs sm:text-sm">Enregistrer</Button>
          </div>
        </form>
      </Card>
    </div>

    <!-- Modale d'affichage des images -->
    <ImageModal :is-open="imageModalOpen" :image-src="currentImage"
      :image-alt="`Image de la publication - ${post.title}`" @close="imageModalOpen = false" />
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { Card, Button, Icon, ImageModal } from '../ui'
import CommentSection from './CommentSection.vue'
import { formatDistanceToNow } from '../../utils/dateUtils'
import { getImageUrl } from '../../utils/imageUtils'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete', 'report', 'comment-added', 'comment-deleted'])

const { user } = useAuth()

const showMenu = ref(false)
const showComments = ref(false)
const showEditModal = ref(false)
const imageModalOpen = ref(false)
const currentImage = ref('')
const currentImageIndex = ref(0)
const editForm = ref({
  title: '',
  content: '',
  existingImages: [],
  newImages: [],
  newImagePreviews: [],
})

const postAuthorId = computed(
  () => props.post.author?.id || props.post.user_id || props.post.authorId,
)
const postAuthorName = computed(() => {
  const name = props.post.author?.name ||
    props.post.author_name ||
    props.post.organizationName ||
    'Utilisateur'

  // Ajouter le nom de la startup/organisation entre parenthèses
  const startupName = props.post.startup?.nom || props.post.startup?.name
  const orgName = props.post.organization?.name || props.post.organisation?.nom

  if (startupName) {
    return `${name} (${startupName})`
  } else if (orgName) {
    return `${name} (${orgName})`
  }

  return name
})
const postAuthorRole = computed(
  () => props.post.author?.role || props.post.organizationType || 'startuper',
)
const authorPhoto = computed(() => getImageUrl(props.post.author?.photo || props.post.user?.photo || null))
const postCreatedAt = computed(
  () => props.post.published_at || props.post.created_at || props.post.createdAt,
)
const postImages = computed(() => {
  // Si images est un tableau d'objets avec url, extraire les URLs
  if (Array.isArray(props.post.images)) {
    return props.post.images.map((img) => getImageUrl(typeof img === 'string' ? img : img.url || img.path))
  }
  return []
})

const isAuthor = computed(() => user.value?.id === postAuthorId.value)
const isAdmin = computed(() => user.value?.role === 'admin')

const organizationInitials = computed(() => {
  const name = postAuthorName.value
  return name.substring(0, 2).toUpperCase()
})

const avatarGradient = computed(() => {
  const gradients = {
    startuper: 'from-theme-400 to-theme-600',
    partenaire: 'from-blue-400 to-indigo-600',
    partner: 'from-blue-400 to-indigo-600',
    admin: 'from-red-400 to-red-600',
  }
  return gradients[postAuthorRole.value] || 'from-theme-400 to-theme-600'
})

const toggleComments = () => {
  showComments.value = !showComments.value
}

const handleEdit = () => {
  // Préparer les images existantes
  const existingImgs = props.post.images ? props.post.images.map(img => {
    if (typeof img === 'string') {
      return { url: img }
    }
    return img
  }) : []

  editForm.value = {
    title: props.post.title || '',
    content: props.post.content || '',
    existingImages: [...existingImgs],
    newImages: [],
    newImagePreviews: [],
  }
  showEditModal.value = true
  showMenu.value = false
}

// Gérer la sélection d'images dans le modal d'édition
const handleEditImageSelect = (event) => {
  const files = Array.from(event.target.files)
  const totalImages = editForm.value.existingImages.length + editForm.value.newImages.length
  const remainingSlots = 5 - totalImages
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    if (file.type.startsWith('image/')) {
      editForm.value.newImages.push(file)

      // Créer une preview
      const reader = new FileReader()
      reader.onload = (e) => {
        editForm.value.newImagePreviews.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })

  // Reset input
  event.target.value = ''
}

// Supprimer une image existante
const removeExistingImage = (index) => {
  editForm.value.existingImages.splice(index, 1)
}

// Supprimer une nouvelle image
const removeNewImage = (index) => {
  editForm.value.newImages.splice(index, 1)
  editForm.value.newImagePreviews.splice(index, 1)
}

const submitEdit = () => {
  // Préparer le payload avec les images
  const payload = {
    id: props.post.id,
    title: editForm.value.title,
    content: editForm.value.content,
    images: editForm.value.newImages, // Nouvelles images (fichiers)
    existing_images: editForm.value.existingImages.map(img => img.id).filter(Boolean), // IDs des images à conserver
  }

  emit('edit', payload)
  showEditModal.value = false
}

const handleDelete = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
    emit('delete', props.post.id)
  }
  showMenu.value = false
}

const handleReport = () => {
  emit('report', props.post.id)
  showMenu.value = false
}

const openImageViewer = (index) => {
  currentImage.value = postImages.value[index]
  imageModalOpen.value = true
}

const prevImage = () => {
  currentImageIndex.value =
    currentImageIndex.value > 0 ? currentImageIndex.value - 1 : postImages.value.length - 1
}

const nextImage = () => {
  currentImageIndex.value =
    currentImageIndex.value < postImages.value.length - 1 ? currentImageIndex.value + 1 : 0
}

const handleImageError = (event) => {
  console.error('Failed to load image:', event.target.src)
}

const handleCommentAdded = (comment) => {
  emit('comment-added', { postId: props.post.id, comment })
}

const handleCommentDeleted = (commentId) => {
  emit('comment-deleted', { postId: props.post.id, commentId })
}

// Fermer le menu quand on clique ailleurs
const handleClickOutside = (e) => {
  if (showMenu.value && !e.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
