<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader title="Modération" subtitle="Gérez les signalements de la communauté"
      :breadcrumbs="[{ label: 'Administration', to: '/admin-home' }, { label: 'Modération' }]" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card class="text-center">
          <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
          <p class="text-sm text-neutral-500">Total</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</p>
          <p class="text-sm text-neutral-500">En attente</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-blue-600">{{ stats.reviewed }}</p>
          <p class="text-sm text-neutral-500">En cours</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-green-600">{{ stats.resolved }}</p>
          <p class="text-sm text-neutral-500">Résolus</p>
        </Card>
        <Card class="text-center">
          <p class="text-3xl font-bold text-neutral-600">{{ stats.dismissed }}</p>
          <p class="text-sm text-neutral-500">Rejetés</p>
        </Card>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <div class="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
          <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value; loadReports()"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors" :class="activeTab === tab.value
                ? 'bg-red-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              ">
            {{ tab.label }}
          </button>
        </div>

        <div class="flex-1"></div>

        <select v-model="selectedType"
          class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          @change="loadReports">
          <option value="">Tous les types</option>
          <option value="App\\Models\\Post">Publications</option>
          <option value="App\\Models\\Comment">Commentaires</option>
          <option value="App\\Models\\User">Utilisateurs</option>
          <option value="App\\Models\\Startup">Startups</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <Skeleton v-for="i in 5" :key="i" class="h-40 rounded-lg" />
      </div>

      <!-- Reports List -->
      <div v-else-if="reports.length > 0" class="space-y-4">
        <Card v-for="report in reports" :key="report.id" class="border-l-4"
          :class="getStatusBorderClass(report.status)">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Report Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <Badge :variant="getTypeVariant(report.reportable_type)">
                  {{ getTypeLabel(report.reportable_type) }}
                </Badge>
                <Badge :variant="getStatusVariant(report.status)">
                  {{ getStatusLabel(report.status) }}
                </Badge>
                <span class="text-sm text-neutral-500">
                  {{ formatDate(report.created_at) }}
                </span>
              </div>

              <h3 class="font-semibold text-neutral-900 mb-1">{{ report.reason }}</h3>

              <!-- Reported Content Preview -->
              <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200 mt-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-medium text-neutral-500 uppercase">Contenu signalé</span>
                  <span class="text-xs text-neutral-400">#{{ report.reportable_id }}</span>
                </div>
                <p v-if="report.reportable" class="text-sm text-neutral-700">
                  {{ getReportableContent(report.reportable) }}
                </p>
                <p v-else class="text-sm text-neutral-500 italic">
                  Contenu non disponible ou supprimé
                </p>
              </div>

              <!-- Reporter Info -->
              <div class="flex items-center gap-2 mt-3 text-sm text-neutral-500">
                <Icon name="User" :size="14" />
                <span>Signalé par {{ report.reporter?.name || 'Anonyme' }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="report.status === 'pending'"
              class="flex flex-col gap-2 lg:border-l lg:border-neutral-100 lg:pl-6">
              <Button variant="outline" size="sm" @click="handleReviewReport(report.id)">
                <Icon name="Eye" :size="16" class="mr-1" />
                Examiner
              </Button>
              <Button size="sm" class="bg-green-600 hover:bg-green-700 text-white" @click="openResolveModal(report)">
                <Icon name="CheckCircle" :size="16" class="mr-1" />
                Résoudre
              </Button>
              <Button variant="outline" size="sm" class="text-neutral-500" @click="openDismissModal(report)">
                Ignorer
              </Button>
              <Button v-if="canDeleteContent(report)" size="sm" class="bg-red-600 hover:bg-red-700 text-white"
                @click="handleDeleteContent(report)">
                <Icon name="Trash" :size="16" class="mr-1" />
                Supprimer contenu
              </Button>
            </div>

            <div v-else-if="report.status === 'reviewed'"
              class="flex flex-col gap-2 lg:border-l lg:border-neutral-100 lg:pl-6">
              <Badge variant="info">En cours d'examen</Badge>
              <Button size="sm" class="bg-green-600 hover:bg-green-700 text-white" @click="openResolveModal(report)">
                <Icon name="CheckCircle" :size="16" class="mr-1" />
                Résoudre
              </Button>
              <Button variant="outline" size="sm" class="text-neutral-500" @click="openDismissModal(report)">
                Ignorer
              </Button>
            </div>

            <div v-else class="lg:border-l lg:border-neutral-100 lg:pl-6">
              <div class="text-sm text-neutral-500">
                <p class="font-medium">
                  {{ report.status === 'resolved' ? 'Résolu' : 'Rejeté' }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" :disabled="pagination.current_page === 1"
            @click="loadReports(pagination.current_page - 1)">
            <Icon name="ChevronLeft" :size="14" />
          </Button>
          <span class="px-4 py-2 text-sm text-neutral-600">
            Page {{ pagination.current_page }} sur {{ pagination.last_page }}
          </span>
          <Button variant="outline" size="sm" :disabled="pagination.current_page === pagination.last_page"
            @click="loadReports(pagination.current_page + 1)">
            <Icon name="ChevronRight" :size="14" />
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <Card v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <Icon name="CheckCircle" :size="40" class="text-green-600" />
        </div>
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">
          {{ activeTab === 'pending' ? 'Aucun signalement en attente' : 'Aucun signalement' }}
        </h3>
        <p class="text-neutral-600 max-w-md mx-auto">
          {{
            activeTab === 'pending'
              ? 'Tous les signalements ont été traités. Excellent travail !'
              : 'Aucun signalement ne correspond à vos critères.'
          }}
        </p>
      </Card>
    </main>

    <!-- Resolve Modal -->
    <Modal :isOpen="showResolveModal" @close="showResolveModal = false" title="Résoudre le signalement">
      <div class="space-y-4">
        <p class="text-neutral-600">
          Décrivez l'action prise pour résoudre ce signalement.
        </p>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Action effectuée</label>
          <textarea v-model="resolveAction" rows="3"
            class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Décrivez l'action prise..."></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showResolveModal = false">Annuler</Button>
          <Button class="bg-green-600 hover:bg-green-700 text-white" @click="handleResolveReport"
            :disabled="actionLoading">
            <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
            Résoudre
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Dismiss Modal -->
    <Modal :isOpen="showDismissModal" @close="showDismissModal = false" title="Rejeter le signalement">
      <div class="space-y-4">
        <p class="text-neutral-600">
          Indiquez pourquoi ce signalement est rejeté (optionnel).
        </p>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Raison du rejet</label>
          <textarea v-model="dismissReason" rows="3"
            class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            placeholder="Le signalement ne respecte pas les critères..."></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDismissModal = false">Annuler</Button>
          <Button variant="outline" @click="handleDismissReport" :disabled="actionLoading">
            <LoadingSpinner v-if="actionLoading" size="sm" class="mr-2" />
            Rejeter
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PageHeader, Card, Button, Badge, Icon, Skeleton, Modal, LoadingSpinner } from '@/components/ui'
import adminApi from '@/services/admin'

const loading = ref(true)
const reports = ref([])
const activeTab = ref('pending')
const selectedType = ref('')
const stats = ref({
  total: 0,
  pending: 0,
  reviewed: 0,
  resolved: 0,
  dismissed: 0,
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

// Modals
const showResolveModal = ref(false)
const showDismissModal = ref(false)
const selectedReport = ref(null)
const resolveAction = ref('')
const dismissReason = ref('')
const actionLoading = ref(false)

const tabs = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewed', label: 'En cours' },
  { value: 'resolved', label: 'Résolus' },
  { value: 'dismissed', label: 'Rejetés' },
]

const loadReports = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
      sort_by: 'created_at',
      sort_order: 'desc',
    }

    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    if (selectedType.value) {
      params.type = selectedType.value
    }

    const { data } = await adminApi.getReports(params)
    reports.value = data.data || []
    pagination.value = {
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      per_page: data.per_page || 15,
      total: data.total || 0,
    }
  } catch (error) {
    console.error('Error loading reports:', error)
    reports.value = []
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data } = await adminApi.getReportsStats()
    stats.value = {
      total: data.total_reports || 0,
      pending: data.pending_reports || 0,
      reviewed: data.reviewed_reports || 0,
      resolved: data.resolved_reports || 0,
      dismissed: data.dismissed_reports || 0,
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const handleReviewReport = async (reportId) => {
  try {
    await adminApi.reviewReport(reportId)
    await loadReports(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Error reviewing report:', error)
    alert('Erreur lors de l\'examen du signalement')
  }
}

const openResolveModal = (report) => {
  selectedReport.value = report
  resolveAction.value = ''
  showResolveModal.value = true
}

const handleResolveReport = async () => {
  actionLoading.value = true
  try {
    await adminApi.resolveReport(selectedReport.value.id, { action_taken: resolveAction.value })
    showResolveModal.value = false
    await loadReports(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Error resolving report:', error)
    alert('Erreur lors de la résolution du signalement')
  } finally {
    actionLoading.value = false
  }
}

const openDismissModal = (report) => {
  selectedReport.value = report
  dismissReason.value = ''
  showDismissModal.value = true
}

const handleDismissReport = async () => {
  actionLoading.value = true
  try {
    await adminApi.dismissReport(selectedReport.value.id, { reason: dismissReason.value })
    showDismissModal.value = false
    await loadReports(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Error dismissing report:', error)
    alert('Erreur lors du rejet du signalement')
  } finally {
    actionLoading.value = false
  }
}

const canDeleteContent = (report) => {
  return ['App\\Models\\Post', 'App\\Models\\Comment', 'App\\Models\\Startup'].includes(report.reportable_type)
}

const handleDeleteContent = async (report) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return

  try {
    if (report.reportable_type === 'App\\Models\\Post') {
      await adminApi.deletePost(report.reportable_id)
    } else if (report.reportable_type === 'App\\Models\\Comment') {
      await adminApi.deleteComment(report.reportable_id)
    } else if (report.reportable_type === 'App\\Models\\Startup') {
      await adminApi.deleteStartup(report.reportable_id)
    }

    // Resolve the report after deleting content
    await adminApi.resolveReport(report.id, { action_taken: 'Contenu supprimé' })
    await loadReports(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Error deleting content:', error)
    alert('Erreur lors de la suppression du contenu')
  }
}

const getReportableContent = (reportable) => {
  if (!reportable) return ''
  return reportable.content || reportable.description || reportable.nom || reportable.name || 'Contenu non disponible'
}

const getTypeVariant = (type) => {
  const variants = {
    'App\\Models\\Post': 'primary',
    'App\\Models\\Comment': 'info',
    'App\\Models\\User': 'warning',
    'App\\Models\\Startup': 'success',
  }
  return variants[type] || 'neutral'
}

const getTypeLabel = (type) => {
  const labels = {
    'App\\Models\\Post': 'Publication',
    'App\\Models\\Comment': 'Commentaire',
    'App\\Models\\User': 'Utilisateur',
    'App\\Models\\Startup': 'Startup',
  }
  return labels[type] || type?.split('\\').pop() || 'Inconnu'
}

const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    reviewed: 'info',
    resolved: 'success',
    dismissed: 'neutral',
  }
  return variants[status] || 'neutral'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    reviewed: 'En cours',
    resolved: 'Résolu',
    dismissed: 'Rejeté',
  }
  return labels[status] || status
}

const getStatusBorderClass = (status) => {
  const classes = {
    pending: 'border-l-yellow-500',
    reviewed: 'border-l-blue-500',
    resolved: 'border-l-green-500',
    dismissed: 'border-l-neutral-300',
  }
  return classes[status] || 'border-l-neutral-300'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  Promise.all([loadReports(), loadStats()])
})
</script>
