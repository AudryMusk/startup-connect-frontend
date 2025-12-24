<template>
  <div :class="spinnerClasses" />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'theme'
  }
});

const sizes = {
  sm: 'w-5 h-5 border-[3px]',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4'
};

const colorClasses = {
  theme: 'border-theme border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent'
};

const spinnerClasses = computed(() => {
  const sizeClass = sizes[props.size] || sizes.md;
  const colorClass = colorClasses[props.color] || colorClasses.theme;
  return `${sizeClass} ${colorClass} rounded-full animate-spin`;
});
</script>

<style scoped>
/* Ensure smooth, visible animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.7s linear infinite;
  /* Force hardware acceleration for smoother animation */
  will-change: transform;
  transform: translateZ(0);
}
</style>
