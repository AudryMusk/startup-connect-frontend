<template>
    <div class="min-h-screen bg-neutral-50">
        <PageHeader title="Gestion des Startups" subtitle="Consulter et gérer les startups de la plateforme"
            :breadcrumbs="[{ label: 'Administration', to: '/admin-home' }, { label: 'Startups' }]" />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card class="text-center">
                    <p class="text-3xl font-bold text-neutral-900">{{ stats.total }}</p>
                    <p class="text-sm text-neutral-500">Total</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-emerald-600">{{ stats.newThisMonth }}</p>
                    <p class="text-sm text-neutral-500">Ce mois</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-blue-600">{{ stats.withRccm }}</p>
                    <p class="text-sm text-neutral-500">Avec RCCM</p>
                </Card>
                <Card class="text-center">
                    <p class="text-3xl font-bold text-amber-600">{{ stats.withoutRccm }}</p>
                    <p class="text-sm text-neutral-500">Sans RCCM</p>
                </Card>
            </div>

            <!-- Filters -->
            <Card class="mb-6">
                <div class="flex flex-wrap items-center gap-4">
                    <!-- Search -->
                    <div class="relative flex-1 min-w-[200px]">
                        <Icon name="Search" :size="18"
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input v-model="filters.search" type="text" placeholder="Rechercher une startup..."
                            class="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            @input="debouncedSearch" />
                    </div>

                    <!-- Sector Filter -->
                    <select v-model="filters.secteur"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadStartups">
                        <option value="">Tous les secteurs</option>
                        <option v-for="secteur in secteurs" :key="secteur.id" :value="secteur.id">
                            {{ secteur.nom }}
                        </option>
                    </select>

                    <!-- Location Filter -->
                    <select v-model="filters.location"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadStartups">
                        <option value="">Toutes les villes</option>
                        <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
                    </select>

                    <!-- RCCM Filter -->
                    <select v-model="filters.hasRccm"
                        class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        @change="loadStartups">
                        <option value="">RCCM: Tous</option>
                        <option value="true">Avec RCCM</option>
                        <option value="false">Sans RCCM</option>
                    </select>
                </div>
            </Card>

            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
                <Skeleton v-for="i in 5" :key="i" class="h-32 rounded-lg" />
            </div>

            <!-- Startups List -->
            <div v-else-if="startups.length > 0" class="space-y-4">
                <Card v-for="startup in startups" :key="startup.id" class="hover:shadow-md transition-shadow">
                    <div class="flex flex-col lg:flex-row gap-4">
                        <!-- Startup Info -->
                        <div class="flex items-start gap-4 flex-1">
                            <div
                                class="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                {{ startup.nom?.charAt(0) || '?' }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 class="text-lg font-semibold text-neutral-900">{{ startup.nom }}</h3>
                                    <Badge v-if="startup.registre_commerce_pdf_path" variant="success"
                                        class="flex items-center gap-1">
                                        <Icon name="CheckCircle" :size="12" />
                                        RCCM
                                    </Badge>
                                </div>
                                <p class="text-sm text-neutral-600 line-clamp-2 mb-2">
                                    {{ startup.description || 'Aucune description' }}
                                </p>
                                <div class="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                                    <span v-if="startup.secteur" class="flex items-center gap-1">
                                        <Icon name="Tag" :size="14" />
                                        {{ startup.secteur.nom || 'N/A' }}
                                    </span>
                                    <span v-if="startup.emplacement" class="flex items-center gap-1">
                                        <Icon name="MapPin" :size="14" />
                                        {{ startup.emplacement }}
                                    </span>
                                    <span v-if="startup.taille" class="flex items-center gap-1">
                                        <Icon name="Users" :size="14" />
                                        {{ startup.taille }}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <Icon name="Calendar" :size="14" />
                                        {{ formatDate(startup.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- RCCM Info -->
                        <div v-if="startup.registre_commerce_number"
                            class="lg:border-l lg:border-neutral-200 lg:pl-6 flex-shrink-0">
                            <div class="bg-neutral-50 rounded-lg p-3">
                                <p class="text-xs text-neutral-500 uppercase mb-1">N° RCCM</p>
                                <p class="font-mono font-semibold text-neutral-900">
                                    {{ startup.registre_commerce_number }}
                                </p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-col gap-2 flex-shrink-0">
                            <router-link :to="`/startups/${startup.id}`">
                                <Button variant="outline" size="sm" class="w-full">
                                    <Icon name="Eye" :size="14" class="mr-1" />
                                    Voir
                                </Button>
                            </router-link>
                            <Button v-if="startup.registre_commerce_pdf_path" variant="outline" size="sm"
                                @click="downloadRccm(startup)">
                                <Icon name="Download" :size="14" class="mr-1" />
                                RCCM PDF
                            </Button>
                            <Button variant="outline" size="sm" class="text-red-600 hover:bg-red-50"
                                @click="openDeleteModal(startup)">
                                <Icon name="Trash2" :size="14" class="mr-1" />
                                Supprimer
                            </Button>
                        </div>
                    </div>

                    <!-- Founder Info -->
                    <div v-if="startup.founder" class="mt-4 pt-4 border-t border-neutral-100">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                {{ startup.founder.name?.charAt(0) || '?' }}
                            </div>
                            <div>
                                <p class="text-sm font-medium text-neutral-900">{{ startup.founder.name }}</p>
                                <p class="text-xs text-neutral-500">Fondateur • {{ startup.founder.email }}</p>
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
                    <Icon name="Building2" :size="40" class="text-neutral-400" />
                </div>
                <h3 class="text-xl font-semibold text-neutral-900 mb-2">Aucune startup trouvée</h3>
                <p class="text-neutral-600 max-w-md mx-auto">
                    Aucune startup ne correspond à vos critères de recherche.
                </p>
            </Card>
        </main>

        <!-- Delete Modal -->
        <Modal :isOpen="showDeleteModal" @close="showDeleteModal = false" title="Supprimer la startup">
            <div v-if="selectedStartup" class="space-y-4">
                <div class="p-4 bg-red-50 rounded-lg">
                    <p class="text-red-800">
                        <strong>Attention !</strong> Cette action est irréversible. La startup
                        <strong>{{ selectedStartup.nom }}</strong> et toutes ses données seront supprimées.
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
import { ref, onMounted } from 'vue'
import { Card, Badge, Button, Icon, PageHeader, Skeleton, Modal, LoadingSpinner } from '@/components/ui'
import adminApi from '@/services/admin'
import api from '@/services/api'

const loading = ref(true)
const startups = ref([])
const secteurs = ref([])
const locations = ref([])
const stats = ref({
    total: 0,
    newThisMonth: 0,
    withRccm: 0,
    withoutRccm: 0,
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
    secteur: '',
    location: '',
    hasRccm: '',
})

// Modal
const showDeleteModal = ref(false)
const selectedStartup = ref(null)
const actionLoading = ref(false)

let searchTimeout = null

const loadStartups = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            per_page: pagination.value.per_page,
        }

        if (filters.value.search) params.search = filters.value.search
        if (filters.value.secteur) params.secteur_id = filters.value.secteur
        if (filters.value.location) params.emplacement = filters.value.location

        const { data } = await api.get('/startups', { params })
        startups.value = data.data || data || []

        if (data.meta || data.current_page) {
            pagination.value = {
                current_page: data.meta?.current_page || data.current_page || 1,
                last_page: data.meta?.last_page || data.last_page || 1,
                per_page: data.meta?.per_page || data.per_page || 15,
                total: data.meta?.total || data.total || 0,
            }
        }
    } catch (error) {
        console.error('Error loading startups:', error)
        startups.value = []
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        const { data } = await adminApi.getStartupsStats()
        stats.value = {
            total: data.total || 0,
            newThisMonth: data.new_this_month || 0,
            withRccm: data.with_registre_commerce || 0,
            withoutRccm: (data.total || 0) - (data.with_registre_commerce || 0),
        }
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const loadSecteurs = async () => {
    try {
        const { data } = await api.get('/secteurs')
        secteurs.value = data.data || data || []
    } catch (error) {
        console.error('Error loading secteurs:', error)
    }
}

const loadLocations = async () => {
    try {
        const { data } = await adminApi.getStartupsMap()
        locations.value = (data.by_location || []).map((item) => item.emplacement)
    } catch (error) {
        console.error('Error loading locations:', error)
        // Fallback locations
        locations.value = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou']
    }
}

const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadStartups()
    }, 300)
}

const goToPage = (page) => {
    loadStartups(page)
}

const downloadRccm = async (startup) => {
    try {
        const response = await adminApi.downloadRegistreCommerce(startup.id)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `rccm_${startup.nom.replace(/\s+/g, '_')}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error downloading RCCM:', error)
        alert('Erreur lors du téléchargement du RCCM')
    }
}

const openDeleteModal = (startup) => {
    selectedStartup.value = startup
    showDeleteModal.value = true
}

const handleDelete = async () => {
    actionLoading.value = true
    try {
        await adminApi.deleteStartup(selectedStartup.value.id)
        showDeleteModal.value = false
        await Promise.all([loadStartups(pagination.value.current_page), loadStats()])
    } catch (error) {
        console.error('Error deleting startup:', error)
        alert('Erreur lors de la suppression')
    } finally {
        actionLoading.value = false
    }
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

onMounted(() => {
    Promise.all([loadStartups(), loadStats(), loadSecteurs(), loadLocations()])
})
</script>
