<template>
  <span :class="badgeClasses">
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'gray',
    validator: (value) =>
      ['theme', 'gray', 'yellow', 'green', 'red', 'blue', 'purple', 'orange', 'pink'].includes(
        value,
      ),
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md'].includes(value),
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline'].includes(value),
  },
})

const colors = {
  theme: 'bg-theme-100 text-theme-800 border-theme-200',
  gray: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
}

const outlineColors = {
  theme: 'bg-transparent text-theme-700 border-theme-300',
  gray: 'bg-transparent text-neutral-700 border-neutral-300',
  yellow: 'bg-transparent text-yellow-700 border-yellow-300',
  green: 'bg-transparent text-green-700 border-green-300',
  red: 'bg-transparent text-red-700 border-red-300',
  blue: 'bg-transparent text-blue-700 border-blue-300',
  purple: 'bg-transparent text-purple-700 border-purple-300',
  orange: 'bg-transparent text-orange-700 border-orange-300',
  pink: 'bg-transparent text-pink-700 border-pink-300',
}

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

const badgeClasses = computed(() => {
  const colorClass = props.variant === 'outline' ? outlineColors[props.color] : colors[props.color]
  const border = props.variant === 'outline' ? 'border-2' : 'border'
  return `inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-200 ${colorClass} ${sizes[props.size]} ${border}`
})
</script>
