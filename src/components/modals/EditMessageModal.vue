<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Modifier le message</h2>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Icon name="X" :size="20" class="text-gray-400" />
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-6">
            <textarea
              v-model="editedContent"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent resize-none"
              placeholder="Modifier votre message..."
              autofocus
            ></textarea>

            <p class="text-xs text-gray-500 mt-2">
              Vous pouvez modifier ce message pendant 15 minutes après l'envoi.
            </p>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" @click="closeModal">
                Annuler
              </Button>
              <Button
                type="submit"
                :disabled="!editedContent.trim() || saving"
              >
                <LoadingSpinner v-if="saving" size="sm" />
                <Icon v-else name="Check" :size="16" />
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Button, Icon, LoadingSpinner } from '@/components/ui';

const props = defineProps({
  show: Boolean,
  message: Object,
});

const emit = defineEmits(['close', 'save']);

const editedContent = ref('');
const saving = ref(false);

watch(() => props.show, (newVal) => {
  if (newVal && props.message) {
    editedContent.value = props.message.content;
  }
});

function closeModal() {
  emit('close');
}

async function handleSubmit() {
  if (!editedContent.value.trim()) return;

  saving.value = true;
  try {
    await emit('save', editedContent.value);
    closeModal();
  } finally {
    saving.value = false;
  }
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

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
