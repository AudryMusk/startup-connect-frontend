<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Mobile: Bouton pour afficher/masquer la sidebar -->
      <div class="lg:hidden flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-neutral-900">Administration</h2>
        <button @click="showMobileSidebar = !showMobileSidebar"
          class="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          <Icon :name="showMobileSidebar ? 'X' : 'LayoutGrid'" :size="16" />
          {{ showMobileSidebar ? 'Masquer' : 'Menu' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar - Desktop sticky, Mobile drawer -->
        <aside :class="[
          'lg:col-span-1 space-y-4',
          showMobileSidebar ? 'block' : 'hidden lg:block',
        ]"
          class="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300">
          <Card>
            <template #header>
              <div class="flex items-center gap-2">
                <Icon name="ShieldAlert" :size="20" class="text-red-600" />
                <h3 class="text-lg font-semibold text-neutral-900">Administration</h3>
              </div>
            </template>

            <nav class="space-y-1">
              <router-link v-for="item in menuItems" :key="item.path" :to="item.path" :class="[
                'flex items-center gap-3 p-3 rounded-lg transition-colors group relative',
                isActive(item.path)
                  ? 'bg-red-100 text-red-700 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-100',
              ]">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  isActive(item.path)
                    ? `${item.bgColor} ${item.iconColor}`
                    : `${item.bgColor}20 ${item.iconColor}80`,
                ]">
                  <Icon :name="item.icon" :size="20" />
                </div>
                <div class="flex-1">
                  <p :class="isActive(item.path) ? 'font-semibold' : 'font-medium'">
                    {{ item.label }}
                  </p>
                  <p class="text-xs text-neutral-500">{{ item.description }}</p>
                </div>
                <Badge v-if="item.badge && stats[item.badge] > 0" color="red" size="sm"
                  class="absolute -top-1 -right-1">
                  {{ stats[item.badge] }}
                </Badge>
              </router-link>
            </nav>
          </Card>

          <!-- Stats Card -->
          <Card v-if="!loading">
            <template #header>
              <h4 class="text-sm font-semibold text-neutral-700">Aperçu rapide</h4>
            </template>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-neutral-600">Utilisateurs</span>
                <span class="font-semibold text-neutral-900">{{ stats.totalUsers || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-neutral-600">Startups</span>
                <span class="font-semibold text-neutral-900">{{ stats.totalStartups || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-neutral-600">Partenaires</span>
                <span class="font-semibold text-neutral-900">{{ stats.totalPartners || 0 }}</span>
              </div>
            </div>
          </Card>
        </aside>

        <!-- Main Content Area -->
        <div class="lg:col-span-3">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Card, Badge, Icon } from '@/components/ui'
import adminApi from '@/services/admin'

const route = useRoute()
const showMobileSidebar = ref(false)
const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  totalStartups: 0,
  totalPartners: 0,
  pendingReports: 0,
  pendingValidations: 0,
})

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Tableau de Bord',
    description: 'Statistiques & KPIs',
    icon: 'BarChart2',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    path: '/admin/moderation',
    label: 'Modération',
    description: 'Signalements',
    icon: 'AlertCircle',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    badge: 'pendingReports',
  },
  {
    path: '/admin/rccm-validation',
    label: 'Validation RCCM',
    description: 'Registres commerce',
    icon: 'FileCheck',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badge: 'pendingValidations',
  },
  {
    path: '/admin/users',
    label: 'Utilisateurs',
    description: 'Gestion des comptes',
    icon: 'Users',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    path: '/admin/startups',
    label: 'Startups',
    description: 'Gestion des startups',
    icon: 'Building2',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    path: '/admin/logs',
    label: 'Logs d\'activité',
    description: 'Historique système',
    icon: 'ClipboardList',
    bgColor: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
  },
]

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const loadStats = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.getDashboard()
    stats.value = {
      totalUsers: data.users?.total || 0,
      totalStartups: data.startups?.total || 0,
      totalPartners: data.users?.partners || data.users?.by_role?.partenaire || 0,
      pendingReports: data.moderation?.pending_reports || 0,
      pendingValidations: 0, // TODO: get from API when available
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>
