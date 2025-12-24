<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-black text-gray-900 mb-2">Sécurité</h1>
      <p class="text-gray-600">Gérez vos paramètres de sécurité et vos sessions actives</p>
    </div>

    <!-- Change Password Section -->
    <Card class="mb-6">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Changer le mot de passe</h2>
        <p class="text-sm text-gray-500">Assurez-vous d'utiliser un mot de passe fort et unique</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe actuel
          </label>
          <input
            type="password"
            v-model="passwordForm.current_password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            v-model="passwordForm.password"
            required
            minlength="8"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            v-model="passwordForm.password_confirmation"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
          />
        </div>

        <div v-if="passwordError" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {{ passwordError }}
        </div>

        <div v-if="passwordSuccess" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {{ passwordSuccess }}
        </div>

        <Button type="submit" :disabled="changingPassword" class="w-full">
          <LoadingSpinner v-if="changingPassword" size="sm" />
          <template v-else>
            <Icon name="Lock" :size="18" />
            Changer le mot de passe
          </template>
        </Button>
      </form>
    </Card>

    <!-- Active Sessions Section -->
    <Card>
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Sessions actives</h2>
        <p class="text-sm text-gray-500">Gérez vos connexions sur différents appareils</p>
      </div>

      <div class="space-y-4">
        <!-- Current Session -->
        <div class="flex items-start gap-4 p-4 bg-theme-light rounded-lg border-2 border-theme">
          <div class="w-10 h-10 bg-theme rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <Icon name="Monitor" :size="20" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900">Appareil actuel</h3>
              <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                Actif
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ getCurrentDeviceInfo() }}</p>
            <p class="text-xs text-gray-500 mt-1">Dernière activité: Maintenant</p>
          </div>
        </div>

        <!-- Logout Actions -->
        <div class="pt-4 border-t border-gray-200 space-y-3">
          <Button
            variant="outline"
            @click="handleLogoutCurrent"
            :disabled="loggingOut"
            class="w-full"
          >
            <Icon name="LogOut" :size="18" />
            Se déconnecter de cet appareil
          </Button>

          <Button
            variant="danger"
            @click="handleLogoutAll"
            :disabled="loggingOut"
            class="w-full"
          >
            <LoadingSpinner v-if="loggingOut" size="sm" />
            <template v-else>
              <Icon name="LogOut" :size="18" />
              Se déconnecter de tous les appareils
            </template>
          </Button>
          <p class="text-xs text-gray-500 text-center">
            Cela vous déconnectera de tous les appareils, y compris celui-ci
          </p>
        </div>
      </div>
    </Card>

    <!-- Security Tips -->
    <Card class="mt-6 bg-blue-50 border-blue-200">
      <div class="flex gap-4">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
          <Icon name="Shield" :size="20" />
        </div>
        <div>
          <h3 class="font-bold text-blue-900 mb-2">Conseils de sécurité</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Utilisez un mot de passe unique et complexe</li>
            <li>• Ne partagez jamais votre mot de passe</li>
            <li>• Déconnectez-vous sur les ordinateurs partagés</li>
            <li>• Changez votre mot de passe régulièrement</li>
          </ul>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Card, Button, LoadingSpinner, Icon } from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()

// Password Change Form
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})
const changingPassword = ref(false)
const passwordError = ref(null)
const passwordSuccess = ref(null)

// Sessions
const loggingOut = ref(false)

// Handle Password Change
const handleChangePassword = async () => {
  passwordError.value = null
  passwordSuccess.value = null

  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  changingPassword.value = true

  try {
    await authStore.changePassword({
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    })

    passwordSuccess.value = 'Mot de passe changé avec succès'

    // Reset form
    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    }

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      passwordSuccess.value = null
    }, 5000)
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'Erreur lors du changement de mot de passe'
  } finally {
    changingPassword.value = false
  }
}

// Handle Logout Current Device
const handleLogoutCurrent = async () => {
  if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    return
  }

  loggingOut.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  } finally {
    loggingOut.value = false
  }
}

// Handle Logout All Devices
const handleLogoutAll = async () => {
  if (!confirm('Êtes-vous sûr de vouloir vous déconnecter de TOUS les appareils ? Cela inclut cet appareil.')) {
    return
  }

  loggingOut.value = true
  try {
    await authStore.logoutAll()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion globale:', error)
    alert('Erreur lors de la déconnexion. Veuillez réessayer.')
  } finally {
    loggingOut.value = false
  }
}

// Get Current Device Info
const getCurrentDeviceInfo = () => {
  const ua = navigator.userAgent
  let browser = 'Navigateur inconnu'
  let os = 'Système inconnu'

  // Detect Browser
  if (ua.includes('Chrome')) browser = 'Google Chrome'
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Microsoft Edge'
  else if (ua.includes('Opera')) browser = 'Opera'

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS')) os = 'iOS'

  return `${browser} sur ${os}`
}
</script>
