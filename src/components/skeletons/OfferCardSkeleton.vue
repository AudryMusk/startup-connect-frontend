<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex-1 space-y-2">
        <Skeleton width="60%" height="20px" />
        <Skeleton width="40%" height="14px" />
      </div>
      <Skeleton width="80px" height="28px" rounded="full" />
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <Skeleton width="100%" height="12px" />
      <Skeleton width="90%" height="12px" />
      <Skeleton width="70%" height="12px" />
    </div>

    <!-- Tags -->
    <div class="flex gap-2">
      <Skeleton width="70px" height="24px" rounded="full" />
      <Skeleton width="90px" height="24px" rounded="full" />
      <Skeleton width="80px" height="24px" rounded="full" />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <Skeleton width="40px" height="40px" rounded="full" />
        <Skeleton width="100px" height="14px" />
      </div>
      <Skeleton width="100px" height="36px" rounded="lg" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
