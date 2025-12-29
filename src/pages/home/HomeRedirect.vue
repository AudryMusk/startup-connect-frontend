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
  // Note: La redirection initiale vers /admin/dashboard se fait dans LoginPage.vue
  // Ici on redirige vers la page d'accueil normale du rôle pour permettre
  // à l'admin de voir son fil d'actualité quand il clique sur l'onglet Accueil
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
