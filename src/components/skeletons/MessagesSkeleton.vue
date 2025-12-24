<template>
  <div class="space-y-1.5 md:space-y-4 p-2 md:p-4">
    <!-- Message reçu (gauche) -->
    <div class="flex gap-1 md:gap-3 animate-pulse px-1">
      <Skeleton
        width="24px"
        height="24px"
        rounded="full"
        class="flex-shrink-0 ring-2 ring-gray-200 md:w-8 md:h-8"
      />
      <div
        class="flex flex-col items-start space-y-1 md:space-y-2 max-w-[calc(100vw-5.5rem)] md:max-w-md"
      >
        <Skeleton width="140px" height="24px" rounded="2xl" class="rounded-tl-sm md:w-48 md:h-10" />
        <Skeleton width="40px" height="8px" rounded="md" class="md:h-3" />
      </div>
    </div>

    <!-- Message envoyé (droite) -->
    <div class="flex gap-1 md:gap-3 flex-row-reverse animate-pulse px-1">
      <Skeleton
        width="24px"
        height="24px"
        rounded="full"
        class="flex-shrink-0 ring-2 ring-theme-500/30 md:w-8 md:h-8"
      />
      <div
        class="flex flex-col items-end space-y-1 md:space-y-2 max-w-[calc(100vw-5.5rem)] md:max-w-md"
      >
        <Skeleton
          width="160px"
          height="28px"
          rounded="2xl"
          class="rounded-tr-sm bg-gradient-to-br from-theme-200 to-purple-200 md:w-56 md:h-12"
        />
        <Skeleton width="35px" height="8px" rounded="md" class="md:h-3" />
      </div>
    </div>

    <!-- Message reçu (gauche) -->
    <div class="flex gap-1 md:gap-3 animate-pulse px-1">
      <Skeleton
        width="24px"
        height="24px"
        rounded="full"
        class="flex-shrink-0 ring-2 ring-gray-200 md:w-8 md:h-8"
      />
      <div
        class="flex flex-col items-start space-y-1 md:space-y-2 max-w-[calc(100vw-5.5rem)] md:max-w-md"
      >
        <Skeleton width="110px" height="22px" rounded="2xl" class="rounded-tl-sm md:w-40 md:h-9" />
        <Skeleton width="30px" height="8px" rounded="md" class="md:h-3" />
      </div>
    </div>

    <!-- Message envoyé (droite) -->
    <div class="flex gap-1.5 md:gap-3 flex-row-reverse animate-pulse">
      <div class="w-7 md:w-8 flex-shrink-0" />
      <div class="flex flex-col items-end space-y-1.5 md:space-y-2 max-w-xs md:max-w-md">
        <Skeleton
          width="180px"
          height="32px"
          rounded="2xl"
          class="rounded-tr-sm bg-gradient-to-br from-theme-200 to-purple-200 md:w-56 md:h-10"
        />
        <Skeleton width="50px" height="10px" rounded="md" md:h-3 />
      </div>
    </div>

    <!-- Message reçu (gauche) - plus long -->
    <div class="flex gap-1.5 md:gap-3 animate-pulse">
      <div class="w-7 md:w-8 flex-shrink-0" />
      <div class="flex flex-col items-start space-y-1.5 md:space-y-2 max-w-xs md:max-w-md">
        <Skeleton width="240px" height="44px" rounded="2xl" class="rounded-tl-sm md:w-80 md:h-14" />
        <Skeleton width="55px" height="10px" rounded="md" md:h-3 />
      </div>
    </div>

    <!-- Message envoyé (droite) -->
    <div class="flex gap-1.5 md:gap-3 flex-row-reverse animate-pulse">
      <Skeleton
        width="28px"
        height="28px"
        rounded="full"
        class="flex-shrink-0 ring-2 ring-theme-500/30 md:w-8 md:h-8"
      />
      <div class="flex flex-col items-end space-y-1.5 md:space-y-2 max-w-xs md:max-w-md">
        <Skeleton
          width="140px"
          height="32px"
          rounded="2xl"
          class="rounded-tr-sm bg-gradient-to-br from-theme-200 to-purple-200 md:w-44 md:h-10"
        />
        <Skeleton width="42px" height="10px" rounded="md" md:h-3 />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from '@/components/ui/Skeleton.vue'
</script>
