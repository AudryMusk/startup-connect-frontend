<template>
  <div v-if="!user || user.role !== 'admin'" class="max-w-2xl mx-auto mt-20">
    <Alert type="error">
      Accès refusé. Cette page est réservée aux administrateurs.
    </Alert>
  </div>

  <div v-else-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Administration</h1>
      <p class="text-gray-500 mt-1">Gérez les utilisateurs, startups, offres et signalements</p>
    </div>

    <!-- Success Message -->
    <Alert v-if="successMessage" type="success">{{ successMessage }}</Alert>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-blue-50 rounded-xl p-4 sm:p-5">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-blue-600">{{ users.length }}</p>
          <p class="text-xs sm:text-sm text-gray-600">Utilisateurs</p>
        </div>
      </div>
      <div class="bg-green-50 rounded-xl p-4 sm:p-5">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-green-600">{{ startups.length }}</p>
          <p class="text-xs sm:text-sm text-gray-600">Startups</p>
        </div>
      </div>
      <div class="bg-purple-50 rounded-xl p-4 sm:p-5">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-purple-600">{{ offers.length }}</p>
          <p class="text-xs sm:text-sm text-gray-600">Opportunités</p>
        </div>
      </div>
      <div class="bg-red-50 rounded-xl p-4 sm:p-5">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-red-600">{{ pendingReports.length }}</p>
          <p class="text-xs sm:text-sm text-gray-600">Signalements</p>
        </div>
      </div>
    </div>

    <!-- Tabs - Direct sur la page, sans Card parent -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="border-b border-gray-200">
        <div class="flex -mb-px overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id; searchQuery = ''; filterRole = 'all'"
            :class="[
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium transition whitespace-nowrap text-sm sm:text-base',
              activeTab === tab.id
                ? 'border-theme text-theme'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]">
            <Icon :name="tab.icon" :size="16" class="sm:hidden" />
            <Icon :name="tab.icon" :size="18" class="hidden sm:inline" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <Badge v-if="tab.badge > 0" color="red" size="sm">{{ tab.badge }}</Badge>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="p-3 sm:p-6">
        <!-- Search and Filters -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div class="flex-1 relative">
            <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" :placeholder="searchPlaceholder" v-model="searchQuery"
              class="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme" />
          </div>
          <Select v-if="activeTab === 'users'" v-model="filterRole" class="w-full sm:w-auto">
            <option value="all">Tous les rôles</option>
            <option value="startuper">Startuppers</option>
            <option value="partenaire">Partenaires</option>
            <option value="admin">Admins</option>
          </Select>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'"
          class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
          <p v-if="filteredUsers.length === 0" class="text-center text-gray-500 py-8">Aucun utilisateur trouvé</p>

          <div v-for="u in filteredUsers" :key="u.uid"
            class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-theme-light rounded-full flex items-center justify-center text-theme font-bold flex-shrink-0 text-sm sm:text-base">
              {{ u.displayName?.[0] || 'U' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-semibold text-gray-900 truncate text-sm sm:text-base">{{ u.displayName }}</h3>
                <Badge :color="u.role === 'admin' ? 'red' : u.role === 'partenaire' ? 'blue' : 'theme'" size="sm">
                  {{ u.role }}
                </Badge>
                <Icon v-if="u.emailVerified" name="CheckCircle" :size="14" class="text-green-500" />
              </div>
              <p class="text-xs sm:text-sm text-gray-600 truncate">{{ u.email }}</p>
              <p v-if="u.companyName" class="text-xs text-gray-500">{{ u.companyName }}</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <Select v-model="u.role" @change="handleChangeUserRole(u.uid, u.role)" class="text-xs sm:text-sm">
                <option value="startuper">Startuper</option>
                <option value="partenaire">Partenaire</option>
                <option value="admin">Admin</option>
              </Select>
              <Button variant="danger" size="sm" @click="openDeleteModal('user', u.uid, u.displayName)">
                <Icon name="XCircle" :size="14" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Startups Tab -->
        <div v-if="activeTab === 'startups'"
          class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
          <p v-if="filteredStartups.length === 0" class="text-center text-gray-500 py-8">Aucune startup trouvée</p>

          <div v-for="s in filteredStartups" :key="s.id"
            class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-theme-light rounded-xl flex items-center justify-center text-theme font-bold flex-shrink-0 text-sm sm:text-base">
              {{ s.name?.[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-semibold text-gray-900 truncate text-sm sm:text-base">{{ s.name }}</h3>
                <Icon v-if="s.verified" name="CheckCircle" :size="16" class="text-blue-500" />
                <Badge color="gray" size="sm">{{ s.sector }}</Badge>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
                <span class="flex items-center gap-1">
                  <Icon name="MapPin" :size="12" />
                  {{ s.location }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="Users" :size="12" />
                  {{ s.members?.length || 0 }} membres
                </span>
                <span v-if="s.rccm" class="font-mono">{{ s.rccm }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <Button :variant="s.verified ? 'outline' : 'primary'" size="sm"
                @click="handleVerifyStartup(s.id, !s.verified)">
                <Icon :name="s.verified ? 'XCircle' : 'CheckCircle'" :size="14" />
                <span class="hidden sm:inline">{{ s.verified ? 'Retirer' : 'Vérifier' }}</span>
              </Button>
              <Button variant="danger" size="sm" @click="openDeleteModal('startup', s.id, s.name)">
                <Icon name="XCircle" :size="14" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Offers Tab -->
        <div v-if="activeTab === 'offers'"
          class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
          <p v-if="filteredOffers.length === 0" class="text-center text-gray-500 py-8">Aucune opportunité trouvée</p>

          <div v-for="o in filteredOffers" :key="o.id"
            class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <Badge :color="o.type === 'event' ? 'purple' : 'theme'" size="sm">
                  {{ o.type === 'event' ? 'Événement' : 'Offre' }}
                </Badge>
                <Badge color="gray" size="sm">{{ o.sector }}</Badge>
                <Badge v-if="o.deadline < Date.now()" color="red" size="sm">Expiré</Badge>
              </div>
              <h3 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">{{ o.title }}</h3>
              <div class="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 flex-wrap">
                <span>{{ o.creatorName }}</span>
                <span class="flex items-center gap-1">
                  <Icon name="Eye" :size="12" />
                  {{ o.views || 0 }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="FileText" :size="12" />
                  {{ o.applications || 0 }} candidatures
                </span>
                <span v-if="o.deadline">{{ formatDate(o.deadline) }}</span>
              </div>
            </div>
            <Button variant="danger" size="sm" @click="openDeleteModal('offer', o.id, o.title)">
              <Icon name="XCircle" :size="14" />
              <span class="hidden sm:inline">Supprimer</span>
            </Button>
          </div>
        </div>

        <!-- Reports Tab -->
        <div v-if="activeTab === 'reports'"
          class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
          <p v-if="pendingReports.length === 0" class="text-center text-gray-500 py-8">Aucun signalement en attente</p>

          <div v-for="r in pendingReports" :key="r.id"
            class="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <Badge color="yellow" size="sm">En attente</Badge>
                <h3 class="font-semibold text-gray-900 mt-2 text-sm sm:text-base">{{ r.reason }}</h3>
                <p class="text-xs sm:text-sm text-gray-600 mt-1">
                  Type: {{ r.targetType }} • ID: {{ r.targetId }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Signalé le {{ formatDate(r.createdAt) }}
                </p>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <Button variant="primary" size="sm" @click="handleReportAction(r.id, 'approve')">
                <Icon name="CheckCircle" :size="14" />
                <span class="hidden sm:inline">Approuver</span>
              </Button>
              <Button variant="outline" size="sm" @click="handleReportAction(r.id, 'reject')">
                <Icon name="XCircle" :size="14" />
                <span class="hidden sm:inline">Rejeter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal :isOpen="showDeleteModal" @close="showDeleteModal = false" title="Confirmer la suppression">
      <div class="space-y-4">
        <p class="text-gray-700">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ itemToDelete?.name }}</strong> ?
        </p>
        <p class="text-sm text-red-600">
          ⚠️ Cette action est irréversible.
        </p>
        <div class="flex gap-3 justify-end">
          <Button variant="outline" @click="showDeleteModal = false" :disabled="actionLoading">
            Annuler
          </Button>
          <Button variant="danger" @click="handleDelete" :disabled="actionLoading">
            <LoadingSpinner v-if="actionLoading" size="sm" />
            <span v-else>Supprimer</span>
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import adminApi from '../../services/admin';
import offersApi from '../../services/offers';
import { Card, Button, Badge, LoadingSpinner, Alert, Select, Modal, Icon } from '../../components/ui';
import { formatDate } from '../../utils/dateUtils';

const { user } = useAuth();
const activeTab = ref('users');
const loading = ref(true);

// Data states
const users = ref([]);
const startups = ref([]);
const offers = ref([]);
const reports = ref([]);

// Search and filter states
const searchQuery = ref('');
const filterRole = ref('all');

// Modal states
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const actionLoading = ref(false);
const successMessage = ref('');

const tabs = computed(() => [
  { id: 'users', label: 'Utilisateurs', icon: 'Users', badge: 0 },
  { id: 'startups', label: 'Startups', icon: 'Building2', badge: 0 },
  { id: 'offers', label: 'Opportunités', icon: 'Briefcase', badge: 0 },
  { id: 'reports', label: 'Signalements', icon: 'ShieldAlert', badge: pendingReports.value.length }
]);

const searchPlaceholder = computed(() => {
  if (activeTab.value === 'users') return 'Rechercher un utilisateur...';
  if (activeTab.value === 'startups') return 'Rechercher une startup...';
  return 'Rechercher une opportunité...';
});

const pendingReports = computed(() => reports.value.filter(r => r.status === 'pending'));

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = (u.displayName || u.name || '')?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (u.email || '')?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = filterRole.value === 'all' || u.role === filterRole.value;
    return matchesSearch && matchesRole;
  });
});

const filteredStartups = computed(() => {
  return startups.value.filter(s =>
    (s.name || '')?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (s.sector || s.secteur?.nom || '')?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredOffers = computed(() => {
  return offers.value.filter(o =>
    (o.title || o.titre || '')?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (o.sector || o.secteur || '')?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const loadAllData = async () => {
  loading.value = true;
  try {
    const [usersResponse, startupsResponse, offersResponse, reportsResponse] = await Promise.all([
      adminApi.getUsers({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
      adminApi.getStartups({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
      offersApi.list({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
      adminApi.getReports({ per_page: 100 }).catch(() => ({ data: { data: [] } }))
    ]);

    users.value = usersResponse.data?.data || usersResponse.data || [];
    startups.value = startupsResponse.data?.data || startupsResponse.data || [];
    offers.value = offersResponse.data?.data || offersResponse.data || [];
    reports.value = reportsResponse.data?.data || reportsResponse.data || [];
  } catch (error) {
    console.error('Error loading admin data:', error);
  } finally {
    loading.value = false;
  }
};

const handleChangeUserRole = async (userId, newRole) => {
  try {
    // TODO: Implémenter l'endpoint de changement de rôle dans l'API admin
    // await adminApi.updateUserRole(userId, newRole);
    showSuccess('Rôle modifié avec succès');
  } catch (error) {
    console.error('Error changing role:', error);
  }
};

const handleVerifyStartup = async (startupId, verified) => {
  try {
    if (verified) {
      await adminApi.validateStartup(startupId);
    } else {
      await adminApi.rejectStartup(startupId);
    }
    startups.value = startups.value.map(s => s.id === startupId ? { ...s, verified, is_validated: verified } : s);
    showSuccess(`Startup ${verified ? 'vérifiée' : 'non vérifiée'} avec succès`);
  } catch (error) {
    console.error('Error verifying startup:', error);
  }
};

const handleReportAction = async (reportId, action) => {
  try {
    await adminApi.resolveReport(reportId, { action });
    reports.value = reports.value.map(r =>
      r.id === reportId
        ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
        : r
    );
    showSuccess(`Signalement ${action === 'approve' ? 'approuvé' : 'rejeté'}`);
  } catch (error) {
    console.error('Error handling report:', error);
  }
};

const openDeleteModal = (type, id, name) => {
  itemToDelete.value = { type, id, name };
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  actionLoading.value = true;
  try {
    const { type, id } = itemToDelete.value;

    if (type === 'user') {
      await adminApi.suspendUser(id, { reason: 'Suppression par admin' });
      users.value = users.value.filter(u => u.id !== id && u.uid !== id);
    } else if (type === 'startup') {
      await adminApi.rejectStartup(id, { reason: 'Suppression par admin' });
      startups.value = startups.value.filter(s => s.id !== id);
    } else if (type === 'offer') {
      await offersApi.delete(id);
      offers.value = offers.value.filter(o => o.id !== id);
    }

    showDeleteModal.value = false;
    showSuccess(`${type === 'user' ? 'Utilisateur' : type === 'startup' ? 'Startup' : 'Offre'} supprimé(e) avec succès`);
  } catch (error) {
    console.error('Error deleting:', error);
  } finally {
    actionLoading.value = false;
  }
};

const showSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => { successMessage.value = ''; }, 3000);
};

onMounted(loadAllData);
</script>
