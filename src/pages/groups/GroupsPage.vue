<template>
  <div class="h-[calc(100vh-16rem)] flex flex-col lg:flex-row gap-6">
    <!-- Sidebar - Groups List -->
    <div class="w-full lg:w-80 lg:flex-shrink-0">
      <Card class="h-full flex flex-col p-0 overflow-hidden" :noPadding="true">
        <!-- Header avec gradient -->
        <div class="p-4 bg-gradient-to-br from-theme-400 to-theme-600 text-white">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <Icon name="Users" :size="20" />
              Groupes
            </h2>
            <div class="flex gap-2">
              <button
                @click="showGroupSearch = true"
                class="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Rechercher un groupe"
              >
                <Icon name="Search" :size="18" />
              </button>
              <button
                v-if="['startuper', 'partenaire', 'admin'].includes(authUser?.role)"
                @click="showCreateGroup = true"
                class="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Créer un groupe"
              >
                <Icon name="Plus" :size="18" />
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-white/90">
            <span>{{ groups.length }} groupe{{ groups.length > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="px-1 py-2 border-b border-gray-200 flex gap-2 bg-gray-50">
          <button
            v-for="filter in groupFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-2 py-1 text-sm rounded-xl font-medium transition-all duration-200',
              activeFilter === filter.value
                ? 'bg-gradient-to-br from-theme-400 to-theme-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Groups List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading skeletons -->
          <template v-if="loading">
            <GroupSkeleton v-for="i in 5" :key="i" />
          </template>

          <!-- Empty state inside sidebar -->
          <div v-else-if="groups.length === 0" class="p-6 text-center">
            <Icon name="Users" :size="48" class="mx-auto text-gray-300 mb-3" />
            <p class="text-sm text-gray-500 mb-4">Aucun groupe</p>
            <Button size="sm" @click="showGroupSearch = true">
              <Icon name="Search" :size="16" />
              Rechercher un groupe
            </Button>
            <Button v-if="['startuper', 'partenaire', 'admin'].includes(authUser?.role)" size="sm" @click="showCreateGroup = true" class="mt-2">
              <Icon name="Plus" :size="16" />
              Créer un groupe
            </Button>
          </div>

          <button
            v-else
            v-for="group in filteredGroups"
            :key="group.id"
            @click="selectGroup(group)"
            @mouseenter="prefetchGroup(group.id)"
            :class="[
              'w-full p-4 flex items-start gap-3 transition-all duration-200 border-l-4 relative group',
              selectedGroup?.id === group.id
                ? 'bg-gradient-to-r from-theme-50 to-purple-50 border-theme shadow-sm'
                : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
            ]"
          >
            <!-- Group Icon -->
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ring-2 transition-all duration-200',
              selectedGroup?.id === group.id
                ? 'bg-gradient-to-br from-theme-500 to-purple-600 text-white ring-theme-500/30 scale-110'
                : getGroupColor(group.type) + ' ring-white group-hover:scale-105'
            ]">
              <Icon :name="getGroupIcon(group.type)" :size="20" />
            </div>

            <!-- Group Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between mb-1.5">
                <h3 :class="[
                  'font-bold truncate text-base transition-colors',
                  selectedGroup?.id === group.id ? 'text-theme-700' : 'text-gray-900 group-hover:text-theme-600'
                ]">
                  {{ group.name }}
                </h3>
                <span v-if="group.type === 'sectoral'" class="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs rounded-full font-medium shadow-sm">
                  Sectoriel
                </span>
                <span v-else-if="group.type === 'startup-only'" class="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-xs rounded-full font-medium shadow-sm">
                  Startup
                </span>
                <span v-else-if="group.type === 'mixed'" class="px-2.5 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-xs rounded-full font-medium shadow-sm">
                  Mixte
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <Icon name="Users" :size="12" class="opacity-60" />
                  {{ group.members?.length || 0 }} membre{{ (group.members?.length || 0) > 1 ? 's' : '' }}
                </p>
                <span v-if="group.unread_count > 0" class="flex-shrink-0 min-w-[24px] h-6 px-2 bg-gradient-to-r from-theme-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {{ group.unread_count > 9 ? '9+' : group.unread_count }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <Card v-if="!selectedGroup" class="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div class="text-center space-y-4 p-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-theme-400 to-theme-600 rounded-full shadow-lg animate-pulse">
            <Icon name="Users" :size="40" class="text-white" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-gray-900">Sélectionnez un groupe</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Choisissez un groupe dans la liste pour voir les messages et échanger avec les membres
            </p>
          </div>
          <div class="flex gap-2 justify-center mt-4">
            <Button
              @click="showGroupSearch = true"
              class="bg-gradient-to-br from-theme-400 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Icon name="Search" :size="18" />
              <span>Rechercher un groupe</span>
            </Button>
            <Button
              v-if="['startuper', 'partenaire', 'admin'].includes(authUser?.role)"
              @click="showCreateGroup = true"
              variant="outline"
              class="border-2 border-theme-500 text-theme-600 hover:bg-theme-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Icon name="Plus" :size="18" />
              <span>Créer un groupe</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card v-else class="h-full flex flex-col p-0" :noPadding="true">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white',
              getGroupColor(selectedGroup.type)
            ]">
              <Icon :name="getGroupIcon(selectedGroup.type)" :size="20" class="text-white" />
            </div>
            <div>
              <h2 class="font-bold text-gray-900 flex items-center gap-2">
                {{ selectedGroup.name }}
                <span v-if="selectedGroup.type === 'sectoral'" class="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs rounded-full font-medium shadow-sm">
                  Sectoriel
                </span>
                <span v-else-if="selectedGroup.type === 'startup-only'" class="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-xs rounded-full font-medium shadow-sm">
                  Startup
                </span>
                <span v-else-if="selectedGroup.type === 'mixed'" class="px-2.5 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-xs rounded-full font-medium shadow-sm">
                  Mixte
                </span>
              </h2>
              <p class="text-sm text-gray-500 flex items-center gap-1">
                <Icon name="Users" :size="14" class="opacity-60" />
                {{ selectedGroup.members?.length || 0 }} membre{{ (selectedGroup.members?.length || 0) > 1 ? 's' : '' }}
                <span v-if="selectedGroup.type === 'sectoriel'" class="ml-1">• {{ selectedGroup.secteur }}</span>
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="showGroupInfo = true"
              class="px-4 py-2.5 text-sm font-medium text-theme-600 border-2 border-theme-500 hover:bg-theme-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Icon name="Info" :size="16" />
              Détails
            </button>
            <button
              v-if="canLeaveGroup"
              @click="leaveGroup"
              class="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Quitter le groupe"
            >
              <Icon name="LogOut" :size="18" />
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white" style="background-image: radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);">
          <!-- Skeleton de chargement pour les messages -->
          <MessagesSkeleton v-if="loadingMessages" />

          <template v-else-if="groupMessages.length === 0">
            <div class="flex items-center justify-center h-full">
              <EmptyState
                title="Aucun message"
                description="Soyez le premier à envoyer un message dans ce groupe"
              >
                <template #icon>
                  <Icon name="MessageSquare" :size="40" />
                </template>
              </EmptyState>
            </div>
          </template>

          <template v-else>
            <div
              v-for="(message, index) in groupMessages"
              :key="message.id"
              :class="['flex gap-3 animate-fadeInUp', isOwnMessage(message) ? 'flex-row-reverse' : '']"
              :style="{animationDelay: `${Math.min(index * 0.05, 0.5)}s`}"
            >
              <!-- Avatar (only for first message in sequence) -->
              <template v-if="showAvatar(index)">
                <div v-if="message.user?.photo" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 shadow-md" :class="isOwnMessage(message) ? 'ring-theme-500/30' : 'ring-gray-200'">
                  <img :src="message.user.photo" :alt="message.user.name" class="w-full h-full object-cover" />
                </div>
                <div v-else :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-md ring-2',
                  isOwnMessage(message) ? 'bg-gradient-to-br from-theme-500 to-purple-600 ring-theme-500/30' : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-200'
                ]">
                  {{ message.user?.name?.[0]?.toUpperCase() || '?' }}
                </div>
              </template>
              <div v-else class="w-8 flex-shrink-0" />

              <!-- Message Bubble -->
              <div :class="['flex-1 max-w-lg flex flex-col', isOwnMessage(message) ? 'items-end' : 'items-start']">
                <!-- Show name for group messages (not for own messages) -->
                <div v-if="showAvatar(index) && !isOwnMessage(message)" class="flex items-center gap-2 mb-1.5">
                  <span class="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 text-xs font-bold rounded-full shadow-sm">
                    {{ message.user?.name || 'Utilisateur inconnu' }}
                  </span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <Icon name="Clock" :size="10" class="opacity-60" />
                    {{ formatTimeAgo(message.created_at) }}
                  </span>
                </div>

                <div :class="[
                  'group relative px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-[1.02]',
                  isOwnMessage(message)
                    ? 'bg-gradient-to-br from-theme-500 to-purple-600 text-white rounded-tr-sm shadow-md hover:shadow-lg'
                    : 'bg-white text-gray-900 rounded-tl-sm shadow-md hover:shadow-lg border border-gray-100'
                ]">
                  <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {{ message.content }}
                  </p>

                  <!-- Message actions (edit/delete) for own messages -->
                  <div v-if="isOwnMessage(message) && canEdit(message)"
                    class="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 flex gap-1 bg-white rounded-lg shadow-xl p-1 border border-gray-200">
                    <button @click="editMessage(message)" class="p-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Icon name="Edit" :size="14" class="text-gray-600" />
                    </button>
                    <button @click="deleteMessage(message.id)" class="p-1.5 hover:bg-red-50 rounded transition-colors">
                      <Icon name="Trash2" :size="14" class="text-red-600" />
                    </button>
                  </div>
                </div>

                <!-- Timestamp for own messages -->
                <span v-if="isOwnMessage(message)" :class="[
                  'text-xs mt-1.5 flex items-center gap-1.5',
                  isOwnMessage(message) ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <Icon name="Clock" :size="12" class="opacity-60" />
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
            <button
              type="button"
              disabled
              class="p-3 text-gray-400 hover:text-theme-500 hover:bg-theme-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Joindre un fichier (prochainement)"
            >
              <Icon name="Paperclip" :size="20" />
            </button>

            <!-- Input field with enhanced styling -->
            <div class="flex-1 relative">
              <input
                type="text"
                placeholder="Écrivez votre message au groupe..."
                v-model="newMessage"
                :disabled="sending"
                @keydown.enter.exact.prevent="handleSendMessage"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-theme-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:border-gray-300 text-sm"
              />
              <!-- Emoji button (visual only for now) -->
              <button
                type="button"
                disabled
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-theme-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Émojis (prochainement)"
              >
                <Icon name="Smile" :size="20" />
              </button>
            </div>

            <!-- Send button with gradient and animation -->
            <button
              type="submit"
              :disabled="!newMessage.trim() || sending"
              class="bg-gradient-to-r from-theme-500 to-purple-600 hover:from-theme-600 hover:to-purple-700 text-white px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 min-w-[100px] justify-center"
            >
              <Icon
                name="Send"
                :size="18"
                :class="['transition-transform duration-200', sending ? 'animate-pulse' : 'group-hover:translate-x-0.5']"
              />
              <span>{{ sending ? 'Envoi...' : 'Envoyer' }}</span>
            </button>
          </form>
        </div>
      </Card>
    </div>
  </div>

  <!-- Modal Recherche de Groupes -->
  <GroupSearchModal
    :show="showGroupSearch"
    @close="showGroupSearch = false"
    @select="handleJoinGroup"
  />

  <!-- Modal Création de Groupe -->
  <CreateGroupModal
    :show="showCreateGroup"
    @close="showCreateGroup = false"
    @created="handleCreateGroup"
  />

  <!-- Modal Édition de Message -->
  <EditMessageModal
    :show="showEditMessage"
    :message="messageToEdit"
    @close="showEditMessage = false"
    @save="saveEditedMessage"
  />

  <!-- Modal Info Groupe -->
  <GroupInfoModal
    :show="showGroupInfo"
    :group="selectedGroup"
    @close="showGroupInfo = false"
    @memberAdded="handleMemberAdded"
  />
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { useReverb } from '@/composables/useReverb';
import { useToast } from '@/composables/useToast';
import { Card, Button, EmptyState, Icon } from '@/components/ui';
import GroupSkeleton from '@/components/skeletons/GroupSkeleton.vue';
import MessagesSkeleton from '@/components/skeletons/MessagesSkeleton.vue';
import GroupSearchModal from '@/components/modals/GroupSearchModal.vue';
import CreateGroupModal from '@/components/modals/CreateGroupModal.vue';
import EditMessageModal from '@/components/modals/EditMessageModal.vue';
import GroupInfoModal from '@/components/modals/GroupInfoModal.vue';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const groupsStore = useGroupsStore();
const authStore = useAuthStore();
const toast = useToast();
const { subscribeToGroupMessages, leaveAllChannels, isConnected } = useReverb();

const authUser = computed(() => authStore.user);
const groups = computed(() => groupsStore.groups);

const loading = ref(true);
const loadingMessages = ref(false);
const selectedGroup = ref(null);
const groupMessages = ref([]);
const newMessage = ref('');
const sending = ref(false);
const showCreateGroup = ref(false);
const showGroupSearch = ref(false);
const showGroupInfo = ref(false);
const showEditMessage = ref(false);
const messageToEdit = ref(null);
const activeFilter = ref('all');
const messagesContainer = ref(null);
const messagesEnd = ref(null);
const realtimeSubscription = ref(null);

const groupFilters = computed(() => {
  const filters = [
    { label: 'Tous', value: 'all' },
    { label: 'Sectoriels', value: 'sectoral' },
    { label: 'Startups', value: 'startup-only' },
    { label: 'Mixtes', value: 'mixed' },
  ];

  // Le partenaire ne voit pas les groupes sectoriels
  if (authUser.value?.role === 'partenaire') {
    return filters.filter(f => f.value !== 'sectoral');
  }

  return filters;
});

const filteredGroups = computed(() => {
  if (activeFilter.value === 'all') return groups.value;
  return groups.value.filter(g => g.type === activeFilter.value);
});

const canLeaveGroup = computed(() => {
  if (!selectedGroup.value) return false;
  // Can't leave sectoral groups
  if (selectedGroup.value.type === 'sectoral') return false;
  // Can leave if not creator or if group type allows
  return selectedGroup.value.created_by !== authUser.value?.id;
});

// Load groups avec cache optimisé
async function loadGroups() {
  // Afficher le loading seulement si pas de données en cache
  const hasCache = groupsStore.groups.length > 0;
  loading.value = !hasCache;

  try {
    await groupsStore.loadGroups();

    // Précharger les 3 premiers groupes en arrière-plan
    prefetchTopGroups(3);
  } catch (error) {
    console.error('Error loading groups:', error);
    toast.error('Erreur lors du chargement des groupes');
  } finally {
    loading.value = false;
  }
}

// Préchargement des messages au survol d'un groupe
function prefetchGroup(groupId) {
  // Ne pas précharger si déjà sélectionné
  if (selectedGroup.value?.id === groupId) return;

  // Précharger en arrière-plan
  groupsStore.prefetchGroupMessages(groupId);
}

// Précharge automatiquement les messages des premiers groupes
function prefetchTopGroups(count = 3) {
  const grps = groupsStore.groups;
  if (!grps || grps.length === 0) return;

  // Précharger les N premiers groupes en parallèle
  const toPrefetch = grps.slice(0, count);
  toPrefetch.forEach(group => {
    if (group.id) {
      groupsStore.prefetchGroupMessages(group.id);
    }
  });
}

// Load groups avec cache optimisé
async function selectGroup(group) {
  selectedGroup.value = group;
  loadingMessages.value = true;

  try {
    // Load group messages
    const messages = await groupsStore.loadGroupMessages(group.id);
    groupMessages.value = messages || [];

    // Subscribe to realtime updates via Reverb WebSocket
    if (realtimeSubscription.value) {
      leaveAllChannels();
    }

    console.log(`[Reverb] Subscribing to group messages for group ${group.id}`);
    realtimeSubscription.value = subscribeToGroupMessages(group.id, {
      onMessageSent: (message) => handleRealtimeMessage(message, 'insert'),
      onMessageUpdated: (message) => handleRealtimeMessage(message, 'update'),
      onMessageDeleted: (data) => handleRealtimeMessage({ id: data.message_id }, 'delete'),
    });
    console.log('[Reverb] Group WebSocket subscription active:', isConnected.value);

    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error loading group messages:', error);
    toast.error('Erreur lors du chargement des messages');
  } finally {
    loadingMessages.value = false;
  }
}

// Handle realtime message updates
function handleRealtimeMessage(message, type = 'insert') {
  console.log('[Realtime Groups] Message reçu:', { message, type, selectedGroupId: selectedGroup.value?.id });

  // Vérifier que le message appartient au groupe sélectionné
  if (message.group_id && message.group_id != selectedGroup.value?.id) {
    console.log('[Realtime Groups] Message pour un autre groupe, ignoré');
    return;
  }

  if (type === 'insert') {
    // Éviter les doublons (y compris les messages optimistes)
    const exists = groupMessages.value.find(m =>
      m.id === message.id ||
      (m.id?.toString().startsWith('tmp_') &&
       m.content === message.content &&
       m.user_id == message.user_id)
    );

    if (!exists) {
      groupMessages.value.push(message);
      groupsStore.addRealtimeGroupMessage(selectedGroup.value?.id, message);
      console.log('[Realtime Groups] ✅ Message ajouté au fil');
      nextTick(() => scrollToBottom());
    } else if (exists.id?.toString().startsWith('tmp_')) {
      // C'est un message optimiste qui a été confirmé, le remplacer
      const idx = groupMessages.value.findIndex(m => m.id === exists.id);
      if (idx !== -1) {
        groupMessages.value[idx] = message;
        console.log('[Realtime Groups] ✅ Message optimiste réconcilié');
      }
    }
  } else if (type === 'update') {
    const index = groupMessages.value.findIndex(m => m.id === message.id);
    if (index !== -1) {
      groupMessages.value[index] = message;
      groupsStore.updateRealtimeGroupMessage(selectedGroup.value?.id, message);
      console.log('[Realtime Groups] ✅ Message mis à jour');
    }
  } else if (type === 'delete') {
    const index = groupMessages.value.findIndex(m => m.id === message.id);
    if (index !== -1) {
      groupMessages.value.splice(index, 1);
      groupsStore.deleteRealtimeGroupMessage(selectedGroup.value?.id, message.id);
      console.log('[Realtime Groups] ✅ Message supprimé');
    }
  }
}

// Send message
async function handleSendMessage() {
  if (!newMessage.value.trim() || !selectedGroup.value || sending.value) return;

  sending.value = true;
  const content = newMessage.value.trim();
  newMessage.value = '';

  // Ajout optimiste immédiat avec ID temporaire
  const tempId = `tmp_${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    content,
    user_id: authUser.value.id,
    group_id: selectedGroup.value.id,
    created_at: new Date().toISOString(),
    is_edited: false,
    user: {
      id: authUser.value.id,
      name: authUser.value.name,
      photo: authUser.value.photo,
    },
  };
  groupMessages.value.push(optimisticMessage);
  await nextTick();
  scrollToBottom();

  try {
    const sent = await groupsStore.sendMessage(selectedGroup.value.id, content);

    // Réconciliation: remplacer le message temporaire par le message confirmé
    if (sent && sent.id) {
      const idx = groupMessages.value.findIndex(m => m.id === tempId);
      if (idx !== -1) {
        groupMessages.value[idx] = {
          ...optimisticMessage,
          id: sent.id,
          created_at: sent.created_at || optimisticMessage.created_at
        };
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    // Retirer le message optimiste en cas d'échec et restaurer le champ
    const idx = groupMessages.value.findIndex(m => m.id === tempId);
    if (idx !== -1) groupMessages.value.splice(idx, 1);
    newMessage.value = content;
  } finally {
    sending.value = false;
  }
}

// Edit message
function editMessage(message) {
  messageToEdit.value = message;
  showEditMessage.value = true;
}

// Save edited message
async function saveEditedMessage(newContent) {
  if (!selectedGroup.value || !messageToEdit.value) return;

  try {
    await groupsStore.updateMessage(selectedGroup.value.id, messageToEdit.value.id, newContent);

    // Update local message
    const index = groupMessages.value.findIndex(m => m.id === messageToEdit.value.id);
    if (index !== -1) {
      groupMessages.value[index].content = newContent;
      groupMessages.value[index].is_edited = true;
    }

    toast.success('Message modifié');
    showEditMessage.value = false;
    messageToEdit.value = null;
  } catch (error) {
    console.error('Error editing message:', error);
    toast.error('Erreur lors de la modification du message');
  }
}

// Delete message
async function deleteMessage(messageId) {
  if (!confirm('Supprimer ce message ?')) return;

  try {
    await groupsStore.deleteMessage(selectedGroup.value.id, messageId);
    toast.success('Message supprimé');
  } catch (error) {
    console.error('Error deleting message:', error);
    toast.error('Erreur lors de la suppression');
  }
}

// Join group from search
async function handleJoinGroup(group) {
  try {
    await groupsStore.joinGroup(group.id);
    toast.success(`Vous avez rejoint le groupe "${group.name}"`);
    await loadGroups();
    selectGroup(group);
  } catch (error) {
    console.error('Error joining group:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la tentative de rejoindre le groupe');
  }
}

// Leave group
async function leaveGroup() {
  if (!confirm(`Voulez-vous quitter le groupe "${selectedGroup.value.name}" ?`)) return;

  try {
    await groupsStore.leaveGroup(selectedGroup.value.id);
    toast.success('Vous avez quitté le groupe');
    selectedGroup.value = null;
    loadGroups();
  } catch (error) {
    console.error('Error leaving group:', error);
    toast.error('Erreur lors de la sortie du groupe');
  }
}

// Create group
async function handleCreateGroup(payload) {
  try {
    const newGroup = await groupsStore.createGroup(payload);
    toast.success(`Groupe "${newGroup.name}" créé avec succès`);
    showCreateGroup.value = false;
    await loadGroups();
    selectGroup(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la création du groupe');
  }
}

// Handle member added to group
async function handleMemberAdded(user) {
  // Rafraîchir le groupe sélectionné pour avoir la liste à jour des membres
  if (selectedGroup.value) {
    await loadGroups();
    const updatedGroup = groups.value.find(g => g.id === selectedGroup.value.id);
    if (updatedGroup) {
      selectedGroup.value = updatedGroup;
    }
  }
}

// Helper functions
function isOwnMessage(message) {
  return message.user_id === authUser.value?.id;
}

function showAvatar(index) {
  if (index === 0) return true;
  return groupMessages.value[index - 1].user_id !== groupMessages.value[index].user_id;
}

function canEdit(message) {
  if (!isOwnMessage(message)) return false;
  const fifteenMinutes = 15 * 60 * 1000;
  const messageTime = new Date(message.created_at).getTime();
  return Date.now() - messageTime < fifteenMinutes;
}

function getGroupColor(type) {
  switch (type) {
    case 'sectoral':
      return 'bg-blue-500 text-white';
    case 'startup-only':
      return 'bg-purple-500 text-white';
    case 'mixed':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}

function getGroupIcon(type) {
  switch (type) {
    case 'sectoral':
      return 'Building2';
    case 'startup-only':
      return 'Rocket';
    case 'mixed':
      return 'Users';
    default:
      return 'Users';
  }
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

onMounted(() => {
  loadGroups();
});

onUnmounted(() => {
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

/* Amélioration du focus sur l'input */
input:focus {
  transform: scale(1.005);
}
</style>
