
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const form = ref({
    id: null,
    title: '',
    questions: [], // {id, type, label, options?}
  });

  function addQuestion(type) {
    form.value.questions.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type,
      label: '',
      options: type === 'radio' || type === 'checkbox' ? [] : undefined,
      required: false,
    });
  }
  function updateQuestion(id, patch) {
    const q = form.value.questions.find(x => x.id === id);
    if (q) Object.assign(q, patch);
  }
  function removeQuestion(id) {
    form.value.questions = form.value.questions.filter(x => x.id !== id);
  }
  function serialize() {
    return {
      title: form.value.title,
      questions: form.value.questions,
    };
  }
  function reset() {
    form.value = { id: null, title: '', questions: [] };
  }

  return { form, addQuestion, updateQuestion, removeQuestion, serialize, reset };
});
