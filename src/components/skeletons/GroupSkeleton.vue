<template>
  <div class="w-full p-4 flex items-start gap-3 border-l-4 border-transparent">
    <div class="relative flex-shrink-0">
      <Skeleton width="48px" height="48px" rounded="xl" class="ring-2 ring-white shadow-md" />
    </div>
    <div class="flex-1 space-y-2.5">
      <div class="flex items-center justify-between">
        <Skeleton width="60%" height="18px" rounded="md" />
        <Skeleton width="60px" height="24px" rounded="full" />
      </div>
      <div class="flex items-center justify-between">
        <Skeleton width="40%" height="14px" rounded="sm" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
