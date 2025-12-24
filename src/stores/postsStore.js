
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import postsApi from '@/services/posts.js';
import { useCache } from '@/utils/cache';

export const usePostsStore = defineStore('posts', () => {
  const feed = ref([]);
  const currentPost = ref(null);
  const comments = ref({});
  const loading = ref(false);
  const error = ref(null);

  // Cache avec TTL de 2 minutes
  const postsCache = useCache('posts', 2 * 60 * 1000);

  // Getters
  const getPostById = computed(() => {
    return (id) => feed.value.find(p => p.id === id);
  });

  const getCommentsByPostId = computed(() => {
    return (postId) => comments.value[postId] || [];
  });

  // Charger les posts avec cache
  async function fetch(params = {}, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = postsCache.get(params);
      if (cached) {
        feed.value = cached;
        return feed.value;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await postsApi.list(params);
      const posts = data.data || data;
      feed.value = posts;
      postsCache.set(params, posts);
      return posts;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Charger un post spécifique
  async function loadPost(postId) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await postsApi.get(postId);
      currentPost.value = data.data || data;
      return currentPost.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Créer un post
  async function createPost(payload) {
    error.value = null;
    try {
      const { data } = await postsApi.create(payload);
      const post = data.data || data;
      feed.value.unshift(post);
      postsCache.invalidate();
      return post;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création';
      throw err;
    }
  }

  // Modifier un post
  async function updatePost(postId, payload) {
    error.value = null;
    try {
      const { data } = await postsApi.update(postId, payload);
      const updated = data.data || data;
      const index = feed.value.findIndex(p => p.id === postId);
      if (index !== -1) {
        feed.value[index] = updated;
      }
      if (currentPost.value?.id === postId) {
        currentPost.value = updated;
      }
      postsCache.invalidate();
      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la modification';
      throw err;
    }
  }

  // Supprimer un post
  async function removePost(postId) {
    error.value = null;
    try {
      await postsApi.delete(postId);
      feed.value = feed.value.filter(p => p.id !== postId);
      postsCache.invalidate();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression';
      throw err;
    }
  }

  // Charger les commentaires d'un post
  async function loadComments(postId) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await postsApi.getComments(postId);
      const commentsList = data.data || data.comments || data;
      comments.value[postId] = commentsList;
      return commentsList;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des commentaires';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Ajouter un commentaire
  async function comment(postId, payload) {
    error.value = null;
    try {
      const { data } = await postsApi.comment(postId, payload);
      const newComment = data.data || data;

      if (!comments.value[postId]) {
        comments.value[postId] = [];
      }
      comments.value[postId].push(newComment);

      // Incrémenter le compteur
      const post = feed.value.find(p => p.id === postId);
      if (post) {
        post.comments_count = (post.comments_count || 0) + 1;
      }

      return newComment;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
      throw err;
    }
  }

  // Supprimer un commentaire
  async function deleteComment(postId, commentId) {
    error.value = null;
    try {
      await postsApi.deleteComment(postId, commentId);

      if (comments.value[postId]) {
        comments.value[postId] = comments.value[postId].filter(c => c.id !== commentId);
      }

      const post = feed.value.find(p => p.id === postId);
      if (post && post.comments_count > 0) {
        post.comments_count--;
      }

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression';
      throw err;
    }
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    feed.value = [];
    currentPost.value = null;
    comments.value = {};
    loading.value = false;
    error.value = null;
    postsCache.invalidate();
  }

  return {
    feed,
    currentPost,
    comments,
    loading,
    error,
    getPostById,
    getCommentsByPostId,
    fetch,
    loadPost,
    createPost,
    updatePost,
    comment,
    loadComments,
    deleteComment,
    removePost,
    $reset
  };
});
