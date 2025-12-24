<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses" @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'outline', 'danger', 'ghost', 'gradient', 'success'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const base =
  'font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

const variants = {
  primary: 'bg-theme hover:bg-theme-hover text-white shadow-soft hover:shadow-soft-lg',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-soft',
  outline:
    'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 bg-white hover:border-theme-500',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-soft hover:shadow-soft-lg',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
  gradient:
    'bg-gradient-to-br from-theme-400 to-theme-700 text-white shadow-soft-lg hover:shadow-xl',
  success: 'bg-brand-green hover:bg-green-600 text-white shadow-soft hover:shadow-soft-lg',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const buttonClasses = computed(() => {
  const roundedClass = props.rounded ? 'rounded-full' : 'rounded-xl'
  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${roundedClass}`
})
</script>
