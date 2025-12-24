<template>
  <div class="space-y-3 md:space-y-4">
    <!-- Formulaire d'ajout de commentaire -->
    <div class="flex items-start gap-2 md:gap-3">
      <div
        v-if="authStore.user?.photo"
        class="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden flex-shrink-0"
      >
        <img
          :src="authStore.user.photo"
          :alt="authStore.user.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-theme-400 to-theme-600 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
      >
        {{ userInitials }}
      </div>
      <div class="flex-1 min-w-0">
        <form @submit.prevent="addComment" class="flex gap-1.5 md:gap-2">
          <input
            v-model="newComment"
            type="text"
            placeholder="Écrire un commentaire..."
            class="flex-1 min-w-0 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-theme-200 focus:border-theme-300 outline-none transition-all"
            :disabled="isSubmitting"
          />
          <Button type="submit" size="sm" :disabled="!newComment.trim() || isSubmitting">
            <Icon v-if="isSubmitting" name="Loader2" :size="14" class="animate-spin" />
            <Icon v-else name="Send" :size="14" />
          </Button>
        </form>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-4">
      <Icon name="Loader2" :size="24" class="animate-spin text-theme-500" />
    </div>

    <!-- Liste des commentaires -->
    <div v-else-if="localComments.length > 0" class="space-y-3 md:space-y-4">
      <CommentItem
        v-for="comment in localComments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @delete="deleteComment"
        @comment-added="$emit('comment-added', $event)"
      />
    </div>

    <!-- Message si aucun commentaire -->
    <p v-else class="text-sm text-neutral-400 text-center py-4">
      Aucun commentaire. Soyez le premier à commenter !
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import postsApi from '@/services/posts'
import { Button, Icon } from '../ui'
import { formatDistanceToNow } from '../../utils/dateUtils'
import CommentItem from './CommentItem.vue'
import { getEcho } from '@/services/echo'

const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  postId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['comment-added', 'comment-deleted'])

const authStore = useAuthStore()

const newComment = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const localComments = ref([])

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U'
  return name.substring(0, 2).toUpperCase()
})

const getInitials = (name) => {
  return (name || 'U').substring(0, 2).toUpperCase()
}

const getAvatarGradient = (role) => {
  const gradients = {
    startuper: 'bg-gradient-to-br from-theme-400 to-theme-600',
    partenaire: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    partner: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    admin: 'bg-gradient-to-br from-red-400 to-red-600',
  }
  return gradients[role] || 'bg-gradient-to-br from-neutral-400 to-neutral-600'
}

const canDeleteComment = (comment) => {
  return authStore.user?.role === 'admin' || authStore.user?.id === comment.user?.id
}

// Charger les commentaires depuis l'API
const loadComments = async () => {
  isLoading.value = true
  try {
    const { data } = await postsApi.getComments(props.postId)
    localComments.value = data.data || data || []
  } catch (error) {
    console.error('Error loading comments:', error)
    localComments.value = props.comments || []
  } finally {
    isLoading.value = false
  }
}

const addComment = async () => {
  if (!newComment.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const { data } = await postsApi.comment(props.postId, {
      content: newComment.value.trim(),
    })

      // Ajouter le nouveau commentaire à la liste
    const newCommentData = data.comment || data.data || data
    localComments.value.unshift(newCommentData)

    emit('comment-added', newCommentData)
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
    alert("Erreur lors de l'ajout du commentaire")
  } finally {
    isSubmitting.value = false
  }
}

const deleteComment = async (comment) => {
  if (!confirm('Supprimer ce commentaire ?')) return

  try {
    await postsApi.deleteComment(comment.id)
    localComments.value = localComments.value.filter((c) => c.id !== comment.id)
    emit('comment-deleted', comment.id)
  } catch (error) {
    console.error('Error deleting comment:', error)
    alert('Erreur lors de la suppression')
  }
}

// Charger les commentaires au montage
onMounted(() => {
  loadComments()
  setupRealtime()
})

onUnmounted(() => {
  cleanupRealtime()
})

const setupRealtime = () => {
  const echo = getEcho()
  if (!echo) return

  echo.channel(`posts.${props.postId}`)
    .listen('.CommentCreated', (e) => {
      const newComment = e.comment
      // Si c'est un commentaire racine (pas une réponse)
      if (!newComment.parent_id) {
        // Vérifier s'il n'est pas déjà présent (évite les doublons si c'est nous qui l'avons créé)
        if (!localComments.value.find(c => c.id === newComment.id)) {
          localComments.value.unshift(newComment)
        }
      }
    })
    .listen('.CommentDeleted', (e) => {
      if (!e.parentId) {
        localComments.value = localComments.value.filter(c => c.id !== e.commentId)
      }
    })
}

const cleanupRealtime = () => {
  const echo = getEcho()
  if (echo) {
    echo.leaveChannel(`posts.${props.postId}`)
  }
}

// Recharger si le postId change
watch(
  () => props.postId,
  () => {
    loadComments()
  },
)
</script>
