import { ref } from 'vue';

export function usePagination() {
  const page = ref(1);
  const perPage = ref(10);
  const total = ref(0);

  function reset() { page.value = 1; total.value = 0; }
  function next() { page.value += 1; }
  function prev() { if (page.value > 1) page.value -= 1; }

  return { page, perPage, total, reset, next, prev };
}
