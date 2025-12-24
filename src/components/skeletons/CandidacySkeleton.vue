<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-4">
    <!-- Avatar -->
    <Skeleton width="48px" height="48px" rounded="full" />

    <!-- Content -->
    <div class="flex-1 space-y-2">
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-1">
          <Skeleton width="40%" height="16px" />
          <Skeleton width="60%" height="12px" />
        </div>
        <Skeleton width="60px" height="20px" rounded="full" />
      </div>
      <Skeleton width="90%" height="12px" />
      <Skeleton width="70%" height="12px" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
