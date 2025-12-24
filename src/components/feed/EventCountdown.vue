<template>
  <Card variant="elevated" class="overflow-hidden">
    <div class="bg-gradient-to-br from-theme-400 to-theme-700 p-5 -m-6 mb-0">
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
        >
          <Icon name="Calendar" :size="20" class="text-white" />
        </div>
        <div>
          <h3 class="font-bold text-white text-lg">Prochain événement</h3>
          <p class="text-white/80 text-sm">Startup Connect</p>
        </div>
      </div>
    </div>

    <div class="pt-6">
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="grid grid-cols-4 gap-2 mb-4">
          <div v-for="i in 4" :key="i" class="bg-neutral-100 rounded-xl p-3 animate-pulse">
            <div class="h-8 bg-neutral-200 rounded mb-2"></div>
            <div class="h-3 bg-neutral-200 rounded w-12 mx-auto"></div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-neutral-100 rounded w-48 mx-auto"></div>
          <div class="h-3 bg-neutral-100 rounded w-32 mx-auto"></div>
        </div>
      </div>

      <!-- Décompte ou Non défini -->
      <div v-else-if="nextEventDate" class="text-center">
        <div class="grid grid-cols-4 gap-2 mb-4">
          <!-- Jours -->
          <div class="bg-neutral-100 rounded-xl p-3">
            <p class="text-2xl font-black text-neutral-900">{{ countdown.days }}</p>
            <p class="text-xs text-neutral-500 font-medium">jours</p>
          </div>
          <!-- Heures -->
          <div class="bg-neutral-100 rounded-xl p-3">
            <p class="text-2xl font-black text-neutral-900">{{ countdown.hours }}</p>
            <p class="text-xs text-neutral-500 font-medium">heures</p>
          </div>
          <!-- Minutes -->
          <div class="bg-neutral-100 rounded-xl p-3">
            <p class="text-2xl font-black text-neutral-900">{{ countdown.minutes }}</p>
            <p class="text-xs text-neutral-500 font-medium">min</p>
          </div>
          <!-- Secondes -->
          <div class="bg-neutral-100 rounded-xl p-3">
            <p class="text-2xl font-black text-theme-600">{{ countdown.seconds }}</p>
            <p class="text-xs text-neutral-500 font-medium">sec</p>
          </div>
        </div>

        <!-- Nom et date de l'événement -->
        <div class="text-center">
          <p class="font-semibold text-neutral-900">{{ eventName }}</p>
          <p class="text-sm text-neutral-500">{{ formattedDate }}</p>
        </div>
      </div>

      <!-- État non défini -->
      <div v-else class="text-center py-4">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center"
        >
          <Icon name="Calendar" :size="28" class="text-neutral-400" />
        </div>
        <p class="text-neutral-400 font-medium">Non défini</p>
        <p class="text-xs text-neutral-400 mt-1">Aucun événement planifié</p>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Card, Icon } from '../ui'

const props = defineProps({
  eventDate: {
    type: [Date, Number, String],
    default: null,
  },
  eventName: {
    type: String,
    default: 'Startup Connect Event',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const now = ref(Date.now())
let intervalId = null

const nextEventDate = computed(() => {
  if (!props.eventDate) return null
  const date = new Date(props.eventDate)
  return isNaN(date.getTime()) ? null : date.getTime()
})

const countdown = computed(() => {
  if (!nextEventDate.value) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const diff = Math.max(0, nextEventDate.value - now.value)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
})

const formattedDate = computed(() => {
  if (!nextEventDate.value) return ''
  const date = new Date(nextEventDate.value)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

onMounted(() => {
  // Mettre à jour le compteur chaque seconde
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
