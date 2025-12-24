<template>
  <div class="card-spacing">
      <!-- Bannière événement à la une  -->
      <EventBanner
        v-if="featuredEvent"
        :eventId="featuredEvent.id"
        :eventDate="nextEventDate"
        :eventName="nextEventName"
        :eventLocation="nextEventLocation"
        :isLoading="loading"
      />
    <!-- Mobile: Bouton pour afficher/masquer la sidebar -->
    <div class="lg:hidden flex items-center justify-between mb-3 sm:mb-4">
      <h2 class="text-base sm:text-lg font-bold text-neutral-900">Fil d'actualité</h2>
      <button @click="showMobileSidebar = !showMobileSidebar"
        class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-theme-50 text-theme-700 rounded-lg text-xs sm:text-sm font-medium">
        <Icon :name="showMobileSidebar ? 'X' : 'LayoutGrid'" :size="14" class="sm:hidden" />
        <Icon :name="showMobileSidebar ? 'X' : 'LayoutGrid'" :size="16" class="hidden sm:inline" />
        {{ showMobileSidebar ? 'Masquer' : 'Plus' }}
      </button>
    </div>

    <!-- Mobile Sidebar Drawer -->
    <div v-if="showMobileSidebar"
      class="lg:hidden space-y-3 sm:space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-neutral-50 rounded-xl border border-neutral-200">
      <!-- Event Countdown Mobile -->
      <EventCountdown :eventDate="nextEventDate" :eventName="nextEventName" :isLoading="loading" />

      <!-- Quick Actions Mobile - Version compact -->
      <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
        <router-link to="/offers">
          <Button variant="outline" size="sm" class="w-full justify-start gap-1.5 text-xs">
            <Icon name="Search" :size="12" class="text-theme-600 sm:hidden" />
            <Icon name="Search" :size="14" class="text-theme-600 hidden sm:inline" />
            <span class="text-[10px] sm:text-xs">Opportunités</span>
          </Button>
        </router-link>
        <router-link to="/candidacies">
          <Button variant="outline" size="sm" class="w-full justify-start gap-1.5 text-xs">
            <Icon name="FileText" :size="12" class="text-green-600 sm:hidden" />
            <Icon name="FileText" :size="14" class="text-green-600 hidden sm:inline" />
            <span class="text-[10px] sm:text-xs">Candidatures</span>
          </Button>
        </router-link>
        <router-link to="/messages">
          <Button variant="outline" size="sm" class="w-full justify-start gap-1.5 text-xs">
            <Icon name="MessageSquare" :size="12" class="text-blue-600 sm:hidden" />
            <Icon name="MessageSquare" :size="14" class="text-blue-600 hidden sm:inline" />
            <span class="text-[10px] sm:text-xs">Messages</span>
          </Button>
        </router-link>
        <router-link to="/startups">
          <Button variant="outline" size="sm" class="w-full justify-start gap-1.5 text-xs">
            <Icon name="Building2" :size="12" class="text-purple-600 sm:hidden" />
            <Icon name="Building2" :size="14" class="text-purple-600 hidden sm:inline" />
            <span class="text-[10px] sm:text-xs">Startups</span>
          </Button>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content - Feed -->
      <div class="lg:col-span-2 space-y-4 md:space-y-6">
        <!-- Bouton Créer un post -->
        <Button variant="gradient" size="lg" class="w-full justify-center gap-2 md:gap-3 text-sm md:text-base"
          @click="showCreatePostModal = true">
          <Icon name="Plus" :size="18" class="md:w-5 md:h-5" />
          <span class="hidden sm:inline">Publier une actualité</span>
          <span class="sm:hidden">Publier</span>
        </Button>

        <!-- Feed Posts -->
        <template v-if="loading">
          <PostSkeleton v-for="i in 3" :key="i" :with-image="i === 1" />
        </template>
        <template v-else>
          <div v-if="posts.length > 0" class="space-y-6">
            <PostCard v-for="post in posts" :key="post.id" :post="post" @edit="handleEditPost"
              @delete="handleDeletePost" @report="handleReportPost" @comment-added="handleCommentAdded"
              @comment-deleted="handleCommentDeleted" />
          </div>
          <EmptyState v-else title="Aucune publication" description="Soyez le premier à partager une actualité !">
            <template #icon>
              <Icon name="FileText" :size="48" />
            </template>
          </EmptyState>
        </template>
      </div>

      <!-- Sidebar - Hidden on mobile, sticky on desktop -->
      <div
        class="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
        <!-- Event Countdown -->
        <!-- <EventCountdown
          :eventDate="nextEventDate"
          :eventName="nextEventName"
          :isLoading="loading"
        /> -->

        <!-- Quick Actions -->
        <Card variant="elevated">
          <h3 class="font-black text-lg text-neutral-900 mb-5 flex items-center gap-2">
            <div
              class="w-8 h-8 bg-gradient-to-br from-theme-400 to-theme-600 rounded-lg flex items-center justify-center">
              <Icon name="Zap" :size="16" class="text-white" />
            </div>
            Actions rapides
          </h3>
          <div class="space-y-3">
            <router-link to="/offers">
              <Button variant="outline" class="w-full justify-start group hover:border-theme-300 hover:bg-theme-50">
                <div
                  class="w-9 h-9 bg-theme-100 rounded-xl flex items-center justify-center group-hover:bg-theme-200 transition-colors">
                  <Icon name="Search" :size="18" class="text-theme-700" />
                </div>
                <span class="flex-1 text-left font-bold">Explorer les opportunités</span>
                <Icon name="ChevronRight" :size="16"
                  class="text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </router-link>

            <router-link to="/candidacies">
              <Button variant="outline"
                class="w-full justify-start group hover:border-green-300 hover:bg-green-50 mt-2">
                <div
                  class="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Icon name="FileText" :size="18" class="text-green-700" />
                </div>
                <span class="flex-1 text-left font-bold">Mes candidatures</span>
                <Badge color="theme" size="sm">{{ candidaciesCount }}</Badge>
              </Button>
            </router-link>

            <router-link to="/messages">
              <Button variant="outline" class="w-full justify-start group hover:border-blue-300 hover:bg-blue-50 mt-2">
                <div
                  class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Icon name="MessageSquare" :size="18" class="text-blue-700" />
                </div>
                <span class="flex-1 text-left font-bold">Messagerie</span>
                <Icon name="ChevronRight" :size="16"
                  class="text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </router-link>

            <router-link to="/startups">
              <Button variant="outline"
                class="w-full justify-start group hover:border-purple-300 hover:bg-purple-50 mt-2">
                <div
                  class="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Icon name="Building2" :size="18" class="text-purple-700" />
                </div>
                <span class="flex-1 text-left font-bold">Découvrir des startups</span>
                <Icon name="ChevronRight" :size="16"
                  class="text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </router-link>
          </div>
        </Card>

        <!-- Sector Group Activity -->
        <Card variant="elevated">
          <h3 class="font-black text-lg text-neutral-900 mb-5 flex items-center gap-2">
            <div
              class="w-8 h-8 bg-gradient-to-br from-theme-400 to-theme-600 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" :size="16" class="text-white" />
            </div>
            Groupe {{ startup?.sector }}
          </h3>
          <p v-if="groupMessages.length === 0" class="text-sm text-neutral-500 text-center py-4">
            Aucun message récent dans votre groupe sectoriel
          </p>
          <div v-else class="space-y-4">
            <div v-for="msg in groupMessages.slice(0, 3)" :key="msg.id"
              class="p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors">
              <p class="font-bold text-sm text-neutral-900 mb-1">{{ msg.senderName }}</p>
              <p class="text-sm text-neutral-600 line-clamp-2 mb-2">{{ msg.text }}</p>
              <p class="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Icon name="Clock" :size="12" />
                {{ formatDistanceToNow(msg.createdAt, { addSuffix: true }) }}
              </p>
            </div>
            <router-link to="/messages">
              <Button variant="ghost" size="sm" class="w-full group">
                Voir toutes les discussions
                <Icon name="ArrowRight" :size="14" class="group-hover:translate-x-1 transition-transform" />
              </Button>
            </router-link>
          </div>
        </Card>
      </div>
    </div>
  </div>

  <!-- Modal de création de post -->
  <CreatePostModal :is-open="showCreatePostModal"
    :organization-name="startup?.name || authStore.user?.name || 'Ma Startup'" @close="showCreatePostModal = false"
    @post-created="handlePostCreated" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { usePostsStore } from '@/stores/postsStore'
import { useAuthStore } from '@/stores/authStore'
import postsApi from '../../services/posts'
import eventsApi from '../../services/events'
import { Card, Button, Badge, EmptyState, Icon } from '../../components/ui'
import PostSkeleton from '@/components/skeletons/PostSkeleton.vue'
import { PostCard, EventCountdown } from '../../components/feed'
import EventBanner from '../../components/feed/EventBanner.vue'
import CreatePostModal from '../../components/modals/CreatePostModal.vue'
import { formatDistanceToNow } from '../../utils/dateUtils'

const { user } = useAuth()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const startup = ref(null)
const candidaciesCount = ref(0)
const groupMessages = ref([])
const loading = ref(true)
const posts = ref([])

// Featured event for banner
const featuredEvent = ref(null)
const nextEventDate = ref(null)
const nextEventName = ref('Startup Connect Event')
const nextEventLocation = ref('Cotonou, Bénin')

// Modal de création de post
const showCreatePostModal = ref(false)
// Mobile sidebar toggle
const showMobileSidebar = ref(false)

// Load featured event for banner
const loadFeaturedEvent = async () => {
  try {
    const { data } = await eventsApi.getFeatured()
    const event = data.data

    if (event) {
      featuredEvent.value = event
      nextEventDate.value = new Date(event.date_event).getTime()
      nextEventName.value = event.title
      nextEventLocation.value = event.lieu || 'Cotonou, Bénin'
    } else {
      featuredEvent.value = null
      nextEventDate.value = null
    }
  } catch (error) {
    console.warn('Could not load featured event:', error.message)
    nextEventDate.value = null
  }
}

const loadData = async () => {
  if (!loading.value) {
    loading.value = true
  }

  try {
    console.log('=== Chargement des posts ===')
    // Charger les posts et l'événement featured en parallèle
    const [loadedPosts] = await Promise.all([
      postsStore.fetch({}, true),
      loadFeaturedEvent()
    ])
    console.log('Posts chargés:', loadedPosts)
    posts.value = loadedPosts || []

    if (authStore.user?.startup_id) {
      startup.value = {
        name: authStore.user.name || 'Ma Startup',
        sector: authStore.user.secteur?.nom || 'Technologie',
        location: authStore.user.location || 'Cotonou',
        verified: true,
      }
    }

    candidaciesCount.value = 0
    groupMessages.value = []
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
    console.log('=== Chargement terminé, loading=false ===')
  }
}

const handlePostCreated = async (postData) => {
  try {
    console.log('=== DEBUG POST CREATION ===')
    console.log('authStore.user:', authStore.user)
    console.log('startup_id:', authStore.user?.startup_id)

    if (authStore.user?.startup_id) {
      postData.append('startup_id', authStore.user.startup_id)
      console.log('startup_id ajouté au FormData:', authStore.user.startup_id)
    } else {
      console.error('User data:', authStore.user)
      alert(
        "Impossible de créer le post : vous devez être membre d'une startup.\n\nVeuillez vous reconnecter ou finaliser votre inscription.",
      )
      return
    }

    console.log('=== Contenu du FormData ===')
    for (let [key, value] of postData.entries()) {
      console.log(`${key}:`, value)
    }

    await postsStore.createPost(postData)
    await loadData()
  } catch (error) {
    console.error('Error creating post:', error)

    let errorMessage = 'Erreur lors de la création du post'

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors || {}
      console.log('Validation Errors:', errors)
      const firstError = Object.values(errors)[0]
      errorMessage = Array.isArray(firstError)
        ? firstError[0]
        : error.response?.data?.message || errorMessage
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    alert(errorMessage)
  }
}

const handleEditPost = async (updatedPost) => {
  try {
    console.log('=== DEBUG POST UPDATE ===')
    console.log('Updated post data:', updatedPost)

    // Construire le payload pour la mise à jour
    const payload = {
      title: updatedPost.title,
      content: updatedPost.content,
    }

    // Si des nouvelles images sont présentes (fichiers), les ajouter
    if (updatedPost.images && updatedPost.images.length > 0) {
      payload.images = updatedPost.images
    }

    // Ajouter les IDs des images existantes à conserver
    if (updatedPost.existing_images && updatedPost.existing_images.length > 0) {
      payload.existing_images = updatedPost.existing_images
    }

    console.log('Payload envoyé:', payload)

    await postsStore.updatePost(updatedPost.id, payload)
    await loadData()
  } catch (error) {
    console.error('Error updating post:', error)

    let errorMessage = 'Erreur lors de la modification du post'

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors || {}
      console.log('Validation Errors:', errors)
      const allErrors = Object.entries(errors).map(([field, messages]) => {
        return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
      }).join('\n')
      errorMessage = allErrors || error.response?.data?.message || errorMessage
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    alert(errorMessage)
  }
}

const handleDeletePost = async (postId) => {
  if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return

  try {
    await postsStore.removePost(postId)
    posts.value = posts.value.filter((p) => p.id !== postId)
  } catch (error) {
    console.error('Error deleting post:', error)
    alert('Erreur lors de la suppression du post')
  }
}

const handleReportPost = async (postId) => {
  try {
    // TODO: Implémenter l'API de signalement quand disponible
    // Pour l'instant, on affiche un message de succès
    alert('Signalement envoyé. Merci !')
  } catch (error) {
    console.error('Error reporting post:', error)
  }
}

const handleCommentAdded = ({ postId, comment }) => {
  // Mise à jour locale du compteur de commentaires pour éviter un rechargement complet
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    if (!post.comments) post.comments = []
    // On ajoute le commentaire à la liste locale du post pour mettre à jour le compteur
    post.comments.push(comment)
  }
}

const handleCommentDeleted = ({ postId, commentId }) => {
  // Mise à jour locale du compteur de commentaires
  const post = posts.value.find((p) => p.id === postId)
  if (post && post.comments) {
    post.comments = post.comments.filter((c) => c.id !== commentId)
  }
}

onMounted(async () => {
  console.log('=== onMounted APPELÉ ===')

  loading.value = true

  try {
    console.log('=== StartuperHomePage - Chargement initial ===')

    console.log('User actuel:', authStore.user)
    console.log('startup_id:', authStore.user?.startup_id)

    if (authStore.isAuthenticated && !authStore.user?.startup_id) {
      console.log('Rechargement du profil (startup_id manquant)...')
      await authStore.fetchMe()
    }

    await loadData()
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  } finally {
    loading.value = false
    console.log('=== onMounted terminé, loading forcé à false ===')
    console.log('État final loading:', loading.value)
  }
})
</script>
