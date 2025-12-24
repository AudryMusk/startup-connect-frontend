<template>
  <div class="w-full">
    <label v-if="label" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">{{
      label
    }}</label>
    <select
      :value="modelValue"
      :required="required"
      :class="selectClasses"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot></slot>
    </select>
    <p v-if="error" class="mt-1 text-[10px] md:text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const selectClasses = computed(() => {
  const base =
    'w-full px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent'
  const borderColor = props.error ? 'border-red-500' : 'border-gray-300'
  return `${base} ${borderColor}`
})
</script>
