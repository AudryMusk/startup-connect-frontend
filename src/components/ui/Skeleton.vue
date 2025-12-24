<template>
  <div
    :class="[
      'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
      roundedClass,
      className
    ]"
    :style="{ width, height }"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
});

const roundedClass = computed(() => {
  const map = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  };
  return map[props.rounded] || map.md;
});
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-pulse {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
