<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="!authStore.user?.startup_id && !user?.startupId" class="max-w-2xl mx-auto mt-20">
    <EmptyState
      title="Aucune startup"
      description="Vous devez faire partie d'une startup pour gérer les demandes d'adhésion."
    >
      <template #icon>
        <Icon name="Building2" :size="48" />
      </template>
    </EmptyState>
  </div>

  <div v-else class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Demandes d'adhésion</h1>
      <p class="text-gray-500 mt-1">
        Gérez les demandes d'adhésion à votre startup et vos demandes envoyées
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="bg-blue-50">
        <div class="text-center">
          <p class="text-3xl font-bold text-blue-600">{{ members.length }}</p>
          <p class="text-sm text-gray-600">Membres</p>
        </div>
      </Card>
      <Card class="bg-yellow-50">
        <div class="text-center">
          <p class="text-3xl font-bold text-yellow-600">{{ pendingRequests.length }}</p>
          <p class="text-sm text-gray-600">Demandes reçues</p>
        </div>
      </Card>
      <Card class="bg-gray-50">
        <div class="text-center">
          <p class="text-3xl font-bold text-gray-600">{{ sentRequests.length }}</p>
          <p class="text-sm text-gray-600">Demandes envoyées</p>
        </div>
      </Card>
    </div>

    <!-- Pending Requests -->
    <Card v-if="pendingRequests.length > 0">
      <h2 class="text-xl font-bold mb-4">Demandes reçues</h2>
      <div class="space-y-4">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
        >
          <div class="w-12 h-12 bg-theme-light rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="text-xl font-bold text-theme">
              {{ (request.user?.name || request.user_name || 'U')[0] }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-semibold text-gray-900">{{ request.user?.name || request.user_name || 'Utilisateur' }}</h3>
              <span class="text-xs text-gray-400">
                {{ formatDistanceToNow(request.created_at || request.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ request.user?.email || request.email }}</p>
            <p v-if="request.message" class="text-sm text-gray-700 bg-white p-3 rounded mb-3">
              {{ request.message }}
            </p>
            <div class="flex gap-2">
              <Button size="sm" @click="handleAccept(request.id)">
                <Icon name="CheckCircle" :size="14" />
                Accepter
              </Button>
              <Button size="sm" variant="outline" @click="handleReject(request.id)">
                <Icon name="XCircle" :size="14" />
                Refuser
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Members / Connections -->
    <Card>
      <h2 class="text-xl font-bold mb-4">Membres ({{ members.length }})</h2>

      <EmptyState
        v-if="members.length === 0"
        title="Aucun membre"
        description="Votre startup n'a pas encore de membres"
      >
        <template #icon>
          <Icon name="Users" :size="40" />
        </template>
      </EmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-theme transition"
        >
          <div class="w-12 h-12 bg-theme-light rounded-xl flex items-center justify-center">
            <span class="text-xl font-bold text-theme">
              {{ (member.name || 'M')[0] }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ member.name }}</h3>
            <p class="text-xs text-gray-500">{{ member.email }}</p>
          </div>
          <Badge v-if="member.role" color="blue">{{ member.role }}</Badge>
          <Icon v-else name="CheckCircle" :size="20" class="text-green-500" />
        </div>
      </div>
    </Card>

    <!-- Sent Requests -->
    <Card v-if="sentRequests.length > 0">
      <h2 class="text-xl font-bold mb-4">Mes demandes envoyées</h2>
      <div class="space-y-3">
        <div
          v-for="request in sentRequests"
          :key="request.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="w-10 h-10 bg-theme-light rounded-lg flex items-center justify-center">
            <span class="font-bold text-theme">
              {{ (request.startup?.name || request.startup_name || 'S')[0] }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 text-sm truncate">{{ request.startup?.name || request.startup_name || 'Startup' }}</h4>
            <p class="text-xs text-gray-500">{{ request.startup?.secteur?.nom || request.sector }}</p>
          </div>
          <Badge :color="getStatusBadge(request.status).color">
            {{ getStatusBadge(request.status).label }}
          </Badge>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useAuthStore } from '@/stores/authStore';
import startupApi from '../../services/startup';
import { Card, Button, Badge, LoadingSpinner, EmptyState, Icon } from '../../components/ui';
import { formatDistanceToNow } from '../../utils/dateUtils';

const { user } = useAuth();
const authStore = useAuthStore();
const loading = ref(true);
const pendingRequests = ref([]);
const sentRequests = ref([]);
const members = ref([]);

const loadData = async () => {
  loading.value = true;
  try {
    const startupId = authStore.user?.startup_id || user.value?.startupId;

    if (!startupId) {
      loading.value = false;
      return;
    }

    // Charger les demandes reçues pour ma startup
    try {
      const receivedResponse = await startupApi.getReceivedJoinRequests();
      pendingRequests.value = (receivedResponse.data?.data || receivedResponse.data || [])
        .filter(r => r.status === 'pending');
    } catch (e) {
      console.error('Error loading received requests:', e);
      pendingRequests.value = [];
    }

    // Charger mes demandes envoyées
    try {
      const sentResponse = await startupApi.getMyJoinRequests();
      sentRequests.value = sentResponse.data?.data || sentResponse.data || [];
    } catch (e) {
      console.error('Error loading sent requests:', e);
      sentRequests.value = [];
    }

    // Charger les membres de ma startup (connexions acceptées)
    try {
      const startupResponse = await startupApi.get(startupId);
      members.value = startupResponse.data?.data?.members || startupResponse.data?.members || [];
    } catch (e) {
      console.error('Error loading startup members:', e);
      members.value = [];
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const handleAccept = async (requestId) => {
  try {
    await startupApi.approveJoinRequest(requestId);
    await loadData();
  } catch (error) {
    console.error('Error accepting request:', error);
    alert('Erreur lors de l\'acceptation de la demande');
  }
};

const handleReject = async (requestId) => {
  try {
    await startupApi.rejectJoinRequest(requestId);
    await loadData();
  } catch (error) {
    console.error('Error rejecting request:', error);
    alert('Erreur lors du refus de la demande');
  }
};

const getStatusBadge = (status) => {
  const map = {
    'pending': { color: 'yellow', label: 'En attente' },
    'approved': { color: 'green', label: 'Acceptée' },
    'rejected': { color: 'red', label: 'Refusée' },
    'accepted': { color: 'green', label: 'Acceptée' },
  };
  return map[status] || { color: 'gray', label: status };
};

onMounted(() => {
  loadData();
});
</script>
