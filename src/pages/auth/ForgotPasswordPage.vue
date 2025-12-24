<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 via-theme-50/30 to-neutral-100 flex items-center justify-center p-4">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-theme-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob">
      </div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-purple/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000">
      </div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/login" class="inline-flex items-center gap-3 mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-2xl flex items-center justify-center text-white shadow-soft">
            <span class="text-2xl font-black">SC</span>
          </div>
        </router-link>
        <h1 class="text-3xl font-black text-neutral-900 mb-2">Mot de passe oublié ?</h1>
        <p class="text-neutral-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
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

          <!-- Email Input -->
          <Input v-model="email" type="email" label="Adresse email" placeholder="votre@email.com" :error="errors.email"
            required>
            <template #prefix>
              <Icon name="Mail" :size="18" class="text-neutral-400" />
            </template>
          </Input>

          <!-- Submit Button -->
          <Button type="submit" variant="gradient" size="xl" class="w-full" :disabled="loading">
            <Icon name="Send" :size="20" />
            Envoyer le lien
          </Button>

          <!-- Back to Login -->
          <div class="text-center pt-4 border-t border-neutral-200">
            <router-link to="/login"
              class="text-theme-600 hover:text-theme-700 font-semibold flex items-center justify-center gap-2">
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
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { Card, Button, Input, Alert, Icon } from '../../components/ui'

const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const errors = ref({})

const handleSubmit = async () => {
  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!email.value) {
    errors.value.email = "L'email est requis"
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Email invalide'
    return
  }

  loading.value = true

  try {
    // Appeler l'API via authStore
    await authStore.forgotPassword(email.value)

    successMessage.value = `Un email de réinitialisation a été envoyé à ${email.value}`
    toast.success('Email envoyé ! Vérifiez votre boîte de réception.', 6000)

    // Réinitialiser le formulaire
    email.value = ''
  } catch (err) {
    console.error('Erreur forgot password:', err)

    if (err.response?.status === 404) {
      errorMessage.value = 'Aucun compte associé à cet email'
    } else if (err.response?.status === 429) {
      errorMessage.value = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
    } else {
      errorMessage.value =
        err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
    }

    toast.error(errorMessage.value, 5000)
  } finally {
    loading.value = false
  }
}
</script>
