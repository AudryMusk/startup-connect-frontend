<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Image placeholder -->
    <Skeleton width="100%" height="200px" rounded="none" />

    <!-- Content -->
    <div class="p-6 space-y-4">
      <!-- Date badge -->
      <div class="flex items-center gap-2">
        <Skeleton width="100px" height="24px" rounded="full" />
        <Skeleton width="80px" height="24px" rounded="full" />
      </div>

      <!-- Title -->
      <Skeleton width="80%" height="24px" />

      <!-- Description -->
      <div class="space-y-2">
        <Skeleton width="100%" height="12px" />
        <Skeleton width="90%" height="12px" />
      </div>

      <!-- Location & Time -->
      <div class="flex items-center gap-4">
        <Skeleton width="120px" height="14px" />
        <Skeleton width="100px" height="14px" />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-2">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="100px" height="36px" rounded="lg" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
