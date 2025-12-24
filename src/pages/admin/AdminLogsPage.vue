<template>
    <div class="min-h-screen bg-neutral-50">
        <PageHeader title="Logs d'Activité" subtitle="Historique des actions administratives sur la plateforme"
            :breadcrumbs="[{ label: 'Administration', to: '/admin-home' }, { label: 'Logs' }]" />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Filters -->
            <Card class="mb-6">
                <div class="flex flex-wrap items-center gap-4">
                    <!-- Action Filter -->
                    <select v-model="filters.action"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadLogs">
                        <option value="">Toutes les actions</option>
                        <option value="user_suspended">Suspension utilisateur</option>
                        <option value="user_unsuspended">Réactivation utilisateur</option>
                        <option value="user_deleted">Suppression utilisateur</option>
                        <option value="user_role_changed">Changement de rôle</option>
                        <option value="report_reviewed">Signalement examiné</option>
                        <option value="report_resolved">Signalement résolu</option>
                        <option value="report_dismissed">Signalement rejeté</option>
                        <option value="content_deleted">Contenu supprimé</option>
                        <option value="startup_deleted">Startup supprimée</option>
                    </select>

                    <!-- Target Type Filter -->
                    <select v-model="filters.target_type"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadLogs">
                        <option value="">Toutes les cibles</option>
                        <option value="App\\Models\\User">Utilisateurs</option>
                        <option value="App\\Models\\Startup">Startups</option>
                        <option value="App\\Models\\Post">Publications</option>
                        <option value="App\\Models\\Comment">Commentaires</option>
                        <option value="App\\Models\\Report">Signalements</option>
                    </select>

                    <!-- Admin Filter (if admins list available) -->
                    <select v-if="admins.length > 0" v-model="filters.admin_id"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadLogs">
                        <option value="">Tous les admins</option>
                        <option v-for="admin in admins" :key="admin.id" :value="admin.id">
                            {{ admin.name }}
                        </option>
                    </select>

                    <div class="flex-1"></div>

                    <!-- Refresh -->
                    <Button variant="outline" size="sm" @click="loadLogs">
                        <Icon name="RefreshCw" :size="14" class="mr-1" />
                        Actualiser
                    </Button>
                </div>
            </Card>

            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
                <Skeleton v-for="i in 10" :key="i" class="h-16 rounded-lg" />
            </div>

            <!-- Logs List -->
            <div v-else-if="logs.length > 0" class="space-y-3">
                <Card v-for="log in logs" :key="log.id" class="hover:shadow-sm transition-shadow"
                    :class="getLogBorderClass(log.action)">
                    <div class="flex items-start gap-4">
                        <!-- Icon -->
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            :class="getActionIconClass(log.action)">
                            <Icon :name="getActionIcon(log.action)" :size="20" />
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <Badge :variant="getActionBadgeVariant(log.action)">
                                    {{ formatAction(log.action) }}
                                </Badge>
                                <span class="text-sm text-neutral-500">
                                    par <strong>{{ log.admin?.name || 'Admin inconnu' }}</strong>
                                </span>
                            </div>

                            <p class="text-neutral-700">
                                {{ getLogDescription(log) }}
                            </p>

                            <!-- Details -->
                            <div v-if="log.details && Object.keys(log.details).length > 0" class="mt-2">
                                <button @click="toggleDetails(log.id)"
                                    class="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
                                    <Icon :name="expandedLogs.includes(log.id) ? 'ChevronUp' : 'ChevronDown'"
                                        :size="14" />
                                    {{ expandedLogs.includes(log.id) ? 'Masquer' : 'Voir' }} les détails
                                </button>
                                <div v-if="expandedLogs.includes(log.id)"
                                    class="mt-2 p-3 bg-neutral-50 rounded-lg text-xs font-mono overflow-x-auto">
                                    <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
                                </div>
                            </div>
                        </div>

                        <!-- Timestamp -->
                        <div class="text-right text-sm text-neutral-500 flex-shrink-0">
                            <p>{{ formatDate(log.created_at) }}</p>
                            <p class="text-xs">{{ formatTime(log.created_at) }}</p>
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
                    <Icon name="List" :size="40" class="text-neutral-400" />
                </div>
                <h3 class="text-xl font-semibold text-neutral-900 mb-2">Aucun log trouvé</h3>
                <p class="text-neutral-600 max-w-md mx-auto">
                    Aucune action administrative ne correspond à vos critères de recherche.
                </p>
            </Card>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card, Badge, Button, Icon, PageHeader, Skeleton } from '@/components/ui'
import adminApi from '@/services/admin'

const loading = ref(true)
const logs = ref([])
const admins = ref([])
const expandedLogs = ref([])
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
})

// Filters
const filters = ref({
    action: '',
    target_type: '',
    admin_id: '',
})

const loadLogs = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            per_page: pagination.value.per_page,
            sort_by: 'created_at',
            sort_order: 'desc',
        }

        if (filters.value.action) params.action = filters.value.action
        if (filters.value.target_type) params.target_type = filters.value.target_type
        if (filters.value.admin_id) params.admin_id = filters.value.admin_id

        const { data } = await adminApi.getLogs(params)
        logs.value = data.data || []
        pagination.value = {
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            per_page: data.per_page || 20,
            total: data.total || 0,
        }
    } catch (error) {
        console.error('Error loading logs:', error)
        logs.value = []
    } finally {
        loading.value = false
    }
}

const loadAdmins = async () => {
    try {
        const { data } = await adminApi.getUsers({ role: 'admin', per_page: 100 })
        admins.value = data.data || []
    } catch (error) {
        console.error('Error loading admins:', error)
    }
}

const goToPage = (page) => {
    loadLogs(page)
}

const toggleDetails = (logId) => {
    const index = expandedLogs.value.indexOf(logId)
    if (index === -1) {
        expandedLogs.value.push(logId)
    } else {
        expandedLogs.value.splice(index, 1)
    }
}

const formatAction = (action) => {
    const actions = {
        user_suspended: 'Suspension',
        user_unsuspended: 'Réactivation',
        user_deleted: 'Suppression user',
        user_role_changed: 'Rôle modifié',
        report_reviewed: 'Signalement examiné',
        report_resolved: 'Signalement résolu',
        report_dismissed: 'Signalement rejeté',
        content_deleted: 'Contenu supprimé',
        startup_deleted: 'Startup supprimée',
    }
    return actions[action] || action
}

const getLogDescription = (log) => {
    const targetName = log.target?.name || log.target?.nom || log.details?.name || 'Élément inconnu'
    const actions = {
        user_suspended: `L'utilisateur "${targetName}" a été suspendu`,
        user_unsuspended: `L'utilisateur "${targetName}" a été réactivé`,
        user_deleted: `L'utilisateur "${log.details?.name || targetName}" a été supprimé`,
        user_role_changed: `Le rôle de "${targetName}" a été changé de "${log.details?.old_role}" à "${log.details?.new_role}"`,
        report_reviewed: `Le signalement #${log.target_id} a été examiné`,
        report_resolved: `Le signalement #${log.target_id} a été résolu`,
        report_dismissed: `Le signalement #${log.target_id} a été rejeté`,
        content_deleted: `Le contenu (${formatTargetType(log.target_type)}) a été supprimé`,
        startup_deleted: `La startup "${log.details?.nom || targetName}" a été supprimée`,
    }
    return actions[log.action] || `Action "${log.action}" effectuée sur ${formatTargetType(log.target_type)} #${log.target_id}`
}

const formatTargetType = (type) => {
    if (!type) return 'Inconnu'
    const types = {
        'App\\Models\\User': 'Utilisateur',
        'App\\Models\\Startup': 'Startup',
        'App\\Models\\Post': 'Publication',
        'App\\Models\\Comment': 'Commentaire',
        'App\\Models\\Report': 'Signalement',
    }
    return types[type] || type.split('\\').pop()
}

const getActionIcon = (action) => {
    const icons = {
        user_suspended: 'Ban',
        user_unsuspended: 'UserCheck',
        user_deleted: 'UserX',
        user_role_changed: 'UserCog',
        report_reviewed: 'Eye',
        report_resolved: 'CheckCircle',
        report_dismissed: 'XCircle',
        content_deleted: 'Trash2',
        startup_deleted: 'Building2',
    }
    return icons[action] || 'Activity'
}

const getActionIconClass = (action) => {
    const classes = {
        user_suspended: 'bg-orange-100 text-orange-600',
        user_unsuspended: 'bg-green-100 text-green-600',
        user_deleted: 'bg-red-100 text-red-600',
        user_role_changed: 'bg-blue-100 text-blue-600',
        report_reviewed: 'bg-purple-100 text-purple-600',
        report_resolved: 'bg-green-100 text-green-600',
        report_dismissed: 'bg-neutral-100 text-neutral-600',
        content_deleted: 'bg-red-100 text-red-600',
        startup_deleted: 'bg-red-100 text-red-600',
    }
    return classes[action] || 'bg-neutral-100 text-neutral-600'
}

const getActionBadgeVariant = (action) => {
    const variants = {
        user_suspended: 'warning',
        user_unsuspended: 'success',
        user_deleted: 'danger',
        user_role_changed: 'info',
        report_reviewed: 'info',
        report_resolved: 'success',
        report_dismissed: 'neutral',
        content_deleted: 'danger',
        startup_deleted: 'danger',
    }
    return variants[action] || 'neutral'
}

const getLogBorderClass = (action) => {
    const borders = {
        user_suspended: 'border-l-4 border-l-orange-500',
        user_unsuspended: 'border-l-4 border-l-green-500',
        user_deleted: 'border-l-4 border-l-red-500',
        user_role_changed: 'border-l-4 border-l-blue-500',
        report_resolved: 'border-l-4 border-l-green-500',
        content_deleted: 'border-l-4 border-l-red-500',
        startup_deleted: 'border-l-4 border-l-red-500',
    }
    return borders[action] || ''
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

onMounted(() => {
    Promise.all([loadLogs(), loadAdmins()])
})
</script>
