<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="!startup" class="max-w-4xl mx-auto px-4">
    <Alert type="error">Startup non trouvée</Alert>
  </div>

  <div v-else class="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
    <!-- Back Button -->
    <button @click="router.push('/startups')"
      class="flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-theme transition text-sm md:text-base">
      <Icon name="ChevronLeft" :size="18" />
      <span class="font-medium">Retour</span>
    </button>

    <!-- Header Card -->
    <Card class="relative overflow-hidden">
      <!-- Cover -->
      <div class="h-32 md:h-48 bg-gradient-to-br from-theme to-theme-hover"></div>

      <!-- Content -->
      <div class="px-4 md:px-8 pb-4 md:pb-8">
        <!-- Logo -->
        <div
          class="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 md:-mt-16 mb-4 md:mb-6 gap-3 sm:gap-0">
          <div
            class="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
            <span class="text-3xl md:text-4xl font-bold text-theme">
              {{ startup.name[0] }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:gap-3">
            <Button v-if="isOwner" variant="outline" size="sm">
              <Icon name="Edit" :size="14" />
              <span class="hidden sm:inline">Modifier</span>
            </Button>
            <!-- <Button v-if="canJoin" size="sm" @click="handleJoinRequest">
              <Icon name="UserPlus" :size="14" />
              <span class="hidden sm:inline">Rejoindre</span>
            </Button> -->
            <!-- <Badge v-if="isJoinRequested" color="yellow" size="sm">Demande envoyée</Badge> -->

            <!-- Connection request button -->
            <Button v-if="canConnect && !connectionStatus" @click="showConnectionModal = true" variant="outline"
              size="sm">
              <Icon name="UserPlus" :size="14" />
              <span class="hidden sm:inline">Se connecter</span>
            </Button>
            <Badge v-if="connectionStatus === 'pending'" color="yellow" size="sm">En attente</Badge>
            <Badge v-if="connectionStatus === 'accepted'" color="green" size="sm">✓ Connectés</Badge>
          </div>
        </div>

        <!-- Title & Info -->
        <div class="space-y-3 md:space-y-4">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 md:gap-3 mb-2">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {{ startup.name }}
                </h1>
                <Icon v-if="startup.verified" name="CheckCircle" :size="20" class="text-blue-500" />
              </div>
              <div class="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                <span class="flex items-center gap-1">
                  <Icon name="MapPin" :size="14" />
                  {{ startup.location }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="Users" :size="14" />
                  {{ members.length }} membre{{ members.length > 1 ? 's' : '' }}
                </span>
                <span v-if="user?.role === 'admin' && startup.rccm" class="flex items-center gap-1 font-mono text-xs">
                  <Icon name="FileText" :size="14" />
                  {{ startup.rccm }}
                </span>
              </div>
            </div>

            <Badge color="theme" size="md" class="self-start">
              {{ startup.sector }}
            </Badge>
          </div>

          <p v-if="startup.description" class="text-gray-700 text-sm md:text-lg leading-relaxed">
            {{ startup.description }}
          </p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-4 md:space-y-6">
        <!-- About -->
        <Card>
          <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <Icon name="Info" class="text-theme" :size="18" />
            À propos
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>{{ startup.description || 'Aucune description disponible pour le moment.' }}</p>

            <div v-if="startup.website" class="flex items-center gap-2">
              <Icon name="Globe" :size="16" class="text-gray-400" />
              <a :href="startup.website" target="_blank" rel="noopener noreferrer" class="text-theme hover:underline">
                {{ startup.website }}
              </a>
            </div>
          </div>
        </Card>

        <!-- Pending Members (Visible to Founder Only, debug visible même si vide) -->
        <Card v-if="isOwner" class="border-2 border-orange-200 bg-orange-50">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="Clock" :size="20" class="text-orange-600" />
            <h3 class="font-bold text-lg md:text-xl text-orange-900">
              Demandes d'adhésion en attente ({{ pendingMembers.length }})
            </h3>
          </div>
          <div v-if="pendingMembers.length > 0" class="grid grid-cols-1 gap-3">
            <div v-for="member in pendingMembers" :key="member.memberId"
              class="flex items-center gap-3 p-4 rounded-lg bg-white border border-orange-200">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-lg font-bold text-orange-600">{{
                  member.displayName[0]
                  }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-900">{{ member.displayName }}</p>
                <p class="text-sm text-gray-600">{{ member.email }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  <strong>Poste:</strong>
                  {{
                    member.position || member.title
                      ? (member.position || '') + ' ' + (member.title || '')
                      : 'Aucun poste spécifié'
                  }}
                </p>
              </div>
              <div class="flex gap-2">
                <Button size="sm" variant="success" @click="handleValidateMember(member.memberId)"
                  :disabled="processingMember">
                  <Icon name="Check" :size="16" />
                  Accepter
                </Button>
                <Button size="sm" variant="danger" @click="handleRejectMember(member.memberId)"
                  :disabled="processingMember">
                  <Icon name="X" :size="16" />
                  Refuser
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <!-- Team Members -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Users" class="text-theme" />
            Équipe ({{ members.length }})
          </h2>

          <p v-if="members.length === 0" class="text-gray-500 text-sm">
            Aucun membre pour le moment
          </p>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="member in members" :key="member.uid"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div class="w-12 h-12 bg-theme-light rounded-full flex items-center justify-center text-theme font-bold">
                {{ member.displayName?.[0] || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ member.displayName }}</p>
                <p class="text-xs text-gray-600 capitalize">
                  <template v-if="member.position || member.title">
                    {{ member.position }}{{ member.position && member.title ? ' - ' : '' }}{{
                      member.title
                    }}
                  </template>
                  <template v-else>
                    {{ member.role }}
                  </template>
                </p>
                <Badge v-if="!member.isValidated && !isOwner" color="yellow" size="sm" class="mt-1">
                  En attente de validation
                </Badge>
              </div>
              <Badge v-if="member.role === 'fondateur'" color="theme" size="sm">Fondateur</Badge>
            </div>
          </div>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Info -->
        <Card>
          <h3 class="font-bold mb-4">Informations</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-2">
              <Icon name="Building2" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Secteur</p>
                <p class="font-semibold">{{ startup.sector }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <Icon name="MapPin" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">Localisation</p>
                <p class="font-semibold">{{ startup.location }}</p>
              </div>
            </div>

            <div v-if="user?.role === 'admin' && startup.rccm" class="flex items-start gap-2">
              <Icon name="FileText" :size="16" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500">RCCM</p>
                <p class="font-mono text-xs">{{ startup.rccm }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <Icon :name="startup.verified ? 'CheckCircle' : 'AlertCircle'" :size="16"
                :class="['mt-0.5', startup.verified ? 'text-green-500' : 'text-orange-500']" />
              <div>
                <p class="text-gray-500">Statut</p>
                <p :class="[
                  'font-semibold',
                  startup.verified ? 'text-green-600' : 'text-orange-600',
                ]">
                  {{ startup.verified ? 'Vérifiée' : 'En attente de vérification' }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Contact -->
        <Card>
          <h3 class="font-bold mb-4">Contact</h3>
          <div class="space-y-2">
            <Button variant="outline" class="w-full justify-start" @click="sendMessageToOwner"
              :disabled="!startupOwner || startupOwner.id === user?.id">
              <Icon name="Mail" :size="16" />
              Envoyer un message
            </Button>
            <!-- <Button variant="outline" class="w-full justify-start">
              <Icon name="Share" :size="16" />
              Partager le profil
            </Button> -->
          </div>
        </Card>
      </div>
    </div>

    <!-- Connection Request Modal -->
    <Modal :isOpen="showConnectionModal" @close="showConnectionModal = false" title="Demande de connexion">
      <div class="space-y-4">
        <p class="text-gray-700">
          Envoyez une demande de connexion à <strong>{{ startup.name }}</strong> pour développer
          votre réseau.
        </p>
        <Textarea label="Message (optionnel)"
          placeholder="Présentez-vous et expliquez pourquoi vous souhaitez vous connecter..."
          v-model="connectionMessage" :rows="4" />
        <div class="flex gap-3 justify-end">
          <Button variant="outline" @click="showConnectionModal = false" :disabled="sendingConnection">
            Annuler
          </Button>
          <Button @click="handleSendConnectionRequest" :disabled="sendingConnection">
            <LoadingSpinner v-if="sendingConnection" size="sm" />
            <template v-else>
              <Icon name="Send" :size="16" />
              Envoyer la demande
            </template>
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import startupApi from '../../services/startup'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  Modal,
  Textarea,
  Icon,
} from '../../components/ui'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const authStore = useAuthStore()
const toast = useToast()

const startup = ref(null)
const members = ref([])
const pendingMembers = ref([])
const loading = ref(true)
const isJoinRequested = ref(false)
const sendingRequest = ref(false)
const processingMember = ref(false)

// Connection states
const connectionStatus = ref(null)
const showConnectionModal = ref(false)
const connectionMessage = ref('')
const sendingConnection = ref(false)

const isOwner = computed(() => {
  if (user.value?.role !== 'startuper') return false
  const userStartupId = user.value?.startupId || user.value?.startup_id || user.value?.startup?.id
  return String(userStartupId) === String(route.params.id)
})
const canJoin = computed(
  () => user.value?.role === 'startuper' && !user.value?.startupId && !isJoinRequested.value,
)
const canConnect = computed(() => user.value?.startupId && user.value.startupId !== route.params.id)

// Trouver l'owner/founder de la startup
const startupOwner = computed(() => {
  const owner = members.value.find(m => m.role === 'owner' || m.role === 'founder')
  return owner || members.value[0] || null
})

const loadData = async () => {
  loading.value = true
  try {
    // Charger la startup depuis l'API
    const { data } = await startupApi.get(route.params.id)
    const startupData = data.data || data

    if (!startupData) {
      toast.error('Startup non trouvée')
      router.push('/startups')
      return
    }

    // Adapter le format des données
    startup.value = {
      id: startupData.id,
      name: startupData.nom,
      sector: startupData.secteur?.nom || 'Non spécifié',
      location: startupData.emplacement || 'Non spécifié',
      description: startupData.description,
      verified: !!startupData.registre_commerce_pdf_path,
      logo: startupData.logo,
      rccm: startupData.registre_commerce_number,
      website: startupData.site_web,
      email: startupData.contact_email,
      phone: startupData.telephone,
      taille: startupData.taille,
    }

    // Charger les membres validés
    const allMembers = (startupData.members || []).map((m) => ({
      uid: m.user_id || m.id,
      id: m.user_id || m.id,
      memberId: m.startup_member_id,
      displayName: m.user?.name || m.name || 'Membre',
      email: m.user?.email || m.email || '',
      role: m.role || 'membre',
      position: m.position?.nom || m.position || '',
      title: m.title?.nom || m.title || '',
      photo: m.user?.photo || m.photo,
      isValidated: m.is_validated !== false,
    }))


    // Séparer les membres validés et non validés
    members.value = allMembers.filter((m) => m.isValidated)
    pendingMembers.value = allMembers.filter((m) => !m.isValidated)

    // Vérifier si l'utilisateur a déjà demandé à rejoindre
    if (authStore.user?.role === 'startuper' && !authStore.user?.startup_id) {
      try {
        const { data: requests } = await startupApi.getMyJoinRequests()
        const pendingRequest = (requests.data || requests || []).find(
          (r) => r.startup_id === parseInt(route.params.id) && r.status === 'pending',
        )
        isJoinRequested.value = !!pendingRequest
      } catch (err) {
        console.log('Could not load join requests:', err)
      }
    }
  } catch (error) {
    console.error('Error loading startup:', error)
    toast.error('Erreur lors du chargement de la startup')
    router.push('/startups')
  } finally {
    loading.value = false
  }
}

const handleJoinRequest = async () => {
  if (sendingRequest.value) return

  sendingRequest.value = true
  try {
    await startupApi.sendJoinRequest(route.params.id)
    isJoinRequested.value = true
    toast.success('Demande envoyée avec succès !')
  } catch (error) {
    console.error('Error sending join request:', error)
    toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la demande")
  } finally {
    sendingRequest.value = false
  }
}

const handleSendConnectionRequest = async () => {
  if (!user.value || !user.value.startupId) return

  sendingConnection.value = true
  try {
    // TODO: Implémenter la méthode sendConnectionRequest dans startupApi
    // await startupApi.sendConnectionRequest(user.value.startupId, route.params.id, connectionMessage.value)
    connectionStatus.value = 'pending'
    showConnectionModal.value = false
    connectionMessage.value = ''
    toast.success('Demande de connexion envoyée !')
  } catch (error) {
    console.error('Error sending connection request:', error)
    toast.error('Erreur lors de l\'envoi de la demande de connexion')
  } finally {
    sendingConnection.value = false
  }
}

const handleValidateMember = async (memberId) => {
  if (processingMember.value) return

  processingMember.value = true
  try {
    await startupApi.validateMember(memberId)
    toast.success('Membre validé avec succès !')
    // Recharger les données
    await loadData()
  } catch (error) {
    console.error('Error validating member:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la validation du membre')
  } finally {
    processingMember.value = false
  }
}

const handleRejectMember = async (memberId) => {
  if (processingMember.value) return

  if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return

  processingMember.value = true
  try {
    await startupApi.rejectMember(memberId)
    toast.success('Demande rejetée avec succès')
    // Recharger les données
    await loadData()
  } catch (error) {
    console.error('Error rejecting member:', error)
    toast.error(error.response?.data?.message || 'Erreur lors du rejet de la demande')
  } finally {
    processingMember.value = false
  }
}

// Envoyer un message au propriétaire de la startup
const sendMessageToOwner = () => {
  if (!startupOwner.value) {
    toast.error('Impossible de trouver le propriétaire de cette startup')
    return
  }

  if (!user.value) {
    toast.error('Vous devez être connecté pour envoyer un message')
    router.push('/login')
    return
  }

  // Rediriger vers la messagerie avec l'ID du propriétaire
  router.push(`/messages?user=${startupOwner.value.id}`)
}

onMounted(loadData)
</script>
