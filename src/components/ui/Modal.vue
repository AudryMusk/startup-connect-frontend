<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50 animate-fade-in"
      @click.self="$emit('close')"
    >
      <div :class="modalClasses">
        <div class="flex items-center justify-between p-3 sm:p-4 border-b">
          <h3 class="text-base sm:text-lg font-bold truncate pr-2">{{ title }}</h3>
          <button
            @click="$emit('close')"
            class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 sm:p-4">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value),
  },
})

defineEmits(['close'])

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-6xl',
}

const modalClasses = computed(() => {
  return `bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full ${sizes[props.size]} max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col`
})
</script>
