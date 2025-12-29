<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader title="Tableau de Bord ADPME" subtitle="Vue d'ensemble des statistiques et métriques de la plateforme"
      :breadcrumbs="[{ label: 'Administration', to: '/admin-home' }, { label: 'Dashboard' }]" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton class="h-80 rounded-xl" />
          <Skeleton class="h-80 rounded-xl" />
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- KPI Cards -->
        <section>
          <h2 class="text-lg font-semibold text-neutral-900 mb-4">Indicateurs Clés</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm">Utilisateurs</p>
                  <p class="text-3xl font-bold">{{ kpis.users?.total || 0 }}</p>
                  <p class="text-blue-200 text-xs mt-1">
                    +{{ kpis.users?.new_this_month || 0 }} ce mois
                  </p>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="Users" :size="24" />
                </div>
              </div>
            </Card>

            <Card class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-emerald-100 text-sm">Startups</p>
                  <p class="text-3xl font-bold">{{ kpis.startups?.total || 0 }}</p>
                  <p class="text-emerald-200 text-xs mt-1">
                    +{{ kpis.startups?.new_this_month || 0 }} ce mois
                  </p>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="Building2" :size="24" />
                </div>
              </div>
            </Card>

            <Card class="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-amber-100 text-sm">Organisations</p>
                  <p class="text-3xl font-bold">{{ partnersCount }}</p>
                  <p class="text-amber-200 text-xs mt-1">
                    {{ kpis.partners?.active_offers || 0 }} offres actives
                  </p>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="Building" :size="24" />
                </div>
              </div>
            </Card>

            <Card class="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-red-100 text-sm">Signalements</p>
                  <p class="text-3xl font-bold">{{ kpis.moderation?.pending_reports || 0 }}</p>
                  <p class="text-red-200 text-xs mt-1">en attente</p>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" :size="24" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        <!-- Charts Row 1: Répartition des utilisateurs et Startups par région -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Répartition des utilisateurs par rôle -->
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Répartition des Utilisateurs</h3>
                <Badge variant="info">{{ kpis.users?.total || 0 }} total</Badge>
              </div>
            </template>
            <Chart type="doughnut" :data="usersByRoleChartData" :options="doughnutOptions" height="280px" />
          </Card>

          <!-- Startups par localisation (ville/région) -->
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Startups par Localisation</h3>
                <Badge variant="success">{{ kpis.startups?.total || 0 }} total</Badge>
              </div>
            </template>
            <Chart type="bar" :data="startupsByLocationChartData" :options="horizontalBarOptions" height="280px" />
          </Card>
        </section>

        <!-- Charts Row 2: Secteurs et Taille des startups -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Startups par secteur d'activité -->
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Startups par Secteur</h3>
                <select v-model="sectorChartType" class="text-sm border border-neutral-200 rounded-lg px-2 py-1">
                  <option value="pie">Camembert</option>
                  <option value="bar">Barres</option>
                  <option value="polarArea">Polaire</option>
                </select>
              </div>
            </template>
            <Chart :type="sectorChartType" :data="startupsBySectorChartData"
              :options="sectorChartType === 'bar' ? barOptions : pieOptions" height="300px" />
          </Card>

          <!-- Taille des startups -->
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Taille des Startups</h3>
                <Badge variant="neutral">par effectif</Badge>
              </div>
            </template>
            <Chart type="pie" :data="startupsBySizeChartData" :options="pieOptions" height="300px" />
          </Card>
        </section>

        <!-- Charts Row 3: Activité -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Activité partenaires -->
          <Card>
            <template #header>
              <h3 class="text-lg font-semibold text-neutral-900">Activité des Partenaires</h3>
            </template>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="Briefcase" :size="20" class="text-blue-600" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">Offres Actives</p>
                    <p class="text-sm text-neutral-500">Opportunités disponibles</p>
                  </div>
                </div>
                <p class="text-2xl font-bold text-blue-600">
                  {{ kpis.partners?.active_offers || 0 }}
                </p>
              </div>

              <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" :size="20" class="text-purple-600" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">Événements à Venir</p>
                    <p class="text-sm text-neutral-500">Rencontres planifiées</p>
                  </div>
                </div>
                <p class="text-2xl font-bold text-purple-600">
                  {{ kpis.partners?.upcoming_events || 0 }}
                </p>
              </div>

              <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Icon name="Building2" :size="20" class="text-emerald-600" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">Organisations</p>
                    <p class="text-sm text-neutral-500">Partenaires enregistrés</p>
                  </div>
                </div>
                <p class="text-2xl font-bold text-emerald-600">
                  {{ kpis.partners?.total_organizations || 0 }}
                </p>
              </div>

              <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" :size="20" class="text-amber-600" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">Publications</p>
                    <p class="text-sm text-neutral-500">Ce mois-ci</p>
                  </div>
                </div>
                <p class="text-2xl font-bold text-amber-600">
                  {{ kpis.content?.posts_this_month || 0 }}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <!-- Métriques de Modération -->
        <section>
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">Statistiques de Modération</h3>
                <router-link to="/admin/moderation">
                  <Button variant="outline" size="sm">
                    <Icon name="ExternalLink" :size="14" class="mr-1" />
                    Voir les signalements
                  </Button>
                </router-link>
              </div>
            </template>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div class="text-center p-4 bg-yellow-50 rounded-xl">
                <p class="text-3xl font-bold text-yellow-600">
                  {{ kpis.moderation?.pending_reports || 0 }}
                </p>
                <p class="text-sm text-neutral-600 mt-1">En attente</p>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-xl">
                <p class="text-3xl font-bold text-blue-600">
                  {{ moderationStats.reviewed || 0 }}
                </p>
                <p class="text-sm text-neutral-600 mt-1">En cours</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-xl">
                <p class="text-3xl font-bold text-green-600">
                  {{ moderationStats.resolved || 0 }}
                </p>
                <p class="text-sm text-neutral-600 mt-1">Résolus</p>
              </div>
              <div class="text-center p-4 bg-neutral-100 rounded-xl">
                <p class="text-3xl font-bold text-neutral-600">
                  {{ moderationStats.dismissed || 0 }}
                </p>
                <p class="text-sm text-neutral-600 mt-1">Rejetés</p>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-xl">
                <p class="text-3xl font-bold text-red-600">{{ kpis.users?.suspended || 0 }}</p>
                <p class="text-sm text-neutral-600 mt-1">Suspendus</p>
              </div>
            </div>
          </Card>
        </section>

        <!-- Startups avec Registre Commerce -->
        <section>
          <Card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-neutral-900">
                  Formalisation des Startups (RCCM)
                </h3>
                <router-link to="/admin/rccm-validation">
                  <Button variant="outline" size="sm">
                    <Icon name="FileCheck" :size="14" class="mr-1" />
                    Valider RCCM
                  </Button>
                </router-link>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="relative inline-flex items-center justify-center">
                  <svg class="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      class="text-neutral-200" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      class="text-emerald-500" :stroke-dasharray="2 * Math.PI * 56"
                      :stroke-dashoffset="2 * Math.PI * 56 * (1 - rccmPercentage / 100)" stroke-linecap="round" />
                  </svg>
                  <span class="absolute text-2xl font-bold text-neutral-900">{{ rccmPercentage
                  }}%</span>
                </div>
                <p class="text-sm text-neutral-600 mt-2">Startups avec RCCM</p>
              </div>
              <div class="flex flex-col justify-center space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-neutral-600">Avec RCCM</span>
                  <span class="font-semibold text-emerald-600">{{
                    kpis.startups?.with_registre_commerce || 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-neutral-600">Sans RCCM</span>
                  <span class="font-semibold text-neutral-900">{{
                    (kpis.startups?.total || 0) - (kpis.startups?.with_registre_commerce || 0)
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-neutral-600">Total</span>
                  <span class="font-semibold text-neutral-900">{{
                    kpis.startups?.total || 0
                  }}</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <!-- Activité Récente -->
        <section>
          <Card>
            <template #header>
              <h3 class="text-lg font-semibold text-neutral-900">Activité Récente</h3>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Nouveaux utilisateurs -->
              <div>
                <h4 class="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                  <Icon name="UserPlus" :size="16" />
                  Derniers inscrits
                </h4>
                <div class="space-y-2">
                  <div v-for="user in recentActivity.new_users?.slice(0, 5)" :key="user.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
                    <div
                      class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {{ user.name?.charAt(0) || '?' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-neutral-900 truncate">{{ user.name }}</p>
                      <p class="text-xs text-neutral-500">{{ formatRole(user.role) }}</p>
                    </div>
                  </div>
                  <p v-if="!recentActivity.new_users?.length" class="text-sm text-neutral-500">
                    Aucun nouvel utilisateur
                  </p>
                </div>
              </div>

              <!-- Nouvelles startups -->
              <div>
                <h4 class="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                  <Icon name="Building2" :size="16" />
                  Dernières startups
                </h4>
                <div class="space-y-2">
                  <div v-for="startup in recentActivity.new_startups?.slice(0, 5)" :key="startup.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
                    <div
                      class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-sm">
                      {{ startup.nom?.charAt(0) || '?' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-neutral-900 truncate">{{ startup.nom }}
                      </p>
                      <p class="text-xs text-neutral-500">{{ startup.emplacement || 'N/A' }}</p>
                    </div>
                  </div>
                  <p v-if="!recentActivity.new_startups?.length" class="text-sm text-neutral-500">
                    Aucune nouvelle startup
                  </p>
                </div>
              </div>

              <!-- Signalements récents -->
              <div>
                <h4 class="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                  <Icon name="AlertTriangle" :size="16" />
                  Derniers signalements
                </h4>
                <div class="space-y-2">
                  <div v-for="report in recentActivity.recent_reports?.slice(0, 5)" :key="report.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
                    <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                      <Icon name="Flag" :size="16" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-neutral-900 truncate">{{ report.reason }}
                      </p>
                      <p class="text-xs text-neutral-500">
                        par {{ report.reporter?.name || 'Anonyme' }}
                      </p>
                    </div>
                  </div>
                  <p v-if="!recentActivity.recent_reports?.length" class="text-sm text-neutral-500">
                    Aucun signalement récent
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Card, Badge, Button, Icon, PageHeader, Skeleton, Chart } from '@/components/ui'
import adminApi from '@/services/admin'

const loading = ref(true)
const kpis = ref({})
const moderationStats = ref({})
const recentActivity = ref({})
const sectorChartType = ref('pie')
const secteurs = ref({})

const usersByRoleChartData = computed(() => {
  const byRole = kpis.value.users?.by_role || {}
  return {
    labels: Object.keys(byRole).map(formatRole),
    datasets: [
      {
        data: Object.values(byRole),
        backgroundColor: ['rgba(37, 99, 235, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(220, 38, 38, 0.8)'],
        borderWidth: 2,
      },
    ],
  }
})

const startupsByLocationChartData = computed(() => {
  const byLocation = kpis.value.startups?.by_location || {}
  const labels = Object.keys(byLocation)
  const data = Object.values(byLocation)

  return {
    labels,
    datasets: [
      {
        label: 'Startups',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  }
})

const startupsBySectorChartData = computed(() => {
  const bySector = kpis.value.startups?.by_sector || {}
  // Map sector IDs to names if available
  const labels = Object.keys(bySector).map((id) => secteurs.value[id] || `Secteur ${id}`)
  const data = Object.values(bySector)

  return {
    labels,
    datasets: [
      {
        label: 'Startups',
        data,
      },
    ],
  }
})

const startupsBySizeChartData = computed(() => {
  const bySize = kpis.value.startups?.by_size || {}
  const sizeLabels = {
    '1-10': '1-10 employés',
    '11-50': '11-50 employés',
    '51-200': '51-200 employés',
    '201-500': '201-500 employés',
    '500+': '500+ employés',
  }
  return {
    labels: Object.keys(bySize).map((k) => sizeLabels[k] || k),
    datasets: [
      {
        data: Object.values(bySize),
      },
    ],
  }
})

const rccmPercentage = computed(() => {
  const total = kpis.value.startups?.total || 0
  const withRccm = kpis.value.startups?.with_registre_commerce || 0
  if (total === 0) return 0
  return Math.round((withRccm / total) * 100)
})

// Computed to get partners count from users with role partenaire
const partnersCount = computed(() => {
  // Utiliser le nombre d'organisations (partenaires) pour être cohérent avec la page Partenaires
  // total_organizations compte les vraies entités partenaires (organisations)
  // users.partners compte les utilisateurs avec le rôle partenaire (différent)
  return kpis.value.partners?.total_organizations || 0
})

// Chart Options
const doughnutOptions = {
  cutout: '60%',
  plugins: {
    legend: {
      position: 'right',
    },
  },
}

const pieOptions = {
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

const barOptions = {
  indexAxis: 'x',
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const horizontalBarOptions = {
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
  },
}

const formatRole = (role) => {
  const roles = {
    startuper: 'Startupeurs',
    partenaire: 'Partenaires',
    admin: 'Administrateurs',
  }
  return roles[role] || role
}

const loadDashboard = async () => {
  loading.value = true
  try {
    // Load sectors for mapping first
    await loadSecteurs()

    // Load main dashboard data
    const { data } = await adminApi.getDashboard()
    kpis.value = data

    // Extract recent activity
    recentActivity.value = data.activity || {}

    // Extract moderation stats
    const modStats = data.moderation?.by_status || {}
    moderationStats.value = {
      pending: modStats.pending || 0,
      reviewed: modStats.reviewed || 0,
      resolved: modStats.resolved || 0,
      dismissed: modStats.dismissed || 0,
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
    // Initialize with empty data structure instead of mock data
    kpis.value = {
      users: { total: 0, by_role: {}, new_this_month: 0 },
      startups: { total: 0, by_sector: {}, by_location: {}, by_size: {}, new_this_month: 0 },
      partners: { total_organizations: 0, active_offers: 0, upcoming_events: 0 },
      content: { posts_this_month: 0 },
      moderation: { pending_reports: 0, by_status: {} },
    }
    recentActivity.value = { new_users: [], new_startups: [], recent_reports: [] }
    moderationStats.value = { pending: 0, reviewed: 0, resolved: 0, dismissed: 0 }
  } finally {
    loading.value = false
  }
}

const loadSecteurs = async () => {
  try {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'
    const response = await fetch(`${baseUrl}/secteurs`)
    const data = await response.json()
    const secteurList = data.secteurs || data.data || data || []
    secteurs.value = secteurList.reduce((acc, s) => {
      acc[s.id] = s.nom
      return acc
    }, {})
  } catch (e) {
    console.warn('Could not load secteurs:', e)
  }
}

onMounted(loadDashboard)
</script>
