import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase pour base de données temps réel et authentification
 * Utilisé pour:
 * - Messaging Realtime (conversations, messages en temps réel)
 * - Groups Realtime (messages de groupe, notifications)
 * - Notifications Realtime (notifications en temps réel)
 * - File Storage (avatars, documents, images)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Export le client pour usage direct
export { supabase };

export default {
  /**
   * Récupérer le client Supabase
   */
  getClient() {
    return supabase;
  },

  /**
   * S'abonner aux messages d'une conversation en temps réel
   * Pour conversations 1:1, on écoute TOUS les messages de la table
   * car on ne peut pas filtrer sur "sender_id OU receiver_id"
   * Le callback doit filtrer localement les messages pertinents
   * @param {number} userId - User ID de l'interlocuteur
   * @param {Function} callback - Callback quand nouveau message
   * @returns {Object} - Retourne subscription pour se désabonner
   */
  subscribeToMessages(userId, callback) {
    const channel = supabase
      .channel(`messages:${userId}:${Date.now()}`) // Unique channel name
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        console.log('🔔 Realtime event received:', payload.eventType, payload);
        callback(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Messages channel SUBSCRIBED for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Messages channel ERROR for user ${userId}`);
        } else {
          console.log(`📡 Messages channel status for user ${userId}:`, status);
        }
      });

    console.log(`🎯 Subscribing to messages channel for user ${userId}`);
    return channel;
  },

  /**
   * S'abonner aux messages d'un groupe en temps réel
   * @param {number} groupId - Group ID
   * @param {Function} callback - Callback quand nouveau message
   * @returns {Object} - Retourne subscription pour se désabonner
   */
  subscribeToGroupMessages(groupId, callback) {
    return supabase
      .channel(`group-messages:${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`,
      }, callback)
      .subscribe();
  },

  /**
   * S'abonner aux notifications en temps réel
   * @param {number} userId - User ID
   * @param {Function} callback - Callback quand nouvelle notification
   * @returns {Object} - Retourne subscription pour se désabonner
   */
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();
  },

  /**
   * Se désabonner d'un channel
   * @param {Object} subscription - Subscription object retourné par subscribe()
   */
  unsubscribe(subscription) {
    return supabase.removeChannel(subscription);
  },

  /**
   * Uploader un fichier vers le storage
   * @param {string} bucket - Nom du bucket (avatars, documents, images, etc.)
   * @param {string} filePath - Chemin du fichier dans le bucket
   * @param {File} file - File object à uploader
   */
  uploadFile(bucket, filePath, file) {
    return supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });
  },

  /**
   * Obtenir une URL publique pour un fichier
   * @param {string} bucket - Nom du bucket
   * @param {string} filePath - Chemin du fichier
   */
  getPublicUrl(bucket, filePath) {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
  },

  /**
   * Supprimer un fichier du storage
   * @param {string} bucket - Nom du bucket
   * @param {string} filePath - Chemin du fichier
   */
  deleteFile(bucket, filePath) {
    return supabase.storage
      .from(bucket)
      .remove([filePath]);
  },

  /**
   * Exécuter une requête RPC (Remote Procedure Call) personnalisée
   * @param {string} functionName - Nom de la fonction RPC
   * @param {Object} params - Paramètres de la fonction
   */
  callFunction(functionName, params = {}) {
    return supabase.rpc(functionName, params);
  },
};
