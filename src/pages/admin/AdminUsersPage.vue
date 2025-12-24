<template>
    <div class="min-h-screen bg-neutral-50">
        <PageHeader title="Gestion des Utilisateurs" subtitle="Gérer les comptes utilisateurs de la plateforme"
            :breadcrumbs="[{ label: 'Administration', to: '/admin-home' }, { label: 'Utilisateurs' }]" />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card class="text-center">
                    <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
                    <p class="text-sm text-neutral-500">Total</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-blue-600">{{ stats.startupers }}</p>
                    <p class="text-sm text-neutral-500">Startupeurs</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-amber-600">{{ stats.partners }}</p>
                    <p class="text-sm text-neutral-500">Partenaires</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-red-600">{{ stats.admins }}</p>
                    <p class="text-sm text-neutral-500">Admins</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-orange-600">{{ stats.suspended }}</p>
                    <p class="text-sm text-neutral-500">Suspendus</p>
                </Card>
            </div>

            <!-- Filters -->
            <Card class="mb-6">
                <div class="flex flex-wrap items-center gap-4">
                    <!-- Search -->
                    <div class="relative flex-1 min-w-[200px]">
                        <Icon name="Search" :size="18"
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input v-model="filters.search" type="text" placeholder="Rechercher un utilisateur..."
                            class="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            @input="debouncedSearch" />
                    </div>

                    <!-- Role Filter -->
                    <select v-model="filters.role"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadUsers">
                        <option value="">Tous les rôles</option>
                        <option value="startuper">Startupeurs</option>
                        <option value="partenaire">Partenaires</option>
                        <option value="admin">Administrateurs</option>
                    </select>

                    <!-- Status Filter -->
                    <select v-model="filters.suspended"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadUsers">
                        <option value="">Tous les statuts</option>
                        <option value="false">Actifs</option>
                        <option value="true">Suspendus</option>
                    </select>

                    <!-- Sort -->
                    <select v-model="filters.sort"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadUsers">
                        <option value="created_at:desc">Plus récents</option>
                        <option value="created_at:asc">Plus anciens</option>
                        <option value="name:asc">Nom A-Z</option>
                        <option value="name:desc">Nom Z-A</option>
                    </select>
                </div>
            </Card>

            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
                <Skeleton v-for="i in 5" :key="i" class="h-20 rounded-lg" />
            </div>

            <!-- Users List -->
            <div v-else-if="users.length > 0" class="space-y-4">
                <Card v-for="user in users" :key="user.id" class="hover:shadow-md transition-shadow"
                    :class="user.suspended_at ? 'border-l-4 border-l-orange-500' : ''">
                    <div class="flex flex-col md:flex-row md:items-center gap-4">
                        <!-- User Info -->
                        <div class="flex items-center gap-4 flex-1">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                :class="getRoleColor(user.role)">
                                {{ user.name?.charAt(0) || '?' }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h3 class="font-semibold text-neutral-900">{{ user.name }}</h3>
                                    <Badge :variant="getRoleBadgeVariant(user.role)">
                                        {{ formatRole(user.role) }}
                                    </Badge>
                                    <Badge v-if="user.suspended_at" variant="warning">
                                        <Icon name="Ban" :size="12" class="mr-1" />
                                        Suspendu
                                    </Badge>
                                    <Icon v-if="user.email_verified_at" name="CheckCircle" :size="16"
                                        class="text-green-500" title="Email vérifié" />
                                </div>
                                <p class="text-sm text-neutral-500">{{ user.email }}</p>
                                <p v-if="user.location" class="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                                    <Icon name="MapPin" :size="12" />
                                    {{ user.location }}
                                </p>
                            </div>
                        </div>

                        <!-- Meta Info -->
                        <div class="text-sm text-neutral-500 space-y-1 md:text-right">
                            <p>Inscrit le {{ formatDate(user.created_at) }}</p>
                            <p v-if="user.suspended_at" class="text-orange-600">
                                Suspendu le {{ formatDate(user.suspended_at) }}
                            </p>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2">
                            <Button variant="outline" size="sm" @click="viewUser(user)">
                                <Icon name="Eye" :size="14" class="mr-1" />
                                Détails
                            </Button>

                            <div class="relative" v-if="user.role !== 'admin' || currentUser?.id !== user.id">
                                <Button variant="outline" size="sm" @click="toggleMenu(user.id)">
                                    <Icon name="MoreVertical" :size="14" />
                                </Button>

                                <div v-if="openMenuId === user.id"
                                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                                    <button v-if="user.role !== 'admin'" @click="openRoleModal(user)"
                                        class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                                        <Icon name="UserCog" :size="14" />
                                        Changer le rôle
                                    </button>
                                    <button v-if="!user.suspended_at" @click="openSuspendModal(user)"
                                        class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-orange-600">
                                        <Icon name="Ban" :size="14" />
                                        Suspendre
                                    </button>
                                    <button v-else @click="handleUnsuspend(user)"
                                        class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-green-600">
                                        <Icon name="CheckCircle" :size="14" />
                                        Réactiver
                                    </button>
                                    <button v-if="user.role !== 'admin'" @click="openDeleteModal(user)"
                                        class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-red-600">
                                        <Icon name="Trash2" :size="14" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <!-- Pagination -->
                <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" :disabled="pagination.current_page === 1"
                        @click="goToPage(pagination.current_page - 1)">
                        <Icon name="ChevronLeft" :size="14" />
                    </Button>
                    <span class="px-4 py-2 text-sm text-neutral-600">
                        Page {{ pagination.current_page }} sur {{ pagination.last_page }}
                    </span>
                    <Button variant="outline" size="sm" :disabled="pagination.current_page === pagination.last_page"
                        @click="goToPage(pagination.current_page + 1)">
                        <Icon name="ChevronRight" :size="14" />
                    </Button>
                </div>
            </div>

            <!-- Empty State -->
            <Card v-else class="text-center py-16">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Icon name="Users" :size="40" class="text-neutral-400" />
                </div>
                <h3 class="text-xl font-semibold text-neutral-900 mb-2">Aucun utilisateur trouvé</h3>
                <p class="text-neutral-600 max-w-md mx-auto">
                    Aucun utilisateur ne correspond à vos critères de recherche.
                </p>
            </Card>
        </main>

        <!-- User Detail Modal -->
        <Modal :isOpen="showDetailModal" @close="showDetailModal = false" title="Détails de l'utilisateur">
            <div v-if="selectedUser" class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                        :class="getRoleColor(selectedUser.role)">
                        {{ selectedUser.name?.charAt(0) || '?' }}
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-neutral-900">{{ selectedUser.name }}</h3>
                        <p class="text-neutral-500">{{ selectedUser.email }}</p>
                        <Badge :variant="getRoleBadgeVariant(selectedUser.role)" class="mt-1">
                            {{ formatRole(selectedUser.role) }}
                        </Badge>
                    </div>
                </div>

                <div class="border-t border-neutral-200 pt-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-neutral-500">ID</span>
                        <span class="font-medium">{{ selectedUser.id }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-neutral-500">Téléphone</span>
                        <span class="font-medium">{{ selectedUser.phone || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-neutral-500">Localisation</span>
                        <span class="font-medium">{{ selectedUser.location || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-neutral-500">Email vérifié</span>
                        <span class="font-medium">
                            {{ selectedUser.email_verified_at ? 'Oui' : 'Non' }}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-neutral-500">Inscrit le</span>
                        <span class="font-medium">{{ formatDate(selectedUser.created_at) }}</span>
                    </div>
                    <div v-if="selectedUser.suspended_at" class="flex justify-between">
                        <span class="text-orange-600">Suspendu le</span>
                        <span class="font-medium text-orange-600">{{ formatDate(selectedUser.suspended_at) }}</span>
                    </div>
                    <div v-if="userDetails?.reports_count" class="flex justify-between">
                        <span class="text-red-600">Signalements</span>
                        <span class="font-medium text-red-600">{{ userDetails.reports_count }}</span>
                    </div>
                </div>

                <div v-if="selectedUser.bio" class="border-t border-neutral-200 pt-4">
                    <p class="text-sm text-neutral-500 mb-1">Bio</p>
                    <p class="text-neutral-700">{{ selectedUser.bio }}</p>
                </div>

                <!-- User's Startups -->
                <div v-if="userDetails?.user?.startups?.length" class="border-t border-neutral-200 pt-4">
                    <p class="text-sm text-neutral-500 mb-2">Startups</p>
                    <div class="space-y-2">
                        <div v-for="startup in userDetails.user.startups" :key="startup.id"
                            class="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                            <Icon name="Building2" :size="16" class="text-emerald-600" />
                            <span class="text-sm font-medium">{{ startup.nom }}</span>
                            <Badge size="sm" variant="neutral">{{ startup.pivot?.role }}</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- Suspend Modal -->
        <Modal :isOpen="showSuspendModal" @close="showSuspendModal = false" title="Suspendre l'utilisateur">
            <div v-if="selectedUser" class="space-y-4">
                <p class="text-neutral-600">
                    Êtes-vous sûr de vouloir suspendre <strong>{{ selectedUser.name }}</strong> ?
                </p>
                <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Raison (optionnel)</label>
                    <textarea v-model="suspendReason" rows="3"
                        class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Indiquez la raison de la suspension..."></textarea>
                </div>
                <div class="flex justify-end gap-3">
                    <Button variant="outline" @click="showSuspendModal = false">Annuler</Button>
                    <Button class="bg-orange-600 hover:bg-orange-700 text-white" @click="handleSuspend"
                        :disabled="actionLoading">
                        <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
                        Suspendre
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Role Change Modal -->
        <Modal :isOpen="showRoleModal" @close="showRoleModal = false" title="Changer le rôle">
            <div v-if="selectedUser" class="space-y-4">
                <p class="text-neutral-600">
                    Modifier le rôle de <strong>{{ selectedUser.name }}</strong>
                </p>
                <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Nouveau rôle</label>
                    <select v-model="newRole"
                        class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="startuper">Startupeur</option>
                        <option value="partenaire">Partenaire</option>
                        <option value="admin">Administrateur</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3">
                    <Button variant="outline" @click="showRoleModal = false">Annuler</Button>
                    <Button @click="handleRoleChange" :disabled="actionLoading">
                        <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
                        Confirmer
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Delete Modal -->
        <Modal :isOpen="showDeleteModal" @close="showDeleteModal = false" title="Supprimer l'utilisateur">
            <div v-if="selectedUser" class="space-y-4">
                <div class="p-4 bg-red-50 rounded-lg">
                    <p class="text-red-800">
                        <strong>Attention !</strong> Cette action est irréversible. L'utilisateur
                        <strong>{{ selectedUser.name }}</strong> et toutes ses données seront supprimés.
                    </p>
                </div>
                <div class="flex justify-end gap-3">
                    <Button variant="outline" @click="showDeleteModal = false">Annuler</Button>
                    <Button variant="danger" @click="handleDelete" :disabled="actionLoading">
                        <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
                        Supprimer définitivement
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Card, Badge, Button, Icon, PageHeader, Skeleton, Modal, LoadingSpinner } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import adminApi from '@/services/admin'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const loading = ref(true)
const users = ref([])
const stats = ref({
    total: 0,
    startupers: 0,
    partners: 0,
    admins: 0,
    suspended: 0,
})
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
})

// Filters
const filters = ref({
    search: '',
    role: '',
    suspended: '',
    sort: 'created_at:desc',
})

// Modals
const showDetailModal = ref(false)
const showSuspendModal = ref(false)
const showRoleModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const userDetails = ref(null)
const suspendReason = ref('')
const newRole = ref('startuper')
const actionLoading = ref(false)
const openMenuId = ref(null)

let searchTimeout = null

const loadUsers = async (page = 1) => {
    loading.value = true
    try {
        const [sortBy, sortOrder] = filters.value.sort.split(':')
        const params = {
            page,
            per_page: pagination.value.per_page,
            sort_by: sortBy,
            sort_order: sortOrder,
        }

        if (filters.value.search) params.search = filters.value.search
        if (filters.value.role) params.role = filters.value.role
        if (filters.value.suspended) params.suspended = filters.value.suspended

        const { data } = await adminApi.getUsers(params)
        users.value = data.data || []
        pagination.value = {
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            per_page: data.per_page || 15,
            total: data.total || 0,
        }
    } catch (error) {
        console.error('Error loading users:', error)
        users.value = []
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        const { data } = await adminApi.getUsersStats()
        stats.value = {
            total: data.total || 0,
            startupers: data.startupers || 0,
            partners: data.partners || 0,
            admins: data.admins || 0,
            suspended: data.suspended || 0,
        }
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadUsers()
    }, 300)
}

const goToPage = (page) => {
    loadUsers(page)
}

const viewUser = async (user) => {
    selectedUser.value = user
    showDetailModal.value = true
    try {
        const { data } = await adminApi.getUser(user.id)
        userDetails.value = data
    } catch (error) {
        console.error('Error loading user details:', error)
    }
}

const toggleMenu = (userId) => {
    openMenuId.value = openMenuId.value === userId ? null : userId
}

const closeMenus = () => {
    openMenuId.value = null
}

const openSuspendModal = (user) => {
    selectedUser.value = user
    suspendReason.value = ''
    showSuspendModal.value = true
    openMenuId.value = null
}

const openRoleModal = (user) => {
    selectedUser.value = user
    newRole.value = user.role
    showRoleModal.value = true
    openMenuId.value = null
}

const openDeleteModal = (user) => {
    selectedUser.value = user
    showDeleteModal.value = true
    openMenuId.value = null
}

const handleSuspend = async () => {
    actionLoading.value = true
    try {
        await adminApi.suspendUser(selectedUser.value.id, { reason: suspendReason.value })
        showSuspendModal.value = false
        await Promise.all([loadUsers(pagination.value.current_page), loadStats()])
    } catch (error) {
        console.error('Error suspending user:', error)
        alert('Erreur lors de la suspension')
    } finally {
        actionLoading.value = false
    }
}

const handleUnsuspend = async (user) => {
    openMenuId.value = null
    try {
        await adminApi.unsuspendUser(user.id)
        await Promise.all([loadUsers(pagination.value.current_page), loadStats()])
    } catch (error) {
        console.error('Error unsuspending user:', error)
        alert('Erreur lors de la réactivation')
    }
}

const handleRoleChange = async () => {
    actionLoading.value = true
    try {
        await adminApi.changeUserRole(selectedUser.value.id, newRole.value)
        showRoleModal.value = false
        await Promise.all([loadUsers(pagination.value.current_page), loadStats()])
    } catch (error) {
        console.error('Error changing role:', error)
        alert('Erreur lors du changement de rôle')
    } finally {
        actionLoading.value = false
    }
}

const handleDelete = async () => {
    actionLoading.value = true
    try {
        await adminApi.deleteUser(selectedUser.value.id)
        showDeleteModal.value = false
        await Promise.all([loadUsers(pagination.value.current_page), loadStats()])
    } catch (error) {
        console.error('Error deleting user:', error)
        alert('Erreur lors de la suppression')
    } finally {
        actionLoading.value = false
    }
}

const formatRole = (role) => {
    const roles = {
        startuper: 'Startupeur',
        partenaire: 'Partenaire',
        admin: 'Administrateur',
    }
    return roles[role] || role
}

const getRoleColor = (role) => {
    const colors = {
        startuper: 'bg-blue-500',
        partenaire: 'bg-amber-500',
        admin: 'bg-red-500',
    }
    return colors[role] || 'bg-neutral-500'
}

const getRoleBadgeVariant = (role) => {
    const variants = {
        startuper: 'info',
        partenaire: 'warning',
        admin: 'danger',
    }
    return variants[role] || 'neutral'
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

// Close menus when clicking outside
const handleClickOutside = (e) => {
    if (!e.target.closest('.relative')) {
        closeMenus()
    }
}

onMounted(() => {
    Promise.all([loadUsers(), loadStats()])
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    if (searchTimeout) clearTimeout(searchTimeout)
})
</script>
