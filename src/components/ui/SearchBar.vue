<template>
  <div class="relative">
    <div class="relative">
      <Icon
        name="Search"
        :size="18"
        class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="[
          'w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 text-sm md:text-base border-2 border-neutral-200 rounded-xl transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-theme-400 focus:border-transparent',
          'placeholder:text-neutral-400 font-medium',
          'hover:border-theme-300 bg-white',
        ]"
      />
      <button
        v-if="modelValue && clearable"
        @click="$emit('update:modelValue', '')"
        class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <Icon name="X" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'search',
  },
  placeholder: {
    type: String,
    default: 'Rechercher...',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])
</script>
