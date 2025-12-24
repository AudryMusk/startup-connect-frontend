<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/20"></div>

        <!-- Modal Content -->
        <div class="relative z-10 max-w-4xl max-h-[80vh] w-full" @click.stop>
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute -top-12 right-0 p-2 text-white hover:text-neutral-300 transition-colors"
            aria-label="Fermer"
          >
            <Icon name="X" :size="32" />
          </button>

          <!-- Image -->
          <img
            :src="imageSrc"
            :alt="imageAlt"
            class="max-w-full max-h-[80vh] object-contain rounded-lg mx-auto"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: 'Image',
  },
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Empêcher le scroll du body quand la modale est ouverte
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

// Fermer avec la touche Escape
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
