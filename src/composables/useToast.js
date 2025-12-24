import { ref, readonly } from 'vue';

const toasts = ref([]);
let idCounter = 0;

export function useToast() {
  const show = (message, type = 'info', duration = 5000, action = null) => {
    const id = ++idCounter;
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      visible: true,
      action,
    };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const remove = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message, duration, action) => show(message, 'success', duration, action);
  const error = (message, duration, action) => show(message, 'error', duration, action);
  const info = (message, duration, action) => show(message, 'info', duration, action);
  const warning = (message, duration, action) => show(message, 'warning', duration, action);

  return {
    toasts: readonly(toasts),
    show,
    remove,
    success,
    error,
    info,
    warning,
  };
}
