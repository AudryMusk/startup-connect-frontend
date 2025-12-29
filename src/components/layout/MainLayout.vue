<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-teal-400/10 to-white">
    <!-- Bannière événement fixe -->
    <!-- <EventBanner v-if="nextEvent" :eventId="nextEvent.id" :eventDate="nextEvent.event_date"
      :eventName="nextEvent.title || nextEvent.name" :eventLocation="nextEvent.location" :isLoading="eventsLoading"
      class="fixed top-[72px] left-0 right-0 z-40 mx-4 lg:mx-8" /> -->

    <!-- <EventBanner
      v-else
      :eventDate="nextEventDate"
      :eventName="nextEventName"
      :isLoading="loading"
    /> -->

    <!-- Top Navigation avec glass effect -->
    <nav class="fixed top-0 w-full glass-effect border-b border-neutral-200/50 z-50 h-16 sm:h-18 shadow-soft">
      <div class="container-spacing h-full flex items-center justify-between gap-2">
        <!-- Logo amélioré -->
        <router-link to="/"
          class="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl text-neutral-900 hover:opacity-80 transition-opacity flex-shrink-0">
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-soft">
            <span class="text-base sm:text-lg font-black">SC</span>
          </div>
          <span class="hidden md:inline text-base sm:text-xl"> Startup<span class="gradient-text">Connect</span> </span>
        </router-link>

        <!-- Desktop Navigation avec indicateur actif -->
        <div class="hidden md:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.id" :to="item.path" :class="[
            'relative px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center gap-1.5 lg:gap-2 transition-all duration-300',
            isRouteActive(item.path)
              ? 'bg-theme-100 text-theme-800 shadow-soft'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-theme-700',
          ]">
            <Icon :name="item.icon" :size="16" class="lg:hidden" />
            <Icon :name="item.icon" :size="18" class="hidden lg:inline" />
            <span class="hidden lg:inline">{{ item.label }}</span>
            <!-- Badge pour compteurs dynamiques -->
            <span v-if="item.badge && typeof item.badge === 'function' && item.badge() > 0"
              class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              {{ item.badge() > 9 ? '9+' : item.badge() }}
            </span>
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center gap-2 lg:gap-3">
          <!-- Notifications -->
          <div class="relative">
            <button @click="showNotifications = !showNotifications" :class="[
              'relative p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm',
              showNotifications
                ? 'text-white bg-gradient-to-r from-theme-500 to-purple-600 shadow-md'
                : 'text-gray-600 hover:text-theme-600 hover:bg-theme-50 hover:shadow-md',
            ]">
              <Icon name="Bell" :size="18" class="sm:hidden" />
              <Icon name="Bell" :size="20" class="hidden sm:inline" />
              <!-- Badge avec compteur -->
              <span v-if="unreadNotifications > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 sm:px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
                <span class="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></span>
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <NotificationsPanel v-if="showNotifications" @close="showNotifications = false"
              class="fixed right-2 sm:right-4 top-16 sm:top-20 z-[60]" />
          </div>

          <!-- Profile User -->
          <div class="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 lg:pl-3 border-l border-neutral-200">
            <div class="hidden lg:block text-right max-w-[100px] xl:max-w-[120px]">
              <p class="text-xs xl:text-sm font-bold text-neutral-900 truncate"
                :title="user?.displayName || user?.organization?.name || user?.name">
                {{ user?.organization?.name || user?.displayName || user?.name }}
              </p>
              <p class="text-[10px] xl:text-xs text-neutral-500 capitalize font-medium">
                {{ getRoleLabel(user?.role) }}
              </p>
            </div>
            <router-link :to="`/users/${user?.id || user?.uid}`" class="block">
              <div v-if="user?.photo"
                class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl overflow-hidden shadow-soft hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img :src="getImageUrl(user.photo)" :alt="user.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-theme-400 to-theme-600 flex items-center justify-center text-[10px] sm:text-xs lg:text-sm font-black text-white shadow-soft hover:scale-105 transition-transform duration-300 cursor-pointer">
                {{ user?.name?.substring(0, 2).toUpperCase() }}
              </div>
            </router-link>
            <button @click="handleLogout"
              class="p-1.5 sm:p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-300"
              title="Déconnexion">
              <Icon name="LogOut" :size="16" class="sm:hidden" />
              <Icon name="LogOut" :size="18" class="hidden sm:inline" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main
      :class="['container-spacing pb-20 sm:pb-24 md:pb-12', nextEvent ? 'pt-36 sm:pt-40 lg:pt-40' : 'pt-20 sm:pt-24']">
      <div class="animate-fade-in">
        <slot></slot>
      </div>
    </main>

    <!-- Mobile Navigation -->
    <nav
      class="md:hidden fixed bottom-0 w-full glass-effect border-t border-neutral-200/50 z-50 shadow-soft safe-area-inset-bottom">
      <div class="grid grid-cols-5 gap-0.5 px-1 py-1.5 sm:py-2">
        <router-link v-for="item in mobileNavItems" :key="item.id" :to="item.path" :class="[
          'relative flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg transition-all duration-300',
          isRouteActive(item.path)
            ? 'text-theme-700 bg-theme-50'
            : 'text-neutral-600 hover:text-theme-600 active:scale-95',
        ]">
          <Icon :name="item.icon" :size="18" class="sm:hidden" />
          <Icon :name="item.icon" :size="20" class="hidden sm:inline" />
          <span class="text-[9px] sm:text-[10px] font-bold leading-tight">{{ item.label }}</span>
          <!-- Badge pour messages -->
          <span v-if="item.badge && typeof item.badge === 'function' && item.badge() > 0"
            class="absolute top-0 right-1 min-w-[14px] h-[14px] px-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
            {{ item.badge() > 9 ? '9+' : item.badge() }}
          </span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
// import { useAuth } from '../../composables/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useEventsStore } from '@/stores/eventsStore'
import Icon from '../ui/Icon.vue'
import NotificationsPanel from '../ui/NotificationsPanel.vue'
import EventBanner from '../feed/EventBanner.vue'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useMessagesStore } from '@/stores/messagesStore'
import { getImageUrl } from '@/utils/imageUtils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { logout } = authStore
const eventsStore = useEventsStore()
const notificationsStore = useNotificationsStore()
const messagesStore = useMessagesStore()

const showNotifications = ref(false)
const unreadNotifications = computed(() => notificationsStore.unreadCount)
const unreadMessages = computed(() => messagesStore.totalUnread)
const isLoggingOut = ref(false)

// Événement prochain
const nextEvent = computed(() => {
  const upcoming = eventsStore.upcomingEvents
  if (upcoming && upcoming.length > 0) {
    return upcoming[0]
  }
  return null
})
const eventsLoading = computed(() => eventsStore.loading)

// Charger les événements au montage
onMounted(async () => {
  try {
    await Promise.all([
      eventsStore.fetchEvents(),
      messagesStore.loadConversations(),
    ])
  } catch (err) {
    console.error('Error loading data:', err)
  }
})

const handleLogout = async () => {
  if (isLoggingOut.value) return

  if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    return
  } else {
    await router.push('/login')
  }

  isLoggingOut.value = true

  try {
    await logout()

    await router.push('/login')

    console.log('Déconnexion réussie')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    await router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

const getRoleLabel = (role) => {
  const labels = {
    startuper: 'Startuper',
    partner: 'Partenaire',
    admin: 'Admin',
  }
  return labels[role] || role
}

const isRouteActive = (path) => {
  if (path === '/') {
    return (
      route.path === '/' ||
      route.path === '/startup' ||
      route.path === '/partner' ||
      route.path === '/admin-home'
    )
  }
  if (path === '/admin') {
    // Admin nav item active for /admin/* routes but NOT for /admin-home
    return route.path.startsWith('/admin') && route.path !== '/admin-home'
  }
  return route.path.startsWith(path)
}

const baseNavItems = [
  { id: 'home', label: 'Accueil', icon: 'LayoutDashboard', path: '/', badge: null },
  { id: 'startups', label: 'Startups', icon: 'Building2', path: '/startups', badge: null },
  { id: 'offers', label: 'Offres', icon: 'Briefcase', path: '/offers', badge: null },
  { id: 'events', label: 'Événements', icon: 'Calendar', path: '/events', badge: null },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageSquare',
    path: '/messages',
    badge: () => unreadMessages.value
  },
]

const navItems = computed(() => {
  const items = [...baseNavItems]
  if (user.value?.role === 'admin') {
    // Pour l'admin, placer l'onglet Admin en premier
    return [
      { id: 'admin', label: 'Admin', icon: 'ShieldAlert', path: '/admin', badge: null },
      ...items
    ]
  }
  return items
})

const mobileNavItems = computed(() => {
  if (user.value?.role === 'admin') {
    // Pour l'admin, placer l'onglet Admin en premier
    return [
      { id: 'admin', label: 'Admin', icon: 'ShieldAlert', path: '/admin', badge: null },
      { id: 'home', label: 'Accueil', icon: 'LayoutDashboard', path: '/', badge: null },
      { id: 'startups', label: 'Startups', icon: 'Building2', path: '/startups', badge: null },
      { id: 'offers', label: 'Offres', icon: 'Briefcase', path: '/offers', badge: null },
      { id: 'events', label: 'Événements', icon: 'Calendar', path: '/events', badge: null },
    ]
  }
  return [
    { id: 'home', label: 'Accueil', icon: 'LayoutDashboard', path: '/', badge: null },
    { id: 'startups', label: 'Startups', icon: 'Building2', path: '/startups', badge: null },
    { id: 'offers', label: 'Offres', icon: 'Briefcase', path: '/offers', badge: null },
    { id: 'events', label: 'Événements', icon: 'Calendar', path: '/events', badge: null },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'MessageSquare',
      path: '/messages',
      badge: () => unreadMessages.value
    },
  ]
})
</script>
