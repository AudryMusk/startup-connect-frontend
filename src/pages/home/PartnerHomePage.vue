<template>
  <div class="min-h-screen">
    <EventBanner
      v-if="featuredEvent"
      :eventId="featuredEvent.id"
      :eventDate="nextEventDate"
      :eventName="nextEventName"
      :eventLocation="nextEventLocation"
      :isLoading="loading"
    />
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Mobile: Bouton pour afficher/masquer la sidebar -->

      <div class="lg:hidden flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-neutral-900">Fil d'actualité</h2>
        <button @click="showMobileSidebar = !showMobileSidebar"
          class="flex items-center gap-2 px-3 py-2 bg-brand-primary-50 text-brand-primary-700 rounded-lg text-sm font-medium">
          <Icon :name="showMobileSidebar ? 'X' : 'LayoutGrid'" :size="16" />
          {{ showMobileSidebar ? 'Masquer' : 'Plus' }}
        </button>
      </div>

      <!-- Mobile Sidebar Drawer -->
      <transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 transform -translate-y-4" enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-4">
        <div v-if="showMobileSidebar" class="lg:hidden mb-6 overflow-hidden">
          <!-- Header du drawer -->
          <div class="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 p-4 rounded-t-2xl">
            <h3 class="text-white font-bold text-lg flex items-center gap-2">
              <Icon name="LayoutGrid" :size="20" />
              Actions rapides
            </h3>
            <p class="text-brand-primary-100 text-sm mt-1">Gérez vos opportunités</p>
          </div>

          <!-- Contenu du drawer -->
          <div class="bg-white rounded-b-2xl shadow-xl border-x border-b border-neutral-200 p-4 space-y-2">
            <router-link to="/partner/offers/create"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-brand-primary-50 hover:to-brand-primary-100 transition-all duration-200 group border border-transparent hover:border-brand-primary-200">
              <div
                class="w-10 h-10 rounded-xl bg-brand-primary-100 flex items-center justify-center group-hover:bg-brand-primary-200 group-hover:scale-110 transition-all duration-200">
                <Icon name="Plus" :size="18" class="text-brand-primary-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 text-sm">Publier une opportunité</p>
                <p class="text-xs text-neutral-500">Créer une nouvelle offre</p>
              </div>
              <Icon name="ChevronRight" :size="16"
                class="text-neutral-400 group-hover:text-brand-primary-600 transition-colors" />
            </router-link>

            <router-link to="/partner/offers"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 group border border-transparent hover:border-green-200">
              <div
                class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200">
                <Icon name="Briefcase" :size="18" class="text-green-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 text-sm">Mes opportunités</p>
                <p class="text-xs text-neutral-500">{{ stats.activeOffers }} offres actives</p>
              </div>
              <Icon name="ChevronRight" :size="16"
                class="text-neutral-400 group-hover:text-green-600 transition-colors" />
            </router-link>

            <router-link to="/partner/applications"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group border border-transparent hover:border-blue-200">
              <div
                class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-200">
                <Icon name="Users" :size="18" class="text-blue-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 text-sm">Candidatures reçues</p>
                <p class="text-xs text-neutral-500">{{ stats.pendingApplications }} en attente</p>
              </div>
              <Icon name="ChevronRight" :size="16"
                class="text-neutral-400 group-hover:text-blue-600 transition-colors" />
            </router-link>

            <router-link to="/partner/stats"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 group border border-transparent hover:border-amber-200">
              <div
                class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 group-hover:scale-110 transition-all duration-200">
                <Icon name="BarChart2" :size="18" class="text-amber-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 text-sm">Statistiques</p>
                <p class="text-xs text-neutral-500">Performances</p>
              </div>
              <Icon name="ChevronRight" :size="16"
                class="text-neutral-400 group-hover:text-amber-600 transition-colors" />
            </router-link>

            <router-link to="/startups"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 group border border-transparent hover:border-purple-200">
              <div
                class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200">
                <Icon name="Building2" :size="18" class="text-purple-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 text-sm">Découvrir startups</p>
                <p class="text-xs text-neutral-500">Trouver des talents</p>
              </div>
              <Icon name="ChevronRight" :size="16"
                class="text-neutral-400 group-hover:text-purple-600 transition-colors" />
            </router-link>
          </div>
        </div>
      </transition>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <!-- Feed Section -->
        <div class="lg:col-span-2 space-y-4 md:space-y-6">
          <!-- Bouton Créer un post -->
          <Button variant="gradient" size="lg" class="w-full justify-center gap-2 md:gap-3 text-sm md:text-base"
            @click="showCreatePostModal = true">
            <Icon name="Plus" :size="18" />
            <span class="hidden sm:inline">Publier une actualité</span>
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
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary-100 flex items-center justify-center">
              <Icon name="FileText" :size="32" class="text-brand-primary-600" />
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 mb-2">
              Aucune publication pour le moment
            </h3>
            <p class="text-neutral-600 max-w-md mx-auto">
              Soyez le premier à partager une actualité avec la communauté Startup Connect !
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
              <router-link to="/partner/offers/create"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-brand-primary-100 flex items-center justify-center group-hover:bg-brand-primary-200 transition-colors">
                  <Icon name="Plus" :size="20" class="text-brand-primary-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Publier une opportunité</p>
                  <p class="text-sm text-neutral-500">Créer une nouvelle offre</p>
                </div>
              </router-link>

              <router-link to="/partner/offers"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-theme-success-light flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Icon name="Briefcase" :size="20" class="text-theme-success" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Mes opportunités</p>
                  <p class="text-sm text-neutral-500">{{ stats.activeOffers }} offres actives</p>
                </div>
              </router-link>

              <router-link to="/partner/applications"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-theme-info-light flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Icon name="Users" :size="20" class="text-theme-info" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Candidatures reçues</p>
                  <p class="text-sm text-neutral-500">{{ stats.pendingApplications }} en attente</p>
                </div>
              </router-link>

              <router-link to="/partner/stats"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-theme-warning-light flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Icon name="BarChart2" :size="20" class="text-theme-warning" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Statistiques</p>
                  <p class="text-sm text-neutral-500">Voir les performances</p>
                </div>
              </router-link>

              <router-link to="/groups"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Icon name="UsersGroup" :size="20" class="text-purple-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Créer un groupe</p>
                  <p class="text-sm text-neutral-500">Fédérer une communauté</p>
                </div>
              </router-link>

              <router-link to="/messages"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Icon name="MessageSquare" :size="20" class="text-pink-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Messages</p>
                  <p class="text-sm text-neutral-500">{{ unreadMessages }} non lus</p>
                </div>
              </router-link>

              <router-link to="/startups"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Icon name="Search" :size="20" class="text-teal-600" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900">Découvrir startups</p>
                  <p class="text-sm text-neutral-500">Trouver des talents</p>
                </div>
              </router-link>
            </nav>
          </Card>

          <!-- Recommended Startups -->
          <Card v-if="recommendedStartups.length > 0">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Startups recommandées</h3>
                <router-link to="/startups"
                  class="text-sm text-brand-primary-600 hover:text-brand-primary-700 font-medium">
                  Voir tout
                </router-link>
              </div>
            </template>

            <div class="space-y-4">
              <div v-for="startup in recommendedStartups.slice(0, 4)" :key="startup.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                @click="$router.push(`/startups/${startup.id}`)">
                <div
                  class="h-12 w-12 rounded-lg bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-600 flex items-center justify-center text-white font-bold">
                  {{ startup.nom?.charAt(0) || 'S' }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-neutral-900 truncate">{{ startup.nom }}</h4>
                  <p class="text-sm text-neutral-500 truncate">{{ startup.secteur }}</p>
                </div>
                <Badge v-if="startup.verified" variant="success" size="sm"> Vérifié </Badge>
              </div>
            </div>
          </Card>

          <!-- Quick Stats Summary -->
          <Card class="bg-gradient-to-br from-brand-primary-50 to-brand-primary-100 border-brand-primary-200">
            <div class="text-center">
              <div class="text-3xl font-bold text-brand-primary-700">{{ stats.totalViews }}</div>
              <p class="text-sm text-brand-primary-600 mt-1">Vues ce mois</p>
              <div class="mt-3 pt-3 border-t border-brand-primary-200">
                <p class="text-sm text-brand-primary-700">
                  <span class="font-semibold">{{ stats.responseRate }}%</span> taux de réponse
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  </div>

  <!-- Modal de création de post -->
  <CreatePostModal :is-open="showCreatePostModal"
    :organization-name="organization?.name || authStore.user?.name || 'Partenaire'" @close="showCreatePostModal = false"
    @post-created="handlePostCreated" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { Card, Button, Badge, Icon } from '@/components/ui'
import { PostCard, EventCountdown } from '@/components/feed'
import EventBanner from '../../components/feed/EventBanner.vue'
import PostSkeleton from '@/components/skeletons/PostSkeleton.vue'
import CreatePostModal from '@/components/modals/CreatePostModal.vue'
import organizationsApi from '@/services/organizations'
import eventsApi from '@/services/events'

const authStore = useAuthStore()
const postsStore = usePostsStore()

const organization = ref(null)
const organizationMembers = ref([])
const recommendedStartups = ref([])
const unreadMessages = ref(0)
const loading = ref(true)
const posts = ref([])
const showCreatePostModal = ref(false)
const showMobileSidebar = ref(false)

// Event/Banner data
const featuredEvent = ref(null)
const nextEventDate = ref(null)
const nextEventName = ref('Startup Connect Event')
const nextEventLocation = ref('Cotonou, Bénin')

const currentUserId = computed(() => authStore.user?.id)

// Organisation ID depuis l'utilisateur connecté
const userOrganizationId = computed(() => authStore.user?.organization_id)

const stats = computed(() => ({
  activeOffers: organization.value?.offers_count || 0,
  pendingApplications: organization.value?.pending_applications_count || 0,
  totalViews: organization.value?.views_count || 0,
  responseRate: organization.value?.response_rate || 85,
  membersCount: organization.value?.members_count || organizationMembers.value.length || 0,
}))

const loadOrganization = async () => {
  // Essayer de charger l'organisation de l'utilisateur
  if (userOrganizationId.value) {
    try {
      const { data } = await organizationsApi.getById(userOrganizationId.value)
      organization.value = data.data || data

      // Charger les membres
      const membersResponse = await organizationsApi.getMembers(userOrganizationId.value)
      organizationMembers.value = membersResponse.data?.members || []
    } catch (error) {
      console.error('Error loading organization:', error)
      // Fallback to basic info from user
      organization.value = {
        id: userOrganizationId.value,
        name: authStore.user?.organization_name || authStore.user?.name || 'Mon Organisation',
      }
    }
  } else {
    // L'utilisateur n'a pas d'organisation - afficher info de base
    organization.value = {
      id: null,
      name: authStore.user?.name || 'Partenaire',
    }
  }
}

const handlePostCreated = async (postData) => {
  try {
    // Ajouter organization_id si partenaire a une organisation
    if (organization.value?.id) {
      postData.append('organization_id', organization.value.id)
    }

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
  alert('Signalement envoyé. Merci !')
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

// Load data
onMounted(async () => {
  loading.value = true

  try {
    // Charger les posts, l'organisation et l'événement à la une en parallèle
    await Promise.all([loadPosts(), loadOrganization(), loadFeaturedEvent()])

    // Mock data pour startups recommandées - TODO: API endpoint
    recommendedStartups.value = [
      { id: 1, nom: 'InnoTech', secteur: 'Intelligence Artificielle', verified: true },
      { id: 2, nom: 'GreenStart', secteur: 'Développement Durable', verified: true },
      { id: 3, nom: 'FinanceHub', secteur: 'FinTech', verified: false },
      { id: 4, nom: 'HealthPlus', secteur: 'Santé', verified: true },
    ]

    unreadMessages.value = 3
  } catch (error) {
    console.error('Error loading partner data:', error)
  } finally {
    loading.value = false
  }
})
</script>
