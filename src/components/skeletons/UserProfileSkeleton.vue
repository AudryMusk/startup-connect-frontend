<template>
  <div>
    <!-- Cover Image Skeleton -->
    <Skeleton width="100%" height="192px" rounded="2xl" class="mb-4" />

    <!-- Profile Card Skeleton -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 -mt-20 relative">
      <div class="flex flex-col sm:flex-row gap-6">
        <!-- Avatar Skeleton -->
        <div class="-mt-12">
          <Skeleton width="128px" height="128px" rounded="2xl" class="ring-4 ring-white" />
        </div>

        <!-- User Info Skeleton -->
        <div class="flex-1 pt-2 space-y-4">
          <!-- Name and Badges -->
          <div class="space-y-3">
            <Skeleton width="60%" height="32px" />
            <div class="flex gap-2">
              <Skeleton width="100px" height="28px" rounded="full" />
              <Skeleton width="80px" height="28px" rounded="full" />
              <Skeleton width="90px" height="28px" rounded="full" />
            </div>
          </div>

          <!-- Bio Skeleton -->
          <div class="p-4 bg-gray-50 rounded-lg space-y-2">
            <Skeleton width="100%" height="16px" />
            <Skeleton width="95%" height="16px" />
            <Skeleton width="70%" height="16px" />
          </div>

          <!-- Contact Info Grid Skeleton -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <Skeleton width="40px" height="40px" rounded="lg" />
              <div class="flex-1 space-y-2">
                <Skeleton width="60px" height="12px" />
                <Skeleton width="80%" height="14px" />
              </div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <Skeleton width="40px" height="40px" rounded="lg" />
              <div class="flex-1 space-y-2">
                <Skeleton width="70px" height="12px" />
                <Skeleton width="70%" height="14px" />
              </div>
            </div>
          </div>

          <!-- Skills Skeleton -->
          <div class="mt-6 p-4 bg-gradient-to-br from-theme-50 to-purple-50 rounded-xl">
            <div class="flex items-center gap-2 mb-3">
              <Skeleton width="32px" height="32px" rounded="lg" />
              <Skeleton width="120px" height="16px" />
            </div>
            <div class="flex flex-wrap gap-2">
              <Skeleton width="90px" height="36px" rounded="lg" />
              <Skeleton width="110px" height="36px" rounded="lg" />
              <Skeleton width="100px" height="36px" rounded="lg" />
              <Skeleton width="85px" height="36px" rounded="lg" />
              <Skeleton width="120px" height="36px" rounded="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts Section Skeleton -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
      <div class="flex items-center gap-3 mb-6">
        <Skeleton width="40px" height="40px" rounded="xl" />
        <div class="space-y-2">
          <Skeleton width="150px" height="20px" />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>

      <!-- Post Skeletons -->
      <div class="space-y-6">
        <div v-for="i in 2" :key="i" class="p-4 border border-gray-200 rounded-xl">
          <div class="flex items-start gap-3 mb-3">
            <Skeleton width="40px" height="40px" rounded="full" />
            <div class="flex-1 space-y-2">
              <Skeleton width="40%" height="16px" />
              <Skeleton width="60px" height="12px" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton width="100%" height="14px" />
            <Skeleton width="95%" height="14px" />
            <Skeleton width="80%" height="14px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue';
</script>
