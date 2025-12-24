<template>
  <div
    class="w-80 md:w-96 bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden z-50 animate-slideDown mt-2 fixed top-0 right-4 md:right-8"
    @click.stop
  >
    <!-- Header avec gradient -->
    <div class="p-4 bg-gradient-to-br from-theme-400 to-theme-600 text-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Icon name="Bell" :size="20" class="text-white" />
          </div>
          <div>
            <h3 class="font-bold text-white">Notifications</h3>
            <p class="text-xs text-white/80" v-if="unreadCount > 0">
              {{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <Icon name="X" :size="18" class="text-white" />
        </button>
      </div>
    </div>

    <!-- Notifications List avec scrollbar personnalisée -->
    <div class="max-h-[28rem] overflow-y-auto custom-scrollbar">
      <!-- Empty state -->
      <div v-if="notifications.length === 0" class="p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3">
          <Icon name="BellOff" :size="32" class="text-gray-400" />
        </div>
        <p class="text-gray-700 font-semibold mb-1">Aucune notification</p>
        <p class="text-sm text-gray-500">Vous êtes à jour !</p>
      </div>

      <!-- Liste des notifications -->
      <div v-else>
        <button
          v-for="(notif, index) in notifications.slice(0, 10)"
          :key="notif.id"
          @click="handleNotificationClick(notif)"
          :class="[
            'w-full p-4 flex items-start gap-3 transition-all duration-200 border-b border-gray-100 last:border-0 text-left relative group',
            !notif.read_at
              ? 'bg-gradient-to-r from-theme-50/70 to-purple-50/30 hover:from-theme-50 hover:to-purple-50'
              : 'hover:bg-gray-50',
          ]"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <!-- Icône avec gradient -->
          <div class="relative flex-shrink-0">
            <div
              :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white transition-transform duration-200 group-hover:scale-110',
                getNotificationStyle(notif.type).bg,
              ]"
            >
              <Icon
                :name="getNotificationStyle(getShortType(notif.type)).icon"
                :size="20"
                :class="getNotificationStyle(getShortType(notif.type)).color"
              />
            </div>
            <!-- Indicateur non lu animé -->
            <div
              v-if="!notif.read_at"
              class="absolute -top-1 -right-1 w-3 h-3 bg-theme-500 border-2 border-white rounded-full"
            >
              <span class="absolute inset-0 bg-theme-400 rounded-full animate-ping opacity-75"></span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <p
              :class="[
                'text-sm mb-1',
                !notif.read_at ? 'font-bold text-gray-900' : 'font-semibold text-gray-700',
              ]"
            >
              {{ notif.title }}
            </p>
            <p class="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-1">{{ notif.message }}</p>
            <p v-if="notif.data?.content_preview" class="text-[11px] text-gray-400 italic line-clamp-1 mb-1.5">
              "{{ notif.data.content_preview }}"
            </p>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 flex items-center gap-1">
                <Icon name="Clock" :size="10" class="opacity-60" />
                {{ formatTime(notif.created_at) }}
              </span>
              <span class="px-2 py-0.5 bg-gradient-to-r text-xs rounded-full font-semibold" :class="getNotificationStyle(getShortType(notif.type)).badgeBg" :style="{color: getNotificationStyle(getShortType(notif.type)).badgeColor}">
                {{ getNotificationTypeLabel(getShortType(notif.type)) }}
              </span>
            </div>
          </div>

          <!-- Flèche au hover -->
          <Icon name="ChevronRight" :size="16" class="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </button>
      </div>
    </div>

    <!-- Footer avec actions -->
    <div
      v-if="notifications.length > 0"
      class="p-3 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between"
    >
      <button
        @click="markAllAsRead"
        class="text-sm text-theme-600 hover:text-theme-700 font-bold flex items-center gap-1.5 px-3 py-2 hover:bg-theme-50 rounded-lg transition-all duration-200"
      >
        <Icon name="CheckCheck" :size="14" />
        Tout marquer comme lu
      </button>
      <router-link
        to="/notifications"
        class="text-sm text-gray-700 hover:text-gray-900 font-bold flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
        @click="$emit('close')"
      >
        Voir tout
        <Icon name="ArrowRight" :size="14" />
      </router-link>
    </div>
  </div>

  <!-- Backdrop for mobile -->
  <div class="fixed inset-0 bg-black/20 -z-10 md:hidden" @click="$emit('close')"></div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../../stores/notificationsStore'
import Icon from './Icon.vue'
// import Badge from './Badge.vue'
import { formatDistanceToNow } from '../../utils/dateUtils'

const emit = defineEmits(['close'])
const router = useRouter()
const notificationsStore = useNotificationsStore()

// Utiliser les notifications du store
const notifications = computed(() => notificationsStore.items)
const unreadCount = computed(() => notificationsStore.unreadCount)

const getShortType = (type) => {
  if (!type) return 'default'
  const short = type.split('\\').pop().toLowerCase()
  if (short.includes('comment')) return 'new_comment'
  if (short.includes('reply')) return 'new_reply'
  if (short.includes('message')) return 'message'
  if (short.includes('joinrequest')) return 'join_request'
  if (short.includes('application')) return 'offer'
  return short
}

const getNotificationStyle = (type) => {
  const styles = {
    join_request: {
      icon: 'UserPlus',
      bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
      color: 'text-purple-600',
      badgeBg: 'from-purple-100 to-purple-200',
      badgeColor: '#7c3aed'
    },
    join_approved: {
      icon: 'CheckCircle',
      bg: 'bg-gradient-to-br from-green-100 to-green-200',
      color: 'text-green-600',
      badgeBg: 'from-green-100 to-green-200',
      badgeColor: '#059669'
    },
    join_rejected: {
      icon: 'XCircle',
      bg: 'bg-gradient-to-br from-red-100 to-red-200',
      color: 'text-red-600',
      badgeBg: 'from-red-100 to-red-200',
      badgeColor: '#dc2626'
    },
    message: {
      icon: 'MessageSquare',
      bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
      color: 'text-blue-600',
      badgeBg: 'from-blue-100 to-blue-200',
      badgeColor: '#2563eb'
    },
    post: {
      icon: 'FileText',
      bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      color: 'text-indigo-600',
      badgeBg: 'from-indigo-100 to-indigo-200',
      badgeColor: '#4f46e5'
    },
    comment: {
      icon: 'MessageCircle',
      bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
      color: 'text-cyan-600',
      badgeBg: 'from-cyan-100 to-cyan-200',
      badgeColor: '#0891b2'
    },
    new_reply: {
      icon: 'Reply',
      bg: 'bg-gradient-to-br from-theme-100 to-theme-200',
      color: 'text-theme-600',
      badgeBg: 'from-theme-100 to-theme-200',
      badgeColor: '#8b5cf6'
    },
    like: {
      icon: 'Heart',
      bg: 'bg-gradient-to-br from-pink-100 to-pink-200',
      color: 'text-pink-600',
      badgeBg: 'from-pink-100 to-pink-200',
      badgeColor: '#db2777'
    },
    offer: {
      icon: 'Briefcase',
      bg: 'bg-gradient-to-br from-amber-100 to-amber-200',
      color: 'text-amber-600',
      badgeBg: 'from-amber-100 to-amber-200',
      badgeColor: '#d97706'
    },
    event: {
      icon: 'Calendar',
      bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
      color: 'text-orange-600',
      badgeBg: 'from-orange-100 to-orange-200',
      badgeColor: '#ea580c'
    },
    default: {
      icon: 'Bell',
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      color: 'text-gray-600',
      badgeBg: 'from-gray-100 to-gray-200',
      badgeColor: '#4b5563'
    },
  }
  return styles[type] || styles.default
}

const getNotificationTypeLabel = (type) => {
  const labels = {
    join_request: 'Demande',
    join_approved: 'Accepté',
    join_rejected: 'Refusé',
    message: 'Message',
    post: 'Publication',
    comment: 'Commentaire',
    new_comment: 'Commentaire',
    new_reply: 'Réponse',
    like: 'J\'aime',
    offer: 'Offre',
    event: 'Événement',
  }
  return labels[type] || 'Notification'
}

const formatTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

const handleNotificationClick = async (notif) => {
  try {
    // Marquer comme lue si pas encore lue
    if (!notif.read_at) {
      await notificationsStore.markRead(notif.id)
    }

    // Fermer le panel
    emit('close')

    // Extraire le type de notification (peut être un namespace complet ou simple)
    const notifType = notif.type?.split('\\').pop() || notif.type || '';

    // Navigation intelligente selon le type de notification
    if (notifType.includes('NewMessage') || notifType === 'new_message' || notif.type === 'message') {
      // Redirection vers la conversation avec l'expéditeur
      const senderId = notif.data?.sender_id;
      if (senderId) {
        router.push(`/messages?userId=${senderId}`)
      } else {
        router.push('/messages')
      }
    } else if (notifType.includes('AddedToGroup')) {
      // Redirection vers la page des groupes
      const groupId = notif.data?.group_id;
      if (groupId) {
        router.push(`/messages?tab=groups&groupId=${groupId}`)
      } else {
        router.push('/messages?tab=groups')
      }
    } else if (notifType.includes('JoinRequest')) {
      // Redirection vers les demandes de la startup
      const startupId = notif.data?.startup_id;
      if (startupId) {
        router.push(`/startups/${startupId}`)
      } else {
        router.push('/startups')
      }
    } else if (notifType.includes('JoinRequestApproved') || notifType.includes('JoinRequestRejected')) {
      // Redirection vers la page de la startup
      const startupId = notif.data?.startup_id;
      if (startupId) {
        router.push(`/startups/${startupId}`)
      } else {
        router.push('/startups')
      }
    } else if (notifType.includes('NewComment')) {
      // Redirection vers le post avec commentaire
      const postId = notif.data?.post_id;
      if (postId) {
        router.push(`/posts/${postId}`)
      } else {
        router.push('/')
      }
    } else if (notifType.includes('NewReply') || notifType === 'new_reply') {
      // Redirection vers le post avec réponse
      const postId = notif.data?.post_id;
      if (postId) {
        router.push(`/posts/${postId}`)
      } else {
        router.push('/')
      }
    } else if (notifType.includes('ApplicationReceived')) {
      // Redirection vers les offres
      const offerId = notif.data?.offer_id;
      if (offerId) {
        router.push(`/offers/${offerId}`)
      } else {
        router.push('/offers')
      }
    } else if (notif.data?.link) {
      // Fallback : utiliser le lien fourni dans les données
      router.push(notif.data.link)
    } else {
      // Dernier fallback : page des notifications
      router.push('/notifications')
    }
  } catch (error) {
    console.error('Error handling notification click:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllRead()
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

// Charger les notifications au montage
onMounted(() => {
  notificationsStore.fetch()
})
</script>

<style scoped>
/* Animation de slide down pour le panel */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

/* Scrollbar personnalisée */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #8b5cf6, #a855f7);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #7c3aed, #9333ea);
}
</style>
