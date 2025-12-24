<template>
  <div :class="cardClasses" @click="onClick ? $emit('click', $event) : null">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  noPadding: {
    type: Boolean,
    default: false,
  },
  onClick: {
    type: Function,
    default: null,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated', 'flat'].includes(value),
  },
  hover: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const cardClasses = computed(() => {
  const base = 'bg-white rounded-xl transition-all duration-300'
  const padding = props.noPadding ? '' : 'p-4 md:p-6'
  const cursor = props.onClick ? 'cursor-pointer' : ''

  const variants = {
    default: 'border border-gray-100 shadow-soft',
    bordered: 'border-2 border-gray-200',
    elevated: 'shadow-soft-lg border-0',
    flat: 'border-0 shadow-none',
  }

  const hoverEffect =
    props.hover || props.onClick
      ? 'hover:shadow-soft-lg hover:scale-[1.01] hover:border-theme-200'
      : ''

  return `${base} ${padding} ${cursor} ${variants[props.variant]} ${hoverEffect}`
})
</script>
