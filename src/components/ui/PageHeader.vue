<template>
  <div class="mb-6 md:mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
      <div class="min-w-0">
        <div v-if="breadcrumbs"
          class="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-neutral-500 font-medium mb-2 md:mb-3 overflow-x-auto">
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <router-link v-if="crumb.to || crumb.path" :to="crumb.to || crumb.path"
              class="hover:text-theme-600 transition-colors whitespace-nowrap">
              {{ crumb.label }}
            </router-link>
            <span v-else class="text-neutral-700 whitespace-nowrap">{{ crumb.label }}</span>
            <Icon v-if="index < breadcrumbs.length - 1" name="ChevronRight" :size="12" class="mx-0.5 md:mx-1" />
          </template>
        </div>

        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 mb-1.5 md:mb-2 flex items-center gap-2 md:gap-3">
          <div v-if="icon"
            class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-theme-400 to-theme-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
            <Icon :name="icon" :size="20" class="text-white md:hidden" />
            <Icon :name="icon" :size="24" class="text-white hidden md:block" />
          </div>
          <span class="truncate">{{ title }}</span>
        </h1>

        <p v-if="description" class="text-sm md:text-lg text-neutral-600 font-medium">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  breadcrumbs: {
    type: Array,
    default: null,
  },
})
</script>
