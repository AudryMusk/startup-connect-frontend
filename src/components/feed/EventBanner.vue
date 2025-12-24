<template>
  <!-- Bannière horizontale professionnelle pour le prochain événement -->
  <div v-if="nextEventDate && !isLoading" class="relative overflow-hidden rounded-2xl mb-6">
    <!-- Fond animé avec gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-theme-400 to-theme-600 opacity-90"></div>

    <!-- Motifs décoratifs animés -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-blob"></div>
      <div
        class="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl">
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 px-3 py-4 sm:px-6 sm:py-6 md:px-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">

        <!-- Partie gauche: Info événement -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Icône pulsante -->
          <div class="relative flex-shrink-0">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <Icon name="CalendarClock" :size="20" class="sm:hidden text-white" />
              <Icon name="CalendarClock" :size="24" class="hidden sm:block md:hidden text-white" />
              <Icon name="CalendarClock" :size="28" class="hidden md:block text-white" />
            </div>
            <!-- Pulse animation -->
            <!-- <span class="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-yellow-400"></span>
            </span> -->
          </div>

          <!-- Texte -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-0.5 sm:mb-1">
              <span
                class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-black/50 backdrop-blur-xl text-white">
                <Icon name="Sparkles" :size="10" class="mr-0.5 sm:mr-1 sm:hidden" />
                <Icon name="Sparkles" :size="12" class="mr-1 hidden sm:inline" />
                <span class="hidden xs:inline">PROCHAIN ÉVÉNEMENT</span>
                <span class="xs:hidden">PROCHAIN</span>
              </span>
            </div>
            <h3
              class="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white leading-tight truncate sm:whitespace-normal">
              {{ eventName }}
            </h3>
            <p class="text-white/80 text-xs sm:text-sm md:text-base font-medium mt-0.5 truncate sm:whitespace-normal">
              <Icon name="MapPin" :size="12" class="inline mr-0.5 sm:mr-1 sm:hidden" />
              <Icon name="MapPin" :size="14" class="inline mr-1 hidden sm:inline" />
              {{ formattedDate }}
            </p>
          </div>
        </div>

        <!-- Partie droite: Countdown -->
        <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 justify-center lg:justify-end flex-wrap">
          <!-- Jours -->
          <div
            class="text-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 min-w-[50px] sm:min-w-[60px] md:min-w-[70px]">
            <p class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{{ countdown.days }}</p>
            <p class="text-[9px] sm:text-xs text-white/70 font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">Jours
            </p>
          </div>

          <span class="text-lg sm:text-xl md:text-2xl font-bold text-white/60">:</span>

          <!-- Heures -->
          <div
            class="text-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 min-w-[50px] sm:min-w-[60px] md:min-w-[70px]">
            <p class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{{ countdown.hours }}</p>
            <p class="text-[9px] sm:text-xs text-white/70 font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">Heures
            </p>
          </div>

          <span class="text-lg sm:text-xl md:text-2xl font-bold text-white/60">:</span>

          <!-- Minutes -->
          <div
            class="text-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 min-w-[50px] sm:min-w-[60px] md:min-w-[70px]">
            <p class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{{ countdown.minutes }}</p>
            <p class="text-[9px] sm:text-xs text-white/70 font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">Min</p>
          </div>

          <span class="text-lg sm:text-xl md:text-2xl font-bold text-white/60 hidden sm:inline">:</span>

          <!-- Secondes (masqué sur petit mobile) -->
          <div
            class="hidden sm:block text-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-yellow-400/90 rounded-lg sm:rounded-xl border border-yellow-300 min-w-[50px] sm:min-w-[60px] md:min-w-[70px]">
            <p class="text-xl sm:text-2xl md:text-3xl font-black text-yellow-900 leading-none animate-pulse">{{
              countdown.seconds }}</p>
            <p class="text-[9px] sm:text-xs text-yellow-800 font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">Sec
            </p>
          </div>

          <!-- Bouton CTA -->
          <router-link :to="eventLink"
            class="hidden md:flex items-center gap-2 ml-4 px-5 py-3 bg-white text-black font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <span>Voir détails</span>
            <Icon name="ArrowRight" :size="18" />
          </router-link>
        </div>
      </div>

      <!-- Bouton CTA Mobile -->
      <router-link :to="eventLink"
        class="md:hidden flex items-center justify-center gap-2 mt-3 sm:mt-4 w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-white text-brand-purple font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
        <span class="hidden xs:inline">Découvrir l'événement</span>
        <span class="xs:hidden">Voir détails</span>
        <Icon name="ArrowRight" :size="16" class="sm:hidden" />
        <Icon name="ArrowRight" :size="18" class="hidden sm:inline" />
      </router-link>
    </div>
  </div>

  <!-- État de chargement -->
  <div v-else-if="isLoading"
    class="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse">
    <div class="px-6 py-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-neutral-300 rounded-2xl"></div>
          <div>
            <div class="h-4 w-32 bg-neutral-300 rounded mb-2"></div>
            <div class="h-6 w-48 bg-neutral-300 rounded mb-2"></div>
            <div class="h-4 w-40 bg-neutral-300 rounded"></div>
          </div>
        </div>
        <div class="flex gap-3">
          <div v-for="i in 4" :key="i" class="w-16 h-20 bg-neutral-300 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Pas d'événement - Message discret -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '../ui'

const props = defineProps({
  eventId: {
    type: [Number, String],
    default: null,
  },
  eventDate: {
    type: [Date, Number, String],
    default: null,
  },
  eventName: {
    type: String,
    default: 'Startup Connect Event',
  },
  eventLocation: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// Lien vers l'événement spécifique
const eventLink = computed(() => {
  return props.eventId ? `/events/${props.eventId}` : '/events'
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
    return { days: '00', hours: '00', minutes: '00', seconds: '00' }
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

<style scoped>
@keyframes blob {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(20px, -30px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 8s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
