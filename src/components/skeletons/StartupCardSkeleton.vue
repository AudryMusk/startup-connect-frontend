<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
    <!-- Logo & Name -->
    <div class="flex items-start gap-4">
      <Skeleton width="64px" height="64px" rounded="xl" />
      <div class="flex-1 space-y-2">
        <Skeleton width="60%" height="20px" />
        <Skeleton width="40%" height="14px" />
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <Skeleton width="100%" height="12px" />
      <Skeleton width="90%" height="12px" />
      <Skeleton width="70%" height="12px" />
    </div>

    <!-- Tags -->
    <div class="flex gap-2">
      <Skeleton width="80px" height="24px" rounded="full" />
      <Skeleton width="100px" height="24px" rounded="full" />
      <Skeleton width="90px" height="24px" rounded="full" />
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <Skeleton width="100%" height="40px" rounded="lg" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
