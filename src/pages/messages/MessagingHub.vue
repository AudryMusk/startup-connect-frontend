<template>
  <div class="max-w-[1600px] mx-auto">
    <!-- Header avec onglets -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 mb-2">Messagerie</h1>
          <p class="text-gray-600">Conversations privées et groupes de discussion</p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="glass-effect rounded-xl p-1 inline-flex gap-1">
        <button
          @click="activeTab = 'conversations'"
          :class="[
            'px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2',
            activeTab === 'conversations'
              ? 'bg-gradient-to-br from-theme-400 to-theme-600 text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
        >
          <Icon name="MessageCircle" :size="18" />
          <span>Conversations</span>
          <span
            v-if="conversationsUnread > 0"
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-bold',
              activeTab === 'conversations'
                ? 'bg-white/20 text-white'
                : 'bg-theme text-white'
            ]"
          >
            {{ conversationsUnread }}
          </span>
        </button>

        <button
          @click="activeTab = 'groups'"
          :class="[
            'px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2',
            activeTab === 'groups'
              ? 'bg-gradient-to-br from-theme-400 to-theme-600 text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
        >
          <Icon name="Users" :size="18" />
          <span>Groupes</span>
          <span
            v-if="groupsUnread > 0"
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-bold',
              activeTab === 'groups'
                ? 'bg-white/20 text-white'
                : 'bg-theme text-white'
            ]"
          >
            {{ groupsUnread }}
          </span>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="animate-fade-in">
      <ConversationsPage v-if="activeTab === 'conversations'" />
      <GroupsPage v-else-if="activeTab === 'groups'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ConversationsPage from './ConversationsPage.vue'
import GroupsPage from '../groups/GroupsPage.vue'
import Icon from '@/components/ui/Icon.vue'
import { useMessagesStore } from '@/stores/messagesStore'
import { useGroupsStore } from '@/stores/groupsStore'

const route = useRoute()
const messagesStore = useMessagesStore()
const groupsStore = useGroupsStore()

// Active tab - peut être défini via query param ou par défaut
const activeTab = ref(route.query.tab || 'conversations')

// Unread counts
const conversationsUnread = computed(() => messagesStore.unreadCount || 0)
const groupsUnread = computed(() => {
  return groupsStore.groups.reduce((total, group) => total + (group.unread_count || 0), 0)
})

// Initialize
onMounted(() => {
  // Load initial data
  messagesStore.fetchUnreadCount()
  groupsStore.loadGroups()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
