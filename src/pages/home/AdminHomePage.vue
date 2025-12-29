<template>
  <div class="min-h-screen">
    <EventBanner
      v-if="featuredEvent"
      :eventId="featuredEvent.id"
      :eventDate="nextEventDate"
      :eventName="nextEventName"
      :eventLocation="nextEventLocation"
      :eventImage="featuredEvent.image || featuredEvent.banner || featuredEvent.cover || featuredEvent.image_url || featuredEvent.banner_url || featuredEvent.cover_url || featuredEvent.photo || (featuredEvent.photos && featuredEvent.photos[0]) || ''"
      :isLoading="loading"
    />
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Mobile: Bouton pour afficher/masquer la sidebar -->
      <div class="lg:hidden flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-neutral-900">Administration</h2>
        <button @click="showMobileSidebar = !showMobileSidebar"
          class="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          <Icon :name="showMobileSidebar ? 'X' : 'LayoutGrid'" :size="16" />
          {{ showMobileSidebar ? 'Masquer' : 'Plus' }}
        </button>
      </div>

      <!-- Mobile Sidebar Drawer -->
      <div v-if="showMobileSidebar"
        class="lg:hidden space-y-4 mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <!-- <EventCountdown :event-date="nextEventDate" :isLoading="loading" /> -->
        <div class="grid grid-cols-2 gap-2">
          <router-link to="/admin/moderation">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2 relative">
              <Icon name="AlertCircle" :size="14" class="text-red-600" />
              <span class="text-xs">Modération</span>
              <Badge v-if="stats.pendingReports > 0" color="red" size="xs" class="absolute -top-1 -right-1">{{
                stats.pendingReports }}</Badge>
            </Button>
          </router-link>
          <router-link to="/admin/rccm-validation">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2 relative">
              <Icon name="FileText" :size="14" class="text-orange-600" />
              <span class="text-xs">Validation</span>
              <Badge v-if="stats.pendingValidations > 0" color="orange" size="xs" class="absolute -top-1 -right-1">{{
                stats.pendingValidations }}</Badge>
            </Button>
          </router-link>
          <router-link to="/admin/users">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2">
              <Icon name="Users" :size="14" class="text-blue-600" />
              <span class="text-xs">Utilisateurs</span>
            </Button>
          </router-link>
          <router-link to="/admin/startups">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2">
              <Icon name="Building2" :size="14" class="text-emerald-600" />
              <span class="text-xs">Startups</span>
            </Button>
          </router-link>
          <router-link to="/admin/dashboard">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2">
              <Icon name="BarChart2" :size="14" class="text-green-600" />
              <span class="text-xs">Dashboard</span>
            </Button>
          </router-link>
          <router-link to="/admin/logs">
            <Button variant="outline" size="sm" class="w-full justify-start gap-2">
              <Icon name="List" :size="14" class="text-purple-600" />
              <span class="text-xs">Logs</span>
            </Button>
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <!-- Feed Section -->
        <div class="lg:col-span-2 space-y-4 md:space-y-6">
          <!-- Bouton Créer une annonce -->
          <Button variant="gradient" size="lg" class="w-full justify-center gap-2 md:gap-3 text-sm md:text-base"
            @click="showCreatePostModal = true">
            <Icon name="Megaphone" :size="18" />
            <span class="hidden sm:inline">Publier une annonce officielle</span>
            <span class="sm:hidden">Publier</span>
          </Button>

          <!-- Loading Skeleton -->
          <div v-if="loading" class="space-y-6">
            <PostSkeleton v-for="i in 3" :key="i" :with-image="i === 1" />
          </div>

          <!-- Posts Feed -->
          <div v-else-if="posts.length > 0" class="space-y-6">
            <PostCard v-for="post in posts" :key="post.id" :post="post" @edit="handleEditPost"
              @delete="handleDeletePost" @report="handleReportPost" @comment-added="handleCommentAdded"
              @comment-deleted="handleCommentDeleted" />
          </div>

          <!-- Empty State -->
          <Card v-else class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="Megaphone" :size="32" class="text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 mb-2">
              Aucune annonce pour le moment
            </h3>
            <p class="text-neutral-600 max-w-md mx-auto">
              Publiez des annonces officielles pour informer la communauté Startup Connect.
            </p>
          </Card>
        </div>

        <!-- Sidebar - Hidden on mobile, sticky on desktop -->
        <aside
          class="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          <!-- Event Countdown -->
          <!-- <EventCountdown :event-date="nextEventDate" :isLoading="loading" /> -->

          <!-- Quick Actions -->
          <Card>
            <template #header>
              <h3 class="text-lg font-semibold text-neutral-900">Actions rapides</h3>
            </template>

            <nav class="space-y-1">
              <router-link to="/admin/moderation"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors relative">
                  <Icon name="AlertCircle" :size="20" class="text-red-600" />
                  <span v-if="stats.pendingReports > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {{ stats.pendingReports }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Modération</p>
                  <p class="text-sm text-neutral-500">File des signalements</p>
                </div>
              </router-link>

              <router-link to="/admin/rccm-validation"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors relative">
                  <Icon name="FileText" :size="20" class="text-orange-600" />
                  <span v-if="stats.pendingValidations > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center">
                    {{ stats.pendingValidations }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Validation RCCM</p>
                  <p class="text-sm text-neutral-500">Vérifier les startups</p>
                </div>
              </router-link>

              <router-link to="/admin/users"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Icon name="Users" :size="20" class="text-blue-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Utilisateurs</p>
                  <p class="text-sm text-neutral-500">{{ stats.totalUsers }} inscrits</p>
                </div>
              </router-link>

              <router-link to="/admin/startups"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-brand-secondary-100 flex items-center justify-center group-hover:bg-brand-secondary-200 transition-colors">
                  <Icon name="Building2" :size="20" class="text-brand-secondary-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Startups</p>
                  <p class="text-sm text-neutral-500">{{ stats.totalStartups }} enregistrées</p>
                </div>
              </router-link>

              <router-link to="/offers"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Icon name="Briefcase" :size="20" class="text-yellow-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Opportunités</p>
                  <p class="text-sm text-neutral-500">{{ stats.totalOffers }} publiées</p>
                </div>
              </router-link>

              <router-link to="/admin/dashboard"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-theme-success-light flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Icon name="BarChart2" :size="20" class="text-theme-success" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Statistiques</p>
                  <p class="text-sm text-neutral-500">Tableau de bord</p>
                </div>
              </router-link>

              <router-link to="/admin/logs"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Icon name="List" :size="20" class="text-purple-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Logs d'activité</p>
                  <p class="text-sm text-neutral-500">Historique système</p>
                </div>
              </router-link>

              <router-link to="/events/create"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Icon name="Calendar" :size="20" class="text-pink-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Créer un événement</p>
                  <p class="text-sm text-neutral-500">Startup Connect</p>
                </div>
              </router-link>

              <button @click="showEventModal = true"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group text-left w-full">
                <div
                  class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Icon name="Clock" :size="20" class="text-teal-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Définir prochain événement</p>
                  <p class="text-sm text-neutral-500">Synchroniser décompte</p>
                </div>
              </button>
            </nav>
          </Card>

          <!-- Recent Activity -->
          <!-- <Card>
            <template #header>
              <h3 class="text-lg font-semibold text-neutral-900">Activité récente</h3>
            </template>

            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" :class="activity.color"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-neutral-900">{{ activity.message }}</p>
                  <p class="text-xs text-neutral-500 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </Card> -->

          <!-- Platform Stats Summary -->
          <Card class="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-blue-700">{{ stats.totalUsers }}</p>
                <p class="text-xs text-blue-600">Utilisateurs</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-blue-700">{{ stats.totalGroups }}</p>
                <p class="text-xs text-blue-600">Groupes</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>

    <!-- Modale de gestion d'événement -->
    <div v-if="showEventModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showEventModal = false">
      <Card class="w-full max-w-md">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900">Définir le prochain événement</h3>
            <button @click="showEventModal = false" class="text-neutral-400 hover:text-neutral-600">
              <Icon name="X" :size="20" />
            </button>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-neutral-600">
            Définissez la date du prochain événement Startup Connect. Tous les utilisateurs verront
            le même décompte synchronisé.
          </p>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Date de l'événement</label>
            <input v-model="eventFormDate" type="datetime-local"
              class="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-theme-300 focus:border-theme-300 outline-none" />
          </div>

          <div class="flex justify-between gap-3">
            <button @click="clearEventDate"
              class="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
              Annuler l'événement
            </button>
            <button @click="setEventDate" :disabled="!eventFormDate"
              class="flex-1 px-4 py-2 bg-theme-600 text-white rounded-lg hover:bg-theme-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Enregistrer
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>

  <!-- Modal de création de post -->
  <CreatePostModal :is-open="showCreatePostModal" :organization-name="'ADPME'" @close="showCreatePostModal = false"
    @post-created="handlePostCreated" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { Card, Button, Icon } from '@/components/ui'
import { PostCard } from '@/components/feed'
import EventBanner from '../../components/feed/EventBanner.vue'
import PostSkeleton from '@/components/skeletons/PostSkeleton.vue'
import CreatePostModal from '@/components/modals/CreatePostModal.vue'
import adminApi from '@/services/admin'
import usersApi from '@/services/users'
import eventsApi from '@/services/events'

const authStore = useAuthStore()
const postsStore = usePostsStore()

const users = ref([])
const startups = ref([])
const offers = ref([])
const groups = ref([])
const reports = ref([])
const pendingStartups = ref([])
const loading = ref(true)
const posts = ref([])
const kpis = ref(null)

// Event/Banner data
const featuredEvent = ref(null)
const nextEventDate = ref(null)
const nextEventName = ref('Startup Connect Event')
const nextEventLocation = ref('Cotonou, Bénin')

const showEventModal = ref(false)
const showCreatePostModal = ref(false)
const showMobileSidebar = ref(false)

// Computed
const currentUserId = computed(() => authStore.user?.id)

const stats = computed(() => ({
  totalUsers: kpis.value?.total_users || users.value.length || 0,
  totalStartups: kpis.value?.total_startups || startups.value.length || 0,
  totalOffers: kpis.value?.total_offers || offers.value.length || 0,
  totalGroups: kpis.value?.total_groups || groups.value.length || 0,
  pendingReports: kpis.value?.pending_reports || reports.value.length || 0,
  pendingValidations: kpis.value?.pending_validations || pendingStartups.value.length || 0,
  activeUsers: kpis.value?.active_users || users.value.filter((u) => u.emailVerified).length || 0,
}))

const handlePostCreated = async (postData) => {
  try {
    await postsStore.createPost(postData)
    await loadPosts()
  } catch (error) {
    console.error('Error creating post:', error)
    alert('Erreur lors de la création du post')
  }
}

const handleEditPost = async (updatedPost) => {
  try {
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

    await postsStore.updatePost(updatedPost.id, payload)
    await loadPosts()
  } catch (error) {
    console.error('Error updating post:', error)
    alert('Erreur lors de la modification du post')
  }
}

const handleDeletePost = async (postId) => {
  if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return

  try {
    await postsStore.removePost(postId)
    posts.value = posts.value.filter((p) => p.id !== postId)
  } catch (error) {
    console.error('Error deleting post:', error)
  }
}

const handleReportPost = (postId) => {
  console.log('Post reported:', postId)
}

const handleCommentAdded = ({ postId, comment }) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    if (!post.comments) post.comments = []
    post.comments.push(comment)
  }
}

const handleCommentDeleted = ({ postId, commentId }) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post && post.comments) {
    post.comments = post.comments.filter((c) => c.id !== commentId)
  }
}

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
  }
}

const loadPosts = async () => {
  try {
    const loadedPosts = await postsStore.fetch({}, true)
    posts.value = loadedPosts || []
  } catch (error) {
    console.error('Error loading posts:', error)
  }
}

const loadAdminStats = async () => {
  try {
    const { data } = await adminApi.getKpis()
    kpis.value = data.data || data
  } catch (error) {
    console.warn('Admin KPIs endpoint not available, using fallback:', error.message)
    try {
      const { data } = await usersApi.list()
      const allUsers = data.data || data || []
      kpis.value = {
        total_users: allUsers.length,
        active_users: allUsers.filter((u) => u.email_verified_at).length,
      }
    } catch (e) {
      console.warn('Could not load users for stats:', e.message)
    }
  }
}

const loadReports = async () => {
  try {
    const { data } = await adminApi.getReports({ status: 'pending' })
    reports.value = data.data || data || []
  } catch (error) {
    console.warn('Reports endpoint not available:', error.message)
  }
}

const loadPendingStartups = async () => {
  try {
    const { data } = await adminApi.getStartups({ status: 'pending' })
    pendingStartups.value = data.data || data || []
  } catch (error) {
    console.warn('Pending startups endpoint not available:', error.message)
  }
}

const loadData = async () => {
  loading.value = true

  try {
    // Charger les posts, stats admin et événement featured en parallèle
    await Promise.all([
      loadPosts(),
      loadAdminStats(),
      loadReports(),
      loadPendingStartups(),
      loadFeaturedEvent()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
