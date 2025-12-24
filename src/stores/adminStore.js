
import { defineStore } from 'pinia';
import adminApi from '@/services/admin.js';
import { ref } from 'vue';

export const useAdminStore = defineStore('admin', () => {
  const kpis = ref(null);
  const reports = ref([]);
  const loading = ref(false);

  async function fetchKpis() {
    const { data } = await adminApi.kpis();
    kpis.value = data;
    return data;
  }

  async function fetchReports() {
    const { data } = await adminApi.reports();
    reports.value = data;
    return data;
  }

  async function suspendUser(userId) {
    return adminApi.suspendUser(userId);
  }

  async function resolveReport(id, payload = {}) {
    return adminApi.resolveReport(id, payload);
  }

  return { kpis, reports, loading, fetchKpis, fetchReports, suspendUser, resolveReport };
});
