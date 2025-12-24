<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useReverb } from '@/composables/useReverb'
import MainLayout from './components/layout/MainLayout.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const { subscribeToNotifications, leaveAllChannels, isConnected } = useReverb()
const toast = useToast()
const router = useRouter()

// Initialiser l'authentification au chargement de l'app
onMounted(async () => {
  await authStore.initialize()
})

// Watch for auth state changes to start/stop realtime notifications
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      // S'abonner aux notifications temps réel via Reverb
      subscribeToNotifications(newUser.id, (notification) => {
        console.log('[App] 🔔 Notification temps réel reçue:', notification);

        // Ajouter la notification au store
        notificationsStore.addRealtimeNotification(notification)

        // Afficher un toast pour les notifications importantes
        const notifType = notification.type || '';

        if (notifType === 'new_message' || notifType.includes('NewMessage')) {
          toast.info(
            `Nouveau message de ${notification.sender_name || 'quelqu\'un'}: ${notification.content_preview || '...'}`,
            5000,
            () => {
              // Redirection vers la conversation avec l'utilisateur
              router.push({ path: '/messages', query: { userId: notification.sender_id } });
            }
          )
        } else if (notifType.includes('AddedToGroup')) {
          toast.info(
            `Vous avez été ajouté au groupe ${notification.group_name || ''}`,
            5000,
            () => {
              router.push({ path: '/messages', query: { tab: 'groups', groupId: notification.group_id } });
            }
          )
        } else if (notifType.includes('JoinRequest')) {
          toast.info(
            `${notification.user_name || 'Quelqu\'un'} souhaite rejoindre votre startup`,
            5000
          )
        } else if (notifType === 'new_comment' || notifType.includes('NewComment')) {
          toast.info(
            `${notification.author_name || 'Quelqu\'un'} a commenté votre post`,
            5000,
            () => {
              router.push(`/posts/${notification.post_id}`)
            }
          )
        } else if (notifType === 'new_reply' || notifType.includes('NewReply')) {
          toast.info(
            `${notification.author_name || 'Quelqu\'un'} a répondu à votre commentaire`,
            5000,
            () => {
              router.push(`/posts/${notification.post_id}`)
            }
          )
        }
      })

      // Polling en fallback si WebSocket non connecté (toutes les 30s)
      if (!isConnected.value) {
        console.log('[App] WebSocket non connecté, fallback sur polling')
        notificationsStore.startPolling(30000)
      } else {
        // Charger les notifications initiales sans polling
        notificationsStore.fetch({}, true)
        notificationsStore.fetchCount()
      }
    } else {
      // Déconnecter tout lors du logout
      leaveAllChannels()
      notificationsStore.stopPolling()
    }
  },
  { immediate: true },
)

// Cleanup à la destruction
onUnmounted(() => {
  leaveAllChannels()
  notificationsStore.stopPolling()
})
</script>

<template>
  <div>
    <template v-if="$route.meta.requiresLayout">
      <MainLayout>
        <router-view />
      </MainLayout>
    </template>
    <template v-else>
      <router-view />
    </template>
    <ToastContainer />
  </div>
</template>

<style scoped></style>
