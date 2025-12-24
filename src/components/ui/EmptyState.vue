<template>
  <div class="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
    <div v-if="$slots.icon" class="mb-3 md:mb-4 text-gray-300">
      <slot name="icon"></slot>
    </div>
    <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">{{ title }}</h3>
    <p v-if="description" class="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 max-w-sm">
      {{ description }}
    </p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
