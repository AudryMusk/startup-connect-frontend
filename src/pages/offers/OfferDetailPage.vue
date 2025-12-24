<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="!offer" class="max-w-4xl mx-auto mt-20 px-4">
    <Alert type="error">Opportunité non trouvée</Alert>
  </div>

  <div v-else class="max-w-7xl mx-auto space-y-6 px-4 md:px-6 lg:px-8 py-6">
    <!-- Back Button -->
    <button
      @click="router.push('/offers')"
      class="flex items-center gap-2 text-gray-600 hover:text-theme transition group"
    >
      <Icon name="ChevronLeft" :size="20" class="group-hover:-translate-x-1 transition-transform" />
      <span class="font-medium">Retour aux offres</span>
    </button>

    <!-- Success & Error Alerts -->
    <Alert v-if="success" type="success">
      ✅ Votre candidature a été envoyée avec succès !
    </Alert>
    <Alert v-if="error" type="error">{{ error }}</Alert>

    <!-- Header Section -->
    <Card class="border-l-4 border-theme">
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <!-- Left: Title & Meta -->
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <Badge :color="offer.type === 'event' ? 'purple' : 'theme'">
              <Icon :name="offer.type === 'event' ? 'Calendar' : 'Briefcase'" :size="14" />
              {{ offer.type === 'event' ? 'Événement' : 'Appel à projets' }}
            </Badge>
            <Badge color="gray">{{ offer.secteur?.nom || offer.sector }}</Badge>
            <Badge v-if="isExpired" color="red">
              <Icon name="Clock" :size="14" />
              Expiré
            </Badge>
          </div>

          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {{ offer.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span class="flex items-center gap-1.5">
              <Icon name="Building2" :size="16" class="text-theme" />
              <strong>{{ offer.creatorName }}</strong>
            </span>
            <span class="flex items-center gap-1.5">
              <Icon name="Calendar" :size="16" class="text-gray-400" />
              {{ formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: fr }) }}
            </span>
            <span class="flex items-center gap-1.5">
              <Icon name="Eye" :size="16" class="text-gray-400" />
              {{ offer.views || 0 }} vues
            </span>
          </div>

          <!-- Deadline Banner -->
          <div
            v-if="offer.deadline"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium',
              isExpired
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200',
            ]"
          >
            <Icon name="CalendarX" v-if="isExpired" :size="18" />
            <Icon name="CalendarClock" v-else :size="18" />
            <span>
              {{ isExpired ? 'Expiré le' : 'Date limite :' }}
              <strong>{{ formatDate(offer.deadline) }}</strong>
            </span>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex lg:flex-col gap-3">
          <!-- Actions pour startuppers -->
          <Button
            v-if="user?.role === 'startuper' && !isExpired"
            size="lg"
            @click="showApplicationForm = true"
            :disabled="hasApplied"
            class="flex-1 lg:flex-initial"
          >
            <Icon
              :name="hasApplied ? 'CheckCircle' : 'Send'"
              :size="18"
              :class="hasApplied ? 'text-green-400' : ''"
            />
            {{ hasApplied ? 'Déjà candidaté' : 'Candidater' }}
          </Button>

          <!-- Voir formulaire pour le partner créateur -->
          <Button
            v-if="canManageOffer"
            size="lg"
            variant="outline"
            @click="handleViewForm"
            class="flex-1 lg:flex-initial"
          >
            <Icon name="Eye" :size="18" />
            Voir le formulaire
          </Button>

          <Button
            v-if="user?.role === 'startuper'"
            variant="outline"
            @click="handleSaveToggle"
            size="lg"
          >
            <Icon
              :name="isSaved ? 'Heart' : 'Bookmark'"
              :size="18"
              :class="isSaved ? 'fill-current text-red-500' : ''"
            />
            <span class="hidden sm:inline">{{ isSaved ? 'Sauvegardé' : 'Sauvegarder' }}</span>
          </Button>

          <!-- Actions pour partner/admin -->
          <Button
            v-if="(user?.role === 'partner' || user?.role === 'admin') && canManageOffer"
            size="lg"
            @click="handleEditOffer"
            class="flex-1 lg:flex-initial"
          >
            <Icon name="Edit" :size="18" />
            <span class="hidden sm:inline">Modifier l'offre</span>
          </Button>

          <Button
            v-if="(user?.role === 'partner' || user?.role === 'admin') && canManageOffer"
            variant="outline"
            color="red"
            size="lg"
            @click="showDeleteModal = true"
          >
            <Icon name="Trash2" :size="18" />
            <span class="hidden sm:inline">Supprimer</span>
          </Button>

          <Button variant="outline" size="lg">
            <Icon name="Share2" :size="18" />
            <span class="hidden sm:inline">Partager</span>
          </Button>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Images Gallery -->
        <Card v-if="offer.images && offer.images.length > 0" class="p-0 overflow-hidden">
          <div class="grid grid-cols-2 gap-2 p-4">
            <img
              v-for="(image, index) in offer.images"
              :key="index"
              :src="image"
              :alt="`Image ${index + 1}`"
              class="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
              @error="handleImageError"
              @click="openImageModal(image)"
            />
          </div>
        </Card>

        <!-- Description -->
        <Card>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="FileText" class="text-theme" />
            Description
          </h2>
          <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {{ offer.description }}
          </div>
        </Card>

        <!-- Requirements -->
        <Card v-if="offer.requirements">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="CheckCircle" class="text-green-600" />
            Critères d'éligibilité
          </h2>
          <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {{ offer.requirements }}
          </div>
        </Card>

        <!-- Benefits -->
        <Card v-if="offer.benefits">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Gift" class="text-purple-600" />
            Avantages offerts
          </h2>
          <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {{ offer.benefits }}
          </div>
        </Card>

        <!-- Form Management (Partner/Admin Only) -->
        <Card v-if="(user?.role === 'partner' || user?.role === 'admin') && canManageOffer" class="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold flex items-center gap-2">
                <Icon name="FileText" class="text-indigo-600" />
                Formulaire de candidature
              </h2>
              <p class="text-sm text-gray-600 mt-1">Gérez le formulaire associé à cette offre</p>
            </div>
            <Badge :color="offer.formId ? 'green' : 'gray'">
              {{ offer.formId ? 'Formulaire personnalisé' : 'Formulaire par défaut' }}
            </Badge>
          </div>

          <div v-if="linkedFormData" class="space-y-4">
            <div class="bg-white rounded-lg p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-900">{{ linkedFormData.name }}</p>
                  <p class="text-sm text-gray-600">{{ linkedFormData.description || 'Aucune description' }}</p>
                </div>
                <Badge color="blue">
                  {{ linkedFormData.fields?.length || 0 }} champ{{ (linkedFormData.fields?.length || 0) > 1 ? 's' : '' }}
                </Badge>
              </div>

              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Icon name="User" :size="14" />
                <span>Créé par {{ linkedFormData.creatorName || 'Système' }}</span>
                <span>•</span>
                <Icon name="Calendar" :size="14" />
                <span>{{ formatDate(linkedFormData.created_at) }}</span>
              </div>

              <div class="pt-3 border-t border-gray-200 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  @click="handleViewForm"
                  class="flex-1"
                >
                  <Icon name="Eye" :size="16" />
                  Voir le formulaire
                </Button>
                <Button
                  size="sm"
                  @click="handleEditForm"
                  class="flex-1"
                >
                  <Icon name="Edit" :size="16" />
                  Modifier le formulaire
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg p-4 text-center">
            <Icon name="AlertCircle" :size="32" class="mx-auto text-gray-400 mb-2" />
            <p class="text-gray-600 text-sm">Formulaire par défaut utilisé</p>
            <Button size="sm" variant="outline" class="mt-3" @click="handleViewForm">
              <Icon name="Eye" :size="16" />
              Voir le formulaire par défaut
            </Button>
          </div>
        </Card>

        <!-- Application Form Modal -->
        <div v-if="showApplicationForm && !hasApplied" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="showApplicationForm = false">
          <Card class="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold flex items-center gap-2">
                <Icon name="Send" class="text-theme" />
                Candidater à cette offre
              </h2>
              <button
                @click="showApplicationForm = false"
                class="text-gray-400 hover:text-gray-600 transition"
              >
                <Icon name="X" :size="24" />
              </button>
            </div>

          <form @submit.prevent="handleSubmitApplication" class="space-y-6">
            <!-- Dynamic Form Fields -->
            <div v-if="formFields.length > 0" class="space-y-5">
              <div v-for="field in formFields" :key="field.id" class="space-y-2">
                <!-- Text Input -->
                <Input
                  v-if="field.field_type === 'text'"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- Email Input -->
                <Input
                  v-else-if="field.field_type === 'email'"
                  type="email"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- Tel Input -->
                <Input
                  v-else-if="field.field_type === 'tel'"
                  type="tel"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- Number Input -->
                <Input
                  v-else-if="field.field_type === 'number'"
                  type="number"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- URL Input -->
                <Input
                  v-else-if="field.field_type === 'url'"
                  type="url"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- Date Input -->
                <Input
                  v-else-if="field.field_type === 'date'"
                  type="date"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                />

                <!-- Textarea -->
                <Textarea
                  v-else-if="field.field_type === 'textarea'"
                  :label="field.label + (field.is_required ? ' *' : '')"
                  :placeholder="field.placeholder || ''"
                  v-model="applicationForm[`field_${field.id}`]"
                  :required="field.is_required"
                  :rows="4"
                />

                <!-- Select -->
                <div v-else-if="field.field_type === 'select'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-900">
                    {{ field.label }}{{ field.is_required ? ' *' : '' }}
                  </label>
                  <select
                    v-model="applicationForm[`field_${field.id}`]"
                    :required="field.is_required"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option
                      v-for="option in parseOptions(field.options)"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>

                <!-- Checkbox -->
                <div
                  v-else-if="field.field_type === 'checkbox'"
                  class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    :id="`field_${field.id}`"
                    v-model="applicationForm[`field_${field.id}`]"
                    :required="field.is_required"
                    class="w-4 h-4 text-theme focus:ring-theme border-gray-300 rounded"
                  />
                  <label :for="`field_${field.id}`" class="text-sm font-medium text-gray-900">
                    {{ field.label }}{{ field.is_required ? ' *' : '' }}
                  </label>
                </div>

                <!-- Radio -->
                <div v-else-if="field.field_type === 'radio'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-900">
                    {{ field.label }}{{ field.is_required ? ' *' : '' }}
                  </label>
                  <div class="space-y-2">
                    <div
                      v-for="option in parseOptions(field.options)"
                      :key="option"
                      class="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        :name="`field_${field.id}`"
                        :value="option"
                        v-model="applicationForm[`field_${field.id}`]"
                        :required="field.is_required"
                        class="w-4 h-4 text-theme focus:ring-theme"
                      />
                      <label class="text-sm text-gray-700">{{ option }}</label>
                    </div>
                  </div>
                </div>

                <!-- File Upload -->
                <div v-else-if="field.field_type === 'file'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-900">
                    {{ field.label }}{{ field.is_required ? ' *' : '' }}
                  </label>
                  <input
                    type="file"
                    @change="handleFileUpload($event, field.id)"
                    :required="field.is_required"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-theme-100 file:text-theme-700 hover:file:bg-theme-200"
                  />
                  <p v-if="field.placeholder" class="text-xs text-gray-500">
                    {{ field.placeholder }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Fallback: No form configured -->
            <div v-else class="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <Icon name="AlertTriangle" :size="32" class="mx-auto text-amber-600 mb-2" />
              <p class="text-amber-800 font-medium">
                Aucun formulaire de candidature n'est configuré pour cette offre
              </p>
              <p class="text-sm text-amber-600 mt-1">
                Veuillez contacter l'organisateur directement
              </p>
            </div>

            <!-- Seat Selection for Events -->
            <div
              v-if="offer.type === 'event' && offer.hasCapacityLimit"
              class="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
            >
              <label class="block text-sm font-medium text-gray-900 mb-2">
                <Icon name="Users" :size="16" class="inline mr-1" />
                Nombre de places souhaitées *
              </label>
              <select
                v-model="applicationForm.requestedSeats"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                required
              >
                <option v-for="num in maxSeats" :key="num" :value="num">
                  {{ num }} place{{ num > 1 ? 's' : '' }}
                </option>
              </select>
              <p class="text-xs text-blue-700 mt-2 flex items-center gap-1">
                <Icon name="Info" :size="14" />
                Maximum {{ offer.maxSeatsPerStartup }} place{{
                  offer.maxSeatsPerStartup > 1 ? 's' : ''
                }}
                par startup
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <Button
                type="submit"

                size="lg"
                class="flex-1"
              >
                <LoadingSpinner v-if="submitting" size="sm" />
                <template v-else>
                  <Icon name="Send" :size="18" />
                  Envoyer ma candidature
                </template>
              </Button>
              <Button type="button" variant="outline" size="lg" @click="showApplicationForm = false">
                <Icon name="X" :size="18" />
                Annuler
              </Button>
            </div>
          </form>
          </Card>
        </div>

        <!-- Already Applied Banner -->
        <Card v-if="hasApplied" class="bg-green-50 border-2 border-green-200">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" :size="24" class="text-green-600" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-green-900">Candidature envoyée</h3>
              <p class="text-sm text-green-700">
                Votre candidature a bien été reçue. Statut :
                <strong>{{ existingApplicationStatus || 'En attente' }}</strong>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Contact Info -->
        <Card class="bg-gradient-to-br from-theme-50 to-blue-50">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Mail" class="text-theme" />
            Contact
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Icon name="Mail" :size="16" class="text-gray-400" />
              <a :href="`mailto:${offer.contactEmail}`" class="text-theme hover:underline">
                {{ offer.contactEmail }}
              </a>
            </div>
            <div v-if="offer.contactPhone" class="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Icon name="Phone" :size="16" class="text-gray-400" />
              <a :href="`tel:${offer.contactPhone}`" class="text-gray-700">
                {{ offer.contactPhone }}
              </a>
            </div>
          </div>
        </Card>

        <!-- Quick Info -->
        <Card>
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Info" class="text-theme" />
            Informations
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
              <Icon name="Building2" :size="18" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500 text-xs">Organisateur</p>
                <p class="font-semibold text-gray-900">{{ offer.creatorName }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
              <Icon name="Briefcase" :size="18" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500 text-xs">Secteur</p>
                <p class="font-semibold text-gray-900">{{ offer.secteur?.nom || offer.sector }}</p>
              </div>
            </div>

            <div v-if="offer.location" class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
              <Icon name="MapPin" :size="18" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500 text-xs">Localisation</p>
                <p class="font-semibold text-gray-900">{{ offer.location }}</p>
              </div>
            </div>

            <div v-if="offer.targetAudience" class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
              <Icon name="Target" :size="18" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500 text-xs">Public cible</p>
                <p class="font-semibold text-gray-900">{{ offer.targetAudience }}</p>
              </div>
            </div>

            <div v-if="offer.budget" class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
              <Icon name="DollarSign" :size="18" class="text-gray-400 mt-0.5" />
              <div>
                <p class="text-gray-500 text-xs">Budget</p>
                <p class="font-semibold text-gray-900">{{ offer.budget }}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Stats -->
        <Card class="bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 class="font-bold text-lg mb-4">Statistiques</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-white rounded-lg">
              <p class="text-3xl font-bold text-theme">{{ offer.views || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">Vues</p>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <p class="text-3xl font-bold text-green-600">{{ offer.applications || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">Candidatures</p>
            </div>
          </div>
        </Card>

        <!-- Capacity Info for Events -->
        <Card v-if="offer.type === 'event' && offer.hasCapacityLimit" class="bg-blue-50 border-blue-200">
          <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
            <Icon name="Users" class="text-blue-600" />
            Places disponibles
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Capacité totale</span>
              <strong>{{ offer.maxCapacity }} places</strong>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Maximum par startup</span>
              <strong>{{ offer.maxSeatsPerStartup }} places</strong>
            </div>
            <div class="mt-3 pt-3 border-t border-blue-200">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Disponibles</span>
                <span class="text-2xl font-bold text-blue-600">
                  {{ Math.max(0, offer.maxCapacity - (offer.bookedSeats || 0)) }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="showDeleteModal = false">
      <Card class="max-w-md w-full mx-4">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="AlertTriangle" :size="32" class="text-red-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
          <p class="text-gray-600">
            Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible et supprimera également toutes les candidatures associées.
          </p>
          <div class="flex gap-3 pt-4">
            <Button
              variant="outline"
              @click="showDeleteModal = false"
              class="flex-1"
              :disabled="deleting"
            >
              Annuler
            </Button>
            <Button
              color="red"
              @click="handleDeleteOffer"
              class="flex-1"
              :disabled="deleting"
            >
              <LoadingSpinner v-if="deleting" size="sm" />
              <template v-else>
                <Icon name="Trash2" :size="18" />
                Supprimer
              </template>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '@/composables/useAuth'
import { useOffersStore } from '@/stores/offersStore'
import { useApplicationsStore } from '@/stores/applicationsStore'
import offersApi from '@/services/offers'
import formApi from '@/services/form'
import { Card, Button, Input, Textarea, Alert, Icon, LoadingSpinner, Badge } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const offersStore = useOffersStore()
const applicationsStore = useApplicationsStore()

const offer = ref(null)
const loading = ref(true)
const error = ref(null)
const success = ref(false)
const submitting = ref(false)

const showApplicationForm = ref(false)
const isSaved = ref(false)
const hasApplied = ref(false)
const existingApplicationId = ref(null)
const existingApplicationStatus = ref(null)
const applyInfo = ref(null)

const showDeleteModal = ref(false)
const deleting = ref(false)
const linkedFormData = ref(null)

const formFields = ref([])
const applicationForm = reactive({
  requestedSeats: 1,
})
const uploadedFiles = ref({})

const isExpired = computed(() => {
  if (!offer.value?.deadline) return false
  return new Date(offer.value.deadline) < new Date()
})

const maxSeats = computed(() => {
  if (!offer.value?.hasCapacityLimit) return []
  const max = Math.min(
    offer.value.maxSeatsPerStartup || 1,
    Math.max(0, (offer.value.maxCapacity || 0) - (offer.value.bookedSeats || 0))
  )
  return Array.from({ length: max }, (_, i) => i + 1)
})

const canSubmit = computed(() => {
  // Attendre que le chargement soit terminé
  if (loading.value) return false

  // Si pas de champs chargés (formulaire externe ou erreur), permettre la soumission
  // MAIS seulement si ce n'est pas un formulaire interne par défaut ou personnalisé
  if (formFields.value.length === 0) {
    // Si c'est une offre avec external_form_url, on ne devrait pas être ici
    // Si c'est un formulaire interne, il devrait avoir des champs
    // Donc on ne permet pas la soumission
    console.warn('Aucun champ de formulaire chargé, soumission désactivée')
    return false
  }

  // Vérifier les champs requis (supporter both required et is_required)
  const allRequiredFieldsFilled = formFields.value.every((field) => {
    const isRequired = field.is_required || field.required
    if (!isRequired) return true

    // Pour les champs de type fichier, vérifier dans uploadedFiles
    if (field.field_type === 'file') {
      const fileKey = `field_${field.id}`
      const hasFile = uploadedFiles.value[fileKey] !== undefined && uploadedFiles.value[fileKey] !== null
      if (!hasFile && isRequired) {
        console.log(`Champ fichier requis manquant: ${field.label}`)
      }
      return hasFile
    }

    // Pour les autres champs, vérifier la valeur
    const value = applicationForm[`field_${field.id}`]
    const hasValue = value !== undefined && value !== null && value !== ''
    if (!hasValue && isRequired) {
      console.log(`Champ requis manquant: ${field.label}`)
    }
    return hasValue
  })

  return allRequiredFieldsFilled
})

const canManageOffer = computed(() => {
  if (!offer.value || !user.value) return false
  // Admin peut tout gérer
  if (user.value.role === 'admin') return true
  // Partner peut gérer ses propres offres (vérifier les 2 variantes possibles du role)
  if (user.value.role === 'partner' || user.value.role === 'partenaire') {
    return offer.value.created_by === user.value.id ||
           offer.value.createdBy === user.value.id ||
           offer.value.publisher_id === user.value.id
  }
  return false
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const parseOptions = (options) => {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try {
      return JSON.parse(options)
    } catch {
      return options.split(',').map((o) => o.trim())
    }
  }
  return []
}

const handleFileUpload = (event, fieldId) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFiles.value[`field_${fieldId}`] = file
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const openImageModal = (image) => {
  // TODO: Implémenter une modal pour afficher l'image en grand
  window.open(image, '_blank')
}

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const offerId = route.params.id
    const response = await offersStore.get(offerId)
    const offerData = response.data || response

    offer.value = {
      ...offerData,
      creatorName: offerData.publisher?.name || offerData.creatorName || 'Inconnu',
      sector: offerData.secteur?.nom || offerData.sector,
      createdAt: offerData.created_at ? new Date(offerData.created_at).getTime() : Date.now(),
      deadline: offerData.deadline ? new Date(offerData.deadline).getTime() : null,
      type: offerData.type || 'offer',
      is_expired: offerData.is_expired,
      images: offerData.images || [],
      hasCapacityLimit: offerData.has_capacity_limit || offerData.hasCapacityLimit,
      maxCapacity: offerData.max_capacity || offerData.maxCapacity,
      maxSeatsPerStartup: offerData.max_seats_per_startup || offerData.maxSeatsPerStartup,
      externalFormUrl: offerData.external_form_url || offerData.externalFormUrl,
      contactEmail: offerData.contact_email || offerData.contactEmail,
      contactPhone: offerData.contact_phone || offerData.contactPhone,
      formId: offerData.form_id,
      publisher_id: offerData.publisher_id || offerData.publisher?.id,
      created_by: offerData.created_by || offerData.publisher_id || offerData.publisher?.id,
    }

    console.log('🔍 DEBUG - Offer Data:', {
      offerId: offer.value.id,
      formId: offer.value.formId,
      publisher_id: offer.value.publisher_id,
      created_by: offer.value.created_by,
      currentUserId: user.value?.id,
      currentUserRole: user.value?.role,
      canManage: canManageOffer.value
    })

    // Charger le formulaire lié à l'offre
    console.log('📋 Chargement formulaire - formId:', offer.value.formId)

    if (offer.value.formId) {
      // Charger le formulaire personnalisé
      console.log('✅ Chargement formulaire personnalisé ID:', offer.value.formId)
      try {
        const formResponse = await formApi.get(offer.value.formId)
        const formData = formResponse.data?.data || formResponse.data
        formFields.value = formData.fields || []
        console.log('Formulaire personnalisé chargé:', formData.name, '- Champs:', formFields.value.length)
      } catch (err) {
        console.error('Erreur chargement formulaire personnalisé:', err)
        formFields.value = []
      }
    } else {
      // Pas de form_id => utiliser le formulaire par défaut
      console.log('Chargement formulaire par défaut (form_id = null)')
      try {
        const defaultFormResponse = await formApi.getDefault()
        const defaultFormData = defaultFormResponse.data?.data || defaultFormResponse.data
        formFields.value = defaultFormData.fields || []
        console.log('Formulaire par défaut chargé - Champs:', formFields.value.length)
      } catch (err) {
        console.error('Erreur chargement formulaire par défaut:', err)
        formFields.value = []
      }
    }

    // Charger les informations complètes du formulaire pour partner/admin
    if ((user.value?.role === 'partner' || user.value?.role === 'admin') && offer.value.formId) {
      try {
        const formResponse = await formApi.get(offer.value.formId)
        const formData = formResponse.data?.data || formResponse.data
        linkedFormData.value = {
          ...formData,
          creatorName: formData.creator?.name || formData.creatorName,
        }
      } catch (err) {
        console.warn('Erreur chargement données formulaire:', err)
      }
    }

    // Charger les informations de candidature si utilisateur connecté
    if (user.value?.role === 'startuper') {
      try {
        // Vérifier si l'offre est sauvegardée
        const savedData = await offersStore.saved()
        isSaved.value = savedData.some((o) => o.id === parseInt(offerId))

        // Vérifier le statut de candidature
        const applyInfoData = await applicationsStore.getApplyInfo(offerId)
        applyInfo.value = applyInfoData
        hasApplied.value = applyInfoData.already_applied || false
        existingApplicationId.value = applyInfoData.existing_application_id || null
        existingApplicationStatus.value = applyInfoData.existing_application_status || null
      } catch (err) {
        console.warn('Erreur chargement statut:', err)
      }
    }
  } catch (err) {
    console.error('Error loading offer:', err)
    error.value = "Erreur lors du chargement de l'offre"
  } finally {
    loading.value = false
  }
}

const handleSaveToggle = async () => {
  try {
    await offersApi.toggleSave(route.params.id, isSaved.value)
    isSaved.value = !isSaved.value
  } catch (err) {
    console.error('Error toggling save:', err)
  }
}

const handleSubmitApplication = async () => {
  submitting.value = true
  error.value = null

  try {
    const formDataToSend = new FormData()

    // Ajouter les réponses des champs dynamiques (en tant que tableau, pas JSON stringifié)
    formFields.value.forEach((field) => {
      const value = applicationForm[`field_${field.id}`]
      if (value !== undefined && value !== null && value !== '') {
        // Envoyer chaque réponse individuellement avec le format responses[field_id]
        formDataToSend.append(`responses[${field.id}]`, value)
      }
    })

    // Ajouter les fichiers
    Object.entries(uploadedFiles.value).forEach(([key, file]) => {
      const fieldId = key.replace('field_', '')
      formDataToSend.append(`files[${fieldId}]`, file)
    })

    // Ajouter les places pour les événements
    if (offer.value.type === 'event' && offer.value.hasCapacityLimit) {
      formDataToSend.append('requested_seats', applicationForm.requestedSeats)
    }

    await applicationsStore.apply(route.params.id, formDataToSend)

    success.value = true
    hasApplied.value = true
    showApplicationForm.value = false

    // Recharger les données après un court délai
    setTimeout(() => {
      loadData()
    }, 1000)
  } catch (err) {
    console.error('Error submitting application:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la soumission de la candidature'
  } finally {
    submitting.value = false
  }
}

const handleEditOffer = () => {
  router.push(`/offers/${route.params.id}/edit`)
}

const handleDeleteOffer = async () => {
  deleting.value = true
  error.value = null

  try {
    await offersApi.delete(route.params.id)
    showDeleteModal.value = false
    router.push({ path: '/offers', query: { deleted: 'success' } })
  } catch (err) {
    console.error('Error deleting offer:', err)
    error.value = err.response?.data?.message || "Erreur lors de la suppression de l'offre"
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

const handleViewForm = () => {
  const formId = offer.value.formId || 'default'
  router.push(`/partner/forms/${formId}`)
}

const handleEditForm = () => {
  if (!offer.value.formId) {
    error.value = 'Impossible de modifier le formulaire par défaut. Créez un formulaire personnalisé.'
    return
  }
  router.push(`/partner/forms/${offer.value.formId}/edit`)
}

onMounted(loadData)
</script>
