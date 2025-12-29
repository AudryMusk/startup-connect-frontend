import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import eventsApi from '@/services/events';
import { useCache } from '@/utils/cache';

export const useEventsStore = defineStore('events', () => {
  // State
  const events = ref([]);
  const savedEvents = ref([]);
  const myEvents = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Cache avec TTL de 3 minutes
  const eventsCache = useCache('events', 180000);
  const myEventsCache = useCache('myEvents', 180000);

  // Getters
  const upcomingEvents = computed(() => {
    const now = Date.now();
    return events.value.filter(e => {
      const eventDate = e.event_date ? new Date(e.event_date).getTime() : e.created_at;
      return eventDate > now;
    });
  });

  const pastEvents = computed(() => {
    const now = Date.now();
    return events.value.filter(e => {
      const eventDate = e.event_date ? new Date(e.event_date).getTime() : e.created_at;
      return eventDate <= now;
    });
  });

  // Actions
  async function fetchEvents(params = {}, forceRefresh = false) {
    const cacheKey = `list_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = eventsCache.get(cacheKey);
      if (cached) {
        events.value = cached;
        return cached;
      }
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await eventsApi.list(params);
      const data = response.data?.data || response.data || [];
      events.value = Array.isArray(data) ? data : [];
      eventsCache.set(cacheKey, events.value);
      return events.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des événements';
      console.error('Error fetching events:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEvent(id, forceRefresh = false) {
    const cacheKey = `event_${id}`;

    if (!forceRefresh) {
      const cached = eventsCache.get(cacheKey);
      if (cached) return cached;

      // Chercher dans la liste locale
      const local = events.value.find(e => e.id === id);
      if (local) return local;
    }

    try {
      const response = await eventsApi.get(id);
      const event = response.data?.data || response.data;
      eventsCache.set(cacheKey, event);
      return event;
    } catch (err) {
      console.error('Error fetching event:', err);
      throw err;
    }
  }

  async function fetchMyEvents(params = {}, forceRefresh = false) {
    const cacheKey = 'my_events';

    if (!forceRefresh) {
      const cached = myEventsCache.get(cacheKey);
      if (cached) {
        myEvents.value = cached;
        return cached;
      }
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await eventsApi.myEvents(params);
      const data = response.data?.data || response.data || [];
      myEvents.value = Array.isArray(data) ? data : [];
      myEventsCache.set(cacheKey, myEvents.value);
      return myEvents.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de vos événements';
      console.error('Error fetching my events:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(eventData, images = []) {
    loading.value = true;
    error.value = null;

    try {
      let response;

      if (images.length > 0) {
        const formData = new FormData();

        // Ajouter les données textuelles avec conversion appropriée
        // Exclure 'images' car on le gère séparément
        Object.entries(eventData).forEach(([key, value]) => {
          // Skip 'images' - on le gère en dehors de cette boucle
          if (key === 'images' || key === 'image') {
            return;
          }
          
          if (value === null || value === undefined || value === '') {
            return; // Skip null/undefined/empty values
          }
          
          // Convertir les booléens en 1/0 pour FormData
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value);
          }
        });

        // Ajouter l'image (une seule pour les événements) avec le bon nom de champ
        if (images[0]) {
          formData.append('image', images[0]);
        }

        response = await eventsApi.createWithImages(formData);
      } else {
        response = await eventsApi.create(eventData);
      }

      const newEvent = response.data?.data || response.data;

      // Invalider le cache
      eventsCache.invalidate('list_');
      myEventsCache.invalidate('my_events');

      // Ajouter à la liste locale
      if (newEvent) {
        events.value.unshift(newEvent);
      }

      return newEvent;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'événement';
      console.error('Error creating event:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateEvent(id, eventData, images = []) {
    loading.value = true;
    error.value = null;

    try {
      let response;

      if (images.length > 0) {
        const formData = new FormData();

        // Ajouter les données textuelles avec conversion appropriée
        // Exclure 'images' car on le gère séparément
        Object.entries(eventData).forEach(([key, value]) => {
          // Skip 'images' - on le gère en dehors de cette boucle
          if (key === 'images' || key === 'image') {
            return;
          }
          
          if (value === null || value === undefined || value === '') {
            return; // Skip null/undefined/empty values
          }
          
          // Convertir les booléens en 1/0 pour FormData
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value);
          }
        });

        // Ajouter l'image (une seule pour les événements) avec le bon nom de champ
        if (images[0]) {
          formData.append('image', images[0]);
        }

        response = await eventsApi.updateWithImages(id, formData);
      } else {
        response = await eventsApi.update(id, eventData);
      }

      const updatedEvent = response.data?.data || response.data;

      // Invalider le cache
      eventsCache.invalidate(`event_${id}`);
      eventsCache.invalidate('list_');
      myEventsCache.invalidate('my_events');

      // Mettre à jour localement
      const index = events.value.findIndex(e => e.id === id);
      if (index !== -1 && updatedEvent) {
        events.value[index] = updatedEvent;
      }

      return updatedEvent;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
      console.error('Error updating event:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteEvent(id) {
    try {
      await eventsApi.delete(id);

      // Invalider le cache
      eventsCache.invalidate(`event_${id}`);
      eventsCache.invalidate('list_');
      myEventsCache.invalidate('my_events');

      // Supprimer localement
      events.value = events.value.filter(e => e.id !== id);
      myEvents.value = myEvents.value.filter(e => e.id !== id);

      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  }

  async function reserveEvent(eventId, payload = {}) {
    try {
      const response = await eventsApi.reserve(eventId, payload);
      const reservation = response.data?.data || response.data;

      // Invalider le cache de l'événement
      eventsCache.invalidate(`event_${eventId}`);

      return reservation;
    } catch (err) {
      console.error('Error reserving event:', err);
      throw err;
    }
  }

  async function cancelReservation(eventId, reservationId) {
    try {
      await eventsApi.cancelReservation(eventId, reservationId);

      // Invalider le cache
      eventsCache.invalidate(`event_${eventId}`);

      return true;
    } catch (err) {
      console.error('Error canceling reservation:', err);
      throw err;
    }
  }

  async function getReservations(eventId) {
    try {
      const response = await eventsApi.getReservations(eventId);
      return response.data?.data || response.data || [];
    } catch (err) {
      console.error('Error fetching reservations:', err);
      throw err;
    }
  }

  // Gestion des événements sauvegardés (côté client)
  function toggleSavedEvent(eventId) {
    if (savedEvents.value.includes(eventId)) {
      savedEvents.value = savedEvents.value.filter(id => id !== eventId);
    } else {
      savedEvents.value.push(eventId);
    }
  }

  function isSaved(eventId) {
    return savedEvents.value.includes(eventId);
  }

  function clearCache() {
    eventsCache.invalidate();
    myEventsCache.invalidate();
    events.value = [];
    myEvents.value = [];
  }

  return {
    // State
    events,
    savedEvents,
    myEvents,
    loading,
    error,
    // Getters
    upcomingEvents,
    pastEvents,
    // Actions
    fetchEvents,
    fetchEvent,
    fetchMyEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    reserveEvent,
    cancelReservation,
    getReservations,
    toggleSavedEvent,
    isSaved,
    clearCache,
  };
});
