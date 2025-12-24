<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-theme-light to-white">
    <div class="w-full max-w-2xl">
      <Card variant="elevated" class="!p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-theme rounded-full mb-4">
            <Icon name="CheckCircle" :size="32" class="text-white" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Finalisation de votre inscription</h1>
          <p class="text-gray-500 text-sm mt-2">
            Bienvenue {{ user?.name }} ! Finalisez votre profil pour accéder à la plateforme.
          </p>
        </div>

        <!-- Loading -->
        <div v-if="processing" class="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p class="text-gray-600 mt-4 font-medium">{{ processingMessage }}</p>
        </div>

        <!-- Error -->
        <Alert v-else-if="error" type="error" class="mb-4">
          {{ error }}
        </Alert>

        <!-- Success -->
        <Alert v-else-if="success" type="success" class="mb-4">
          {{ successMessage }}
          <p class="text-sm mt-2">Redirection dans {{ countdown }}s...</p>
        </Alert>

        <!-- Onboarding Form -->
        <div v-else>
          <!-- Startuper - Nouvelle startup -->
          <div v-if="pendingData?.role === 'startuper' && pendingData?.startupChoice === 'new'">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Créer votre startup</h2>

            <form @submit.prevent="handleCreateStartup" class="space-y-4">
              <Input label="Nom de la startup" v-model="startupForm.name" placeholder="Nom de votre startup"/>

              <div class="grid grid-cols-2 gap-4">
                <Select label="Secteur" v-model="startupForm.sector">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="s in sectors" :key="s.id" :value="s.id" >{{ s.nom }}</option>
                </Select>

                <Input label="Localisation" v-model="startupForm.location"/>
              </div>

              <Input label="Numéro RCCM" v-model="startupForm.rccm" placeholder="RB/COT/21 A 33139" disabled/>

              <Select label="Taille de l'équipe" v-model="startupForm.taille">
                <option value="">-- Sélectionner --</option>
                <option value="1-10">1-10 employés</option>
                <option value="11-50">11-50 employés</option>
                <option value="51-200">51-200 employés</option>
                <option value="201-500">201-500 employés</option>
                <option value="500+">500+ employés</option>
              </Select>

              <div class="grid grid-cols-2 gap-4">
                <Select label="Votre poste" v-model="startupForm.position_id" :required="!startupForm.title_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.nom }}</option>
                </Select>

                <Select label="Votre titre" v-model="startupForm.title_id">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="t in titles" :key="t.id" :value="t.id">{{ t.nom }}</option>
                </Select>
              </div>

              <Alert v-if="!startupForm.position_id && !startupForm.title_id" type="warning" class="text-xs">
                Veuillez sélectionner au moins un poste ou un titre
              </Alert>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Document RCCM (PDF)
                </label>
                <input
                  ref="rccmInput"
                  type="file"
                  accept=".pdf"
                  @change="onRccmFileChange"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-theme file:text-white hover:file:bg-theme-hover"
                required />
                <p class="text-xs text-gray-400 mt-1">Ce document est strictement confidentiel. Il est utilisé uniquement par nos services pour valider l'existence juridique de votre startup et ne sera jamais publié.</p>
              </div>

              <Textarea label="Description (optionnel)" v-model="startupForm.description"
                placeholder="Décrivez votre startup, votre mission, vos objectifs..." rows="4" />

              <Button type="submit" class="w-full" :disabled="submitting">
                {{ submitting ? 'Création en cours...' : 'Créer ma startup' }}
              </Button>
            </form>
          </div>

          <!-- Startuper - Rejoindre startup existante -->
          <div v-else-if="pendingData?.role === 'startuper' && pendingData?.startupChoice === 'existing'">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Rejoindre une startup</h2>

            <form @submit.prevent="handleJoinStartup" class="space-y-4">
              <Alert type="info" class="mb-4">
                Une demande d'adhésion sera envoyée aux responsables de la startup.
              </Alert>

              <Input label="Startup sélectionnée" :modelValue="selectedStartupName" disabled />

              <!-- <Textarea label="Message de motivation" v-model="joinForm.message"
                placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre cette startup..." rows="5"
                required /> -->
              <!-- <Input label="Startup sélectionnée" :modelValue="startuprequestposition" disabled /> -->
              <div class="grid grid-cols-2 gap-4">
              <Select label="Poste souhaité" v-model="joinForm.position_id" :required="!joinForm.title_id">
                <option value="">-- Sélectionner --</option>
                <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                  {{ pos.nom }}
                </option>
              </Select>

              <Select label="Titre" v-model="joinForm.title_id">
                <option value="">-- Sélectionner --</option>
                <option v-for="title in titles" :key="title.id" :value="title.id">
                  {{ title.nom }}
                </option>
              </Select>
              </div>
              <Alert v-if="!joinForm.position_id && !joinForm.title_id" type="warning" class="text-xs">
                Veuillez sélectionner au moins un poste ou un titre
              </Alert>

              <Button type="submit" class="w-full" :disabled="submitting">
                {{ submitting ? 'Envoi en cours...' : 'Envoyer la demande' }}
              </Button>
            </form>
          </div>

          <!-- Partner - Créer organisation -->
          <div v-else-if="pendingData?.role === 'partenaire'">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Créer votre organisation</h2>

            <form @submit.prevent="handleCreateOrganization" class="space-y-4">
              <Input label="Nom de l'organisation" v-model="orgForm.name" placeholder="Nom de votre organisation"
                required />

              <Select label="Type d'organisation" v-model="orgForm.type" required>
                <option value="">-- Sélectionner --</option>
                <option v-for="t in partnerTypes" :key="t" :value="t">{{ t }}</option>
              </Select>

              <Textarea label="Description (optionnel)" v-model="orgForm.description"
                placeholder="Décrivez votre organisation, votre mission..." rows="4" />

              <Button type="submit" class="w-full" :disabled="submitting">
                {{ submitting ? 'Création en cours...' : 'Créer mon organisation' }}
              </Button>
            </form>
          </div>

          <!-- No pending data -->
          <div v-else>
            <Alert type="warning">
              Aucune information d'onboarding en attente. Vous allez être redirigé vers votre espace.
            </Alert>
            <Button @click="handleRedirect" class="w-full mt-4">
              Continuer
            </Button>
          </div>
        </div>

        <!-- Skip Link -->
        <!-- <div v-if="!success && !processing" class="mt-6 text-center">
          <button
            @click="handleSkip"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Finaliser plus tard
          </button>
        </div> -->
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
// import { useStartupStore } from '@/stores/startupStore';
import api from '@/services/api';
import startupService from '@/services/startup';

import { Button, Input, Select, Textarea, Alert, Card, Icon, LoadingSpinner } from '@/components/ui';

const router = useRouter();
const authStore = useAuthStore();

const pendingData = ref(null);
const processing = ref(false);
const processingMessage = ref('');
const submitting = ref(false);
const error = ref(null);
const success = ref(false);
const successMessage = ref('');
const countdown = ref(3);

const positions = ref([]);
const titles = ref([]);
const sectors = ref([]);
const partnerTypes = ref(['incubateur', 'investisseur', 'bailleur', 'accelerateur']);

const user = computed(() => authStore.user);

const startupForm = ref({
  name: '',
  sector: '',
  location: '',
  rccm: '',
  taille: '',
  position_id: '',
  title_id: '',
  description: '',
  rccmFile: null,
});

const joinForm = ref({
  message: '',
  position_id: '',
  title_id: '',
});

const orgForm = ref({
  name: '',
  type: '',
  description: '',
});

const selectedStartupName = ref('');
// const startuprequestposition = ref('');
// const startuprequestitle = ref ('')

onMounted(async () => {
  const pending = localStorage.getItem('pendingOnboarding');
  if (pending) {
    try {
      pendingData.value = JSON.parse(pending);

      if (pendingData.value.startupChoice === 'new') {
        startupForm.value = {
          name: pendingData.value.startupName || '',
          sector: pendingData.value.sector || '',
          location: pendingData.value.location || '',
          rccm: pendingData.value.rccm || '',
          taille: pendingData.value.taille || '',
          position_id: pendingData.value.position_id || '',
          title_id: pendingData.value.title_id || '',
          description: '',
          rccmFile: null,
        };
      }

      if (pendingData.value.role === 'partenaire') {
        orgForm.value = {
          name: pendingData.value.companyName || '',
          type: pendingData.value.companyType || '',
          description: '',
        };
      }

      if (pendingData.value.startupChoice === 'existing' && pendingData.value.existingStartupId) {
        try {
          const { data } = await startupService.get(pendingData.value.existingStartupId);
          selectedStartupName.value = data.data?.nom || data.nom || 'Startup';

        } catch (e) {
          console.error('Erreur chargement startup:', e);
          selectedStartupName.value = 'Startup';
        }
      }

      // if (pendingData.value.startupChoice === 'existing' && pendingData.value.position_id) {
      //   try {
      //     const { dataposition } = await startupService.get(pendingData.value.position_id);
      //     startuprequestposition.value = dataposition.data?.nom || dataposition.nom || 'Position';

      //   } catch (e) {
      //     console.error('Erreur chargement startup:', e);
      //     startuprequestposition.value = 'position';
      //   }
      // }

    } catch (e) {
      console.error('Erreur parsing pendingOnboarding:', e);
    }
  }

  try {
    const [posRes, titlesRes, sectRes] = await Promise.all([
      api.get('/positions'),
      api.get('/titles'),
      api.get('/secteurs'),
    ]);
    positions.value = posRes.data.positions || posRes.data || [];
    titles.value = titlesRes.data.titles || titlesRes.data || [];
    sectors.value = sectRes.data.secteurs || sectRes.data || [];
  } catch (e) {
    console.warn('Erreur chargement positions/titles:', e);
  }
});

function onRccmFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 6 * 1024 * 1024) {
      error.value = 'Le fichier PDF est trop volumineux (max 6MB)';
      return;
    }
    startupForm.value.rccmFile = file;
  }
}

async function handleCreateStartup() {
  submitting.value = true;
  error.value = null;

  if (!user.value) {
    error.value = 'Vous devez être connecté pour créer une startup';
    submitting.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nom', startupForm.value.name);
    formData.append('secteur_id', startupForm.value.sector);
    formData.append('emplacement', startupForm.value.location);
    formData.append('registre_commerce_number', startupForm.value.rccm);

    if (startupForm.value.taille) {
      formData.append('taille', startupForm.value.taille);
    }

    if (startupForm.value.position_id) {
      formData.append('position_id', startupForm.value.position_id);
    }

    if (startupForm.value.title_id) {
      formData.append('title_id', startupForm.value.title_id);
    }

    if (startupForm.value.description) {
      formData.append('description', startupForm.value.description);
    }

    if (startupForm.value.rccmFile) {
      formData.append('registre_commerce_pdf', startupForm.value.rccmFile);
    }

    processing.value = true;
    processingMessage.value = 'Création de votre startup...';

    await api.post('/startups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    localStorage.removeItem('pendingOnboarding');

    success.value = true;
    successMessage.value = `✓ Startup "${startupForm.value.name}" créée avec succès !`;

    startCountdown();

  } catch (err) {
    console.error('Erreur création startup:', err);
    processing.value = false;

    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {};
      const firstError = Object.values(errors)[0];
      error.value = Array.isArray(firstError) ? firstError[0] : 'Erreur de validation';
    } else {
      error.value = err.response?.data?.message || 'Erreur lors de la création de la startup';
    }
  } finally {
    submitting.value = false;
  }
}

async function handleCreateOrganization() {
  submitting.value = true;
  error.value = null;

  if (!user.value) {
    error.value = 'Vous devez être connecté pour créer une organisation';
    submitting.value = false;
    return;
  }

  try {
    processing.value = true;
    processingMessage.value = 'Création de votre organisation...';

    const payload = {
      name: orgForm.value.name,
      description: orgForm.value.description,
      status: 'active',
    };

    await api.post('/organizations', payload);

    localStorage.removeItem('pendingOnboarding');

    success.value = true;
    successMessage.value = `✓ Organisation "${orgForm.value.name}" créée avec succès !`;

    startCountdown();

  } catch (err) {
    console.error('Erreur création organisation:', err);
    processing.value = false;

    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {};
      const firstError = Object.values(errors)[0];
      error.value = Array.isArray(firstError) ? firstError[0] : 'Erreur de validation';
    } else {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'organisation';
    }
  } finally {
    submitting.value = false;
  }
}

async function handleJoinStartup() {
  if (!pendingData.value?.existingStartupId) {
    error.value = 'Aucune startup sélectionnée';
    return;
  }

  if (!user.value) {
    error.value = 'Vous devez être connecté pour rejoindre une startup';
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    processing.value = true;
    processingMessage.value = 'Envoi de votre demande...';

    const payload = {
      message: joinForm.value.message,
      position_id: joinForm.value.position_id || null,
      title_id: joinForm.value.title_id || null,
    };

    await api.post(`/startups/${pendingData.value.existingStartupId}/join-request`, payload);

    localStorage.removeItem('pendingOnboarding');

    success.value = true;
    successMessage.value = '✓ Demande d\'adhésion envoyée avec succès ! Les responsables vont examiner votre demande.';

    startCountdown();

  } catch (err) {
    console.error('Erreur envoi demande:', err);
    processing.value = false;

    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {};
      const firstError = Object.values(errors)[0];
      error.value = Array.isArray(firstError) ? firstError[0] : 'Erreur de validation';
    } else {
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi de la demande';
    }
  } finally {
    submitting.value = false;
  }
}

// function handlePartnerRedirect() {
//   localStorage.removeItem('pendingOnboarding');
//   router.push('/HomeRedirect');
// }

function handleRedirect() {
  localStorage.removeItem('pendingOnboarding');
  router.push('/HomeRedirect');
}

function startCountdown() {
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(interval);
      router.push('/HomeRedirect');
    }
  }, 1000);
}
</script>
