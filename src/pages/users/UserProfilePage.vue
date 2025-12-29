<template>
  <div class="min-h-screen pb-12">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <UserProfileSkeleton />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-12">
      <EmptyState title="Profil introuvable"
        description="L'utilisateur que vous recherchez n'existe pas ou a été supprimé">
        <template #icon>
          <Icon name="UserX" :size="48" />
        </template>
        <template #actions>
          <Button @click="$router.back()">
            <Icon name="ArrowLeft" :size="18" class="mr-2" />
            Retour
          </Button>
        </template>
      </EmptyState>
    </div>

    <!-- Profile Content -->
    <div v-else class="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <!-- Cover Image -->
      <div
        class="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-theme-400 via-theme-500 to-theme-600 rounded-t-xl sm:rounded-t-2xl -mx-3 sm:mx-0">
        <!-- <div class="absolute inset-0 bg-black/10"></div> -->
      </div>

      <!-- Header Card -->
      <Card class="-mt-16 sm:-mt-20 mb-4 sm:mb-6 relative">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0 -mt-8 sm:-mt-12">
            <div v-if="user.photo"
              class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
              <img :src="getImageUrl(user.photo)" :alt="user.name" class="w-full h-full object-cover" />
            </div>
            <div v-else
              class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-theme-400 to-theme-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl ring-4 ring-white shadow-xl">
              {{ user.name?.[0]?.toUpperCase() }}
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 pt-0 sm:pt-2">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div class="min-w-0">
                <h1 class="text-2xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2 sm:mb-3 break-words">{{
                  user.name
                }}</h1>
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge :color="user.role === 'startuper' ? 'purple' : 'blue'" size="sm"
                    class="text-[10px] sm:text-xs">
                    <Icon :name="user.role === 'startuper' ? 'Rocket' : 'Building2'" :size="12"
                      class="mr-1 sm:hidden" />
                    <Icon :name="user.role === 'startuper' ? 'Rocket' : 'Building2'" :size="14"
                      class="mr-1 hidden sm:inline" />
                    {{ getRoleLabel(user.role) }}
                  </Badge>
                  <Badge v-if="user.status" :color="user.status === 'active' ? 'green' : 'gray'" size="sm"
                    class="text-[10px] sm:text-xs">
                    <Icon name="Circle" :size="8" class="mr-1 sm:hidden"
                      :class="user.status === 'active' ? 'fill-current' : ''" />
                    <Icon name="Circle" :size="10" class="mr-1 hidden sm:inline"
                      :class="user.status === 'active' ? 'fill-current' : ''" />
                    {{ user.status === 'active' ? 'Actif' : 'Inactif' }}
                  </Badge>
                  <Badge v-if="user.secteur" color="theme" variant="outline" size="sm" class="text-[10px] sm:text-xs">
                    <Icon name="Briefcase" :size="12" class="mr-1 sm:hidden" />
                    <Icon name="Briefcase" :size="14" class="mr-1 hidden sm:inline" />
                    {{ user.secteur.nom || user.secteur }}
                  </Badge>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 flex-shrink-0">
                <Button v-if="!isOwnProfile" variant="gradient" size="sm" class="text-xs sm:text-sm"
                  @click="sendMessage">
                  <Icon name="MessageCircle" :size="16" class="sm:hidden" />
                  <Icon name="MessageCircle" :size="18" class="hidden sm:inline" />
                  <span class="hidden xs:inline">Message</span>
                </Button>
                <Button v-else variant="outline" size="sm" class="text-xs sm:text-sm"
                  @click="$router.push('/profile/edit')">
                  <Icon name="Edit" :size="16" class="sm:hidden" />
                  <Icon name="Edit" :size="18" class="hidden sm:inline" />
                  <span class="hidden xs:inline">Modifier</span>
                </Button>
              </div>
            </div>

            <!-- Bio/Description (visible par tous) -->
            <div v-if="user.bio" class="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p class="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{{ user.bio }}</p>
            </div>

            <!-- Contact Info Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div v-if="user.email"
                class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 bg-theme-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Mail" :size="16" class="text-theme-600 sm:hidden" />
                  <Icon name="Mail" :size="18" class="text-theme-600 hidden sm:inline" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] sm:text-xs text-gray-500 font-medium">Email</p>
                  <a :href="`mailto:${user.email}`"
                    class="text-xs sm:text-sm text-gray-900 hover:text-theme transition truncate block">{{ user.email
                    }}</a>
                </div>
              </div>

              <!-- Téléphone visible uniquement pour le propriétaire -->
              <div v-if="isOwnProfile && user.phone"
                class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50 rounded-lg">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" :size="16" class="text-amber-600 sm:hidden" />
                  <Icon name="Phone" :size="18" class="text-amber-600 hidden sm:inline" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] sm:text-xs text-amber-600 font-medium flex items-center gap-1">
                    <Icon name="Lock" :size="8" class="sm:hidden" />
                    <Icon name="Lock" :size="10" class="hidden sm:inline" />
                    Téléphone (privé)
                  </p>
                  <p class="text-xs sm:text-sm text-gray-900 truncate">{{ user.phone }}</p>
                </div>
              </div>

              <!-- Localisation visible par tous -->
              <div v-if="user.location" class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" :size="16" class="text-blue-600 sm:hidden" />
                  <Icon name="MapPin" :size="18" class="text-blue-600 hidden sm:inline" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] sm:text-xs text-gray-500 font-medium">Localisation</p>
                  <p class="text-xs sm:text-sm text-gray-900 truncate">{{ user.location }}</p>
                </div>
              </div>
            </div>

            <!-- Compétences (visible si présent) -->
            <div v-if="user.skills && user.skills.length > 0"
              class="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-br from-theme-50 to-purple-50 rounded-xl">
              <div class="flex items-center gap-2 mb-2 sm:mb-3">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                  <Icon name="Award" :size="14" class="text-theme-600 sm:hidden" />
                  <Icon name="Award" :size="16" class="text-theme-600 hidden sm:inline" />
                </div>
                <h3 class="text-xs sm:text-sm font-bold text-gray-900">Compétences</h3>
              </div>
              <div class="flex flex-wrap gap-1.5 sm:gap-2">
                <span v-for="(skill, index) in user.skills" :key="index"
                  class="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white text-theme-700 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-default">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerte: Startup non configurée (pour le propriétaire du profil uniquement) -->
        <div v-if="isOwnProfile && user.role === 'startuper' && !user.startup && !user.startup_id"
          class="mt-6 pt-6 border-t-2 border-gray-100">
          <div class="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex-shrink-0">
                <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Icon name="AlertTriangle" :size="28" class="text-amber-600" />
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-amber-800 mb-1">Finalisez votre profil startup</h3>
                <p class="text-amber-700 text-sm">
                  Vous n'avez pas encore associé de startup à votre compte.
                  Créez ou rejoignez une startup pour accéder à toutes les fonctionnalités.
                </p>
                <div v-if="isJoinRequested" class="mt-2">
                  <Badge color="yellow" size="sm">Demande d'adhésion en attente</Badge>
                </div>
              </div>
              <Button variant="gradient" @click="goToOnboarding" class="flex-shrink-0">
                <Icon name="Rocket" :size="18" class="mr-2" />
                Configurer ma startup
              </Button>
            </div>
          </div>
        </div>

        <!-- Startup Info (for startuppers) -->
        <div v-if="user.role === 'startuper' && user.startup" class="mt-6 pt-6 border-t-2 border-gray-100">
          <div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all">
            <div class="flex items-center gap-4">
              <div v-if="user.startup.logo" class="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                <img :src="getImageUrl(user.startup.logo)" :alt="user.startup.name"
                  class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl ring-2 ring-white shadow-md">
                {{ user.startup.name?.[0]?.toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="Rocket" :size="16" class="text-blue-600" />
                  <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Startup</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900">{{ user.startup.name || user.startup.nom }}</h3>
                <p v-if="user.startup.sector" class="text-sm text-gray-600">{{ user.startup.sector }}</p>
              </div>
              <Button variant="gradient" size="md" @click="viewStartup" class="flex-shrink-0">
                Voir la startup
                <Icon name="ArrowRight" :size="16" class="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Organization Info (for partners) -->
        <div v-if="user.role === 'partenaire' && primaryOrganization" class="mt-6 pt-6 border-t-2 border-gray-100">
          <div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all">
            <div class="flex items-center gap-4">
              <div v-if="primaryOrganization.logo_url"
                class="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                <img :src="getImageUrl(primaryOrganization.logo_url)" :alt="primaryOrganization.name"
                  class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl ring-2 ring-white shadow-md">
                {{ primaryOrganization.name?.[0]?.toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="Building2" :size="16" class="text-blue-600" />
                  <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Organisation</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900">{{ primaryOrganization.name }}</h3>
                <p v-if="primaryOrganization.description" class="text-sm text-gray-600 line-clamp-1">{{
                  primaryOrganization.description }}</p>
              </div>
              <Button variant="gradient" size="md" @click="viewOrganization" class="flex-shrink-0">
                Voir l'organisation
                <Icon name="ArrowRight" :size="16" class="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- User Startups (for startuppers - show all startups where user is member/creator) -->
      <Card v-if="user.role === 'startuper' && userStartups.length > 0" class="mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon name="Rocket" :size="20" class="text-purple-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Startups</h2>
            <p class="text-sm text-gray-500">{{ userStartups.length }} startup{{ userStartups.length > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="startup in userStartups" :key="startup.id"
            class="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl hover:shadow-lg transition-all cursor-pointer"
            @click="router.push(`/startups/${startup.id}`)">
            <div class="flex items-center gap-4">
              <div v-if="startup.logo"
                class="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-white shadow-md flex-shrink-0">
                <img :src="getImageUrl(startup.logo)" :alt="startup.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow-md flex-shrink-0">
                {{ startup.name?.[0]?.toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 truncate">{{ startup.name }}</h3>
                <p v-if="startup.sector || startup.secteur" class="text-xs text-gray-600 truncate">{{ startup.sector ||
                  startup.secteur }}</p>
                <p v-if="startup.position || startup.title" class="text-xs text-purple-600 font-medium mt-0.5">
                  {{ startup.position || '' }}{{ startup.position && startup.title ? ' - ' : '' }}{{ startup.title || '' }}
                </p>
                <div class="flex gap-1 mt-1">
                  <Badge v-if="startup.pivot?.role === 'creator' || startup.role === 'creator'" color="purple" size="sm">
                    Créateur
                  </Badge>
                  <Badge v-else color="blue" size="sm">
                    Membre
                  </Badge>
                  <Badge v-if="startup.is_validated === false" color="yellow" size="sm">
                    En attente
                  </Badge>
                </div>
              </div>
              <Icon name="ArrowRight" :size="20" class="text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      </Card>

      <!-- User Offers (for partners - show published offers) -->
      <Card v-if="user.role === 'partenaire' && userOffers.length > 0" class="mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="Briefcase" :size="20" class="text-blue-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Offres publiées</h2>
            <p class="text-sm text-gray-500">{{ userOffers.length }} offre{{ userOffers.length > 1 ? 's' : '' }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="offer in userOffers" :key="offer.id"
            class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-blue-100"
            @click="router.push(`/offers/${offer.id}`)">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <Badge :color="offer.type === 'event' ? 'purple' : 'blue'" size="sm">
                    <Icon :name="offer.type === 'event' ? 'Calendar' : 'Briefcase'" :size="14" />
                    {{ offer.type === 'event' ? 'Événement' : 'Appel à projets' }}
                  </Badge>
                  <Badge v-if="offer.status === 'active'" color="green" size="sm">
                    Actif
                  </Badge>
                  <Badge v-else color="gray" size="sm">
                    {{ offer.status }}
                  </Badge>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ offer.title }}</h3>
                <p v-if="offer.description" class="text-sm text-gray-600 line-clamp-2 mb-2">{{ offer.description }}</p>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span v-if="offer.deadline" class="flex items-center gap-1">
                    <Icon name="Calendar" :size="12" />
                    {{ formatDate(offer.deadline) }}
                  </span>
                  <span v-if="offer.applications_count !== undefined" class="flex items-center gap-1">
                    <Icon name="Users" :size="12" />
                    {{ offer.applications_count }} candidature{{ offer.applications_count > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
              <Icon name="ArrowRight" :size="20" class="text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        <!-- Load More Offers -->
        <div v-if="hasMoreOffers" class="mt-6 text-center">
          <Button variant="outline" @click="loadMoreOffers" :disabled="loadingOffers">
            <LoadingSpinner v-if="loadingOffers" size="sm" class="mr-2" />
            Charger plus d'offres
          </Button>
        </div>
      </Card>

      <!-- User Posts -->
      <Card v-if="userPosts.length > 0">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-theme-100 rounded-xl flex items-center justify-center">
            <Icon name="FileText" :size="20" class="text-theme-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Publications</h2>
            <p class="text-sm text-gray-500">{{ userPosts.length }} publication{{ userPosts.length > 1 ? 's' : '' }}</p>
          </div>
        </div>

        <div class="space-y-6">
          <PostCard v-for="post in userPosts" :key="post.id" :post="post" @edit="handleEditPost"
            @delete="handleDeletePost" @report="handleReportPost" @comment-added="handleCommentAdded"
            @comment-deleted="handleCommentDeleted" />
        </div>

        <!-- Load More -->
        <div v-if="hasMorePosts" class="mt-6 text-center">
          <Button variant="outline" @click="loadMorePosts" :disabled="loadingPosts">
            <LoadingSpinner v-if="loadingPosts" size="sm" class="mr-2" />
            Charger plus
          </Button>
        </div>
      </Card>

      <!-- No Posts -->
      <Card v-else>
        <EmptyState title="Aucune publication"
          :description="`${isOwnProfile ? 'Vous n\'avez' : user.name + ' n\'a'} pas encore publié de contenu`">
          <template #icon>
            <Icon name="FileText" :size="40" />
          </template>
        </EmptyState>
      </Card>
    </div>
  </div>
</template>

<script setup>
import startupApi from '@/services/startup'
const isJoinRequested = ref(false)
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMessagesStore } from '@/stores/messagesStore'
import { usePostsStore } from '@/stores/postsStore'
import { useToast } from '@/composables/useToast'
import { Card, Button, Badge, EmptyState, LoadingSpinner, Icon } from '@/components/ui'
import PostCard from '@/components/feed/PostCard.vue'
import UserProfileSkeleton from '@/components/skeletons/UserProfileSkeleton.vue'
import usersApi from '@/services/users'
import offersApi from '@/services/offers'
import { getImageUrl } from '@/utils/imageUtils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const messagesStore = useMessagesStore()
const postsStore = usePostsStore()
const toast = useToast()

const user = ref(null)
const userPosts = ref([])
const userStartups = ref([])
const userOffers = ref([])
const loading = ref(true)
const loadingPosts = ref(false)
const loadingOffers = ref(false)
const error = ref(null)
const hasMorePosts = ref(false)
const hasMoreOffers = ref(false)
const postsPage = ref(1)
const offersPage = ref(1)

const userId = computed(() => parseInt(route.params.id))
const isOwnProfile = computed(() => {
  // Comparer avec l'ID backend si disponible, sinon avec uid
  return userId.value === (authStore.user?.id || authStore.user?.uid)
})

const primaryOrganization = computed(() => {
  if (!user.value) return null
  if (user.value.organization) return user.value.organization
  if (user.value.organizations && user.value.organizations.length > 0) {
    return user.value.organizations[0]
  }
  if (user.value.primary_organization) return user.value.primary_organization
  return null
})

const getRoleLabel = (role) => {
  const labels = {
    startuper: 'Startupper',
    partner: 'Partenaire',
    admin: 'Administrateur'
  }
  return labels[role] || role
}

async function loadUserProfile() {
  loading.value = true
  error.value = null

  try {
    // Si c'est son propre profil, utiliser authStore.user
    if (isOwnProfile.value) {
      // S'assurer qu'on a les données complètes
      if (!authStore.user?.id) {
        await authStore.fetchMe()
      }
      user.value = authStore.user
      // Vérifier s'il y a une demande d'adhésion en attente
      if (user.value.role === 'startuper' && !user.value.startup_id && !user.value.startup) {
        try {
          const { data: requests } = await startupApi.getMyJoinRequests()
          const pendingRequest = (requests.data || requests || []).find(
            (r) => r.status === 'pending',
          )
          isJoinRequested.value = !!pendingRequest
        } catch (err) {
          isJoinRequested.value = false
        }
      }
    } else {
      // Charger le profil d'un autre utilisateur
      const { data } = await usersApi.getById(userId.value)
      user.value = data.user || data.data || data
    }

    // Load user posts
    await loadUserPosts()

    // Load user startups if startuper
    if (user.value.role === 'startuper') {
      await loadUserStartups()
    }

    // Load user offers if partner
    if (user.value.role === 'partenaire') {
      await loadUserOffers()
    }
  } catch (err) {
    console.error('Error loading user profile:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
}

async function loadUserPosts() {
  loadingPosts.value = true

  try {
    // Filter posts by user_id
    const posts = await postsStore.fetch({ user_id: userId.value, page: postsPage.value })

    if (postsPage.value === 1) {
      userPosts.value = posts || []
    } else {
      userPosts.value.push(...(posts || []))
    }

    // Check if there are more posts (basic check - backend should return pagination info)
    hasMorePosts.value = posts && posts.length >= 10
  } catch (err) {
    console.error('Error loading user posts:', err)
    toast.error('Erreur lors du chargement des publications')
  } finally {
    loadingPosts.value = false
  }
}

async function loadMorePosts() {
  postsPage.value++
  await loadUserPosts()
}

async function loadUserStartups() {
  try {
    // Charger les startups où l'utilisateur est membre ou créateur
    const { data } = await usersApi.getUserStartups(userId.value)
    userStartups.value = data.startups || data.data || data || []
  } catch (err) {
    console.error('Error loading user startups:', err)
    // Si l'endpoint n'existe pas encore, essayer avec les données du user
    if (user.value.startups && Array.isArray(user.value.startups)) {
      userStartups.value = user.value.startups
    } else if (user.value.startup) {
      userStartups.value = [user.value.startup]
    }
  }
}

async function loadUserOffers() {
  loadingOffers.value = true

  try {
    const { data } = await offersApi.list({ publisher_id: userId.value, page: offersPage.value })
    const offers = data.data || data.offers || data || []

    if (offersPage.value === 1) {
      userOffers.value = offers
    } else {
      userOffers.value.push(...offers)
    }

    hasMoreOffers.value = offers && offers.length >= 10
  } catch (err) {
    console.error('Error loading user offers:', err)
    toast.error('Erreur lors du chargement des offres')
  } finally {
    loadingOffers.value = false
  }
}

async function loadMoreOffers() {
  offersPage.value++
  await loadUserOffers()
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function sendMessage() {
  try {
    // Charger les conversations si pas encore fait
    if (messagesStore.conversations.length === 0) {
      await messagesStore.loadConversations()
    }

    // Chercher si une conversation existe déjà avec cet utilisateur
    const existingConversation = messagesStore.conversations.find(
      conv => conv.other_user?.id === userId.value || conv.user_id === userId.value
    )

    if (existingConversation) {
      // Rediriger vers la conversation existante
      router.push(`/messages?conversation=${existingConversation.id}&userId=${userId.value}`)
    } else {
      // Pas de conversation existante, rediriger vers la page messages avec l'userId
      // La conversation sera créée lors de l'envoi du premier message
      router.push(`/messages?newConversation=${userId.value}`)
    }
  } catch (err) {
    console.error('Error starting conversation:', err)
    toast.error('Erreur lors de la création de la conversation')
  }
}

function viewStartup() {
  const startupId = user.value.startup?.id || user.value.startup_id
  if (startupId) {
    router.push(`/startups/${startupId}`)
  }
}

function viewOrganization() {
  const orgId = primaryOrganization.value?.id
  if (orgId) {
    router.push(`/organizations/${orgId}`)
  }
}

function goToOnboarding() {
  // Préparer les données d'onboarding pour un startuper sans startup
  const pendingData = {
    role: 'startuper',
    startupChoice: 'new', // Par défaut, créer une nouvelle startup
    userId: authStore.user?.id
  }
  localStorage.setItem('pendingOnboarding', JSON.stringify(pendingData))
  router.push({ name: 'OnboardingFinalize' })
}

async function handleEditPost(updatedPost) {
  if (!isOwnProfile.value) return

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
    toast.success('Publication modifiée')
    await loadUserPosts()
  } catch (err) {
    console.error('Error editing post:', err)
    const errorMessage = err.response?.data?.message || 'Erreur lors de la modification'
    toast.error(errorMessage)
  }
}

async function handleDeletePost(postId) {
  if (!isOwnProfile.value) return
  if (!confirm('Supprimer cette publication ?')) return

  try {
    await postsStore.deletePost(postId)
    toast.success('Publication supprimée')
    userPosts.value = userPosts.value.filter(p => p.id !== postId)
  } catch (err) {
    console.error('Error deleting post:', err)
    toast.error('Erreur lors de la suppression')
  }
}

function handleReportPost() {
  toast.info('Fonctionnalité de signalement bientôt disponible')
}

function handleCommentAdded({ postId, comment }) {
  const post = userPosts.value.find((p) => p.id === postId)
  if (post) {
    if (!post.comments) post.comments = []
    post.comments.push(comment)
  }
}

function handleCommentDeleted({ postId, commentId }) {
  const post = userPosts.value.find((p) => p.id === postId)
  if (post && post.comments) {
    post.comments = post.comments.filter((c) => c.id !== commentId)
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>
