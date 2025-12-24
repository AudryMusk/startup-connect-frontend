<template>
  <div class="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { LoadingSpinner } from '../../components/ui'

const router = useRouter()
const { user } = useAuth()

onMounted(() => {
  // If not authenticated, go to login
  if (!user.value) {
    router.replace('/login')
    return
  }

  // Redirect based on user role
  if (user.value.role === 'admin') {
    router.replace('/admin-home')
  } else if (user.value.role === 'partenaire') {
    router.replace('/partner')
  } else {
    // startuper or default
    router.replace('/startup')
  }
})
</script>
