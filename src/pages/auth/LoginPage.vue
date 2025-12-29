<template>
  <div class="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-theme-50 via-white to-brand-blue/10">
      <div
        class="absolute top-0 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-brand-purple/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob">
      </div>
      <div
        class="absolute top-0 -right-4 w-48 sm:w-72 h-48 sm:h-72 bg-brand-pink/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute -bottom-8 left-20 w-48 sm:w-72 h-48 sm:h-72 bg-brand-blue/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000">
      </div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <Card variant="elevated" class="!p-6 sm:!p-8 md:!p-10">
        <!-- Logo Section -->
        <div class="text-center mb-6 sm:mb-8 md:mb-10">
          <div
            class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-soft-lg animate-scale-in">
            <span class="text-2xl sm:text-3xl font-black text-white">SC</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 mb-2 sm:mb-3">
            Bienvenue sur<br />
            <span class="gradient-text">StartupConnect</span>
          </h1>
          <p class="text-sm sm:text-base text-neutral-600 font-medium">
            Plateforme de l'écosystème béninois
          </p>
        </div>

        <!-- Session Expired Alert -->
        <Alert v-if="sessionExpired" type="warning" class="mb-4 sm:mb-6 animate-fade-in">
          <div class="flex items-center gap-2">
            <Icon name="AlertTriangle" :size="18" />
            <span class="text-sm">Veuillez vous reconnecter.</span>
          </div>
        </Alert>

        <!-- Success Alert (Email verification) -->
        <Alert v-if="verificationMessage" :type="verificationType" class="mb-4 sm:mb-6 animate-fade-in">
          {{ verificationMessage }}
        </Alert>

        <!-- Error Alert -->
        <Alert v-if="error" type="error" class="mb-4 sm:mb-6 animate-fade-in">
          {{ error }}
        </Alert>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
          <Input label="Adresse email" type="email" placeholder="votre@email.com" v-model="formData.email" required />

          <Input label="Mot de passe" type="password" placeholder="••••••••" v-model="formData.password" required />

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" v-model="formData.remember"
                class="w-4 h-4 rounded border-neutral-300 text-theme-600 focus:ring-theme-500 transition-all cursor-pointer" />
              <span
                class="text-neutral-600 font-medium group-hover:text-neutral-900 transition-colors text-xs sm:text-sm">
                Se souvenir de moi
              </span>
            </label>
            <router-link to="/forgot-password"
              class="text-theme-700 hover:text-theme-900 font-semibold transition-colors text-xs sm:text-sm">
              Mot de passe oublié ?
            </router-link>
          </div>

          <Button type="submit" variant="gradient" class="w-full" size="lg" :disabled="loading">
            Se connecter
          </Button>
        </form>
        <!-- Register Link -->
        <div class="mt-6 sm:mt-8 text-center">
          <p class="text-xs sm:text-sm text-neutral-600 font-medium">
            Pas encore de compte ?
            <router-link to="/register" class="text-theme-700 hover:text-theme-900 font-bold transition-colors ml-1">
              Créer un compte
            </router-link>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { Button, Input, Alert, Card, Icon } from '../../components/ui'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const toast = useToast()

const formData = ref({
  email: '',
  password: '',
  remember: false,
})

const verificationMessage = ref('')
const verificationType = ref('success')
const sessionExpired = ref(false)
const redirectPath = ref('/')

const loading = computed(() => authStore.isLoading)
const error = computed(() => authStore.authError)

// Vérifier si message de vérification email dans URL
onMounted(() => {
  const { verified, message, registered, reset, expired, redirect } = route.query

  // Vérifier si la session a expiré
  if (expired === 'true') {
    sessionExpired.value = true
    // Masquer le message après 8 secondes
    setTimeout(() => {
      sessionExpired.value = false
    }, 8000)
  }

  // Sauvegarder la route de redirection
  if (redirect) {
    redirectPath.value = redirect
  }

  // Message pour nouvel inscrit
  if (registered === '1') {
    verificationMessage.value =
      'Inscription réussie ! Vérifiez votre email pour activer votre compte.'
    verificationType.value = 'success'

    // Nettoyer l'URL après 8 secondes
    setTimeout(() => {
      router.replace({ name: 'Login' })
    }, 8000)
  }
  // Message après reset password réussi
  else if (reset === 'success') {
    verificationMessage.value =
      'Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.'
    verificationType.value = 'success'

    setTimeout(() => {
      router.replace({ name: 'Login' })
    }, 6000)
  }
  // Message de vérification email
  else if (verified && message) {
    verificationMessage.value = message
    verificationType.value =
      verified === 'success' ? 'success' : verified === 'error' ? 'error' : 'info'

    // Nettoyer l'URL après 5 secondes
    setTimeout(() => {
      router.replace({ name: 'Login' })
    }, 5000)
  }
})

const handleSubmit = async () => {
  authStore.authError = null

  try {
    await authStore.login({
      email: formData.value.email,
      password: formData.value.password,
      remember: formData.value.remember || false,
    })

    // Afficher message de succès
    toast.success(`Bienvenue ${authStore.userFullName} !`, 3000)

    // L'admin ne doit JAMAIS être soumis à la finalisation de compte
    // Si l'admin se connecte, nettoyer tout pendingOnboarding résiduel et rediriger vers le dashboard admin
    if (authStore.isAdmin) {
      localStorage.removeItem('pendingOnboarding')
      setTimeout(() => router.push('/admin/dashboard'), 1000)
      return
    }

    // Vérifier si l'utilisateur a un onboarding en attente (seulement pour non-admin)
    const pendingOnboarding = localStorage.getItem('pendingOnboarding')

    if (pendingOnboarding) {
      toast.info('Finalisez votre profil pour continuer', 5000)
      // Rediriger vers page onboarding pour finaliser
      setTimeout(() => router.push({ name: 'OnboardingFinalize' }), 1000)
    } else {
      // Rediriger vers la route sauvegardée ou le tableau de bord
      const destination =
        redirectPath.value !== '/' && redirectPath.value !== '/login' ? redirectPath.value : '/'

      setTimeout(() => router.push(destination), 1000)
    }
  } catch (err) {
    // L'erreur est déjà gérée dans authStore et affichée via computed property
    console.error('Erreur de connexion:', err)
  }
}
</script>
