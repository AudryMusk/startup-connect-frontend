<template>
  <div class="min-h-screen bg-neutral-50">
    <PageHeader
      title="Statistiques"
      subtitle="Analysez les performances de votre entreprise"
      :breadcrumbs="[{ label: 'Accueil', to: '/partner/home' }, { label: 'Statistiques' }]"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Period Selector -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-2">
          <Button
            v-for="period in periods"
            :key="period.value"
            :variant="selectedPeriod === period.value ? 'primary' : 'outline'"
            size="sm"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Download" :size="16" class="mr-2" />
          Exporter
        </Button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-brand-primary-100 flex items-center justify-center">
              <Icon name="Briefcase" :size="28" class="text-brand-primary-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-500">Offres actives</p>
              <p class="text-2xl font-bold text-neutral-900">{{ stats.activeOffers }}</p>
              <p class="text-xs text-theme-success flex items-center gap-1">
                <Icon name="TrendingUp" :size="12" />
                +{{ stats.offersGrowth }}% ce mois
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-theme-info-light flex items-center justify-center">
              <Icon name="Users" :size="28" class="text-theme-info" />
            </div>
            <div>
              <p class="text-sm text-neutral-500">Candidatures</p>
              <p class="text-2xl font-bold text-neutral-900">{{ stats.totalApplications }}</p>
              <p class="text-xs text-theme-success flex items-center gap-1">
                <Icon name="TrendingUp" :size="12" />
                +{{ stats.applicationsGrowth }}% ce mois
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-theme-warning-light flex items-center justify-center"
            >
              <Icon name="Eye" :size="28" class="text-theme-warning" />
            </div>
            <div>
              <p class="text-sm text-neutral-500">Vues totales</p>
              <p class="text-2xl font-bold text-neutral-900">
                {{ formatNumber(stats.totalViews) }}
              </p>
              <p class="text-xs text-theme-success flex items-center gap-1">
                <Icon name="TrendingUp" :size="12" />
                +{{ stats.viewsGrowth }}% ce mois
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-theme-success-light flex items-center justify-center"
            >
              <Icon name="CheckCircle" :size="28" class="text-theme-success" />
            </div>
            <div>
              <p class="text-sm text-neutral-500">Taux de réponse</p>
              <p class="text-2xl font-bold text-neutral-900">{{ stats.responseRate }}%</p>
              <p class="text-xs text-neutral-500">Moyenne du secteur: 72%</p>
            </div>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Applications by Status -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-neutral-900">Répartition des candidatures</h3>
          </template>

          <div class="space-y-4">
            <div v-for="status in applicationStats" :key="status.label">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-neutral-700">{{ status.label }}</span>
                <span class="text-sm text-neutral-500"
                  >{{ status.count }} ({{ status.percentage }}%)</span
                >
              </div>
              <div class="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="status.color"
                  :style="{ width: `${status.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Top Performing Offers -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-neutral-900">Meilleures opportunités</h3>
          </template>

          <div class="space-y-4">
            <div
              v-for="(offer, index) in topOffers"
              :key="offer.id"
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="
                  index === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : index === 1
                      ? 'bg-neutral-200 text-neutral-700'
                      : 'bg-orange-100 text-orange-700'
                "
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-neutral-900 truncate">{{ offer.title }}</h4>
                <p class="text-sm text-neutral-500">{{ offer.applications }} candidatures</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-neutral-900">{{ offer.views }}</p>
                <p class="text-xs text-neutral-500">vues</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Conversion Funnel -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-neutral-900">Entonnoir de conversion</h3>
          </template>

          <div class="space-y-3">
            <div v-for="(step, index) in conversionFunnel" :key="step.label" class="relative">
              <div class="p-4 rounded-lg text-center" :class="step.bgColor">
                <p class="text-2xl font-bold" :class="step.textColor">{{ step.count }}</p>
                <p class="text-sm" :class="step.textColor">{{ step.label }}</p>
              </div>
              <div v-if="index < conversionFunnel.length - 1" class="flex justify-center py-1">
                <Icon name="ChevronDown" :size="20" class="text-neutral-400" />
              </div>
            </div>
          </div>
        </Card>

        <!-- Recent Activity -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-neutral-900">Activité récente</h3>
          </template>

          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start gap-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="activity.iconBg"
              >
                <Icon :name="activity.icon" :size="16" :class="activity.iconColor" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-neutral-900">{{ activity.message }}</p>
                <p class="text-xs text-neutral-500 mt-1">{{ formatDate(activity.date) }}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PageHeader, Card, Button, Icon } from '@/components/ui'

const selectedPeriod = ref('month')
const periods = [
  { value: 'week', label: '7 jours' },
  { value: 'month', label: '30 jours' },
  { value: 'quarter', label: '3 mois' },
  { value: 'year', label: '1 an' },
]

const stats = ref({
  activeOffers: 5,
  offersGrowth: 25,
  totalApplications: 42,
  applicationsGrowth: 18,
  totalViews: 3250,
  viewsGrowth: 32,
  responseRate: 85,
})

const applicationStats = computed(() => [
  { label: 'En attente', count: 15, percentage: 36, color: 'bg-theme-warning' },
  { label: 'Acceptées', count: 18, percentage: 43, color: 'bg-theme-success' },
  { label: 'Refusées', count: 9, percentage: 21, color: 'bg-theme-error' },
])

const topOffers = ref([
  { id: 1, title: 'Stage Développeur Full Stack', applications: 18, views: 450 },
  { id: 2, title: 'Alternance Marketing Digital', applications: 12, views: 320 },
  { id: 3, title: 'Stage Data Analyst', applications: 8, views: 280 },
])

const conversionFunnel = computed(() => [
  {
    label: 'Vues des offres',
    count: stats.value.totalViews,
    bgColor: 'bg-brand-primary-100',
    textColor: 'text-brand-primary-700',
  },
  {
    label: 'Candidatures',
    count: stats.value.totalApplications,
    bgColor: 'bg-brand-primary-200',
    textColor: 'text-brand-primary-800',
  },
  {
    label: 'Acceptées',
    count: 18,
    bgColor: 'bg-theme-success-light',
    textColor: 'text-theme-success',
  },
])

const recentActivities = ref([
  {
    id: 1,
    icon: 'UserPlus',
    iconBg: 'bg-theme-info-light',
    iconColor: 'text-theme-info',
    message: 'Nouvelle candidature pour "Stage Développeur"',
    date: new Date(),
  },
  {
    id: 2,
    icon: 'Eye',
    iconBg: 'bg-theme-warning-light',
    iconColor: 'text-theme-warning',
    message: "Votre offre a été vue 50 fois aujourd'hui",
    date: new Date(Date.now() - 3600000),
  },
  {
    id: 3,
    icon: 'CheckCircle',
    iconBg: 'bg-theme-success-light',
    iconColor: 'text-theme-success',
    message: 'Candidature de InnoTech acceptée',
    date: new Date(Date.now() - 7200000),
  },
  {
    id: 4,
    icon: 'MessageSquare',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    message: 'Nouveau message de GreenStart',
    date: new Date(Date.now() - 86400000),
  },
])

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`
}
</script>
