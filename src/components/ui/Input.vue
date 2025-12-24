<template>
  <div class="w-full">
    <label
      v-if="label"
      class="block text-xs md:text-sm font-semibold text-neutral-700 mb-1.5 md:mb-2"
      >{{ label }}</label
    >
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :min="min"
      :class="inputClasses"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="mt-1.5 md:mt-2 text-[10px] md:text-xs text-red-500 font-medium">
      {{ error }}
    </p>
    <p v-if="hint" class="mt-1.5 md:mt-2 text-[10px] md:text-xs text-neutral-500">{{ hint }}</p>
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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  min: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const inputClasses = computed(() => {
  const base =
    'w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-theme-400 focus:border-transparent placeholder:text-neutral-400'
  const borderColor = props.error
    ? 'border-red-500 bg-red-50'
    : 'border-neutral-200 bg-white hover:border-theme-300'
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''
  return `${base} ${borderColor} ${disabled}`
})
</script>
