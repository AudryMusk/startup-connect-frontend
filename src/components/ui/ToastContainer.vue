<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-96 pointer-events-none">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" :class="[
          'flex items-start gap-3 p-4 rounded shadow-lg bg-white border-l-4 pointer-events-auto cursor-pointer transition-all hover:translate-x-[-4px] hover:shadow-xl',
          toast.type === 'success' && 'border-l-green-600',
          toast.type === 'error' && 'border-l-red-600',
          toast.type === 'warning' && 'border-l-amber-600',
          toast.type === 'info' && 'border-l-blue-600',
        ]" @click="handleClick(toast)">
          <div class="flex-shrink-0 w-5 h-5" :class="[
            toast.type === 'success' && 'text-green-500',
            toast.type === 'error' && 'text-red-500',
            toast.type === 'warning' && 'text-amber-500',
            toast.type === 'info' && 'text-blue-500',
          ]">
            <Icon v-if="toast.type === 'success'" name="check-circle" />
            <Icon v-else-if="toast.type === 'error'" name="x-circle" />
            <Icon v-else-if="toast.type === 'warning'" name="alert-triangle" />
            <Icon v-else name="info" />
          </div>
          <div class="flex-1 text-sm leading-5 text-gray-700">
            <p>{{ toast.message }}</p>
          </div>
          <button
            class="flex-shrink-0 w-5 h-5 p-0 border-none bg-none cursor-pointer text-gray-400 transition-colors hover:text-gray-700"
            @click.stop="remove(toast.id)">
            <Icon name="X" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import Icon from './Icon.vue'

const { toasts, remove } = useToast()

function handleClick(toast) {
  if (toast.action) {
    toast.action()
  }
  remove(toast.id)
}
</script>
