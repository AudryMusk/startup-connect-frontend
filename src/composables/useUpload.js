import { ref } from 'vue';

export function useUpload() {
  const progress = ref(0);
  const uploading = ref(false);

  function toFormData(obj) {
    const fd = new FormData();
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (v instanceof File) fd.append(k, v);
      else if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    return fd;
  }
  return { progress, uploading, toFormData };
}
