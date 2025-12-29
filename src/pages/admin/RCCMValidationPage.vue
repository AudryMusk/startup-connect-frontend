<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader title="Validation RCCM" subtitle="Vérifiez les documents des nouvelles startups"
      :breadcrumbs="[{ label: 'Accueil', to: '/admin/home' }, { label: 'Validation RCCM' }]" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <template v-else>
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card class="text-center">
            <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
            <p class="text-sm text-neutral-500">Total</p>
          </Card>
          <Card class="text-center">
            <p class="text-3xl font-bold text-orange-600">{{ stats.pending }}</p>
            <p class="text-sm text-neutral-500">En attente</p>
          </Card>
          <Card class="text-center">
            <p class="text-3xl font-bold text-theme-success">{{ stats.validated }}</p>
            <p class="text-sm text-neutral-500">Validés</p>
          </Card>
          <Card class="text-center">
            <p class="text-3xl font-bold text-theme-error">{{ stats.rejected }}</p>
            <p class="text-sm text-neutral-500">Rejetés</p>
          </Card>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <div class="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
            <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors" :class="activeTab === tab.value
                ? 'bg-orange-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                ">
              {{ tab.label }}
            </button>
          </div>

          <div class="flex-1"></div>

          <Button variant="outline" size="sm" @click="loadStartups" :disabled="loading">
            <Icon name="RefreshCw" :size="16" class="mr-1" :class="{ 'animate-spin': loading }" />
            Actualiser
          </Button>

          <div class="relative">
            <Icon name="Search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher une startup..."
              class="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
        </div>

        <!-- Startups List -->
        <div v-if="filteredStartups.length > 0" class="space-y-4">
          <Card v-for="startup in filteredStartups" :key="startup.id" class="border-l-4" :class="getStartupStatus(startup) === 'pending'
            ? 'border-l-orange-500'
            : getStartupStatus(startup) === 'validated'
              ? 'border-l-green-500'
              : 'border-l-red-500'
            ">
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Startup Info -->
              <div class="flex items-start gap-4 flex-1">
                <div v-if="startup.logo" class="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img :src="startup.logo" :alt="startup.name" class="w-full h-full object-cover" />
                </div>
                <div v-else
                  class="h-16 w-16 rounded-xl bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {{ startup.name?.charAt(0) || 'S' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 class="text-lg font-semibold text-neutral-900">{{ startup.nom || startup.name }}</h3>
                    <Badge :variant="getStatusVariant(getStartupStatus(startup))">
                      {{ getStatusLabel(getStartupStatus(startup)) }}
                    </Badge>
                  </div>
                  <p class="text-sm text-neutral-600 mb-2">
                    {{ getSectorName(startup) }} • {{ startup.emplacement || startup.city || startup.location || 'Non spécifié' }}
                  </p>

                  <div class="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <span v-if="getFounderName(startup)" class="flex items-center gap-1">
                      <Icon name="User" :size="14" />
                      {{ getFounderName(startup) }}
                    </span>
                    <span v-if="getFounderEmail(startup)" class="flex items-center gap-1">
                      <Icon name="Mail" :size="14" />
                      {{ getFounderEmail(startup) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="Calendar" :size="14" />
                      Inscrit le {{ formatDate(startup.created_at || startup.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- RCCM Info -->
              <div class="lg:border-l lg:border-neutral-100 lg:pl-6 flex-shrink-0 min-w-[240px]">
                <div class="bg-neutral-50 rounded-lg p-4 mb-4">
                  <p class="text-xs font-medium text-neutral-500 uppercase mb-2">Numéro RCCM</p>
                  <p class="text-lg font-mono font-semibold text-neutral-900">
                    {{ startup.registre_commerce_number || startup.rccm || startup.registre_commerce || 'Non fourni' }}
                  </p>
                </div>

                <!-- Actions -->
                <div v-if="getStartupStatus(startup) === 'pending'" class="flex flex-col gap-2">
                  <Button
                    v-if="startup.registre_commerce_pdf_path || startup.rccm_document || startup.registre_commerce_pdf"
                    variant="outline" size="sm" @click="viewDocument(startup)">
                    <Icon name="FileText" :size="16" class="mr-1" />
                    Voir le document
                  </Button>
                  <Button size="sm" class="bg-theme-success hover:bg-green-700 text-white"
                    :disabled="validatingId === startup.id" @click="handleValidateStartup(startup.id)">
                    <Icon v-if="validatingId === startup.id" name="Loader2" :size="16" class="mr-1 animate-spin" />
                    <Icon v-else name="CheckCircle" :size="16" class="mr-1" />
                    Valider
                  </Button>
                  <Button variant="outline" size="sm" class="text-theme-error hover:bg-red-50"
                    @click="showRejectModal(startup)">
                    <Icon name="X" :size="16" class="mr-1" />
                    Rejeter
                  </Button>
                </div>

                <div v-else class="text-sm">
                  <p class="text-neutral-500">
                    {{ getStartupStatus(startup) === 'validated' ? 'Validé' : 'Rejeté' }} le
                    {{ formatDate(startup.validated_at || startup.rejected_at || startup.updated_at) }}
                  </p>
                  <p v-if="startup.rejection_reason || startup.rejectionReason" class="text-red-600 mt-1">
                    Raison: {{ startup.rejection_reason || startup.rejectionReason }}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Empty State -->
        <Card v-else class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Icon name="CheckCircle" :size="40" class="text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-neutral-900 mb-2">
            {{ activeTab === 'pending' ? 'Aucune validation en attente' : 'Aucune startup trouvée' }}
          </h3>
          <p class="text-neutral-600 max-w-md mx-auto">
            {{
              activeTab === 'pending'
                ? 'Toutes les startups ont été vérifiées. Excellent travail !'
                : 'Aucune startup ne correspond à vos critères de recherche.'
            }}
          </p>
        </Card>
      </template>
    </main>

    <!-- Reject Modal -->
    <div v-if="showingRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card class="w-full max-w-md">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900">Rejeter la startup</h3>
            <button @click="showingRejectModal = false" class="text-neutral-400 hover:text-neutral-600">
              <Icon name="X" :size="20" />
            </button>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-neutral-600">
            Vous êtes sur le point de rejeter <strong>{{ selectedStartup?.name }}</strong>. Veuillez indiquer la raison
            du
            rejet.
          </p>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Raison du rejet</label>
            <select v-model="rejectionReason"
              class="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Sélectionnez une raison</option>
              <option value="invalid_rccm">Numéro RCCM invalide</option>
              <option value="document_unreadable">Document illisible</option>
              <option value="mismatch">Informations non concordantes</option>
              <option value="expired">Document expiré</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div v-if="rejectionReason === 'other'">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Précisez</label>
            <textarea v-model="rejectionDetails" rows="3"
              class="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Décrivez la raison du rejet..."></textarea>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <Button variant="outline" @click="showingRejectModal = false"> Annuler </Button>
            <Button class="bg-theme-error hover:bg-red-700 text-white" :disabled="!rejectionReason || rejectingId"
              @click="confirmReject">
              <Icon v-if="rejectingId" name="Loader2" :size="16" class="mr-1 animate-spin" />
              Confirmer le rejet
            </Button>
          </div>
        </template>
      </Card>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showingDocumentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeDocumentModal">
      <Card class="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900">Document RCCM - {{ selectedStartupForDoc?.nom ||
              selectedStartupForDoc?.name }}</h3>
            <button @click="closeDocumentModal"
              class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Fermer">
              <Icon name="X" :size="24" />
            </button>
          </div>
        </template>

        <div class="flex-1 overflow-auto p-4">
          <div v-if="documentLoading" class="flex items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
          <iframe v-else-if="documentUrl" :src="documentUrl" class="w-full h-[600px] border rounded-lg"></iframe>
          <div v-else class="text-center py-16 text-neutral-500">
            <Icon name="FileX" :size="48" class="mx-auto mb-4 text-neutral-400" />
            <p>Impossible de charger le document</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <Button variant="outline" @click="closeDocumentModal"> Fermer </Button>
            <a v-if="documentUrl" :href="documentUrl" target="_blank"
              class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Icon name="ExternalLink" :size="16" class="mr-1" />
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageHeader, Card, Button, Badge, Icon } from '@/components/ui'
import adminApi from '@/services/admin'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// Data
const loading = ref(false)
const validatingId = ref(null)
const rejectingId = ref(null)
const activeTab = ref('pending')
const searchQuery = ref('')
const showingRejectModal = ref(false)
const showingDocumentModal = ref(false)
const selectedStartup = ref(null)
const selectedStartupForDoc = ref(null)
const documentUrl = ref(null)
const documentLoading = ref(false)
const rejectionReason = ref('')
const rejectionDetails = ref('')
const startups = ref([])

const tabs = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'validated', label: 'Validés' },
  { value: 'rejected', label: 'Rejetés' },
]

// Computed
const stats = computed(() => ({
  total: startups.value.length,
  pending: startups.value.filter((s) => getStartupStatus(s) === 'pending').length,
  validated: startups.value.filter((s) => getStartupStatus(s) === 'validated').length,
  rejected: startups.value.filter((s) => getStartupStatus(s) === 'rejected').length,
}))

const filteredStartups = computed(() => {
  let result = startups.value

  if (activeTab.value !== 'all') {
    result = result.filter((s) => getStartupStatus(s) === activeTab.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        (s.nom || s.name)?.toLowerCase().includes(query) ||
        s.registre_commerce_number?.toLowerCase().includes(query) ||
        s.rccm?.toLowerCase().includes(query) ||
        s.registre_commerce?.toLowerCase().includes(query) ||
        getFounderName(s)?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
})

// Methods
const getStartupStatus = (startup) => {
  // Check if explicitly rejected
  if (startup.status === 'rejected' || (startup.is_validated === false && startup.rejection_reason)) {
    return 'rejected'
  }

  // Check if explicitly validated by admin
  if (startup.is_validated === true || startup.verified === true || startup.status === 'validated') {
    return 'validated'
  }

  // Nouvelle logique métier: Une startup est considérée comme VÉRIFIÉE si:
  // - Le numéro RCCM est renseigné ET
  // - Le fichier RCCM est uploadé
  const hasRccmNumber = !!(startup.registre_commerce_number || startup.rccm || startup.registre_commerce)
  const hasRccmDocument = !!(startup.registre_commerce_pdf_path || startup.rccm_document || startup.registre_commerce_pdf)

  if (hasRccmNumber && hasRccmDocument) {
    // Documents complets - en attente de validation admin
    return 'pending'
  }

  // Documents incomplets - non vérifié (considéré comme en attente également)
  return 'pending'
}

// Fonction pour vérifier si une startup a tous ses documents RCCM
const isStartupVerified = (startup) => {
  const hasRccmNumber = !!(startup.registre_commerce_number || startup.rccm || startup.registre_commerce)
  const hasRccmDocument = !!(startup.registre_commerce_pdf_path || startup.rccm_document || startup.registre_commerce_pdf)
  return hasRccmNumber && hasRccmDocument
}

const getSectorName = (startup) => {
  // Handle both object and string sector formats
  if (startup.secteur) {
    return typeof startup.secteur === 'object' ? startup.secteur.nom : startup.secteur
  }
  return startup.sector || startup.industry || 'Non spécifié'
}

const getFounderName = (startup) => {
  return startup.founder?.name || startup.user?.name || startup.founder_name || null
}

const getFounderEmail = (startup) => {
  return startup.email || startup.founder?.email || startup.user?.email || null
}

const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    validated: 'success',
    rejected: 'error',
  }
  return variants[status] || 'neutral'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    validated: 'Validé',
    rejected: 'Rejeté',
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'Non disponible'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const loadStartups = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.getStartups({ per_page: 100 })
    startups.value = data.data || data || []
  } catch (error) {
    console.error('Error loading startups:', error)
    toast.error('Erreur lors du chargement des startups')
  } finally {
    loading.value = false
  }
}

const viewDocument = async (startup) => {
  selectedStartupForDoc.value = startup
  showingDocumentModal.value = true
  documentLoading.value = true
  documentUrl.value = null

  try {
    // Always try to download fresh from admin API to avoid JWT expiration issues
    const response = await adminApi.downloadRegistreCommerce(startup.id)
    if (response.data) {
      documentUrl.value = URL.createObjectURL(response.data)
    }
  } catch (error) {
    console.error('Error loading document:', error)

    // Handle JWT expiration error specifically
    if (error.response?.data?.error === 'InvalidJWT' ||
      error.response?.data?.message?.includes('exp') ||
      error.response?.status === 401) {
      toast.error('Session expirée. Veuillez vous reconnecter.')
    } else {
      toast.error('Impossible de charger le document')
    }

    // Close modal on error
    showingDocumentModal.value = false
  } finally {
    documentLoading.value = false
  }
}

const closeDocumentModal = () => {
  // Revoke object URL if it was created
  if (documentUrl.value && documentUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(documentUrl.value)
  }
  showingDocumentModal.value = false
  documentUrl.value = null
  selectedStartupForDoc.value = null
}

const handleValidateStartup = async (startupId) => {
  validatingId.value = startupId
  try {
    await adminApi.validateStartup(startupId)

    // Update local state
    const index = startups.value.findIndex((s) => s.id === startupId)
    if (index !== -1) {
      startups.value[index] = {
        ...startups.value[index],
        is_validated: true,
        verified: true,
        validated_at: new Date().toISOString(),
      }
    }

    toast.success('Startup validée avec succès')
  } catch (error) {
    console.error('Error validating startup:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la validation')
  } finally {
    validatingId.value = null
  }
}

const showRejectModal = (startup) => {
  selectedStartup.value = startup
  rejectionReason.value = ''
  rejectionDetails.value = ''
  showingRejectModal.value = true
}

const confirmReject = async () => {
  if (!selectedStartup.value || !rejectionReason.value) return

  rejectingId.value = selectedStartup.value.id

  try {
    const reasonText =
      rejectionReason.value === 'other'
        ? rejectionDetails.value
        : getRejectionReasonText(rejectionReason.value)

    await adminApi.rejectStartup(selectedStartup.value.id, {
      reason: reasonText,
      rejection_reason: reasonText
    })

    // Update local state
    const index = startups.value.findIndex((s) => s.id === selectedStartup.value.id)
    if (index !== -1) {
      startups.value[index] = {
        ...startups.value[index],
        is_validated: false,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reasonText,
      }
    }

    toast.success('Startup rejetée')
    showingRejectModal.value = false
  } catch (error) {
    console.error('Error rejecting startup:', error)
    toast.error(error.response?.data?.message || 'Erreur lors du rejet')
  } finally {
    rejectingId.value = null
  }
}

const getRejectionReasonText = (reason) => {
  const texts = {
    invalid_rccm: 'Numéro RCCM invalide',
    document_unreadable: 'Document illisible',
    mismatch: 'Informations non concordantes',
    expired: 'Document expiré',
  }
  return texts[reason] || reason
}

// Lifecycle
onMounted(() => {
  loadStartups()
})
</script>
