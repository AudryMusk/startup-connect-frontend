<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      :class="textareaClasses"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
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
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
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
  rows: {
    type: [String, Number],
    default: 3,
  },
})

defineEmits(['update:modelValue'])

const textareaClasses = computed(() => {
  const base =
    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent'
  const borderColor = props.error ? 'border-red-500' : 'border-gray-300'
  return `${base} ${borderColor}`
})
</script>
