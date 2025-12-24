<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div v-if="loading && !post" class="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <Icon name="AlertCircle" :size="48" class="text-red-500 mx-auto mb-4" />
      <p class="text-red-600">{{ error }}</p>
      <Button @click="$router.back()" variant="outline" class="mt-4">
        <Icon name="ArrowLeft" :size="16" />
        Retour
      </Button>
    </div>

    <div v-else-if="post">
      <!-- Header avec retour -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="$router.back()" class="p-2 rounded-lg hover:bg-gray-100 transition">
          <Icon name="ArrowLeft" :size="20" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Publication</h1>
      </div>

      <!-- Post complet -->
      <PostCard :post="post" @edit="handleEditPost" @delete="handleDeletePost" @report="handleReportPost"
        @comment-added="handleCommentAdded" @comment-deleted="handleCommentDeleted" />

      <!-- Section commentaires (toujours visible) -->
      <Card class="mt-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="MessageSquare" :size="20" />
          Commentaires ({{ comments.length }})
        </h3>

        <CommentSection :postId="post.id" :comments="comments" @comment-added="handleCommentAdded"
          @comment-deleted="handleCommentDeleted" />
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostsStore } from '@/stores/postsStore';
import { useToast } from '@/composables/useToast';
import { Card, Button, LoadingSpinner, Icon } from '@/components/ui';
import { PostCard, CommentSection } from '@/components/feed';

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();
const toast = useToast();

const post = ref(null);
const comments = ref([]);
const loading = ref(true);
const error = ref(null);

async function loadPost() {
  loading.value = true;
  error.value = null;

  try {
    const postId = parseInt(route.params.id);

    // Charger le post
    post.value = await postsStore.loadPost(postId);

    // Charger les commentaires
    comments.value = await postsStore.loadComments(postId);
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement du post';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

async function handleEditPost(updatedPost) {
  try {
    // Construire le payload pour la mise à jour
    const payload = {
      title: updatedPost.title,
      content: updatedPost.content,
    }

    // Si des nouvelles images sont présentes (fichiers), les ajouter
    if (updatedPost.images && updatedPost.images.length > 0) {
      payload.images = updatedPost.images
    }

    // Ajouter les IDs des images existantes à conserver
    if (updatedPost.existing_images && updatedPost.existing_images.length > 0) {
      payload.existing_images = updatedPost.existing_images
    }

    await postsStore.updatePost(updatedPost.id, payload);
    post.value = { ...post.value, title: updatedPost.title, content: updatedPost.content };
    toast.success('Post modifié avec succès');
  } catch (err) {
    console.error('Error updating post:', err)
    const errorMessage = err.response?.data?.message || 'Erreur lors de la modification';
    toast.error(errorMessage);
  }
}

async function handleDeletePost(postId) {
  if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return;

  try {
    await postsStore.removePost(postId);
    toast.success('Post supprimé');
    router.push('/');
  } catch (err) {
    toast.error('Erreur lors de la suppression');
  }
}

function handleReportPost(postId) {
  toast.info('Signalement envoyé');
}

function handleCommentAdded({ postId, comment }) {
  // Mise à jour locale pour éviter un rechargement complet
  if (post.value && post.value.id === postId) {
    if (!post.value.comments) post.value.comments = []
    post.value.comments.push(comment)
  }
}

function handleCommentDeleted({ postId, commentId }) {
  // Mise à jour locale
  if (post.value && post.value.id === postId && post.value.comments) {
    post.value.comments = post.value.comments.filter((c) => c.id !== commentId)
  }
}

onMounted(loadPost);
</script>
