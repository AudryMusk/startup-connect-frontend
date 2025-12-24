<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 via-theme-50/30 to-neutral-100 flex items-center justify-center p-4"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-theme-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-purple/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
      ></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/login" class="inline-flex items-center gap-3 mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-2xl flex items-center justify-center text-white shadow-soft"
          >
            <span class="text-2xl font-black">S</span>
          </div>
        </router-link>
        <h1 class="text-3xl font-black text-neutral-900 mb-2">Réinitialiser le mot de passe</h1>
        <p class="text-neutral-600">Créez votre nouveau mot de passe</p>
      </div>

      <!-- Form Card -->
      <Card variant="elevated" class="!p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Success Message -->
          <Alert v-if="successMessage" type="success">
            {{ successMessage }}
          </Alert>

          <!-- Error Message -->
          <Alert v-if="errorMessage" type="error">
            {{ errorMessage }}
          </Alert>

          <!-- New Password Input -->
          <Input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Nouveau mot de passe"
            placeholder="••••••••"
            :error="errors.password"
            required
          >
            <template #prefix>
              <Icon name="Lock" :size="18" class="text-neutral-400" />
            </template>
            <template #suffix>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-neutral-400 hover:text-neutral-600"
              >
                <Icon :name="showPassword ? 'EyeOff' : 'Eye'" :size="18" />
              </button>
            </template>
          </Input>

          <!-- Confirm Password Input -->
          <Input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            :error="errors.confirmPassword"
            required
          >
            <template #prefix>
              <Icon name="Lock" :size="18" class="text-neutral-400" />
            </template>
            <template #suffix>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="text-neutral-400 hover:text-neutral-600"
              >
                <Icon :name="showConfirmPassword ? 'EyeOff' : 'Eye'" :size="18" />
              </button>
            </template>
          </Input>

          <!-- Password Requirements -->
          <div class="text-xs text-neutral-500 space-y-1">
            <p class="font-medium">Le mot de passe doit contenir :</p>
            <ul class="list-disc list-inside space-y-0.5">
              <li :class="password.length >= 8 ? 'text-green-600' : ''">Au moins 8 caractères</li>
              <li :class="/[A-Z]/.test(password) ? 'text-green-600' : ''">Une lettre majuscule</li>
              <li :class="/[0-9]/.test(password) ? 'text-green-600' : ''">Un chiffre</li>
            </ul>
          </div>

          <!-- Submit Button -->
          <Button type="submit" variant="gradient" size="xl" class="w-full" :disabled="loading">
            <Icon name="Check" :size="20" />
            Réinitialiser le mot de passe
          </Button>

          <!-- Back to Login -->
          <div class="text-center pt-4 border-t border-neutral-200">
            <router-link
              to="/login"
              class="text-theme-600 hover:text-theme-700 font-semibold flex items-center justify-center gap-2"
            >
              <Icon name="ArrowLeft" :size="18" />
              Retour à la connexion
            </router-link>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { Card, Button, Input, Alert, Icon } from '../../components/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const errors = ref({})

// Récupérer token et email depuis l'URL
onMounted(() => {
  token.value = route.query.token || ''
  email.value = route.query.email || ''

  if (!token.value || !email.value) {
    errorMessage.value = 'Lien de réinitialisation invalide ou expiré'
    toast.error('Lien invalide. Demandez un nouveau lien de réinitialisation.', 6000)
  }
})

const handleSubmit = async () => {
  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''

  // Validation du token
  if (!token.value || !email.value) {
    errorMessage.value = 'Lien de réinitialisation invalide'
    return
  }

  // Validation du mot de passe
  if (!password.value) {
    errors.value.password = 'Le mot de passe est requis'
    return
  }

  if (password.value.length < 8) {
    errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  if (!/[A-Z]/.test(password.value)) {
    errors.value.password = 'Le mot de passe doit contenir au moins une majuscule'
    return
  }

  if (!/[0-9]/.test(password.value)) {
    errors.value.password = 'Le mot de passe doit contenir au moins un chiffre'
    return
  }

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true

  try {
    // Appeler l'API via authStore
    await authStore.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    })

    successMessage.value = '✅ Mot de passe réinitialisé avec succès !'
    toast.success('Mot de passe modifié ! Vous pouvez maintenant vous connecter.', 5000)

    // Rediriger vers login après 2 secondes
    setTimeout(() => {
      router.push({ name: 'Login', query: { reset: 'success' } })
    }, 2000)
  } catch (err) {
    console.error('Erreur reset password:', err)

    if (err.response?.status === 400 || err.response?.status === 422) {
      errorMessage.value = 'Lien expiré ou invalide. Demandez un nouveau lien de réinitialisation.'
    } else if (err.response?.status === 404) {
      errorMessage.value = 'Utilisateur introuvable'
    } else {
      errorMessage.value = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
    }

    toast.error(errorMessage.value, 6000)
  } finally {
    loading.value = false
  }
}
</script>
