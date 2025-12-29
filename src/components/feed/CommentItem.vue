<script>
export default {
  name: 'CommentItem'
}
</script>

<template>
  <div class="group">
    <!-- Commentaire principal -->
    <div class="flex items-start gap-2 md:gap-3">
      <div v-if="comment.user?.photo" class="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden flex-shrink-0">
        <img :src="comment.user.photo" :alt="comment.user.name" class="w-full h-full object-cover" />
      </div>
      <div v-else
        class="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
        :class="getAvatarGradient(comment.user?.role)">
        {{ getInitials(comment.user?.name) }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="bg-neutral-50 rounded-lg px-3 md:px-4 py-2 md:py-3">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-semibold text-xs md:text-sm text-neutral-900 truncate">{{
              commentAuthorName
            }}</span>
            <span class="text-[10px] md:text-xs text-neutral-400 flex-shrink-0">
              {{ formatDistanceToNow(comment.created_at, { addSuffix: true }) }}
            </span>
          </div>
          <p class="text-xs md:text-sm text-neutral-700 break-words">{{ comment.content }}</p>
        </div>

        <!-- Actions du commentaire -->
        <div class="flex items-center gap-3 mt-1 ml-2">
          <!-- Bouton répondre -->
          <button v-if="(comment.depth || 0) < 10" @click="startReply"
            class="text-xs text-neutral-500 hover:text-theme-600 font-medium transition-colors">
            Répondre
          </button>

          <!-- Afficher/masquer les réponses -->
          <button v-if="localRepliesCount > 0" @click="toggleReplies"
            class="text-xs text-theme-500 hover:text-theme-600 font-medium transition-colors">
            {{ isExpanded ? 'Masquer' : 'Voir' }}
            {{ localRepliesCount }} réponse{{ localRepliesCount > 1 ? 's' : '' }}
          </button>

          <!-- Supprimer (visible pour admin ou auteur) -->
          <button v-if="canDelete" @click="$emit('delete', comment)"
            class="text-xs text-neutral-400 hover:text-red-500 font-medium transition-colors opacity-0 group-hover:opacity-100">
            Supprimer
          </button>
        </div>

        <!-- Formulaire de réponse -->
        <div v-if="isReplying" class="mt-2 md:mt-3 flex items-start gap-1.5 md:gap-2">
          <input v-model="replyContent" type="text"
            :placeholder="`Répondre à ${comment.user?.name || 'Utilisateur'}...`"
            class="flex-1 min-w-0 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-theme-200 focus:border-theme-300 outline-none"
            @keyup.enter="submitReply" @keyup.escape="cancelReply" :disabled="isSubmitting" ref="replyInput" />
          <Button size="sm" @click="submitReply" :disabled="!replyContent.trim() || isSubmitting">
            <Icon v-if="isSubmitting" name="Loader2" :size="14" class="animate-spin" />
            <Icon v-else name="Reply" :size="14" />
          </Button>
          <Button size="sm" variant="outline" @click="cancelReply">
            <Icon name="X" :size="14" />
          </Button>
        </div>

        <!-- Réponses au commentaire (Récursives) -->
        <div v-if="isExpanded && replies.length > 0"
          class="mt-2 md:mt-3 space-y-2 md:space-y-3 border-l-2 border-neutral-200 pl-2 md:pl-3"
          :class="{ 'ml-0 md:ml-2': (comment.depth || 0) >= 3, 'ml-2 md:ml-4': (comment.depth || 0) < 3 }">
          <CommentItem v-for="reply in replies" :key="reply.id" :comment="{ ...reply, depth: (comment.depth || 0) + 1 }"
            :post-id="postId" @delete="handleChildDelete" @comment-added="$emit('comment-added', $event)" />
        </div>

        <!-- Loading pour les réponses -->
        <div v-if="isLoadingReplies" class="mt-3 ml-4 pl-4 border-l-2 border-neutral-200">
          <Icon name="Loader2" :size="16" class="animate-spin text-theme-500" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import postsApi from '@/services/posts'
import { Button, Icon } from '../ui'
import { formatDistanceToNow } from '../../utils/dateUtils'
import { getEcho } from '@/services/echo'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  postId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['delete', 'comment-added'])

const authStore = useAuthStore()

const isExpanded = ref(false)
const isReplying = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)
const isLoadingReplies = ref(false)
const replies = ref([])
const replyInput = ref(null)

const localRepliesCount = ref(props.comment.replies_count || 0)

watch(() => props.comment.replies_count, (newVal) => {
  localRepliesCount.value = newVal
})

const canDelete = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.id === props.comment.user?.id
})

// Computed property pour le nom de l'auteur avec startup/organisation
const commentAuthorName = computed(() => {
  const name = props.comment.user?.name || 'Utilisateur'

  // Ajouter le nom de la startup/organisation entre parenthèses si disponible
  const startupName = props.comment.user?.startup?.nom || props.comment.user?.startup?.name || props.comment.startup?.nom
  const orgName = props.comment.user?.organization?.name || props.comment.user?.primary_organization?.name || props.comment.organization?.name

  if (startupName) {
    return `${name} (${startupName})`
  } else if (orgName) {
    return `${name} (${orgName})`
  }

  return name
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

const loadReplies = async () => {
  if (isLoadingReplies.value) return
  isLoadingReplies.value = true
  try {
    const { data } = await postsApi.getReplies(props.comment.id)
    replies.value = data.data || data || []

    localRepliesCount.value = replies.value.length
  } catch (error) {
    console.error('Error loading replies:', error)
  } finally {
    isLoadingReplies.value = false
  }
}

const toggleReplies = async () => {
  if (isExpanded.value) {
    isExpanded.value = false
  } else {
    isExpanded.value = true
    if (replies.value.length === 0 && localRepliesCount.value > 0) {
      await loadReplies()
    }
  }
}

const startReply = () => {
  isReplying.value = true
  replyContent.value = ''
  nextTick(() => {
    replyInput.value?.focus()
  })
}

const cancelReply = () => {
  isReplying.value = false
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const { data } = await postsApi.comment(props.postId, {
      content: replyContent.value.trim(),
      parent_id: props.comment.id,
    })

    const newReply = data.comment || data.data || data

    replies.value.push(newReply)

    localRepliesCount.value++

    // Ouvrir les réponses
    isExpanded.value = true

    emit('comment-added', { ...newReply, isReply: true, parentCommentId: props.comment.id })
    cancelReply()
  } catch (error) {
    console.error('Error adding reply:', error)
    alert("Erreur lors de l'ajout de la réponse")
  } finally {
    isSubmitting.value = false
  }
}

const handleChildDelete = (childComment) => {
  replies.value = replies.value.filter((r) => r.id !== childComment.id)
  localRepliesCount.value = Math.max(0, localRepliesCount.value - 1)
  emit('delete', childComment)
}

onMounted(() => {
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
      if (newComment.parent_id === props.comment.id) {
        if (!replies.value.find(r => r.id === newComment.id)) {
          replies.value.push(newComment)
          localRepliesCount.value++
        }
      }
    })
    .listen('.CommentDeleted', (e) => {
      if (e.parentId === props.comment.id) {
        const originalLength = replies.value.length
        replies.value = replies.value.filter(r => r.id !== e.commentId)
        if (replies.value.length < originalLength) {
          localRepliesCount.value = Math.max(0, localRepliesCount.value - 1)
        }
      }
    })
}

const cleanupRealtime = () => {
  const echo = getEcho()
  if (echo) {
    echo.channel(`posts.${props.postId}`).stopListening('.CommentCreated')
    echo.channel(`posts.${props.postId}`).stopListening('.CommentDeleted')
  }
}
</script>
