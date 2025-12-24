<template>
  <div class="w-full p-4 flex items-start gap-3 border-l-4 border-transparent hover:bg-gray-50 transition">
    <div class="relative flex-shrink-0">
      <Skeleton width="48px" height="48px" rounded="full" class="ring-2 ring-white shadow-sm" />
      <div class="absolute bottom-0 right-0 w-3 h-3 bg-gray-200 rounded-full border-2 border-white" />
    </div>
    <div class="flex-1 space-y-2.5">
      <div class="flex items-center justify-between">
        <Skeleton width="60%" height="18px" />
        <Skeleton width="50px" height="12px" />
      </div>
      <div class="flex items-center justify-between gap-2">
        <Skeleton width="85%" height="14px" />
        <Skeleton width="24px" height="24px" rounded="full" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
