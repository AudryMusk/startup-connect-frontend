import { defineStore } from 'pinia';
import { ref } from 'vue';
import notificationsApi from '@/services/notifications.js';
import { useAuthStore } from '@/stores/authStore';
import { useCache } from '@/utils/cache';

export const useNotificationsStore = defineStore('notifications', () => {
    const items = ref([]);
    const unreadCount = ref(0);
    const loading = ref(false);
    let pollingInterval = null;

    // Cache avec TTL de 30 secondes pour les notifications (plus court car temps réel)
    const notificationsCache = useCache('notifications', 30 * 1000);

    async function fetch(params = {}, forceRefresh = false) {
        // Ne pas charger si pas authentifié
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
            items.value = [];
            return;
        }

        // Vérifier le cache si pas de forceRefresh (sauf pour le polling)
        if (!forceRefresh && !pollingInterval) {
            const cached = notificationsCache.get(params);
            if (cached) {
                items.value = cached;
                return items.value;
            }
        }

        loading.value = true;
        try {
            const { data } = await notificationsApi.list(params);
            // Backend retourne {notifications: [...]}
            items.value = data.notifications || data.data || data || [];

            // Mettre en cache
            notificationsCache.set(params, items.value);

            return items.value;
        } catch (e) {
            // Silent fail on polling to avoid console spam
            console.warn('Failed to fetch notifications:', e.message);
            items.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchCount() {
        // Ne pas charger si pas authentifié
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
            unreadCount.value = 0;
            return;
        }

        try {
            const { data } = await notificationsApi.unread();
            // Backend retourne {unread_notifications: [...], count: X}
            unreadCount.value = data.count || 0;
        } catch (e) {
            // silent fail on polling
            console.warn('Failed to fetch notification count:', e.message);
            unreadCount.value = 0;
        }
    }

    async function markRead(id) {
        try {
            await notificationsApi.markAsRead(id);
            const item = items.value.find(i => i.id === id);
            if (item) {
                item.read_at = new Date().toISOString();
                unreadCount.value = Math.max(0, unreadCount.value - 1);
            }
            // Invalider le cache après modification
            notificationsCache.invalidate();
        } catch (e) {
            console.error('Failed to mark notification as read:', e);
            throw e;
        }
    }

    async function markAllRead() {
        try {
            await notificationsApi.markAllAsRead();
            items.value.forEach(i => i.read_at = new Date().toISOString());
            unreadCount.value = 0;
            // Invalider le cache après modification
            notificationsCache.invalidate();
        } catch (e) {
            console.error('Failed to mark all notifications as read:', e);
            throw e;
        }
    }

    async function deleteNotification(id) {
        try {
            // Vérifier si c'était non lue avant suppression
            const item = items.value.find(i => i.id === id);
            const wasUnread = item && !item.read_at;

            await notificationsApi.delete(id);
            items.value = items.value.filter(i => i.id !== id);

            // Si c'était non lue, décrémenter le compteur
            if (wasUnread) {
                unreadCount.value = Math.max(0, unreadCount.value - 1);
            }
            // Invalider le cache après modification
            notificationsCache.invalidate();
        } catch (e) {
            console.error('Failed to delete notification:', e);
            throw e;
        }
    }

    function startPolling(intervalMs = 300000) {
        if (pollingInterval) return;
        fetch({}, true); // initial fetch with forceRefresh
        fetchCount();
        pollingInterval = setInterval(() => {
            fetch({}, true); // forceRefresh lors du polling
            fetchCount();
        }, intervalMs);
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    /**
     * Ajouter une notification reçue en temps réel via Reverb
     * @param {Object} notification - La notification à ajouter
     */
    function addRealtimeNotification(notification) {
        // Éviter les doublons - vérifier par ID ou par contenu récent
        const exists = items.value.find(n =>
            n.id === notification.id ||
            (n.data?.message_id === notification.message_id &&
                Date.now() - new Date(n.created_at).getTime() < 5000)
        );

        if (!exists) {
            // Transformer la notification broadcast en format compatible avec le store
            const formattedNotification = {
                id: notification.id || `realtime_${Date.now()}`,
                type: notification.type || 'new_message',
                data: {
                    ...notification,
                    // S'assurer que les données importantes sont présentes
                    sender_id: notification.sender_id,
                    sender_name: notification.sender_name,
                    sender_photo: notification.sender_photo,
                    content_preview: notification.content_preview,
                    message_id: notification.message_id,
                    group_id: notification.group_id,
                    group_name: notification.group_name,
                    post_id: notification.post_id,
                    author_name: notification.author_name,
                    author_photo: notification.author_photo,
                    content_preview: notification.content_preview,
                },
                read_at: null,
                created_at: notification.created_at || new Date().toISOString(),
            };

            // Ajouter au début de la liste (plus récent en premier)
            items.value.unshift(formattedNotification);
            unreadCount.value++;

            console.log('[Notifications] ✨ Nouvelle notification temps réel:', formattedNotification);
        }
    }

    /**
     * Réinitialiser le store
     */
    function $reset() {
        stopPolling();
        items.value = [];
        unreadCount.value = 0;
        loading.value = false;
        notificationsCache.invalidate();
    }

    return {
        items,
        unreadCount,
        loading,
        fetch,
        fetchCount,
        markRead,
        markAllRead,
        deleteNotification,
        startPolling,
        stopPolling,
        addRealtimeNotification,
        $reset
    };
});
