<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <Skeleton width="48px" height="48px" rounded="full" />
      <div class="flex-1 space-y-2">
        <Skeleton width="40%" height="16px" />
        <Skeleton width="30%" height="12px" />
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <Skeleton width="100%" height="14px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="70%" height="14px" />
    </div>

    <!-- Image placeholder (optional) -->
    <Skeleton v-if="withImage" width="100%" height="300px" rounded="lg" />

    <!-- Actions -->
    <div class="flex items-center gap-4 pt-2">
      <Skeleton width="80px" height="32px" rounded="lg" />
      <Skeleton width="80px" height="32px" rounded="lg" />
      <Skeleton width="80px" height="32px" rounded="lg" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';

defineProps({
  withImage: {
    type: Boolean,
    default: false
  }
});
</script>
