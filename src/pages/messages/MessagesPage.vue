<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="groups.length === 0" class="max-w-2xl mx-auto mt-20">
    <EmptyState title="Aucun groupe de discussion"
      description="Vous n'êtes membre d'aucun groupe pour le moment. Rejoignez une startup pour accéder aux groupes sectoriels.">
      <template #icon>
        <Icon name="MessageSquare" :size="48" />
      </template>
    </EmptyState>
  </div>

  <div v-else class="h-screen md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-0 md:gap-6 md:pb-4">
    <!-- Sidebar - Groups List -->
    <div :class="[
      'flex-shrink-0 transition-all duration-300',
      'md:w-80 md:block md:h-full',
      showMobileSidebar || !selectedGroup ? 'w-full h-screen md:h-auto' : 'hidden',
    ]">
      <Card class="h-full md:h-full flex flex-col p-0" :noPadding="true">
        <!-- Header -->
        <div class="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">Messages</h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {{ groups.length }} groupe{{ groups.length > 1 ? 's' : '' }}
            </p>
          </div>
          <!-- Close button mobile -->
          <button v-if="selectedGroup && showMobileSidebar" @click="showMobileSidebar = false"
            class="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="X" :size="18" />
          </button>
        </div>

        <!-- Groups List -->
        <div class="flex-1 overflow-y-auto">
          <button v-for="group in groups" :key="group.id" @click="selectGroup(group)" :class="[
            'w-full p-3 sm:p-4 flex items-start gap-2 sm:gap-3 hover:bg-gray-50 transition border-l-4',
            selectedGroup?.id === group.id ? 'bg-theme-light border-theme' : 'border-transparent',
          ]">
            <!-- Group Icon -->
            <div :class="[
              'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
              selectedGroup?.id === group.id
                ? 'bg-theme text-white'
                : 'bg-gray-200 text-gray-600',
            ]">
              <Icon name="Users" :size="16" class="sm:hidden" />
              <Icon name="Users" :size="18" class="hidden sm:inline" />
            </div>

            <!-- Group Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between mb-0.5 sm:mb-1">
                <h3 :class="[
                  'font-semibold truncate text-sm sm:text-base',
                  selectedGroup?.id === group.id ? 'text-theme' : 'text-gray-900',
                ]">
                  {{ group.name }}
                </h3>
              </div>
              <p class="text-[10px] sm:text-xs text-gray-500 truncate">
                {{ group.members_count || 0 }} membre{{ (group.members_count || 0) > 1 ? 's' : '' }}
              </p>
            </div>
          </button>
        </div>
      </Card>
    </div>

    <!-- Main Chat Area -->
    <div :class="[
      'flex-1 flex flex-col min-w-0 h-full md:h-auto',
      !selectedGroup && 'hidden md:flex',
      showMobileSidebar && 'hidden md:flex',
    ]">
      <Card class="h-full md:h-full flex flex-col p-0" :noPadding="true">
        <!-- Chat Header -->
        <div class="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between gap-2 flex-shrink-0">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <!-- Bouton retour mobile -->
            <button @click="showMobileSidebar = true"
              class="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
              <Icon name="ChevronLeft" :size="18" class="sm:hidden" />
              <Icon name="ChevronLeft" :size="20" class="hidden sm:inline" />
            </button>
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 bg-theme rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Icon name="Users" :size="14" class="sm:hidden" />
              <Icon name="Users" :size="16" class="hidden sm:inline" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="font-bold text-gray-900 truncate text-sm sm:text-base">
                {{ selectedGroup?.name }}
              </h2>
              <p class="text-[10px] sm:text-xs text-gray-500 truncate">
                {{ selectedGroup?.members_count || 0 }} membre{{
                  (selectedGroup?.members_count || 0) > 1 ? 's' : ''
                }}
              </p>
            </div>
          </div>

          <button @click="showGroupInfo = true"
            class="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
            <Icon name="Info" :size="14" class="sm:hidden" />
            <Icon name="Info" :size="16" class="hidden sm:inline" />
            <span class="hidden sm:inline">Détails</span>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Indicateur de chargement des messages plus anciens -->
          <div v-if="loadingMore" class="flex justify-center py-2">
            <LoadingSpinner size="sm" />
            <span class="ml-2 text-sm text-gray-500">Chargement...</span>
          </div>

          <div v-if="messages.length === 0 && !loading" class="flex items-center justify-center h-full px-4">
            <EmptyState title="Aucun message" description="Soyez le premier à envoyer un message dans ce groupe">
              <template #icon>
                <Icon name="MessageSquare" :size="32" class="md:size-12" />
              </template>
            </EmptyState>
          </div>

          <template v-else>
            <div v-for="(message, index) in messages" :key="message.id || message.tempId || index"
              :class="['flex gap-2 sm:gap-3', isOwnMessage(message) ? 'flex-row-reverse' : '']">
              <!-- Avatar cliquable -->
              <template v-if="showAvatar(index)">
                <button @click="goToProfile(message.user)" :class="[
                  'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
                  'transition-all hover:ring-2 hover:ring-theme cursor-pointer',
                  !message.user?.photo && (isOwnMessage(message) ? 'bg-theme text-white' : 'bg-gray-400 text-white')
                ]" :title="`Voir le profil de ${getUserName(message)}`">
                  <img v-if="message.user?.photo" :src="message.user.photo" :alt="getUserName(message)"
                    class="w-full h-full object-cover" />
                  <span v-else class="font-semibold text-[10px] sm:text-xs md:text-sm">
                    {{ getUserName(message)[0]?.toUpperCase() || '?' }}
                  </span>
                </button>
              </template>
              <div v-else class="w-7 sm:w-8 md:w-10" />

              <!-- Message Bubble -->
              <div :class="[
                'flex-1 max-w-[85%] sm:max-w-[75%] md:max-w-lg flex flex-col',
                isOwnMessage(message) ? 'items-end' : 'items-start',
              ]">
                <div v-if="showAvatar(index)" :class="[
                  'flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] md:text-xs px-0.5',
                  isOwnMessage(message) ? 'flex-row-reverse' : '',
                ]">
                  <button @click="goToProfile(message.user)"
                    class="font-semibold text-gray-900 hover:text-theme transition-colors truncate cursor-pointer">
                    {{ getUserName(message) }}
                  </button>
                  <span class="text-gray-400 text-[8px] sm:text-[9px] md:text-xs">
                    {{ getMessageDate(message) }}
                  </span>
                </div>

                <div :class="[
                  'px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl relative shadow-sm',
                  isOwnMessage(message)
                    ? 'bg-theme text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                ]">
                  <p class="text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                    {{ message.content }}
                  </p>
                </div>

                <!-- Statut du message (envoi, envoyé, vu) - style Messenger -->
                <div v-if="isOwnMessage(message)"
                  class="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-gray-400">
                  <!-- En cours d'envoi -->
                  <template v-if="message.sending">
                    <Icon name="Clock" :size="12" class="animate-pulse" />
                    <span>Envoi en cours...</span>
                  </template>

                  <!-- Erreur d'envoi -->
                  <template v-else-if="message.sendError">
                    <Icon name="AlertCircle" :size="12" class="text-red-500" />
                    <span class="text-red-500">Échec de l'envoi</span>
                  </template>

                  <!-- Envoyé (une coche) -->
                  <template v-else-if="message.id && !message.read_at">
                    <Icon name="Check" :size="14" class="text-gray-400" />
                  </template>

                  <!-- Lu (deux coches) -->
                  <template v-else-if="message.read_at">
                    <div class="relative">
                      <Icon name="Check" :size="14" class="text-theme" />
                      <Icon name="Check" :size="14" class="text-theme absolute -right-1.5 top-0" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div ref="messagesEnd" />
          </template>
        </div>

        <!-- Message Input -->
        <div class="p-2 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <form @submit.prevent="handleSendMessage" class="flex gap-1.5 md:gap-3 items-center">
            <input type="text" placeholder="Écrire un message..." v-model="newMessage"
              class="flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-gray-300 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent" />
            <Button type="submit" :disabled="!newMessage.trim()" size="sm"
              class="px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Icon name="Send" :size="14" class="md:hidden" />
              <Icon name="Send" :size="18" class="hidden md:block" />
              <span class="hidden md:inline ml-1">Envoyer</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  </div>

  <!-- Group Info Modal -->
  <GroupInfoModal :show="showGroupInfo" :group="selectedGroup" @close="showGroupInfo = false" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupsStore } from '@/stores/groupsStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, Button, EmptyState, LoadingSpinner, Icon } from '@/components/ui'
import { formatDistanceToNow } from '@/utils/dateUtils'
import { useReverb } from '@/composables/useReverb'
import GroupInfoModal from '@/components/modals/GroupInfoModal.vue'

const router = useRouter()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const selectedGroup = ref(null);
const newMessage = ref('');
const sending = ref(false);
const messagesEnd = ref(null);
const messagesContainer = ref(null);
const loadingMore = ref(false);
const showMobileSidebar = ref(false);
const showGroupInfo = ref(false);

// Reverb/Echo pour temps réel
const { subscribeToGroupMessages, leaveChannel } = useReverb();
let currentChannelName = null;

const groups = computed(() => groupsStore.groups)
const messages = computed(() => {
  if (!selectedGroup.value) return [];
  return groupsStore.getMessagesForGroup(selectedGroup.value.id);
});
const loading = computed(() => groupsStore.loading);
const pagination = computed(() => {
  if (!selectedGroup.value) return null;
  return groupsStore.groupMessagesPagination[selectedGroup.value.id];
});

const loadGroups = async () => {
  try {
    await groupsStore.fetchGroups()

    // Auto-select first group
    if (groups.value.length > 0 && !selectedGroup.value) {
      selectedGroup.value = groups.value[0]
    }
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

const loadMessages = async (groupId, scrollToEnd = true) => {
  try {
    await groupsStore.fetchMessages(groupId, 1, 20); // Charger 20 messages les plus récents
    await nextTick();
    if (scrollToEnd) {
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

// Charger plus de messages quand l'utilisateur scrolle vers le haut
const handleScroll = async () => {
  if (!messagesContainer.value || !selectedGroup.value) return;

  const container = messagesContainer.value;
  const scrollTop = container.scrollTop;

  // Si l'utilisateur est proche du haut (50px du haut)
  if (scrollTop < 50 && pagination.value?.hasMore && !pagination.value?.loading && !loadingMore.value) {
    loadingMore.value = true;

    // Sauvegarder la hauteur actuelle du scroll pour maintenir la position
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    try {
      await groupsStore.loadMoreMessages(selectedGroup.value.id);

      // Restaurer la position de scroll après le chargement
      await nextTick();
      const newScrollHeight = container.scrollHeight;
      const scrollHeightDifference = newScrollHeight - previousScrollHeight;
      container.scrollTop = previousScrollTop + scrollHeightDifference;
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      loadingMore.value = false;
    }
  }
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !selectedGroup.value) return;

  const messageContent = newMessage.value.trim();
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Créer le message optimiste
  const optimisticMessage = {
    tempId,
    content: messageContent,
    user_id: authStore.user?.id,
    group_id: selectedGroup.value.id,
    created_at: new Date().toISOString(),
    sending: true, // Indicateur d'envoi en cours
    user: authStore.user
  };

  // Ajouter le message optimiste immédiatement
  groupsStore.addOptimisticMessage(selectedGroup.value.id, optimisticMessage);

  // Vider l'input immédiatement pour permettre un nouveau message
  newMessage.value = '';

  // Scroller vers le bas
  await nextTick();
  scrollToBottom();

  try {
    // Envoyer le message au serveur
    const sentMessage = await groupsStore.sendMessage(selectedGroup.value.id, messageContent);

    // Remplacer le message optimiste par le message réel du serveur
    groupsStore.replaceOptimisticMessage(selectedGroup.value.id, tempId, sentMessage);

    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);

    // Marquer le message comme échoué
    groupsStore.markMessageAsFailed(selectedGroup.value.id, tempId);
  }
}

const scrollToBottom = () => {
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

const isOwnMessage = (message) => {
  return message.user_id === authStore.user?.id
}

const showAvatar = (index) => {
  if (index === 0) return true
  return messages.value[index - 1].user_id !== messages.value[index].user_id
}

const getUserName = (message) => {
  return message.user?.name || message.user?.email || 'Utilisateur inconnu'
}

const getMessageDate = (message) => {
  const date = message.created_at || message.createdAt
  if (!date) return ''

  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

const goToProfile = (user) => {
  if (!user?.id) return

  // Déterminer le type de profil selon le rôle
  if (user.role === 'startuper' && user.startup_id) {
    router.push(`/startups/${user.startup_id}`)
  } else if (user.id === authStore.user?.id) {
    router.push('/profile')
  } else {
    // Pour les autres utilisateurs, rediriger vers leur page publique si disponible
    router.push(`/profile/${user.id}`)
  }
}

const selectGroup = (group) => {
  selectedGroup.value = group
  showMobileSidebar.value = false
}

// Setup Realtime pour les messages de groupe via Laravel Reverb
const setupRealtimeSubscription = (groupId) => {
  if (!groupId) return;

  // Quitter l'ancien canal
  if (currentChannelName) {
    leaveChannel(currentChannelName);
  }

  currentChannelName = `groups.${groupId}`;

  // S'abonner au canal Reverb pour ce groupe
  subscribeToGroupMessages(groupId, {
    onMessageSent: (message) => {
      console.log('[Reverb] 📬 Message reçu:', message);

      if (!groupsStore.groupMessages[groupId]) {
        groupsStore.groupMessages[groupId] = [];
      }

      // Vérifier si le message n'existe pas déjà (éviter duplications)
      const exists = groupsStore.groupMessages[groupId].some((m) => m.id === message.id);
      if (!exists) {
        groupsStore.groupMessages[groupId].push(message);
        setTimeout(() => scrollToBottom(), 100);
      }
    },
    onMessageUpdated: (message) => {
      console.log('[Reverb] ✏️ Message modifié:', message);
      const index = groupsStore.groupMessages[groupId]?.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        groupsStore.groupMessages[groupId][index] = message;
      }
    },
    onMessageDeleted: (event) => {
      console.log('[Reverb] 🗑️ Message supprimé:', event);
      if (groupsStore.groupMessages[groupId]) {
        groupsStore.groupMessages[groupId] = groupsStore.groupMessages[groupId].filter(
          (m) => m.id !== event.message_id,
        );
      }
    }
  });
}

// Watchers
watch(selectedGroup, (group) => {
  if (group) {
    loadMessages(group.id)
    setupRealtimeSubscription(group.id)
  }
})

onMounted(async () => {
  await loadGroups()
})

onUnmounted(() => {
  if (currentChannelName) {
    leaveChannel(currentChannelName);
  }
})
</script>
