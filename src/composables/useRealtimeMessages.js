import { ref, onUnmounted } from 'vue';
import supabase from '@/services/supabase';

/**
 * Composable pour gérer les messages en temps réel via Supabase
 * Utilisé pour les conversations 1:1 et les groupes
 */
export function useRealtimeMessages() {
  const subscriptions = ref([]);

  /**
   * S'abonner aux nouveaux messages d'une conversation 1:1
   * @param {number} conversationId - ID de la conversation (ou userId en format conversation)
   * @param {Function} onNewMessage - Callback appelé quand un nouveau message arrive
   */
  function subscribeToConversation(conversationId, onNewMessage) {
    const subscription = supabase.subscribeToMessages(conversationId, (payload) => {
      console.log('Realtime payload received:', payload);

      // Le payload Supabase a cette structure: { eventType, new, old }
      const eventType = payload.eventType || payload.event_type;

      if (eventType === 'INSERT') {
        console.log('New message inserted:', payload.new);
        onNewMessage(payload.new);
      } else if (eventType === 'UPDATE') {
        console.log('Message updated:', payload.new);
        onNewMessage(payload.new, 'update');
      } else if (eventType === 'DELETE') {
        console.log('Message deleted:', payload.old);
        onNewMessage(payload.old, 'delete');
      }
    });

    subscriptions.value.push(subscription);
    return subscription;
  }

  /**
   * S'abonner aux messages d'un groupe en temps réel
   * @param {number} groupId - ID du groupe
   * @param {Function} onNewMessage - Callback appelé quand un nouveau message arrive
   */
  function subscribeToGroup(groupId, onNewMessage) {
    const subscription = supabase.subscribeToGroupMessages(groupId, (payload) => {
      console.log('Realtime group payload received:', payload);

      const eventType = payload.eventType || payload.event_type;

      if (eventType === 'INSERT') {
        console.log('New group message inserted:', payload.new);
        onNewMessage(payload.new);
      } else if (eventType === 'UPDATE') {
        console.log('Group message updated:', payload.new);
        onNewMessage(payload.new, 'update');
      } else if (eventType === 'DELETE') {
        console.log('Group message deleted:', payload.old);
        onNewMessage(payload.old, 'delete');
      }
    });

    subscriptions.value.push(subscription);
    return subscription;
  }

  /**
   * Se désabonner d'un channel spécifique
   */
  function unsubscribe(subscription) {
    supabase.unsubscribe(subscription);
    const index = subscriptions.value.indexOf(subscription);
    if (index > -1) {
      subscriptions.value.splice(index, 1);
    }
  }

  /**
   * Se désabonner de tous les channels
   */
  function unsubscribeAll() {
    subscriptions.value.forEach(sub => {
      supabase.unsubscribe(sub);
    });
    subscriptions.value = [];
  }

  // Cleanup automatique quand le composant est détruit
  onUnmounted(() => {
    unsubscribeAll();
  });

  return {
    subscribeToConversation,
    subscribeToGroup,
    unsubscribe,
    unsubscribeAll,
    subscriptions,
  };
}
