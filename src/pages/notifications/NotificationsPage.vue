<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8">
    <!-- Page Header avec gradient -->
    <div class="max-w-6xl mx-auto px-4 mb-6">
      <div class="bg-gradient-to-br from-theme-400 to-theme-600 rounded-2xl shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Icon name="Bell" :size="28" class="text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Notifications</h1>
              <p class="text-white/90 text-sm mt-1">
                <span v-if="unreadCount > 0" class="font-semibold">{{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}</span>
                <span v-else>Vous êtes à jour</span>
                <span class="mx-2">•</span>
                <span>{{ notifications.length }} au total</span>
              </p>
            </div>
          </div>
          <button
            v-if="notifications.length > 0"
            @click="markAllAsRead"
            class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Icon name="CheckCheck" :size="18" />
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </div>

    <!-- Filtres modernes -->
    <div class="max-w-6xl mx-auto px-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              'px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2.5 shadow-sm',
              activeFilter === filter.id
                ? 'bg-gradient-to-br from-theme-400 to-theme-600 text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md',
          ]"
          >
            <Icon :name="filter.icon" :size="18" />
            <span>{{ filter.label }}</span>
            <span
              v-if="filter.count > 0"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-bold',
                activeFilter === filter.id
                  ? 'bg-white/30 text-white'
                  : 'bg-theme-500 text-white'
              ]"
            >
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des notifications avec animations -->
    <div class="max-w-6xl mx-auto px-4">
      <!-- Empty state -->
      <div v-if="filteredNotifications.length === 0" class="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
          <Icon name="BellOff" :size="40" class="text-gray-400" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Aucune notification</h3>
        <p class="text-gray-500">Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.</p>
      </div>

      <!-- Notifications grid -->
      <div v-else class="space-y-3">
        <div
          v-for="(notif, index) in filteredNotifications"
          :key="notif.id"
          :class="[
            'bg-white rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 border-2 p-5 animate-fadeInUp',
            !notif.read_at
              ? 'border-l-4 border-l-theme-500 bg-gradient-to-r from-theme-50/50 to-white hover:from-theme-50 hover:to-purple-50/30'
              : 'border-gray-100 hover:border-gray-200',
          ]"
          :style="{animationDelay: `${Math.min(index * 0.05, 0.5)}s`}"
          @click="handleNotificationClick(notif)"
        >
          <div class="flex items-start gap-4">
            <!-- Icône avec gradient -->
            <div class="relative flex-shrink-0">
              <div
                :class="[
                  'w-14 h-14 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white transition-transform duration-200 hover:scale-110',
                  getNotificationStyle(notif.type).bg,
                ]"
              >
                <Icon
                  :name="getNotificationStyle(notif.type).icon"
                  :size="24"
                  :class="getNotificationStyle(notif.type).color"
                />
              </div>
              <!-- Indicateur non lu -->
              <div
                v-if="!notif.read_at"
                class="absolute -top-1 -right-1 w-4 h-4 bg-theme-500 border-2 border-white rounded-full"
              >
                <span class="absolute inset-0 bg-theme-400 rounded-full animate-ping opacity-75"></span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <h3
                    :class="[
                      'text-base mb-1.5',
                      !notif.read_at ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                    ]"
                  >
                    {{ notif.title }}
                  </h3>
                  <p class="text-sm text-gray-600 leading-relaxed mb-2">{{ notif.message }}</p>
                  <div class="flex items-center gap-3 text-xs text-gray-400">
                    <span class="flex items-center gap-1">
                      <Icon name="Clock" :size="12" class="opacity-60" />
                      {{ formatTime(notif.created_at) }}
                    </span>
                    <span class="px-2.5 py-1 bg-gradient-to-r" :class="getNotificationStyle(notif.type).badgeBg + ' rounded-full font-semibold'" :style="{color: getNotificationStyle(notif.type).badgeColor}">
                      {{ getNotificationTypeLabel(notif.type) }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    v-if="!notif.read_at"
                    @click.stop="notificationsStore.markRead(notif.id)"
                    class="p-2.5 text-gray-400 hover:text-theme-600 hover:bg-theme-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Marquer comme lu"
                  >
                    <Icon name="Check" :size="18" />
                  </button>
                  <button
                    @click.stop="deleteNotification(notif.id)"
                    class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Supprimer"
                  >
                    <Icon name="Trash2" :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../../stores/notificationsStore'
import { Icon } from '../../components/ui'
import { formatDistanceToNow } from '../../utils/dateUtils'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const notificationsStore = useNotificationsStore()
const toast = useToast()

const activeFilter = ref('all')

// Transformer les notifications pour avoir un titre et message lisibles
const notifications = computed(() => {
  return notificationsStore.items.map(notif => {
    // Extraire le type de notification
    const notifType = notif.type?.split('\\').pop() || notif.type || 'unknown';

    // Créer un titre et message selon le type
    let title = '';
    let message = '';
    let type = 'default';

    if (notifType.includes('NewMessage')) {
      type = 'message';
      title = `Nouveau message de ${notif.data?.sender_name || 'quelqu\'un'}`;
      message = notif.data?.content_preview || 'Vous avez reçu un nouveau message';
    } else if (notifType.includes('JoinRequest')) {
      type = 'join_request';
      title = `Demande de rejoindre ${notif.data?.startup_name || 'une startup'}`;
      message = `${notif.data?.user_name || 'Un utilisateur'} souhaite rejoindre votre startup`;
    } else if (notifType.includes('JoinRequestApproved')) {
      type = 'join_approved';
      title = 'Demande approuvée';
      message = `Votre demande pour rejoindre ${notif.data?.startup_name || 'la startup'} a été approuvée`;
    } else if (notifType.includes('JoinRequestRejected')) {
      type = 'join_rejected';
      title = 'Demande refusée';
      message = `Votre demande pour rejoindre ${notif.data?.startup_name || 'la startup'} a été refusée`;
    } else if (notifType.includes('AddedToGroup')) {
      type = 'message';
      title = `Ajouté à un groupe`;
      message = `${notif.data?.added_by_name || 'Quelqu\'un'} vous a ajouté au groupe ${notif.data?.group_name || ''}`;
    } else if (notifType.includes('NewComment')) {
      type = 'comment';
      title = `Nouveau commentaire`;
      message = `${notif.data?.author_name || 'Quelqu\'un'} a commenté votre post`;
    } else if (notifType.includes('ApplicationReceived')) {
      type = 'offer';
      title = 'Nouvelle candidature';
      message = `${notif.data?.applicant_name || 'Un utilisateur'} a postulé à votre offre`;
    } else {
      // Type générique
      title = notif.data?.title || 'Notification';
      message = notif.data?.message || JSON.stringify(notif.data);
    }

    return {
      ...notif,
      title,
      message,
      type
    };
  });
})
const unreadCount = computed(() => notificationsStore.unreadCount)

const filters = computed(() => [
  { id: 'all', label: 'Toutes', icon: 'Inbox', count: notifications.value.length },
  { id: 'unread', label: 'Non lues', icon: 'Circle', count: unreadCount.value },
  {
    id: 'join_request',
    label: 'Demandes',
    icon: 'UserPlus',
    count: notifications.value.filter((n) => ['join_request', 'join_approved', 'join_rejected'].includes(n.type)).length,
  },
  {
    id: 'message',
    label: 'Messages',
    icon: 'MessageSquare',
    count: notifications.value.filter((n) => n.type === 'message').length,
  },
  {
    id: 'post',
    label: 'Posts',
    icon: 'FileText',
    count: notifications.value.filter((n) => ['post', 'comment', 'like'].includes(n.type)).length,
  },
])

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  if (activeFilter.value === 'unread') return notifications.value.filter((n) => !n.read_at)

  // Filtres groupés
  if (activeFilter.value === 'join_request') {
    return notifications.value.filter((n) => ['join_request', 'join_approved', 'join_rejected'].includes(n.type))
  }
  if (activeFilter.value === 'post') {
    return notifications.value.filter((n) => ['post', 'comment', 'like'].includes(n.type))
  }

  return notifications.value.filter((n) => n.type === activeFilter.value)
})

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
    // Marquer comme lue
    if (!notif.read_at) {
      await notificationsStore.markRead(notif.id)
    }

    // Navigation intelligente selon le type de notification
    const notifType = notif.type?.split('\\').pop() || notif.type || '';

    if (notifType.includes('NewMessage')) {
      // Redirection vers la conversation avec l'expéditeur
      const senderId = notif.data?.sender_id;
      if (senderId) {
        router.push(`/messages?userId=${senderId}`);
      } else {
        router.push('/messages');
      }
    } else if (notifType.includes('AddedToGroup')) {
      // Redirection vers la page des groupes (onglet groups dans MessagingHub)
      const groupId = notif.data?.group_id;
      if (groupId) {
        router.push(`/messages?tab=groups&groupId=${groupId}`);
      } else {
        router.push('/messages?tab=groups');
      }
    } else if (notifType.includes('JoinRequest')) {
      // Redirection vers les demandes de la startup
      const startupId = notif.data?.startup_id;
      if (startupId) {
        router.push(`/startup/${startupId}/requests`);
      } else {
        router.push('/my-startup');
      }
    } else if (notifType.includes('JoinRequestApproved') || notifType.includes('JoinRequestRejected')) {
      // Redirection vers la page de la startup
      const startupId = notif.data?.startup_id;
      if (startupId) {
        router.push(`/startup/${startupId}`);
      } else {
        router.push('/startups');
      }
    } else if (notifType.includes('NewComment')) {
      // Redirection vers le post avec commentaire
      const postId = notif.data?.post_id;
      if (postId) {
        router.push(`/posts/${postId}`);
      } else {
        router.push('/');
      }
    } else if (notifType.includes('ApplicationReceived')) {
      // Redirection vers les offres
      const offerId = notif.data?.offer_id;
      if (offerId) {
        router.push(`/offers/${offerId}`);
      } else {
        router.push('/my-startup');
      }
    } else if (notif.data?.link) {
      // Fallback : utiliser le lien fourni dans les données
      router.push(notif.data.link);
    }
  } catch (error) {
    console.error('Error handling notification:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllRead()
    toast.success('Toutes les notifications ont été marquées comme lues')
  } catch (error) {
    toast.error('Erreur lors du marquage des notifications')
    console.error('Error marking all as read:', error)
  }
}

const deleteNotification = async (id) => {
  try {
    await notificationsStore.deleteNotification(id)
    toast.success('Notification supprimée')
  } catch (error) {
    toast.error('Erreur lors de la suppression')
    console.error('Error deleting notification:', error)
  }
}

// Charger les notifications au montage
onMounted(() => {
  notificationsStore.fetch()
})
</script>

<style scoped>
/* Animation d'entrée pour les notifications */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.4s ease-out forwards;
  animation-fill-mode: both;
}
</style>
