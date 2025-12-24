<template>
  <div class="h-[calc(100vh-16rem)] flex gap-6 relative">
    <!-- Sidebar - Conversations List -->
    <div :class="['w-full md:w-80 flex-shrink-0', showMobileChat ? 'hidden md:block' : 'block']">
      <Card class="h-full flex flex-col p-0 overflow-hidden" :noPadding="true">
        <!-- Header avec gradient -->
        <div class="p-4 bg-gradient-to-br from-theme-400 to-theme-600 text-white">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <Icon name="MessageCircle" :size="20" />
              Messages
            </h2>
            <Button variant="ghost" size="sm" @click="showNewConversation = true" class="text-white hover:bg-white/20">
              <Icon name="Plus" :size="18" />
            </Button>
          </div>
          <div class="flex items-center gap-2 text-sm text-white/90">
            <span>{{ conversations.length }} conversation{{ conversations.length > 1 ? 's' : '' }}</span>
            <span v-if="totalUnread > 0" class="px-2 py-0.5 bg-white/30 backdrop-blur-sm rounded-full font-semibold">
              {{ totalUnread }} non lu{{ totalUnread > 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading skeletons -->
          <template v-if="loading">
            <ConversationSkeleton v-for="i in 5" :key="i" />
          </template>

          <!-- Empty state inside sidebar -->
          <div v-else-if="conversations.length === 0" class="p-6 text-center">
            <Icon name="MessageCircle" :size="48" class="mx-auto text-gray-300 mb-3" />
            <p class="text-sm text-gray-500 mb-4">Aucune conversation</p>
            <Button size="sm" @click="showNewConversation = true">
              <Icon name="Plus" :size="16" />
              Démarrer une discussion
            </Button>
          </div>

          <button v-for="conv in conversations" :key="conv.user.id" @click="selectConversation(conv.user)"
            @mouseenter="prefetchConversation(conv.user.id)" :class="[
              'w-full p-4 flex items-start gap-3 transition-all duration-200 border-l-4 relative group',
              selectedUser?.id === conv.user.id
                ? 'bg-gradient-to-r from-theme-50 to-purple-50 border-theme shadow-sm'
                : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
            ]">
            <!-- Avatar avec ring animé -->
            <div class="relative flex-shrink-0">
              <div :class="[
                'absolute inset-0 rounded-full bg-theme-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300',
                selectedUser?.id === conv.user.id && 'opacity-30 animate-pulse'
              ]" />
              <div v-if="conv.user.photo"
                class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md relative z-10">
                <img :src="conv.user.photo" :alt="conv.user.name" class="w-full h-full object-cover" />
              </div>
              <div v-else :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white relative z-10',
                selectedUser?.id === conv.user.id ? 'bg-gradient-to-br from-theme-400 to-theme-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
              ]">
                {{ conv.user.name?.[0]?.toUpperCase() || '?' }}
              </div>
              <!-- Indicateur en ligne amélioré -->
              <div v-if="conv.user.is_online" class="absolute bottom-0 right-0 z-20">
                <div class="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm">
                  <div class="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
            </div>

            <!-- Conversation Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between mb-1.5">
                <h3 :class="[
                  'font-bold truncate text-base transition-colors',
                  selectedUser?.id === conv.user.id ? 'text-theme-700' : 'text-gray-900 group-hover:text-theme-600'
                ]">
                  {{ conv.user.name }}
                </h3>
                <span class="text-xs font-medium" :class="[
                  conv.unread_count > 0 ? 'text-theme-600' : 'text-gray-400'
                ]">
                  {{ formatTimeAgo(conv.last_message?.created_at) }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <p :class="[
                  'text-sm truncate flex-1',
                  conv.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                ]">
                  {{ conv.last_message?.content || 'Démarrer la conversation...' }}
                </p>
                <span v-if="conv.unread_count > 0"
                  class="flex-shrink-0 min-w-[24px] h-6 px-2 bg-gradient-to-r from-theme-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {{ conv.unread_count > 9 ? '9+' : conv.unread_count }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>

    <!-- Main Chat Area -->
    <div :class="['flex-1 flex flex-col min-w-0', !showMobileChat ? 'hidden md:flex' : 'flex']">
      <Card v-if="!selectedUser"
        class="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div class="text-center space-y-4 p-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full shadow-lg animate-pulse">
            <Icon name="MessageCircle" :size="40" class="text-white" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-gray-900">Sélectionnez une conversation</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Choisissez une conversation dans la liste ou créez-en une nouvelle pour commencer à échanger
            </p>
          </div>
          <div class="inline-flex items-center justify-center w-full h-full bg-gradient-to-br">
            <Button @click="showNewConversation = true"
              class="mt-4 bg-gradient-to-br from-theme-400 to-theme-600 hover:from-theme-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Icon name="Plus" :size="18" />
              <span>Nouvelle conversation</span>
            </Button>
          </div>

        </div>
      </Card>

      <Card v-else class="h-full flex flex-col p-0" :noPadding="true">
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Back Button (Mobile) -->
            <Button variant="ghost" size="sm" @click="backToConversations"
              class="md:hidden p-2 -ml-2 text-gray-500 hover:text-theme-600">
              <Icon name="ArrowLeft" :size="20" />
            </Button>

            <button @click="viewUserProfile(selectedUser)"
              class="flex items-center gap-3 hover:bg-white hover:shadow-md rounded-lg p-2 -m-2 transition-all duration-200"
              title="Voir le profil">
              <div class="relative">
                <div v-if="selectedUser.photo"
                  class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-theme-500/20 shadow-md">
                  <img :src="selectedUser.photo" :alt="selectedUser.name" class="w-full h-full object-cover" />
                </div>
                <div v-else
                  class="w-10 h-10 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-theme-500/20">
                  {{ selectedUser.name?.[0]?.toUpperCase() }}
                </div>
                <!-- Online indicator -->
                <div v-if="selectedUser.is_online"
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full">
                  <span class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></span>
                </div>
              </div>
              <div class="text-left">
                <h2 class="font-bold text-gray-900">{{ selectedUser.name }}</h2>
                <p class="text-xs text-gray-500 flex items-center gap-1">
                  <span v-if="selectedUser.is_online" class="inline-flex items-center gap-1 text-green-600 font-medium">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    En ligne
                  </span>
                  <span v-else class="text-gray-400">Hors ligne</span>
                </p>
              </div>
            </button>
          </div>

          <div class="flex gap-2">
            <button @click="viewUserProfile(selectedUser)"
              class="p-2.5 text-gray-600 hover:text-theme-600 hover:bg-theme-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Voir le profil">
              <Icon name="User" :size="18" />
            </button>
            <button disabled class="p-2.5 text-gray-400 bg-gray-50 rounded-xl cursor-not-allowed opacity-50"
              title="Appel audio (prochainement)">
              <Icon name="Phone" :size="18" />
            </button>
            <button disabled class="p-2.5 text-gray-400 bg-gray-50 rounded-xl cursor-not-allowed opacity-50"
              title="Appel vidéo (prochainement)">
              <Icon name="Video" :size="18" />
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white flex flex-col"
          style="background-image: radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);">
          <!-- Skeleton de chargement pour les messages -->
          <MessagesSkeleton v-if="loadingMessages" />

          <template v-else-if="currentMessages.length === 0">
            <div class="flex items-center justify-center h-full">
              <EmptyState title="Aucun message" description="Commencez la conversation en envoyant un message">
                <template #icon>
                  <Icon name="MessageCircle" :size="40" />
                </template>
              </EmptyState>
            </div>
          </template>

          <template v-else>
            <!-- Spacer to push messages to bottom if few -->
            <div class="mt-auto"></div>

            <div v-for="(message, index) in currentMessages" :key="message.id"
              :class="['flex gap-3 animate-fadeInUp', isOwnMessage(message) ? 'flex-row-reverse' : '']"
              :style="{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }">
              <!-- Avatar (only for first message in sequence) -->
              <template v-if="showAvatar(index)">
                <div v-if="isOwnMessage(message)" class="flex-shrink-0">
                  <div v-if="authUser?.photo"
                    class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-theme-500/30 shadow-md">
                    <img :src="authUser.photo" :alt="authUser.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    class="w-8 h-8 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-theme-500/30 shadow-md">
                    {{ authUser?.name?.[0]?.toUpperCase() }}
                  </div>
                </div>
                <div v-else class="flex-shrink-0">
                  <div v-if="selectedUser.photo"
                    class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-md">
                    <img :src="selectedUser.photo" :alt="selectedUser.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    class="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-gray-200 shadow-md">
                    {{ selectedUser.name?.[0]?.toUpperCase() }}
                  </div>
                </div>
              </template>
              <div v-else class="w-8 flex-shrink-0" />

              <!-- Message Bubble -->
              <div :class="['flex-1 max-w-lg flex flex-col', isOwnMessage(message) ? 'items-end' : 'items-start']">
                <div :class="[
                  'group relative px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-[1.02]',
                  isOwnMessage(message)
                    ? 'bg-gradient-to-br from-theme-400 to-theme-600 text-white rounded-tr-sm shadow-md hover:shadow-lg'
                    : 'bg-white text-gray-900 rounded-tl-sm shadow-md hover:shadow-lg border border-gray-100'
                ]">
                  <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {{ message.content }}
                  </p>

                  <!-- Message actions (edit/delete) - show on hover for own messages -->
                  <div v-if="isOwnMessage(message)"
                    class="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 flex gap-1 bg-white rounded-lg shadow-xl p-1 border border-gray-200 z-10">
                    <button v-if="canEdit(message)" @click="editMessage(message)"
                      class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Modifier">
                      <Icon name="Edit" :size="14" class="text-gray-600" />
                    </button>
                    <button @click="deleteMessage(message.id)" class="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer">
                      <Icon name="Trash2" :size="14" class="text-red-600" />
                    </button>
                  </div>
                </div>

                <!-- Timestamp -->
                <span :class="[
                  'text-xs mt-1.5 flex items-center gap-1.5',
                  isOwnMessage(message) ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <!-- Status Indicators -->
                  <template v-if="isOwnMessage(message)">
                    <span v-if="message.is_sending" class="flex items-center gap-1 text-theme-500">
                      <Icon name="Loader2" :size="12" class="animate-spin" /> Envoi...
                    </span>
                    <span v-else-if="message.read_at" class="flex items-center gap-1 text-blue-500" title="Lu">
                      <Icon name="CheckCheck" :size="16" />
                    </span>
                    <span v-else class="flex items-center gap-1 text-gray-400" title="Envoyé">
                      <Icon name="Check" :size="16" />
                    </span>
                  </template>

                  {{ formatTime(message.created_at) }}
                  <span v-if="message.is_edited" class="inline-flex items-center gap-1 text-gray-400">
                    <Icon name="Edit" :size="10" />
                    modifié
                  </span>
                </span>
              </div>
            </div>
            <div ref="messagesEnd" />
          </template>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white">
          <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
            <!-- Attachment button (disabled for now) -->
            <button type="button" disabled
              class="p-3 text-gray-400 hover:text-theme-500 hover:bg-theme-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Joindre un fichier (prochainement)">
              <Icon name="Paperclip" :size="20" />
            </button>

            <!-- Input field with enhanced styling -->
            <div class="flex-1 relative">
              <input type="text" placeholder="Écrivez votre message..." v-model="newMessage"
                @keydown.enter.exact.prevent="handleSendMessage"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-theme-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:border-gray-300 text-sm" />
              <!-- Emoji button (visual only for now) -->
              <button type="button" disabled
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-theme-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Émojis (prochainement)">
                <Icon name="Smile" :size="20" />
              </button>
            </div>

            <!-- Send button with gradient and animation -->
            <Button type="submit" :disabled="!newMessage.trim()"
              class="bg-gradient-to-br from-theme-400 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 min-w-[100px] justify-center">
              <Icon name="Send" :size="18" class="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Envoyer</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>

    <!-- New Conversation Modal -->
    <NewConversationModal :show="showNewConversation" @close="showNewConversation = false"
      @select="handleSelectUserForNewConversation" />

    <!-- Edit Message Modal -->
    <EditMessageModal :show="showEditMessage" :message="messageToEdit" @close="showEditMessage = false"
      @save="saveEditedMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMessagesStore } from '@/stores/messagesStore';
import { useAuthStore } from '@/stores/authStore';
import { useReverb } from '@/composables/useReverb';
import { useToast } from '@/composables/useToast';
import { Card, Button, EmptyState, Icon } from '@/components/ui';
import ConversationSkeleton from '@/components/skeletons/ConversationSkeleton.vue';
import MessagesSkeleton from '@/components/skeletons/MessagesSkeleton.vue';
import NewConversationModal from '@/components/modals/NewConversationModal.vue';
import EditMessageModal from '@/components/modals/EditMessageModal.vue';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const route = useRoute();
const messagesStore = useMessagesStore();
const authStore = useAuthStore();
const toast = useToast();
const { subscribeToPrivateMessages, leaveAllChannels, isConnected } = useReverb();

const authUser = computed(() => authStore.user);
const conversations = computed(() => messagesStore.conversations);
const totalUnread = computed(() => messagesStore.totalUnread);

const loading = ref(true);
const loadingMessages = ref(false);
const selectedUser = ref(null);
const currentMessages = ref([]);
const newMessage = ref('');
const sending = ref(false);
const showNewConversation = ref(false);
const showEditMessage = ref(false);
const messageToEdit = ref(null);
const messagesContainer = ref(null);
const messagesEnd = ref(null);
const realtimeSubscription = ref(null);
const pollingInterval = ref(null);
const lastMessageId = ref(null);

// Infinite Scroll State
const nextCursor = ref(null);
const hasMore = ref(false);
const isLoadingMore = ref(false);

// Responsive State
const showMobileChat = ref(false);

function backToConversations() {
  showMobileChat.value = false;
  selectedUser.value = null;
}

// Préchargement des messages au survol d'une conversation
function prefetchConversation(userId) {
  // Ne pas précharger si déjà sélectionné
  if (selectedUser.value?.id === userId) return;

  // Précharger en arrière-plan (sans attendre)
  messagesStore.prefetchMessages(userId);
}

// Précharge automatiquement les messages des premières conversations
async function prefetchTopConversations(count = 3) {
  const convs = messagesStore.conversations;
  if (!convs || convs.length === 0) return;

  // Précharger les N premières conversations en parallèle
  const toPrefetch = convs.slice(0, count);
  toPrefetch.forEach(conv => {
    if (conv.user?.id) {
      messagesStore.prefetchMessages(conv.user.id);
    }
  });
}

// Load conversations avec cache optimisé
async function loadConversations() {
  // Afficher le loading seulement si pas de données en cache
  const hasCache = messagesStore.conversations.length > 0;
  loading.value = !hasCache;

  try {
    await messagesStore.loadConversations();

    // Précharger les premières conversations en arrière-plan
    prefetchTopConversations(3);
  } catch (error) {
    console.error('Error loading conversations:', error);
    toast.error('Erreur lors du chargement des conversations');
  } finally {
    // Supprimer le délai pour un affichage instantané
    loading.value = false;
  }
}

// Sélectionner une conversation et charger les messages
async function selectConversation(user) {
  selectedUser.value = user;
  showMobileChat.value = true;
  loadingMessages.value = true;
  nextCursor.value = null;
  hasMore.value = false;

  // Réinitialiser les messages immédiatement pour éviter d'afficher l'ancienne conversation
  currentMessages.value = [];

  try {
    const response = await messagesStore.loadMessages(user.id);
    // response is { data: [...], meta: {...}, links: {...} }
    // or just [...] if from cache (legacy, but we updated store to return object)

    let messages = [];
    if (response.data) {
      messages = response.data;
      nextCursor.value = response.links?.next ? response.meta?.next_cursor : null;
      hasMore.value = !!nextCursor.value;
    } else {
      messages = response; // Fallback for cache if not updated structure
    }

    currentMessages.value = [...messages];

    // Scroll to bottom on initial load
    nextTick(() => scrollToBottom());

    // Mark as read
    const unreadMessages = messages.filter(m => !m.read_at && m.sender_id === user.id);
    if (unreadMessages.length > 0) {
      messagesStore.markAsRead(unreadMessages.map(m => m.id));
    }

    // Setup realtime
    setupRealtimeSubscription(user.id);

  } catch (error) {
    console.error('Error loading messages:', error);
    toast.error('Erreur lors du chargement des messages');
  } finally {
    loadingMessages.value = false;
  }
}

// Charger plus de messages (défilement infini)
async function loadMoreMessages() {
  if (!nextCursor.value || isLoadingMore.value) return;

  isLoadingMore.value = true;
  const oldHeight = messagesContainer.value?.scrollHeight || 0;

  try {
    const response = await messagesStore.loadMessages(selectedUser.value.id, { cursor: nextCursor.value });

    if (response.data) {
      // Store handles prepending, we just need to update local state
      currentMessages.value = messagesStore.getMessagesForUser(selectedUser.value.id);

      nextCursor.value = response.links?.next ? response.meta?.next_cursor : null;
      hasMore.value = !!nextCursor.value;

      // Restore scroll position
      await nextTick();
      const newHeight = messagesContainer.value?.scrollHeight || 0;
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = newHeight - oldHeight;
      }
    }
  } catch (error) {
    console.error('Error loading more messages:', error);
  } finally {
    isLoadingMore.value = false;
  }
}

// Gérer le défilement pour le chargement infini
function handleScroll(e) {
  if (e.target.scrollTop === 0 && hasMore.value && !isLoadingMore.value) {
    loadMoreMessages();
  }
}
function setupRealtimeSubscription(userId) {
  if (realtimeSubscription.value) {
    leaveAllChannels();
  }

  console.log(`[Realtime] 📩 Abonnement aux messages privés pour user ${authUser.value.id}`);

  realtimeSubscription.value = subscribeToPrivateMessages(authUser.value.id, {
    onMessageSent: (message) => handleRealtimeMessage(message, 'insert'),
    onMessageUpdated: (message) => handleRealtimeMessage(message, 'update'),
    onMessageDeleted: (data) => handleRealtimeMessage({ id: data.message_id, sender_id: data.sender_id, receiver_id: data.receiver_id }, 'delete'),
    onMessageRead: (data) => handleRealtimeMessage(data, 'read'),
  });

  // Messages temps réel gérés uniquement via Reverb WebSocket
  console.log('[Realtime] ✅ Abonnement Reverb configuré - pas de polling AJAX');
}


// Handle realtime message updates
async function handleRealtimeMessage(message, type = 'insert') {
  console.log('Handling realtime message:', { message, type });
  console.log('Debug Realtime:', {
    authUserId: authUser.value?.id,
    selectedUserId: selectedUser.value?.id,
    messageSenderId: message.sender_id,
    messageReceiverId: message.receiver_id,
    type
  });

  // Explicit check for conversation match
  const isSenderSelected = message.sender_id == selectedUser.value?.id;
  const isReceiverSelected = message.receiver_id == selectedUser.value?.id;
  const isSenderMe = message.sender_id == authUser.value?.id;
  const isReceiverMe = message.receiver_id == authUser.value?.id;

  // It's the current conversation if:
  // 1. I received it from the selected user (Sender=Selected, Receiver=Me)
  // 2. I sent it to the selected user (Sender=Me, Receiver=Selected)
  const isCurrentConversation = (isSenderSelected && isReceiverMe) || (isSenderMe && isReceiverSelected);

  // Fallback: If authUser is missing (rare), assume if sender is selected user, it's for us
  const isFallbackMatch = !authUser.value?.id && isSenderSelected;

  const shouldUpdate = isCurrentConversation || isFallbackMatch;

  console.log('Debug Realtime Logic:', {
    isSenderSelected,
    isReceiverSelected,
    isSenderMe,
    isReceiverMe,
    isCurrentConversation,
    shouldUpdate
  });

  const otherUserId = message.sender_id == authUser.value?.id ? message.receiver_id : message.sender_id;

  if (type === 'insert') {
    // 1. Update current conversation if open
    if (shouldUpdate) {
      const exists = currentMessages.value.find(m => m.id == message.id);
      if (!exists) {
        currentMessages.value.push(message);
        messagesStore.addRealtimeMessage(message);
        nextTick(() => scrollToBottom());
      }

      // Mark as read if current conversation
      if (message.sender_id != authUser.value.id) {
        messagesStore.markAsRead([message.id]).catch(console.error);
      }
    }

    // 2. Update conversation list (global)
    await updateConversationList(message, otherUserId);

  } else if (type === 'update') {
    if (shouldUpdate) {
      const index = currentMessages.value.findIndex(m => m.id == message.id);
      if (index !== -1) currentMessages.value[index] = message;
    }
    updateConversationLocally(message);
  } else if (type === 'delete') {
    if (shouldUpdate) {
      const index = currentMessages.value.findIndex(m => m.id == message.id);
      if (index !== -1) currentMessages.value.splice(index, 1);
    }
  } else if (type === 'read') {
    const { message_ids, user_id, read_at } = message;
    if (selectedUser.value?.id == user_id) {
      message_ids.forEach(id => {
        const msg = currentMessages.value.find(m => m.id == id);
        if (msg) msg.read_at = read_at;
      });
    }
  }
}

// Update conversation list (add if new, update if exists)
async function updateConversationList(message, otherUserId) {
  const convs = messagesStore.conversations;
  const existingConvIndex = convs.findIndex(c => c.user?.id == otherUserId);

  if (existingConvIndex !== -1) {
    // Update existing conversation
    const existingConv = convs[existingConvIndex];
    existingConv.last_message = {
      content: message.content,
      created_at: message.created_at,
      sender_id: message.sender_id,
      is_mine: message.sender_id == authUser.value.id
    };

    // Incrémenter le compteur de non-lus si c'est un message reçu et qu'on n'est pas dans cette conversation
    if (message.sender_id != authUser.value.id && !message.read_at && selectedUser.value?.id != otherUserId) {
      existingConv.unread_count = (existingConv.unread_count || 0) + 1;
    }

    // Move to top if not already
    if (existingConvIndex > 0) {
      convs.splice(existingConvIndex, 1);
      convs.unshift(existingConv);
    }

    console.log('[Realtime] ✅ Conversation mise à jour:', existingConv);
  } else {
    // Nouvelle conversation!
    console.log('[Realtime] 🆕 Nouvelle conversation détectée avec userId:', otherUserId);

    // Déterminer les infos de l'autre utilisateur
    let otherUser = null;

    if (message.sender_id == authUser.value.id) {
      // J'ai envoyé le message - l'autre user est le receiver
      // On utilise selectedUser s'il correspond, sinon on a besoin du receiver
      if (selectedUser.value?.id == message.receiver_id) {
        otherUser = selectedUser.value;
      } else {
        // Fallback: recharger les conversations
        await messagesStore.loadConversations({}, true);
        return;
      }
    } else {
      // J'ai reçu le message - l'autre user est le sender
      otherUser = message.sender;
    }

    if (otherUser && otherUser.id) {
      const newConv = {
        user: {
          id: otherUser.id,
          name: otherUser.name,
          photo: otherUser.photo,
          is_online: true // Assume online if they just sent/received a message
        },
        last_message: {
          content: message.content,
          created_at: message.created_at,
          sender_id: message.sender_id,
          is_mine: message.sender_id == authUser.value.id
        },
        unread_count: message.sender_id != authUser.value.id ? 1 : 0
      };

      convs.unshift(newConv);
      console.log('[Realtime] ✅ Nouvelle conversation ajoutée:', newConv);
    } else {
      // Fallback: recharger les conversations depuis le serveur
      console.log('[Realtime] ⚠️ Impossible de déterminer l\'utilisateur, rechargement des conversations...');
      await messagesStore.loadConversations({}, true);
    }
  }
}

// Mettre à jour la conversation localement sans recharger (Legacy helper, kept for compatibility)
function updateConversationLocally(message) {
  const otherUserId = message.sender_id == authUser.value.id ? message.receiver_id : message.sender_id;
  updateConversationList(message, otherUserId);
}

// Send message
async function handleSendMessage() {
  if (!newMessage.value.trim() || !selectedUser.value) return;

  // sending.value = true; // Don't block
  const content = newMessage.value.trim();
  newMessage.value = '';

  // Ajout optimiste immédiat avec ID temporaire
  const tempId = `tmp_${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    content,
    sender_id: authUser.value.id,
    receiver_id: selectedUser.value.id,
    created_at: new Date().toISOString(),
    read_at: null,
    is_edited: false,
    sender: authUser.value,
    is_sending: true // Flag for UI
  };

  currentMessages.value.push(optimisticMessage);
  updateConversationList(optimisticMessage, selectedUser.value.id);
  nextTick(() => scrollToBottom());

  try {
    const sent = await messagesStore.sendMessage(selectedUser.value.id, content);

    // Réconciliation
    if (sent && sent.id) {
      const idx = currentMessages.value.findIndex(m => m.id == tempId);
      if (idx !== -1) {
        currentMessages.value[idx] = {
          ...optimisticMessage,
          id: sent.id,
          created_at: sent.created_at || optimisticMessage.created_at,
          is_sending: false
        };
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    const idx = currentMessages.value.findIndex(m => m.id == tempId);
    if (idx !== -1) {
      // Mark as failed instead of removing?
      currentMessages.value.splice(idx, 1);
      newMessage.value = content; // Restore content
    }
  }
}

// Edit message (within 15 minutes)
function editMessage(message) {
  messageToEdit.value = message;
  showEditMessage.value = true;
}

// Save edited message
async function saveEditedMessage(newContent) {
  if (!messageToEdit.value) return;

  try {
    await messagesStore.updateMessage(messageToEdit.value.id, newContent);

    // Update local message
    const index = currentMessages.value.findIndex(m => m.id == messageToEdit.value.id);
    if (index !== -1) {
      currentMessages.value[index].content = newContent;
      currentMessages.value[index].is_edited = true;
    }

    toast.success('Message modifié');
    showEditMessage.value = false;
    messageToEdit.value = null;
  } catch (error) {
    console.error('Error updating message:', error);
    toast.error('Erreur lors de la modification du message');
  }
}

// Delete message
async function deleteMessage(messageId) {
  if (!confirm('Supprimer ce message ?')) return;

  try {
    await messagesStore.deleteMessage(messageId);
    toast.success('Message supprimé');
  } catch (error) {
    console.error('Error deleting message:', error);
    toast.error('Erreur lors de la suppression');
  }
}

// Helper functions
function isOwnMessage(message) {
  return message.sender_id == authUser.value?.id;
}

function showAvatar(index) {
  if (index === 0) return true;
  return currentMessages.value[index - 1].sender_id != currentMessages.value[index].sender_id;
}

function canEdit(message) {
  if (!isOwnMessage(message)) return false;
  const fifteenMinutes = 15 * 60 * 1000;
  const messageTime = new Date(message.created_at).getTime();
  return Date.now() - messageTime < fifteenMinutes;
}

function canDelete(message) {
  return isOwnMessage(message);
}

function scrollToBottom() {
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' });
}

function formatTimeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();

  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Handle user selection from new conversation modal
function handleSelectUserForNewConversation(user) {
  showNewConversation.value = false;

  // Check if conversation already exists
  const existingConv = conversations.value.find(c => c.user.id === user.id);
  if (existingConv) {
    selectConversation(existingConv.user);
  } else {
    // Start new conversation - ajouter immédiatement à la liste des conversations
    selectedUser.value = user;
    showMobileChat.value = true;
    currentMessages.value = [];

    // Créer une nouvelle entrée de conversation dans la liste (optimiste)
    const newConv = {
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo,
        is_online: false
      },
      last_message: null,
      unread_count: 0
    };

    // Ajouter en haut de la liste des conversations
    messagesStore.conversations.unshift(newConv);
    console.log('[Conversations] 🆕 Nouvelle conversation ajoutée pour:', user.name);

    // Setup realtime via Reverb for this new conversation
    setupRealtimeSubscription(user.id);
  }
}

// View user profile (read-only)
function viewUserProfile(user) {
  if (!user || !user.id) return;

  // Navigate to user profile page
  window.open(`/users/${user.id}`, '_blank');
}

// Polling AJAX pour rafraîchir les messages en arrière-plan (backup du realtime)
function startPolling() {
  // Arrêter le polling précédent s'il existe
  stopPolling();

  // Polling toutes les 2 secondes (plus réactif)
  pollingInterval.value = setInterval(async () => {
    if (!selectedUser.value) return;

    try {
      // Charger uniquement les nouveaux messages (optimisation)
      const messages = await messagesStore.loadMessages(selectedUser.value.id);

      if (messages && messages.length > 0) {
        const newestMessage = messages[messages.length - 1];

        // Détecter UNIQUEMENT les nouveaux messages
        const newMessages = messages.filter(m =>
          !currentMessages.value.find(cm => cm.id === m.id)
        );

        if (newMessages.length > 0) {
          console.log(`[AJAX Polling] ✨ ${newMessages.length} nouveau(x) message(s) détecté(s)`);

          // Ajouter uniquement les nouveaux messages (évite le re-render complet)
          newMessages.forEach(msg => {
            currentMessages.value.push(msg);
          });

          lastMessageId.value = newestMessage.id;

          // Scroll automatique si nouveau message reçu
          if (newMessages.some(m => m.sender_id !== authUser.value.id)) {
            await nextTick();
            scrollToBottom();
          }
        }
      }
    } catch (error) {
      // Silence les erreurs pour ne pas polluer la console
      if (error.response?.status !== 401) {
        console.warn('[AJAX Polling] Erreur silencieuse:', error.message);
      }
    }
  }, 2000); // 2 secondes pour plus de réactivité

  console.log('[AJAX Polling] 🚀 Démarré pour user', selectedUser.value?.id);
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
    console.log('[AJAX Polling] Arrêté');
  }
}

onMounted(async () => {
  await loadConversations();

  // Gérer les paramètres URL pour ouvrir une conversation spécifique
  if (route.query.conversation || route.query.userId) {
    // Conversation existante par ID ou userId
    const targetUserId = route.query.userId ? parseInt(route.query.userId) : null;
    const conv = conversations.value.find(c =>
      c.id === parseInt(route.query.conversation) || c.user?.id === targetUserId
    );
    if (conv) {
      selectConversation(conv.user);
    }
  } else if (route.query.newConversation) {
    // Nouvelle conversation avec un utilisateur
    const newUserId = parseInt(route.query.newConversation);

    // Vérifier si une conversation existe déjà avec cet utilisateur
    const existingConv = conversations.value.find(c => c.user?.id === newUserId);
    if (existingConv) {
      selectConversation(existingConv.user);
    } else {
      // Créer un objet utilisateur temporaire pour démarrer la conversation
      // L'utilisateur sera chargé correctement lors de l'envoi du premier message
      const tempUser = {
        id: newUserId,
        name: 'Nouvelle conversation',
        isTemp: true
      };
      selectConversation(tempUser);
    }
  }
});

onUnmounted(() => {
  stopPolling();
  leaveAllChannels();
});
</script>

<style scoped>
/* Animation d'entrée pour les messages */
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

/* Scrollbar personnalisée pour la zone de messages */
[ref="messagesContainer"]::-webkit-scrollbar {
  width: 6px;
}

[ref="messagesContainer"]::-webkit-scrollbar-track {
  background: transparent;
}

[ref="messagesContainer"]::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #8b5cf6, #a855f7);
  border-radius: 3px;
}

[ref="messagesContainer"]::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #7c3aed, #9333ea);
}

/* Animation du bouton d'envoi au hover */
button:hover .group-hover\:translate-x-0\.5 {
  transform: translateX(2px);
}

/* Amélioration du focus sur l'input */
input:focus {
  transform: scale(1.005);
}
</style>
